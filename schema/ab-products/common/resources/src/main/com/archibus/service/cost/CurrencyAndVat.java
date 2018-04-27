package com.archibus.service.cost;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.*;
import com.archibus.utility.StringUtil;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * <p>
 * Provides methods for Multi Currency and VAT.
 * </p>
 * 
 * @author Ioan Draghici
 *         <p>
 *         Suppress PMD Too many methods
 *         <p>
 *         Justification: KB 3038671 scheduled for Bali 2
 */
@SuppressWarnings("PMD.TooManyMethods")
public class CurrencyAndVat {
    
    /**
     * Field name: cost category id.
     */
    private static final String COST_CAT_ID_FIELD = "cost_cat_id";
    
    /**
     * Field name: currency_budget.
     */
    private static final String CURRENCY_BUDGET = "currency_budget";
    
    /**
     * Field name: currency_payment.
     */
    private static final String CURRENCY_PAYMENT = "currency_payment";
    
    /**
     * Field name: country id.
     */
    private static final String CTRY_ID_FIELD = "ctry_id";
    
    /**
     * Default value for exchange rate.
     */
    private static final double DEFAULT_EXCHANGE_RATE = 0.0;
    
    /**
     * Variable id.
     */
    private static final String EXECUTED_ID = "executed";
    
    /**
     * Variable id.
     */
    private static final String KEY_MESSAGE = "message";
    
    /**
     * Variable id.
     */
    private static final String KEY_RATE_BUDGET = "ExchangeRateBudget";
    
    /**
     * Variable id.
     */
    private static final String KEY_RATE_BUDGET_DATE = "DateUsedForExchangeRateBudget";
    
    /**
     * Variable id.
     */
    private static final String KEY_RATE_PAYMENT = "ExchangeRatePayment";
    
    /**
     * Variable id.
     */
    private static final String KEY_RATE_PAYMENT_DATE = "DateUsedForExchangeRatePayment";
    
    /**
     * Variable id.
     */
    private static final String KEY_VATPERCENT = "VATPercent";
    
    /**
     * Table name: lease.
     */
    private static final String LEASE_TABLE = "ls";
    
    /**
     * Field name: lease id.
     */
    private static final String LS_ID_FIELD = "ls_id";
    
    /**
     * Error message used when exchange rate is not defined.
     */
    // @translatable
    private static final String MESSAGE_EXCHANGE_RATE_NOT_DEFINED =
            "System Administrator is required to provide valid Conversion Factor for source units {0} and destination units {1} for both Exchange Rate Types (Budget and Payment) in AFM Conversions (afm_conversions) table.";
    
    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NO_COST_CATEG =
            "Unable to find VAT percent value, the Cost Category is not defined.";
    
    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NO_COUNTRY =
            "Unable to find VAT percent value, the User Country is not defined.";
    
    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NOT_DEFINED =
            "The system didn't find the VAT Percentage value for provided User Country and Cost Category. A value of 0.00 will be used instead.";
    
    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_UPDATE_LEGACY_COSTS =
            "You must run &quot;Updates to Legacy Costs&quot; from &quot;Define Exchange Rates&quot; or contact an Administrator.";
    
    /**
     * Recurring cost Pk field name.
     */
    private static final String RECUR_COST_ID_FIELD = "cost_tran_recur_id";
    
    /**
     * Recurring cost Pk field full name.
     */
    private static final String RECUR_COST_ID_FIELD_FULL = "cost_tran_recur.cost_tran_recur_id";
    
    /**
     * Scheduled cost Pk field name.
     */
    private static final String SCHED_COST_ID_FIELD = "cost_tran_sched_id";
    
    /**
     * Scheduled cost Pk field full name.
     */
    private static final String SCHED_COST_ID_FIELD_FULL = "cost_tran_sched.cost_tran_sched_id";
    
    /**
     * Table name: vat percent.
     */
    private static final String VAT_PERCENT_TABLE = "vat_percent";
    
    /**
     * Reference to custom actual cost data source.
     */
    private ICostDao<ActualCost> actualCostDataSource;
    
    /**
     * Reference to custom recurring cost data source.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Reference to custom scheduled cost data source.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;
    
    /**
     * Apply multicurrency updates to legacy data. Update actual, scheduled and recurring costs that
     * have currency budget and payment null.
     * 
     * @param status job status
     */
    public void applyCurrencyUpdatesToLegacyData(final JobStatus status) {
        final int totalNo = Integer.valueOf("100");
        status.setTotalNumber(totalNo);
        final String userCountry = ContextStore.get().getUser().getCountry();
        final String budgetCurrency = ContextStore.get().getProject().getBudgetCurrency().getCode();
        status.setCurrentNumber(Integer.valueOf("10"));
        
        // update actual costs
        if (status.isStopRequested()) {
            status.setCode(JobStatus.JOB_STOPPED);
        } else {
            applyCurrencyUpdatesToCosts(Constants.ACTUAL_COST_TABLE, budgetCurrency, userCountry);
            status.setCurrentNumber(Integer.valueOf("40"));
        }
        
        // update scheduled costs
        if (status.isStopRequested()) {
            status.setCode(JobStatus.JOB_STOPPED);
        } else {
            applyCurrencyUpdatesToCosts(Constants.SCHED_COST_TABLE, budgetCurrency, userCountry);
            status.setCurrentNumber(Integer.valueOf("70"));
        }
        
        // update recurring costs
        if (status.isStopRequested()) {
            status.setCode(JobStatus.JOB_STOPPED);
        } else {
            applyCurrencyUpdatesToCosts(Constants.RECUR_COST_TABLE, budgetCurrency, userCountry);
            status.setCode(JobStatus.JOB_COMPLETE);
            status.setCurrentNumber(totalNo);
        }
    }
    
    /**
     * Convert costs for VAT and MC.
     * 
     * @param costTable cost table
     * @param costId cost code
     * @return error message if exchange rate is not defined or null.
     */
    public String convertCost(final String costTable, final int costId) {
        initPerRequestState();
        final Date currentDate = new Date();
        String result = null;
        // get organization currency from activity parameters
        final String destinCurrency =
                com.archibus.service.Configuration.getActivityParameterString("AbCommonResources",
                    "BudgetCurrency");
        if (Constants.RECUR_COST_TABLE.equals(costTable)) {
            final RecurringCost recurringCost = this.recurringCostDataSource.get(costId);
            result = convertCost(recurringCost, currentDate, destinCurrency);
            if (result == null) {
                this.recurringCostDataSource.update(recurringCost);
            }
        } else if (Constants.SCHED_COST_TABLE.equals(costTable)) {
            final ScheduledCost scheduledCost = this.scheduledCostDataSource.get(costId);
            final Date dateDue = scheduledCost.getDateDue();
            // get minimum between current date and cost due date
            Date exchangeDate = currentDate;
            if (currentDate.after(dateDue)) {
                exchangeDate = dateDue;
            }
            result = convertCost(scheduledCost, exchangeDate, destinCurrency);
            if (result == null) {
                this.scheduledCostDataSource.update(scheduledCost);
            }
        }
        return result;
    }
    
    /**
     * Convert costs value according to conversion rate from afm_conversions.
     * 
     * @param allCosts if we must update all costs
     * @param newCost if we must update only new costs
     * @param date specified date
     * @param status job status
     */
    public void convertCosts(final boolean allCosts, final boolean newCost, final Date date,
            final JobStatus status) {
        // get scheduled costs
        final List<DataRecord> costs = new ArrayList<DataRecord>();
        final List<DataRecord> scheduledCosts =
                getCosts(allCosts, newCost, date, Constants.SCHED_COST_TABLE, "date_due",
                    SCHED_COST_ID_FIELD);
        costs.addAll(scheduledCosts);
        // get recurring costs
        final List<DataRecord> recurringCosts =
                getCosts(allCosts, newCost, date, Constants.RECUR_COST_TABLE, "date_end",
                    RECUR_COST_ID_FIELD);
        costs.addAll(recurringCosts);
        
        final int totalNo = costs.size();
        status.setTotalNumber(totalNo);
        int counter = 0;
        status.setCurrentNumber(counter);
        
        // update costs costs
        for (final DataRecord recCost : costs) {
            if (status.isStopRequested()) {
                status.setCode(JobStatus.JOB_STOPPED);
                break;
            } else {
                int costId;
                String costTable = null;
                if (recCost.valueExists(SCHED_COST_ID_FIELD_FULL)) {
                    costId = recCost.getInt(SCHED_COST_ID_FIELD_FULL);
                    costTable = Constants.SCHED_COST_TABLE;
                } else {
                    costId = recCost.getInt(RECUR_COST_ID_FIELD_FULL);
                    costTable = Constants.RECUR_COST_TABLE;
                }
                final String result = convertCost(costTable, costId);
                
                if (result == null) {
                    // we can continue
                    counter++;
                    status.setCurrentNumber(counter);
                } else {
                    // we must stop the job - exchange rate is missing
                    status.setCode(JobStatus.JOB_COMPLETE);
                    status.addProperty("noExchangeRate", result);
                    // status.setMessage(result);
                    status.setCurrentNumber(totalNo);
                    break;
                }
            }
        }
    }
    
    /**
     * Get exchange rate for specified date and currencies.
     * 
     * @param date conversion date
     * @param sourceCurrency source currency
     * @param destinCurrency destination currency
     * @return Map<String, Object> {DateUsedForExchangeRateBudget, ExchangeRateBudget,
     *         DateUsedForExchangeRatePayment, ExchangeRatePayment};
     */
    public Map<String, Object> getExchangeRate(final Date date, final String sourceCurrency,
            final String destinCurrency) {
        
        final Date defaultDate = java.sql.Date.valueOf("1900-01-01");
        String errorMessage = getLocalizedMessage(MESSAGE_EXCHANGE_RATE_NOT_DEFINED);
        errorMessage = errorMessage.replace("{0}", sourceCurrency);
        errorMessage = errorMessage.replace("{1}", destinCurrency);
        
        final Map<String, Object> exchangeRate = new HashMap<String, Object>();
        final CurrencyConversions currencyConverter = new CurrencyConversions();
        // get conversion rate for Exchange Rate Type Budget
        final CurrencyConversion budgetRate =
                currencyConverter.getCurrencyConversionForDate(sourceCurrency, destinCurrency,
                    ExchangeRateType.BUDGET, date);
        if (budgetRate == null) {
            // no currency defined
            exchangeRate.put(KEY_MESSAGE, errorMessage);
            exchangeRate.put(KEY_RATE_BUDGET_DATE, defaultDate);
            exchangeRate.put(KEY_RATE_BUDGET, DEFAULT_EXCHANGE_RATE);
        } else {
            exchangeRate.put(KEY_RATE_BUDGET_DATE, budgetRate.getConversionDate());
            exchangeRate.put(KEY_RATE_BUDGET, budgetRate.getConversionRate());
        }
        // get conversion rate for Exchange Rate Type Payment
        final CurrencyConversion paymentRate =
                currencyConverter.getCurrencyConversionForDate(sourceCurrency, destinCurrency,
                    ExchangeRateType.PAYMENT, date);
        if (paymentRate == null) {
            // no currency defined
            exchangeRate.put(KEY_MESSAGE, errorMessage);
            exchangeRate.put(KEY_RATE_PAYMENT_DATE, defaultDate);
            exchangeRate.put(KEY_RATE_PAYMENT, DEFAULT_EXCHANGE_RATE);
        } else {
            exchangeRate.put(KEY_RATE_PAYMENT_DATE, paymentRate.getConversionDate());
            exchangeRate.put(KEY_RATE_PAYMENT, paymentRate.getConversionRate());
        }
        return exchangeRate;
    }
    
    /**
     * Return VAT percent value for specified cost category and country.
     * 
     * @param costCategoryCode cost category code
     * @param countryCode country code
     * @param leaseCode lease code
     * @return JSON object {VATPercent, message}
     */
    public Map<String, Object> getVATPercent(final String costCategoryCode,
            final String countryCode, final String leaseCode) {
        
        // check is lease code is defined and vat is excluded for lease
        Double vatPercent = null;
        String message = null;
        
        if (isVatExcludedForLease(leaseCode)) {
            vatPercent = 0.0;
        } else if (StringUtil.isNullOrEmpty(countryCode)) {
            // if country code not defined send alert message and return null
            message = getLocalizedMessage(CurrencyAndVat.MESSAGE_VAT_NO_COUNTRY);
        } else if (StringUtil.isNullOrEmpty(costCategoryCode)) {
            // if cost category not defined send alert message and return null
            message = getLocalizedMessage(CurrencyAndVat.MESSAGE_VAT_NO_COST_CATEG);
        } else {
            final String[] fieldNames = { CTRY_ID_FIELD, COST_CAT_ID_FIELD, "vat_percent_value" };
            final DataSource dsVAT =
                    DataSourceFactory.createDataSourceForFields(VAT_PERCENT_TABLE, fieldNames);
            dsVAT.addRestriction(Restrictions.and(
                Restrictions.eq(VAT_PERCENT_TABLE, CTRY_ID_FIELD, countryCode),
                Restrictions.eq(VAT_PERCENT_TABLE, COST_CAT_ID_FIELD, costCategoryCode)));
            final DataRecord recVAT = dsVAT.getRecord();
            if (recVAT == null) {
                // send alert message to user
                message = getLocalizedMessage(CurrencyAndVat.MESSAGE_VAT_NOT_DEFINED);
                vatPercent = 0.0;
            } else {
                vatPercent = recVAT.getDouble("vat_percent.vat_percent_value");
            }
        }
        // prepare result object
        final Map<String, Object> result = new HashMap<String, Object>();
        if (vatPercent != null) {
            result.put(KEY_VATPERCENT, vatPercent);
        }
        if (message != null) {
            result.put(KEY_MESSAGE, message);
        }
        return result;
    }
    
    /**
     * Setter.
     * 
     * @param actualCostDataSource actual cost data source.
     */
    public void setActualCostDataSource(final ICostDao<ActualCost> actualCostDataSource) {
        this.actualCostDataSource = actualCostDataSource;
    }
    
    /**
     * Setter.
     * 
     * @param recurringCostDataSource recurring cost data source.
     */
    public void setRecurringCostDataSource(final ICostDao<RecurringCost> recurringCostDataSource) {
        this.recurringCostDataSource = recurringCostDataSource;
    }
    
    /**
     * Setter.
     * 
     * @param scheduledCostDataSource scheduled cost data source.
     */
    public void setScheduledCostDataSource(final ICostDao<ScheduledCost> scheduledCostDataSource) {
        this.scheduledCostDataSource = scheduledCostDataSource;
    }
    
    /**
     * Update VAT field values for costs.
     * 
     * @param costIds list of cost id's
     * @param costTypes list of cost types
     * @param status job status
     */
    public void updateCostRecords(final List<Integer> costIds, final List<String> costTypes,
            final JobStatus status) {
        initPerRequestState();
        final int totalNo = costIds.size();
        status.setTotalNumber(totalNo);
        for (int counter = 0; counter < totalNo; counter++) {
            if (status.isStopRequested()) {
                status.setCode(JobStatus.JOB_STOP_REQUESTED);
                status.setCurrentNumber(totalNo);
                break;
            }
            final int costId = costIds.get(counter);
            final String costType = costTypes.get(counter);
            
            // update VAT for cost
            final Map<String, Object> vatResult = calculateCost(costType, costId);
            // check if we must stop the job.
            if (!(Boolean) vatResult.get(EXECUTED_ID)) {
                status.setCode(JobStatus.JOB_FAILED);
                status.addProperty(KEY_MESSAGE, (String) vatResult.get(KEY_MESSAGE));
                status.setCurrentNumber(totalNo);
                break;
            }
            
            if (vatResult.containsKey(KEY_MESSAGE)) {
                status.addProperty(KEY_MESSAGE, (String) vatResult.get(KEY_MESSAGE));
            }
            
            // call convert cost method
            final String result = convertCost(costType, costId);
            // check if we must stop the job
            if (StringUtil.notNullOrEmpty(result)) {
                status.setCode(JobStatus.JOB_FAILED);
                status.addProperty(KEY_MESSAGE, result);
                status.setCurrentNumber(totalNo);
                break;
            }
            status.setCurrentNumber(counter + 1);
            if (counter == totalNo - 1) {
                status.setCurrentNumber(totalNo);
                status.setCode(JobStatus.JOB_COMPLETE);
            }
        }
    }
    
    /**
     * Check MC and VAT costs data integrity - if currencies are defined. Returns error message that
     * is displayed to user or empty string
     * 
     * @param fromActualCost if from actual costs
     * @param fromScheduledCosts is from scheduled costs
     * @param fromRecurringCosts is from recurring costs
     * @param isMcAndVatEnabled if MC and VAT is enabled
     * @return string
     */
    public String checkCostDataIntegrity(final boolean fromActualCost,
            final boolean fromScheduledCosts, final boolean fromRecurringCosts,
            final boolean isMcAndVatEnabled) {
        String result = "";
        if (isMcAndVatEnabled) {
            if (fromActualCost && existsCostsWithoutCurrency(Constants.ACTUAL_COST_TABLE)) {
                result = getLocalizedMessage(MESSAGE_UPDATE_LEGACY_COSTS);
            }
            if (fromScheduledCosts && existsCostsWithoutCurrency(Constants.SCHED_COST_TABLE)) {
                result = getLocalizedMessage(MESSAGE_UPDATE_LEGACY_COSTS);
            }
            if (fromRecurringCosts && existsCostsWithoutCurrency(Constants.RECUR_COST_TABLE)) {
                result = getLocalizedMessage(MESSAGE_UPDATE_LEGACY_COSTS);
            }
        }
        return result;
    }
    
    /**
     * Check if exists costs without currency.
     * 
     * @param tableName cost table name
     * @return boolean value
     */
    private boolean existsCostsWithoutCurrency(final String tableName) {
        final DataSource dsCosts = DataSourceFactory.createDataSource();
        dsCosts.addTable(tableName);
        dsCosts.addField(tableName, CURRENCY_BUDGET);
        dsCosts.addField(tableName, CURRENCY_PAYMENT);
        dsCosts.addRestriction(Restrictions.and(Restrictions.isNull(tableName, CURRENCY_BUDGET),
            Restrictions.isNull(tableName, CURRENCY_PAYMENT)));
        final List<DataRecord> records = dsCosts.getRecords();
        return !records.isEmpty();
    }
    
    /**
     * Apply currency updates to cost table. Perform a batch update on all costs that have currency
     * budget and payment null. We use SQL update because is faster.
     * 
     * <p>
     * Suppress PMD.AvoidUsingSql
     * <p>
     * Justification Case #2: Bulk Update
     * 
     * @param costTable cost table name.
     * @param currencyCode budget currency code
     * @param ctryCode country code
     * 
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void applyCurrencyUpdatesToCosts(final String costTable, final String currencyCode,
            final String ctryCode) {
        final String sqlUpdate =
                "UPDATE "
                        + costTable
                        + " SET "
                        + "currency_budget = "
                        + SqlUtils.formatValueForSql(currencyCode)
                        + ", currency_payment = "
                        + SqlUtils.formatValueForSql(currencyCode)
                        + ", exchange_rate_budget = 1, "
                        + "exchange_rate_payment = 1, date_used_for_mc_budget = ${sql.currentDate}, "
                        + "date_used_for_mc_payment = ${sql.currentDate}, ctry_id = "
                        + SqlUtils.formatValueForSql(ctryCode)
                        + ", amount_income_base_budget = amount_income, "
                        + "amount_expense_base_budget = amount_expense, "
                        + "amount_income_vat_budget = 0, amount_expense_vat_budget = 0, "
                        + "amount_income_total_payment = amount_income, "
                        + "amount_expense_total_payment = amount_expense, "
                        + "amount_income_base_payment = amount_income, "
                        + "amount_expense_base_payment = amount_expense, "
                        + "amount_income_vat_payment = 0, amount_expense_vat_payment = 0, "
                        + "exchange_rate_override = 1, vat_percent_value = 0, "
                        + "vat_percent_override = 0, vat_amount_override = 0 "
                        + "WHERE currency_budget IS NULL AND currency_payment IS NULL";
        SqlUtils.executeUpdate(costTable, sqlUpdate);
        
    }
    
    /**
     * Update VAT field values for cost record.
     * 
     * @param costTable cost table
     * @param costId cost code
     * @return Map
     */
    private Map<String, Object> calculateCost(final String costTable, final int costId) {
        Map<String, Object> result = new HashMap<String, Object>();
        boolean isVatExcluded = false;
        if (Constants.ACTUAL_COST_TABLE.equals(costTable)) {
            final ActualCost actualCost = this.actualCostDataSource.get(costId);
            result = updateVATForCost(actualCost);
            if ((Boolean) result.get(EXECUTED_ID)) {
                isVatExcluded = isVatExcludedForLease(actualCost.getLeaseId());
                actualCost.calculateVAT(isVatExcluded);
                actualCost.calculatePaymentTotals();
                this.actualCostDataSource.update(actualCost);
            }
        } else if (Constants.RECUR_COST_TABLE.equals(costTable)) {
            final RecurringCost recurringCost = this.recurringCostDataSource.get(costId);
            result = updateVATForCost(recurringCost);
            if ((Boolean) result.get(EXECUTED_ID)) {
                isVatExcluded = isVatExcludedForLease(recurringCost.getLeaseId());
                recurringCost.calculateVAT(isVatExcluded);
                recurringCost.calculatePaymentTotals();
                this.recurringCostDataSource.update(recurringCost);
            }
        } else if (Constants.SCHED_COST_TABLE.equals(costTable)) {
            final ScheduledCost scheduledCost = this.scheduledCostDataSource.get(costId);
            result = updateVATForCost(scheduledCost);
            if ((Boolean) result.get(EXECUTED_ID)) {
                isVatExcluded = isVatExcludedForLease(scheduledCost.getLeaseId());
                scheduledCost.calculateVAT(isVatExcluded);
                scheduledCost.calculatePaymentTotals();
                this.scheduledCostDataSource.update(scheduledCost);
            }
        }
        return result;
    }
    
    /**
     * Convert cost values according to conversion rate from afm_conversions.
     * 
     * @param cost cost record (scheduled or recurring cost)
     * @param calcDate date used for calculation
     * @param destinCurrency destination currency
     * @return error message if exchange rate is not defined or null
     */
    
    private String convertCost(final Cost cost, final Date calcDate, final String destinCurrency) {
        String result = null;
        String sourceCurrency = cost.getCurrencyPayment();
        double exchangeRateOverride = cost.getExchangeRateOverride();
        if (exchangeRateOverride == 1.0) {
            // this check must be removed
            if (StringUtil.isNullOrEmpty(sourceCurrency)) {
                sourceCurrency = destinCurrency;
                cost.setCurrencyPayment(sourceCurrency);
            }
            
            final Map<String, Object> exchangeRate =
                    getExchangeRate(calcDate, sourceCurrency, destinCurrency);
            if (exchangeRate.containsKey(KEY_MESSAGE)) {
                result = (String) exchangeRate.get(KEY_MESSAGE);
            } else {
                // calculate new costs
                cost.setCurrencyBudget(destinCurrency);
                cost.setExchangeRateBudget((Double) exchangeRate.get(KEY_RATE_BUDGET));
                cost.setDateUsedForMcBudget((Date) exchangeRate.get(KEY_RATE_BUDGET_DATE));
                cost.setExchangeRatePayment((Double) exchangeRate.get(KEY_RATE_PAYMENT));
                cost.setDateUsedForMcPayment((Date) exchangeRate.get(KEY_RATE_PAYMENT_DATE));
                cost.applyExchangeRate((Double) exchangeRate.get(KEY_RATE_BUDGET));
            }
        } else {
            // override value is specified
            if (sourceCurrency.equals(destinCurrency)) {
                exchangeRateOverride = 1.0;
            }
            // set calculation date
            cost.setDateUsedForMcBudget(calcDate);
            cost.setDateUsedForMcPayment(calcDate);
            // set exchange rates
            cost.setExchangeRateBudget(exchangeRateOverride);
            cost.setExchangeRatePayment(exchangeRateOverride);
            // apply new exchange rate value
            cost.applyExchangeRate(exchangeRateOverride);
        }
        return result;
    }
    
    /**
     * Get costs that need to be updated.
     * 
     * @param allCosts is we need to update all costs
     * @param newCost is we need only new costs
     * @param date specified date
     * @param tableName table name
     * @param dateField date field name
     * @param pkField primary key field
     * @return list of data records
     */
    private List<DataRecord> getCosts(final boolean allCosts, final boolean newCost,
            final Date date, final String tableName, final String dateField, final String pkField) {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(tableName);
        dataSource.addField(pkField);
        if (!allCosts) {
            dataSource.addRestriction(Restrictions.gt(tableName, dateField, date));
        }
        if (newCost) {
            dataSource.addRestriction(Restrictions.and(
                Restrictions.eq(tableName, "amount_income", 0.0),
                Restrictions.eq(tableName, "amount_expense", 0.0)));
        }
        return dataSource.getRecords();
    }
    
    /**
     * Return localized string.
     * 
     * @param message message id
     * @return localized string
     */
    private String getLocalizedMessage(final String message) {
        final ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        return EventHandlerBase.localizeString(context, message, this.getClass().getName());
    }
    
    /**
     * Initializes per-request state variables.
     * 
     * <p/>
     * Suppress CheckStyle duplicate code warning.
     * <p/>
     * Justification: initialize data sources for this class
     */
    private void initPerRequestState() {
        // CEHCKSTYLE: off
        if (this.actualCostDataSource == null) {
            this.actualCostDataSource = new ActualCostDataSource();
        }
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
        // CEHCKSTYLE: on
    }
    
    /**
     * Check if VAT is excluded for lease code.
     * 
     * @param lsId lease code
     * @return true/false if VAT
     */
    private boolean isVatExcludedForLease(final String lsId) {
        
        boolean result = false;
        if (StringUtil.notNullOrEmpty(lsId)) {
            final String[] fieldNames = { LS_ID_FIELD, "vat_exclude" };
            final DataSource dsLease =
                    DataSourceFactory.createDataSourceForFields(LEASE_TABLE, fieldNames);
            dsLease.addRestriction(Restrictions.eq(LEASE_TABLE, LS_ID_FIELD, lsId));
            final DataRecord rec = dsLease.getRecord();
            if (rec != null) {
                final int vatExclude = rec.getInt("ls.vat_exclude");
                result = vatExclude == 1;
            }
        }
        return result;
    }
    
    /**
     * Update VAT percent value for cost object.
     * 
     * @param cost cost object
     * @return JSONObject
     */
    private Map<String, Object> updateVATForCost(final Cost cost) {
        final Map<String, Object> result = new HashMap<String, Object>();
        
        final String leaseCode = cost.getLeaseId();
        final String costCategId = cost.getCostCategoryId();
        final String ctryCode = cost.getCtryId();
        final Map<String, Object> vatPercent = getVATPercent(costCategId, ctryCode, leaseCode);
        
        if (vatPercent.containsKey(KEY_VATPERCENT)) {
            final double vatPercentValue = (Double) vatPercent.get(KEY_VATPERCENT);
            cost.setVatPercentValue(vatPercentValue);
            result.put(EXECUTED_ID, true);
        } else {
            result.put(EXECUTED_ID, false);
        }
        
        boolean vatPercentOverrideOn = true;
        if (cost.getVatPercentOverride() == 0.0) {
            // vatPercentOverride is OFF
            vatPercentOverrideOn = false;
        }
        if (vatPercentOverrideOn) {
            cost.setVatPercentValue(cost.getVatPercentOverride());
            result.put(EXECUTED_ID, true);
        }
        
        if (vatPercent.containsKey(KEY_MESSAGE) && !vatPercentOverrideOn) {
            result.put(KEY_MESSAGE, vatPercent.get(KEY_MESSAGE));
        }
        return result;
    }
}
