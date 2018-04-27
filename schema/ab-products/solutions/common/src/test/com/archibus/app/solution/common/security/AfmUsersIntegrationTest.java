package com.archibus.app.solution.common.security;

import java.io.IOException;

import javax.servlet.*;

import org.springframework.mock.web.*;
import org.springframework.security.Authentication;
import org.springframework.security.context.SecurityContextHolder;

import com.archibus.security.UserDetailsImpl;
import com.archibus.service.remoting.SecurityService;

/**
 * Integration test for security in afm_users configuration. Loads complete afm_users configuration,
 * including filters, but invokes SecurityService login/logout methods directly, bypassing filters.
 * To test at the HTTP request/response level, the DWR servlet would need to be configured, which is
 * not trivial.
 * 
 * @author Valery Tydykov
 * 
 */
public class AfmUsersIntegrationTest extends com.archibus.fixture.IntegrationTestBase {
    /*
     * (non-Javadoc)
     * 
     * @see com.archibus.fixture.ServiceTestBase#onSetUp()
     */
    @Override
    public void onSetUp() throws Exception {
        this.setLogin(false);
        super.onSetUp();
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/controls/drawing/controls-drawing.xml",
                "/context/rendering/jsp/filters-chain-rendering.xml",
                "/context/rendering/jsp/filters.xml",
                "/context/rendering/jsp/filters-rendering.xml",
                "/context/security/afm_users/security-service.xml",
                "/context/security/afm_users/authentication.xml",
                "/context/security/afm_users/useraccount.xml",
                "/context/security/afm_users/password-changer.xml",
                "/context/security/afm_users/password-manager.xml",
                "/context/security/afm_users/password-encoder/archibus/password-encoder.xml",
                "/context/security/afm_users/sql-security/password-changer.xml",
                "/context/security/afm_users/sql-security/password-encoder.xml",
                "/config/context/core/password-encryptor.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }
    
    public void testRendering() throws IOException, ServletException {
        // simulate first request
        Filter filter = (Filter) getApplicationContext().getBean(
            "springSecurityFilterChainRendering");
        
        MockHttpServletRequest request = new MockHttpServletRequest();
        {
            String uri = "/archibus/login.axvw";
            request.setServletPath(uri);
        }
        
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = new MockFilterChain();
        filter.doFilter(request, response, filterChain);
    }
    
    public void testLoginLogout() throws IOException, ServletException {
        SecurityService securityService = (SecurityService) getApplicationContext().getBean(
            "securityService");
        
        securityService.loginDo(getUserId(), getPassword(), getProjectId(), null);
        
        Authentication result = SecurityContextHolder.getContext().getAuthentication();
        
        assertTrue(result != null);
        assertEquals(getUserId(), ((UserDetailsImpl) result.getPrincipal()).getUsername());
        
        // simulate logout request
        securityService.logout();
        
        result = SecurityContextHolder.getContext().getAuthentication();
        
        assertEquals(null, result);
    }
}
