This folder contains configuration files for the following remoting configuration:

Room Wizard (non-standard web services example).

To merge this configuration with the standard configuration (remoting + rendering):
----------------------------------------------------------------------------------

1. Include this file into WEB-INF\config\context\appContext.xml:

    <import resource="remoting\examples\roomwizard.xml" />

2. Add RoomWizardServiceServlet filter/servlet definitions and mappings to WEB-INF\web.xml.

    <!-- RoomWizardServiceServlet requests pass through Spring-managed filters -->
    <filter-mapping>
        <filter-name>springSecurityFilterChainRemoting</filter-name>
        <url-pattern>/rwconnector/*</url-pattern>
    </filter-mapping>
        
    <!-- Service servlet demonstrating integration with proprietary HTTP-based API - RoomWizard device
    -->
    <servlet>
        <servlet-name>RoomWizardServiceServlet</servlet-name>
        <display-name>RoomWizardServiceServlet</display-name>
        <servlet-class>
            com.archibus.app.solution.common.eventhandler.service.WorkflowRuleServiceServlet
        </servlet-class>
        <init-param>
            <param-name>workflowRuleName</param-name>
            <param-value>
                com.archibus.app.solution.common.eventhandler.service.RoomWizard.handle
            </param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>RoomWizardServiceServlet</servlet-name>
        <url-pattern>/rwconnector/*</url-pattern>
    </servlet-mapping>

3.	Enter the following URL in the browser: 
http://localhost:8080/archibus/rwconnector?command=about_connector 
The browser will show the XML response for the AboutConnector command. 
