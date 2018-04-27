package com.archibus.app.solution.common.webservice.employee.client;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

/**
 * This class was generated by Apache CXF 2.2.5
 * Wed Jan 13 11:18:18 EST 2010
 * Generated source version: 2.2.5
 * 
 */
 
@WebService(targetNamespace = "http://server.employee.webservice.mycompany.com/", name = "EmployeeService")
@XmlSeeAlso({ObjectFactory.class})
public interface EmployeeService {

    @ResponseWrapper(localName = "getEmployeesResponse", targetNamespace = "http://server.employee.webservice.mycompany.com/", className = "com.archibus.app.solution.common.webservice.employee.client.GetEmployeesResponse")
    @RequestWrapper(localName = "getEmployees", targetNamespace = "http://server.employee.webservice.mycompany.com/", className = "com.archibus.app.solution.common.webservice.employee.client.GetEmployees")
    @WebResult(name = "return", targetNamespace = "")
    @WebMethod
    public java.util.List<com.archibus.app.solution.common.webservice.employee.client.Employee> getEmployees(
        @WebParam(name = "arg0", targetNamespace = "")
        java.lang.String arg0,
        @WebParam(name = "arg1", targetNamespace = "")
        java.lang.String arg1
    ) throws InvalidArgumentException_Exception, DataRetrievalException_Exception;
}
