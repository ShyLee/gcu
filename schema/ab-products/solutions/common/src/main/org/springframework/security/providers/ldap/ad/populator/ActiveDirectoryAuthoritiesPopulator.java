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
package org.springframework.security.providers.ldap.ad.populator;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import javax.naming.Context;
import javax.naming.directory.SearchControls;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.GrantedAuthority;
import org.springframework.security.GrantedAuthorityImpl;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.LdapAuthoritiesPopulator;
import org.springframework.security.ldap.SpringSecurityContextSource;
import org.springframework.security.providers.ldap.ad.ActiveDirectoryLdapTemplate;
import org.springframework.security.providers.ldap.ad.util.*;
import org.springframework.util.Assert;

/**
 * Obtains user role information from the directory. Uses ActiveDirectory - specific syntax for LDAP
 * parameters.
 * <p>
 * It obtains roles by performing a search for "groups" the user is a member of. Can only use
 * <tt>DefaultSpringSecurityContextSource</tt> as contextSource. Similar to
 * <code>DefaultLdapAuthoritiesPopulator</code>
 * 
 * @author Valery Tydykov
 * 
 */
public class ActiveDirectoryAuthoritiesPopulator implements LdapAuthoritiesPopulator {

    /**
     * Logger for this class and subclasses
     */
    protected final Log logger = LogFactory.getLog(this.getClass());

    /**
     * A default role which will be assigned to all authenticated users if set
     */
    private GrantedAuthority defaultRole;

    private ContextSource contextSource;

    /**
     * Controls used to determine whether group searches should be performed over the full sub-tree
     * from the base DN. Modified by searchSubTree property
     */
    private final SearchControls searchControls = new SearchControls();

    /**
     * The ID of the attribute which contains the role name for a group
     */
    private String groupRoleAttribute = "cn";

    /**
     * The base DN from which the search for group membership should be performed
     */
    private String groupSearchBase;

    /**
     * The pattern to be used for the user search. {0} is the user's DN
     */
    private String groupSearchFilter = "member={0}";

    /**
     * Attributes of the User's LDAP Object that contain role name information.
     */
    private String rolePrefix = "ROLE_";

    private boolean convertToUpperCase = true;

    /**
     * Constructor for group search scenarios. <tt>userRoleAttributes</tt> may still be set as a
     * property.
     * 
     * @param contextSource supplies the contexts used to search for user roles.
     * @param groupSearchBase if this is an empty string the search will be performed from the root
     *            DN of the context factory.
     */
    public ActiveDirectoryAuthoritiesPopulator(DefaultSpringSecurityContextSource contextSource,
            String groupSearchBase) {
        this.setContextSource(contextSource);
        this.setGroupSearchBase(groupSearchBase);
    }

    // ~ Methods
    // ========================================================================================================

    /**
     * This method should be overridden if required to obtain any additional roles for the given
     * user (on top of those obtained from the standard search implemented by this class).
     * 
     * @param user the context representing the user who's roles are required
     * @return the extra roles which will be merged with those returned by the group search
     */

    protected Set getAdditionalRoles(DirContextOperations user, String username) {
        return null;
    }

    /**
     * @return the defaultRole
     */
    public GrantedAuthority getDefaultRole() {
        return this.defaultRole;
    }

    /**
     * @param defaultRole the defaultRole to set
     */
    public void setDefaultRole(GrantedAuthority defaultRole) {
        this.defaultRole = defaultRole;
    }

    /**
     * Set the {@link ContextSource}
     * 
     * @param contextSource supplies the contexts used to search for user roles.
     */
    private void setContextSource(DefaultSpringSecurityContextSource contextSource) {
        Assert.notNull(contextSource, "contextSource must not be null");
        this.contextSource = contextSource;
    }

    protected ContextSource getContextSource() {
        return contextSource;
    }

    /**
     * Set the group search base (name to search under)
     * 
     * @param groupSearchBase if this is an empty string the search will be performed from the root
     *            DN of the context factory.
     */
    private void setGroupSearchBase(String groupSearchBase) {
        Assert.notNull(groupSearchBase,
            "The groupSearchBase (name to search under), must not be null.");
        this.groupSearchBase = groupSearchBase;
        if (groupSearchBase.length() == 0) {
            logger
                .info("groupSearchBase is empty. Searches will be performed from the context source base");
        }
    }

    /**
     * @return the groupRoleAttribute
     */
    public String getGroupRoleAttribute() {
        return this.groupRoleAttribute;
    }

    /**
     * @return the groupSearchFilter
     */
    public String getGroupSearchFilter() {
        return this.groupSearchFilter;
    }

    /**
     * @return the rolePrefix
     */
    public String getRolePrefix() {
        return this.rolePrefix;
    }

    /**
     * @return the convertToUpperCase
     */
    public boolean isConvertToUpperCase() {
        return this.convertToUpperCase;
    }

    public Set getGroupMembershipRoles(String userDn, String username, String password) {
        Set authorities = new HashSet();

        if (getGroupSearchBase() == null) {
            return authorities;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("Searching for roles for user with DN = " + "'" + userDn
                    + "', with filter " + groupSearchFilter + " in search base '" + groupSearchBase
                    + "'");
        }

        String principalDn = determinePrincipalDn(username);

        // bind as principalDn/password
        ActiveDirectoryLdapTemplate template = new ActiveDirectoryLdapTemplate(
            new BindWithSpecificDnContextSource((SpringSecurityContextSource) getContextSource(),
                principalDn, password));
        template.setSearchControls(searchControls);

        // search for roles userDn is member of
        Set userRoles = template.searchForSingleAttributeValues(getGroupSearchBase(),
            groupSearchFilter, new String[] { userDn }, groupRoleAttribute);

        if (logger.isDebugEnabled()) {
            logger.debug("Roles from search: " + userRoles);
        }

        // convert role names to GrantedAuthorityImpl objects
        // for each role
        Iterator it = userRoles.iterator();
        while (it.hasNext()) {
            String role = (String) it.next();

            if (convertToUpperCase) {
                role = role.toUpperCase();
            }

            authorities.add(new GrantedAuthorityImpl(rolePrefix + role));
        }

        return authorities;
    }

    protected String getGroupSearchBase() {
        return groupSearchBase;
    }

    public void setConvertToUpperCase(boolean convertToUpperCase) {
        this.convertToUpperCase = convertToUpperCase;
    }

    /**
     * The default role which will be assigned to all users.
     * 
     * @param defaultRole the role name, including any desired prefix.
     */
    public void setDefaultRole(String defaultRole) {
        Assert.hasLength(defaultRole, "defaultRole must be not empty");
        this.defaultRole = new GrantedAuthorityImpl(defaultRole);
    }

    public void setGroupRoleAttribute(String groupRoleAttribute) {
        Assert.hasLength(groupRoleAttribute, "groupRoleAttribute must be not empty");
        this.groupRoleAttribute = groupRoleAttribute;
    }

    public void setGroupSearchFilter(String groupSearchFilter) {
        Assert.hasLength(groupSearchFilter, "groupSearchFilter must be not empty");
        this.groupSearchFilter = groupSearchFilter;
    }

    public void setRolePrefix(String rolePrefix) {
        Assert.notNull(rolePrefix, "rolePrefix must not be null");
        this.rolePrefix = rolePrefix;
    }

    /**
     * If set to true, a subtree scope search will be performed. If false a single-level search is
     * used.
     * 
     * @param searchSubtree set to true to enable searching of the entire tree below the
     *            <tt>groupSearchBase</tt>.
     */
    public void setSearchSubtree(boolean searchSubtree) {
        int searchScope = searchSubtree ? SearchControls.SUBTREE_SCOPE
                : SearchControls.ONELEVEL_SCOPE;
        searchControls.setSearchScope(searchScope);
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.security.ldap.LdapAuthoritiesPopulator#getGrantedAuthorities(org.springframework.ldap.core.DirContextOperations,
     *      java.lang.String)
     */
    public final GrantedAuthority[] getGrantedAuthorities(DirContextOperations user, String username) {
        String userDn = user.getNameInNamespace();

        if (logger.isDebugEnabled()) {
            logger.debug("Getting authorities for user " + userDn);
        }

        // password must be supplied by the ActiveDirectoryBindAuthenticator
        String password = user.getStringAttribute(Context.SECURITY_CREDENTIALS);

        Set roles = getGroupMembershipRoles(userDn, username, password);

        Set extraRoles = getAdditionalRoles(user, username);

        if (extraRoles != null) {
            roles.addAll(extraRoles);
        }

        if (defaultRole != null) {
            roles.add(defaultRole);
        }

        return (GrantedAuthority[]) roles.toArray(new GrantedAuthority[roles.size()]);
    }

    /**
     * Generates principalDn in the form: <code>username@dc1.dc2</code>
     * 
     * @param username for which to generate the principalDn
     * @return generated principalDn
     */
    private String determinePrincipalDn(String username) {
        String rootDn = ((DefaultSpringSecurityContextSource) getContextSource())
            .getBaseLdapPathAsString();

        String principalDn = NamingUtils.preparePrincipalDn(username, rootDn);

        return principalDn;
    }
}
