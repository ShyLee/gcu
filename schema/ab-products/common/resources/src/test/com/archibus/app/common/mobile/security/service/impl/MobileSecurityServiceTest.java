package com.archibus.app.common.mobile.security.service.impl;

import java.util.*;

import junit.framework.TestCase;

import org.springframework.dao.DataAccessException;
import org.springframework.security.*;
import org.springframework.security.userdetails.*;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.mobile.security.dao.IUserAccountDao;
import com.archibus.app.common.mobile.security.domain.UserAccount;
import com.archibus.context.*;
import com.archibus.context.utility.ContextTemplate;
import com.archibus.model.config.*;
import com.archibus.model.licensing.LicenseLevel;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.security.UserAccount.ThreadSafe;
import com.archibus.security.*;
import com.archibus.service.remoting.SecurityService;
import com.archibus.servletx.controller.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests for MobileSecurityService.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileSecurityServiceTest extends TestCase {
    private String methodInvoked;
    
    public static final String USERNAME_EXISTS_IN_DATABASE = "usernameInDatabase";
    
    private static final String DEVICE_ID_IN_DATABASE = "TestDeviceId";
    
    private static final String DEVICE_ID_NOT_IN_DATABASE = "TestDeviceIdNotInDatabase";
    
    private static final String USERNAME_ACCOUNT_NOT_ENABLED_FOR_MOBILE =
            "usernameNotEnabledForMobile";
    
    private static final String PASSWORD_VALID = "passwordValid";
    
    protected Context context;
    
    protected final ContextTemplate contextTemplate = new ContextTemplate();
    
    MobileSecurityService mobileSecurityService;
    
    static UserAccount prepareUserAccount(final String deviceId, final String username) {
        UserAccount userAccount = null;
        if (deviceId.equals(DEVICE_ID_IN_DATABASE)) {
            userAccount = new UserAccount();
            userAccount.setMobileDeviceId(deviceId);
            userAccount.setName(username);
        }
        
        return userAccount;
    }
    
    public static UserAccountImpl prepareUserAccountImpl(final String username) {
        final UserAccountImpl userAccount = new UserAccountImpl();
        userAccount.setMobileDeviceId(DEVICE_ID_IN_DATABASE);
        userAccount.initDocument();
        userAccount.setName(username);
        
        if (username != null) {
            userAccount.setMobileEnabled(!username
                .contains(USERNAME_ACCOUNT_NOT_ENABLED_FOR_MOBILE));
        }
        
        {
            com.archibus.model.licensing.LicenseLevel licenseLevel = LicenseLevel.LEVEL_1;
            if (username != null && username.contains(LicenseLevel.LEVEL_4_ACTIVITY.toString())) {
                licenseLevel = LicenseLevel.LEVEL_4_ACTIVITY;
            }
            
            userAccount.setLicenseLevel(licenseLevel);
        }
        
        return userAccount;
    }
    
    static UserDetailsImpl prepareUserDetails(final String username) {
        final GrantedAuthority[] authorities = new GrantedAuthority[0];
        
        final UserDetailsImpl userDetails =
                new UserDetailsImpl(username, "", false, false, false, false, authorities);
        final UserAccountImpl userAccount = prepareUserAccountImpl(username);
        userDetails.setUserAccount(userAccount);
        
        return userDetails;
    }
    
    static UserDetailsService prepareUserDetailsService() {
        // prepare mock UserDetailsService
        final UserDetailsService userDetailsService = new UserDetailsService() {
            public UserDetails loadUserByUsername(final String username)
                    throws UsernameNotFoundException, DataAccessException {
                if (!username.contains(USERNAME_ACCOUNT_NOT_ENABLED_FOR_MOBILE)
                        && !username.contains(USERNAME_EXISTS_IN_DATABASE)) {
                    throw new UsernameNotFoundException(username);
                }
                
                final UserDetailsImpl userDetails = prepareUserDetails(username);
                
                return userDetails;
            }
        };
        
        return userDetailsService;
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileUserSessionForDeviceIdDo(String)}.
     */
    public final void testLoginWithDeviceIdDoDeviceIdExists() {
        // case #1: deviceId exists in the database
        {
            final IUserAccountDao userAccountDao =
                    prepareUserAccountDao(USERNAME_EXISTS_IN_DATABASE);
            this.mobileSecurityService.setUserAccountDao(userAccountDao);
        }
        
        this.mobileSecurityService.setSecurityConfiguration("afm-users");
        
        this.mobileSecurityService.startMobileUserSessionForDeviceIdDo(DEVICE_ID_IN_DATABASE);
        
        // verify that SecurityController is in Authenticated state
        assertEquals(true, ContextStore.get().getSecurityController().isAuthenticated());
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileUserSessionForDeviceIdDo(String)}.
     */
    public final void testLoginWithDeviceIdDoDeviceIdDoesNotExist() {
        // case #2: deviceId does not exist in the database
        {
            final IUserAccountDao userAccountDao =
                    prepareUserAccountDao(USERNAME_EXISTS_IN_DATABASE);
            this.mobileSecurityService.setUserAccountDao(userAccountDao);
        }
        
        this.mobileSecurityService.setSecurityConfiguration("afm-users");
        
        try {
            this.mobileSecurityService
                .startMobileUserSessionForDeviceIdDo(DEVICE_ID_NOT_IN_DATABASE);
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final ExceptionBase exception) {
            assertEquals("This mobile device is not registered.", exception.getPattern());
        }
        
        // verify that SecurityController is in NotAuthenticated state
        assertEquals(false, ContextStore.get().getSecurityController().isAuthenticated());
    }
    
    /**
     * Test method for {@link MobileSecurityService#registerDeviceDo(String, String, String)} .
     */
    public final void testRegisterDeviceDo() {
        {
            final IUserAccountDao userAccountDao =
                    prepareUserAccountDao(USERNAME_EXISTS_IN_DATABASE);
            this.mobileSecurityService.setUserAccountDao(userAccountDao);
        }
        
        this.mobileSecurityService.setSecurityConfiguration("afm-users");
        
        this.mobileSecurityService.setAuthenticationManager(prepareAuthenticationManager());
        
        // case #1: deviceId exists in database, username exists in database, password is valid.
        this.mobileSecurityService.registerDeviceDo(DEVICE_ID_IN_DATABASE,
            USERNAME_EXISTS_IN_DATABASE, PASSWORD_VALID);
        
        try {
            // case #2: deviceId exists in database, username exists in database, password is
            // invalid.
            this.mobileSecurityService.registerDeviceDo(DEVICE_ID_IN_DATABASE,
                USERNAME_EXISTS_IN_DATABASE, "Junk");
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final ExceptionBase exception) {
            assertEquals("The user ID and password you entered don't match our records.",
                exception.getPattern());
        }
        
        try {
            final String username =
                    USERNAME_ACCOUNT_NOT_ENABLED_FOR_MOBILE
                            + LicenseLevel.LEVEL_4_ACTIVITY.toString();
            // case #3: deviceId exists in database, username is not enabled, password is
            // valid.
            this.mobileSecurityService.registerDeviceDo(DEVICE_ID_IN_DATABASE, username,
                PASSWORD_VALID);
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final ExceptionBase exception) {
            assertEquals("Your administrator has not enabled your account for mobile access.",
                exception.getPattern());
        }
    }
    
    private AuthenticationManager prepareAuthenticationManager() {
        return new AuthenticationManager() {
            public Authentication authenticate(final Authentication authentication)
                    throws AuthenticationException {
                if (!PASSWORD_VALID.equals(authentication.getCredentials())) {
                    throw new ExceptionBase(
                        "The user ID and password you entered don't match our records.");
                }
                
                final Authentication authenticationResult = new Authentication() {
                    
                    public String getName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void setAuthenticated(final boolean isAuthenticated)
                            throws IllegalArgumentException {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public boolean isAuthenticated() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public Object getPrincipal() {
                        return prepareUserDetails((String) authentication.getPrincipal());
                    }
                    
                    public Object getDetails() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Object getCredentials() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public GrantedAuthority[] getAuthorities() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                };
                
                return authenticationResult;
            }
        };
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileSsoUserSession()} .
     */
    public final void testStartMobileSsoUserSessionEnabled() {
        MobileSecurityServiceSsoIntegrationTest.preparePreauthContext(USERNAME_EXISTS_IN_DATABASE);
        
        this.mobileSecurityService.setSecurityService(prepareSecurityService());
        
        this.mobileSecurityService.startMobileSsoUserSession();
        
        assertEquals("startSsoUserSession", this.methodInvoked);
    }
    
    /**
     * Test method for {@link MobileSecurityService#startMobileSsoUserSession()} .
     */
    public final void testStartMobileSsoUserSessionNotEnabled() {
        final String username =
                USERNAME_ACCOUNT_NOT_ENABLED_FOR_MOBILE + LicenseLevel.LEVEL_4_ACTIVITY.toString();
        MobileSecurityServiceSsoIntegrationTest.preparePreauthContext(username);
        
        this.mobileSecurityService.setSecurityService(prepareSecurityService());
        
        try {
            this.mobileSecurityService.startMobileSsoUserSession();
            fail(MobileSecurityServiceSsoIntegrationTest.EXCEPTION_EXPECTED);
        } catch (final ExceptionBase exception) {
            assertEquals("Your administrator has not enabled your account for mobile access.",
                exception.getPattern());
        }
    }
    
    private SecurityService prepareSecurityService() {
        return new SecurityService() {
            
            public void startSsoUserSession() throws ExceptionBase {
                MobileSecurityServiceTest.this.methodInvoked = "startSsoUserSession";
            }
            
            public void setLocaleFromJavaLocale(final String localeName) throws ExceptionBase {
            }
            
            public void setLocale(final String cultureInfoName) throws ExceptionBase {
            }
            
            public void requestNewPassword(final String userId, final String projectId)
                    throws ExceptionBase {
            }
            
            public void logout() throws ExceptionBase {
            }
            
            public String loginDo(final String userId, final String password,
                    final String projectId, final String cultureInfoName) throws ExceptionBase {
                return null;
            }
            
            public String login(final String userId, final String password, final String projectId,
                    final String cultureInfoName) throws ExceptionBase {
                return null;
            }
            
            public boolean isUsernameUppercase(final String projectId) throws ExceptionBase {
                return false;
            }
            
            public boolean isPasswordUppercase(final String projectId) throws ExceptionBase {
                return false;
            }
            
            public List<ProjectConfig> getProjects() throws ExceptionBase {
                return null;
            }
            
            public List<LocaleConfig> getLocales(final String localeId) throws ExceptionBase {
                return null;
            }
            
            public Set<String> getCultureInfos() throws ExceptionBase {
                return null;
            }
            
            public String encryptPasswordsInConfigurationFiles() throws ExceptionBase {
                return null;
            }
            
            public void checkOutBimLicenseIfNot() throws ExceptionBase {
            }
            
            public void changeSqlSecurityForUserRole(final String roleId, final String sqlUserId,
                    final String sqlPassword) throws ExceptionBase {
            }
            
            public void changeSqlSecurityForUserAcccount(final String username,
                    final String sqlUserId, final String sqlPassword) throws ExceptionBase {
            }
            
            public void changePassword(final String userId, final String oldPassword,
                    final String newPassword, final String projectId) throws ExceptionBase {
            }
        };
    }
    
    /** {@inheritDoc} */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        this.mobileSecurityService = new MobileSecurityService();
        
        this.context = MockUtilities.createMockContext(false, false);
        this.context.setProject(MockUtilities.createMockProject(null));
        this.context.setSecurityController(prepareSecurityController());
        
        ContextStore.set(this.context);
    }
    
    private SecurityController prepareSecurityController() {
        final SecurityControllerImpl securityController = new SecurityControllerImpl();
        return securityController;
    }
    
    private IUserAccountDao prepareUserAccountDao(final String username) {
        // prepare mock IUserAccountDao
        final IUserAccountDao userAccountDao = new IUserAccountDao() {
            
            public void delete(final UserAccount arg0) {
            }
            
            public List<UserAccount> find(final AbstractRestrictionDef arg0) {
                return null;
            }
            
            public UserAccount get(final Object arg0) {
                return null;
            }
            
            public UserAccount loadByDeviceId(final String deviceId) {
                return prepareUserAccount(deviceId, username);
            }
            
            public UserAccount save(final UserAccount arg0) {
                return null;
            }
            
            public void update(final UserAccount arg0) {
            }
            
            public void update(final UserAccount arg0, final UserAccount arg1) {
            }
            
            public void registerDevice(final String deviceId, final ThreadSafe userAccount) {
                // TODO Auto-generated method stub
                
            }
            
            public UserDetails loadUserDetailsByUsername(final String username) {
                return prepareUserDetails(username);
            }
        };
        
        return userAccountDao;
    }
}
