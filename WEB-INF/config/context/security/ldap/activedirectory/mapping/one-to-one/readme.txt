This folder contains configuration files for the following security configuration:

One-to-one.
Use ActiveDirectory server for authentication, map ActiveDirectory account to ARCHIBUS account in afm_users table. 
Use username from LDAP account as username in afm_users.

To use this configuration: 

1. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-ldap-one-to-one.xml

2. Enter ldap.root, ldap.url, ldap.userDn, ldap.password parameters in activedirectory\ldap.properties file.
   If you want to encrypt passwords, use the following form: 
   on the Process Navigator: 
   System Administration / ARCHIBUS System Administration / ARCHIBUS Administrator / Encrypt Passwords in Configuration Files. 
