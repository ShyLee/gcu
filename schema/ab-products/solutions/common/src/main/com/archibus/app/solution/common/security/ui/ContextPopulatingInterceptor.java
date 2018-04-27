package com.archibus.app.solution.common.security.ui;

import javax.servlet.http.HttpServletRequest;

import org.aopalliance.intercept.*;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.ui.preauth.AuthenticationDetailsImpl;
import org.springframework.util.Assert;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.context.utility.SecurityControllerTemplate;

/**
 * Populates context with values from AuthenticationDetails. Intercepts calls to
 * AttributesSourceWebAuthenticationDetailsSource.buildDetails; after buildDetails method returns
 * AuthenticationDetailsImpl object, gets and sets project and sessionId in the context.
 * 
 * @author Valery Tydykov
 * 
 */
public class ContextPopulatingInterceptor implements MethodInterceptor, InitializingBean {
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(getClass());
    
    private String projectIdKey;
    
    /**
     * Check that all required properties have been set.
     * 
     * <p>
     * Suppress PMD warning "SignatureDeclareThrowsException".
     * <p>
     * Justification: this method is declared in Spring API.
     */
    @SuppressWarnings("PMD.SignatureDeclareThrowsException")
    public void afterPropertiesSet() throws Exception {
        Assert.hasText(this.projectIdKey, "projectIdKey must not be empty");
    }
    
    /**
     * @return the projectIdKey
     */
    public String getProjectIdKey() {
        return this.projectIdKey;
    }
    
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // proceed with normal invocation
        final Object retVal = invocation.proceed();
        // populate context
        final HttpServletRequest request = (HttpServletRequest) invocation.getArguments()[0];
        
        Assert.isInstanceOf(AuthenticationDetailsImpl.class, retVal);
        final AuthenticationDetailsImpl authenticationDetails = (AuthenticationDetailsImpl) retVal;
        
        // Populates context with values from AuthenticationDetails.
        populateContext(request, authenticationDetails);
        
        return retVal;
    }
    
    /**
     * @param projectIdKey the projectIdKey to set
     */
    public void setProjectIdKey(final String projectIdKey) {
        this.projectIdKey = projectIdKey;
    }
    
    private void populateContext(final HttpServletRequest request,
            final AuthenticationDetailsImpl authenticationDetails) {
        // set project and sessionId in the context
        final Context context = ContextStore.get();
        
        final String projectId =
                (String) authenticationDetails.getAttributes().get(this.getProjectIdKey());
        
        Assert.hasLength(projectId, "projectId must not be empty");
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Using project=[" + projectId + "]");
        }
        
        final Project.Immutable project =
                SecurityControllerTemplate.findProject(context.getConfigManager(), projectId);
        
        Assert.notNull(project, "project not found");
        Assert.notNull(project.isOpen(), "project must be open");
        
        // set project in the context
        context.setProject(project);
        
        final String sessionId = request.getSession().getId();
        Assert.hasLength(sessionId, "sessionId must be not empty");
        
        // set sessionId in the context
        context.getSession().setId(sessionId);
    }
}
