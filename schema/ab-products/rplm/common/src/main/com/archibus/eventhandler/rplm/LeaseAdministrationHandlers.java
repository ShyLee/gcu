package com.archibus.eventhandler.rplm;

import java.util.*;

import org.mortbay.util.StringUtil;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.cost.*;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * YS: refactor LeaseAdministrationHandlers and add XLS reporting functions
 * 
 */
public class LeaseAdministrationHandlers extends JobBase {
    public DataSet calculateCashFlowProjection(String projectionType, Date dateFrom, Date dateTo,
            String calculationPeriod, String calculationType, boolean isFromActualCosts,
            boolean isFromScheduled, boolean isFromRecurring, String ctry_id, String regn_id,
            String state_id, String city_id, String site_id, String pr_id, String bl_id,
            String cost_cat_id_ex, String cost_cat_id_sh, Map<String, String> currVatConfig) {
        
        DataSet dataSet =
                getCalculateCashFlowProjectionDataSet(projectionType, dateFrom, dateTo,
                    calculationPeriod, calculationType, isFromActualCosts, isFromScheduled,
                    isFromRecurring, ctry_id, regn_id, state_id, city_id, site_id, pr_id, bl_id,
                    cost_cat_id_ex, cost_cat_id_sh, currVatConfig);
        
        this.status.setDataSet(dataSet);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        
        return dataSet;
    }
    
    // XXX: called by WFR - it doesn't touch job status
    private DataSet getCalculateCashFlowProjectionDataSet(String projectionType, Date dateFrom,
            Date dateTo, String calculationPeriod, String calculationType,
            boolean isFromActualCosts, boolean isFromScheduled, boolean isFromRecurring,
            String ctry_id, String regn_id, String state_id, String city_id, String site_id,
            String pr_id, String bl_id, String cost_cat_id_ex, String cost_cat_id_sh,
            Map<String, String> currVatConfig) {
        
        Map<String, String> restrictions =
                buildRestrictions(ctry_id, regn_id, state_id, city_id, site_id, pr_id, bl_id,
                    cost_cat_id_ex, cost_cat_id_sh);
        
        CostService service = (CostService) ContextStore.get().getEventHandler("CostService");
        
        DataSet dataSet =
                service.getCashFlowProjection(projectionType, dateFrom, dateTo, calculationPeriod,
                    calculationType, false, isFromActualCosts, isFromScheduled, isFromRecurring,
                    restrictions.get("cost_tran_recur"), restrictions.get("cost_tran_sched"),
                    restrictions.get("cost_tran"), currVatConfig);
        return dataSet;
    }
    
    // WFR - called to export a XLS report
    public void calculateCashFlowProjectionXLSReport(boolean isMonthFormat, boolean stripMinus,
            String viewName, String title, List<Map<String, String>> groupByFields,
            List<Map<String, Object>> calculatedFields, String projectionType, Date dateFrom,
            Date dateTo, String calculationPeriod, String calculationType,
            boolean isFromActualCosts, boolean isFromScheduled, boolean isFromRecurring,
            String ctry_id, String regn_id, String state_id, String city_id, String site_id,
            String pr_id, String bl_id, String cost_cat_id_ex, String cost_cat_id_sh,
            Map<String, String> currVatConfig) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);
            
            // XXX: get dataSet
            DataSet dataSet =
                    getCalculateCashFlowProjectionDataSet(projectionType, dateFrom, dateTo,
                        calculationPeriod, calculationType, isFromActualCosts, isFromScheduled,
                        isFromRecurring, ctry_id, regn_id, state_id, city_id, site_id, pr_id,
                        bl_id, cost_cat_id_ex, cost_cat_id_sh, currVatConfig);
            
            // XXX: customized XLS builder
            XLSReport builder = new XLSReport();
            
            builder.setMonthFormat(isMonthFormat);
            builder.setStripMinus(stripMinus);
            builder.setFileName(builder.createFileName(viewName));
            
            builder.build(dataSet, title, groupByFields, calculatedFields);
            
            String fileName = builder.getFileName();
            String url = builder.getURL();
            JobResult result = new JobResult(title, fileName, url);
            this.status.setResult(result);
            
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", viewName), e);
        }
    }
    
    // WFR - called to export a cash flow XLS report
    public void getCashFlowProjectionXLSReport(String viewName, String title,
            List<Map<String, String>> groupByFields, List<Map<String, Object>> calculatedFields,
            String projectionType, Date dateFrom, Date dateTo, String period,
            String calculationType, boolean isGroupByCostCategory, boolean isFromCosts,
            boolean isFromScheduledCosts, boolean isFromRecurringCosts,
            String recurringCostsRestriction, String scheduledCostsRestriction,
            String actualCostsRestriction, Map<String, String> currVatConfig) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);
            
            CostService service = (CostService) ContextStore.get().getEventHandler("CostService");
            DataSet dataSet =
                    service.getCashFlowProjection(projectionType, dateFrom, dateTo, period,
                        calculationType, isGroupByCostCategory, isFromCosts, isFromScheduledCosts,
                        isFromRecurringCosts, recurringCostsRestriction, scheduledCostsRestriction,
                        actualCostsRestriction, currVatConfig);
            
            // XXX: customized XLS builder
            XLSReport builder = new XLSReport();
            
            /**
             * Added for KB 3033868-VAT amount balance - incorrect label in XLS file. This needs to
             * be implemented as message parameter from .js client file.
             */
            builder.setVATCashFlowReport(viewName);
            /**
             * KB 3033868
             */
            builder.setProjectionType(projectionType);
            builder.setCalculationType(calculationType);
            builder.setStripMinus("EXPENSE".equals(calculationType));
            if (StringUtil.nonNull(period).equals("MONTH")) {
                builder.setMonthFormat(true);
            } else if (StringUtil.nonNull(period).equals("QUARTER")) {
                builder.setQuarterFormat(true);
                builder.setQuarters(dateFrom, dateTo);
            }
            builder.setFileName(builder.createFileName(viewName));
            
            builder.build(dataSet, title, groupByFields, calculatedFields);
            
            String fileName = builder.getFileName();
            String url = builder.getURL();
            JobResult result = new JobResult(title, fileName, url);
            this.status.setResult(result);
            
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", viewName), e);
        }
    }
    
    /**
     * Get summarized asset costs based on MC and VAT user request parameters.
     * 
     * @param parameters
     * @return records dataset
     */
    public DataSet getAssetCostFields(final Map<String, Object> parameters) {
        final String reportParametersKey = "customReportParameters";
        DataSet records = null;
        // get report parameters
        Map<String, Object> reportParameters = new HashMap<String, Object>();
        if (parameters.containsKey(reportParametersKey)) {
            reportParameters = (Map<String, Object>) parameters.get(reportParametersKey);
        }
        
        Map<String, String> currencyVatParams =
                (Map<String, String>) reportParameters.get("currencyVatParams");
        CurrencyVatRequestParameters currencyVatRequestParameters =
                new CurrencyVatRequestParameters(currencyVatParams);
        String assetType = (String) reportParameters.get("assetType");
        Date dateFrom = java.sql.Date.valueOf((String) reportParameters.get("dateFrom"));
        Date dateTo = java.sql.Date.valueOf((String) reportParameters.get("dateTo"));
        String period = (String) reportParameters.get("period");
        boolean isFromCosts = (Boolean) reportParameters.get("isFromCosts");
        boolean isFromScheduledCosts = (Boolean) reportParameters.get("isFromScheduledCosts");
        boolean isFromRecurringCosts = (Boolean) reportParameters.get("isFromRecurringCosts");
        int isActiveRecurringCosts = (Integer) reportParameters.get("isActiveRecurringCosts");
        SummarizeCosts summarizeCosts = new SummarizeCosts(assetType);
        summarizeCosts.calculate(dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, isActiveRecurringCosts, currencyVatRequestParameters,
            new JobStatus());
        
        return records;
    }
    
    private Map<String, String> buildRestrictions(String ctry_id, String regn_id, String state_id,
            String city_id, String site_id, String pr_id, String bl_id, String cost_cat_id_ex,
            String cost_cat_id_sh) {
        
        cost_cat_id_ex = scrubString(cost_cat_id_ex);
        
        List<String> tables = new ArrayList<String>();
        tables.add("cost_tran_recur");
        tables.add("cost_tran_sched");
        tables.add("cost_tran");
        Map<String, String> restriction = new HashMap<String, String>();
        
        for (String table : tables) {
            String rest = null;
            
            rest =
                    "ls_id IN (SELECT ls.ls_id FROM ls "
                            + " LEFT OUTER JOIN bl ON ls.bl_id = bl.bl_id "
                            + " LEFT OUTER JOIN property ON ls.pr_id = property.pr_id " + " WHERE "
                            + table + ".ls_id = ls.ls_id " + " AND ls.use_as_template = 0 ";
            
            if ((!ctry_id.equals("NULL")) || (!regn_id.equals("NULL"))
                    || (!state_id.equals("NULL")) || (!city_id.equals("NULL"))
                    || (!site_id.equals("NULL"))) {
                if (!ctry_id.equals("NULL")) {
                    rest +=
                            "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.ctry_id ELSE property.ctry_id END) in "
                                    + ctry_id;
                }
                if (!regn_id.equals("NULL")) {
                    rest +=
                            "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.regn_id ELSE property.regn_id END) in "
                                    + regn_id;
                }
                if (!state_id.equals("NULL")) {
                    rest +=
                            "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.state_id ELSE property.state_id END) in "
                                    + state_id;
                }
                if (!city_id.equals("NULL")) {
                    rest +=
                            "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.city_id ELSE property.city_id END) in "
                                    + city_id;
                }
                if (!site_id.equals("NULL")) {
                    rest +=
                            "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.site_id ELSE property.site_id END) in "
                                    + site_id;
                }
            }
            
            if (!pr_id.equals("NULL")) {
                rest += "AND ls.pr_id in " + pr_id;
            }
            if (!bl_id.equals("NULL")) {
                rest += "AND ls.bl_id in " + bl_id;
            }
            
            rest += ") ";
            
            if (!cost_cat_id_ex.equals("NULL")) {
                rest += "AND cost_cat_id NOT IN (" + cost_cat_id_ex + ") ";
            }
            if (!(cost_cat_id_sh.toUpperCase()).equals("NULL") && !(cost_cat_id_sh.equals(""))) {
                rest += "AND cost_cat_id IN (" + cost_cat_id_sh + ") ";
            }
            
            if (table.equals("cost_tran_recur")) {
                rest += "AND cost_tran_recur.status_active = 1 ";
            }
            restriction.put(table, rest);
        }
        
        return restriction;
    }
    
    private String scrubString(String stringVal) {
        if (stringVal.equalsIgnoreCase("NULL")) {
            stringVal = "";
        }
        stringVal =
                EventHandlerBase.formatSqlFieldValue(ContextStore.get().getEventHandlerContext(),
                    stringVal, "java.lang.String", "");
        return stringVal;
    }
    
    /**
     * WFR - called to export XLS report
     * 
     * @param reportViewName
     * @param dataSourceId
     * @param reportTitle
     * @param visibleFieldDefs
     * @param restriction
     * @param parameters
     */
    public void generateGridXLSReport(String reportViewName, String dataSourceId,
            String reportTitle, List<Map<String, Object>> visibleFieldDefs, String restriction,
            Map<String, Object> parameters) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);
            
            DataSource dataSource =
                    DataSourceFactory.loadDataSourceFromFile(reportViewName, dataSourceId);
            if (parameters != null) {
                ReportUtility.handleParameters(dataSource, parameters);
            }
            List<DataRecord> records = dataSource.getRecords(restriction);
            
            this.status.setCurrentNumber(50);
            RepmGridXLSBuilder reportBuilder = new RepmGridXLSBuilder();
            /*
             * IOAN 12/07/2010 set report file name, created from view name
             */
            reportBuilder.setFileName(reportBuilder.createFileName(reportViewName));
            
            reportBuilder.build(records, reportTitle, visibleFieldDefs);
            
            String fileName = reportBuilder.getFileName();
            String url = reportBuilder.getURL();
            JobResult result = new JobResult(reportTitle, fileName, url);
            this.status.setResult(result);
            
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", reportViewName), e);
        }
    }
    
    /**
     * Insert new records for all Cost Categories that don’t exist already for selected country with
     * new VAT percent value.
     * 
     * @param ctryId selected country
     * @param vatPercentValue VAT percent value
     */
    public void copyCostCategories(String ctryId, String vatPercentValue) {
        int vatVal = 0;
        double vatValD = 0.0;
        try {
            vatVal = Integer.parseInt(vatPercentValue);
        } catch (NumberFormatException nfe) {
            try {
                vatValD = Double.parseDouble(vatPercentValue);
                
            } catch (NumberFormatException e) {
                throw new ExceptionBase(e.getLocalizedMessage());
            }
        }
        
        String[] costFields = { "cost_cat_id" };
        DataSource dsCost = DataSourceFactory.createDataSourceForFields("cost_cat", costFields);
        String[] vatFields = { "ctry_id", "cost_cat_id", "vat_percent_value" };
        
        List<DataRecord> costCategories = dsCost.getRecords();
        Iterator<DataRecord> itCost = costCategories.iterator();
        
        while (itCost.hasNext()) {
            String costId = itCost.next().getString("cost_cat.cost_cat_id");
            DataSource dsVat =
                    DataSourceFactory.createDataSourceForFields("vat_percent", vatFields);
            dsVat.addRestriction(Restrictions.eq("vat_percent", "ctry_id", ctryId));
            dsVat.addRestriction(Restrictions.eq("vat_percent", "cost_cat_id", costId));
            if (dsVat.getRecords().isEmpty()) {
                // insert new record
                DataRecord record = dsVat.createRecord();
                record.setNew(true);
                record.setValue("vat_percent.ctry_id", ctryId);
                record.setValue("vat_percent.cost_cat_id", costId);
                record.setValue("vat_percent.vat_percent_value", (vatVal == 0) ? vatValD : vatVal);
                dsVat.saveRecord(record);
            }
        }
    }
    
    /**
     * Update VAT percent values for selected country and selected cost categories with the new VAT
     * percent value.
     * 
     * @param ctryId selected country
     * @param vatPercentValue VAT percent value
     * @param costCategories selected cost categories
     */
    public void assignVatPercent(String ctryId, String vatPercentValue, List<String> costCategories) {
        int vatVal = 0;
        double vatValD = 0.0;
        try {
            vatVal = Integer.parseInt(vatPercentValue);
        } catch (NumberFormatException nfe) {
            try {
                vatValD = Double.parseDouble(vatPercentValue);
                
            } catch (NumberFormatException e) {
                throw new ExceptionBase(e.getLocalizedMessage());
            }
        }
        
        String[] vatFields = { "ctry_id", "cost_cat_id", "vat_percent_value" };
        
        Iterator<String> itCost = costCategories.iterator();
        
        while (itCost.hasNext()) {
            String costId = itCost.next();
            DataSource dsVat =
                    DataSourceFactory.createDataSourceForFields("vat_percent", vatFields);
            dsVat.addRestriction(Restrictions.eq("vat_percent", "ctry_id", ctryId));
            dsVat.addRestriction(Restrictions.eq("vat_percent", "cost_cat_id", costId));
            if (!dsVat.getRecords().isEmpty()) {
                // update record
                DataRecord record = dsVat.getRecord();
                record.setNew(false);
                record.setValue("vat_percent.ctry_id", ctryId);
                record.setValue("vat_percent.cost_cat_id", costId);
                record.setValue("vat_percent.vat_percent_value", (vatVal == 0) ? vatValD : vatVal);
                dsVat.saveRecord(record);
            }
        }
    }
}
