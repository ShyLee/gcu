package com.archibus.app.sysadmin.updatewizard.project.util;

import com.archibus.context.ContextStore;
import com.archibus.utility.*;

/**
 * 
 * Utility class.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public final class LangUtilities {
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private LangUtilities() {
    }
    
    /**
     * 
     * @return true for "en" language and false otherwise
     */
    public static boolean isLangEn() {
        boolean isLangEn = true;
        
        final String locale = ContextStore.get().getUserSessionDto().getLocale();
        
        final String dbExtension = Utility.getDbExtension(locale);
        
        if (StringUtil.notNullOrEmpty(dbExtension)) {
            isLangEn = false;
        }
        return isLangEn;
    }
    
    /**
     * 
     * Get field suffix for enum_list and ml_heading fields.
     * 
     * @return suffix
     */
    public static String getFieldSuffix() {
        final String locale = ContextStore.get().getUserSessionDto().getLocale();
        return "_" + Utility.getDbExtension(locale);
    }
}
