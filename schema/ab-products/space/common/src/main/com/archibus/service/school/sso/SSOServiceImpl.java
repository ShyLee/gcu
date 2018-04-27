package com.archibus.service.school.sso;

// Decompiled by DJ v3.7.7.81 Copyright 2004 Atanas Neshkov Date: 2014/11/14 14:06:02
// Home Page : http://members.fortunecity.com/neshkov/dj.html - Check often for new version!
// Decompiler options: packimports(3)
// Source File Name: SSOServiceImpl.java

import java.util.*;

import org.springframework.security.*;
import org.springframework.security.context.*;
import org.springframework.security.providers.UsernamePasswordAuthenticationToken;
import org.springframework.security.userdetails.UserDetailsService;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.security.*;
import com.archibus.utility.ExceptionBase;

public class SSOServiceImpl {
    
    private String redirectURL = "login.axvw";
    
    public String getRedirectURL() {
        return this.redirectURL;
    }
    
    public void setRedirectURL(final String redirectURL) {
        this.redirectURL = redirectURL;
    }
    
    public int ssoLogin(final String userId) throws Exception {
        if (userId != null && !"".equals(userId)) {
            if (isARCHIBUSUser(userId)) {
                final Context context = ContextStore.get();
                if (context.getUserSession() == null) {
                    login(userId);
                    return 1;
                } else {
                    return 2;
                }
            } else {
                return -1;
            }
        } else {
            return -2;
        }
    }
    
    private String login(final String userId) throws ExceptionBase {
        String url = "login.axvw";
        boolean isLogin = false;
        final Context context = ContextStore.get();
        if (context.getUserSession() != null) {
            isLogin = true;
        }
        
        if (!isLogin) {
            final SecurityContext securityContext = SecurityContextHolder.getContext();
            if ((securityContext != null) && (securityContext.getAuthentication() == null)) {
                setProject();
                
                final GrantedAuthority[] AUTHORITIES = { new GrantedAuthorityImpl("ROLE_USER") };
                
                final UserDetailsImpl userDetails =
                        (UserDetailsImpl) ((UserDetailsService) ContextStore.get().getBean(
                            "userAccountDao")).loadUserByUsername(userId);
                
                final UsernamePasswordAuthenticationToken authRequest =
                        new UsernamePasswordAuthenticationToken(userDetails, null, AUTHORITIES);
                
                if (securityContext != null) {
                    securityContext.setAuthentication(authRequest);
                }
                
                afterAuthentication(userDetails);
                
                url = context.getSecurityController().login();
                setRedirectURL(url);
                
            }
        }
        return url;
    }
    
    private boolean isARCHIBUSUser(final String userId) throws ExceptionBase {
        boolean flag = true;
        setProject();
        try {
            loadUserAccount(userId);
        } catch (final Exception e) {
            e.printStackTrace();
            flag = false;
        }
        return flag;
    }
    
    private void setProject() {
        final com.archibus.config.ConfigManager.Immutable configManager =
                ContextStore.get().getConfigManager();
        final List projects = configManager.getProjects();
        for (final Iterator iterator = projects.iterator(); iterator.hasNext();) {
            final com.archibus.config.Project.Immutable project =
                    (com.archibus.config.Project.Immutable) iterator.next();
            if (project.isOpen()) {
                ContextStore.get().setProject(project);
            }
        }
        
    }
    
    private com.archibus.security.UserAccount.ThreadSafe loadUserAccount(final String userId) {
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) ((UserDetailsService) ContextStore.get()
                    .getBean("userAccountDao")).loadUserByUsername(userId);
        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                (com.archibus.security.UserAccount.ThreadSafe) userDetails.getUserAccount();
        return userAccount;
    }
    
    private void afterAuthentication(final Authentication authentication, final boolean preauth) {
        final UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        final com.archibus.security.UserAccount.Immutable userAccount =
                userDetails.getUserAccount();
        final Context context = ContextStore.get();
        final com.archibus.config.Project.Immutable project = context.getProject();
        final String userId = userDetails.getUsername();
        final String sessionId = context.getSession().getId();
        final com.archibus.config.UserSession.Immutable userSession =
                project.loadUserSession(sessionId, userId, userAccount.getKey());
        if (!preauth && userSession.getException() != null) {
            throw userSession.getException();
        } else {
            context.setUserSession(userSession);
            return;
        }
    }
    
    public static void afterAuthentication(final UserDetailsImpl userDetails) {
        final UserAccount.Immutable userAccount = userDetails.getUserAccount();
        // Assert.notNull(userAccount, "userAccount must be supplied in UserDetailsImpl");
        
        final Context context = ContextStore.get();
        final Project.Immutable project = context.getProject();
        // Assert.notNull(project, "project must be supplied in context");
        
        final String userId = userDetails.getUsername();
        final String sessionId = context.getSession().getId();
        final UserSession.Immutable userSession =
                project.loadUserSession(sessionId, userId, userAccount.getKey());
        
        context.setUserSession(userSession);
    }
}