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
package org.springframework.security.providers.ldap.ad.authenticator;

import java.text.MessageFormat;

import javax.naming.Context;

import org.apache.commons.logging.*;
import org.springframework.context.*;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.ldap.core.*;
import org.springframework.security.*;
import org.springframework.security.ldap.*;
import org.springframework.security.providers.UsernamePasswordAuthenticationToken;
import org.springframework.security.providers.ldap.LdapAuthenticator;
import org.springframework.security.providers.ldap.ad.util.*;
import org.springframework.util.Assert;

/**
 * An authenticator which binds as a user. Generates ActiveDirectory - specific syntax of LDAP
 * parameters. Can only use <tt>DefaultSpringSecurityContextSource</tt> as contextSource. Similar
 * to <code>BindAuthenticator</code>.
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryBindAuthenticator implements LdapAuthenticator, MessageSourceAware {
    private final ContextSource contextSource;

    protected MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor();

    /**
     * Logger for this class and subclasses.
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * Create an initialized instance using the {@link DefaultSpringSecurityContextSource} provided.
     * 
     * @param contextSource the DefaultSpringSecurityContextSource instance against which bind
     *            operations will be performed.
     * 
     */
    public ActiveDirectoryBindAuthenticator(DefaultSpringSecurityContextSource contextSource) {
        Assert.notNull(contextSource, "contextSource must not be null.");
        this.contextSource = contextSource;
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.security.providers.ldap.LdapAuthenticator#authenticate(org.springframework.security.Authentication)
     */
    public DirContextOperations authenticate(Authentication authentication) {
        Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication,
            "Can only process UsernamePasswordAuthenticationToken objects");

        String username = authentication.getName();
        String password = (String) authentication.getCredentials();

        // Active Directory requires principalDn in the form: username@dc1.dc2.
        String principalDn = determinePrincipalDn(username);

        DirContextOperations user = bindWithDn(principalDn, username, password);

        if (user == null) {
            throw new BadCredentialsException(this.messages.getMessage(
                "BindAuthenticator.badCredentials", "Bad credentials"));
        }

        // Store password in user: will be used by the authorities populator to bind (again)
        // as username/password.
        user.addAttributeValue(Context.SECURITY_CREDENTIALS, password);

        return user;
    }

    /**
     * Generates principalDn in the form: <code>username@dc1.dc2</code>
     * 
     * @param username for which to generate the principalDn
     * @return generated principalDn
     */
    protected String determinePrincipalDn(String username) {
        String rootDn = ((DefaultSpringSecurityContextSource) getContextSource())
            .getBaseLdapPathAsString();

        String principalDn = NamingUtils.preparePrincipalDn(username, rootDn);

        return principalDn;
    }

    protected static final String USER_SEARCH_FILTER = "(&(objectClass=user)(samAccountName={0}))";

    /**
     * @param principalDn
     * @param username
     * @param password
     * @return
     */
    protected DirContextOperations bindWithDn(String principalDn, String username, String password) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Bind with dn=[" + principalDn + "], username=[" + username + "]");
        }

        // bind as principalDn/password)
        SpringSecurityLdapTemplate template = new SpringSecurityLdapTemplate(
            new BindWithSpecificDnContextSource((SpringSecurityContextSource) getContextSource(),
                principalDn, password));

        // search for account info for username
        Object[] params = null;
        String base = "";

        String formattedFilter = MessageFormat
            .format(USER_SEARCH_FILTER, new Object[] { username });

        return template.searchForSingleEntry(base, formattedFilter, params);
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.context.MessageSourceAware#setMessageSource(org.springframework.context.MessageSource)
     */
    public void setMessageSource(MessageSource messageSource) {
        Assert.notNull("Message source must not be null");
        this.messages = new MessageSourceAccessor(messageSource);
    }

    /**
     * @return the contextSource
     */
    public ContextSource getContextSource() {
        return this.contextSource;
    }
}
