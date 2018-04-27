package com.archibus.app.projectmgmt;

import java.util.List;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Provides methods for generating cumulative Costs from the Project, Action and Invoice tables to
 * display in Capital Budget vs Spend S-Curve and bar charts.
 * 
 * Suppress PMD warning "AvoidUsingSql".
 * <p>
 * Justification: Exception #1: Join with a subquery.
 * 
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class ProjectCostsService extends JobBase {
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * 
     * Generates cumulative and incremental data for Capital Projects Budget vs Spend charts.
     * 
     * @param context Context.
     */
    public void getChartData(final EventHandlerContext context) {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final String consoleRestriction = context.getString(Constants.CONSOLE_RESTRICTION);
                final java.sql.Date fromDate =
                        java.sql.Date.valueOf(context.getString(Constants.FROM_DATE));
                final java.sql.Date toDate =
                        java.sql.Date.valueOf(context.getString(Constants.TO_DATE));
                final java.sql.Date minDate = java.sql.Date.valueOf(context.getString("minDate"));
                final String groupingType = context.getString(Constants.GROUP_BY);
                final String budgetFrom = context.getString("budgetFrom");
                
                final JSONArray jsonRecords =
                        getCumulativeChartData(consoleRestriction, fromDate, toDate, minDate,
                            groupingType, budgetFrom);
                context.addResponseParameter(Constants.JSON_EXPRESSION, jsonRecords.toString());
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Constants.MESSAGE_FAILED_RETRIEVE_RECORDS, e);
        }
    }
    
    /**
     * Returns a JSONArray used to display data in a chart. Budgeted and Actual values are
     * calculated separately and copied to a JSONArray. Cumulative results for Budgeted and Actual
     * values are summed from the earliest date in the Project/Invoice tables for the specified
     * restriction. Budget is derived from either Project Cost - Budget or Action Baseline Costs for
     * all Project Actions, not including Change Orders.
     * 
     * @param consoleRestriction String Project table restriction.
     * @param fromDate java.sql.Date From Date provided by user console input.
     * @param toDate java.sql.Date To Date provided by user console input.
     * @param minDate java.sql.Date Earliest Date in Project/Invoice tables for restriction.
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * @param budgetFrom String budget source -- projects, actions.
     * 
     * @return JSONArray.
     */
    private JSONArray getCumulativeChartData(final String consoleRestriction,
            final java.sql.Date fromDate, final java.sql.Date toDate, final java.sql.Date minDate,
            final String groupingType, final String budgetFrom) {
        
        final java.util.Date today = new java.util.Date();
        final String currentDateGroup =
                CostsCommon.getDateGroup(new java.sql.Date(today.getTime()), groupingType);
        final String fromDateGroup = CostsCommon.getDateGroup(fromDate, groupingType);
        
        List<DataRecord> baselineRecords = null;
        if (budgetFrom.equals(Constants.PROJECTS)) {
            baselineRecords = getProjectTotals(consoleRestriction, minDate, toDate, groupingType);
        } else {
            baselineRecords =
                    getActionBaseTotals(consoleRestriction, minDate, toDate, groupingType);
        }
        this.status.setCurrentNumber(Constants.PROGRESS_50);
        final List<DataRecord> actualRecords =
                getInvoiceTotals(consoleRestriction, minDate, toDate, groupingType);
        this.status.setCurrentNumber(Constants.PROGRESS_75);
        
        final JSONArray jsonRecords = new JSONArray();
        double cumcostsBase = 0;
        double cumcostsAct = 0;
        
        for (int i = 0; i < baselineRecords.size(); i++) {
            final DataRecord baselineRecord = baselineRecords.get(i);
            final DataRecord actualRecord = actualRecords.get(i);
            
            cumcostsBase += baselineRecord.getDouble(Constants.COSTS_FIELD);
            cumcostsAct += actualRecord.getDouble(Constants.COSTS_FIELD);
            
            final String dateField = baselineRecord.getString(Constants.FULL_DATE_FIELD);
            if (dateField.compareTo(fromDateGroup) < 0) {
                continue;
            }
            
            final JSONObject data = new JSONObject();
            data.put(Constants.FULL_DATE_FIELD, dateField);
            data.put(Constants.COSTS_FIELD + Constants.SUFFIX_BASE,
                baselineRecord.getDouble(Constants.COSTS_FIELD));
            data.put(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_BASE, cumcostsBase);
            
            if (dateField.compareTo(currentDateGroup) <= 0) {
                data.put(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_ACT, cumcostsAct);
                data.put(Constants.COSTS_FIELD + Constants.SUFFIX_ACT,
                    actualRecord.getDouble(Constants.COSTS_FIELD));
            }
            jsonRecords.put(data);
        }
        
        return jsonRecords;
    }
    
    /**
     * Returns Project Budgeted Costs grouped by time period. Costs are spread out evenly over
     * duration of Project.
     * 
     * @param restriction Project table restriction.
     * @param minDate Earliest project or invoice start date.
     * @param toDate To Date provided by user console input.
     * @param groupingType "date", "week", "month", "quarter", "year"
     * 
     * @return List<DataRecord>.
     */
    
    private List<DataRecord> getProjectTotals(final String restriction,
            final java.sql.Date minDate, final java.sql.Date toDate, final String groupingType) {
        
        final String dateSql = CostsCommon.getDateSql(groupingType);
        final String nvl = CostsCommon.getNvl();
        final String top = CostsCommon.getTop();
        
        final String sql =
                "SELECT  "
                        + top
                        + dateSql
                        + " ${sql.as}  date_field,  "
                        + nvl
                        + "(SUM(CASE WHEN ${sql.daysBetween('project.date_start', 'project.date_end')} = 0 THEN (project.cost_budget"
                        + ") ELSE (project.cost_budget"
                        + ") / (1+1.000*"
                        + "(${sql.daysBetween('project.date_start', 'project.date_end')})"
                        + ")  END), 0)  ${sql.as}  costs "
                        + "FROM  afm_cal_dates "
                        + "LEFT  OUTER JOIN "
                        + "(SELECT project.project_id, project.date_start, project.date_end, project.cost_budget,"
                        + "project.days_per_week " + "FROM project  "
                        + Constants.LEFT_OUTER_JOIN_PROGRAM + Constants.LEFT_OUTER_JOIN_BL
                        + Constants.LEFT_OUTER_JOIN_SITE + Constants.LEFT_OUTER_JOIN_CTRY
                        + "   WHERE " + restriction + "    ) ${sql.as} project "
                        + "ON (afm_cal_dates.cal_date >= project.date_start "
                        + "AND afm_cal_dates.cal_date <= project.date_end) "
                        + "WHERE ( ${sql.yearMonthDayOf('afm_cal_dates.cal_date')} >= '" + minDate
                        + "') AND ( ${sql.yearMonthDayOf('afm_cal_dates.cal_date')} <= '" + toDate
                        + "')  " + " GROUP BY " + dateSql + "  ORDER BY date_field";
        
        final DataSource dsTotals = CostsCommon.getDatesDs();
        dsTotals.addQuery(sql);
        
        return dsTotals.getAllRecords();
    }
    
    /**
     * Returns Baseline Action Costs grouped by time period. Cost is applied to each Action's
     * Planned End Date.
     * 
     * @param restriction Project table restriction.
     * @param minDate Earliest project/invoice start date.
     * @param toDate To Date provided by user console input.
     * @param groupingType "date", "week", "month", "quarter", "year"
     * 
     * @return List<DataRecord>.
     */
    
    private List<DataRecord> getActionBaseTotals(final String restriction,
            final java.sql.Date minDate, final java.sql.Date toDate, final String groupingType) {
        
        final String dateSql = CostsCommon.getDateSql(groupingType);
        final String top = CostsCommon.getTop();
        
        final String sql =
                "   SELECT   "
                        + top
                        + dateSql
                        + "   ${sql.as}   date_field,  "
                        + "SUM(cost_estimated + cost_est_cap) ${sql.as} costs "
                        + " FROM afm_cal_dates "
                        + " LEFT OUTER JOIN "
                        + "(SELECT date_planned_end, cost_estimated, cost_est_cap FROM activity_log "
                        + " LEFT OUTER JOIN project ON activity_log.project_id = project.project_id "
                        + Constants.LEFT_OUTER_JOIN_PROGRAM + Constants.LEFT_OUTER_JOIN_BL
                        + Constants.LEFT_OUTER_JOIN_SITE + Constants.LEFT_OUTER_JOIN_CTRY
                        + "WHERE activity_log.activity_type NOT IN ('PROJECT - CHANGE ORDER') AND "
                        + restriction + " ) ${sql.as} activity_log "
                        + "ON activity_log.date_planned_end = afm_cal_dates.cal_date "
                        + "WHERE (  ${sql.yearMonthDayOf('afm_cal_dates.cal_date')} >= '" + minDate
                        + "') AND (  ${sql.yearMonthDayOf('afm_cal_dates.cal_date')} <= '" + toDate
                        + "')   " + "  GROUP BY " + dateSql + "   ORDER BY date_field";
        
        final DataSource dsTotals = CostsCommon.getDatesDs();
        dsTotals.addQuery(sql);
        
        return dsTotals.getAllRecords();
    }
    
    /**
     * Returns Invoice Actual Costs grouped by time period. Cost is applied to Invoice's Bill Date
     * (invoice.date_sent).
     * 
     * @param restriction Project table restriction.
     * @param minDate Earliest project/invoice start date.
     * @param toDate To Date provided by user console input.
     * @param groupingType "date", "week", "month", "quarter", "year"
     * 
     * @return List<DataRecord>.
     */
    private List<DataRecord> getInvoiceTotals(final String restriction,
            final java.sql.Date minDate, final java.sql.Date toDate, final String groupingType) {
        
        final String top = CostsCommon.getTop();
        final String dateSql = CostsCommon.getDateSql(groupingType);
        
        final String sql =
                "      SELECT   " + top + dateSql + "   ${sql.as}  date_field,  "
                        + "  SUM(amount_closed) ${sql.as} costs " + "  FROM afm_cal_dates "
                        + "  LEFT OUTER JOIN (SELECT date_sent, amount_closed FROM invoice "
                        + "  LEFT OUTER JOIN project ON invoice.project_id = project.project_id "
                        + Constants.LEFT_OUTER_JOIN_PROGRAM + Constants.LEFT_OUTER_JOIN_BL
                        + Constants.LEFT_OUTER_JOIN_SITE + Constants.LEFT_OUTER_JOIN_CTRY
                        + "  WHERE invoice.status IN ('ISSUED','CLOSED') AND " + restriction
                        + ") ${sql.as} invoice "
                        + "                ON invoice.date_sent = afm_cal_dates.cal_date "
                        + "WHERE (${sql.yearMonthDayOf('afm_cal_dates.cal_date')} >= '" + minDate
                        + "') AND (${sql.yearMonthDayOf('afm_cal_dates.cal_date')} <= '" + toDate
                        + "') " + "GROUP BY " + dateSql + " ORDER BY date_field";
        
        final DataSource dsTotals = CostsCommon.getDatesDs();
        dsTotals.addQuery(sql);
        
        return dsTotals.getAllRecords();
    }
}
