package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.List;

import com.archibus.app.common.mobile.sync.AbstractIntegrationTest;
import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;

/**
 * Integration tests for MobileAppConfigDataSource.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileAppConfigDataSourceIntegrationTest extends AbstractIntegrationTest {
    
    private MobileAppConfigDataSource dataSource;
    
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        this.dataSource = new MobileAppConfigDataSource();
    }
    
    /**
     * Test method for {@link MobileAppConfigDataSource#MobileAppConfigDataSource()} .
     */
    public final void testMobileAppConfigDataSource() {
        assertEquals("afm_mobile_apps", this.dataSource.getMainTableName());
    }
    
    /**
     * Test method for {@link MobileAppConfigDataSource#find()} .
     */
    public final void testFind() {
        // get all records
        final List<MobileAppConfig> appConfigs = this.dataSource.find(null);
        
        assertEquals(3, appConfigs.size());
        assertEquals("ASSET-MOB", appConfigs.get(0).getSecurityGroup());
        assertEquals("Equipment Survey", appConfigs.get(0).getTitle());
        assertEquals("AssetAndEquipmentSurvey/index.html", appConfigs.get(0).getUrl());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "mobileAppConfigDataSource.xml" };
    }
}
