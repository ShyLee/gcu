package com.archibus.app.solution.common.security.providers.dao.memory;

import org.springframework.security.Authentication;
import org.springframework.security.GrantedAuthority;
import org.springframework.security.providers.ProviderManager;
import org.springframework.security.providers.UsernamePasswordAuthenticationToken;
import org.springframework.test.AbstractDependencyInjectionSpringContextTests;

import com.archibus.utility.ExceptionBase;

/**
 * Tests SecurityService event handler.
 */
public class AuthenticationManagerInMemoryTest extends
        AbstractDependencyInjectionSpringContextTests {
    ProviderManager providerManager;

    protected String[] getConfigLocations() {
        return new String[] { "/com/archibus/security/providers/dao/memory/authentication.xml" };
    }

    public void testAuthenticate() throws ExceptionBase {
        String userId = "tydykov";
        String password = "valery";
        Authentication authentication = new UsernamePasswordAuthenticationToken(userId, password);
        Authentication authenticationResult = this.getProviderManager()
            .authenticate(authentication);

        GrantedAuthority[] authorities = authenticationResult.getAuthorities();

        assertEquals(2, authorities.length);
        assertEquals("ROLE_TELLER", authorities[1].getAuthority());
        assertEquals("ROLE_SUPERVISOR", authorities[0].getAuthority());
    }

    public ProviderManager getProviderManager() {
        return this.providerManager;
    }

    public void setProviderManager(ProviderManager providerManager) {
        this.providerManager = providerManager;
    }
}
