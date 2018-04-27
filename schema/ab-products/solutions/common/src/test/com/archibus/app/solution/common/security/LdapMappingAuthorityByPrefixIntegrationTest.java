package com.archibus.app.solution.common.security;

import org.springframework.security.*;
import org.springframework.security.userdetails.*;
import org.springframework.security.userdetails.ldap.AccountMapper;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for ldap/activedirectory/mapping/authority-by-prefix configuration.
 * 
 * @author Valery Tydykov
 * 
 */
public class LdapMappingAuthorityByPrefixIntegrationTest extends SpringContextTestBase {
    AccountMapper accountMapper;
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/ldap/activedirectory/mapping/authority-by-prefix/account-mapper.xml" };
    }
    
    public void testMap() {
        String expectedAuthority = "Afm_role1";
        GrantedAuthority[] authorities = { new GrantedAuthorityImpl(expectedAuthority),
                new GrantedAuthorityImpl("prefix1_role2") };
        UserDetails user = new User("username1", "password1", false, authorities);
        
        String username = this.accountMapper.map(user);
        
        assertEquals(expectedAuthority, username);
    }
    
    /**
     * @return the accountMapper
     */
    public AccountMapper getAccountMapper() {
        return this.accountMapper;
    }
    
    /**
     * @param accountMapper the accountMapper to set
     */
    public void setAccountMapper(AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }
}
