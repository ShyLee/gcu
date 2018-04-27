package com.archibus.app.reservation.service;

import java.util.List;

import com.archibus.app.common.space.domain.*;

/**
 * Interface for space service.
 * 
 * @author Bart Vanderschoot
 * @since 20.1
 * 
 */
public interface ISpaceService {
    
    /**
     * Gets the sites.
     * 
     * @return the sites
     */
    List<Site> getSites();
    
    /**
     * Gets the buildings.
     * 
     * @param siteId the site id
     * @return the buildings
     */
    List<Building> getBuildings(final String siteId);
    
    /**
     * Get details on the building with the given identifier.
     * 
     * @param blId identifier of the building
     * @return building details
     */
    Building getBuildingDetails(final String blId);
    
    /**
     * Gets the floors of a building.
     * 
     * @param blId the building id
     * @return the floors
     */
    List<Floor> getFloors(final String blId);
    
    /**
     * get room details.
     * 
     * @param blId the building id
     * @param flId the floor id
     * @param rmId the room id
     * 
     * @return the room
     */
    Room getRoomDetails(final String blId, final String flId, final String rmId);
    
}