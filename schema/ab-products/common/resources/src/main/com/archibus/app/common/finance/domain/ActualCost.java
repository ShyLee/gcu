package com.archibus.app.common.finance.domain;

import java.math.BigDecimal;

import com.archibus.context.ContextStore;
import com.archibus.service.cost.*;

/**
 * Domain object for ActualCost.
 * <p>
 * Mapped to cost_tran table.
 * 
 * @author Ioan Draghici
 * 
 *         <p>
 *         Suppress FindBugs warning "EQ_DOESNT_OVERRIDE_EQUALS" in this class.
 *         <p>
 *         Justification: The Cost.equals() method is appropiate for the ActualCost subclass. See
 *         Joshua Block, Effective Java, 2nd edition, page 34.
 */
@edu.umd.cs.findbugs.annotations.SuppressWarnings("EQ_DOESNT_OVERRIDE_EQUALS")
public class ActualCost extends ScheduledCost {
    
    /**
     * Class name constant.
     */
    static final String CLASS_ACTUAL_COST = "ActualCost";
    
    // ----------------------- persistent state --------------------------------
    /**
     * Store charge back status for current actual cost.
     */
    private String chargebackStatus;
    
    /**
     * Invoice code of actual cost.
     */
    private Integer invoiceId;
    
    /**
     * Copy properties from scheduled cost.
     * 
     * @param scheduledCost scheduled cost
     * @return actual cost
     */
    public static ActualCost createFromScheduledCost(final ScheduledCost scheduledCost) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        final ActualCost actualCost = new ActualCost();
        
        actualCost.setDatePaid(scheduledCost.getDatePaid());
        actualCost.setAccountId(scheduledCost.getAccountId());
        actualCost.setAmountExpense(scheduledCost.getAmountExpense());
        actualCost.setAmountIncome(scheduledCost.getAmountIncome());
        actualCost.setBuildingId(scheduledCost.getBuildingId());
        actualCost.setCostCategoryId(scheduledCost.getCostCategoryId());
        actualCost.setDateAssessed(scheduledCost.getDateAssessed());
        actualCost.setDateDue(scheduledCost.getDateDue());
        actualCost.setDepartmentId(scheduledCost.getDepartmentId());
        actualCost.setDescription(scheduledCost.getDescription());
        actualCost.setDivisionId(scheduledCost.getDivisionId());
        actualCost.setLeaseId(scheduledCost.getLeaseId());
        actualCost.setParcelId(scheduledCost.getParcelId());
        actualCost.setPropertyId(scheduledCost.getPropertyId());
        actualCost.setCamCost(scheduledCost.getCamCost());
        actualCost.setRecurCostId(scheduledCost.getRecurCostId());
        
        if (isMcAndVatEnabled) {
            actualCost.setAmountIncomeVatBudget(scheduledCost.getAmountIncomeVatBudget());
            actualCost.setAmountIncomeBaseBudget(scheduledCost.getAmountIncomeBaseBudget());
            actualCost.setAmountExpenseVatBudget(scheduledCost.getAmountExpenseVatBudget());
            actualCost.setAmountExpenseBaseBudget(scheduledCost.getAmountExpenseBaseBudget());
            
            actualCost.setAmountIncomeTotalPayment(scheduledCost.getAmountIncomeTotalPayment());
            actualCost.setAmountIncomeVatPayment(scheduledCost.getAmountIncomeVatPayment());
            actualCost.setAmountIncomeBasePayment(scheduledCost.getAmountIncomeBasePayment());
            actualCost.setAmountExpenseTotalPayment(scheduledCost.getAmountExpenseTotalPayment());
            actualCost.setAmountExpenseVatPayment(scheduledCost.getAmountExpenseVatPayment());
            actualCost.setAmountExpenseBasePayment(scheduledCost.getAmountExpenseBasePayment());
            
            actualCost.setCurrencyBudget(scheduledCost.getCurrencyBudget());
            actualCost.setCurrencyPayment(scheduledCost.getCurrencyPayment());
            actualCost.setDateUsedForMcBudget(scheduledCost.getDateUsedForMcBudget());
            actualCost.setDateUsedForMcPayment(scheduledCost.getDateUsedForMcPayment());
            actualCost.setExchangeRateBudget(scheduledCost.getExchangeRateBudget());
            actualCost.setExchangeRatePayment(scheduledCost.getExchangeRatePayment());
            actualCost.setExchangeRateOverride(scheduledCost.getExchangeRateOverride());
            
            actualCost.setCtryId(scheduledCost.getCtryId());
            actualCost.setVatPercentValue(scheduledCost.getVatPercentValue());
            actualCost.setVatPercentOverride(scheduledCost.getVatPercentOverride());
            actualCost.setVatAmountOverride(scheduledCost.getVatAmountOverride());
            
        }
        return actualCost;
    }
    
    /**
     * Getter.
     * 
     * @return string value
     */
    public String getChargebackStatus() {
        return this.chargebackStatus;
    }
    
    /**
     * Getter.
     * 
     * @return integer value
     */
    public Integer getInvoiceId() {
        return this.invoiceId;
    }
    
    /**
     * Setter.
     * 
     * @param chargebackStatus chargeback status value
     */
    public void setChargebackStatus(final String chargebackStatus) {
        this.chargebackStatus = chargebackStatus;
    }
    
    /**
     * Setter.
     * 
     * @param invoiceId invoice id
     */
    public void setInvoiceId(final Integer invoiceId) {
        this.invoiceId = invoiceId;
    }
    
    /**
     * Calculate income and expense for cost.
     * 
     * @param calculationType calculation type
     * @param isMcAndVatEnabled multicurrency and vat enabled
     * @param currencyParams currency request parameters
     * @param vatParameters vat request parameters
     * @return double value
     */
    // CHECKSTYLE:OFF : Justification: Disable for Bali 1 - must be refactored.
    @Override
    public double calculateIncomeAndExpense(final String calculationType,
            final boolean isMcAndVatEnabled, final CurrencyUtilities currencyParams,
            final VatUtilities vatParameters) {
        
        final double exchangeRate = getExchangeRate(isMcAndVatEnabled, currencyParams);
        final BigDecimal amountIncome =
                new BigDecimal(getIncomeAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParams.getCurrencyType()), vatParameters
                        .getVatType().toString()));
        final BigDecimal amountExpense =
                new BigDecimal(getExpenseAmount(isMcAndVatEnabled,
                    CurrencyType.BUDGET.equals(currencyParams.getCurrencyType()), vatParameters
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
    
    // CHECKSTYLE:ON
    @Override
    public String getCostClass() {
        return CLASS_ACTUAL_COST;
    }
}
