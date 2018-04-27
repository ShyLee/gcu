package com.archibus.app.reservation.domain;

import javax.xml.bind.annotation.*;

import com.archibus.app.common.space.domain.Room;

/**
 * Domain class for Room Arrangements.
 * 
 * Room Arrangements are configured to be reservable.
 * 
 * Maps to rm_arrange_type table.
 * 
 * @author Bart Vanderschoot
 * 
 */
@XmlRootElement(name = "RoomArrangement")
@XmlAccessorType(XmlAccessType.FIELD)
public class RoomArrangement extends AbstractReservable {
    
    /** Symbol used to delimit resource standards. */
    private static final String RESOURCE_STANDARDS_DELIMITER = "'";
    
    /** The arrange type id. */
    private String arrangeTypeId;
    
    /** The building code. */
    private String blId;
    
    /** The config id. */
    private String configId;
    
    /** The floor code. */
    private String flId;
    
    /** The max capacity. */
    private Integer maxCapacity;
    
    /** The min required. */
    private Integer minRequired;
    
    /** The name. */
    private String name;
    
    /** The room code. */
    private String rmId;
    
    /** The standards not allowed. */
    private String standardsNotAllowed;
    
    /**
     * Instantiates a new room arrangement.
     */
    public RoomArrangement() {
        super();
    }
    
    /**
     * Instantiates a new room arrangement.
     * 
     * @param blId the building code
     * @param flId the floor code
     * @param rmId the room code
     * @param configId the config id
     * @param arrangeTypeId the arrange type id
     */
    public RoomArrangement(final String blId, final String flId, final String rmId,
            final String configId, final String arrangeTypeId) {
        super();
        this.blId = blId;
        this.flId = flId;
        this.rmId = rmId;
        this.configId = configId;
        this.arrangeTypeId = arrangeTypeId;
    }
    
    /**
     * Gets the arrange type id.
     * 
     * @return the arrange type id
     */
    public final String getArrangeTypeId() {
        return this.arrangeTypeId;
    }
    
    /**
     * Gets the building code.
     * 
     * @return the building code
     */
    public final String getBlId() {
        return this.blId;
    }
    
    /**
     * Gets the config id.
     * 
     * @return the config id
     */
    public final String getConfigId() {
        return this.configId;
    }
    
    /**
     * Gets the floor code of this room arrangement.
     * 
     * @return the floor code
     */
    public final String getFlId() {
        return this.flId;
    }
    
    /**
     * Gets the max capacity.
     * 
     * @return the max capacity
     */
    public final Integer getMaxCapacity() {
        return this.maxCapacity;
    }
    
    // Disable StrictDuplicate CHECKSTYLE warning. Justification: this class has the same properties
    // as Site.
    
    /**
     * Gets the min required.
     * 
     * @return the min required
     */
    public final Integer getMinRequired() {
        return this.minRequired;
    }
    
    // Disable StrictDuplicate CHECKSTYLE warning. Justification: this class has the same properties
    // as Site.
    
    /**
     * Gets the name.
     * 
     * @return the name
     */
    public final String getName() {
        return this.name;
    }
    
    /**
     * Gets the room code.
     * 
     * @return the room code
     */
    public final String getRmId() {
        return this.rmId;
    }
    
    /**
     * Gets the room.
     * 
     * @return the room
     */
    public final Room getRoom() {
        final Room room = new Room();
        room.setBuildingId(this.blId);
        room.setFloorId(this.flId);
        room.setId(this.rmId);
        return room;
    }
    
    /**
     * Set the room.
     * 
     * @param room room
     */
    public final void setRoom(final Room room) {
        if (room == null) {
            return;
        }
        
        room.setBuildingId(room.getBuildingId());
        room.setFloorId(room.getFloorId());
        room.setId(room.getId());
    }
    
    /**
     * Gets the standards not allowed.
     * 
     * @return the standards not allowed
     */
    public final String getStandardsNotAllowed() {
        return this.standardsNotAllowed;
    }
    
    /**
     * Sets the arrange type id.
     * 
     * @param arrangeTypeId the new arrange type id
     */
    public final void setArrangeTypeId(final String arrangeTypeId) {
        this.arrangeTypeId = arrangeTypeId;
    }
    
    /**
     * Sets the building code.
     * 
     * @param blId the new building code
     */
    public final void setBlId(final String blId) {
        this.blId = blId;
    }
    
    /**
     * Sets the config id.
     * 
     * @param configId the new config id
     */
    public final void setConfigId(final String configId) {
        this.configId = configId;
    }
    
    /**
     * Sets the floor code.
     * 
     * @param flId the new floor code
     */
    public final void setFlId(final String flId) {
        this.flId = flId;
    }
    
    /**
     * Sets the max capacity.
     * 
     * @param maxCapacity the new max capacity
     */
    public final void setMaxCapacity(final Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }
    
    /**
     * Sets the min required.
     * 
     * @param minRequired the new min required
     */
    public final void setMinRequired(final Integer minRequired) {
        this.minRequired = minRequired;
    }
    
    // Disable StrictDuplicate CHECKSTYLE warning. Justification: this class has the same properties
    // as Building and Site.
    
    /**
     * Sets the name.
     * 
     * @param name the new name
     */
    public final void setName(final String name) {
        this.name = name;
    }
    
    /**
     * Sets the room code.
     * 
     * @param rmId the new room code
     */
    public final void setRmId(final String rmId) {
        this.rmId = rmId;
    }
    
    /**
     * Sets the standards not allowed.
     * 
     * @param standardsNotAllowed the new standards not allowed
     */
    public final void setStandardsNotAllowed(final String standardsNotAllowed) {
        this.standardsNotAllowed = standardsNotAllowed;
    }
    
    /**
     * Check whether this room arrangement allows the given resource resource standard.
     * 
     * @param resourceStandard standard of the resource to check
     * @return true if the resource standard is allowed, false if it isn't
     */
    public final boolean allowsResourceStandard(final String resourceStandard) {
        return this.standardsNotAllowed == null
                || !this.standardsNotAllowed.contains(RESOURCE_STANDARDS_DELIMITER
                        + resourceStandard + RESOURCE_STANDARDS_DELIMITER);
    }
    
}
