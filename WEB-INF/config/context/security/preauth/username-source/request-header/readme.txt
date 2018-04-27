This folder contains configuration files for the following security configuration:

Preauth

Use SSO server for authentication (an example of such SSO server is SiteMinder).
Get userId from HTTP request header.

To use this configuration: 

1. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-preauth-request-header.xml

2. Enter usernameKey parameter in \username-source\request-header\username-source.properties file.
SmartClient uses key "username".

3. Enter projectIdKey parameter in \projectid-source\request-header\projectid-source.properties file.
SmartClient uses key "projectId".
