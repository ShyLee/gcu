
package com.archibus.app.solution.common.webservice.employee.client;

import javax.xml.ws.WebFault;


/**
 * This class was generated by Apache CXF 2.2.5
 * Wed Jan 13 11:18:18 EST 2010
 * Generated source version: 2.2.5
 * 
 */

@WebFault(name = "DataRetrievalException", targetNamespace = "http://server.employee.webservice.mycompany.com/")
public class DataRetrievalException_Exception extends Exception {
    public static final long serialVersionUID = 20100113111818L;
    
    private com.archibus.app.solution.common.webservice.employee.client.DataRetrievalException dataRetrievalException;

    public DataRetrievalException_Exception() {
        super();
    }
    
    public DataRetrievalException_Exception(String message) {
        super(message);
    }
    
    public DataRetrievalException_Exception(String message, Throwable cause) {
        super(message, cause);
    }

    public DataRetrievalException_Exception(String message, com.archibus.app.solution.common.webservice.employee.client.DataRetrievalException dataRetrievalException) {
        super(message);
        this.dataRetrievalException = dataRetrievalException;
    }

    public DataRetrievalException_Exception(String message, com.archibus.app.solution.common.webservice.employee.client.DataRetrievalException dataRetrievalException, Throwable cause) {
        super(message, cause);
        this.dataRetrievalException = dataRetrievalException;
    }

    public com.archibus.app.solution.common.webservice.employee.client.DataRetrievalException getFaultInfo() {
        return this.dataRetrievalException;
    }
}
