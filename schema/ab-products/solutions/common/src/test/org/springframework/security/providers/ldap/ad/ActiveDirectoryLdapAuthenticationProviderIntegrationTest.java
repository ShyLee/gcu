package org.springframework.security.providers.ldap.ad;

import org.springframework.security.*;
import org.springframework.security.ldap.*;
import org.springframework.security.ldap.populator.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.providers.ldap.LdapAuthenticationProvider;
import org.springframework.security.providers.ldap.authenticator.BindAuthenticator;
import org.springframework.security.userdetails.ldap.*;
import org.springframework.security.userdetails.memory.*;

/**
 * Integration test for {@link ActiveDirectoryAuthoritiesPopulator} and
 * {@link ActiveDirectoryBindAuthenticator}.
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryLdapAuthenticationProviderIntegrationTest extends
        AbstractLdapIntegrationTests {
    private BindAuthenticator authenticator;

    private DefaultLdapAuthoritiesPopulator populator;

    private Authentication bob;

    private LdapAuthenticationProvider authenticationProvider;

    private LdapUserSearch userSearch;

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.userSearch = (LdapUserSearch) appContext.getBean("userSearch");

        this.authenticator = new BindAuthenticator(getContextSource());
        this.authenticator.setMessageSource(new SpringSecurityMessageSource());
        this.authenticator.setUserSearch(this.userSearch);

        this.populator = new DefaultLdapAuthoritiesPopulator(getContextSource(), "");
        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        this.authenticationProvider = new LdapAuthenticationProvider(this.authenticator,
            this.populator);

        this.bob = getUsernamePasswordAuthenticationToken();
    }

    public void testAuthenticate() {
        Authentication authenticationResult = this.authenticationProvider.authenticate(this.bob);

        GrantedAuthority[] authorities = authenticationResult.getAuthorities();
        assertTrue(authorities.length > 0);
    }

    public void testAuthenticateWithInMemoryDao() {
        {
            ReplacingUserDetailsMapper userDetailsContextMapper = new ReplacingUserDetailsMapper();
            {
                // All LDAP accounts mapped to single secondary account "rod"
                UsernameFromPropertyAccountMapper accountMapper = new UsernameFromPropertyAccountMapper();
                accountMapper.setUsername("rod,ok");
                userDetailsContextMapper.setAccountMapper(accountMapper);
            }

            userDetailsContextMapper.setConvertToUpperCase(false);

            // create secondary user accounts repository
            {
                InMemoryDaoImpl dao = new InMemoryDaoImpl();
                UserMapEditor editor = new UserMapEditor();
                editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
                dao.setUserMap((UserMap) editor.getValue());

                userDetailsContextMapper.setUserDetailsService(dao);
            }

            this.authenticationProvider.setUserDetailsContextMapper(userDetailsContextMapper);
        }

        Authentication authenticationResult = this.authenticationProvider.authenticate(this.bob);

        GrantedAuthority[] authorities = authenticationResult.getAuthorities();

        assertEquals(2, authorities.length);
        assertEquals("ROLE_ONE", authorities[0].getAuthority());
    }
}
