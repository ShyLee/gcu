package com.archibus.app.reservation.dao.datasource;

import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.Utility;

/**
 * Abstract Reservation DataSource.
 * 
 * Thisis a base class for reservation objects.
 * 
 * @param <T> the generic type
 * @author Bart Vanderschoot
 */
public abstract class AbstractReservationDataSource<T> extends
        ObjectDataSourceImpl<AbstractReservation> {
    
    /**
     * Datasource for resource allocations.
     * 
     * Every reservation can have resources allocated. When cancelling, also resources should be
     * cancelled.
     * 
     */
    protected ResourceAllocationDataSource resourceAllocationDataSource;
    
    /**
     * Constructor.
     * 
     * @param beanName Spring bean name
     * @param tableName table name
     */
    protected AbstractReservationDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    /**
     * Cancel the reservation.
     * 
     * @param reservation reservation
     * @throws ReservationException ReservationException
     */
    public final void cancel(final AbstractReservation reservation) throws ReservationException {
        
        checkForNewReservation(reservation);
        
        final User user = ContextStore.get().getUser();
        // check if it can be canceled....
        if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
            checkCancelling(reservation);
        }
        
        // First update all active resource allocations. This updates their cost as well.
        final List<ResourceAllocation> activeResourceAllocations =
                this.getActiveResourceAllocations(reservation);
        for (final ResourceAllocation resourceAllocation : activeResourceAllocations) {
            this.resourceAllocationDataSource.cancel(resourceAllocation);
        }
        
        reservation.setStatus(Constants.STATUS_CANCELLED);
        // Compute the new total cost, including late cancellation costs.
        reservation.calculateTotalCost();
        reservation.setLastModifiedBy(user.getEmployee().getId());
        // TODO: use time zone of the building.
        reservation.setCancelledDate(Utility.currentDate());
        reservation.setLastModifiedDate(Utility.currentDate());
        
        super.update(reservation);
    }
    
    /**
     * 
     * Check constraints and save the reservation.
     * 
     * @param reservation reservation
     * @return reservation
     * @throws ReservationException ReservationException
     */
    public final AbstractReservation checkAndSave(final AbstractReservation reservation)
            throws ReservationException {
        
        // get the reserve id
        checkForNewReservation(reservation);
        
        if (reservation.getReserveId() == null || reservation.getReserveId() == 0) {
            // add a new reservation
            final AbstractReservation savedReservation = super.save(reservation);
            // the auto-number pk will return from the saved statement
            
            this.log
                .debug("Saved reservation with generated id " + savedReservation.getReserveId());
            
            reservation.setReserveId(savedReservation.getReserveId());
        } else {
            // check if it can be modified....
            final User user = ContextStore.get().getUser();
            if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                    && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
                checkEditing(reservation);
            }
            reservation.setLastModifiedBy(user.getEmployee().getId());
            // TODO: timezone?
            reservation.setLastModifiedDate(Utility.currentDate());
            super.update(reservation);
        }
        
        final List<ResourceAllocation> activeResourceAllocations =
                this.getActiveResourceAllocations(reservation);
        for (final ResourceAllocation resourceAllocation : activeResourceAllocations) {
            resourceAllocation.setReservation(reservation);
            
            if (resourceAllocation.getId() == null || resourceAllocation.getId() == 0) {
                this.resourceAllocationDataSource.save(resourceAllocation);
            } else {
                this.resourceAllocationDataSource.checkAndUpdate(resourceAllocation);
            }
        }
        
        return reservation;
    }
    
    /**
     * 
     * Clear the unique id.
     * 
     * @param reservation reservation
     * @return reservation
     * @throws ReservationException ReservationException
     */
    public final AbstractReservation clearUniqueId(final AbstractReservation reservation)
            throws ReservationException {
        checkForNewReservation(reservation);
        
        // Get the unmodified reservation, so we do not change anything else (KB 3037586).
        final AbstractReservation storedReservation = this.get(reservation.getReserveId());
        
        if (storedReservation.getUniqueId() != null) {
            final User user = ContextStore.get().getUser();
            // this will insert a NULL value
            storedReservation.setUniqueId("");
            storedReservation.setLastModifiedBy(user.getEmployee().getId());
            // TODO: current date or use timezone ?
            storedReservation.setLastModifiedDate(Utility.currentDate());
            // every reservation can be casted to AbstractReservation
            super.update(storedReservation);
        }
        return storedReservation;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public AbstractReservation get(final Object reserveId) {
        final AbstractReservation reservation = super.get(reserveId);
        
        if (reservation != null) {
            reservation.setResourceAllocations(this.resourceAllocationDataSource
                .getResourceAllocations(reservation));
        }
        return reservation;
    }
    
    /**
     * Get active reservation.
     * 
     * @param reserveId reserveId
     * @return reservation (or null if no active reservation exists)
     */
    public AbstractReservation getActiveReservation(final Object reserveId) {
        AbstractReservation activeReservation = null;
        
        final AbstractReservation reservation = super.get(reserveId);
        if (reservation != null
                && (Constants.STATUS_AWAITING_APP.equals(reservation.getStatus()) || Constants.STATUS_CONFIRMED
                    .equals(reservation.getStatus()))) {
            // the reservation is active, so set the return value and include resource allocations
            activeReservation = reservation;
            activeReservation.setResourceAllocations(this.resourceAllocationDataSource
                .getResourceAllocations(reservation));
        }
        
        return activeReservation;
    }
    
    /**
     * Get all recurring reservations linked to the same unique ID.
     * 
     * @param uniqueId unique id
     * @return list of reservations
     */
    protected final List<AbstractReservation> getAllByUniqueId(final String uniqueId) {
        
        this.clearRestrictions();
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(this.tableName, Constants.UNIQUE_ID, uniqueId, Operation.EQUALS);
        // there can be more reservations with the same unique id, but others have canceled or
        // rejected status
        restriction.addClause(this.tableName, Constants.STATUS, Constants.STATUS_CANCELLED,
            Operation.NOT_EQUALS);
        restriction.addClause(this.tableName, Constants.STATUS, Constants.STATUS_REJECTED,
            Operation.NOT_EQUALS);
        
        final List<AbstractReservation> result = find(restriction);
        
        for (final AbstractReservation reservation : result) {
            reservation.setResourceAllocations(this.resourceAllocationDataSource
                .getResourceAllocations(reservation));
        }
        
        return result;
    }
    
    /**
     * 
     * Get reservation by Unique Id coming from Exchange/Outlook.
     * 
     * @param uniqueId unique id
     * @param date start date
     * 
     * @return the reservation (null if not found)
     */
    public final AbstractReservation getByUniqueId(final String uniqueId, final Date date) {
        
        this.clearRestrictions();
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(this.tableName, Constants.UNIQUE_ID, uniqueId, Operation.EQUALS);
        restriction.addClause(this.tableName, Constants.DATE_START_FIELD_NAME, date,
            Operation.EQUALS);
        // there can be more reservations with the same unique id, but others have canceled or
        // rejected status
        restriction.addClause(this.tableName, Constants.STATUS, Constants.STATUS_CANCELLED,
            Operation.NOT_EQUALS);
        restriction.addClause(this.tableName, Constants.STATUS, Constants.STATUS_REJECTED,
            Operation.NOT_EQUALS);
        
        final List<AbstractReservation> result = find(restriction);
        
        AbstractReservation reservation = null;
        if (!result.isEmpty()) {
            reservation = result.get(0);
            reservation.setResourceAllocations(this.resourceAllocationDataSource
                .getResourceAllocations(reservation));
        }
        
        return reservation;
    }
    
    /**
     * Setter for resourceAllocationDataSource.
     * 
     * @param resourceAllocationDataSource resourceAllocationDataSource to set
     */
    public final void setResourceAllocationDataSource(
            final ResourceAllocationDataSource resourceAllocationDataSource) {
        this.resourceAllocationDataSource = resourceAllocationDataSource;
    }
    
    /**
     * Mapping to be compatible with version 19.
     * 
     * @return mapping of fields to properties
     */
    @Override
    protected Map<String, String> createFieldToPropertyMapping() {
        final Map<String, String> mapping = new HashMap<String, String>();
        mapping.put(this.tableName + ".res_id", "reserveId");
        
        mapping.put(this.tableName + ".reservation_name", "reservationName");
        mapping.put(this.tableName + ".comments", "comments");
        mapping.put(this.tableName + ".attendees", "attendees");
        
        mapping.put(this.tableName + ".user_created_by", "createdBy");
        mapping.put(this.tableName + ".user_last_modified_by", "lastModifiedBy");
        mapping.put(this.tableName + ".user_requested_by", "requestedBy");
        mapping.put(this.tableName + ".user_requested_for", "requestedFor");
        
        mapping.put(this.tableName + ".contact", "contact");
        mapping.put(this.tableName + ".email", "email");
        mapping.put(this.tableName + ".phone", "phone");
        
        mapping.put(this.tableName + ".dv_id", "divisionId");
        mapping.put(this.tableName + ".dp_id", "departmentId");
        mapping.put(this.tableName + ".ac_id", "accountId");
        mapping.put(this.tableName + ".cost_res", "cost");
        
        mapping.put(this.tableName + ".date_start", "startDate");
        mapping.put(this.tableName + ".date_end", "endDate");
        
        mapping.put(this.tableName + ".time_start", "startTime");
        mapping.put(this.tableName + ".time_end", "endTime");
        
        mapping.put(this.tableName + "." + Constants.UNIQUE_ID, "uniqueId");
        mapping.put(this.tableName + ".status", Constants.STATUS);
        
        mapping.put(this.tableName + ".date_cancelled", "cancelledDate");
        mapping.put(this.tableName + ".date_last_modified", "lastModifiedDate");
        
        mapping.put(this.tableName + ".recurring_rule", "recurringRule");
        mapping.put(this.tableName + ".res_type", "reservationType");
        mapping.put(this.tableName + ".res_parent", "parentId");
        
        return mapping;
    }
    
    /**
     * Fields to properties mapping of the reservations data source for version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected final String[][] getFieldsToProperties() {
        return DataSourceUtils.getFieldsToProperties(createFieldToPropertyMapping());
    }
    
    /**
     * Check for new reservation using the unique id.
     * 
     * @param reservation reservation object
     */
    private void checkForNewReservation(final AbstractReservation reservation) {
        if (reservation.getUniqueId() != null && reservation.getReserveId() == null) {
            final AbstractReservation existing =
                    this.getByUniqueId(reservation.getUniqueId(), reservation.getStartDate());
            if (existing != null) {
                reservation.setReserveId(existing.getReserveId());
            }
        }
    }
    
    /**
     * Check the configuration restrictions for cancelling.
     * 
     * @param reservation reservation object
     * @throws ReservationException reservation exception is thrown when the reservation cannot be
     *             cancelled.
     */
    protected void checkCancelling(final AbstractReservation reservation)
            throws ReservationException {
        if (!checkStatusAndStartDate(reservation)) {
            // @translatable
            throw new ReservationException("The reservation cannot be cancelled.",
                AbstractReservationDataSource.class);
        }
    }
    
    /**
     * Check the configuration restrictions for editing.
     * 
     * @param reservation reservation object
     * @throws ReservationException reservation exception is thrown when the reservation cannot be
     *             modified
     */
    private void checkEditing(final AbstractReservation reservation) throws ReservationException {
        if (!checkStatusAndStartDate(reservation)) {
            // @translatable
            throw new ReservationException("The reservation cannot be modified.",
                AbstractReservationDataSource.class);
        }
    }
    
    /**
     * Check the status and start date of the reservation to determine whether it can be cancelled
     * or modified.
     * 
     * @param reservation the reservation to check
     * @return true if status and start date are OK, false otherwise
     */
    private boolean checkStatusAndStartDate(final AbstractReservation reservation) {
        final DataSource dataSrc = this.createCopy();
        if (reservation.getReserveId() == null && reservation.getUniqueId() != null) {
            // check via Outlook unique Id and start date
            dataSrc.addRestriction(Restrictions.eq(this.tableName, Constants.UNIQUE_ID,
                reservation.getUniqueId()));
            dataSrc.addRestriction(Restrictions.eq(this.tableName, Constants.DATE_START_FIELD_NAME,
                reservation.getStartDate()));
        } else {
            // check via reservation ID
            dataSrc.addRestriction(Restrictions.eq(this.tableName, Constants.RES_ID,
                reservation.getReserveId()));
        }
        dataSrc.addRestriction(Restrictions.sql(Constants.STATUS_AWAITING_APP_OR_STATUS_CONFIRMED));
        // check if this reservation is not in the past
        dataSrc.addRestriction(Restrictions.gte(this.tableName, Constants.DATE_START_FIELD_NAME,
            Utility.currentDate()));
        
        return dataSrc.getRecord() != null;
    }
    
    /**
     * Get the active resource allocations in the reservation, i.e. those that don't have rejected
     * or cancelled status.
     * 
     * @param reservation the reservation to extract active resource allocations from
     * @return active resource allocations in the reservation
     */
    protected List<ResourceAllocation> getActiveResourceAllocations(
            final AbstractReservation reservation) {
        final List<ResourceAllocation> activeAllocations = new ArrayList<ResourceAllocation>();
        for (final ResourceAllocation allocation : reservation.getResourceAllocations()) {
            if (!(Constants.STATUS_CANCELLED.equals(allocation.getStatus()) || Constants.STATUS_REJECTED
                .equals(allocation.getStatus()))) {
                activeAllocations.add(allocation);
            }
        }
        return activeAllocations;
    }
    
}
