/*
 * Copyright 2004, 2005, 2006 Acegi Technology Pty Limited
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package org.springframework.security.ui.preauth;

import java.text.MessageFormat;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

/**
 * Source of the username supplied with pre-authenticated authentication request as request
 * parameter. The <tt>usernameKey</tt> property must be set, which will be used to extract the
 * username from the request parameter. The <tt>validReferers</tt> property must be set, which will
 * be used to verify if request is valid.
 * <p>
 * HTTP request parameter can be modified by the user, which is not very secure. For additional
 * protection RequestParameterUsernameSource will:
 * <p>
 * 1. Verify that POST method was used.
 * <p>
 * 2. Verify that request has valid referer.
 * 
 * @author Valery Tydykov
 * @author Joel Emery
 * 
 */
public class RequestParameterUsernameSource implements UsernameSource, InitializingBean {
    /**
     * 
     */
    public static final String REFERER = "referer";
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    private String usernameKey;
    
    private String[] validReferers;
    
    private static final String METHOD_POST = "POST";
    
    public String obtainUsername(HttpServletRequest request) {
        String userName = request.getParameter(getUsernameKey());
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Obtained username=[" + userName + "] from request parameter");
        }
        
        // if username supplied, verify request
        if (userName != null && userName.length() > 0) {
            if (!verifyRequest(request)) {
                // request is not valid
                return null;
            }
        }
        
        return userName;
    }
    
    private boolean verifyRequest(HttpServletRequest request) {
        // HTTP request parameter can be modified by the user, which is not very secure.
        // For additional protection, verify that POST method was used.
        if (!METHOD_POST.equalsIgnoreCase(request.getMethod())) {
            // method is not POST
            {
                // @non-translatable
                final String errorMessage =
                        "non-POST method was used in HTTP request to provide username. Only POST method is allowed when supplying username as HTTP request parameter.";
                this.logger.error(errorMessage);
            }
            
            return false;
        }
        
        // For additional protection, verify that request has valid referer.
        if (!isValidReferer(request)) {
            // referer is not valid
            {
                // @non-translatable
                final String errorMessage =
                        MessageFormat.format(
                            "Invalid referer=[{0}] was used in HTTP request to provide username.",
                            request.getHeader(REFERER));
                this.logger.error(errorMessage);
            }
            
            return false;
        }
        
        return true;
    }
    
    private boolean isValidReferer(HttpServletRequest request) {
        String referer = request.getHeader(REFERER);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Request Referer=[" + referer + "]");
        }
        
        // if no referers specified, is valid
        if (this.validReferers == null || this.validReferers.length == 0) {
            return true;
        } else {
            boolean isValidReferer = false;
            
            if (referer != null) {
                for (String validReferer : this.validReferers) {
                    if (referer.equalsIgnoreCase(validReferer)) {
                        isValidReferer = true;
                        break;
                    }
                }
            }
            
            return isValidReferer;
        }
    }
    
    /**
     * @return the usernameKey
     */
    public String getUsernameKey() {
        return this.usernameKey;
    }
    
    /**
     * @param usernameKey the usernameKey to set
     */
    public void setUsernameKey(String usernameKey) {
        Assert.hasLength(usernameKey, "usernameKey must be not empty");
        this.usernameKey = usernameKey;
    }
    
    public String[] getValidReferers() {
        return this.validReferers;
    }
    
    public void setValidReferers(String[] validReferers) {
        this.validReferers = validReferers;
    }
    
    public void afterPropertiesSet() throws Exception {
        Assert.hasLength(this.usernameKey, "usernameKey must be not empty");
    }
}
