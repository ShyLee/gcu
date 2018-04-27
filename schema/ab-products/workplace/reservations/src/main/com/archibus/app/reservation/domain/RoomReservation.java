package com.archibus.app.reservation.domain;

import java.sql.Time;
import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.util.TimeZoneConverter;
import com.archibus.utility.*;

/**
 * Domain class for Room Reservation.
 * 
 * @author Bart Vanderschoot
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "RoomReservation")
public class RoomReservation extends AbstractReservation {
    
    /**
     * Room allocations for this room. Normally there will be one room allocation for a room
     * reservation.
     */
    protected List<RoomAllocation> roomAllocations;
    
    /**
     * Default constructor.
     */
    public RoomReservation() {
        super();
    }
    
    /**
     * Constructor for a time period.
     * 
     * @param timePeriod the time period
     */
    public RoomReservation(final TimePeriod timePeriod) {
        super();
        setTimePeriod(timePeriod);
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param timePeriod the time period
     * @param blId building id
     * @param flId floor id
     * @param rmId room id
     * @param configId configuration id
     * @param arrangeTypeId arrange type id
     */
    public RoomReservation(final TimePeriod timePeriod, final String blId, final String flId,
            final String rmId, final String configId, final String arrangeTypeId) {
        this(timePeriod);
        final RoomAllocation roomAllocation =
                new RoomAllocation(blId, flId, rmId, configId, arrangeTypeId, this);
        addRoomAllocation(roomAllocation);
    }
    
    /**
     * Constructor using primary key.
     * 
     * @param reserveId id
     */
    public RoomReservation(final Integer reserveId) {
        super(reserveId);
    }
    
    /**
     * Constructor using objects.
     * 
     * @param timePeriod time period
     * @param roomArrangement room arrangement
     */
    public RoomReservation(final TimePeriod timePeriod, final RoomArrangement roomArrangement) {
        super();
        setTimePeriod(timePeriod);
        final RoomAllocation roomAllocation = new RoomAllocation(roomArrangement, this);
        addRoomAllocation(roomAllocation);
    }
    
    /**
     * Add a room allocation to the reservation.
     * 
     * @param roomAllocation room allocation
     */
    public final void addRoomAllocation(final RoomAllocation roomAllocation) {
        if (this.roomAllocations == null) {
            this.roomAllocations = new ArrayList<RoomAllocation>();
        }
        this.roomAllocations.add(roomAllocation);
        roomAllocation.setReservation(this);
    }
    
    /**
     * Get room allocations.
     * 
     * @return room allocations
     */
    public final List<RoomAllocation> getRoomAllocations() {
        return this.roomAllocations;
    }
    
    /**
     * Set room allocations.
     * 
     * @param roomAllocations room allocations
     */
    public final void setRoomAllocations(final List<RoomAllocation> roomAllocations) {
        this.roomAllocations = roomAllocations;
    }
    
    /**
     * Set the creator of this reservation to be the given employee.
     * 
     * @param creator the employee to set as creator of the reservation.
     */
    public void setCreator(final Employee creator) {
        this.setRequestedBy(creator.getId());
        this.setRequestedFor(creator.getId());
        this.setDepartmentId(creator.getDepartmentId());
        this.setDivisionId(creator.getDivisionId());
        this.setCreatedBy(creator.getId());
        this.setCreationDate(new Date());
    }
    
    /**
     * Convert a reservation and its room allocations to the given time zone.
     * 
     * @param timeZoneId the target time zone
     */
    public final void convertToTimeZone(final String timeZoneId) {
        Date startDateTime = null;
        Date endDateTime = null;
        if (this.getRoomAllocations().isEmpty()) {
            // No time zone can be found based on a room allocation.
            // Assume DB is in UTC and convert to the requested time zone.
            startDateTime =
                    TimeZoneConverter.calculateRequestorDateTime(this.getStartDate(),
                        this.getStartTime(), timeZoneId, true);
            endDateTime =
                    TimeZoneConverter.calculateRequestorDateTime(this.getEndDate(),
                        this.getEndTime(), timeZoneId, true);
        } else {
            // Base the time zone conversion on the first room's time zone.
            final String blId = this.getRoomAllocations().get(0).getBlId();
            startDateTime =
                    TimeZoneConverter.calculateDateTimeForBuilding(blId, this.getStartDate(),
                        this.getStartTime(), timeZoneId, false);
            endDateTime =
                    TimeZoneConverter.calculateDateTimeForBuilding(blId, this.getEndDate(),
                        this.getEndTime(), timeZoneId, false);
        }
        
        final TimePeriod timePeriod = new TimePeriod();
        timePeriod.setStartDateTime(startDateTime);
        timePeriod.setEndDateTime(endDateTime);
        timePeriod.setTimeZone(timeZoneId);
        this.setTimePeriod(timePeriod);
        
        for (RoomAllocation roomAllocation : this.getRoomAllocations()) {
            roomAllocation.setStartDateTime(startDateTime);
            roomAllocation.setEndDateTime(endDateTime);
            roomAllocation.setTimeZone(timeZoneId);
        }
        for (ResourceAllocation resourceAllocation : this.getResourceAllocations()) {
            resourceAllocation.setStartDateTime(startDateTime);
            resourceAllocation.setEndDateTime(endDateTime);
            resourceAllocation.setTimeZone(timeZoneId);
        }
    }
    
    /**
     * Calculate total cost for the room reservation.
     * 
     * @return total cost
     */
    @Override
    public double calculateTotalCost() {
        // calculate resource costs.
        double totalCost = super.calculateTotalCost();
        
        // add room cost.
        for (RoomAllocation roomAllocation : this.roomAllocations) {
            totalCost += roomAllocation.getCost();
        }
        
        this.setCost(totalCost);
        
        return totalCost;
    }
    
    /**
     * {@inheritDoc}
     */
    public Date determineCurrentLocalDate() {
        String blId = null;
        if (this.roomAllocations != null && !this.roomAllocations.isEmpty()) {
            blId = this.roomAllocations.get(0).getBlId();
        }
        Date currentDate = null;
        if (blId == null) {
            currentDate = TimePeriod.clearTime(Utility.currentDate());
        } else {
            currentDate =
                    TimePeriod
                        .clearTime(LocalDateTimeUtil.currentLocalDate(null, null, null, blId));
        }
        return currentDate;
    }
    
    /**
     * {@inheritDoc}
     */
    public Time determineCurrentLocalTime() {
        String blId = null;
        if (this.roomAllocations != null && !this.roomAllocations.isEmpty()) {
            blId = this.roomAllocations.get(0).getBlId();
        }
        Time currentTime = null;
        if (blId == null) {
            currentTime = Utility.currentTime();
        } else {
            currentTime = LocalDateTimeUtil.currentLocalTime(null, null, null, blId);
        }
        return currentTime;
    }
    
}
