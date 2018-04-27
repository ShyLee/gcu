package com.archibus.app.common.finance.domain;

import java.math.BigDecimal;
import java.util.Date;

import com.archibus.context.ContextStore;
import com.archibus.service.cost.*;

/**
 * Domain object for ScheduledCost.
 * <p>
 * Mapped to cost_tran_sched table.
 * 
 * @author Ioan Draghici
 * 
 *         <p>
 *         Suppress FindBugs warning "EQ_DOESNT_OVERRIDE_EQUALS" in this class.
 *         <p>
 *         Justification: The Cost.equals() method is appropiate for the ScheduledCost subclass. See
 *         Joshua Block, Effective Java, 2nd edition, page 34.
 */
@edu.umd.cs.findbugs.annotations.SuppressWarnings("EQ_DOESNT_OVERRIDE_EQUALS")
public class ScheduledCost extends Cost {
    
    /**
     * Class name constant.
     */
    static final String CLASS_SCHEDULED_COST = "ScheduledCost";
    
    /**
     * Date assessed.
     */
    private Date dateAssessed;
    
    /**
     * Date due.
     */
    private Date dateDue;
    
    /**
     * Date paid.
     */
    private Date datePaid;
    
    /**
     * Recurring cost code.
     */
    private int recurCostId;
    
    /**
     * Cost status.
     */
    private String status;
    
    // ----------------------- persistent state --------------------------------
    
    /**
     * Copies properties from.
     * 
     * @param recurringCost recurring cost code
     * @return scheduled cost
     */
    public static ScheduledCost createFromRecurringCost(final RecurringCost recurringCost) {
        final ScheduledCost scheduledCost = new ScheduledCost();
        
        scheduledCost.setAccountId(recurringCost.getAccountId());
        scheduledCost.setAssetName(recurringCost.getAssetName());
        scheduledCost.setBuildingId(recurringCost.getBuildingId());
        scheduledCost.setCostCategoryId(recurringCost.getCostCategoryId());
        scheduledCost.setRecurCostId(recurringCost.getId());
        scheduledCost.setDepartmentId(recurringCost.getDepartmentId());
        scheduledCost.setDescription(recurringCost.getDescription());
        scheduledCost.setDivisionId(recurringCost.getDivisionId());
        scheduledCost.setLeaseId(recurringCost.getLeaseId());
        scheduledCost.setOption1(recurringCost.getOption1());
        scheduledCost.setOption2(recurringCost.getOption2());
        scheduledCost.setParcelId(recurringCost.getParcelId());
        scheduledCost.setPropertyId(recurringCost.getPropertyId());
        
        scheduledCost.setCurrencyBudget(recurringCost.getCurrencyBudget());
        scheduledCost.setCurrencyPayment(recurringCost.getCurrencyPayment());
        
        scheduledCost.setExchangeRateBudget(recurringCost.getExchangeRateBudget());
        scheduledCost.setExchangeRatePayment(recurringCost.getExchangeRatePayment());
        scheduledCost.setDateUsedForMcBudget(recurringCost.getDateUsedForMcBudget());
        scheduledCost.setDateUsedForMcPayment(recurringCost.getDateUsedForMcPayment());
        
        scheduledCost.setExchangeRateOverride(recurringCost.getExchangeRateOverride());
        scheduledCost.setVatAmountOverride(recurringCost.getVatAmountOverride());
        scheduledCost.setVatPercentOverride(recurringCost.getVatPercentOverride());
        
        scheduledCost.setVatPercentValue(recurringCost.getVatPercentValue());
        scheduledCost.setCtryId(recurringCost.getCtryId());
        
        scheduledCost.setAmountIncomeBasePayment(recurringCost.getAmountIncomeBasePayment());
        scheduledCost.setAmountIncomeVatPayment(recurringCost.getAmountIncomeVatPayment());
        scheduledCost.setAmountIncomeTotalPayment(recurringCost.getAmountIncomeTotalPayment());
        
        scheduledCost.setAmountExpenseBasePayment(recurringCost.getAmountExpenseBasePayment());
        scheduledCost.setAmountExpenseVatPayment(recurringCost.getAmountExpenseVatPayment());
        scheduledCost.setAmountExpenseTotalPayment(recurringCost.getAmountExpenseTotalPayment());
        
        scheduledCost.setAmountIncomeBaseBudget(recurringCost.getAmountIncomeBaseBudget());
        scheduledCost.setAmountIncomeVatBudget(recurringCost.getAmountIncomeVatBudget());
        scheduledCost.setAmountIncome(recurringCost.getAmountIncome());
        
        scheduledCost.setAmountExpenseBaseBudget(recurringCost.getAmountExpenseBaseBudget());
        scheduledCost.setAmountExpenseVatBudget(recurringCost.getAmountExpenseVatBudget());
        scheduledCost.setAmountExpense(recurringCost.getAmountExpense());
        scheduledCost.setCamCost(recurringCost.getCamCost());
        
        return scheduledCost;
    }
    
    /**
     * Updates this scheduled cost income and expense from specified recurring cost for specified
     * date period.
     * 
     * @param recurringCost recurring cost
     * @param dateStart start date
     * @param dateNext next date
     * @param dateEnd end date
     */
    public void calculateIncomeAndExpense(final RecurringCost recurringCost, final Date dateStart,
            final Date dateNext, final Date dateEnd) {
        
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        
        BigDecimal amountIncome = BigDecimal.ZERO;
        BigDecimal amountExpense = BigDecimal.ZERO;
        
        if (isMcAndVatEnabled) {
            amountIncome = new BigDecimal(recurringCost.getAmountIncomeBasePayment());
            amountExpense = new BigDecimal(recurringCost.getAmountExpenseBasePayment());
        } else {
            amountIncome = new BigDecimal(recurringCost.getAmountIncome());
            amountExpense = new BigDecimal(recurringCost.getAmountExpense());
        }
        
        // apply yearly factor
        final BigDecimal yearlyFactorEscalation =
                new BigDecimal(recurringCost.calculateYearlyFactorEscalation(dateNext));
        amountIncome = amountIncome.multiply(yearlyFactorEscalation);
        amountExpense = amountExpense.multiply(yearlyFactorEscalation);
        
        // apply monthly factor
        final BigDecimal monthlyFactorEscalation =
                new BigDecimal(RecurringCost.MONTHLY_FACTOR_ESCALATION);
        amountIncome = amountIncome.multiply(monthlyFactorEscalation);
        amountExpense = amountExpense.multiply(monthlyFactorEscalation);
        
        // update the values in this cost object
        if (isMcAndVatEnabled) {
            setAmountExpenseBasePayment(amountExpense.doubleValue());
            setAmountIncomeBasePayment(amountIncome.doubleValue());
        } else {
            setAmountExpense(amountExpense.doubleValue());
            setAmountIncome(amountIncome.doubleValue());
        }
    }
    
    /**
     * Calculate income and expense for cost.
     * 
     * @param calculationType calculation type
     * @param isMcAndVatEnabled multicurrency and vat enabled
     * @param currencyParameters currency request parameters
     * @param vatParameters vat request parameters
     * @return double value
     */
    public double calculateIncomeAndExpense(final String calculationType,
            final boolean isMcAndVatEnabled, final CurrencyUtilities currencyParameters,
            final VatUtilities vatParameters) {
        
        final double exchangeRate = getExchangeRate(isMcAndVatEnabled, currencyParameters);
        
        final BigDecimal amountIncome =
                new BigDecimal(getIncomeAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParameters.getCurrencyType()), vatParameters
                        .getVatType().toString()));
        final BigDecimal amountExpense =
                new BigDecimal(getExpenseAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParameters.getCurrencyType()), vatParameters
                        .getVatType().toString()));
        BigDecimal delta = BigDecimal.ZERO;
        if (!calculationType.equals(CostProjection.CALCTYPE_EXPENSE)) {
            delta = delta.add(amountIncome);
        }
        if (!calculationType.equals(CostProjection.CALCTYPE_INCOME)) {
            delta = delta.subtract(amountExpense);
        }
        
        // apply exchange rate
        delta = delta.multiply(new BigDecimal(exchangeRate));
        
        return delta.doubleValue();
    }
    
    // ----------------------- getters and setters -----------------------------
    
    /**
     * Getter.
     * 
     * @return date assessed
     */
    public Date getDateAssessed() {
        return this.dateAssessed;
    }
    
    /**
     * Getter.
     * 
     * @return date due
     */
    public Date getDateDue() {
        return this.dateDue;
    }
    
    /**
     * Getter.
     * 
     * @return date paid
     */
    public Date getDatePaid() {
        return this.datePaid;
    }
    
    /**
     * Getter.
     * 
     * @return recurring cost id
     */
    public int getRecurCostId() {
        return this.recurCostId;
    }
    
    /**
     * Getter.
     * 
     * @return cost status
     */
    public String getStatus() {
        return this.status;
    }
    
    /**
     * Setter.
     * 
     * @param dateAssessed date assessed
     */
    public void setDateAssessed(final Date dateAssessed) {
        this.dateAssessed = dateAssessed;
    }
    
    /**
     * Setter.
     * 
     * @param dateDue date due
     */
    public void setDateDue(final Date dateDue) {
        this.dateDue = dateDue;
    }
    
    /**
     * Setter.
     * 
     * @param datePaid date paid
     */
    public void setDatePaid(final Date datePaid) {
        this.datePaid = datePaid;
    }
    
    /**
     * Setter.
     * 
     * @param recurCostId recurring cost code
     */
    public void setRecurCostId(final int recurCostId) {
        this.recurCostId = recurCostId;
    }
    
    /**
     * Setter.
     * 
     * @param status cost status
     */
    public void setStatus(final String status) {
        this.status = status;
    }
    
    @Override
    public String getCostClass() {
        return CLASS_SCHEDULED_COST;
    }
}
