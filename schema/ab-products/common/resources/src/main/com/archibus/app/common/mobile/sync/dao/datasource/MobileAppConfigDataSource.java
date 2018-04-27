package com.archibus.app.common.mobile.sync.dao.datasource;

import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * DataSource for MobileAppConfig.
 * <p>
 * Designed to have prototype scope.
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
public class MobileAppConfigDataSource extends ObjectDataSourceImpl<MobileAppConfig> implements
        IDao<MobileAppConfig> {
    
    /**
     * Constant: field name: "title".
     */
    private static final String TITLE = "title";
    
    /**
     * Constant: field name: "url".
     */
    private static final String URL = "url";
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { TITLE, TITLE },
            { "main_page_url", URL }, { "security_group", "securityGroup" } };
    
    /**
     * Constructs MobileAppConfigDataSource, mapped to <code>afm_mobile_apps</code> table, using
     * <code>mobileAppConfig</code> bean.
     */
    public MobileAppConfigDataSource() {
        super("mobileAppConfig", "afm_mobile_apps");
        
        this.setDatabaseRole(DB_ROLE_SECURITY);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
