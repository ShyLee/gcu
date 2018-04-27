package com.archibus.app.reservation.domain;

import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.utility.StringUtil;

/**
 * Abstract reservation class.
 * 
 * Implements the Reservation interface.
 * 
 * @author Bart Vanderschoot
 * 
 *         <p>
 *         Suppressed warning "PMD.TooManyFields" in this class.
 *         <p>
 *         Justification: reservations have a large number of fields in the database
 * 
 *         <p>
 *         Suppressed warning "PMD.TooManyMethods" in this class.
 *         <p>
 *         Justification: many methods required
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "AbstractReservation")
@SuppressWarnings({ "PMD.TooManyMethods", "PMD.TooManyFields" })
public abstract class AbstractReservation extends AbstractReservationBase implements IReservation {
    
    /** The account id. */
    private String accountId;
    
    /** The attendees. */
    private String attendees;
    
    /** The contact. */
    private String contact;
    
    /** The department id. */
    private String departmentId;
    
    /** The division id. */
    private String divisionId;
    
    /** The email. */
    private String email;
    
    /** The requested by. */
    private String requestedBy;
    
    /** The requested for. */
    private String requestedFor;
    
    /**
     * parent ID when there is a recurrent reservation.
     */
    private Integer parentId;
    
    /** The phone. */
    private String phone;
    
    /**
     * The recurring rule is an XML format that describes the recurring type and settings.
     */
    private String recurringRule;
    
    /** The reservation name. */
    private String reservationName;
    
    /**
     * The reservation type might be 'regular' or 'recurring'.
     */
    private String reservationType;
    
    /** The resource allocations. */
    private List<ResourceAllocation> resourceAllocations;
    
    /**
     * Unique ID for reservation used in MS Exchange.
     */
    private String uniqueId;
    
    /**
     * Instantiates a new abstract reservation.
     */
    public AbstractReservation() {
        super();
    }
    
    /**
     * Instantiates a new abstract reservation.
     * 
     * @param reserveId the reserve id
     */
    public AbstractReservation(final Integer reserveId) {
        super(reserveId);
    }
    
    /**
     * Adds the resource allocation.
     * 
     * @param resourceAllocation the resource allocation
     */
    public final void addResourceAllocation(final ResourceAllocation resourceAllocation) {
        if (this.resourceAllocations == null) {
            this.resourceAllocations = new ArrayList<ResourceAllocation>();
        }
        this.resourceAllocations.add(resourceAllocation);
        resourceAllocation.setReservation(this);
    }
    
    /**
     * Remove a resource allocation.
     * 
     * @param resourceAllocation the resource allocation
     */
    public void removeResourceAllocation(final ResourceAllocation resourceAllocation) {
        this.resourceAllocations.remove(resourceAllocation);
    }
    
    /**
     * Copy to.
     * 
     * @param reservation the reservation
     * @return the abstract reservation
     */
    public final AbstractReservation copyTo(final AbstractReservation reservation) {
        reservation.setCreatedBy(this.getCreatedBy());
        reservation.setCreationDate(new Date());
        reservation.setStartDate(this.getStartDate());
        reservation.setEndDate(this.getEndDate());
        reservation.setEndTime(this.getEndTime());
        reservation.setStartTime(this.getStartTime());
        reservation.setRequestedBy(this.getRequestedBy());
        reservation.setRequestedFor(this.getRequestedFor());
        reservation.setReservationName(this.reservationName);
        reservation.setStatus(this.getStatus());
        reservation.setContact(this.contact);
        reservation.setComments(this.getComments());
        reservation.setCost(this.getCost());
        reservation.setAccountId(this.accountId);
        reservation.setDepartmentId(this.departmentId);
        reservation.setDivisionId(this.divisionId);
        reservation.setEmail(this.email);
        reservation.setPhone(this.phone);
        reservation.setUniqueId(this.uniqueId);
        reservation.setTimeZone(this.getTimeZone());
        reservation.setAttendees(this.getAttendees());
        
        return reservation;
    }
    
    /**
     * Gets the account id.
     * 
     * @return the account id
     */
    public final String getAccountId() {
        return this.accountId;
    }
    
    /**
     * 
     * Gets the attendees.
     * 
     * @return the attendees
     * 
     * @see com.archibus.reservation.domain.IReservation#getAttendees()
     */
    public final String getAttendees() {
        return this.attendees;
    }
    
    /**
     * Gets the contact.
     * 
     * @return the contact
     */
    public final String getContact() {
        return this.contact;
    }
    
    /**
     * Gets the department id.
     * 
     * @return the department id
     */
    public final String getDepartmentId() {
        return this.departmentId;
    }
    
    /**
     * Gets the division id.
     * 
     * @return the division id
     */
    public final String getDivisionId() {
        return this.divisionId;
    }
    
    /**
     * Gets the email.
     * 
     * @return the email
     */
    public final String getEmail() {
        return this.email;
    }
    
    /**
     * Gets the parent id.
     * 
     * @return the parent id
     */
    public final Integer getParentId() {
        return this.parentId;
    }
    
    /**
     * Gets the phone.
     * 
     * @return the phone
     */
    public final String getPhone() {
        return this.phone;
    }
    
    /**
     * Gets the recurring rule.
     * 
     * @return the recurring rule
     */
    public final String getRecurringRule() {
        return this.recurringRule;
    }
    
    /**
     * Gets the reservation name.
     * 
     * @return the reservation name
     */
    public final String getReservationName() {
        return this.reservationName;
    }
    
    /**
     * Gets the reservation type.
     * 
     * @return the reservation type
     */
    public final String getReservationType() {
        return this.reservationType;
    }
    
    /**
     * Gets the resource allocations.
     * 
     * @return list of resource allocations
     * 
     * @see com.archibus.reservation.domain.IReservation#getResourceAllocations()
     */
    public final List<ResourceAllocation> getResourceAllocations() {
        if (this.resourceAllocations == null) {
            this.resourceAllocations = new ArrayList<ResourceAllocation>();
        }
        return this.resourceAllocations;
    }
    
    /**
     * Gets the time period.
     * 
     * @return the time period
     */
    @XmlTransient
    public final TimePeriod getTimePeriod() {
        return this.period;
    }
    
    /**
     * Gets the unique id.
     * 
     * @return unique id
     * 
     * @see com.archibus.reservation.domain.IReservation#getUniqueId()
     */
    public final String getUniqueId() {
        return this.uniqueId;
    }
    
    /**
     * Sets the account id.
     * 
     * @param accountId the new account id
     */
    public final void setAccountId(final String accountId) {
        this.accountId = accountId;
    }
    
    /**
     * Sets the attendees.
     * 
     * @param attendees the new attendees
     */
    public final void setAttendees(final String attendees) {
        this.attendees = attendees;
    }
    
    /**
     * Sets the contact.
     * 
     * @param contact the new contact
     */
    public final void setContact(final String contact) {
        this.contact = contact;
    }
    
    /**
     * Sets the department id.
     * 
     * @param departmentId the new department id
     */
    public final void setDepartmentId(final String departmentId) {
        this.departmentId = departmentId;
    }
    
    /**
     * Sets the division id.
     * 
     * @param divisionId the new division id
     */
    public final void setDivisionId(final String divisionId) {
        this.divisionId = divisionId;
    }
    
    /**
     * Sets the email of the organizer.
     * 
     * @param email the new email
     */
    public final void setEmail(final String email) {
        this.email = email;
    }
    
    /**
     * Sets the parent id.
     * 
     * @param parentId the new parent id
     */
    public final void setParentId(final Integer parentId) {
        this.parentId = parentId;
    }
    
    /**
     * Sets the phone.
     * 
     * @param phone the new phone
     */
    public final void setPhone(final String phone) {
        this.phone = phone;
    }
    
    /**
     * Sets the recurring rule.
     * 
     * @param recurringRule the new recurring rule
     */
    public final void setRecurringRule(final String recurringRule) {
        this.recurringRule = recurringRule;
        if (StringUtil.notNullOrEmpty(recurringRule)) {
            this.setReservationType("recurring");
        } else {
            this.setReservationType("regular");
        }
    }
    
    /**
     * Sets the reservation name.
     * 
     * @param reservationName the new reservation name
     */
    public final void setReservationName(final String reservationName) {
        this.reservationName = reservationName;
    }
    
    /**
     * Sets the reservation type.
     * 
     * @param reservationType the new reservation type
     */
    public final void setReservationType(final String reservationType) {
        this.reservationType = reservationType;
    }
    
    /**
     * Sets the resource allocations.
     * 
     * @param resourceAllocations the new resource allocations
     */
    public final void setResourceAllocations(final List<ResourceAllocation> resourceAllocations) {
        this.resourceAllocations = resourceAllocations;
    }
    
    /**
     * Set the time period.
     * 
     * @param timePeriod time period
     */
    public final void setTimePeriod(final TimePeriod timePeriod) {
        this.setStartDate(timePeriod.getStartDate());
        this.setStartTime(timePeriod.getStartTime());
        this.setEndDate(timePeriod.getEndDate());
        this.setEndTime(timePeriod.getEndTime());
        this.setTimeZone(timePeriod.getTimeZone());
    }
    
    /**
     * Sets the unique id.
     * 
     * @param uniqueId the new unique id
     */
    public final void setUniqueId(final String uniqueId) {
        this.uniqueId = uniqueId;
    }
    
    /**
     * Gets the time zone.
     * 
     * @return the time zone
     * 
     * @see com.archibus.app.reservation.domain.IReservation#getTimeZone()
     */
    public final String getTimeZone() {
        return this.period.getTimeZone();
    }
    
    /**
     * Sets the time zone.
     * 
     * The time zone is not saved in the database.
     * 
     * @param timeZone the new time zone
     */
    public final void setTimeZone(final String timeZone) {
        this.period.setTimeZone(timeZone);
    }
    
    /**
     * Gets the requested by.
     * 
     * @return requested by
     * 
     * @see com.archibus.reservation.domain.IReservation#getRequestedBy()
     */
    public final String getRequestedBy() {
        return this.requestedBy;
    }
    
    /**
     * Gets the requested for.
     * 
     * @return requested for
     * 
     * @see com.archibus.reservation.domain.IReservation#getRequestedFor()
     */
    public final String getRequestedFor() {
        return this.requestedFor;
    }
    
    /**
     * Sets the requested by.
     * 
     * @param requestedBy the new requested by
     */
    public final void setRequestedBy(final String requestedBy) {
        this.requestedBy = requestedBy;
    }
    
    /**
     * Sets the requested for.
     * 
     * @param requestedFor the new requested for
     */
    public final void setRequestedFor(final String requestedFor) {
        this.requestedFor = requestedFor;
    }
    
    /**
     * Calculate total cost.
     * 
     * @return total cost
     */
    public double calculateTotalCost() {
        double totalCost = 0.0;
        
        for (final ResourceAllocation resourceAllocation : this.resourceAllocations) {
            totalCost += resourceAllocation.getCost();
        }
        
        this.setCost(totalCost);
        
        return totalCost;
    }
}
