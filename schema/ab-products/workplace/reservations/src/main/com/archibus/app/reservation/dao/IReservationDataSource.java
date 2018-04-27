package com.archibus.app.reservation.dao;

import java.util.Date;

import com.archibus.app.reservation.domain.*;

/**
 * The Interface IReservationDataSource.
 * 
 * @param <T> the generic type
 */
public interface IReservationDataSource<T> {
    
    /**
     * Try to cancel the reservation. If not allowed, an exception is thrown.
     * 
     * All costs are reset when cancelling.
     * 
     * @param reservation reservation object
     * @throws ReservationException reservation exception is thrown when the reservation cannot be
     *             cancelled
     */
    void cancel(final AbstractReservation reservation) throws ReservationException;
    
    /**
     * Clear the unique ID coming from Exchange.
     * 
     * The reservation is de-coupled from the appointment in MS Exchange.
     * 
     * @param reservation reservation object
     * @return reservation
     * 
     * @throws ReservationException reservation exception is thrown when the reservation cannot be
     *             found
     */
    AbstractReservation clearUniqueId(final AbstractReservation reservation)
            throws ReservationException;
    
    /**
     * Get the active reservation with the given ID.
     * 
     * @param reserveId reservation id
     * @return reservation object, or null if an active reservation doesn't exist
     */
    AbstractReservation getActiveReservation(final Object reserveId);
    
    /**
     * Get the reservation using the unique ID and reservation date.
     * 
     * @param uniqueId unique id
     * @param date reservation date
     * @return reservation reservation object, or null if not found
     */
    AbstractReservation getByUniqueId(final String uniqueId, final Date date);
    
}
