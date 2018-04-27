package com.archibus.app.solution.common.security;

import org.springframework.security.GrantedAuthority;
import org.springframework.security.userdetails.*;
import org.springframework.security.userdetails.ldap.AccountMapper;

import com.archibus.fixture.SpringContextTestBase;

/**
 * Integration test for ldap/activedirectory/mapping/many-to-one configuration.
 * 
 * @author Valery Tydykov
 * 
 */
public class LdapMappingManyToOneIntegrationTest extends SpringContextTestBase {
    
    AccountMapper accountMapper;
    
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
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/ldap/activedirectory/mapping/many-to-one/account-mapper.xml" };
    }
    
    public void testMap() {
        String usernameExpected = "AFM";
        UserDetails user = new User(usernameExpected, "password1", false, new GrantedAuthority[0]);
        String username = this.accountMapper.map(user);
        
        assertEquals(usernameExpected, username);
    }
}
