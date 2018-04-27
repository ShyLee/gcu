package com.archibus.app.reservation.service;

import java.util.List;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.ReservationException;
import com.archibus.app.reservation.domain.UserLocation;
import com.archibus.context.ContextStore;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.security.UserAccount.Immutable;

/**
 * Provides methods to retrieve employee / user information via email address.
 * 
 * @author Yorik Gerlo
 * @since 20.1
 * 
 */
public class EmployeeService implements IEmployeeService {
    
    /**
     * An error message indicating that a user is not an employee.
     */
    // @translatable
    private static final String USER_IS_NO_EMPLOYEE = "User is not an employee";
    
    /**
     * An error message indicating that the employee has no default location.
     */
    // @translatable
    private static final String EMPLOYEE_HAS_NO_LOCATION = "Employee has no location";
    
    
    /** The employee data source. */
    private EmployeeDataSource employeeDataSource;
    
    /**
     * {@inheritDoc}
     */
    public Employee findEmployee(final String email) {
        this.employeeDataSource.clearRestrictions();
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("em", "email", email, Operation.EQUALS);
        final List<Employee> employees = this.employeeDataSource.find(restriction);
        
        Employee employee = null;
        if (!employees.isEmpty()) {
            employee = employees.get(0);
        }
        return employee;
    }
    
    /**
     * {@inheritDoc}
     */
    public UserLocation findEmployeeLocation(final String email) throws ReservationException {
        final Immutable userAccount = ContextStore.get().getUserAccount();
        
        if (userAccount.getUser().getEmployee() == null) {
            throw new ReservationException(USER_IS_NO_EMPLOYEE, EmployeeService.class);
        }
        
        if (userAccount.getUser().getEmployee().getSpace() == null) {
            throw new ReservationException(EMPLOYEE_HAS_NO_LOCATION, EmployeeService.class);
        }
        
        final String ctryId = userAccount.getUser().getEmployee().getSpace().getCountryId();
        final String siteId = userAccount.getUser().getEmployee().getSpace().getSiteId();
        final String blId = userAccount.getUser().getEmployee().getSpace().getBuildingId();
        final String flId = userAccount.getUser().getEmployee().getSpace().getFloorId();
        final String rmId = userAccount.getUser().getEmployee().getSpace().getRoomId();
        
        final UserLocation userLocation = new UserLocation();
        userLocation.setCountryId(ctryId);
        userLocation.setSiteId(siteId);
        userLocation.setBuildingId(blId);
        userLocation.setFloorId(flId);
        userLocation.setRoomId(rmId);
        
        return userLocation;
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean isEmployeeEmail(final String email) {
        this.employeeDataSource.clearRestrictions();
        this.employeeDataSource.addRestriction(Restrictions.eq(Constants.EM_TABLE_NAME,
            Constants.EMAIL_FIELD_NAME, email));
        return !this.employeeDataSource.getRecords().isEmpty();
    }
    
  
    
    /**
     * Sets the employee data source.
     * 
     * @param employeeDataSource the new employee data source
     */
    public void setEmployeeDataSource(final EmployeeDataSource employeeDataSource) {
        this.employeeDataSource = employeeDataSource;
    }
    
}
