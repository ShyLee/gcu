package com.archibus.app.reservation.service;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.domain.*;

/**
 * Interface for Employee service.
 * 
 * @author Bart Vanderschoot
 * @since 20.1
 * 
 */
public interface IEmployeeService {
    /**
     * Find an employee record based on his email address.
     * 
     * @param email the email address
     * @return the employee, or null of not found
     */
    Employee findEmployee(final String email);
    
    /**
     * Get the location information of the employee with the given email address.
     * 
     * @param email the email address of the employee
     * @return the location information
     * @throws ReservationException when the location information cannot be found
     */
    UserLocation findEmployeeLocation(final String email) throws ReservationException;
    
    /**
     * Check whether the given email address belongs to an employee.
     * 
     * @param email the email address to check
     * @return true if the email address belongs to an employee, false otherwise
     */
    boolean isEmployeeEmail(final String email);
    
}