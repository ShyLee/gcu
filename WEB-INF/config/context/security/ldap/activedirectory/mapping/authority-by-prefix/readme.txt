This folder contains configuration files for the following security configuration:

Authority-by-prefix.
Use ActiveDirectory server for authentication, map ActiveDirectory account to ARCHIBUS account in afm_users table. 
Each LDAP account has authority (user role) with the specified prefix. 
That authority will be used as ARCHIBUS account name. 
The ARCHIBUS account should be configured as having the specified user role, 
and assigned corresponding processes.

To use this configuration: 

1. Make copy of \context\security\security-ldap-many-to-one.xml file and name new file security-ldap-authority-by-prefix.xml in \context\security folder.

2. Modify \context\security\security-ldap-authority-by-prefix.xml file: replace reference to "ldap\activedirectory\mapping\many-to-one\account-mapper.xml" with "ldap\activedirectory\mapping\authority-by-prefix\account-mapper.xml".

3. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-ldap-authority-by-prefix.xml

4. Enter ldap.root, ldap.url, ldap.userDn, ldap.password parameters in activedirectory\ldap.properties file.
   If you want to encrypt passwords, use the following form: 
   on the Process Navigator: 
   System Administration / ARCHIBUS System Administration / ARCHIBUS Administrator / Encrypt Passwords in Configuration Files. 

5. Enter authorityPrefix parameter in account-mapper.properties file.

