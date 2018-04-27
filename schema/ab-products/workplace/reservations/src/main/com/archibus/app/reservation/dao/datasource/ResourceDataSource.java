package com.archibus.app.reservation.dao.datasource;

import java.util.*;

import com.archibus.app.reservation.dao.IResourceDataSource;
import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * DataSource for Resources.
 * 
 * @author Bart Vanderschoot
 */
public class ResourceDataSource extends AbstractResourceDataSource implements IResourceDataSource {
    
    /**
     * Check if the resource is allowed for this building.
     * 
     * @param resourceId resourceId
     * @param blId building id
     * 
     * @return true or false
     */
    public boolean checkAllowedForBuilding(final String resourceId, final String blId) {
        
        final DataSource dataSource = this.createCopy();
        dataSource.addParameter("blId", blId, DATA_TYPE_TEXT);
        dataSource.addRestriction(Restrictions.eq(this.tableName, "resource_id", resourceId));
        dataSource.addRestriction(Restrictions.sql(" ( " + this.tableName
                + ".bl_id = ${parameters['blId']}) OR ( " + this.tableName + ".bl_id IS NULL "
                + " AND " + this.tableName
                + ".site_id = (select site_id from bl where bl.bl_id = ${parameters['blId']}) ) "));
        
        final List<DataRecord> records = dataSource.getRecords();
        
        return !records.isEmpty();
    }
    
    /**
     * Check resource available.
     * 
     * @param resourceId resourceId
     * @param reservation reservation
     * 
     * @return true or false
     */
    public boolean checkResourceAvailable(final String resourceId, final IReservation reservation) {
        
        final Resource resource = this.get(resourceId);
        
        List<Resource> resources = null;
        
        if (resource.getResourceType().equals(ResourceType.UNIQUE.toString())) {
            resources = this.findAvailableUniqueResources(reservation);
        } else if (resource.getResourceType().equals(ResourceType.LIMITED.toString())) {
            resources = this.findAvailableLimitedResources(reservation);
        } else if (resource.getResourceType().equals(ResourceType.UNLIMITED.toString())) {
            resources = this.findAvailableUnlimitedResources(reservation);
        }
        
        return resources != null && resources.contains(resource);
        
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Resource> findAvailableLimitedResources(final IReservation reservation)
            throws ReservationException {
        return convertRecordsToObjects(findAvailableLimitedResourceRecords(reservation));
    }
    
    /**
     * {@inheritDoc}
     */
    public Map<String, List<Resource>> findAvailableResources(final IReservation reservation)
            throws ReservationException {
        final Map<String, List<Resource>> resources = new HashMap<String, List<Resource>>();
        resources.put(ResourceType.UNLIMITED.toString(),
            findAvailableUnlimitedResources(reservation));
        resources.put(ResourceType.LIMITED.toString(), findAvailableLimitedResources(reservation));
        resources.put(ResourceType.UNIQUE.toString(), findAvailableUniqueResources(reservation));
        
        return resources;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Resource> findAvailableResources(final IReservation reservation,
            final ResourceType resourceType) throws ReservationException {
        List<Resource> result = null;
        switch (resourceType) {
            case UNLIMITED:
                result = findAvailableUnlimitedResources(reservation);
                break;
            case LIMITED:
                result = findAvailableLimitedResources(reservation);
                break;
            case UNIQUE:
                result = findAvailableUniqueResources(reservation);
                break;
            default:
                throw new ReservationException("Not allowed", ResourceDataSource.class);
        }
        return result;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Resource> findAvailableUniqueResources(final IReservation reservation)
            throws ReservationException {
        return convertRecordsToObjects(findAvailableUniqueResourceRecords(reservation));
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Resource> findAvailableUnlimitedResources(final IReservation reservation)
            throws ReservationException {
        return convertRecordsToObjects(findAvailableUnlimitedResourceRecords(reservation));
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Resource> findAvailableUnlimitedResources(final IReservation reservation,
            final ResourceNature nature) throws ReservationException {
        return convertRecordsToObjects(findAvailableUnlimitedResourceRecords(reservation, nature));
    }
    
}
