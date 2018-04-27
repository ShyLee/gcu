package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

/**
 * Creates cash flow or financial projections from costs.
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Initial implementation, ported from lssup.abs.
 * 
 * @author Sergey Kuramshin
 */
public class CreateCostProjection {
    
    // ----------------------- constants ----------------------------------------------------------
    
    public static final String PROJECTION_ACCOUNT = "ac";
    
    public static final String PROJECTION_BUILDING = "bl";
    
    public static final String PROJECTION_DEPARTMENT = "dp";
    
    public static final String PROJECTION_LEASE = "ls";
    
    public static final String PROJECTION_LEASE_FOR_BUILDING = "lsBl";
    
    public static final String PROJECTION_LEASE_FOR_PROPERTY = "lsPr";
    
    public static final String PROJECTION_PROPERTY = "pr";
    
    public static final String PROJECTION_TAXES = "taxes";
    
    /**
     * Map<String projectionType, String assetKey>
     */
    static private Map<String, String> assetKeysByProjectionType = new HashMap<String, String>();
    
    // @translatable
    private static final String MESSAGE_PROCESSING_ACTUAL_COSTS = "Processing actual costs";
    
    // @translatable
    private static final String MESSAGE_PROCESSING_RECURRING_COSTS = "Processing recurring costs";
    
    // ----------------------- business methods ---------------------------------------------------
    
    // @translatable
    private static final String MESSAGE_PROCESSING_SCHEDULED_COSTS = "Processing scheduled costs";
    
    static {
        assetKeysByProjectionType.put(PROJECTION_PROPERTY, CostProjection.ASSET_KEY_PROPERTY);
        assetKeysByProjectionType.put(PROJECTION_TAXES, CostProjection.ASSET_KEY_PROPERTY);
        assetKeysByProjectionType.put(PROJECTION_BUILDING, CostProjection.ASSET_KEY_BUILDING);
        assetKeysByProjectionType.put(PROJECTION_LEASE, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType
            .put(PROJECTION_LEASE_FOR_BUILDING, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType
            .put(PROJECTION_LEASE_FOR_PROPERTY, CostProjection.ASSET_KEY_LEASE);
        assetKeysByProjectionType.put(PROJECTION_DEPARTMENT, CostProjection.ASSET_KEY_DEPARTMENT);
        assetKeysByProjectionType.put(PROJECTION_ACCOUNT, CostProjection.ASSET_KEY_ACCOUNT);
    }
    
    /**
     * Currency and vat settings.
     */
    private CurrencyVatRequestParameters currencyVatParameters = new CurrencyVatRequestParameters(
        null);
    
    private final ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Constructor.
     * 
     * @param recurringCostDataSource
     */
    public CreateCostProjection(final ICostDao<RecurringCost> recurringCostDataSource) {
        this.recurringCostDataSource = recurringCostDataSource;
    }
    
    /**
     * Setter.
     * 
     * @param currencyConfig current settings
     */
    public void setCurrencyVatParameters(final CurrencyVatRequestParameters config) {
        this.currencyVatParameters = config;
    }
    
    /**
     * Calculate cash flow projections from costs, scheduled costs, and/or recurring costs. Returns
     * calculation results as a CostProjection object.
     * 
     * @param projectionType The type of projection - "pr", "ls", "taxes", etc. Costs will be
     *            grouped by the corresponding foreign key field. Supported values are defined as
     *            constants in the CreateCostProjection class.
     * @param dateFrom The projection start date.
     * @param dateTo The projection end date.
     * @param period The date interval between projection values - "month", "quarter", or "year".
     * @param calculationType Defines how to calculate totals - "netincome", "income", or "expense".
     * @param isGroupByCostCategory Whether to group costs by cost category.
     * @param isFromCosts Whether to include actual costs into the projection.
     * @param isFromScheduledCosts Whether to include scheduled costs into the projection.
     * @param isFromRecurringCosts Whether to include recurring costs into the projection.
     * @param clientRestriction Optional client restriction string, or null.
     * @return CostProjection
     */
    CostProjection calculateCashFlowProjection(final String projectionType, final Date dateFrom,
            final Date dateTo, final String period, final String calculationType,
            final boolean isGroupByCostCategory, final boolean isFromCosts,
            final boolean isFromScheduledCosts, final boolean isFromRecurringCosts,
            String recurringCostsRestriction, String scheduledCostsRestriction,
            String actualCostsRestriction, final JobStatus status) {
        
        status.setResult(new JobResult("Calculate cash flow projection"));
        
        final String assetKey = getAssetKeyForProjectionType(projectionType);
        
        if (projectionType.equalsIgnoreCase(PROJECTION_TAXES)) {
            recurringCostsRestriction = addTaxesRestriction(recurringCostsRestriction);
            scheduledCostsRestriction = addTaxesRestriction(scheduledCostsRestriction);
            actualCostsRestriction = addTaxesRestriction(actualCostsRestriction);
        }
        
        // the CostProjection object will hold calculation results
        final CostProjection projection = new CostProjection(assetKey, dateFrom, dateTo, period);
        
        final ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        
        if (isFromCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_ACTUAL_COSTS, this.getClass().getName()));
            updateProjectionFromCosts(projection, calculationType, "cost_tran",
                isGroupByCostCategory, actualCostsRestriction, status);
        }
        
        if (isFromScheduledCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_SCHEDULED_COSTS, this.getClass().getName()));
            updateProjectionFromCosts(projection, calculationType, "cost_tran_sched",
                isGroupByCostCategory, scheduledCostsRestriction, status);
        }
        
        if (isFromRecurringCosts && !status.isStopRequested()) {
            status.setMessage(EventHandlerBase.localizeString(context,
                MESSAGE_PROCESSING_RECURRING_COSTS, this.getClass().getName()));
            updateProjectionFromRecurringCosts(projection, calculationType, isGroupByCostCategory,
                recurringCostsRestriction, status);
        }
        
        return projection;
    }
    
    /**
     * Adds taxes restriction to specified client restriction and returns the combined restriction.
     * 
     * @param clientRestriction
     * @return
     */
    private String addTaxesRestriction(String restriction) {
        if (StringUtil.notNullOrEmpty(restriction)) {
            restriction = "(" + restriction + ") AND ";
        }
        restriction = StringUtil.notNull(restriction) + "cost_cat.cost_type = 'TAX'";
        return restriction;
    }
    
    /**
     * @see #getTotalCostAmountsForSqlServer(String, String, String, Date, Date)
     * @return SQL query for SQL server
     */
    private String buildCustomQueryForSqlServer(final String assetKey, final String costTable,
            final String restriction, final Date dateFrom, final Date dateTo) {
        
        final String selectTemplate = "SELECT %s FROM %s WHERE %s";
        final String groupByTemplate = " GROUP BY %s";
        final String sumTemplate = "SUM(%s.%s) AS %s";
        
        // we will be grouping cost records by asset key
        String groupByField = assetKey;
        if (groupByField.equalsIgnoreCase(CostProjection.ASSET_KEY_DEPARTMENT)) {
            groupByField = "dv_id, dp_id";
        }
        final String firstGroupField = costTable + "." + groupByField;
        final String secondGroupField = costTable + ".cost_cat_id";
        
        // we will be filtering out cost records that do not belong to specified asset (have NULL)
        final VirtualFieldDef amountIncomeFieldDef =
                getSumVirtualField(costTable, "amount_income_total", "amount_income");
        final VirtualFieldDef amountExpenseFieldDef =
                getSumVirtualField(costTable, "amount_expense_total", "amount_expense");
        String amountIncomeSqlFieldDef = "";
        if (StringUtil.notNullOrEmpty(amountIncomeFieldDef.sqlExpressions)) {
            amountIncomeSqlFieldDef =
                    amountIncomeFieldDef.sqlExpressions.getExpressionForCurrentDatabase()
                            + " AS amount_income_total";
        } else {
            amountIncomeSqlFieldDef = " amount_income AS amount_income_total";
        }
        
        String amountExpenseSqlFieldDef = "";
        if (StringUtil.notNullOrEmpty(amountExpenseFieldDef.sqlExpressions)) {
            amountExpenseSqlFieldDef =
                    amountExpenseFieldDef.sqlExpressions.getExpressionForCurrentDatabase()
                            + " AS amount_expense_total";
        } else {
            amountExpenseSqlFieldDef = " amount_expense AS amount_expense_total";
        }
        
        final String fromSelectFields =
                firstGroupField + " AS " + assetKey + " ," + secondGroupField + " AS cost_cat_id,"
                        + amountIncomeSqlFieldDef + "," + amountExpenseSqlFieldDef;
        String fromSelectRestriction = " (" + firstGroupField + " IS NOT NULL) ";
        fromSelectRestriction +=
                "AND (${sql.isNull('date_paid', 'date_due')} >= ${parameters['dateFrom']}) ";
        fromSelectRestriction +=
                "AND (${sql.isNull('date_paid', 'date_due')} <= ${parameters['dateTo']}) ";
        if (StringUtil.notNullOrEmpty(restriction)) {
            fromSelectRestriction += "AND (" + restriction + ")";
        }
        final String fromSelect =
                String.format(selectTemplate, fromSelectFields, costTable, fromSelectRestriction);
        final String sumAmountIncome =
                String.format(sumTemplate, costTable, "amount_income_total", "amount_income_total");
        final String sumAmountExpense =
                String.format(sumTemplate, costTable, "amount_expense_total",
                    "amount_expense_total");
        final String groupByClause =
                String.format(groupByTemplate, firstGroupField + ", " + secondGroupField);
        return String.format(selectTemplate, firstGroupField + ", " + secondGroupField + ", "
                + sumAmountIncome + ", " + sumAmountExpense, "(" + fromSelect + ") " + costTable,
            "1=1")
                + groupByClause;
    }
    
    /**
     * Returns the asset key name for specified projection type.
     * 
     * @param projectionType
     * @return
     */
    private String getAssetKeyForProjectionType(final String projectionType) {
        return assetKeysByProjectionType.get(projectionType);
    }
    
    /**
     * Get Summary virtual field definition.
     * 
     * @param costTable cost table
     * @param field field name
     * @param baseField base field name
     * @return
     */
    private VirtualFieldDef getSumVirtualField(final String costTable, final String fieldName,
            final String baseField) {
        VirtualFieldDef fieldDef = null;
        if (this.currencyVatParameters.isMcVatEnabled()) {
            // cost field name
            final String costField = this.currencyVatParameters.getCostFieldName(baseField);
            
            // currency field name
            final String currencyField =
                    costTable + "." + this.currencyVatParameters.getCurrencyFieldName();
            
            // exchange rate formula
            String exchangeRateFormula = "";
            if (costTable.equals("cost_tran_recur")) {
                exchangeRateFormula =
                        "${sql.exchangeRateFromField('" + currencyField + "', '"
                                + this.currencyVatParameters.getCurrencyCode() + "', '"
                                + this.currencyVatParameters.getExchangeRateType().toString()
                                + "')}";
            } else {
                exchangeRateFormula =
                        "${sql.exchangeRateFromFieldForDate('" + currencyField + "', '"
                                + this.currencyVatParameters.getCurrencyCode() + "', '"
                                + this.currencyVatParameters.getExchangeRateType().toString()
                                + "', '" + costTable + ".date_due' )}";
            }
            // field sql formula
            String fieldSqlFormula = "";
            if (SqlUtils.isSqlServer()) {
                fieldSqlFormula = "(" + costField + " * " + exchangeRateFormula + ")";
            } else {
                fieldSqlFormula = "SUM(" + costField + " * " + exchangeRateFormula + ")";
            }
            
            // field definition
            final Map<String, String> sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put("generic", fieldSqlFormula);
            
            fieldDef = new VirtualFieldDef(costTable, fieldName, DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
            
        } else {
            fieldDef =
                    new VirtualFieldDef(costTable, fieldName, DataSource.DATA_TYPE_NUMBER,
                        DataSourceGroupingImpl.FORMULA_SUM, costTable + "." + baseField);
        }
        return fieldDef;
    }
    
    /**
     * Groups costs by asset (building, property, lease, etc) and cost category ID, and calculates
     * total amount income and amount expense for each group.
     * 
     * @param assetKey Name of the asset field.
     * @param costTable Name of the cost table.
     * @param restriction Client console restriction.
     * @param dateFrom Date range to calculate totals for.
     * @param dateTo
     * @return List of records containing calculated totals.
     */
    private List<DataRecord> getTotalCostAmounts(final String assetKey, final String costTable,
            final String restriction, final Date dateFrom, final Date dateTo) {
        // we will be grouping cost records by asset key
        String groupByField = assetKey;
        if (groupByField.equalsIgnoreCase(CostProjection.ASSET_KEY_DEPARTMENT)) {
            groupByField = "dv_id, dp_id";
        }
        
        // we will be filtering out cost records that do not belong to specified asset (have NULL)
        final String notNullField = assetKey;
        
        final DataSourceGroupingImpl ds = new DataSourceGroupingImpl();
        ds.addTable(costTable);
        ds.addTable("cost_cat");
        ds.addTable("bl");
        ds.addTable("property");
        ds.setApplyVpaRestrictions(false);
        
        ds.addGroupByField(costTable, groupByField, DataSource.DATA_TYPE_TEXT);
        ds.addGroupByField(costTable, "cost_cat_id", DataSource.DATA_TYPE_TEXT);
        
        final VirtualFieldDef amountIncomeFieldDef =
                getSumVirtualField(costTable, "amount_income_total", "amount_income");
        final VirtualFieldDef amountExpenseFieldDef =
                getSumVirtualField(costTable, "amount_expense_total", "amount_expense");
        
        ds.addCalculatedField(amountIncomeFieldDef);
        ds.addCalculatedField(amountExpenseFieldDef);
        
        ds.addRestriction(Restrictions.isNotNull(costTable, notNullField));
        ds.addRestriction(Restrictions
            .sql("${sql.isNull('date_paid', 'date_due')} >= ${parameters['dateFrom']}"));
        ds.addRestriction(Restrictions
            .sql("${sql.isNull('date_paid', 'date_due')} <= ${parameters['dateTo']}"));
        
        if (StringUtil.notNullOrEmpty(restriction)) {
            ds.addRestriction(Restrictions.sql(restriction));
        }
        
        ds.addParameter("dateFrom", dateFrom, DataSource.DATA_TYPE_DATE);
        ds.addParameter("dateTo", dateTo, DataSource.DATA_TYPE_DATE);
        
        final List<DataRecord> costRecords = ds.getRecords();
        
        return costRecords;
    }
    
    /**
     * Groups costs by asset (building, property, lease, etc) and cost category ID, and calculates
     * total amount income and amount expense for each group.
     * 
     * @param assetKey Name of the asset field.
     * @param costTable Name of the cost table.
     * @param restriction Client console restriction.
     * @param dateFrom Date range to calculate totals for.
     * @param dateTo
     * @return List of records containing calculated totals.
     */
    private List<DataRecord> getTotalCostAmountsForSqlServer(final String assetKey,
            final String costTable, final String restriction, final Date dateFrom, final Date dateTo) {
        
        final String sqlQuery =
                buildCustomQueryForSqlServer(assetKey, costTable, restriction, dateFrom, dateTo);
        final DataSource totalCostDs = DataSourceFactory.createDataSource();
        totalCostDs.addTable(costTable);
        totalCostDs.addTable("cost_cat");
        totalCostDs.addTable("bl");
        totalCostDs.addTable("property");
        totalCostDs.setApplyVpaRestrictions(false);
        totalCostDs.addQuery(sqlQuery);
        totalCostDs.addVirtualField(costTable, assetKey, DataSource.DATA_TYPE_TEXT);
        totalCostDs.addVirtualField(costTable, "cost_cat_id", DataSource.DATA_TYPE_TEXT);
        totalCostDs.addVirtualField(costTable, "amount_income_total", DataSource.DATA_TYPE_NUMBER);
        totalCostDs.addVirtualField(costTable, "amount_expense_total", DataSource.DATA_TYPE_NUMBER);
        totalCostDs.addParameter("dateFrom", dateFrom, DataSource.DATA_TYPE_DATE);
        totalCostDs.addParameter("dateTo", dateTo, DataSource.DATA_TYPE_DATE);
        totalCostDs.setApplyVpaRestrictions(false);
        totalCostDs.addSort(costTable, assetKey);
        totalCostDs.addSort(costTable, "cost_cat_id");
        final List<DataRecord> costRecords = totalCostDs.getRecords();
        
        return costRecords;
    }
    
    /**
     * Updates total costs stored in the projection from cost records.
     * 
     * @param projection Cost projection to update.
     * @param calculationType Defines how to calculate totals - "netincome", "income", or "expense".
     * @param costTable Name of the cost table.
     * @param isGroupByCostCategory If true, group cost projection results by cost category.
     * @param restriction Client console restriction.
     * @param status Job status to update while the calculation is running.
     */
    private void updateProjectionFromCosts(final CostProjection projection,
            final String calculationType, final String costTable,
            final boolean isGroupByCostCategory, final String restriction, final JobStatus status) {
        
        status.setTotalNumber(projection.getNumberOfPeriods());
        int current = 0;
        status.setCurrentNumber(current);
        
        // we will iterate through the range of dates of this projection
        // starting at dateStart and incrementing by period
        final Calendar c = Calendar.getInstance();
        c.setTime(projection.getDateStart());
        
        while (c.getTime().before(projection.getDateEnd()) && !status.isStopRequested()) {
            // for each period, group cost records that match that period
            final Date dateFrom = c.getTime();
            final Period datePeriod = new Period(projection.getPeriod(), dateFrom);
            final Date dateTo = datePeriod.getDateEnd();
            
            // get total amounts for costs grouped by asset and cost category
            List<DataRecord> costRecords = null;
            if (SqlUtils.isSqlServer()) {
                costRecords =
                        getTotalCostAmountsForSqlServer(projection.getAssetKey(), costTable,
                            restriction, dateFrom, dateTo);
            } else {
                costRecords =
                        getTotalCostAmounts(projection.getAssetKey(), costTable, restriction,
                            dateFrom, dateTo);
            }
            
            // update projection costs
            for (final DataRecord costRecord : costRecords) {
                final String assetId =
                        costRecord.getString(costTable + "." + projection.getAssetKey());
                final String costCategoryId = costRecord.getString(costTable + ".cost_cat_id");
                final double amountIncome =
                        costRecord.getDouble(costTable + ".amount_income_total");
                final double amountExpense =
                        costRecord.getDouble(costTable + ".amount_expense_total");
                
                BigDecimal delta = new BigDecimal(0);
                if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
                    final BigDecimal incomeDelta = new BigDecimal(amountIncome);
                    delta = delta.add(incomeDelta);
                }
                if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
                    final BigDecimal expenseDelta = new BigDecimal(amountExpense);
                    delta = delta.subtract(expenseDelta);
                }
                
                if (isGroupByCostCategory) {
                    projection.updateCost(assetId, costCategoryId, dateFrom, delta.doubleValue());
                } else {
                    projection.updateCost(assetId, dateFrom, delta.doubleValue());
                }
            }
            
            // add month, quarter, year, or custom number of days
            datePeriod.addPeriodToCalendar(c);
            
            // update the job progress
            status.setCurrentNumber(++current);
        }
    }
    
    /**
     * Updates total costs stored in the projection from recurring cost records.
     * 
     * @param projection
     * @param calculationType
     * @param isGroupByCostCategory
     * @param additionalRestriction
     */
    private void updateProjectionFromRecurringCosts(final CostProjection projection,
            final String calculationType, final boolean isGroupByCostCategory,
            final String restriction, final JobStatus status) {
        final Set<Integer> recurringCostIds = new TreeSet<Integer>();
        
        final String assetKey = projection.getAssetKey();
        final Date dateStart = projection.getDateStart();
        final Date dateEnd = projection.getDateEnd();
        
        // load recurring cost rules for specified asset key and date range
        final List<RecurringCost> recurringCosts =
                this.recurringCostDataSource.findByAssetKeyAndDateRange(assetKey, dateStart,
                    dateEnd, restriction);
        
        // set the total job size = the number of recurring costs
        status.setTotalNumber(recurringCosts.size());
        
        int current = 0;
        status.setCurrentNumber(current);
        
        // for all applicable recurring costs
        for (final RecurringCost cost : recurringCosts) {
            if (status.isStopRequested()) {
                break;
            }
            // calculate/update income and expense for the asset referenced by the rule
            
            cost.calculateIncomeAndExpense(projection, calculationType, isGroupByCostCategory,
                this.currencyVatParameters.getCostType(),
                this.currencyVatParameters.getCurrencyCode(),
                this.currencyVatParameters.getCurrencyType(),
                this.currencyVatParameters.getExchangeRateType());
            // check for exchange rate error
            if (cost.isError()) {
                status.addProperty("missingExchangeRate", "true");
            }
            
            recurringCostIds.add(cost.getId());
            
            // update the job progress
            status.setCurrentNumber(++current);
        }
    }
}
