/* Copyright 2004, 2005, 2006 Acegi Technology Pty Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.security.userdetails.preauth;

import junit.framework.TestCase;

import org.springframework.security.Authentication;
import org.springframework.security.providers.TestingAuthenticationToken;
import org.springframework.security.userdetails.UserDetails;
import org.springframework.security.userdetails.memory.*;

/**
 * @author Valery Tydykov
 * 
 */
public class UserDetailsMappingServiceWrapperTest extends TestCase {

    UserDetailsMappingServiceWrapper service;

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        this.service = new UserDetailsMappingServiceWrapper();
    }

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        this.service = null;
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#afterPropertiesSet()}.
     */
    public final void testAfterPropertiesSet() {
        try {
            this.service.afterPropertiesSet();
            fail("expected exception");
        } catch (IllegalArgumentException expected) {
        } catch (Exception unexpected) {
            fail("unexpected exception");
        }
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#loadUserDetails(org.springframework.security.Authentication)}.
     */
    public final void testLoadUserDetails() {
        String username = "rod,ok";
        UsernameFromPropertyAccountMapper accountMapper = new UsernameFromPropertyAccountMapper();
        accountMapper.setUsername(username);

        this.service.setAccountMapper(accountMapper);

        // secondary user accounts repository
        {
            InMemoryDaoImpl dao = new InMemoryDaoImpl();
            UserMapEditor editor = new UserMapEditor();
            editor.setAsText("rod,ok=koala,ROLE_ONE,ROLE_TWO,enabled\r\n");
            dao.setUserMap((UserMap) editor.getValue());

            this.service.setUserDetailsService(dao);
        }

        Authentication authentication = new TestingAuthenticationToken("any", "any");
        UserDetails user = this.service.loadUserDetails(authentication);

        // verify that userDetails came from the secondary repository
        assertEquals("ROLE_ONE", user.getAuthorities()[0].getAuthority());
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#setUserDetailsService(org.springframework.security.userdetails.UserDetailsService)}.
     */
    public final void testSetUserDetailsService() {
        try {
            this.service.setUserDetailsService(null);
            fail("exception expected");
        } catch (IllegalArgumentException expected) {
        } catch (Exception unexpected) {
            fail("unexpected exception");
        }
    }

    /**
     * Test method for
     * {@link org.springframework.security.userdetails.preauth.UserDetailsMappingServiceWrapper#setAccountMapper(org.springframework.security.userdetails.preauth.AccountMapper)}.
     */
    public final void testSetAccountMapper() {
        try {
            this.service.setAccountMapper(null);
            fail("exception expected");
        } catch (IllegalArgumentException expected) {
        } catch (Exception unexpected) {
            fail("unexpected exception");
        }
    }
}
