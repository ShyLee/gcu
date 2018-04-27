package com.archibus.app.reservation.service;

import junit.framework.Assert;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.domain.*;

/**
 * The Class EmployeeServiceTest.
 */
public class EmployeeServiceTest extends ReservationServiceTestBase {
    
    /**
     * Test find employee.
     */
    public final void testFindEmployee() {
        final Employee employee = this.employeeService.findEmployee(AFM_EMAIL);
        Assert.assertNotNull(employee);
    }
    
    /**
     * Test find employee location.
     * 
     * @throws ReservationException the reservation exception
     */
    public final void testFindEmployeeLocation() throws ReservationException {
        final UserLocation employee = this.employeeService.findEmployeeLocation(AFM_EMAIL);
        
        Assert.assertNotNull(employee);
    }
    
    /**
     * test employee.
     */
    public final void testIsEmployee() {
        Assert.assertTrue(this.employeeService.isEmployeeEmail(AFM_EMAIL));
    }
    
}
