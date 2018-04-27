package com.archibus.eventhandler.rplm;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.cost.CostService;
import com.archibus.utility.DateTime;

public class GroupSpaceAllocationHandlers extends EventHandlerBase {
    
    public void getGroupSpaceAllocationData() {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // get data records using the default event handler
        ViewHandlers defaultHandler = new ViewHandlers();
        defaultHandler.getDataRecords(context);
        
        JSONArray dataArray = context.getJSONArray("jsonExpression");
        
        //
        // add more records for the available area information
        //
        String viewName = "";
        if (context.parameterExists("viewName")) {
            viewName = context.getString("viewName");
        }
        
        // get restriction
        String restriction = "";
        if (context.parameterExists("restriction")) {
            restriction = context.getString("restriction");
        }
        
        JSONArray groupingAxisJson = context.getJSONArray("groupingAxis");
        JSONArray secondaryGroupingAxisJson = context.getJSONArray("secondaryGroupingAxis");
        JSONArray dataAxisJson = context.getJSONArray("dataAxis");
        
        if (groupingAxisJson != null && groupingAxisJson.length() > 0) {
            
            // get all records for the primary grouping axis
            JSONObject groupingAxis = (JSONObject) groupingAxisJson.get(0);
            String groupingAxisDataSourceId = groupingAxis.get("dataSourceId").toString();
            String groupingAxisFieldName = groupingAxis.get("id").toString();
            DataSource groupingAxisDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
                groupingAxisDataSourceId);
            List<DataRecord> groupingAxisRecords = groupingAxisDataSource.getRecords(restriction);
            
            // get the secondaryGroupAxis field name
            String secondaryGroupingAxisFieldName = ((JSONObject) secondaryGroupingAxisJson.get(0))
                .get("id").toString();
            
            // get the dataAxis field name
            String dataAxisFieldName = ((JSONObject) dataAxisJson.get(0)).get("id").toString();
            
            new JSONArray();
            String availableAreaDataSourceId = "ds_availableArea";
            DataSource availableAreaDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
                availableAreaDataSourceId);
            List<DataRecord> availableAreaRecords = availableAreaDataSource.getRecords();
            
            JSONArray availableRecords = new JSONArray();
            
            // for each groupingAxisRecord
            // {"gp.area": 2101.97, "gp.bl_fl": "HQ-17"}
            for (int i = 0; i < groupingAxisRecords.size(); i++) {
                DataRecord groupingAxisRecord = groupingAxisRecords.get(i);
                Object groupingAxisValue = groupingAxisRecord.getValue(groupingAxisFieldName);
                
                for (int j = 0; j < availableAreaRecords.size(); j++) {
                    DataRecord availableAreaRecord = availableAreaRecords.get(j);
                    
                    Object tmpGroupAxisValue = availableAreaRecord.getValue(groupingAxisFieldName);
                    
                    if (groupingAxisValue.toString().compareTo(tmpGroupAxisValue.toString()) == 0) {
                        Double availableValue = (Double) availableAreaRecord
                            .getValue(dataAxisFieldName);
                        
                        JSONObject availableRecord = new JSONObject();
                        if (availableValue.doubleValue() < 0) {
                            availableRecord.put(dataAxisFieldName, 0);
                        } else {
                            availableRecord.put(dataAxisFieldName, availableValue);
                        }
                        availableRecord.put(groupingAxisFieldName, groupingAxisValue);
                        
                        availableRecords.put(availableRecord);
                        break;
                    }
                }// end for(int j = 0; j < availableAreaRecords.size(); j++)
            }// end for (int i = 0; i < groupingAxisRecords.size(); i++)
            
            JSONObject finalAvailableData = new JSONObject();
            finalAvailableData.put("data", availableRecords);
            finalAvailableData.put(secondaryGroupingAxisFieldName, "AVAILABLE");
            
            dataArray.put(finalAvailableData);
            
            // put the updated JSON data back into the response
            context.addResponseParameter("jsonExpression", dataArray.toString());
            
        }
    }
    
    /**
     * Copies group records from inventory to the Baseline scenario - Updated by C. Kriezis on
     * 4/12/10 to copy data to any scenario and renamed the rule to reflect this change.
     */
    public void copyGroupInventoryToScenario(String date_start, String date_end,
            String to_portfolio_scenario_id) {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String bl_id = "";
        String fl_id = "";
        String sql = "";
        
        String[] fieldNames = { "bl_id", "fl_id" };
        DataSource ds = DataSourceFactory.createDataSourceForFields("fl", fieldNames);
        
        String restriction = "rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) in (select rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) from gp where portfolio_scenario_id IS NULL)";
        ds.addRestriction(Restrictions.sql(restriction));
        
        List<DataRecord> records = ds.getRecords();
        
        // for each record
        for (DataRecord record : records) {
            
            bl_id = (String) record.getValue("fl.bl_id");
            fl_id = (String) record.getValue("fl.fl_id");
            
            sql = "DELETE FROM gp where bl_id='" + bl_id + "' AND fl_id='" + fl_id
                    + "' AND portfolio_scenario_id = '" + to_portfolio_scenario_id + "'";
            
            SqlUtils.executeUpdate("gp", sql);
            
            sql = "INSERT INTO gp (portfolio_scenario_id,date_start,date_end,gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor)"
                    + " SELECT '"
                    + to_portfolio_scenario_id
                    + "',"
                    + formatSqlIsoToNativeDate(context, date_start)
                    + ","
                    + formatSqlIsoToNativeDate(context, date_end)
                    + ",gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor"
                    + " FROM gp where dp_id IS NOT NULL and portfolio_scenario_id IS NULL AND bl_id='"
                    + bl_id + "' AND fl_id='" + fl_id + "'";
            
            SqlUtils.executeUpdate("gp", sql);
        }
    }
    
    /**
     * Copies group records from one scenario to another
     */
    public void copyScenario(String from_portfolio_scenario_id, String to_portfolio_scenario_id,
            String scenario_exists) {
        
        String sql = "";
        
        if (scenario_exists.equals("N")) {
            sql = "INSERT INTO portfolio_scenario (portfolio_scenario_id) VALUES ('"
                    + to_portfolio_scenario_id + "')";
            
            SqlUtils.executeUpdate("gp", sql);
        } else {
            sql = "DELETE FROM gp where portfolio_scenario_id = '" + to_portfolio_scenario_id + "'";
            
            SqlUtils.executeUpdate("gp", sql);
        }
        
        sql = "INSERT INTO gp (portfolio_scenario_id,gp_num,name,head,description,gp_function,cost,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor,date_start,date_end)"
                + " SELECT '"
                + to_portfolio_scenario_id
                + "',gp_num,name,head,description,gp_function,cost,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor,date_start,date_end"
                + " FROM gp where portfolio_scenario_id='" + from_portfolio_scenario_id + "'";
        
        SqlUtils.executeUpdate("gp", sql);
    }
    
    /**
     * Deletes a scenario's group records and te scenario as well.
     */
    public void deleteScenario(String portfolio_scenario_id) {
        
        String sql = "DELETE FROM gp where portfolio_scenario_id = '" + portfolio_scenario_id + "'";
        
        SqlUtils.executeUpdate("gp", sql);
        
        sql = "DELETE FROM portfolio_scenario where portfolio_scenario_id = '"
                + portfolio_scenario_id + "'";
        
        SqlUtils.executeUpdate("gp", sql);
    }
    
    /**
     * Allocates costs to groups for a single building and a specific date
     */
    public void updateGroupAllocationCosts(String bl_id, String date_report,
            String portfolio_scenario_id, String bl_annual_cost) {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String sql = "UPDATE gp SET gp.cost = " + bl_annual_cost + "*"
                + " ( (CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) / "
                + " (SELECT SUM(CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) "
                + " FROM gp WHERE bl_id = '" + bl_id + "' AND portfolio_scenario_id = '"
                + portfolio_scenario_id + "'" + " AND "
                + formatSqlIsoToNativeDate(context, date_report)
                + " between date_start and date_end)) " + " WHERE bl_id = '" + bl_id
                + "' AND portfolio_scenario_id = '" + portfolio_scenario_id + "' AND "
                + formatSqlIsoToNativeDate(context, date_report)
                + " between date_start and date_end";
        
        SqlUtils.executeUpdate("gp", sql);
        
    }
    
    /**
     * Allocates costs to groups for all buildings and a specific date
     * 
     */
    public void updateGroupAllocationCostsAll(String date_report, String portfolio_scenario_id,
            String site_id) {
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String siteRestriction = "";
        if (site_id.equals("")) {
            siteRestriction = "";
        } else {
            siteRestriction = "site_id = '" + site_id + "' AND ";
        }
        
        String[] dateList = date_report.split("-");
        String sql = "";
        String bl_id = "";
        
        int year = Integer.parseInt(dateList[0]);
        Date dateFrom = DateTime.getFirstDayOfYear(year);
        Date dateTo = DateTime.getLastDayOfYear(year);
        
        String[] fieldNames = { "bl_id" };
        DataSource ds = DataSourceFactory.createDataSourceForFields("bl", fieldNames);
        
        String restriction = siteRestriction
                + "bl_id IN (SELECT DISTINCT bl_id FROM gp WHERE portfolio_scenario_id = '"
                + portfolio_scenario_id + "' AND " + formatSqlIsoToNativeDate(context, date_report)
                + " BETWEEN date_start AND date_end)";
        ds.addRestriction(Restrictions.sql(restriction));
        
        List<DataRecord> records = ds.getRecords();
        
        CostService service = (CostService) ContextStore.get().getEventHandler("CostService");
        
        String projectionType = "bl";
        String calculationPeriod = "YEAR";
        String calculationType = "EXPENSE";
        
        // for each record
        for (DataRecord record : records) {
            bl_id = (String) record.getValue("bl.bl_id");
            
            DataSet2D dataSet = (DataSet2D) service.getCashFlowProjection(projectionType, dateFrom,
                dateTo, calculationPeriod, calculationType, false, false, false, true, "bl_id = '"
                        + bl_id + "'", "", "", null);
            
            List<DataRecord> cashFlowRecords = dataSet.getRecords();
            
            if (cashFlowRecords.size() > 0) {
                
                BigDecimal buildingCostExpense = (BigDecimal) (cashFlowRecords.get(0)
                    .getValue("cost_tran_recur.amount_income"));
                /*
                 * 06/08/2010 IOAN kb 3027914 Format number
                 */
                BigDecimal buildingCost = buildingCostExpense.abs();
                DecimalFormat noFormatter = new DecimalFormat("#.##");
                String strBuildingCost = noFormatter.format(buildingCost.doubleValue());
                
                sql = "UPDATE gp SET gp.cost = "
                        + strBuildingCost
                        + "*"
                        + " ( (CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) / "
                        + " (SELECT SUM(CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) "
                        + " FROM gp WHERE bl_id = '" + bl_id + "' AND portfolio_scenario_id = '"
                        + portfolio_scenario_id + "'" + " AND "
                        + formatSqlIsoToNativeDate(context, date_report)
                        + " between date_start and date_end)) " + " WHERE bl_id = '" + bl_id
                        + "' AND portfolio_scenario_id = '" + portfolio_scenario_id + "' AND "
                        + formatSqlIsoToNativeDate(context, date_report)
                        + " between date_start and date_end";
                
                SqlUtils.executeUpdate("gp", sql);
            }
        }
    }
    
    /*
     * //can do the dame job in java script code, so comment out this WFR public void
     * updateGroupSpaceAllocationData(EventHandlerContext context) {
     * 
     * String viewName = "";
     * 
     * if (context.parameterExists("viewName")) { viewName = context.getString("viewName"); }
     * 
     * String dataSourceName = ""; if (context.parameterExists("dataSourceName")) { dataSourceName =
     * context.getString("dataSourceName"); }
     * 
     * String old_bl_fl_value = context.getString("old_bl_fl_value"); String new_bl_fl_value =
     * context.getString("new_bl_fl_value"); String dv_dp_value = context.getString("dv_dp_value");
     * 
     * // get records from datasource
     * 
     * DataSource groupDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
     * dataSourceName);
     * 
     * List records = groupDataSource.getRecords(); boolean findRightGroup = false; boolean
     * findRightFloor = false; DataRecord currentRecord = null; DataRecord rightGroupRecord = null;
     * 
     * String new_fl = ""; String new_bl = ""; String bl = ""; String fl = ""; String dv = "";
     * String dp = ""; Integer record_gp = new Integer(-1); Integer gp = null;
     * 
     * // for each record for (int i = 0; i < records.size(); i++) { currentRecord = (DataRecord)
     * records.get(i);
     * 
     * if (!findRightGroup || !findRightFloor) {
     * 
     * bl = currentRecord.getValue("gp.bl_id").toString(); fl =
     * currentRecord.getValue("gp.fl_id").toString(); dv =
     * currentRecord.getValue("gp.dv_id").toString(); dp =
     * currentRecord.getValue("gp.dp_id").toString(); gp =
     * Integer.valueOf(currentRecord.getValue("gp.gp_id").toString());
     * 
     * // for source group if (!findRightGroup && (bl + "-" + fl).equals(old_bl_fl_value) && (dv +
     * "-" + dp).equals(dv_dp_value)) { rightGroupRecord = currentRecord; findRightGroup = true;
     * record_gp = gp; }
     * 
     * // for destination floor if (!findRightFloor && (bl + "-" + fl).equals(new_bl_fl_value)) {
     * new_fl = fl; new_bl = bl; findRightFloor = true; } }// end if (!findRightGroup ||
     * !findRightFloor) else { break; } }// end for (int i = 0; i < records.size(); i++)
     * 
     * if (findRightGroup && findRightFloor) {
     * 
     * // set the new bl_fl value for the group rightGroupRecord.setValue("gp.fl_id", new_fl);
     * rightGroupRecord.setValue("gp.bl_id", new_bl);
     * 
     * // have to set the old value which is the same as the new value to gp_id // because(1) it it
     * primary key, so this field will be included in the record // (2) it is integer, if do not
     * set, our code will set the old value as "" which is a // string, // and will cause type
     * mismatch error rightGroupRecord.setOldValue("gp.gp_id", record_gp);
     * 
     * groupDataSource.saveRecord(rightGroupRecord); } }
     */
}