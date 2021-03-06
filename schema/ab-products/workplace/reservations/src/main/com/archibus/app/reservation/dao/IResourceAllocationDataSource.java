package com.archibus.app.reservation.dao;

import java.util.*;

import com.archibus.app.reservation.domain.*;

/**
 * The Interface IResourceAllocationDataSource.
 */
public interface IResourceAllocationDataSource extends IAllocationDataSource<ResourceAllocation> {
    /**
     * Gets the resource allocations for a reservation.
     * 
     * @param reservation the reservation
     * @return the resource allocation
     */
    List<ResourceAllocation> getResourceAllocations(final IReservation reservation);
    
    /**
     * Gets the resource allocations.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @param blId the bl id
     * @param flId the fl id
     * @param rmId the rm id
     * @return the resource allocations
     */
    List<ResourceAllocation> getResourceAllocations(final Date startDate, final Date endDate,
            final String blId, final String flId, final String rmId);
    
    /**
     * Gets the resource allocations.
     * 
     * @param startDate the start date
     * @param blId the bl id
     * @param flId the fl id
     * @param rmId the rm id
     * @return the resource allocations
     */
    List<ResourceAllocation> getResourceAllocations(final Date startDate, final String blId,
            final String flId, final String rmId);
    
    /**
     * Cancel the resource allocation.
     * 
     * @param resourceAllocation the resource allocation
     * @throws ReservationException the reservation exception
     */
    void cancel(final ResourceAllocation resourceAllocation) throws ReservationException;
    
    /**
     * 
     * Check cancelling.
     * 
     * @param resourceAllocation the resource allocation
     * @throws ReservationException the reservation exception
     */
    void checkCancelling(final ResourceAllocation resourceAllocation) throws ReservationException;
    
}
