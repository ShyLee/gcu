package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.app.solution.common.security.*;
import com.archibus.app.solution.common.security.providers.dao.*;
import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests SecurityService event handler.
 */
public class PasswordManagerImplTest extends com.archibus.fixture.IntegrationTestBase {
    private PasswordManagerImpl passwordManager;
    
    private UserAccountDao userAccountDao;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/useraccount.xml" };
    }
    
    public final void testResetPassword() {
        this.passwordManager.resetPassword(getUserId(), "myKeyPhrase");
        
        restoreOriginalPassword();
    }
    
    public final void testEncryptPassword() {
        this.passwordManager.encryptPassword(getUserId());
        
        restoreOriginalPassword();
    }
    
    public final void testSendForgottenPassword() {
        try {
            this.passwordManager.sendForgottenPassword(getUserId(), getProjectId());
            fail("exception expected");
        } catch (ExceptionBase expected) {
            // send mail exception expected - no mail server configured
            assertTrue(expected.getPattern().indexOf("SMTP") > -1);
        }
    }
    
    public final void testSendTemporaryPassword() {
        try {
            this.passwordManager.sendTemporaryPassword(getUserId());
            fail("exception expected");
        } catch (ExceptionBase expected) {
            // send mail exception expected - no mail server configured
            assertTrue(expected.getPattern().indexOf("SMTP") > -1);
        }
    }
    
    public final void testSendNewPassword() {
        try {
            this.passwordManager.sendNewPassword(getUserId(), "newPassword");
            fail("exception expected");
        } catch (ExceptionBase expected) {
            // send mail exception expected - no mail server configured
            assertTrue(expected.getPattern().indexOf("SMTP") > -1);
        }
    }
    
    private void restoreOriginalPassword() {
        // restore the original password
        UserDetailsImpl userDetails = (UserDetailsImpl) this.userAccountDao
            .loadUserByUsername(getUserId());
        UserAccount.ThreadSafe userAccount = (UserAccount.ThreadSafe) userDetails.getUserAccount();
        
        // update password in user account
        userAccount.changePassword(getPassword());
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }
    
    /**
     * @return the userAccountDao
     */
    public UserAccountDao getUserAccountDao() {
        return this.userAccountDao;
    }
    
    /**
     * @param userAccountDao the userAccountDao to set
     */
    public void setUserAccountDao(UserAccountDao userAccountDao) {
        this.userAccountDao = userAccountDao;
    }
    
    /**
     * @return the passwordManager
     */
    public PasswordManagerImpl getPasswordManager() {
        return this.passwordManager;
    }
    
    /**
     * @param passwordManager the passwordManager to set
     */
    public void setPasswordManager(PasswordManagerImpl passwordManager) {
        this.passwordManager = passwordManager;
    }
}
