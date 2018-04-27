package com.archibus.eventhandler.rplm.alerts;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestPortfolioAdministrationAlertsHandler extends DataSourceTestBase {
    
    public void testGenerateAlerts() {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        LeaseAdministrationAlertsHandler handlerClass = new LeaseAdministrationAlertsHandler();
        handlerClass.generateAlerts(context);
    }
    
}
