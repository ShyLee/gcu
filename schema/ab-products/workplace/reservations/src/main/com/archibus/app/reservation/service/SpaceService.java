package com.archibus.app.reservation.service;

import java.util.List;

import javax.jws.WebParam;

import com.archibus.app.common.space.dao.datasource.*;
import com.archibus.app.common.space.domain.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.restriction.Restrictions;

/**
 * 
 * Implementation of space service.
 * 
 * @author Bart Vanderschoot
 * @since 20.1
 * 
 */
public class SpaceService implements ISpaceService {
    
    /** The site data source. */
    private SiteDataSource siteDataSource;
    
    /** The building data source. */
    private BuildingDataSource buildingDataSource;
    
    /** The floor data source. */
    private FloorDataSource floorDataSource;
    
    /** The room data source. */
    private RoomDataSource roomDataSource;
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress warning PMD.AvoidUsingSql.
     * <p>
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    public final List<Site> getSites() {
        this.siteDataSource.clearRestrictions();
        this.siteDataSource.addRestriction(Restrictions
            .sql(" EXISTS (select 1 from bl, rm_arrange "
                    + " where rm_arrange.bl_id = bl.bl_id and bl.site_id = site.site_id "
                    + " and rm_arrange.reservable = 1 ) "));
        
        return this.siteDataSource.find(null);
    }
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress warning PMD.AvoidUsingSql.
     * <p>
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    public final List<Building> getBuildings(@WebParam(name = "siteId") final String siteId) {
        // TODO: siteId must not be empty....
        this.buildingDataSource.clearRestrictions();
        this.buildingDataSource.addRestriction(Restrictions.eq(
            this.buildingDataSource.getMainTableName(), "site_id", siteId));
        this.buildingDataSource.addRestriction(Restrictions.sql(" EXISTS (select 1 from rm_arrange"
                + " where rm_arrange.bl_id = bl.bl_id and rm_arrange.reservable = 1) "));
        
        return this.buildingDataSource.find(null);
    }
    
    /**
     * {@inheritDoc}
     */
    public final Building getBuildingDetails(final String blId) {
        return this.buildingDataSource.get(blId);
    }
    
    /**
     * {@inheritDoc}
     * 
     * <p>
     * Suppress warning PMD.AvoidUsingSql.
     * <p>
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings({ "PMD.AvoidUsingSql" })
    public final List<Floor> getFloors(final String blId) {
        this.floorDataSource.clearRestrictions();
        this.floorDataSource.addRestriction(Restrictions.eq(
            this.floorDataSource.getMainTableName(), "bl_id", blId));
        this.floorDataSource.addParameter("blId", blId, DataSource.DATA_TYPE_TEXT);
        
        this.floorDataSource.addRestriction(Restrictions.sql(" EXISTS (select 1 from rm_arrange "
                + " where rm_arrange.bl_id = fl.bl_id and rm_arrange.fl_id = fl.fl_id "
                + " and rm_arrange.reservable = 1) "));
        
        return this.floorDataSource.find(null);
    }
    
    /**
     * {@inheritDoc}
     */
    public final Room getRoomDetails(final String blId, final String flId, final String rmId) {
        
        final Room room = new Room();
        room.setBuildingId(blId);
        room.setFloorId(flId);
        room.setId(rmId);
        
        return this.roomDataSource.getByPrimaryKey(room);
    }
    
    /**
     * Sets the site data source.
     * 
     * @param siteDataSource the new site data source
     */
    public final void setSiteDataSource(final SiteDataSource siteDataSource) {
        this.siteDataSource = siteDataSource;
    }
    
    /**
     * Sets the building data source.
     * 
     * @param buildingDataSource the new building data source
     */
    public final void setBuildingDataSource(final BuildingDataSource buildingDataSource) {
        this.buildingDataSource = buildingDataSource;
    }
    
    /**
     * Sets the floor data source.
     * 
     * @param floorDataSource the new floor data source
     */
    public final void setFloorDataSource(final FloorDataSource floorDataSource) {
        this.floorDataSource = floorDataSource;
    }
    
    /**
     * Sets the room data source.
     * 
     * @param roomDataSource the new room data source
     */
    public final void setRoomDataSource(final RoomDataSource roomDataSource) {
        this.roomDataSource = roomDataSource;
    }
    
}
