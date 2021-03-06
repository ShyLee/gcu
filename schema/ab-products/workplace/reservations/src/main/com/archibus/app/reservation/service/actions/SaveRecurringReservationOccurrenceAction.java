package com.archibus.app.reservation.service.actions;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.dao.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.AbstractIntervalPattern;

/**
 * Provides a method for saving an occurrence of a recurring reservation.
 * <p>
 * 
 * Used by ReservationService to save all occurrences of a recurring reservation via the Recurrence
 * Pattern definition.
 * 
 * @author Yorik Gerlo
 * @since 20.1
 * 
 */
public class SaveRecurringReservationOccurrenceAction implements
        AbstractIntervalPattern.OccurrenceAction {
    
    /**
     * The duration in minutes of the reservations.
     */
    private final int durationInMinutes;
    
    /**
     * The room arrangement data source, for checking for available rooms.
     */
    private final IRoomArrangementDataSource roomArrangementDataSource;
    
    /**
     * The list of saved reservations: all saved instances are added to this list.
     */
    private final List<RoomReservation> savedReservations;
    
    /**
     * The room reservation data source: used for saving the reservations.
     */
    private final IRoomReservationDataSource roomReservationDataSource;
    
    /**
     * The room arrangement to book for each occurrence.
     */
    private final RoomArrangement roomArrangement;
    
    /**
     * The start time of the reservations.
     */
    private final Time startTime;
    
    /**
     * The reservation object to modify for each occurrence.
     */
    private final RoomReservation reservation;
    
    /**
     * Constructor.
     * 
     * @param savedReservations list to store the saved reservations
     * @param roomReservationDataSource data source to use for saving reservations
     * @param roomArrangementDataSource data source used for checking room availability
     * @param firstReservation the reservation for the first occurrence, already booked
     */
    public SaveRecurringReservationOccurrenceAction(final List<RoomReservation> savedReservations,
            final IRoomReservationDataSource roomReservationDataSource,
            final IRoomArrangementDataSource roomArrangementDataSource,
            final RoomReservation firstReservation) {
        this.roomArrangementDataSource = roomArrangementDataSource;
        this.savedReservations = savedReservations;
        this.roomReservationDataSource = roomReservationDataSource;
        this.reservation = firstReservation;
        
        this.startTime = firstReservation.getStartTime();
        this.durationInMinutes =
                (int) (firstReservation.getEndDateTime().getTime() - firstReservation
                    .getStartDateTime().getTime()) / TimePeriod.MINUTE_MILLISECONDS;
        
        // we assume having one room
        final RoomAllocation roomAllocation = this.reservation.getRoomAllocations().get(0);
        this.roomArrangement = roomAllocation.getRoomArrangement();
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean handleOccurrence(final Date date) throws ReservationException {
        final TimePeriod timePeriod =
                new TimePeriod(date, this.startTime, this.durationInMinutes,
                    this.reservation.getTimeZone());
        
        // save the next reservation
        final RoomReservation recurringReservation = new RoomReservation();
        this.reservation.copyTo(recurringReservation);
        recurringReservation.setTimePeriod(timePeriod);
        
        // recurringReservation.setParentId(parentId);
        // recurringReservation.setRecurringRule(pattern.toString());
        
        final List<RoomArrangement> roomArrangements =
                this.roomArrangementDataSource.findAvailableRooms(this.roomArrangement.getBlId(),
                    this.roomArrangement.getFlId(), this.roomArrangement.getRmId(),
                    this.roomArrangement.getArrangeTypeId(), timePeriod, null, null);
        boolean continueLoop = false;
        if (!roomArrangements.isEmpty()) {
            recurringReservation.addRoomAllocation(new RoomAllocation(this.roomArrangement,
                recurringReservation));
            // don't copy resources for recurrent reservations
            // copyResourceAllocations(this.reservation, recurringReservation);
            this.roomReservationDataSource.save(recurringReservation);
            this.savedReservations.add(recurringReservation);
            continueLoop = true;
        }
        return continueLoop;
    }
    
}
