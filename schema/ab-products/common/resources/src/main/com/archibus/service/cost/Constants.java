package com.archibus.service.cost;

/**
 * Public constants for Finance Domain implementations.
 * <p>
 * Constants here are shared between several Domain implementation classes.
 * 
 * @author Ioan Draghici
 * 
 */
final class Constants {
    /**
     * Actual cost table name.
     */
    static final String ACTUAL_COST_TABLE = "cost_tran";
    
    /**
     * Recurring cost table name.
     */
    static final String RECUR_COST_TABLE = "cost_tran_recur";
    
    /**
     * Scheduled cost table name.
     */
    static final String SCHED_COST_TABLE = "cost_tran_sched";
    
    /**
     * Constant: cost type base.
     */
    static final String COST_TYPE_BASE = "base";
    
    /**
     * Constant: cost type total.
     */
    static final String COST_TYPE_TOTAL = "total";
    
    /**
     * Constant: cost type vat.
     */
    // two constants with same value, but different usage - possible to change the value in feature
    // CHECKSTYLE:OFF
    static final String COST_TYPE_VAT = "vat";
    
    // CHECKSTYLE:ON
    
    /**
     * Constant: organization currency type.
     */
    static final String CURRENCY_TYPE_BUDGET = "budget";
    
    /**
     * Constant: custom currency type.
     */
    static final String CURRENCY_TYPE_CUSTOM = "custom";
    
    /**
     * Constant: user currency type.
     */
    static final String CURRENCY_TYPE_USER = "user";
    
    /**
     * Constant: field name: "date_due".
     */
    static final String DATE_DUE = "date_due";
    
    /**
     * Constant: currency code key.
     */
    static final String INPUT_PARAMETER_CURRENCY_CODE = "code";
    
    /**
     * Constant: currency type key.
     */
    static final String INPUT_PARAMETER_CURRENCY_TYPE = "type";
    
    /**
     * Constant: exchange rate key.
     */
    static final String INPUT_PARAMETER_RATE_TYPE = "rateType";
    
    /**
     * Constant: exchange rate key.
     */
    static final String INPUT_PARAMETER_EXCHANGE_RATE_TYPE = "exchangeRateType";
    
    /**
     * Constant: vat key.
     */
    static final String INPUT_PARAMETER_VAT = "vat";
    
    /**
     * Constant: vat key.
     */
    static final String PARAM_MULTIPLE_VALUE_SEPARATOR = "multipleValueSeparator";
    
    /**
     * Constant: field name: "max".
     */
    static final String MAX = "max";
    
    /**
     * Constant: number of month in year - to avoid magic number warnings.
     */
    static final int MONTH_NO = 12;
    
    /**
     * Constant: 100 - to avoid magic number warnings.
     */
    static final int ONE_HUNDRED = 100;
    
    /**
     * Constant: value Yes.
     */
    static final String OPT_YES = "Yes";
    
    /**
     * Constant: table name.
     */
    static final String LS_TABLE = "ls";
    
    /**
     * Constant: field name.
     */
    static final String LS_ID = "ls_id";
    
    /**
     * Constant: field name.
     */
    static final String LANDLORD_TENANT = "landlord_tenant";
    
    /**
     * Constant: field name.
     */
    static final String LS_LANDLORD_TENANT = "ls.landlord_tenant";
    
    /**
     * Constant: LANDLORD.
     */
    static final String LANDLORD = "LANDLORD";
    
    /**
     * Constant: TENANT.
     */
    static final String TENANT = "TENANT";
    
    /**
     * Constant: field name.
     */
    static final String COST_INDEX = "cost_index";
    
    /**
     * Constant: field name.
     */
    static final String LS_COST_INDEX = "ls.cost_index";
    
    /**
     * Constant: table name.
     */
    static final String COST_INDEX_VALUES = "cost_index_values";
    
    /**
     * Constant: field name.
     */
    static final String COST_INDEX_ID = "cost_index_id";
    
    /**
     * Constant: field name.
     */
    static final String DATE_INDEX_VALUE = "date_index_value";
    
    /**
     * Constant: table name.
     */
    static final String COST_TRAN_RECUR_ID = "cost_tran_recur_id";
    
    /**
     * Constant: field name.
     */
    static final String COST_CAT_ID = "cost_cat_id";
    
    /**
     * Constant: field name.
     */
    static final String VAT_EXCLUDE = "vat_exclude";
    
    /**
     * Constant: field name.
     */
    static final String LS_VAT_EXCLUDE = "ls.vat_exclude";
    
    /**
     * Constant: cost category.
     */
    static final String BASE_RENT_COST_CATEG = "RENT - BASE RENT";
    
    /**
     * Constant: cost category.
     */
    static final String CAM_ESTIMATE_COST_CATEG = "RENT - CAM ESTIMATE";
    
    /**
     * Constant: cost category.
     */
    static final String CAM_RECONCILIATION_COST_CATEG = "RENT - CAM RECONCILIATION";
    
    /**
     * Activity id.
     */
    static final String REPM_COST_ACTIVITY_ID = "AbRPLMCosts";
    
    /**
     * Activity parameter name.
     */
    static final String BASE_RENT_ACTIVITY_PARAM = "Base_Rent_Category";
    
    /**
     * Activity parameter name.
     */
    static final String CAM_ESTIMATE_ACTIVITY_PARAM = "CAM_Estimate";
    
    /**
     * Activity parameter name.
     */
    static final String CAM_RECONCILIATION_ACTIVITY_PARAM = "CAM_Reconciliation";
    
    /**
     * Constant: cost category.
     */
    static final String LEASEHOLD_IMPROVMENT_COST_CATEG = "LEASEHOLD IMPROVEMENT";
    
    /**
     * Constant: field name.
     */
    static final String DATE_END = "date_end";
    
    /**
     * Constant: field name.
     */
    static final String DATE_START = "date_start";
    
    /**
     * Constant: field name.
     */
    static final String LS_DATE_END = "ls.date_end";
    
    /**
     * Constant: field name.
     */
    static final String CTRY_ID = "ctry_id";
    
    /**
     * Constant: field name.
     */
    static final String REGN_ID = "regn_id";
    
    /**
     * Constant: field name.
     */
    static final String STATE_ID = "state_id";
    
    /**
     * Constant: field name.
     */
    static final String CITY_ID = "city_id";
    
    /**
     * Constant: field name.
     */
    static final String SITE_ID = "site_id";
    
    /**
     * Constant: field name.
     */
    static final String PR_ID = "pr_id";
    
    /**
     * Constant: field name.
     */
    static final String BL_ID = "bl_id";
    
    /**
     * Constant: field name.
     */
    static final String PROPERTY = "property";
    
    /**
     * Constant: field name.
     */
    static final String BASE_RENT = "a_base_rent";
    
    /**
     * Constant: field name.
     */
    static final String LI_CREDIT = "b_li_credit";
    
    /**
     * Constant: field name.
     */
    static final String ACTUAL_RENT = "c_actual_rent";
    
    /**
     * Constant: field name.
     */
    static final String STRAIGHT_LINE_RENT = "d_sl_rent";
    
    /**
     * Constant: field name.
     */
    static final String DIFFERENTIAL_RENT = "e_differential_rent";
    
    /**
     * Constant: field name.
     */
    static final String DIFFERENTIAL_RENT_CUMUL = "f_differential_rent_cumul";
    
    /**
     * Report type CAM Reconciliation - used in ccost_sum buffer table.
     */
    static final String REPORT_TYPE_CAM_RECONCILIATION = "cam_reconciliation";
    
    /**
     * Constant DOT.
     */
    static final String DOT = ".";
    
    /**
     * Constant comma.
     */
    static final String COMMA = ",";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
