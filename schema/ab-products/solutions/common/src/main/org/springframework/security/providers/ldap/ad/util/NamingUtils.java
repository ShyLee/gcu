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
package org.springframework.security.providers.ldap.ad.util;

import java.util.List;

import org.springframework.security.util.StringUtils;
import org.springframework.util.Assert;

/**
 * @author Valery Tydykov
 * 
 */
public final class NamingUtils {
    /**
     * This is a static class that should not be instantiated.
     */
    private NamingUtils() throws InstantiationException {
    }

    /**
     * Prepare principalDn in the form required by Active Directory: <code>username@dc1.dc2</code>
     * 
     * @param username for which to generate the principalDn
     * @param rootDn For example: "DC=dc1,DC=dc2"
     * @return generated principalDn
     */
    public static String preparePrincipalDn(String username, String rootDn) {
        String principalDn = username + "@" + prepareDomainControllers(rootDn);

        return principalDn;
    }

    /**
     * Extracts DCs from ldap root parameter and prepares string: "dc1.dc2"
     * 
     * @param rootDn For example: "DC=dc1,DC=dc2"
     * @return The domain controllers string in Active Directory format.
     */
    public static String prepareDomainControllers(String rootDn) {
        List dcNameValues = StringUtils.tokenizeString(rootDn, ",");

        String domainControllers = "";
        for (int i = 0; i < dcNameValues.size(); i++) {
            if (i > 0) {
                domainControllers += ".";
            }

            List dcNameValue = StringUtils.tokenizeString((String) dcNameValues.get(i), "=");
            if (dcNameValue.size() == 2) {
                domainControllers += (String) dcNameValue.get(1);
            }
        }

        Assert.hasLength(domainControllers, "domainControllers must not be empty");

        return domainControllers;
    }
}
