package com.archibus.service.cost;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.config.*;
import com.archibus.model.config.Currency;
import com.archibus.utility.StringUtil;

/**
 * Load currency conversions.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public final class CurrencyLoader {
    /**
     * Constant.
     */
    private static final String TABLE_NAME = "afm_conversions";
    
    /**
     * Constant.
     */
    private static final String FACTOR = "factor";
    
    /**
     * Constant.
     */
    private static final String EXCHANGE_RATE_TYPE = "exchange_rate_type";
    
    /**
     * Constant.
     */
    private static final String DATE_CONVERSION = "date_conversion";
    
    /**
     * Constant.
     */
    private static final String SOURCE_UNITS = "source_units";
    
    /**
     * Constant.
     */
    private static final String DESTIN_UNITS = "destin_units";
    
    /**
     * Constant.
     */
    private static final String IS_CURRENCY = "is_currency";
    
    /**
     * Constant.
     */
    private static final String DOT = ".";
    
    /**
     * Private default constructor.
     */
    private CurrencyLoader() {
        
    }
    
    /**
     * Load all currency conversions for specified destination currency and exchange rate type.
     * 
     * @param currency destination currency
     * @param exchangeRateType exchange rate type
     * @return object
     */
    public static Map<String, List<CurrencyConversion>> loadCurrencyConversions(
            final Currency currency, final ExchangeRateType exchangeRateType) {
        
        final DataSource dsAfmConversions =
                DataSourceFactory.createDataSourceForFields(TABLE_NAME, new String[] {
                        DESTIN_UNITS, SOURCE_UNITS, FACTOR, DATE_CONVERSION, IS_CURRENCY,
                        EXCHANGE_RATE_TYPE });
        dsAfmConversions.addRestriction(Restrictions.and(
            Restrictions.eq(TABLE_NAME, IS_CURRENCY, "YES"),
            Restrictions.eq(TABLE_NAME, DESTIN_UNITS, currency.getCode()),
            Restrictions.eq(TABLE_NAME, EXCHANGE_RATE_TYPE, exchangeRateType.toString())));
        dsAfmConversions.addSort(TABLE_NAME, SOURCE_UNITS, DataSource.SORT_ASC);
        dsAfmConversions.addSort(TABLE_NAME, DATE_CONVERSION, DataSource.SORT_ASC);
        dsAfmConversions.setMaxRecords(0);
        
        final Map<String, List<CurrencyConversion>> result =
                new HashMap<String, List<CurrencyConversion>>();
        
        final List<DataRecord> records = dsAfmConversions.getRecords();
        String source = "";
        List<CurrencyConversion> conversions = new ArrayList<CurrencyConversion>();
        for (final DataRecord record : records) {
            final String srcCurrencyCode = record.getString(TABLE_NAME + DOT + SOURCE_UNITS);
            if (StringUtil.notNullOrEmpty(source) && !srcCurrencyCode.equals(source)) {
                // add current currency to map
                result.put(source, conversions);
                // reset list and source currency
                conversions = new ArrayList<CurrencyConversion>();
                source = srcCurrencyCode;
            }
            if (StringUtil.isNullOrEmpty(source)) {
                source = srcCurrencyCode;
            }
            final double factor = record.getDouble(TABLE_NAME + DOT + FACTOR);
            final Date date = record.getDate(TABLE_NAME + DOT + DATE_CONVERSION);
            final CurrencyConversion conversion =
                    new CurrencyConversion(new Currency(source), currency, factor, date,
                        exchangeRateType);
            conversions.add(conversion);
        }
        if (!conversions.isEmpty() && StringUtil.notNullOrEmpty(source)) {
            result.put(source, conversions);
        }
        return result;
    }
}
