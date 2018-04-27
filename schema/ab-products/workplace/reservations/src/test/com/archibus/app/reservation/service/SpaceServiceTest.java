package com.archibus.app.reservation.service;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.*;

/**
 * The Class SpaceServiceTest.
 */
public class SpaceServiceTest extends ReservationServiceTestBase {
    
    /**
     * Test get sites.
     */
    public final void testGetSites() {
        final List<Site> sites = this.spaceService.getSites();
        
        Assert.assertNotNull(sites);
    }
    
    /**
     * Test get buildings.
     */
    public final void testGetBuildings() {
        final List<Building> buildings = this.spaceService.getBuildings(SITE_ID);
        
        Assert.assertNotNull(buildings);
    }
    
    /**
     * Test get building details.
     */
    public final void testGetBuildingDetails() {
        final Building building = this.spaceService.getBuildingDetails(BL_ID);
        
        Assert.assertNotNull(building);
        
        Assert.assertEquals(BL_ID, building.getBuildingId());
    }
    
    /**
     * Test get floors.
     */
    public final void testGetFloors() {
        final List<Floor> floors = this.spaceService.getFloors(BL_ID);
        
        Assert.assertNotNull(floors);
        
        final Floor floor = floors.get(0);
        
        Assert.assertEquals(BL_ID, floor.getBuildingId());
    }
    
    /**
     * Test get room details.
     */
    public final void testGetRoomDetails() {
        final Room room = this.spaceService.getRoomDetails(BL_ID, FL_ID, RM_ID);
        
        Assert.assertNotNull(room);
        
        Assert.assertEquals(BL_ID, room.getBuildingId());
        Assert.assertEquals(FL_ID, room.getFloorId());
        Assert.assertEquals(RM_ID, room.getId());
    }
    
}
