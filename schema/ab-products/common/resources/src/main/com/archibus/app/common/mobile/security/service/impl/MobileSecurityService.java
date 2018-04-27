package com.archibus.app.common.mobile.security.service.impl;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.*;
import org.springframework.security.context.*;
import org.springframework.security.providers.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.util.Assert;

import com.archibus.app.common.mobile.security.dao.IUserAccountDao;
import com.archibus.app.common.mobile.security.service.IMobileSecurityService;
import com.archibus.context.*;
import com.archibus.security.*;
import com.archibus.service.remoting.*;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Implementation of <code>IMobileSecurityService</code>.
 * <p>
 * This is a singleton bean managed by Spring, configured in
 * /schema/ab-products/common/resources/src/main/com/archibus/app/common/mobile/services.xml.
 * <p>
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileSecurityService implements IMobileSecurityService, InitializingBean {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: authenticationManager. Used to authenticate user in non-SSO configurations.
     */
    private AuthenticationManager authenticationManager;
    
    /**
     * SecurityService. Used by startMobileSsoUserSession().
     */
    private SecurityService securityService;
    
    /**
     * DAO for UserAccount. Used for operations with UserAccount,
     * com.archibus.security.UserAccount.ThreadSafe, UserDetails.
     */
    private IUserAccountDao userAccountDao;
    
    /**
     * Property: securityConfiguration. Has value of security.configurationFile property from
     * security.properties file, set in security-service.xml. Typical value: "afm_users".
     */
    private String securityConfiguration;
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.hasLength(this.securityConfiguration, "securityConfiguration must have length");
        Assert.notNull(this.securityService, "securityService must be supplied");
        Assert.notNull(this.userAccountDao, "userAccountDao must be supplied");
    }
    
    /**
     * Getter for the authenticationManager property.
     * 
     * @see authenticationManager
     * @return the authenticationManager property.
     */
    public AuthenticationManager getAuthenticationManager() {
        return this.authenticationManager;
    }
    
    /**
     * Getter for the securityConfiguration property.
     * 
     * @see securityConfiguration
     * @return the securityConfiguration property.
     */
    public String getSecurityConfiguration() {
        return this.securityConfiguration;
    }
    
    /**
     * Getter for the securityService property.
     * 
     * @see securityService
     * @return the securityService property.
     */
    public SecurityService getSecurityService() {
        return this.securityService;
    }
    
    /**
     * Getter for the userAccountDao property.
     * 
     * @see userAccountDao
     * @return the userAccountDao property.
     */
    public IUserAccountDao getUserAccountDao() {
        return this.userAccountDao;
    }
    
    /** {@inheritDoc} */
    public void registerDevice(final String deviceId, final String username, final String password)
            throws ExceptionBase {
        // decrypt deviceId, username, password
        final Decoder1 decoder = new Decoder1();
        final String deviceIdDecrypted = decoder.decode(deviceId);
        final String usernameDecrypted = decoder.decode(username);
        final String passwordDecrypted = decoder.decode(password);
        
        registerDeviceDo(deviceIdDecrypted, usernameDecrypted, passwordDecrypted);
    }
    
    /**
     * Setter for the authenticationManager property.
     * 
     * @see authenticationManager
     * @param authenticationManager the authenticationManager to set
     */
    
    public void setAuthenticationManager(final AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }
    
    /**
     * Setter for the securityConfiguration property.
     * 
     * @see securityConfiguration
     * @param securityConfiguration the securityConfiguration to set
     */
    
    public void setSecurityConfiguration(final String securityConfiguration) {
        this.securityConfiguration = securityConfiguration;
    }
    
    /**
     * Setter for the securityService property.
     * 
     * @see securityService
     * @param securityService the securityService to set
     */
    
    public void setSecurityService(final SecurityService securityService) {
        this.securityService = securityService;
    }
    
    /**
     * Setter for the userAccountDao property.
     * 
     * @see userAccountDao
     * @param userAccountDao the userAccountDao to set
     */
    
    public void setUserAccountDao(final IUserAccountDao userAccountDao) {
        this.userAccountDao = userAccountDao;
    }
    
    /** {@inheritDoc} */
    public void startMobileSsoUserSession() throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("startMobileSsoUserSession");
        }
        
        // user is already authenticated
        // Get userAccount from Spring SecurityContext
        final Authentication authentication = SecurityServiceImpl.getAuthenticationFromContext();
        Assert.notNull(authentication, "authentication must be supplied");
        
        final UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Assert.notNull(userDetails, "userDetails must be supplied in Authentication");
        
        final com.archibus.security.UserAccount.Immutable userAccount =
                userDetails.getUserAccount();
        Assert.notNull(userAccount, "userAccount must be supplied in UserDetailsImpl");
        
        userAccount.checkIfEnabledForMobileAccess();
        
        // start user session
        this.securityService.startSsoUserSession();
    }
    
    /** {@inheritDoc} */
    public void startMobileUserSessionForDeviceId(final String deviceId) throws ExceptionBase {
        // decrypt deviceId
        final Decoder1 decoder = new Decoder1();
        final String deviceIdDecrypted = decoder.decode(deviceId);
        
        startMobileUserSessionForDeviceIdDo(deviceIdDecrypted);
    }
    
    /**
     * See
     * {@link MobileSecurityService#registerDevice(java.lang.String, java.lang.String, java.lang.String)}
     * .
     * 
     * @param deviceId id of the device to be registered. Not encrypted.
     * @param username of the user to be authenticated. Used in non-SSO configuration. Not
     *            encrypted.
     * @param password of the user to be authenticated. Used in non-SSO configuration. Not
     *            encrypted.
     */
    void registerDeviceDo(final String deviceId, final String username, final String password) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "registerDevice with deviceId=[%s], username=[%s], password=[%s]", deviceId,
                username, password));
        }
        
        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                MobileSecurityServiceUtilities.authenticate(username, password,
                    this.securityConfiguration, this.authenticationManager);
        
        userAccount.checkIfEnabledForMobileAccess();
        
        this.userAccountDao.registerDevice(deviceId, userAccount);
    }
    
    /**
     * See {@link MobileSecurityService#startMobileUserSessionForDeviceId(java.lang.String)}.
     * 
     * @param deviceId id of the device to be used for loading user account. Not encrypted.
     */
    void startMobileUserSessionForDeviceIdDo(final String deviceId) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "startMobileUserSessionForDeviceIdDo with deviceId=[%s]", deviceId));
        }
        
        // configuration check: Configuration must be not preauth
        MobileSecurityServiceUtilities.checkSecurityConfiguration(this.securityConfiguration);
        
        final com.archibus.app.common.mobile.security.domain.UserAccount userAccount =
                this.userAccountDao.loadByDeviceId(deviceId);
        if (userAccount == null) {
            // @translatable
            throw new ExceptionBase("This mobile device is not registered.");
        }
        
        final String username = userAccount.getName();
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.userAccountDao.loadUserDetailsByUsername(username);
        
        userDetails.getUserAccount().checkIfEnabledForMobileAccess();
        
        final Authentication authentication =
                new PreAuthenticatedAuthenticationToken(userDetails, null);
        
        // attach Authentication result to SecurityContext
        final SecurityContext securityContext = SecurityContextHolder.getContext();
        // SecurityContext might not exist, when this method is called from unit test
        if (securityContext != null) {
            securityContext.setAuthentication(authentication);
        }
        
        // start user session for the UserAccount object
        // prepare context
        SecurityServiceImpl.afterAuthentication(authentication, true);
        
        final Context context = ContextStore.get();
        context.getSecurityController().login();
    }
}