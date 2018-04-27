package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.space.*;
import com.archibus.utility.StringUtil;

/**
 * Summarize Lease, Property or Building Costs for a specific period. Calculate asset costs and save
 * this to the database.
 * <p>
 * Asset tables : property , ls, bl
 * <p>
 * Cost fields affected by the calculation:
 * <li>bl {cost_tax_total, cost_utility_total, cost_operating_total, cost_other_total, income_total}
 * <li>property {cost_tax_total, cost_utility_total, cost_operating_total, cost_other_total,
 * income_total}
 * <li>ls {amount_base_rent, amount_operating, amount_other, amount_taxes, amount_pct_rent,
 * amount_tot_rent_inc, amount_tot_rent_exp}
 * </p>
 * <p>
 * Changes:
 * <p>
 * 11/12/2010 KB 3029349 Ioan Draghici
 * <p>
 * Some of the fields that we present in the REPM version 19.2 new reports are calculated fields
 * related to space and occupancy. To calculate these fields run the following actions, prior to
 * performing the cost calculations:
 * <p>
 * 1. For summarize lease costs
 * <li>Perform Proration and Update Lease Areas.
 * <li>Update Building and Property Area Totals
 * <p>
 * 2. For summarize property and building costs
 * <li>Update Building and Property Area Totals
 * 
 * @author Ioan Draghici
 * 
 */

public class SummarizeCosts {
    
    /**
     * Asset field object. Object structure column id, cost type restriction, calculation type
     * (NETINCOME, INCOME or EXPENSE) (income, expense or both)
     * 
     * Ex: property table id: "cost_tax_total", costTypeRestriction: " cost_cat.cost_type = 'TAX'",
     * calcType: INCOME
     */
    public static class AssetField {
        /**
         * Calculation type.
         */
        private final String calcType;
        
        /**
         * Cost type restriction.
         */
        private final String costTypeRestriction;
        
        /**
         * Column id.
         */
        private final String fieldId;
        
        /**
         * class constructor.
         * 
         * @param fieldId - column id
         * @param costRestriction - cost type restriction
         * @param calcType - calculation type formula
         */
        public AssetField(final String fieldId, final String costRestriction, final String calcType) {
            this.fieldId = fieldId;
            this.costTypeRestriction = costRestriction;
            this.calcType = calcType;
        }
        
        /**
         * Get calculation type.
         * 
         * @return calcType
         */
        public String getCalcType() {
            return this.calcType;
        }
        
        /**
         * Get cost type restriction.
         * 
         * @return costTypeRestriction
         */
        public String getCostTypeRestriction() {
            return this.costTypeRestriction;
        }
        
        /**
         * Get column id.
         * 
         * @return fieldId
         */
        public String getFieldId() {
            return this.fieldId;
        }
        
    }
    
    /**
     * Building primary key field name.
     */
    public static final String ASSET_KEY_BUILDING = "bl_id";
    
    /**
     * Lease primary key field name.
     */
    public static final String ASSET_KEY_LEASE = "ls_id";
    
    /**
     * Property primary key field name.
     */
    public static final String ASSET_KEY_PROPERTY = "pr_id";
    
    /**
     * Building table name.
     */
    public static final String ASSET_TABLE_BUILDING = "bl";
    
    /**
     * Lease table name.
     */
    public static final String ASSET_TABLE_LEASE = "ls";
    
    /**
     * Property table name.
     */
    public static final String ASSET_TABLE_PROPERTY = "property";
    
    /**
     * Building costs summary.
     */
    public static final String SUMMARIZE_BUILDING = "bl";
    
    /**
     * Constants. Lease cost summary.
     */
    public static final String SUMMARIZE_LEASE = "ls";
    
    /**
     * Property costs summary.
     */
    public static final String SUMMARIZE_PROPERTY = "pr";
    
    /**
     * CAM Reconciliation summary.
     */
    public static final String SUMMARIZE_CAM_RECONCILIATION = "cam_reconciliation";
    
    /**
     * Temporary table name.
     */
    static final String TEMPORARY_TABLE = "ccost_sum";
    
    /**
     * Calculation formula for calculation type.
     */
    private static Map<String, String> calcTypeFormula = new HashMap<String, String>();
    
    /**
     * Constants. Translatable messages used for job status display. When recurring costs are
     * processed.
     */
    // @translatable
    private static final String MESSAGE_PROCESSING_COSTS = "Processing costs";
    
    /**
     * For proration and update lease area step.
     */
    // @translatable
    private static final String MESSAGE_PRORATION_UPDATE_LS_AREA =
            "Perform Proration and Update Lease Areas";
    
    /**
     * For update property and building areas.
     */
    // @translatable
    private static final String MESSAGE_UPDATE_BL_PR_AREA =
            "Update Building and Property Area Totals";
    
    static {
        calcTypeFormula.put(CostProjection.CALCTYPE_NETINCOME,
            "+ (SUM(amount_income) - SUM(amount_expense))");
        calcTypeFormula.put(CostProjection.CALCTYPE_INCOME, "+ SUM(amount_income)");
        calcTypeFormula.put(CostProjection.CALCTYPE_EXPENSE, "- SUM(amount_expense)");
    }
    
    /**
     * collection with cost fields.
     */
    private final List<AssetField> assetFields;
    
    /**
     * Name of the key field representing the asset.
     */
    private String assetKey;
    
    /**
     * name of the asset table.
     */
    private String assetTable;
    
    /**
     * Asset type.
     */
    private String assetType;
    
    /**
     * Currency and VAT settings.
     */
    private CurrencyVatRequestParameters currencyVatParameters;
    
    /**
     * current system date.
     */
    private final Date currentDate;
    
    /**
     * Logged user name.
     */
    private String userName;
    
    /**
     * Actual cost data source object.
     */
    private ICostDao<ActualCost> actualCostDataSource;
    
    /**
     * Recurring cost data source object.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Scheduled cost data source object.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;
    
    /**
     * Constructor.
     * 
     * @param assetType - summarize cost types
     */
    public SummarizeCosts(final String assetType) {
        if (SUMMARIZE_LEASE.equals(assetType)) {
            this.assetType = SUMMARIZE_LEASE;
            this.assetKey = ASSET_KEY_LEASE;
            this.assetTable = ASSET_TABLE_LEASE;
        } else if (SUMMARIZE_PROPERTY.equals(assetType)) {
            this.assetType = SUMMARIZE_PROPERTY;
            this.assetKey = ASSET_KEY_PROPERTY;
            this.assetTable = ASSET_TABLE_PROPERTY;
        } else if (SUMMARIZE_BUILDING.equals(assetType)) {
            this.assetType = SUMMARIZE_BUILDING;
            this.assetKey = ASSET_KEY_BUILDING;
            this.assetTable = ASSET_TABLE_BUILDING;
        } else if (SUMMARIZE_CAM_RECONCILIATION.equals(assetType)) {
            this.assetType = SUMMARIZE_CAM_RECONCILIATION;
            this.assetKey = ASSET_KEY_LEASE;
            this.assetTable = TEMPORARY_TABLE;
        }
        // create empty data set
        this.currentDate = new Date();
        this.assetFields = getAssetFieldBySummType(assetType);
    }
    
    /**
     * Perform summarize costs calculation.
     * 
     * 1. update asset date fields
     * 
     * 2. reset asset cost fields
     * 
     * 3. summarize actual, scheduled and recurring costs and update asset records
     * 
     * @param dateStart - calculation date start
     * @param dateEnd - calculation date end
     * @param period - calculation period
     * @param isFromCosts - if is from actual costs
     * @param isFromScheduledCosts - if is from scheduled costs
     * @param isFromRecurringCosts - if is from recurring costs
     * @param isActiveRecurringCosts - if is active recurring costs
     * @param status - job status object
     */
    public void calculate(final Date dateStart, final Date dateEnd, final String period,
            final boolean isFromCosts, final boolean isFromScheduledCosts,
            final boolean isFromRecurringCosts, final int isActiveRecurringCosts,
            final CurrencyVatRequestParameters currencyVatParam, final JobStatus status) {
        
        final int totalNo = this.assetFields.size() * 10 + 10;
        int currentNo = 0;
        
        status.setTotalNumber(totalNo);
        status.setCurrentNumber(currentNo);
        
        this.currencyVatParameters = currencyVatParam;
        final ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        this.userName = ContextStore.get().getUser().getName();
        
        // check MC and VAT cost data integrity - if currencies are defined
        final CurrencyAndVat currencyAndVat = new CurrencyAndVat();
        final String existCostWithoutCurrency =
                currencyAndVat.checkCostDataIntegrity(isFromCosts, isFromScheduledCosts,
                    isFromScheduledCosts, this.currencyVatParameters.isMcVatEnabled());
        
        if (StringUtil.notNullOrEmpty(existCostWithoutCurrency)) {
            status.addProperty("updateLegacyCosts", "true");
            status.addProperty("updateLegacyCostsMessage", existCostWithoutCurrency);
            status.setCurrentNumber(totalNo);
            status.setCode(JobStatus.JOB_COMPLETE);
            return;
        }
        
        // clear summary cost fields and temporary table
        clearSummaryTableCostFields();
        // run this just when asset table is updated
        updateAssetDates(dateStart, dateEnd);
        // do proration and update areas
        doProrationAndUpdateAreas(status, context);
        currentNo = currentNo + 10;
        status.setCurrentNumber(currentNo);
        
        // clear temporary table for current user and asset type
        for (final AssetField assetField : this.assetFields) {
            final String costField = assetField.getFieldId();
            final String costTypeRestriction = assetField.getCostTypeRestriction();
            final String calcType = assetField.getCalcType();
            
            if (status.isStopRequested()) {
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                status.setCurrentNumber(totalNo);
                break;
            }
            
            if (isFromCosts && !status.isStopRequested()) {
                status.setMessage(EventHandlerBase.localizeString(context,
                    MESSAGE_PROCESSING_COSTS, this.getClass().getName()));
                // populate temporary table
                addAssetToTemporaryTable("cost_tran", costTypeRestriction, dateStart, dateEnd, -1);
                // summarize costs to temporary table
                summarizeActualCosts(TEMPORARY_TABLE, this.assetKey, costField,
                    costTypeRestriction, calcType, dateStart, dateEnd);
                // summarize costs to asset table
                summarizeActualCosts(this.assetTable, this.assetKey, costField,
                    costTypeRestriction, calcType, dateStart, dateEnd);
            }
            currentNo = currentNo + 3;
            status.setCurrentNumber(currentNo);
            
            if (isFromScheduledCosts && !status.isStopRequested()) {
                status.setMessage(EventHandlerBase.localizeString(context,
                    MESSAGE_PROCESSING_COSTS, this.getClass().getName()));
                // populate temporary table
                addAssetToTemporaryTable("cost_tran_sched", costTypeRestriction, dateStart,
                    dateEnd, -1);
                // summarize costs to temporary table
                summarizeScheduledCosts(TEMPORARY_TABLE, this.assetKey, costField,
                    costTypeRestriction, calcType, dateStart, dateEnd);
                // summarize costs to asset table
                summarizeScheduledCosts(this.assetTable, this.assetKey, costField,
                    costTypeRestriction, calcType, dateStart, dateEnd);
            }
            currentNo = currentNo + 3;
            status.setCurrentNumber(currentNo);
            
            if (isFromRecurringCosts && !status.isStopRequested()) {
                status.setMessage(EventHandlerBase.localizeString(context,
                    MESSAGE_PROCESSING_COSTS, this.getClass().getName()));
                // populate temporary table
                addAssetToTemporaryTable("cost_tran_recur", costTypeRestriction, dateStart,
                    dateEnd, -1);
                
                // cost restrictions
                final StringBuffer recurringCostRestriction =
                        new StringBuffer(
                            "EXISTS(SELECT 1 FROM cost_cat WHERE cost_cat.cost_cat_id = cost_tran_recur.cost_cat_id AND ");
                recurringCostRestriction.append(costTypeRestriction);
                recurringCostRestriction.append(')');
                // 01/05/2011 IOAN KB 3029710 exclude lease templates
                if (this.assetTable.equals(ASSET_TABLE_LEASE)) {
                    recurringCostRestriction
                        .append("AND EXISTS(SELECT 1 FROM ls WHERE ls.use_as_template = 0 AND ls.ls_id = cost_tran_recur.ls_id )");
                }
                
                if (isActiveRecurringCosts != -1) {
                    recurringCostRestriction.append(" AND cost_tran_recur.status_active = ");
                    recurringCostRestriction.append(isActiveRecurringCosts);
                }
                
                if (this.currencyVatParameters.isMcVatEnabled()) {
                    recurringCostRestriction
                        .append(" AND cost_tran_recur.currency_payment IS NOT NULL AND cost_tran_recur.currency_budget IS NOT NULL ");
                }
                
                // cost projection creator
                final ICostDao<RecurringCost> dataSource = new RecurringCostDataSource();
                final CreateCostProjection creator = new CreateCostProjection(dataSource);
                
                // get cost projection for asset table
                final CurrencyVatRequestParameters currencyVatDisabled =
                        new CurrencyVatRequestParameters(null);
                creator.setCurrencyVatParameters(currencyVatDisabled);
                
                final CostProjection projection =
                        creator.calculateCashFlowProjection(this.assetType, dateStart, dateEnd,
                            period, calcType, false, false, false, true,
                            recurringCostRestriction.toString(), null, null, new JobStatus());
                
                creator.setCurrencyVatParameters(this.currencyVatParameters);
                final CostProjection projectionTemp =
                        creator.calculateCashFlowProjection(this.assetType, dateStart, dateEnd,
                            period, calcType, false, false, false, true,
                            recurringCostRestriction.toString(), null, null, new JobStatus());
                
                // summarize costs to temporary table
                summarizeRecurringCosts(projectionTemp, TEMPORARY_TABLE, this.assetKey, costField);
                
                // summarize costs to asset table
                summarizeRecurringCosts(projection, this.assetTable, this.assetKey, costField);
            }
            currentNo = currentNo + 4;
            status.setCurrentNumber(currentNo);
        }
        
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Summarize Cam cost for period.
     * 
     * @param leaseId lease code
     * @param userName logged user name
     * @param period cost period
     * @param requestParameters report request parameters
     * @param isMcAndVatEnabled if Mc & VAT is enabled
     * @param currencyUtilities currency parameters
     * @param vatUtilities VAT parameters
     */
    public void summarizeCamCostForPeriod(final String leaseId, final String userName,
            final CostPeriod period, final RequestParameters requestParameters,
            final boolean isMcAndVatEnabled, final CurrencyUtilities currencyUtilities,
            final VatUtilities vatUtilities) {
        initPerRequestState();
        this.userName = userName;
        
        // Get base rent cost
        final double baseRent =
                summarizeAssetCostsForPeriodAndCostCategory(leaseId,
                    requestParameters.getBaseRentCostCategory(), period, isMcAndVatEnabled,
                    currencyUtilities, vatUtilities);
        final double camCostEstimated =
                summarizeAssetCostsForPeriodAndCostCategory(leaseId,
                    requestParameters.getCamEstimateCostCategory(), period, isMcAndVatEnabled,
                    currencyUtilities, vatUtilities);
        final double camAdjustment =
                summarizeAssetCostsForPeriodAndCostCategory(leaseId,
                    requestParameters.getCamReconciliationCostCategory(), period,
                    isMcAndVatEnabled, currencyUtilities, vatUtilities);
        if (baseRent != 0 || camCostEstimated != 0 || camAdjustment != 0) {
            final double camCostActual = camCostEstimated + camAdjustment;
            final double camDelta =
                    camCostEstimated != 0 ? camAdjustment / camCostEstimated
                            * Constants.ONE_HUNDRED : 0.0;
            // save calculated values
            final String insertStatement =
                    "INSERT INTO "
                            + this.assetTable
                            + "(user_name, report_name, ls_id, date_costs_last_calcd, amount_base_rent, amount_operating, amount_other, amount_pct_rent, amount_security) VALUES ("
                            + SqlUtils.formatValueForSql(this.userName) + ", "
                            + SqlUtils.formatValueForSql(this.assetType) + ", "
                            + SqlUtils.formatValueForSql(leaseId) + ", "
                            + SqlUtils.formatValueForSql(period.getDateStart()) + ", "
                            + SqlUtils.formatValueForSql(baseRent) + ", "
                            + SqlUtils.formatValueForSql(camCostEstimated) + ", "
                            + SqlUtils.formatValueForSql(camCostActual) + ", "
                            + SqlUtils.formatValueForSql(camAdjustment) + ", "
                            + SqlUtils.formatValueForSql(camDelta) + ")";
            SqlUtils.executeUpdate(this.assetTable, insertStatement);
        }
    }
    
    /**
     * Summarize asset costs for period and cost category.
     * 
     * @param assetId asset id
     * @param costCategory cost category
     * @param period time period
     * @param isMcAndVatEnabled if MC & VAT is enabled
     * @param currencyUtilities currency parameters
     * @param vatUtilities cat parameters
     * @return double value
     */
    private double summarizeAssetCostsForPeriodAndCostCategory(final String assetId,
            final String costCategory, final CostPeriod period, final boolean isMcAndVatEnabled,
            final CurrencyUtilities currencyUtilities, final VatUtilities vatUtilities) {
        // search on actual cost
        double result = 0;
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(period.getDateStart());
        final int periodYear = calendar.get(Calendar.YEAR);
        
        final String actualSqlRestriction =
                "cost_tran."
                        + this.assetKey
                        + " = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND cost_tran.cost_cat_id IN ('"
                        + costCategory.replaceAll(",", "','")
                        + "') AND ( EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND ls_cam_rec_report.cost_tran_id = cost_tran.cost_tran_id AND ls_cam_rec_report.ls_rent_year = "
                        + periodYear
                        + ") OR ( NOT EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND ls_cam_rec_report.cost_tran_id = cost_tran.cost_tran_id ) AND cost_tran.date_due >= "
                        + SqlUtils.formatValueForSql(period.getDateStart())
                        + " AND cost_tran.date_due <= "
                        + SqlUtils.formatValueForSql(period.getDateEnd()) + " ))";
        
        final List<ActualCost> actualCosts =
                this.actualCostDataSource.findByRestriction(Restrictions.sql(actualSqlRestriction));
        for (final ActualCost cost : actualCosts) {
            result +=
                    cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME,
                        isMcAndVatEnabled, currencyUtilities, vatUtilities);
        }
        final String schedSqlRestriction =
                "cost_tran_sched."
                        + this.assetKey
                        + " = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND cost_tran_sched.cost_cat_id IN ('"
                        + costCategory.replaceAll(",", "','")
                        + "') AND ( EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND ls_cam_rec_report.cost_tran_sched_id = cost_tran_sched.cost_tran_sched_id AND ls_cam_rec_report.ls_rent_year = "
                        + periodYear
                        + ") OR ( NOT EXISTS(SELECT ls_cam_rec_report.ls_cam_rec_report_id FROM ls_cam_rec_report WHERE ls_cam_rec_report.ls_id = "
                        + SqlUtils.formatValueForSql(assetId)
                        + " AND ls_cam_rec_report.cost_tran_sched_id = cost_tran_sched.cost_tran_sched_id ) AND cost_tran_sched.date_due >= "
                        + SqlUtils.formatValueForSql(period.getDateStart())
                        + " AND cost_tran_sched.date_due <= "
                        + SqlUtils.formatValueForSql(period.getDateEnd()) + " ))";
        
        final List<ScheduledCost> schedCosts =
                this.scheduledCostDataSource.findByRestriction(Restrictions
                    .sql(schedSqlRestriction));
        for (final ScheduledCost cost : schedCosts) {
            result +=
                    cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME,
                        isMcAndVatEnabled, currencyUtilities, vatUtilities);
        }
        // search on recurring cost
        final String recurSqlRestriction =
                "cost_tran_recur." + this.assetKey + " = " + SqlUtils.formatValueForSql(assetId)
                        + " AND cost_tran_recur.cost_cat_id IN ('"
                        + costCategory.replaceAll(",", "','")
                        + "') AND cost_tran_recur.date_start <= "
                        + SqlUtils.formatValueForSql(period.getDateEnd())
                        + " AND (cost_tran_recur.date_end >= "
                        + SqlUtils.formatValueForSql(period.getDateStart())
                        + " OR cost_tran_recur.date_end IS NULL)";
        final Restriction restriction = Restrictions.sql(recurSqlRestriction);
        
        final List<RecurringCost> recurCosts =
                this.recurringCostDataSource.findByRestriction(restriction);
        for (final RecurringCost cost : recurCosts) {
            final Date dateLastScheduled = cost.getChangeOverDate();
            Date startDate = period.getDateStart();
            if (StringUtil.notNullOrEmpty(dateLastScheduled) && dateLastScheduled.after(startDate)) {
                startDate = dateLastScheduled;
            }
            cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME, startDate,
                period.getDateEnd(), isMcAndVatEnabled, currencyUtilities, vatUtilities);
            result += cost.getSummarizedAmount().doubleValue();
        }
        return result;
    }
    
    /**
     * Populate temporary table with required assets.
     * 
     * @param costTable cost table name (cost_tran, cost_tran_recur, cost_tran_sched)
     * @param costTypeRestriction cost type restriction for current asset field
     * @param dateStart start date
     * @param dateEnd end date
     */
    private void addAssetToTemporaryTable(final String costTable, final String costTypeRestriction,
            final Date dateStart, final Date dateEnd, final int isActiveRecurringCosts) {
        String sqlInsert =
                "INSERT INTO " + TEMPORARY_TABLE + " (" + this.assetKey
                        + ", report_name, user_name) SELECT DISTINCT " + this.assetTable + "."
                        + this.assetKey + " , " + SqlUtils.formatValueForSql(this.assetType) + ", "
                        + SqlUtils.formatValueForSql(this.userName) + " FROM " + this.assetTable
                        + ", " + costTable + ", cost_cat " + " WHERE cost_cat.cost_cat_id =  "
                        + costTable + ".cost_cat_id ";
        // if is lease than ignore lease templates
        if (ASSET_TABLE_LEASE.equals(this.assetTable)) {
            sqlInsert += " AND ls.use_as_template = 0";
        }
        
        if (costTable.equals("cost_tran")) {
            sqlInsert +=
                    " AND cost_tran." + this.assetKey + " = " + this.assetTable + "."
                            + this.assetKey
                            + " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} >= "
                            + SqlUtils.formatValueForSql(dateStart)
                            + " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} <= "
                            + SqlUtils.formatValueForSql(dateEnd) + " AND " + costTypeRestriction;
        } else if (costTable.equals("cost_tran_sched")) {
            sqlInsert +=
                    " AND cost_tran_sched."
                            + this.assetKey
                            + " = "
                            + this.assetTable
                            + "."
                            + this.assetKey
                            + " AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} >= "
                            + SqlUtils.formatValueForSql(dateStart)
                            + " AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} <= "
                            + SqlUtils.formatValueForSql(dateEnd) + " AND " + costTypeRestriction;
        } else if (costTable.equals("cost_tran_recur")) {
            sqlInsert +=
                    " AND cost_tran_recur." + this.assetKey + " = " + this.assetTable + "."
                            + this.assetKey + " AND ( cost_tran_recur.date_end >= "
                            + SqlUtils.formatValueForSql(dateStart)
                            + " OR cost_tran_recur.date_end IS NULL )"
                            + " AND cost_tran_recur.date_start <= "
                            + SqlUtils.formatValueForSql(dateEnd) + " AND " + costTypeRestriction;
            if (isActiveRecurringCosts != -1) {
                sqlInsert += "  AND cost_tran_recur.status_active = " + isActiveRecurringCosts;
            }
        }
        sqlInsert +=
                " AND NOT EXISTS(SELECT 1 FROM " + TEMPORARY_TABLE + " WHERE " + TEMPORARY_TABLE
                        + "." + this.assetKey + " = " + this.assetTable + "." + this.assetKey
                        + " AND " + TEMPORARY_TABLE + ".report_name = "
                        + SqlUtils.formatValueForSql(this.assetType) + " AND " + TEMPORARY_TABLE
                        + ".user_name = " + SqlUtils.formatValueForSql(this.userName) + ")";
        
        SqlUtils.executeUpdate(TEMPORARY_TABLE, sqlInsert);
        // commit for oracle
        if (SqlUtils.isOracle()) {
            SqlUtils.commit();
        }
    }
    
    /**
     * Clear summary cost fields (set zero value). We also must clear temporary table data for
     * current user reset asset costs stored in the database
     */
    private void clearSummaryTableCostFields() {
        // clear buffer table cccost_sum
        final String sqlTempTable =
                "DELETE FROM " + TEMPORARY_TABLE + " WHERE user_name = "
                        + SqlUtils.formatValueForSql(this.userName) + " AND report_name = "
                        + SqlUtils.formatValueForSql(this.assetType);
        
        SqlUtils.executeUpdate(TEMPORARY_TABLE, sqlTempTable);
        
        String sqlAssetTable = "";
        if (this.assetTable.equals(ASSET_TABLE_PROPERTY)) {
            sqlAssetTable =
                    "UPDATE property SET cost_tax_total = 0, cost_utility_total = 0,"
                            + "cost_operating_total = 0, cost_other_total = 0, income_total = 0";
            
        } else if (this.assetTable.equals(ASSET_TABLE_BUILDING)) {
            sqlAssetTable =
                    "UPDATE bl SET cost_tax_total = 0, cost_utility_total = 0,"
                            + "cost_operating_total = 0, cost_other_total = 0, income_total = 0";
            
        } else if (this.assetTable.equals(ASSET_TABLE_LEASE)) {
            sqlAssetTable =
                    "UPDATE ls SET amount_base_rent = 0, amount_pct_rent = 0, amount_operating = 0,"
                            + " amount_other = 0, amount_taxes = 0, amount_tot_rent_inc = 0, amount_tot_rent_exp = 0 WHERE ls.use_as_template = 0";
        }
        SqlUtils.executeUpdate(this.assetTable, sqlAssetTable);
        // commit for oracle
        if (SqlUtils.isOracle()) {
            SqlUtils.commit();
        }
    }
    
    /**
     * Perform proration and update areas.
     * 
     * @param status - job status
     * @param context - current context
     */
    private void doProrationAndUpdateAreas(final JobStatus status,
            final ContextCacheable.Immutable context) {
        // perform proration and update lease areas
        if (this.assetType.equals(SUMMARIZE_LEASE)) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PRORATION_UPDATE_LS_AREA, this.getClass().getName()));
            LeaseAreaUpdate.updateLeaseAreas();
            status.setCurrentNumber(5);
        }
        
        // update building and property area totals
        status.setMessage(EventHandlerBase.localizeString(context, MESSAGE_UPDATE_BL_PR_AREA, this
            .getClass().getName()));
        PropertyAreaUpdate.updateBuildingAndPropertyAreas();
        status.setCurrentNumber(10);
    }
    
    /**
     * populate assetFields collection with fields that are calculated by wfr from property table or
     * lease table - based on assetKey value.
     * 
     * @param summaryType - cost summary type
     * @return List of AssetFields
     */
    private List<AssetField> getAssetFieldBySummType(final String summaryType) {
        final List<AssetField> fields = new ArrayList<AssetField>();
        if (summaryType.equals(SUMMARIZE_PROPERTY)) {
            fields.add(new AssetField("cost_tax_total", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_utility_total", "cost_cat.cost_type = 'UTILITY'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_operating_total",
                "cost_cat.cost_type = 'OPERATING EXP.'", CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_other_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_EXPENSE));
            fields.add(new AssetField("income_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_INCOME));
            
        } else if (summaryType.equals(SUMMARIZE_BUILDING)) {
            fields.add(new AssetField("cost_tax_total", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_utility_total", "cost_cat.cost_type = 'UTILITY'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_operating_total",
                "cost_cat.cost_type = 'OPERATING EXP.'", CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("cost_other_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_EXPENSE));
            fields.add(new AssetField("income_total",
                "cost_cat.cost_type NOT IN ('TAX','UTILITY','OPERATING EXP.')",
                CostProjection.CALCTYPE_INCOME));
            
        } else if (summaryType.equals(SUMMARIZE_LEASE)) {
            
            fields.add(new AssetField("amount_base_rent", "cost_cat.cost_type = 'BASE RENT'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("amount_operating", "cost_cat.cost_type='OPERATING EXP.'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("amount_other",
                "cost_cat.cost_type NOT IN ('BASE RENT', 'OPERATING EXP.', 'TAX', 'PCT. RENT')",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("amount_taxes", "cost_cat.cost_type = 'TAX'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("amount_pct_rent", "cost_cat.cost_type = 'PCT. RENT'",
                CostProjection.CALCTYPE_NETINCOME));
            fields.add(new AssetField("amount_tot_rent_inc",
                "cost_cat.cost_type IN ('BASE RENT', 'OTHER RENT', 'PCT. RENT')",
                CostProjection.CALCTYPE_INCOME));
            fields.add(new AssetField("amount_tot_rent_exp",
                "cost_cat.cost_type IN ('BASE RENT', 'OTHER RENT', 'PCT. RENT')",
                CostProjection.CALCTYPE_EXPENSE));
        }
        return fields;
    }
    
    /**
     * Get calculation fields sql statement.
     * 
     * @param calcType
     * @param tableName
     * @return
     */
    private String getCalcFieldsForVatAndMc(final String calcType, final String tableName) {
        String calcFields = "";
        final String amountIncomeField =
                this.currencyVatParameters.getCostFieldName("amount_income");
        final String amountExpenseField =
                this.currencyVatParameters.getCostFieldName("amount_expense");
        
        if (calcType.equals(CostProjection.CALCTYPE_NETINCOME)) {
            calcFields =
                    tableName + "." + amountIncomeField + " ${sql.as} " + amountIncomeField + ", "
                            + tableName + "." + amountExpenseField + " ${sql.as} "
                            + amountExpenseField;
        } else if (calcType.equals(CostProjection.CALCTYPE_INCOME)) {
            calcFields = tableName + "." + amountIncomeField + " ${sql.as} " + amountIncomeField;
        } else if (calcType.equals(CostProjection.CALCTYPE_EXPENSE)) {
            calcFields = tableName + "." + amountExpenseField + " ${sql.as} " + amountExpenseField;
        }
        
        return calcFields;
    }
    
    /**
     * Get calculation formula when MC and VAT is enabled.
     * 
     * @param calcType calculation type
     * @param tableName cost table name.
     * @return sql formula
     */
    private String getCalcFormulaForVATAndMC(final String calcType, final String tableName) {
        String calculationFormula = "";
        
        final String amountIncomeField =
                this.currencyVatParameters.getCostFieldName("amount_income");
        final String amountExpenseField =
                this.currencyVatParameters.getCostFieldName("amount_expense");
        
        final String currencyField =
                tableName + "." + this.currencyVatParameters.getCurrencyFieldName();
        
        // exchange rate formula
        String exchangeRateFormula = "";
        if (tableName.equals("cost_tran_recur")) {
            exchangeRateFormula =
                    "${sql.exchangeRateFromField('" + currencyField + "', '"
                            + this.currencyVatParameters.getCurrencyCode() + "', '"
                            + this.currencyVatParameters.getExchangeRateType().toString() + "')}";
        } else {
            exchangeRateFormula =
                    "${sql.exchangeRateFromFieldForDate('" + currencyField + "', '"
                            + this.currencyVatParameters.getCurrencyCode() + "', '"
                            + this.currencyVatParameters.getExchangeRateType().toString() + "', '"
                            + tableName + ".date_due' )}";
        }
        // If is MSSQL we have a different case
        if (SqlUtils.isSqlServer()) {
            exchangeRateFormula = "factor";
        }
        
        if (calcType.equals(CostProjection.CALCTYPE_NETINCOME)) {
            calculationFormula =
                    "+ ( SUM(" + amountIncomeField + " * " + exchangeRateFormula + ") - SUM("
                            + amountExpenseField + " * " + exchangeRateFormula + "))";
        } else if (calcType.equals(CostProjection.CALCTYPE_INCOME)) {
            calculationFormula = "+ SUM(" + amountIncomeField + " * " + exchangeRateFormula + ")";
        } else if (calcType.equals(CostProjection.CALCTYPE_EXPENSE)) {
            calculationFormula = " - SUM(" + amountExpenseField + " * " + exchangeRateFormula + ")";
        }
        
        return calculationFormula;
    }
    
    /**
     * summarize actual cost for specified cost field and date range.
     * 
     * add calculated costs to scheduled costs stored in the database
     * 
     * @param assetTbl - asset table
     * @param assetField - asset field
     * @param costField - cost field
     * @param costRestriction - cost restriction
     * @param calcType - calculation type
     * @param dateStart - date start
     * @param dateEnd - date end
     */
    private void summarizeActualCosts(final String assetTbl, final String assetField,
            final String costField, final String costRestriction, final String calcType,
            final Date dateStart, final Date dateEnd) {
        
        String sqlRestriction = "1 = 1";
        if (assetTbl.equals(ASSET_TABLE_LEASE)) {
            sqlRestriction = "ls.use_as_template = 0";
        }
        
        String isNullFunc = "ISNULL";
        if (SqlUtils.isOracle()) {
            isNullFunc = "NVL";
        }
        
        String bufferTableUserRestriction = "";
        if (TEMPORARY_TABLE.equals(assetTbl)) {
            bufferTableUserRestriction =
                    " AND ccost_sum.report_name = " + SqlUtils.formatValueForSql(this.assetType)
                            + " AND ccost_sum.user_name =  "
                            + SqlUtils.formatValueForSql(this.userName);
        }
        
        String currencyRestriction = "";
        if (this.currencyVatParameters.isMcVatEnabled()) {
            currencyRestriction =
                    "cost_tran.currency_payment IS NOT NULL AND cost_tran.currency_budget IS NOT NULL AND";
        }
        
        final String fromWhereStatement =
                "FROM cost_tran, cost_cat " + "WHERE " + currencyRestriction + " cost_tran."
                        + assetField + " = " + assetTbl + "." + assetField
                        + bufferTableUserRestriction
                        + " AND cost_cat.cost_cat_id = cost_tran.cost_cat_id "
                        + " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} >= "
                        + SqlUtils.formatValueForSql(dateStart)
                        + " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} <= "
                        + SqlUtils.formatValueForSql(dateEnd) + " AND " + costRestriction;
        String calcFormula = "";
        String sql = "";
        
        if (this.currencyVatParameters.isMcVatEnabled() && TEMPORARY_TABLE.equals(assetTbl)) {
            calcFormula = getCalcFormulaForVATAndMC(calcType, "cost_tran");
            // if is MSSQL we have a different case here
            if (SqlUtils.isSqlServer()) {
                final String currencyField =
                        "cost_tran." + this.currencyVatParameters.getCurrencyFieldName();
                
                final String exchangeRateFormula =
                        "${sql.exchangeRateFromFieldForDate('" + currencyField + "', '"
                                + this.currencyVatParameters.getCurrencyCode() + "', '"
                                + this.currencyVatParameters.getExchangeRateType().toString()
                                + "', 'cost_tran.date_due')}";
                
                final String calcFields = getCalcFieldsForVatAndMc(calcType, "cost_tran");
                
                sql =
                        "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT "
                                + isNullFunc + "(" + assetTbl + "." + costField + calcFormula
                                + ", 0) FROM (SELECT cost_tran." + assetField + " ${sql.as} "
                                + assetField + ", " + exchangeRateFormula + " ${sql.as} factor, "
                                + calcFields + " " + fromWhereStatement + ") ${sql.as} cost_tran "
                                + " GROUP BY cost_tran." + assetField + " ) " + " WHERE "
                                + sqlRestriction + " AND EXISTS( SELECT 1 " + fromWhereStatement
                                + " )";
            } else {
                
                sql =
                        "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT "
                                + isNullFunc + "(" + assetTbl + "." + costField + calcFormula
                                + ", 0) " + fromWhereStatement + " GROUP BY cost_tran."
                                + assetField + ") " + " WHERE " + sqlRestriction
                                + " AND EXISTS( SELECT 1 " + fromWhereStatement + " )";
            }
        } else {
            calcFormula = SummarizeCosts.calcTypeFormula.get(calcType);
            sql =
                    "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT " + isNullFunc
                            + "(" + assetTbl + "." + costField + calcFormula + ", 0) "
                            + fromWhereStatement + " GROUP BY cost_tran." + assetField + ") "
                            + " WHERE " + sqlRestriction + " AND EXISTS( SELECT 1 "
                            + fromWhereStatement + " ) ";
        }
        SqlUtils.executeUpdate(assetTbl, sql);
    }
    
    /**
     * Summarize recurring cost for specified cost field and date range.
     * 
     * add calculated costs to asset costs stored in database
     * 
     * @param projection - cost projection
     * @param assetTbl - asset table
     * @param assetField - asset field
     * @param costField - cost field
     */
    private void summarizeRecurringCosts(final CostProjection projection, final String assetTbl,
            final String assetField, final String costField) {
        String bufferTableUserRestriction = "";
        if (TEMPORARY_TABLE.equals(assetTbl)) {
            bufferTableUserRestriction =
                    " AND ccost_sum.report_name = " + SqlUtils.formatValueForSql(this.assetType)
                            + " AND ccost_sum.user_name =  "
                            + SqlUtils.formatValueForSql(this.userName);
        }
        
        for (final String assetId : projection.getAssetIds()) {
            for (final CostPeriod costPeriod : projection.getPeriodsForAsset(assetId)) {
                final BigDecimal cost = costPeriod.getCost();
                final String sql =
                        "UPDATE " + assetTbl + " SET " + costField + " = " + costField + " + ("
                                + SqlUtils.formatValueForSql(cost.doubleValue()) + ") WHERE "
                                + assetField + " = " + SqlUtils.formatValueForSql(assetId)
                                + bufferTableUserRestriction;
                SqlUtils.executeUpdate(assetTbl, sql);
            }
        }
        
    }
    
    /**
     * summarize scheduled costs for specified cost field and date range.
     * 
     * add calculated scheduled costs to asset scheduled costs stored in database
     * 
     * @param assetTbl - asset table
     * @param assetField - asset field
     * @param costField - cost field
     * @param costRestriction - cost restriction
     * @param calcType - calculation type
     * @param dateStart - date start
     * @param dateEnd - date end
     */
    private void summarizeScheduledCosts(final String assetTbl, final String assetField,
            final String costField, final String costRestriction, final String calcType,
            final Date dateStart, final Date dateEnd) {
        
        String sqlRestriction = "1 = 1";
        if (assetTbl.equals(ASSET_TABLE_LEASE)) {
            sqlRestriction = "ls.use_as_template = 0";
        }
        
        String isNullFunc = "ISNULL";
        if (SqlUtils.isOracle()) {
            isNullFunc = "NVL";
        }
        
        String bufferTableUserRestriction = "";
        if (TEMPORARY_TABLE.equals(assetTbl)) {
            bufferTableUserRestriction =
                    " AND ccost_sum.report_name = " + SqlUtils.formatValueForSql(this.assetType)
                            + " AND ccost_sum.user_name =  "
                            + SqlUtils.formatValueForSql(this.userName);
        }
        
        String currencyRestriction = "";
        if (this.currencyVatParameters.isMcVatEnabled()) {
            currencyRestriction =
                    "cost_tran_sched.currency_payment IS NOT NULL AND cost_tran_sched.currency_budget IS NOT NULL AND";
        }
        final String fromWhereStatement =
                "FROM cost_tran_sched, cost_cat "
                        + "WHERE "
                        + currencyRestriction
                        + " cost_tran_sched."
                        + assetField
                        + " = "
                        + assetTbl
                        + "."
                        + assetField
                        + bufferTableUserRestriction
                        + " AND cost_cat.cost_cat_id = cost_tran_sched.cost_cat_id "
                        + " AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} >= "
                        + SqlUtils.formatValueForSql(dateStart)
                        + " AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} <= "
                        + SqlUtils.formatValueForSql(dateEnd) + " AND " + costRestriction;
        
        String calcFormula = "";
        String sql = "";
        if (this.currencyVatParameters.isMcVatEnabled() && TEMPORARY_TABLE.equals(assetTbl)) {
            calcFormula = getCalcFormulaForVATAndMC(calcType, "cost_tran_sched");
            // if is MSSQL we have a different case here
            if (SqlUtils.isSqlServer()) {
                final String currencyField =
                        "cost_tran_sched." + this.currencyVatParameters.getCurrencyFieldName();
                final String exchangeRateFormula =
                        "${sql.exchangeRateFromFieldForDate('" + currencyField + "', '"
                                + this.currencyVatParameters.getCurrencyCode() + "', '"
                                + this.currencyVatParameters.getExchangeRateType().toString()
                                + "', 'cost_tran_sched.date_due')}";
                final String calcFields = getCalcFieldsForVatAndMc(calcType, "cost_tran_sched");
                
                sql =
                        "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT "
                                + isNullFunc + "(" + assetTbl + "." + costField + calcFormula
                                + ", 0) FROM (SELECT  cost_tran_sched." + assetField
                                + " ${sql.as} " + assetField + ", " + exchangeRateFormula
                                + " ${sql.as} factor, " + calcFields + " " + fromWhereStatement
                                + ") ${sql.as} cost_tran_sched " + " GROUP BY cost_tran_sched."
                                + assetField + ") " + " WHERE " + sqlRestriction
                                + " AND EXISTS( SELECT 1 " + fromWhereStatement + " )";
            } else {
                sql =
                        "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT "
                                + isNullFunc + "(" + assetTbl + "." + costField + calcFormula
                                + ", 0) " + fromWhereStatement + " GROUP BY cost_tran_sched."
                                + assetField + ") " + " WHERE " + sqlRestriction
                                + " AND EXISTS( SELECT 1 " + fromWhereStatement + " )";
            }
        } else {
            calcFormula = SummarizeCosts.calcTypeFormula.get(calcType);
            sql =
                    "UPDATE " + assetTbl + " SET " + costField + " = " + "( SELECT " + isNullFunc
                            + "(" + assetTbl + "." + costField + calcFormula + ", 0) "
                            + fromWhereStatement + " GROUP BY cost_tran_sched." + assetField + ") "
                            + " WHERE " + sqlRestriction + " AND EXISTS( SELECT 1 "
                            + fromWhereStatement + " )";
        }
        
        SqlUtils.executeUpdate(assetTbl, sql);
    }
    
    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        if (this.actualCostDataSource == null) {
            this.actualCostDataSource = new ActualCostDataSource();
        }
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
    }
    
    /**
     * Update start date , end date and last calculated date to asset table.
     * 
     * property:
     * 
     * UPDATE property SET date_costs_start = dateStart, date_costs_end = dateEnd,
     * date_costs_last_calcd = currentDate
     * 
     * ls:
     * 
     * UPDATE ls SET date_cost_anal_start = dateStart, date_cost_anal_end = dateEnd,
     * date_costs_last_calcd = currentDate
     * 
     * @param dateStart - date start
     * @param dateEnd - date end
     */
    private void updateAssetDates(final Date dateStart, final Date dateEnd) {
        String sql = "";
        String fieldPrefix = "";
        String sqlRestriction = "";
        if (this.assetTable.equals(ASSET_TABLE_PROPERTY)
                || this.assetTable.equals(ASSET_TABLE_BUILDING)) {
            fieldPrefix = "date_costs";
            
        } else if (this.assetTable.equals(ASSET_TABLE_LEASE)) {
            fieldPrefix = "date_cost_anal";
            sqlRestriction = " WHERE ls.use_as_template = 0";
        }
        
        sql =
                "UPDATE " + this.assetTable + " SET " + fieldPrefix + "_start = "
                        + SqlUtils.formatValueForSql(dateStart) + ", " + fieldPrefix + "_end = "
                        + SqlUtils.formatValueForSql(dateEnd) + ", date_costs_last_calcd = "
                        + SqlUtils.formatValueForSql(this.currentDate) + sqlRestriction;
        SqlUtils.executeUpdate(this.assetTable, sql);
    }
    
}
