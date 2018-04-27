This folder contains configuration files for the following security configuration:

afm_users: use afm_users table for authentication.
password-encoder: SHA-1. The SHA password encoder requires WebCentral (will not work with ARCHIBUS for Windows).

To use this configuration: 
1. Use /WEB-INF/config/context/security/security-afm-users.xml configuration by entering value  security.configurationFile=context/security/security-afm-users.xml in /WEB-INF/config/security.properties file.
2. Modify the security-afm-users.xml file by replacing the reference to "\security\afm_users\password-encoder\archibus\password-encoder.xml" with "\security\afm_users\password-encoder\sha\password-encoder.xml".

