package com.archibus.app.common.mobile.security.service.impl;

import org.aopalliance.intercept.*;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.Context;
import com.archibus.context.utility.*;
import com.archibus.utility.ExceptionBase;

/**
 * Interceptor that populates Context with specified Project. Context must already exist. The
 * specified projectId must exist in the ConfigManager.
 * 
 * Used by services that assume that the Project is already in the Context, such as
 * IMobileSecurityService. Managed by Spring, has singleton scope. Configured in
 * /WEB-INF/config/context/remoting/mobile/services.xml file.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class ProjectPopulatingContextInterceptor implements MethodInterceptor, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: configManager. Required.
     */
    private ConfigManager.Immutable configManager;
    
    /**
     * Property: projectId. Required.
     */
    private String projectId;
    
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
        Assert.hasText(this.projectId, "projectId must be supplied");
    }
    
    /**
     * @return the configManager
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }
    
    /**
     * Getter for the projectId property.
     * 
     * @see projectId
     * @return the projectId property.
     */
    public String getProjectId() {
        return this.projectId;
    }
    
    /** {@inheritDoc} */
    // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
    // warning: This method implements Spring interface.
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // CHECKSTYLE:ON
        final ContextTemplate contextTemplate = new ContextTemplate();
        final Context context = contextTemplate.getContext();
        
        final Project.Immutable project =
                SecurityControllerTemplate.findProject(this.configManager, this.projectId);
        
        // project must exist
        if (project == null) {
            // @non-translatable
            throw new ExceptionBase("ProjectId does not match any projects");
        }
        
        // set project in the Context
        context.setProject(project);
        
        try {
            final MethodInvocation invocationArg = invocation;
            // prepare/cleanup context
            final Object retVal = contextTemplate.doWithContext(new Callback() {
                // CHECKSTYLE:OFF Justification: Suppress "Throwing Throwable is not allowed"
                // warning: This method implements an interface.
                public Object doWithContext(final Context context) throws Throwable {
                    // CHECKSTYLE:ON
                    
                    // proceed with normal invocation
                    return invocationArg.proceed();
                }
            });
            
            return retVal;
        } finally {
            // clear project in the Context
            context.setProject(null);
        }
    }
    
    /**
     * @param configManager the configManager to set
     */
    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
    
    /**
     * Setter for the projectId property.
     * 
     * @see projectId
     * @param projectId the projectId to set
     */
    
    public void setProjectId(final String projectId) {
        this.projectId = projectId;
    }
}
