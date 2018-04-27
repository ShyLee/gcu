package com.archibus.service.cost;

/**
 * 
 * Utility class. Provides methods to handle Tax Added Value.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class VatUtilities {
    
    /**
     * Constant: amount.
     */
    static final String AMOUNT = "amount";
    
    /**
     * Constants: underline.
     */
    static final String UNDERLINE = "_";
    
    /**
     * Constants: expense.
     */
    static final String EXPENSE = "expense";
    
    /**
     * Constants: income.
     */
    static final String INCOME = "income";
    
    /**
     * Selected VAT type.
     */
    private final VatType vatType;
    
    /**
     * 
     * Constructor specifying selected VAt type.
     * 
     * @param type selected type.
     */
    public VatUtilities(final String type) {
        this.vatType = VatType.fromString(type);
    }
    
    /**
     * 
     * Constructor specifying selected VAt type.
     * 
     * @param type selected type.
     */
    public VatUtilities(final VatType type) {
        this.vatType = type;
    }
    
    /**
     * Getter for the vatType property.
     * 
     * @see vatType
     * @return the vatType property.
     */
    public VatType getVatType() {
        return this.vatType;
    }
    
    /**
     * Returns cost amount field name for VAT and Currency Type.
     * 
     * @param currencyType currency type
     * @param isExpense if is expense cost
     * @return string
     */
    public String getAmountFieldName(final CurrencyType currencyType, final boolean isExpense) {
        return getAmountFieldName(this.vatType, currencyType, isExpense);
    }
    
    /**
     * Returns cost amount field name for VAT and Currency Type.
     * 
     * @param vat cost VAT type
     * @param currencyType currency type
     * @param isExpense if is expense cost
     * @return string
     */
    public String getAmountFieldName(final VatType vat, final CurrencyType currencyType,
            final boolean isExpense) {
        String name = AMOUNT + UNDERLINE;
        if (isExpense) {
            name += EXPENSE;
        } else {
            name += INCOME;
        }
        if (!(VatType.TOTAL.equals(vat) && CurrencyType.BUDGET.equals(currencyType))) {
            name += UNDERLINE + vat.toString() + UNDERLINE + currencyType.toString();
        }
        return name;
    }
    
}
