package org.springframework.security.providers.ldap.ad.populator;

import java.util.Set;

import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.*;
import org.springframework.security.ldap.*;
import org.springframework.security.ldap.populator.DefaultLdapAuthoritiesPopulator;
import org.springframework.security.providers.ldap.authenticator.BindAuthenticator;

/**
 * <p>
 * Uses real LDAP/ActiveDirectory server. {See AbstractLdapIntegrationTests}
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryAuthoritiesPopulatorTest extends AbstractLdapIntegrationTests {

    private DefaultLdapAuthoritiesPopulator populator;

    private Authentication bob;

    DirContextOperations user;

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

        this.populator = new DefaultLdapAuthoritiesPopulator(getContextSource(), "");

        BindAuthenticator authenticator = new BindAuthenticator(getContextSource());
        authenticator.setMessageSource(new SpringSecurityMessageSource());
        authenticator.setUserSearch(this.userSearch);

        this.bob = getUsernamePasswordAuthenticationToken();

        this.user = authenticator.authenticate(this.bob);
    }

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.populator.DefaultLdapAuthoritiesPopulator#getGroupMembershipRoles(java.lang.String)}.
     */
    public final void testGetGroupMembershipRoles() {
        String userDn = this.user.getNameInNamespace();
        String username = (String) this.bob.getPrincipal();

        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        System.out.println(userDn);

        Set roles = this.populator.getGroupMembershipRoles(userDn, username);

        assertTrue(!roles.isEmpty());
    }

    /**
     * Test method for
     * {@link org.springframework.security.providers.ldap.ad.populator.DefaultLdapAuthoritiesPopulator#getGrantedAuthorities(org.springframework.ldap.core.DirContextOperations, java.lang.String)}.
     */
    public final void testGetGrantedAuthorities() {
        String username = (String) this.bob.getPrincipal();

        this.populator.setConvertToUpperCase(false);
        this.populator.setRolePrefix("");
        this.populator.setGroupSearchFilter("member={0}");
        this.populator.setGroupRoleAttribute("cn");
        this.populator.setSearchSubtree(true);

        System.out.println(this.user.getNameInNamespace());

        GrantedAuthority[] authorities = this.populator.getGrantedAuthorities(this.user, username);

        assertTrue(authorities.length > 0);
    }
}
