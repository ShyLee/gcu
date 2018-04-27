package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.Recurrence;

/**
 * 
 * Interface for reservation service.
 * 
 * @author Bart Vanderschoot
 * @since 20.1
 * 
 */
public interface IReservationService {
    
    /**
     * Get list of room arrangement types.
     * 
     * @return the list
     */
    List<ArrangeType> getArrangeTypes();
    
    /**
     * Cancel recurring reservation.
     * 
     * @param uniqueId the unique id
     * @param email the email
     * @param disconnectOnError the disconnect on error
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<RoomReservation> cancelRecurringReservation(final String uniqueId, final String email,
            final boolean disconnectOnError) throws ReservationException;
    
    /**
     * Cancel reservation.
     * 
     * @param reservation the reservation
     * @throws ReservationException the reservation exception
     */
    void cancelReservation(final IReservation reservation) throws ReservationException;
    
    /**
     * Disconnect reservation.
     * 
     * @param reservation the reservation
     * @throws ReservationException the reservation exception
     */
    void disconnectReservation(final RoomReservation reservation) throws ReservationException;
    
    /**
     * Find available rooms.
     * 
     * @param reservation the reservation
     * @param numberAttendees the number attendees
     * @param fixedResourceStandards the fixed resource standards
     * @param allDayEvent true for all day events, false for regular reservations
     * @param timeZone time zone to convert to
     * @return the list of available rooms
     * @throws ReservationException the reservation exception
     */
    List<RoomArrangement> findAvailableRooms(final RoomReservation reservation,
            final Integer numberAttendees, final String[] fixedResourceStandards,
            final boolean allDayEvent, final String timeZone) throws ReservationException;
    
    /**
     * Find room availabilities.
     * 
     * @param blId the building id
     * @param flId the floor id
     * @param arrangeTypeId the arrange type id
     * @param startDate the start date
     * @param endDate the end date
     * 
     * @return list of room availabilities
     */
    List<RoomAvailability> findRoomAvailabilities(final String blId, final String flId,
            final String arrangeTypeId, final Date startDate, final Date endDate);
    
    /**
     * Save recurring reservation.
     * 
     * @param reservation the reservation
     * @param recurrence the recurrence
     * @return list of created reservations
     * @throws ReservationException the reservation exception
     */
    List<RoomReservation> saveRecurringReservation(final IReservation reservation,
            final Recurrence recurrence) throws ReservationException;
    
    /**
     * Save a reservation.
     * 
     * @param reservation the reservation to save.
     * @throws ReservationException the reservation exception
     */
    void saveReservation(final IReservation reservation) throws ReservationException;
    
    /**
     * Verify whether the reservations with the given unique ID adhere to the given recurrence
     * pattern, i.e. every occurrence has a reservation and every reservation can be linked to an
     * occurrence.
     * 
     * @param uniqueId the unique id of the appointment series
     * @param pattern the recurrence pattern of the appointment series
     * @param startTime time of day that the appointments start
     * @param endTime time of day that the appointments end
     * @param timeZone the time zone used to specify the recurrence pattern and times
     * @return true if the reservations match the pattern, false otherwise
     * @throws ReservationException when an error occurs
     */
    boolean verifyRecurrencePattern(final String uniqueId, final Recurrence pattern,
            final Time startTime, final Time endTime, final String timeZone)
            throws ReservationException;
    
    /**
     * Get active reservation.
     * 
     * @param reserveId reserve Id
     * @param timeZone timeZone
     * @return RoomReservation RoomReservation (null if not found)
     */
    RoomReservation getActiveReservation(final Integer reserveId, final String timeZone);
    
    /**
     * Get room reservation by UniqueId.
     * 
     * @param uniqueId unique Id
     * @param timeZone timeZone
     * @return List of RoomReservation
     */
    List<RoomReservation> getByUniqueId(final String uniqueId, final String timeZone);
    
}
