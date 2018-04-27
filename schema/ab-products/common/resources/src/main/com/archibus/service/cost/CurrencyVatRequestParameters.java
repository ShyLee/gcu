package com.archibus.service.cost;

import java.util.Map;

import com.archibus.context.ContextStore;
import com.archibus.model.config.ExchangeRateType;

/**
 * <p>
 * Currency and Vat configuration object.
 * 
 * @author Ioan Draghici
 * 
 */
public class CurrencyVatRequestParameters {
    /**
     * Cost type.
     */
    private String costType = Constants.COST_TYPE_TOTAL;
    
    /**
     * Currency code.
     */
    private String currencyCode;
    
    /**
     * Currency type.
     */
    private String currencyType = Constants.CURRENCY_TYPE_BUDGET;
    
    /**
     * Exchange rate.
     */
    private ExchangeRateType exchangeRateType = ExchangeRateType.BUDGET;
    
    /**
     * If is budget currency type.
     */
    private boolean isBudget;
    
    /**
     * If is custom currency type.
     */
    private boolean isCustom;
    
    /**
     * If multi currency and vat is enabled.
     */
    private boolean isMcAndVatEnabled;
    
    /**
     * If is user currency type.
     */
    private boolean isUser;
    
    /**
     * Constructor.
     * 
     * @param config map with current settings
     */
    public CurrencyVatRequestParameters(final Map<String, String> config) {
        this.isMcAndVatEnabled = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        this.currencyCode = ContextStore.get().getProject().getBudgetCurrency().getCode();
        // if config is null must function without MC and VAT
        if (config == null || config.isEmpty()) {
            this.isMcAndVatEnabled = false;
        }
        if (this.isMcAndVatEnabled) {
            // read parameters
            if (config.containsKey(Constants.INPUT_PARAMETER_VAT)) {
                this.costType = config.get(Constants.INPUT_PARAMETER_VAT);
            }
            if (config.containsKey(Constants.INPUT_PARAMETER_CURRENCY_CODE)) {
                this.currencyCode = config.get(Constants.INPUT_PARAMETER_CURRENCY_CODE);
            }
            if (config.containsKey(Constants.INPUT_PARAMETER_RATE_TYPE)) {
                this.exchangeRateType =
                        ExchangeRateType
                            .fromString(config.get(Constants.INPUT_PARAMETER_RATE_TYPE));
            }
            if (config.containsKey(Constants.INPUT_PARAMETER_CURRENCY_TYPE)) {
                this.currencyType = config.get(Constants.INPUT_PARAMETER_CURRENCY_TYPE);
            }
            this.isBudget = Constants.CURRENCY_TYPE_BUDGET.equals(this.currencyType);
            this.isUser = Constants.CURRENCY_TYPE_USER.equals(this.currencyType);
            this.isCustom = Constants.CURRENCY_TYPE_CUSTOM.equals(this.currencyType);
        }
    }
    
    /**
     * Get cost field name for base field.
     * 
     * @param baseField current base field
     * @return field name
     */
    public String getCostFieldName(final String baseField) {
        String fieldName = "";
        
        fieldName = baseField + "_" + this.costType;
        
        if (this.isBudget) {
            fieldName += "_budget";
        } else {
            fieldName += "_payment";
        }
        
        if (this.isBudget && this.costType.equals("total")) {
            fieldName = baseField;
        }
        return fieldName;
    }
    
    /**
     * @return the costType
     */
    public String getCostType() {
        return this.costType;
    }
    
    /**
     * @return the currencyCode
     */
    public String getCurrencyCode() {
        return this.currencyCode;
    }
    
    /**
     * Returns currency field name based on user selection.
     * 
     * @return field name (currency_budget, currency_payment)
     */
    public String getCurrencyFieldName() {
        String fieldName = "";
        if (Constants.CURRENCY_TYPE_BUDGET.equals(this.currencyType)) {
            fieldName = "currency_budget";
        } else {
            fieldName = "currency_payment";
        }
        return fieldName;
    }
    
    /**
     * @return the currencyType
     */
    public String getCurrencyType() {
        return this.currencyType;
    }
    
    /**
     * @return the rateType
     */
    public ExchangeRateType getExchangeRateType() {
        return this.exchangeRateType;
    }
    
    /**
     * @return the isBudget
     */
    public boolean isBudgetCurrency() {
        return this.isBudget;
    }
    
    /**
     * @return the isCustom
     */
    public boolean isCustomCurrency() {
        return this.isCustom;
    }
    
    /**
     * @return the isMcAndVatEnabled
     */
    public boolean isMcVatEnabled() {
        return this.isMcAndVatEnabled;
    }
    
    /**
     * @return the isUser
     */
    public boolean isUserCurrency() {
        return this.isUser;
    }
    
}
