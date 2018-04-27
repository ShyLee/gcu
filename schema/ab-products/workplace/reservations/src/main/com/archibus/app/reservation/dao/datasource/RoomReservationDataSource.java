package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.dao.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.*;
import com.archibus.context.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * The Class RoomReservationDataSource.
 * 
 * @author Bart Vanderschoot
 */
public class RoomReservationDataSource extends AbstractReservationDataSource<RoomReservation>
        implements IRoomReservationDataSource {
    
    /** null time zone. */
    private static final String NULL_TIME_ZONE = null;
    
    /** The room allocation data source. */
    protected IRoomAllocationDataSource roomAllocationDataSource;
    
    /** The room arrangement data source. */
    protected IRoomArrangementDataSource roomArrangementDataSource;
    
    /** The resource data source. */
    protected IResourceDataSource resourceDataSource;
    
    /**
     * Instantiates a new room reservation data source.
     */
    public RoomReservationDataSource() {
        this("roomReservation", "reserve");
    }
    
    /**
     * Instantiates a new room reservation data source.
     * 
     * @param beanName the bean name
     * @param tableName the table name
     */
    protected RoomReservationDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public RoomReservation get(final Object reserveId) {
        final RoomReservation reservation = (RoomReservation) super.get(reserveId);
        if (reservation != null) {
            final List<RoomAllocation> roomAllocations =
                    this.roomAllocationDataSource.getRoomAllocations(reservation);
            reservation.setRoomAllocations(roomAllocations);
        }
        return reservation;
    }
    
    /**
     * {@inheritDoc}
     */
    public RoomReservation getActiveReservation(final Object reserveId, final String timeZoneId) {
        final RoomReservation reservation = (RoomReservation) super.getActiveReservation(reserveId);
        if (reservation != null) {
            final List<RoomAllocation> roomAllocations =
                    this.roomAllocationDataSource.getRoomAllocations(reservation);
            
            reservation.setRoomAllocations(roomAllocations);
            reservation.convertToTimeZone(timeZoneId);
        }
        
        return reservation;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<RoomReservation> getByUniqueId(final String uniqueId) throws ReservationException {
        return this.getByUniqueId(uniqueId, NULL_TIME_ZONE);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<RoomReservation> getByUniqueId(final String uniqueId, final String timeZoneId)
            throws ReservationException {
        final List<AbstractReservation> reservations = super.getAllByUniqueId(uniqueId);
        final List<RoomReservation> result = new ArrayList<RoomReservation>(reservations.size());
        for (final AbstractReservation reservation : reservations) {
            final RoomReservation roomReservation = (RoomReservation) reservation;
            final List<RoomAllocation> roomAllocations =
                    this.roomAllocationDataSource.getRoomAllocations(roomReservation);
            
            roomReservation.setRoomAllocations(roomAllocations);
            if (timeZoneId != null) {
                roomReservation.convertToTimeZone(timeZoneId);
            }
            result.add(roomReservation);
        }
        return result;
    }
    
    /**
     * {@inheritDoc}
     */
    public RoomReservation getByUniqueId(final String uniqueId, final Date date,
            final Time startTime, final String timeZoneId) {
        
        final Date convertedDate =
                TimeZoneConverter.calculateRequestorDateTime(date, startTime, timeZoneId, false);
        
        final RoomReservation reservation =
                (RoomReservation) super.getByUniqueId(uniqueId, convertedDate);
        if (reservation != null) {
            final List<RoomAllocation> roomAllocations =
                    this.roomAllocationDataSource.getRoomAllocations(reservation);
            reservation.setRoomAllocations(roomAllocations);
        }
        
        return reservation;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<AbstractReservation> getReservationsForRoom(final String blId, final String flId,
            final String rmId, final Date reservationDate) {
        
        this.clearRestrictions();
        this.addTable(Constants.RESERVE_RM_TABLE_NAME);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constants.RESERVE_RM_TABLE_NAME, Constants.BL_ID_FIELD_NAME, blId,
            Operation.EQUALS);
        restriction.addClause(Constants.RESERVE_RM_TABLE_NAME, Constants.FL_ID_FIELD_NAME, flId,
            Operation.EQUALS);
        restriction.addClause(Constants.RESERVE_RM_TABLE_NAME, Constants.RM_ID_FIELD_NAME, rmId,
            Operation.EQUALS);
        
        if (reservationDate != null) {
            restriction.addClause(Constants.RESERVE_RM_TABLE_NAME, Constants.DATE_START_FIELD_NAME,
                reservationDate, Operation.EQUALS);
        }
        
        // just the room
        return super.find(restriction);
    }
    
    /**
     * {@inheritDoc}
     * 
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2: Statement with DELETE FROM ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void removeRecurringReservations(final RoomReservation roomReservation) {
        if (roomReservation.getReserveId() != null) {
            // remove resources and rooms first
            this.resourceAllocationDataSource.removeByParentId(roomReservation.getReserveId());
            this.roomAllocationDataSource.removeByParentId(roomReservation.getReserveId());
            
            SqlUtils.executeUpdate(this.tableName, "DELETE FROM " + this.tableName
                    + " WHERE res_parent = " + roomReservation.getReserveId());
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public RoomReservation save(final RoomReservation roomReservation) throws ReservationException {
        
        // check time zone, if not provided, we assume the requestor is making the reservation in
        // local building time.
        if (roomReservation.getTimeZone() != null && roomReservation.getRoomAllocations() != null) {
            // we assume there is only one room allocation
            for (final RoomAllocation roomAllocation : roomReservation.getRoomAllocations()) {
                
                Date startDateTime =
                        Utility.toDatetime(roomReservation.getStartDate(),
                            roomReservation.getStartTime());
                startDateTime =
                        TimeZoneConverter.calculateDateTimeForBuilding(roomAllocation.getBlId(),
                            startDateTime, roomReservation.getTimeZone(), true);
                
                Date endDateTime =
                        Utility.toDatetime(roomReservation.getEndDate(),
                            roomReservation.getEndTime());
                endDateTime =
                        TimeZoneConverter.calculateDateTimeForBuilding(roomAllocation.getBlId(),
                            endDateTime, roomReservation.getTimeZone(), true);
                
                final TimePeriod timePeriod = new TimePeriod();
                timePeriod.setStartDateTime(startDateTime);
                timePeriod.setEndDateTime(endDateTime);
                roomReservation.setTimePeriod(timePeriod);
                
                roomAllocation.setStartDateTime(startDateTime);
                roomAllocation.setEndDateTime(endDateTime);
                
                // also loop through all resource allocations to set the room reference
                // and to verify that the resource is available for that room at that time
                if (roomReservation.getResourceAllocations() != null) {
                    moveResourceAllocations(roomReservation, roomAllocation, timePeriod);
                }
            }
        }
        
        // check for status
        checkApprovalRequired(roomReservation);
        
        // calculate costs for all allocations and total before saving.
        calculateCosts(roomReservation);
        
        // save reservation and resources
        super.checkAndSave(roomReservation);
        
        if (roomReservation.getRoomAllocations() != null) {
            saveRoomAllocations(roomReservation);
        }
        
        return roomReservation;
    }
    
    /**
     * Calculate Costs.
     * 
     * @param roomReservation roomReservation
     */
    private void calculateCosts(final RoomReservation roomReservation) {
        
        for (final RoomAllocation allocation : roomReservation.getRoomAllocations()) {
            this.roomAllocationDataSource.calculateCost(allocation);
        }
        
        final List<ResourceAllocation> activeResourceAllocations =
                this.getActiveResourceAllocations(roomReservation);
        for (final ResourceAllocation allocation : activeResourceAllocations) {
            this.resourceAllocationDataSource.calculateCost(allocation);
        }
        
        roomReservation.calculateTotalCost();
    }
    
    /**
     * {@inheritDoc}
     */
    public final void canBeCancelledByCurrentUser(final RoomReservation roomReservation)
            throws ReservationException {
        final User user = ContextStore.get().getUser();
        if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
            checkCancelling(roomReservation);
            
            // Get the active resource allocations and check whether they can be cancelled.
            final List<ResourceAllocation> activeResourceAllocations =
                    this.getActiveResourceAllocations(roomReservation);
            for (final ResourceAllocation resourceAllocation : activeResourceAllocations) {
                this.resourceAllocationDataSource.checkCancelling(resourceAllocation);
            }
            
            // Check whether the connected room allocation can be cancelled.
            if (roomReservation.getRoomAllocations() != null) {
                for (final RoomAllocation roomAllocation : roomReservation.getRoomAllocations()) {
                    this.roomAllocationDataSource.checkCancelling(roomAllocation);
                }
            }
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public void cancel(final RoomReservation roomReservation) throws ReservationException {
        // Get the unmodified reservation, so we do not change anything else (KB 3037585).
        final RoomReservation unmodifiedReservation = this.get(roomReservation.getReserveId());
        
        // First cancel the room allocation, this updates its cost as well.
        if (unmodifiedReservation.getRoomAllocations() != null) {
            for (final RoomAllocation roomAllocation : unmodifiedReservation.getRoomAllocations()) {
                this.roomAllocationDataSource.cancel(roomAllocation);
            }
        }
        // Then call the super method.
        super.cancel(unmodifiedReservation);
    }
    
    /**
     * {@inheritDoc}
     */
    public final void setRoomAllocationDataSource(
            final IRoomAllocationDataSource roomAllocationDataSource) {
        this.roomAllocationDataSource = roomAllocationDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    public final void setRoomArrangementDataSource(
            final IRoomArrangementDataSource roomArrangementDataSource) {
        this.roomArrangementDataSource = roomArrangementDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    public void setResourceDataSource(final IResourceDataSource resourceDataSource) {
        this.resourceDataSource = resourceDataSource;
    }
    
    /**
     * Save a reservation's room allocations.
     * 
     * @param reservation the reservation
     * @throws ReservationException when the save failed
     */
    private void saveRoomAllocations(final RoomReservation reservation) throws ReservationException {
        final String attendees = reservation.getAttendees();
        int internalGuests = 0;
        int externalGuests = 0;
        if (attendees != null) {
            final String[] attendeeArr = attendees.split(";");
            for (final String attendeeEmail : attendeeArr) {
                if (DataSourceUtils.isEmployeeEmail(attendeeEmail)) {
                    ++internalGuests;
                } else {
                    ++externalGuests;
                }
            }
        }
        for (final RoomAllocation roomAllocation : reservation.getRoomAllocations()) {
            roomAllocation.setReservation(reservation);
            roomAllocation.setInternalGuests(internalGuests);
            roomAllocation.setExternalGuests(externalGuests);
            
            if (roomAllocation.getId() == null || roomAllocation.getId() == 0) {
                this.roomAllocationDataSource.save(roomAllocation);
            } else {
                this.roomAllocationDataSource.checkAndUpdate(roomAllocation);
            }
        }
    }
    
    /**
     * Move Resource Allocations according to their availability for the selected room. Resource
     * allocations that are not available for the new location are cancelled.
     * 
     * @param roomReservation roomReservation
     * @param roomAllocation roomAllocation
     * @param timePeriod timePeriod
     */
    private void moveResourceAllocations(final RoomReservation roomReservation,
            final RoomAllocation roomAllocation, final TimePeriod timePeriod) {
        for (final ResourceAllocation resourceAllocation : roomReservation.getResourceAllocations()) {
            
            if (Constants.STATUS_REJECTED.equals(resourceAllocation.getStatus())
                    || Constants.STATUS_CANCELLED.equals(resourceAllocation.getStatus())) {
                // do not modify resource allocations that have already been cancelled or rejected
                continue;
            }
            
            final Resource resource =
                    this.resourceDataSource.get(resourceAllocation.getResourceId());
            final RoomArrangement arrangement =
                    this.roomArrangementDataSource.get(roomAllocation.getBlId(),
                        roomAllocation.getFlId(), roomAllocation.getRmId(),
                        roomAllocation.getConfigId(), roomAllocation.getArrangeTypeId());
            
            // check if the resource is allowed in the new room and if it is not reserved for the
            // new reservation date
            final boolean allowed =
                    arrangement.allowsResourceStandard(resource.getResourceStandard())
                            && this.resourceDataSource.checkResourceAvailable(
                                resourceAllocation.getResourceId(), roomReservation);
            
            if (!allowed) {
                // cancel the previous resource allocation
                this.resourceAllocationDataSource.cancel(resourceAllocation);
                // the resource can't be transferred to the new reservation, skipped
                continue;
            }
            
            // check number for limited resources.
            if (resource.getResourceType().equals(ResourceType.LIMITED.toString())) {
                final int reserved =
                        this.resourceDataSource.getNumberOfReservedResources(timePeriod,
                            resourceAllocation.getResourceId(), roomReservation.getReserveId());
                
                final int total = resource.getQuantity();
                
                if (reserved + resourceAllocation.getQuantity() > total) {
                    // cancel the previous resource allocation
                    this.resourceAllocationDataSource.cancel(resourceAllocation);
                    // the resource can't be transferred to the new reservation, skipped
                    continue;
                }
            }
            
            resourceAllocation.setBlId(roomAllocation.getBlId());
            resourceAllocation.setFlId(roomAllocation.getFlId());
            resourceAllocation.setRmId(roomAllocation.getRmId());
        } // end for
    }
    
    /**
     * Check Approval Required and set the status for the reservation and all of its allocations.
     * 
     * @param roomReservation room reservation, only with its active allocations (i.e. without
     *            cancelled and rejected ones)
     */
    private void checkApprovalRequired(final RoomReservation roomReservation) {
        
        // if status is rejected or cancelled, don't change the status
        if (StringUtil.isNullOrEmpty(roomReservation.getStatus())
                || Constants.STATUS_AWAITING_APP.equals(roomReservation.getStatus())
                || Constants.STATUS_CONFIRMED.equals(roomReservation.getStatus())) {
            
            boolean approvalRequired = false;
            
            for (final RoomAllocation roomAllocation : roomReservation.getRoomAllocations()) {
                final RoomArrangement roomArrangement =
                        this.roomArrangementDataSource.get(roomAllocation.getBlId(),
                            roomAllocation.getFlId(), roomAllocation.getRmId(),
                            roomAllocation.getConfigId(), roomAllocation.getArrangeTypeId());
                if (roomArrangement.getApprovalRequired() == 1) {
                    approvalRequired = true;
                    roomAllocation.setStatus(Constants.STATUS_AWAITING_APP);
                } else {
                    roomAllocation.setStatus(Constants.STATUS_CONFIRMED);
                }
            }
            
            final List<ResourceAllocation> activeResourceAllocations =
                    this.getActiveResourceAllocations(roomReservation);
            for (final ResourceAllocation resourceAllocation : activeResourceAllocations) {
                final Resource resource =
                        this.resourceDataSource.get(resourceAllocation.getResourceId());
                
                if (resource.getApprovalRequired() == 1) {
                    approvalRequired = true;
                    resourceAllocation.setStatus(Constants.STATUS_AWAITING_APP);
                } else {
                    resourceAllocation.setStatus(Constants.STATUS_CONFIRMED);
                }
            }
            
            roomReservation.setStatus(approvalRequired ? Constants.STATUS_AWAITING_APP
                    : Constants.STATUS_CONFIRMED);
        }
    }
}
