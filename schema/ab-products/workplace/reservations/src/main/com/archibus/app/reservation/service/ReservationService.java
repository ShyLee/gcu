package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.dao.*;
import com.archibus.app.reservation.dao.datasource.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.service.actions.*;
import com.archibus.app.reservation.util.TimeZoneConverter;

/**
 * Reservation Service class.
 * 
 * The service class is a business logic layer used for different front-end handlers. Both event
 * handlers and remote services can use service class.
 * 
 * @author Bart Vanderschoot
 * 
 */
public class ReservationService implements IReservationService {
    
    /** The room arrangement data source. */
    private IRoomArrangementDataSource roomArrangementDataSource;
    
    /** The room reservation data source. */
    private IRoomReservationDataSource roomReservationDataSource;
    
    /** The room allocation data source. */
    private IRoomAllocationDataSource roomAllocationDataSource;
    
    /** The arrange type data source. */
    private ArrangeTypeDataSource arrangeTypeDataSource;
    
    /**
     * {@inheritDoc}
     */
    public final List<ArrangeType> getArrangeTypes() {
        return this.arrangeTypeDataSource.find(null);
    }
    
    /** {@inheritDoc} */
    public RoomReservation getActiveReservation(final Integer reserveId, final String timeZone) {
        return this.roomReservationDataSource.getActiveReservation(reserveId, timeZone);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<RoomReservation> getByUniqueId(final String uniqueId, final String timeZone) {
        return this.roomReservationDataSource.getByUniqueId(uniqueId, timeZone);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomReservation> cancelRecurringReservation(final String uniqueId,
            final String email, final boolean disconnectOnError) throws ReservationException {
        
        final List<RoomReservation> reservations =
                this.roomReservationDataSource.getByUniqueId(uniqueId);
        
        List<RoomReservation> failureList = null;
        if (reservations == null || reservations.isEmpty()) {
            // no reservations found, so no failures
            failureList = new ArrayList<RoomReservation>(0);
        } else {
            // reservations found: try to cancel them and return the list of failures
            failureList = cancelReservations(reservations, disconnectOnError);
        }
        
        return failureList;
    }
    
    /**
     * {@inheritDoc}
     */
    public final void cancelReservation(final IReservation reservation) throws ReservationException {
        if (reservation instanceof RoomReservation) {
            final RoomReservation roomReservation = (RoomReservation) reservation;
            this.roomReservationDataSource.cancel(roomReservation);
        } else {
            // @translatable
            throw new ReservationException("The reservation must be a room reservation",
                ReservationService.class);
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public final void disconnectReservation(final RoomReservation reservation)
            throws ReservationException {
        this.roomReservationDataSource.clearUniqueId(reservation);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> findAvailableRooms(final RoomReservation reservation,
            final Integer numberAttendees, final String[] fixedResourceStandards,
            final boolean allDayEvent, final String timeZone) throws ReservationException {
        return this.roomArrangementDataSource.findAvailableRooms(reservation, numberAttendees,
            fixedResourceStandards, allDayEvent, timeZone);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAvailability> findRoomAvailabilities(final String blId,
            final String flId, final String arrangeTypeId, final Date startDate, final Date endDate) {
        final List<RoomArrangement> roomArrangements =
                this.roomArrangementDataSource.findAvailableRooms(blId, flId, null, arrangeTypeId,
                    new TimePeriod(startDate, null, null, null), null, null);
        
        return this.roomAllocationDataSource.getRoomAvailabilities(roomArrangements, startDate,
            endDate);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomReservation> saveRecurringReservation(final IReservation reservation,
            final Recurrence recurrence) throws ReservationException {
        
        if (recurrence == null) {
            // @translatable
            throw new ReservationException("Recurrence is not defined.", ReservationService.class);
        }
        
        final List<RoomReservation> savedReservations = new ArrayList<RoomReservation>();
        
        if (reservation instanceof RoomReservation) {
            
            RoomReservation roomReservation = (RoomReservation) reservation;
            
            if (roomReservation.getRoomAllocations().isEmpty()) {
                // @translatable
                throw new ReservationException("Room reservation has no room allocated.",
                    ReservationService.class);
            }
            
            // make sure there are no leftover reservations
            final List<RoomReservation> reservations =
                    this.roomReservationDataSource.getByUniqueId(reservation.getUniqueId());
            if (reservations != null && !reservations.isEmpty()) {
                // @translatable
                throw new ReservationException(
                    "All reservations for this recurring appointment must be cancelled before booking again.",
                    ReservationService.class);
            }
            
            if (recurrence instanceof AbstractIntervalPattern) {
                final AbstractIntervalPattern pattern = (AbstractIntervalPattern) recurrence;
                final String requestorTimeZone = roomReservation.getTimeZone();
                // save the first base reservation
                // (Archibus recurrence is not used)
                saveReservation(roomReservation);
                
                // get the saved copy with the proper time zone
                roomReservation =
                        this.roomReservationDataSource.getActiveReservation(
                            roomReservation.getReserveId(), requestorTimeZone);
                savedReservations.add(roomReservation);
                
                // loop through the pattern using the saved copy
                pattern.loopThroughRepeats(new SaveRecurringReservationOccurrenceAction(
                    savedReservations, this.roomReservationDataSource,
                    this.roomArrangementDataSource, roomReservation));
            }
        }
        
        return savedReservations;
    }
    
    /**
     * {@inheritDoc}
     */
    public final void saveReservation(final IReservation reservation) throws ReservationException {
        if (reservation instanceof RoomReservation) {
            // check possible conflicts
            final List<RoomArrangement> roomArrangements =
                    this.roomArrangementDataSource.findAvailableRooms(
                        (RoomReservation) reservation, null, null, false, null);
            if (roomArrangements.isEmpty()) {
                // @translatable
                throw new ReservationException("The room is not available.",
                    ReservationService.class);
            }
            // if no conflicts, is safe to save
            this.roomReservationDataSource.save((RoomReservation) reservation);
        } else {
            // @translatable
            throw new ReservationException("This is no room reservation.", ReservationService.class);
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public final boolean verifyRecurrencePattern(final String uniqueId, final Recurrence pattern,
            final Time startTime, final Time endTime, final String timeZone)
            throws ReservationException {
        
        final List<RoomReservation> reservations =
                this.roomReservationDataSource.getByUniqueId(uniqueId);
        
        // Begin by assuming the reservations match the pattern.
        boolean reservationsMatchThePattern = true;
        
        if (pattern.getNumberOfOccurrences() == null
                || pattern.getNumberOfOccurrences() != reservations.size()) {
            // The number of reservations doesn't equal the the number of occurrences.
            reservationsMatchThePattern = false;
        } else if (pattern instanceof AbstractIntervalPattern) {
            final Map<Date, RoomReservation> reservationMap =
                    TimeZoneConverter.toRequestorTimeZone(reservations, timeZone);
            
            final AbstractIntervalPattern intervalPattern = (AbstractIntervalPattern) pattern;
            
            final RoomReservation reservation = reservationMap.get(intervalPattern.getStartDate());
            if (reservation == null
                    || !reservation.getStartTime().toString().equals(startTime.toString())
                    || !reservation.getEndTime().toString().equals(endTime.toString())) {
                reservationsMatchThePattern = false;
            } else {
                final VerifyRecurrencePatternOccurrenceAction action =
                        new VerifyRecurrencePatternOccurrenceAction(startTime, endTime,
                            reservationMap);
                intervalPattern.loopThroughRepeats(action);
                reservationsMatchThePattern = action.getFirstDateWithoutReservation() == null;
            }
        }
        
        return reservationsMatchThePattern;
    }
    
    /**
     * 
     * Setter RoomReservationDataSource.
     * 
     * @param roomReservationDataSource roomReservationDataSource to set
     */
    public final void setRoomReservationDataSource(
            final RoomReservationDataSource roomReservationDataSource) {
        this.roomReservationDataSource = roomReservationDataSource;
    }
    
    /**
     * 
     * Setter for RoomArrangementDataSource.
     * 
     * @param roomArrangementDataSource roomArrangementDataSource to set
     */
    public final void setRoomArrangementDataSource(
            final IRoomArrangementDataSource roomArrangementDataSource) {
        this.roomArrangementDataSource = roomArrangementDataSource;
    }
    
    /**
     * 
     * Setter for RoomAllocationDataSource.
     * 
     * @param roomAllocationDataSource roomAllocationDataSource to set
     */
    public final void setRoomAllocationDataSource(
            final IRoomAllocationDataSource roomAllocationDataSource) {
        this.roomAllocationDataSource = roomAllocationDataSource;
    }
    
    /**
     * Setter for the arrangeTypeDataSource property.
     * 
     * @see arrangeTypeDataSource
     * @param arrangeTypeDataSource the arrangeTypeDataSource to set
     */
    
    public void setArrangeTypeDataSource(final ArrangeTypeDataSource arrangeTypeDataSource) {
        this.arrangeTypeDataSource = arrangeTypeDataSource;
    }
    
    /**
     * Cancels a list of reservations. If disconnectOnError is false, first checks that all
     * reservations can be cancelled. If not all reservations can be cancelled, no reservations are
     * cancelled and the list of failures is returned.
     * 
     * @param reservations the reservations to cancel
     * @param disconnectOnError true if reservations that cannot be cancelled must be disconnected
     * @return list of reservations that cannot be cancelled
     * @throws ReservationException when an error occurs
     */
    private List<RoomReservation> cancelReservations(final List<RoomReservation> reservations,
            final boolean disconnectOnError) throws ReservationException {
        final List<RoomReservation> failureList = new ArrayList<RoomReservation>();
        final List<RoomReservation> successList = new ArrayList<RoomReservation>();
        // check that all instances can be cancelled
        for (final RoomReservation reservation : reservations) {
            try {
                this.roomReservationDataSource.canBeCancelledByCurrentUser(reservation);
                // this reservation can be cancelled, so add it to the success list
                successList.add(reservation);
            } catch (final ReservationException exception) {
                // this reservation cannot be cancelled, so add it to the failure list
                // or disconnect it if the user requested it
                if (disconnectOnError) {
                    this.roomReservationDataSource.clearUniqueId(reservation);
                } else {
                    failureList.add(reservation);
                }
            }
        }
        
        // If there were no failures, proceed with cancelling the other reservations.
        if (failureList.isEmpty()) {
            for (final RoomReservation reservation : successList) {
                this.roomReservationDataSource.cancel(reservation);
            }
        }
        
        return failureList;
    }
    
}
