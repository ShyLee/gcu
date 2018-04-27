package com.archibus.app.reservation.dao;

import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * The Interface IResourceDataSource.
 * <p>
 * Suppress Warning "PMD.TooManyMethods"
 * <p>
 * Justification: interface with many methods.
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public interface IResourceDataSource extends IDao<Resource> {
    
    /**
     * Check if the resource is allowed for this building.
     * 
     * @param resourceId resourceId
     * @param blId building id
     * 
     * @return true or false
     */
    boolean checkAllowedForBuilding(final String resourceId, final String blId);
    
    /**
     * Check if the resource is available.
     * 
     * @param resourceId resourceId
     * @param reservation reservation
     * @return true or false
     */
    boolean checkResourceAvailable(final String resourceId, final IReservation reservation);
    
    /**
     * Find available limited resources.
     * 
     * @param reservation the reservation
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<Resource> findAvailableLimitedResources(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available resources.
     * 
     * @param reservation the reservation
     * @return the map
     * @throws ReservationException the reservation exception
     */
    Map<String, List<Resource>> findAvailableResources(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available resources.
     * 
     * @param reservation the reservation
     * @param resourceType the resource type
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<Resource> findAvailableResources(final IReservation reservation,
            final ResourceType resourceType) throws ReservationException;
    
    /**
     * Find available unique resources.
     * 
     * @param reservation the reservation
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<Resource> findAvailableUniqueResources(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available unlimited resources.
     * 
     * @param reservation the reservation
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<Resource> findAvailableUnlimitedResources(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available unlimited resources.
     * 
     * @param reservation the reservation
     * @param nature the nature
     * @return the list
     * @throws ReservationException the reservation exception
     */
    List<Resource> findAvailableUnlimitedResources(final IReservation reservation,
            final ResourceNature nature) throws ReservationException;
    
    /**
     * Find available limited resource records.
     * 
     * @param reservation reservation object
     * @return resource records
     * @throws ReservationException the reservation exception
     */
    List<DataRecord> findAvailableLimitedResourceRecords(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available unique resources.
     * 
     * @param reservation reservation object
     * @return list of resource records.
     * @throws ReservationException the reservation exception
     */
    List<DataRecord> findAvailableUniqueResourceRecords(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available unlimited resource records.
     * 
     * @param reservation reservation object
     * @return list of resource records
     * @throws ReservationException the reservation exception
     */
    List<DataRecord> findAvailableUnlimitedResourceRecords(final IReservation reservation)
            throws ReservationException;
    
    /**
     * Find available unlimited resource records.
     * 
     * @param reservation reservation object
     * @param nature resource nature
     * @return list of resource records
     * @throws ReservationException the reservation exception
     */
    List<DataRecord> findAvailableUnlimitedResourceRecords(final IReservation reservation,
            final ResourceNature nature) throws ReservationException;
    
    /**
     * Check number of reserved resources for limited resources.
     * 
     * @param timePeriod time period
     * @param resourceId resource id
     * @param reserveId reservation id (when editing)
     * 
     * @return number of reserved resources for that period.
     * 
     */
    int getNumberOfReservedResources(final TimePeriod timePeriod, final String resourceId,
            final Integer reserveId);
    
}
