package com.archibus.service.cost;

import java.util.*;

import com.archibus.model.config.*;
import com.archibus.model.config.Currency;

/**
 * 
 * Utility class. Provides methods for multi currency.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CurrencyUtilities {
    /**
     * Destination currency.
     */
    private final Currency destinationCurrency;
    
    /**
     * Exchange rate type.
     */
    private final ExchangeRateType exchangeRateType;
    
    /**
     * Currency type.
     */
    private final CurrencyType currencyType;
    
    /**
     * Currency conversions.
     */
    private Map<String, List<CurrencyConversion>> currencyConversions;
    
    /**
     * 
     * Constructor.
     * 
     * @param destinCurrency selected destination currency
     * @param exchangeRateType selected exchange rate type
     * @param currencyType selected currency type.
     */
    public CurrencyUtilities(final String destinCurrency, final String exchangeRateType,
            final String currencyType) {
        this.destinationCurrency = new Currency(destinCurrency);
        this.exchangeRateType = ExchangeRateType.fromString(exchangeRateType);
        this.currencyType = CurrencyType.fromString(currencyType);
    }
    
    /**
     * 
     * Constructor.
     * 
     * @param destinCurrency selected destination currency
     * @param exchangeRateType selected exchange rate type
     * @param currencyType selected currency type.
     */
    public CurrencyUtilities(final Currency destinCurrency,
            final ExchangeRateType exchangeRateType, final CurrencyType currencyType) {
        this.destinationCurrency = destinCurrency;
        this.exchangeRateType = exchangeRateType;
        this.currencyType = currencyType;
    }
    
    /**
     * Load currency conversions to selected currency and exchange rate type.
     */
    public void loadCurrencyConversions() {
        this.currencyConversions =
                CurrencyLoader.loadCurrencyConversions(this.destinationCurrency,
                    this.exchangeRateType);
    }
    
    /**
     * Get conversion rate for currency and date.
     * 
     * @param currency source currency
     * @param date conversion date
     * @return conversion factor
     */
    public double getConversionRateForDate(final String currency, final Date date) {
        double factor = 1;
        List<CurrencyConversion> exchangeRates = null;
        if (!this.destinationCurrency.getCode().equals(currency)) {
            exchangeRates = this.currencyConversions.get(currency);
        }
        if (exchangeRates != null) {
            final Iterator<CurrencyConversion> itList = exchangeRates.iterator();
            while (itList.hasNext()) {
                final CurrencyConversion conversion = itList.next();
                if (conversion.getConversionDate().after(date)) {
                    break;
                }
                factor = conversion.getConversionRate();
            }
        }
        return factor;
    }
    
    /**
     * Getter for the destinationCurrency property.
     * 
     * @see destinationCurrency
     * @return the destinationCurrency property.
     */
    public Currency getDestinationCurrency() {
        return this.destinationCurrency;
    }
    
    /**
     * Getter for the exchangeRateType property.
     * 
     * @see exchangeRateType
     * @return the exchangeRateType property.
     */
    public ExchangeRateType getExchangeRateType() {
        return this.exchangeRateType;
    }
    
    /**
     * Getter for the currencyType property.
     * 
     * @see currencyType
     * @return the currencyType property.
     */
    public CurrencyType getCurrencyType() {
        return this.currencyType;
    }
    
}
