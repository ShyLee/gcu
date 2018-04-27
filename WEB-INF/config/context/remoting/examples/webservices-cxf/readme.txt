This folder contains configuration files for the following remoting configuration:

Webservices - CXF.

To use this configuration:
----------------------------------------------------------------------------------

1. Modify two lines in /WEB-INF/config/remoting.properties file:

remoting.configurationFile=context/remoting/examples/cxf.xml

uncomment line:
remoting.projectId=HQ-Sybase-Runtime

2. Test URLs:
---------
http://localhost:8080/archibus/cxf/BookingService/getRooms
The browser will show the XML response for the getRooms method. 

http://localhost:8080/archibus/cxf/LogicExampleService/getRecordByPrimaryKey?arg0=2004000001
The browser will show the XML response for the getRecordByPrimaryKey method. 

http://localhost:8080/archibus/cxf/HelloWorld/sayHi?arg0=1
The browser will show the XML response for the sayHi method. 

