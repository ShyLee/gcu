package com.archibus.app.reservation.domain;

import java.sql.Time;
import java.util.*;

/**
 * Interface for a reservation.
 * 
 * @author Bart Vanderschoot
 * 
 */
public interface IReservation extends ITimePeriodBased {
    
    /**
     * Gets the attendees.
     * 
     * @return the attendees
     */
    String getAttendees();
    
    /**
     * Gets the requested by.
     * 
     * @return the requested by
     */
    String getRequestedBy();
    
    /**
     * Gets the requested for.
     * 
     * @return the requested for
     */
    String getRequestedFor();
    
    /**
     * Gets the reserve id.
     * 
     * @return the reserve id
     */
    Integer getReserveId();
    
    /**
     * Gets the resource allocations.
     * 
     * @return the resource allocations
     */
    List<ResourceAllocation> getResourceAllocations();
    
    /**
     * Gets the status.
     * 
     * @return the status
     */
    String getStatus();
    
    /**
     * Gets the unique id coming from Exchange/Outlook.
     * 
     * @return the unique id
     */
    String getUniqueId();
    
    /**
     * 
     * Set the unique Id coming from Exchange/Outlook.
     * 
     * @param uniqueId unique Id
     */
    void setUniqueId(String uniqueId);
    
    /**
     * Set the last modified by.
     * 
     * @param employeeId employee id
     */
    void setLastModifiedBy(String employeeId);
    
    /**
     * Set the last modified date.
     * 
     * @param date date
     */
    void setLastModifiedDate(Date date);
    
    /**
     * Sets the reserve id.
     * 
     * @param id the new reserve id
     */
    void setReserveId(Integer id);
    
    /**
     * Gets the time zone.
     * 
     * @return the time zone
     */
    String getTimeZone();
    
    /**
     * Determines the current local date for this reservation.
     * 
     * @return the current local date
     */
    Date determineCurrentLocalDate();
    
    /**
     * Determines the current local time for this reservation.
     * 
     * @return the current local time
     */
    Time determineCurrentLocalTime();
}
