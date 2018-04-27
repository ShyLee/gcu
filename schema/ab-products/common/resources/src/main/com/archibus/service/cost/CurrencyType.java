package com.archibus.service.cost;

import com.archibus.utility.EnumTemplate;

/**
 * 
 * Currency Type Enumeration.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public enum CurrencyType {
    
    /**
     * Currency types.
     */
    BUDGET, PAYMENT;
    /**
     * Currency types def.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "budget", BUDGET },
            { "payment", PAYMENT } };
    
    /**
     * 
     * Convert from string.
     * 
     * @param source string value
     * @return currency type
     */
    public static CurrencyType fromString(final String source) {
        
        return (CurrencyType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, CurrencyType.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
