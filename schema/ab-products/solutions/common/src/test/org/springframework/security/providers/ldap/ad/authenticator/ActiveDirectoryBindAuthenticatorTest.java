package org.springframework.security.providers.ldap.ad.authenticator;

import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.*;
import org.springframework.security.ldap.*;
import org.springframework.security.providers.ldap.authenticator.BindAuthenticator;

/**
 * Tests {@link ActiveDirectoryBindAuthenticator}.
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryBindAuthenticatorTest extends AbstractLdapIntegrationTests {
    private BindAuthenticator authenticator;

    private Authentication bob;

    private LdapUserSearch userSearch;

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.bob = getUsernamePasswordAuthenticationToken();

        this.userSearch = (LdapUserSearch) appContext.getBean("userSearch");
    }

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        this.authenticator = null;

        super.tearDown();
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.authenticator.ActiveDirectoryBindAuthenticator#authenticate(org.springframework.security.Authentication)}.
     */
    public void testAuthenticateAuthentication() {
        this.authenticator = new BindAuthenticator(getContextSource());
        this.authenticator.setMessageSource(new SpringSecurityMessageSource());
        this.authenticator.setUserSearch(this.userSearch);

        DirContextOperations user = this.authenticator.authenticate(this.bob);
    }

    public LdapUserSearch getUserSearch() {
        return this.userSearch;
    }

    public void setUserSearch(LdapUserSearch userSearch) {
        this.userSearch = userSearch;
    }
}
