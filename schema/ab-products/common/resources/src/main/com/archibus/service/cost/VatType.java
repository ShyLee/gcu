package com.archibus.service.cost;

import com.archibus.utility.EnumTemplate;

/**
 * 
 * Vat Type Enumeration.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public enum VatType {
    /**
     * VAT types.
     */
    BASE, VAT, TOTAL;
    /**
     * VAT types definition.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "base", BASE }, { "vat", VAT },
            { "total", TOTAL } };
    
    /**
     * 
     * Convert from string.
     * 
     * @param source string value
     * @return vat type
     */
    public static VatType fromString(final String source) {
        return (VatType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, VatType.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
    
}
