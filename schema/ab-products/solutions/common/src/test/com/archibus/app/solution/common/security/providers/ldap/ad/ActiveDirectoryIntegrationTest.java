package com.archibus.app.solution.common.security.providers.ldap.ad;

import org.springframework.security.*;
import org.springframework.security.providers.AuthenticationProvider;

import com.archibus.app.solution.common.security.*;
import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

/**
 * Integration test for activedirectory + afm_users configuration.
 * 
 * <p>
 * Uses real LDAP/AciveDirectory server. For the real LDAP server, enter url and root in
 * /security/ldap/activedirectory/ldap.properties. Also, enter username and password for the test
 * LDAP account in credentials.xml. Also, enter the expected values in assertions.
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    @Override
    protected void prepareTestInstance() throws Exception {
        this.setDependencyCheck(false);
        this.setLogin(false);

        super.prepareTestInstance();
    }

    private AuthenticationProvider authenticationProvider;

    private Authentication authenticationToken;

    /**
     * @return the authenticationToken
     */
    public Authentication getAuthenticationToken() {
        return this.authenticationToken;
    }

    /**
     * @param authenticationToken the authenticationToken to set
     */
    public void setAuthenticationToken(Authentication authenticationToken) {
        this.authenticationToken = authenticationToken;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/security/ldap/activedirectory/authentication.xml",
                "/security/ldap/activedirectory/mapping/many-to-one/account-mapper.xml",
                "/context/security/afm_users/useraccount.xml", "/context/core/core-infrastructure.xml",
                "/com/archibus/security/providers/ldap/ad/credentials.xml" };
    }

    public void testAuthenticate() throws ExceptionBase {
        Authentication authenticationResult = this.getAuthenticationProvider().authenticate(
            this.authenticationToken);

        GrantedAuthority[] authorities = authenticationResult.getAuthorities();

        assertEquals(1, authorities.length);
        assertEquals("%", authorities[0].getAuthority());

        UserAccount.Immutable userAccount = ((UserDetailsImpl) authenticationResult.getPrincipal())
            .getUserAccount();

        assertEquals("AI", userAccount.getName());
    }

    /**
     * @return the authenticationProvider
     */
    public AuthenticationProvider getAuthenticationProvider() {
        return this.authenticationProvider;
    }

    /**
     * @param authenticationProvider the authenticationProvider to set
     */
    public void setAuthenticationProvider(AuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
    }
}
