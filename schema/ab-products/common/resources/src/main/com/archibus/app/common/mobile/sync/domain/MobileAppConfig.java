package com.archibus.app.common.mobile.sync.domain;

/**
 * Domain class for mobile application configuration.
 * <p>
 * Mapped to afm_mobile_apps table.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileAppConfig {
    
    /**
     * Application title. Localized.
     */
    private String title;
    
    /**
     * Application URL.
     */
    private String url;
    
    /**
     * Application security group.
     */
    private String securityGroup;
    
    /**
     * @return the securityGroup
     */
    public String getSecurityGroup() {
        return this.securityGroup;
    }
    
    /**
     * @param securityGroup the securityGroup to set
     */
    public void setSecurityGroup(final String securityGroup) {
        this.securityGroup = securityGroup;
    }
    
    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code" warning: several classes have
    // "title" property.
    /**
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }
    
    /**
     * @param title the title to set
     */
    public void setTitle(final String title) {
        this.title = title;
    }
    
    // CHECKSTYLE:ON
    
    /**
     * @return the url
     */
    public String getUrl() {
        return this.url;
    }
    
    /**
     * @param url the url to set
     */
    public void setUrl(final String url) {
        this.url = url;
    }
}
