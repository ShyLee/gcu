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

import javax.naming.directory.DirContext;

import org.springframework.dao.DataAccessException;
import org.springframework.ldap.core.ContextSource;
import org.springframework.security.ldap.SpringSecurityContextSource;

/**
 * @author Valery Tydykov
 * 
 */
public class BindWithSpecificDnContextSource implements ContextSource {
    private final SpringSecurityContextSource ctxFactory;

    private final String userDn;

    private final String password;

    public BindWithSpecificDnContextSource(SpringSecurityContextSource ctxFactory, String userDn,
            String password) {
        this.ctxFactory = ctxFactory;
        this.userDn = userDn;
        this.password = password;
    }

    public DirContext getReadOnlyContext() throws DataAccessException {
        return ctxFactory.getReadWriteContext(userDn, password);
    }

    public DirContext getReadWriteContext() throws DataAccessException {
        return getReadOnlyContext();
    }
}
