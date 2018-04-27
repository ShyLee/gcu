package com.archibus.app.solution.common.security.providers.dao;

import org.springframework.security.GrantedAuthority;
import org.springframework.security.userdetails.*;

import com.archibus.app.solution.common.security.providers.dao.UserAccountDao;
import com.archibus.utility.ExceptionBase;

/**
 * Tests SecurityService event handler.
 */
public class UserAccountDaoTest extends com.archibus.fixture.IntegrationTestBase {
    private UserAccountDao userAccountDao;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }
    
    public void testLoadUserByUsername() throws ExceptionBase {
        String username = "AFM";
        
        this.userAccountDao.setIgnoreUsernameCase(false);
        verifyAfmAccountDetails(username);
    }
    
    public void testLoadUserByUsernameLowercase() throws ExceptionBase {
        String username = "AFM";
        
        this.userAccountDao.setIgnoreUsernameCase(true);
        verifyAfmAccountDetails(username);
    }
    
    private void verifyAfmAccountDetails(String username) {
        UserDetails userDetails = this.userAccountDao.loadUserByUsername(username);
        GrantedAuthority[] authorities = userDetails.getAuthorities();
        
        assertEquals(1, authorities.length);
        assertEquals("%", authorities[0].getAuthority());
        
        assertEquals("afm", userDetails.getPassword());
    }
    
    public void testLoadUserByUsernameException() throws ExceptionBase {
        try {
            String username = "afm";
            this.userAccountDao.setIgnoreUsernameCase(false);
            this.userAccountDao.loadUserByUsername(username);
            fail("UsernameNotFoundException expected");
        } catch (UsernameNotFoundException e) {
        }
    }
    
    public void testLoadUserByUsernameApostropheException() throws ExceptionBase {
        try {
            String username = "A'FM";
            this.userAccountDao.setIgnoreUsernameCase(false);
            this.userAccountDao.loadUserByUsername(username);
            fail("UsernameNotFoundException expected");
        } catch (UsernameNotFoundException e) {
        }
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
}
