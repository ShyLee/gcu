/**
 * 
 */
package org.springframework.security.ui.preauth;

import java.util.*;

import junit.framework.TestCase;

import org.springframework.mock.web.MockHttpServletRequest;

/**
 * @author Valery Tydykov
 * 
 */
public class RequestParameterAttributesSourceTest extends TestCase {

    private RequestParameterAttributesSource attributesSource;

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        this.attributesSource = new RequestParameterAttributesSource();
    }

    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        this.attributesSource = null;
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.RequestParameterAttributesSource#obtainAttributes(javax.servlet.http.HttpServletRequest)}
     * .
     */
    public void testObtainAttributes() {
        String key1 = "key1";
        String value1 = "value1";
        String key2 = "key2";
        String value2 = "value2";
        String key3 = "key3";

        {
            List<String> keys = new ArrayList<String>();
            keys.add(key1);
            keys.add(key2);
            keys.add(key3);
            this.attributesSource.setKeys(keys);
        }

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addParameter(key1, value1);
        request.addParameter(key2, value2);

        Map<String, String> attributes = this.attributesSource.obtainAttributes(request);

        assertEquals(value1, attributes.get(key1));
        assertEquals(value2, attributes.get(key2));
        assertEquals(null, attributes.get(key3));
    }

    /**
     * Test method for
     * {@link org.springframework.security.ui.preauth.RequestParameterAttributesSource#afterPropertiesSet()}
     * .
     * 
     * @throws Exception If afterPropertiesSet throws exception.
     */
    public void testAfterPropertiesSet() throws Exception {
        try {
            this.attributesSource.afterPropertiesSet();
            fail("exception expected");
        } catch (Exception e) {
            // exception expected
        }

        List<String> keys = new ArrayList<String>();
        this.attributesSource.setKeys(keys);
        this.attributesSource.afterPropertiesSet();
    }
}
