This folder contains configuration files for the following security configuration:

Preauth

Use SSO server for authentication.
Get userId from HTTP request parameter "username", supplied using POST method.

To use this configuration: 

1. In WEB-INF/config/security.properties modify security.configurationFile value:
	
	security.configurationFile=context/security/security-preauth-request-parameter.xml

2. Enter validReferers property values in username-source.xml.

3. In WEB-INF/config/smartclient.properties file enter value of smartClient.referer property matching one of the values entered into validReferers.

4. Enter projectIdKey parameter in \projectid-source\request-parameter\projectid-source.properties file.
SmartClient uses key "projectId".

5. Enter usernameKey parameter in \username-source\request-parameter\username-source.properties file.

6. Use /schema/ab-core/test/sso/test-ViewLoadWithRequestParameters.htm page to test the configuration. It has two buttons: 
- "SSO: Rooms view" button loads test-rm.axvw, supplies username as HTTP request parameter using POST method, supplies rm.rm_id='001' restriction as HTTP parameter;
- "SSO: Main view" button loads navigator-details.axvw, supplies username as HTTP request parameter using POST method;
