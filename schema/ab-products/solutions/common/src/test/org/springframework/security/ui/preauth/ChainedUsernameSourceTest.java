/**
 * 
 */
package org.springframework.security.ui.preauth;

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import junit.framework.TestCase;

import org.springframework.mock.web.MockHttpServletRequest;

/**
 * @author Valery Tydykov
 * 
 */
public class ChainedUsernameSourceTest extends TestCase {

    /**
     * ChainedUsernameSource bean to be tested.
     */
    private ChainedUsernameSource usernameSource;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.usernameSource = new ChainedUsernameSource();
    }

    @Override
    protected void tearDown() throws Exception {
        this.usernameSource = null;

        super.tearDown();
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.ChainedUsernameSource#obtainUsername(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public final void testObtainUsernameSuppliedChainIsEmpty() {
        String value1 = "value1";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteUser(value1);

        String username = this.usernameSource.obtainUsername(request);

        assertEquals(null, username);
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.ChainedUsernameSource#obtainUsername(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public final void testObtainUsernameSupplied() {
        final String value1 = "value1";
        final String value2 = "value2";

        List<UsernameSource> usernameSources = new ArrayList<UsernameSource>();
        {
            usernameSources.add(new UsernameSource() {
                public String obtainUsername(HttpServletRequest request) {
                    // empty value
                    return null;
                }
            });

            usernameSources.add(new UsernameSource() {
                public String obtainUsername(HttpServletRequest request) {
                    // first non-empty value
                    return value1;
                }
            });

            usernameSources.add(new UsernameSource() {
                public String obtainUsername(HttpServletRequest request) {
                    // non-empty value, but should be ignored
                    return value2;
                }
            });
        }

        this.usernameSource.setUsernameSources(usernameSources);

        String username = this.usernameSource.obtainUsername(null);

        assertEquals(value1, username);
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.ChainedUsernameSource#obtainUsername(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public final void testObtainUsernameNotSuppliedChainIsEmpty() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        String username = this.usernameSource.obtainUsername(request);

        assertEquals(null, username);
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.ChainedUsernameSource#afterPropertiesSet()}.
     * 
     */
    public void testAfterPropertiesSet() throws Exception {
        // case: usernameSources is not null
        this.usernameSource.afterPropertiesSet();

        // case: usernameSources is null
        {
            this.usernameSource.setUsernameSources(null);

            try {
                this.usernameSource.afterPropertiesSet();
                fail("exception expected");
            } catch (Exception e) {
                assertTrue(e instanceof IllegalArgumentException);
            }
        }
    }

}
