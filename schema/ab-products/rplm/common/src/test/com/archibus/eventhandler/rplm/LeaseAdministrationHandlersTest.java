package com.archibus.eventhandler.rplm;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

public class LeaseAdministrationHandlersTest extends DataSourceTestBase {
    
    LeaseAdministrationHandlers serviceClass = new LeaseAdministrationHandlers();
    
    public void testCalculateCashFlowProjection() {
        
        String projectionType = "ls";
        Date dateFrom = new Date();
        Date dateTo = new Date();
        String calculationPeriod = "MONTH";
        String calculationType = "EXPENSE";
        boolean isFromActualCosts = false;
        boolean isFromScheduled = true;
        boolean isFromRecurring = false;
        String ctry_id = "NULL";
        String regn_id = "NULL";
        String state_id = "NULL";
        String city_id = "NULL";
        String site_id = "NULL";
        String pr_id = "NULL";
        String bl_id = "NULL";
        String cost_cat_id_ex = "NULL";
        String cost_cat_id_sh = "'RENT - BASE RENT'";
        Map<String, String> config = new HashMap<String, String>();
        config.put("vat", "total");
        config.put("type", "user");
        config.put("code", "GBP");
        config.put("rateType", "Budget");
        
        this.serviceClass.calculateCashFlowProjection(projectionType, dateFrom, dateTo,
            calculationPeriod, calculationType, isFromActualCosts, isFromScheduled,
            isFromRecurring, ctry_id, regn_id, state_id, city_id, site_id, pr_id, bl_id,
            cost_cat_id_ex, cost_cat_id_sh, config);
    }
    
    public void testCalculateCashFlowProjectionXLSReport() {
        
        boolean isMonthFormat = true;
        boolean stripMinus = true;
        String viewName = "ab-rplm-lsadmin-lease-base-rent-costs-by-year-report.axvw";
        String title = "Lease Base Rent Expenses";
        List<Map<String, String>> groupByFields = new ArrayList<Map<String, String>>();
        List<Map<String, Object>> calculatedFields = new ArrayList<Map<String, Object>>();
        String projectionType = "ls";
        Date dateFrom = new Date();
        Date dateTo = new Date();
        String calculationPeriod = "MONTH";
        String calculationType = "EXPENSE";
        boolean isFromActualCosts = false;
        boolean isFromScheduled = true;
        boolean isFromRecurring = false;
        String ctry_id = "";
        String regn_id = "";
        String state_id = "";
        String city_id = "";
        String site_id = "";
        String pr_id = "";
        String bl_id = "";
        String cost_cat_id_ex = "";
        String cost_cat_id_sh = "'RENT - BASE RENT'";
        Map<String, String> config = new HashMap<String, String>();
        config.put("vat", "total");
        config.put("type", "user");
        config.put("code", "GBP");
        config.put("rateType", "Budget");
        
        this.serviceClass.calculateCashFlowProjectionXLSReport(isMonthFormat, stripMinus, viewName,
            title, groupByFields, calculatedFields, projectionType, dateFrom, dateTo,
            calculationPeriod, calculationType, isFromActualCosts, isFromScheduled,
            isFromRecurring, ctry_id, regn_id, state_id, city_id, site_id, pr_id, bl_id,
            cost_cat_id_ex, cost_cat_id_sh, config);
    }
    
    public void testGetCashFlowProjectionXLSReport() {
        boolean isGroupByCostCategory = true;
        boolean isFromCosts = true;
        String viewName = "ab-rplm-lsadmin-lease-base-rent-costs-by-year-report.axvw";
        String title = "Lease Base Rent Expenses";
        List<Map<String, String>> groupByFields = new ArrayList<Map<String, String>>();
        List<Map<String, Object>> calculatedFields = new ArrayList<Map<String, Object>>();
        String projectionType = "ls";
        Date dateFrom = new Date();
        Date dateTo = new Date();
        String period = "MONTH";
        String calculationType = "EXPENSE";
        boolean isFromScheduledCosts = false;
        boolean isFromRecurringCosts = true;
        String recurringCostsRestriction = "";
        String scheduledCostsRestriction = "";
        String actualCostsRestriction = "";
        Map<String, String> config = new HashMap<String, String>();
        config.put("vat", "total");
        config.put("type", "user");
        config.put("code", "GBP");
        config.put("rateType", "Budget");
        
        this.serviceClass.getCashFlowProjectionXLSReport(viewName, title, groupByFields,
            calculatedFields, projectionType, dateFrom, dateTo, period, calculationType,
            isGroupByCostCategory, isFromCosts, isFromScheduledCosts, isFromRecurringCosts,
            recurringCostsRestriction, scheduledCostsRestriction, actualCostsRestriction, config);
        
    }
}
