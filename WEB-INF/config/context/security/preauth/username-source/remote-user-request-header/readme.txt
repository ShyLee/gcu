This folder contains configuration files for the following security configuration:

Preauth

Use SSO server for authentication of requests from the browser. 
Mixed configuration:
- WebCentral gets userId from HttpServletRequest.getRemoteUser() method, when processing 
requests from the browser (rendering, DWR remoting);
- WebCentral gets userId from the header of HTTP request, when processing requests from 
the SmartClient (Web Services).

This configuration must be used if:
- WebCentral has to use HttpServletRequest.getRemoteUser() method; 
- And WebCentral has to work with SmartClient.

To use this configuration: 

1. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-preauth-remote-user-request-header.xml

2. Enter usernameKey parameter in username-source.properties file. 
SmartClient uses key "username".

3. Enter projectId parameter in \projectid-source\property\projectid-source.properties file.

