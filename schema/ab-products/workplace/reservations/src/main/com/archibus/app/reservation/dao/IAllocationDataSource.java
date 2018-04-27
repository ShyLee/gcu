package com.archibus.app.reservation.dao;

import java.util.List;

import com.archibus.app.reservation.domain.*;
import com.archibus.core.dao.IDao;

/**
 * The Interface IAllocationDataSource.
 * 
 * @param <T> the generic type
 */
public interface IAllocationDataSource<T extends IAllocation> extends IDao<T> {
    /**
     * Find allocations for a reservation.
     * 
     * @param reservation reservation object
     * 
     * @return List of reservable items.
     */
    List<T> find(final IReservation reservation);
    
    /**
     * Remove allocations for recurrent reservation.
     * 
     * @param parentId parent reservation id
     */
    void removeByParentId(final Integer parentId);
    
    /**
     * Check for editing and update the resource allocation.
     * 
     * @param allocation the allocation
     * @throws ReservationException the reservation exception
     */
    void checkAndUpdate(final T allocation) throws ReservationException;
    
    /**
     * Cancel the allocation.
     * 
     * @param allocation the allocation
     * @throws ReservationException the reservation exception
     */
    void cancel(final T allocation) throws ReservationException;
    
    /**
     * Calculate total cost.
     * 
     * @param allocation the allocation
     */
    void calculateCost(final T allocation);
    
    /**
     * Calculate the cancellation cost. The cancellation cost is determined based on the current
     * cost in the allocation.
     * 
     * @param allocation the allocation
     */
    void calculateCancellationCost(final T allocation);
    
    /**
     * Check whether an allocation can be cancelled by the current user.
     * 
     * @param allocation the allocation to check
     * @throws ReservationException when cancelling is not allowed
     */
    void checkCancelling(final T allocation) throws ReservationException;
    
    /**
     * Check whether an allocation can be edited by the current user.
     * 
     * @param allocation the allocation to check
     * @throws ReservationException when editing is not allowed
     */
    void checkEditing(final T allocation) throws ReservationException;
    
}
