package com.archibus.app.common.mobile.security.service.impl;

import org.aopalliance.intercept.*;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.ContextStore;
import com.archibus.context.Context;
import com.archibus.utility.ExceptionBase;

/**
 * Interceptor that populates the Context with the Core user session. The context must already
 * exist.
 * <p>
 * Used by services that allow non-authenticated user calls and require access to persistence
 * through DataSource, such as IMobileSecurityService. Managed by Spring, has singleton scope.
 * Configured in /WEB-INF/config/context/remoting/mobile/services.xml file.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class CoreUserSessionPopulatingContextInterceptor implements MethodInterceptor,
        InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: configManager. Required.
     */
    private ConfigManager.Immutable configManager;
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.configManager, "ConfigManager must be supplied");
    }
    
    /**
     * Getter for the configManager property.
     * 
     * @see configManager
     * @return the configManager property.
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }
    
    /** {@inheritDoc} */
    // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
    // warning: This method implements Spring interface.
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // CHECKSTYLE:ON
        Object retVal = null;
        
        final Context context = ContextStore.get();
        final Project.Immutable project = context.getProject();
        // project must exist
        if (project == null) {
            // @non-translatable
            throw new ExceptionBase("Project must be not null in the Context.");
        }
        
        // set core user session in the Context
        final UserSession.Immutable userSession = project.loadCoreUserSession();
        // core userSession must exist
        if (userSession == null) {
            // @non-translatable
            throw new ExceptionBase("Core user session must be not null in the Project.");
        }
        
        context.setUserSession(userSession);
        try {
            // proceed with normal invocation
            retVal = invocation.proceed();
        } finally {
            // clear user session in the Context
            context.setUserSession(null);
        }
        
        return retVal;
    }
    
    /**
     * Setter for the configManager property.
     * 
     * @see configManager
     * @param configManager the configManager to set
     */
    
    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
}
