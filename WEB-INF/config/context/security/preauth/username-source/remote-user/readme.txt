This folder contains configuration files for the following security configuration:

Preauth

Use SSO server for authentication.
Get userId from HttpServletRequest.getRemoteUser() method.

To use this configuration: 

1. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-preauth-remote-user.xml

2. Enter projectId parameter in \projectid-source\property\projectid-source.properties file.
