package com.archibus.app.reservation.dao;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.domain.*;

/**
 * The Interface IRoomReservationDataSource.
 */
public interface IRoomReservationDataSource extends IReservationDataSource<RoomReservation> {
    /**
     * Gets the room reservation using the primary key.
     * 
     * @param reserveId the reserve id
     * @return the room reservation
     */
    RoomReservation get(final Object reserveId);
    
    /**
     * Get active room reservation in converted time zone.
     * 
     * @param reserveId reserveId
     * @param timeZoneId timeZoneId
     * 
     * @return room reservation (null if it doesn't exist)
     */
    RoomReservation getActiveReservation(final Object reserveId, final String timeZoneId);
    
    /**
     * Get room reservations by unique id.
     * 
     * @param uniqueId the unique id
     * 
     * @return list of room reservations with this unique id.
     */
    List<RoomReservation> getByUniqueId(final String uniqueId);
    
    /**
     * Get room reservations by unique id.
     * 
     * @param uniqueId the unique id
     * @param timeZoneId the time zone id
     * @return list of room reservations
     */
    List<RoomReservation> getByUniqueId(final String uniqueId, final String timeZoneId);
    
    /**
     * Get room reservations by unique id.
     * 
     * @param uniqueId the unique id
     * @param date the date
     * @param startTime start time of the reservation in the given time zone
     * @param timeZoneId the time zone id
     * 
     * @return room reservation (or null if not found)
     */
    RoomReservation getByUniqueId(final String uniqueId, final Date date, final Time startTime,
            final String timeZoneId);
    
    /**
     * Gets the reservations for room.
     * 
     * @param blId the bl id
     * @param flId the fl id
     * @param rmId the rm id
     * @param reservationDate the reservation date
     * @return the reservations for room
     */
    List<AbstractReservation> getReservationsForRoom(final String blId, final String flId,
            final String rmId, final Date reservationDate);
    
    /**
     * Removes the recurring reservations.
     * 
     * @param roomReservation room reservation
     */
    void removeRecurringReservations(final RoomReservation roomReservation);
    
    /**
     * Sets the room allocation data source.
     * 
     * @param roomAllocationDataSource the new room allocation data source
     */
    void setRoomAllocationDataSource(final IRoomAllocationDataSource roomAllocationDataSource);
    
    /**
     * Sets the room arrangement data source.
     * 
     * @param roomArrangementDataSource the new room arrangement data source
     */
    void setRoomArrangementDataSource(final IRoomArrangementDataSource roomArrangementDataSource);
    
    /**
     * Setter for resource data source.
     * 
     * @param resourceDataSource resourceDataSource to be set.
     */
    void setResourceDataSource(final IResourceDataSource resourceDataSource);
    
    /**
     * Save and check the room reservation.
     * 
     * @param roomReservation the room reservation
     * @return the room reservation
     * @throws ReservationException the reservation exception
     */
    RoomReservation save(RoomReservation roomReservation) throws ReservationException;
    
    /**
     * Cancel the room reservation.
     * 
     * @param roomReservation the room reservation
     * @throws ReservationException the reservation exception
     */
    void cancel(final RoomReservation roomReservation) throws ReservationException;
    
    /**
     * Check if the current user is authorized to cancel the reservation. Check the configuration
     * restrictions for cancelling.
     * 
     * @param roomReservation roomReservation object
     * @throws ReservationException reservation exception
     */
    void canBeCancelledByCurrentUser(final RoomReservation roomReservation)
            throws ReservationException;
    
}
