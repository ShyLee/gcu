package com.archibus.app.common.finance.domain;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.config.*;
import com.archibus.service.Period;
import com.archibus.service.cost.*;
import com.archibus.utility.*;

/**
 * Domain object for RecurringCost.
 * <p>
 * Mapped to cost_tran_recur table.
 * 
 * @author Ioan Draghici
 *         <p>
 *         Suppress FindBugs warning "EQ_DOESNT_OVERRIDE_EQUALS" in this class.
 *         <p>
 *         Justification: The Cost.equals() method is appropiate for the RecurringCost subclass. See
 *         Joshua Block, Effective Java, 2nd edition, page 34.
 */
@edu.umd.cs.findbugs.annotations.SuppressWarnings("EQ_DOESNT_OVERRIDE_EQUALS")
public class RecurringCost extends Cost {
    
    /**
     * Class name constant.
     */
    static final String CLASS_RECURRING_COST = "RecurringCost";
    
    /**
     * Ls table name constant.
     */
    static final String LS_TABLE = "ls";
    
    /**
     * ls_id field name constant.
     */
    static final String LS_ID = "ls_id";
    
    /**
     * date_end field name constant.
     */
    static final String DATE_END = "date_end";
    
    /**
     * Constant.
     */
    static final double MONTHLY_FACTOR_ESCALATION = 1.0;
    
    // ----------------------- persistent state --------------------------------
    /**
     * Properties for cost calculation.
     */
    private Configuration configuration;
    
    /**
     * Field.
     */
    private Date dateEnd;
    
    /**
     * Field.
     */
    private Date dateSeasonalEnd;
    
    /**
     * Field.
     */
    private Date dateSeasonalStart;
    
    /**
     * Field.
     */
    private Date dateStart;
    
    /**
     * Field.
     */
    private String period;
    
    /**
     * Field.
     */
    private int periodCustom;
    
    /**
     * Field.
     */
    private double yearlyFactor;
    
    /**
     * Field.
     */
    private int statusActive;
    
    /**
     * Field.
     */
    private boolean isErrorOnCost;
    
    /**
     * Cost summarized amount.
     */
    private BigDecimal summarizedAmount = BigDecimal.ZERO;
    
    // ----------------------- business methods --------------------------------
    
    /**
     * Updates income and expense in specific projection for the asset and date period of this rule.
     * 
     * @param projection The cost projection to update.
     * @param calculationType The calculation type (net income, income, or expense).
     * @param isGroupByCostCategory Whether to group costs by cost category. If false, costs will
     *            only be grouped by the asset.
     * @param costType cost type (base, total, vat)
     * @param displayCurrency display currency
     * @param currencyType currency type (budget, user or custom)
     * @param exchangeRateType exchange rate type (budget or payment)
     */
    // CHECKSTYLE:OFF : Justification: Disable for Bali 1 - must be refactored.
    public void calculateIncomeAndExpense(final CostProjection projection,
            final String calculationType, final boolean isGroupByCostCategory,
            final String costType, final String displayCurrency, final String currencyType,
            final ExchangeRateType exchangeRateType) {
        
        // get the ID value of the asset used in the projection (e.q. specific property ID)
        final String assetId = getAssetId(projection.getAssetKey());
        
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        
        final String sourceCurrency = getSourceCurrency(currencyType);
        
        // we must get the exchange rate here
        final double exchangeRate =
                getExchangeRate(isMcAndVatEnabled, sourceCurrency, displayCurrency,
                    exchangeRateType);
        
        final boolean isBudgetCurrency = Constants.CURRENCY_TYPE_BUDGET.equals(currencyType);
        
        final BigDecimal amountIncome =
                new BigDecimal(getIncomeAmount(isMcAndVatEnabled, isBudgetCurrency, costType));
        final BigDecimal amountExpense =
                new BigDecimal(getExpenseAmount(isMcAndVatEnabled, isBudgetCurrency, costType));
        
        final Date changeOverDate = getChangeOverDate();
        final Period recurringPeriod = getRecurringPeriod();
        
        final Date currentDateEnd = getCurrentDateEnd(projection, assetId);
        
        recurringPeriod.iterate(changeOverDate, currentDateEnd, new Period.Callback() {
            public boolean call(final Date dateNext) {
                // check if the date falls into seasonal range
                if (!isOutOfSeason(dateNext)) {
                    
                    final BigDecimal yearlyFactorEscalation =
                            new BigDecimal(calculateYearlyFactorEscalation(dateNext));
                    final BigDecimal monthlyFactorEscalation =
                            new BigDecimal(RecurringCost.MONTHLY_FACTOR_ESCALATION);
                    
                    BigDecimal delta = BigDecimal.ZERO;
                    if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
                        BigDecimal incomeDelta = amountIncome.multiply(yearlyFactorEscalation);
                        incomeDelta = incomeDelta.multiply(monthlyFactorEscalation);
                        delta = delta.add(incomeDelta);
                    }
                    if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
                        BigDecimal expenseDelta = amountExpense.multiply(yearlyFactorEscalation);
                        expenseDelta = expenseDelta.multiply(monthlyFactorEscalation);
                        delta = delta.subtract(expenseDelta);
                    }
                    
                    // apply exchange rate
                    delta = delta.multiply(new BigDecimal(exchangeRate));
                    
                    if (isGroupByCostCategory) {
                        projection.updateCost(assetId, getCostCategoryId(), dateNext,
                            delta.doubleValue());
                    } else {
                        projection.updateCost(assetId, dateNext, delta.doubleValue());
                    }
                }
                return true;
            }
        });
    }
    
    /**
     * Getter for the summarizedAmount property.
     * 
     * @see summarizedAmount
     * @return the summarizedAmount property.
     */
    public BigDecimal getSummarizedAmount() {
        return this.summarizedAmount;
    }
    
    /**
     * Calculate income and expense for entire cost durations.
     * 
     * @param calculationType calculation type INCOME, EXPENSE, NETINCOME
     * @param endDate projection end date
     * @param isMcAndVatEnabled multi currency and vat enabled
     * @param currencyParams multi currency parameters
     * @param vatParams vat parameters
     */
    public void calculateIncomeAndExpense(final String calculationType, final Date endDate,
            final boolean isMcAndVatEnabled, final CurrencyUtilities currencyParams,
            final VatUtilities vatParams) {
        
        calculateIncomeAndExpense(calculationType, getChangeOverDate(), endDate, isMcAndVatEnabled,
            currencyParams, vatParams);
    }
    
    /**
     * Calculate income and expense for specified interval.
     * 
     * @param calculationType calculation type
     * @param startDate interval start
     * @param endDate interval end
     * @param isMcAndVatEnabled multi currency and vat enabled
     * @param currencyParams multi currency parameters
     * @param vatParams vat parameters
     */
    public void calculateIncomeAndExpense(final String calculationType, final Date startDate,
            final Date endDate, final boolean isMcAndVatEnabled,
            final CurrencyUtilities currencyParams, final VatUtilities vatParams) {
        final double exchangeRate = getExchangeRate(isMcAndVatEnabled, currencyParams);
        final BigDecimal amountIncome =
                new BigDecimal(getIncomeAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParams.getCurrencyType()), vatParams
                        .getVatType().toString()));
        final BigDecimal amountExpense =
                new BigDecimal(getExpenseAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParams.getCurrencyType()), vatParams
                        .getVatType().toString()));
        
        final Period recurringPeriod = getRecurringPeriod();
        Date recurringDateStart = startDate;
        if (this.dateStart.after(startDate)) {
            recurringDateStart = this.dateStart;
        }
        Date recurringEndDate = endDate;
        if (this.dateEnd != null && this.dateEnd.before(endDate)) {
            recurringEndDate = this.dateEnd;
        }
        
        recurringPeriod.iterate(recurringDateStart, recurringEndDate, new Period.Callback() {
            
            public boolean call(final Date dateNext) {
                // check if the date falls into seasonal range
                if (!isOutOfSeason(dateNext)) {
                    
                    final BigDecimal yearlyFactorEscalation =
                            new BigDecimal(calculateYearlyFactorEscalation(dateNext));
                    final BigDecimal monthlyFactorEscalation =
                            new BigDecimal(RecurringCost.MONTHLY_FACTOR_ESCALATION);
                    
                    BigDecimal delta = BigDecimal.ZERO;
                    if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
                        BigDecimal incomeDelta = amountIncome.multiply(yearlyFactorEscalation);
                        incomeDelta = incomeDelta.multiply(monthlyFactorEscalation);
                        delta = delta.add(incomeDelta);
                    }
                    if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
                        BigDecimal expenseDelta = amountExpense.multiply(yearlyFactorEscalation);
                        expenseDelta = expenseDelta.multiply(monthlyFactorEscalation);
                        delta = delta.subtract(expenseDelta);
                    }
                    
                    // apply exchange rate
                    delta = delta.multiply(new BigDecimal(exchangeRate));
                    
                    updateSummarizedAmount(delta);
                }
                return true;
            }
        });
    }
    
    // CHECKSTYLE:ON
    
    /**
     * Get date for occurrence number.
     * 
     * @param occurenceNo occurrence number
     * @return date
     */
    public Date getDateForOccurence(final int occurenceNo) {
        Date result = getDateStart();
        for (int index = 0; index < occurenceNo; index++) {
            final Date occurenceDate = Period.incrementDate(result, getPeriod(), 1);
            if (StringUtil.notNullOrEmpty(getDateEnd()) && occurenceDate.after(getDateEnd())) {
                break;
            } else {
                result = occurenceDate;
            }
        }
        return result;
    }
    
    /**
     * Obtain the end date of the recurring cost.
     * 
     * @param projection The cost projection to update.
     * @param assetId The ID value of the asset used in the projection
     * @return end date
     */
    private Date getCurrentDateEnd(final CostProjection projection, final String assetId) {
        getDateAfterEnd();
        
        Date dateEndRecurring = this.dateEnd;
        if (dateEndRecurring == null || projection.getDateEnd().before(dateEndRecurring)) {
            dateEndRecurring = projection.getDateEnd();
        }
        
        Date currentDateEnd = dateEndRecurring;
        
        Date leaseExpirationDate = null;
        if (LS_ID.equals(projection.getAssetKey())) {
            leaseExpirationDate = getLeaseExpirationDate(assetId);
        }
        
        if (leaseExpirationDate != null && leaseExpirationDate.before(dateEndRecurring)) {
            currentDateEnd = leaseExpirationDate;
        }
        
        return currentDateEnd;
    }
    
    /**
     * Get lease expiration date.
     * 
     * @param lsId Lease id
     * @return lease Expiration date
     */
    private Date getLeaseExpirationDate(final String lsId) {
        final String[] fields = { LS_ID, DATE_END };
        
        final DataSource lsDs = DataSourceFactory.createDataSourceForFields(LS_TABLE, fields);
        lsDs.addRestriction(Restrictions.eq(LS_TABLE, LS_ID, lsId));
        
        final DataRecord record = lsDs.getRecord();
        
        return record.getDate(LS_TABLE + "." + DATE_END);
    }
    
    /**
     * Returns the escalation factor based on the Recurring Cost Yearly Factor.
     * 
     * @param date date value
     * @return double, yearly factor
     */
    public double calculateYearlyFactorEscalation(final Date date) {
        
        // No escalation by default
        double escalation = 1;
        
        // Only apply escalation if the yearly factor is greater than 1
        if (this.yearlyFactor > 1) {
            
            // Get the number of years between the beginning of costs and the current period
            final int months = DateTime.getElapsedMonths(date, this.dateStart);
            int years = months / Constants.MONTH_NO;
            
            // Get calendar for date of the start of a new financial year (year from (date) and
            // month and day from afm_scmpref)
            final Calendar fiscalYearStartCalendar = Calendar.getInstance();
            fiscalYearStartCalendar.setTime(date);
            fiscalYearStartCalendar.set(Calendar.MONTH,
                this.configuration.getFiscalYearStartMonth() - 1);
            fiscalYearStartCalendar.set(Calendar.DAY_OF_MONTH,
                this.configuration.getFiscalYearStartDay());
            
            if (!this.configuration.isApplyYearlyFactorAtAnniversary()
                    && !date.before(fiscalYearStartCalendar.getTime())) {
                // If the cost is on or after the start of the new financial year then add a year
                years++;
            }
            
            // Multiply number of years by the percentage escalation amount
            if (years > 0) {
                escalation = java.lang.Math.pow(this.yearlyFactor, years);
            }
        }
        return escalation;
    }
    
    /**
     * Determines the date to start calculating recurring costs from, based on last date a cost or
     * scheduled cost was created for.
     * 
     * @return date value
     */
    public Date getChangeOverDate() {
        final Period currentPeriod = getRecurringPeriod();
        Date changeOverDate = currentPeriod.getDateStart();
        
        final Date dateLastScheduled =
                DataStatistics.getDate("cost_tran_sched", Constants.DATE_DUE, Constants.MAX,
                    Restrictions.sql("cost_tran_sched.cost_tran_recur_id = " + getId()));
        
        final Date dateLastCost =
                DataStatistics.getDate("cost_tran", Constants.DATE_DUE, Constants.MAX,
                    Restrictions.sql("cost_tran.cost_tran_recur_id = " + getId()));
        
        // compare the two dates to find most recent or at least non-null value
        Date dateLastRecurringScheduled = null;
        
        if (StringUtil.notNullOrEmpty(dateLastScheduled) && StringUtil.notNullOrEmpty(dateLastCost)) {
            if (dateLastScheduled.after(dateLastCost)) {
                dateLastRecurringScheduled = dateLastScheduled;
            } else {
                dateLastRecurringScheduled = dateLastCost;
            }
        } else if (StringUtil.notNullOrEmpty(dateLastScheduled)
                && !dateLastScheduled.before(currentPeriod.getDateStart())) {
            dateLastRecurringScheduled = dateLastScheduled;
        } else if (StringUtil.notNullOrEmpty(dateLastCost)
                && !dateLastCost.before(currentPeriod.getDateStart())) {
            // KB 3033342 changed dateLastCost.after() to !dateLastCost.before()
            dateLastRecurringScheduled = dateLastCost;
        }
        
        // if this recur cost had any costs ever created, then add an increment, of the interval
        // and increment specified in the recur record, to the last date this recurring cost had a
        // cost or scheduled cost created.
        if (dateLastRecurringScheduled != null) {
            changeOverDate = currentPeriod.addPeriodToDate(dateLastRecurringScheduled);
        }
        
        return changeOverDate;
    }
    
    /**
     * @return the configuration
     */
    public Configuration getConfiguration() {
        return this.configuration;
    }
    
    /**
     * Returns the next date after dateEnd.
     * 
     * @return date value
     */
    public Date getDateAfterEnd() {
        Date date = null;
        if (this.dateEnd != null) {
            final Calendar calendar = Calendar.getInstance();
            calendar.setTime(this.dateEnd);
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            date = calendar.getTime();
        }
        return date;
    }
    
    // ----------------------- getters and setters -----------------------------
    
    /**
     * Getter.
     * 
     * @return date value
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * Getter.
     * 
     * @return date value
     */
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    /**
     * Getter.
     * 
     * @return date value
     */
    public Date getDateSeasonalEnd() {
        return this.dateSeasonalEnd;
    }
    
    /**
     * Getter.
     * 
     * @return date value
     */
    public Date getDateSeasonalStart() {
        return this.dateSeasonalStart;
    }
    
    /**
     * Return period.
     * 
     * @return string
     */
    public String getPeriod() {
        return this.period;
    }
    
    /**
     * Return custom period.
     * 
     * @return string
     */
    public int getPeriodCustom() {
        return this.periodCustom;
    }
    
    /**
     * Returns the recurring period for this cost.
     * 
     * @return period object
     */
    public Period getRecurringPeriod() {
        return new Period(getPeriod(), getPeriodCustom(), getDateStart());
    }
    
    /**
     * Return yearly factor.
     * 
     * @return string
     */
    public double getYearlyFactor() {
        return this.yearlyFactor;
    }
    
    /**
     * Set cost active or not.
     * 
     * @param active new active status
     */
    public void setCostActive(final boolean active) {
        if (active) {
            this.statusActive = 1;
        } else {
            this.statusActive = 0;
        }
    }
    
    /**
     * Returns true if specified date is outside of the season defined by dateSeasonalStart and
     * dateSeasonalEnd properties. If these properties' values are NULLs, any date is considered to
     * be within season.
     * <p>
     * For "winter" season dateSeasonalStart (November 1) is later then dateSeasonalEnd (March 31).
     * 
     * @param date date value
     * @return boolean value
     */
    public boolean isOutOfSeason(final Date date) {
        boolean outOfSeason = false;
        
        if (this.dateSeasonalStart != null && this.dateSeasonalEnd != null) {
            // Get a calendar object for the current period we are iterating
            // over
            final Calendar crtPeriod = Calendar.getInstance();
            crtPeriod.setTime(date);
            
            // Get a calendar for the Seasonal Start date and
            // Set the calendar's year = year value of period we are iterating
            // over
            final Calendar periodSeasonalStart = Calendar.getInstance();
            periodSeasonalStart.setTime(this.dateSeasonalStart);
            periodSeasonalStart.set(Calendar.YEAR, crtPeriod.get(Calendar.YEAR));
            
            // Get a calendar for the Seasonal End date and
            // Set the calendar's year = year value of period we are iterating
            // over
            final Calendar periodSeasonalEnd = Calendar.getInstance();
            periodSeasonalEnd.setTime(this.dateSeasonalEnd);
            periodSeasonalEnd.set(Calendar.YEAR, crtPeriod.get(Calendar.YEAR));
            
            // 12/17/2012 IOAN Kb 3037539 we must compare period seasonal dates not original dates
            if (periodSeasonalStart.before(periodSeasonalEnd)) {
                // summer season
                outOfSeason =
                        date.before(periodSeasonalStart.getTime())
                                || date.after(periodSeasonalEnd.getTime());
            } else {
                // winter season
                outOfSeason =
                        date.before(periodSeasonalStart.getTime())
                                && date.after(periodSeasonalEnd.getTime());
            }
        }
        
        return outOfSeason;
    }
    
    /**
     * @param configuration the configuration to set
     */
    public void setConfiguration(final Configuration configuration) {
        this.configuration = configuration;
    }
    
    /**
     * Set end date.
     * 
     * @param dateEnd current end date
     */
    public void setDateEnd(final Date dateEnd) {
        // if dateEnd is not supplied, use default value from Configuration
        if (dateEnd == null) {
            this.dateEnd = this.configuration.getDefaultDateEnd();
        } else {
            this.dateEnd = dateEnd;
        }
    }
    
    /**
     * Set seasonal end date.
     * 
     * @param dateSeasonalEnd new value
     */
    public void setDateSeasonalEnd(final Date dateSeasonalEnd) {
        this.dateSeasonalEnd = dateSeasonalEnd;
    }
    
    /**
     * Set seasonal start date.
     * 
     * @param dateSeasonalStart new value
     */
    public void setDateSeasonalStart(final Date dateSeasonalStart) {
        this.dateSeasonalStart = dateSeasonalStart;
    }
    
    /**
     * Set start date.
     * 
     * @param dateStart new value
     */
    public void setDateStart(final Date dateStart) {
        // if dateStart is not supplied, use default value from Configuration
        if (dateStart == null) {
            this.dateStart = this.configuration.getDefaultDateStart();
        } else {
            this.dateStart = dateStart;
        }
    }
    
    /**
     * Set period.
     * 
     * @param period new value
     */
    public void setPeriod(final String period) {
        this.period = period;
    }
    
    /**
     * Set period custom.
     * 
     * @param periodCustom new value
     */
    public void setPeriodCustom(final int periodCustom) {
        this.periodCustom = periodCustom;
    }
    
    /**
     * Set yearly factor.
     * 
     * @param yearlyFactor new value
     */
    public void setYearlyFactor(final double yearlyFactor) {
        this.yearlyFactor = yearlyFactor;
    }
    
    /**
     * @return the isMissingExchangeRate
     */
    public boolean isError() {
        return this.isErrorOnCost;
    }
    
    /**
     * Getter for the statusActive property.
     * 
     * @see statusActive
     * @return the statusActive property.
     */
    public int getStatusActive() {
        return this.statusActive;
    }
    
    /**
     * Setter for the statusActive property.
     * 
     * @see statusActive
     * @param statusActive the statusActive to set
     */
    
    public void setStatusActive(final int statusActive) {
        this.statusActive = statusActive;
    }
    
    @Override
    public String toString() {
        return MessageFormat.format("{0}, start [{1}], end [{2}]", new Object[] { super.toString(),
                this.dateStart, this.dateEnd });
    }
    
    /**
     * Get exchange rate for current cost.
     * 
     * @param isMcVatEnabled is Mc and VAT enabled ?
     * @param sourceCurrency source currency
     * @param targetCurrency target currency
     * @param exchangeRateType exchange rate type budget or payment
     * @return double
     */
    private double getExchangeRate(final Boolean isMcVatEnabled, final String sourceCurrency,
            final String targetCurrency, final ExchangeRateType exchangeRateType) {
        double result = 1;
        if (isMcVatEnabled) {
            final CurrencyConversions currencyConverter = new CurrencyConversions();
            // get conversion rate for Exchange Rate Type Budget
            final CurrencyConversion conversionRate =
                    currencyConverter.getCurrencyConversionForDate(sourceCurrency, targetCurrency,
                        exchangeRateType, new Date());
            if (conversionRate == null) {
                this.isErrorOnCost = true;
            } else {
                result = conversionRate.getConversionRate();
            }
        }
        return result;
    }
    
    /**
     * Update summarized cost amount.
     * 
     * @param addAmount amount to add
     */
    private void updateSummarizedAmount(final BigDecimal addAmount) {
        this.summarizedAmount = this.summarizedAmount.add(addAmount);
    }
    
    @Override
    public String getCostClass() {
        return CLASS_RECURRING_COST;
    }
}
