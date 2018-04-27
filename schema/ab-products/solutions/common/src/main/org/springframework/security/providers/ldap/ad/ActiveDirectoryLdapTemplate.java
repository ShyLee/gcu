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
package org.springframework.security.providers.ldap.ad;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.naming.NamingEnumeration;
import javax.naming.directory.DirContext;
import javax.naming.directory.SearchControls;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ldap.NamingException;
import org.springframework.ldap.core.ContextMapper;
import org.springframework.ldap.core.ContextMapperCallbackHandler;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextProcessor;
import org.springframework.ldap.core.NameClassPairCallbackHandler;
import org.springframework.ldap.core.SearchExecutor;
import org.springframework.security.ldap.SpringSecurityLdapTemplate;

/**
 * ActiveDirectory equivalent of the SpringSecurityLdapTemplate class.
 * <p>
 * Simplifies ActiveDirectory access within Spring Security's ActiveDirectory-related services. Used
 * </p>
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryLdapTemplate extends SpringSecurityLdapTemplate {
    /**
     * Logger for this class and subclasses
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /** Default search controls */
    private final SearchControls searchControls = new SearchControls();

    /**
     * @param contextSource
     */
    public ActiveDirectoryLdapTemplate(ContextSource contextSource) {
        super(contextSource);

        searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.security.ldap.SpringSecurityLdapTemplate#searchForSingleAttributeValues(java.lang.String,
     *      java.lang.String, java.lang.Object[], java.lang.String)
     */
    public Set searchForSingleAttributeValues(String base, String filter, Object[] filterArgs,
            final String attributeName) {
        final HashSet set = new HashSet();

        ContextMapper roleMapper = new ContextMapper() {
            public Object mapFromContext(Object ctx) {
                DirContextAdapter adapter = (DirContextAdapter) ctx;
                String[] values = adapter.getStringAttributes(attributeName);
                if (values == null || values.length == 0) {
                    logger.debug("No attribute value found for '" + attributeName + "'");
                } else {
                    set.addAll(Arrays.asList(values));
                }
                return null;
            }
        };

        SearchControls ctls = new SearchControls();
        ctls.setSearchScope(searchControls.getSearchScope());
        ctls.setReturningAttributes(new String[] { attributeName });
        // ActiveDirectory - specific
        ctls.setReturningObjFlag(true);

        // ActiveDirectory - specific
        search(base, filter, filterArgs, ctls, roleMapper);

        return set;
    }

    public List search(String base, String filter, Object[] filterArgs, SearchControls controls,
            ContextMapper mapper) {
        return search(base, filter, filterArgs, controls, mapper, new NullDirContextProcessor());
    }

    public List search(String base, String filter, Object[] filterArgs, SearchControls controls,
            ContextMapper mapper, DirContextProcessor processor) {
        ContextMapperCallbackHandler handler = new ContextMapperCallbackHandler(mapper);
        search(base, filter, filterArgs, controls, handler, processor);

        return handler.getList();
    }

    public void search(final String base, final String filter, final Object[] filterArgs,
            final SearchControls controls, NameClassPairCallbackHandler handler,
            DirContextProcessor processor) {

        // Create a SearchExecutor to perform the search.
        SearchExecutor se = new SearchExecutor() {
            public NamingEnumeration executeSearch(DirContext ctx)
                    throws javax.naming.NamingException {
                return ctx.search(base, filter, filterArgs, controls);
            }
        };

        search(se, handler, processor);
    }

    private final class NullDirContextProcessor implements DirContextProcessor {
        public void postProcess(DirContext ctx) throws NamingException {
            // Do nothing
        }

        public void preProcess(DirContext ctx) throws NamingException {
            // Do nothing
        }
    }
}
