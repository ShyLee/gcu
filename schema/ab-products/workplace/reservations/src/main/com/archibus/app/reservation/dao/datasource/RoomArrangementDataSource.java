package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.dao.IRoomArrangementDataSource;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.*;
import com.archibus.context.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * The Class RoomArrangementDataSource.
 * 
 * @author Bart Vanderschoot
 */
public class RoomArrangementDataSource extends AbstractReservableDataSource<RoomArrangement>
        implements IRoomArrangementDataSource {
    
    /**
     * Instantiates a new room arrangement data source.
     */
    public RoomArrangementDataSource() {
        this("roomArrangement", "rm_arrange");
    }
    
    /**
     * Instantiates a new room arrangement data source.
     * 
     * @param beanName the bean name
     * @param tableName the table name
     */
    protected RoomArrangementDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
        // join with room table
        this.addTable(Constants.ROOM_TABLE, DataSource.ROLE_STANDARD);
        // add the name of the room
        this.addField(Constants.ROOM_TABLE, Constants.NAME_FIELD_NAME);
        // add the reservable property of the room
        this.addField(Constants.ROOM_TABLE, Constants.RESERVABLE_FIELD_NAME);
    }
    
    /**
     * {@inheritDoc}
     * <p>
     * Suppress warning avoid final local variable.
     * <p>
     * Justification: Turning local variable into field is not useful
     */
    @SuppressWarnings({ "PMD.AvoidFinalLocalVariable" })
    public final List<DataRecord> findAvailableRoomRecords(
            final RoomReservation receivedReservation, final Integer numberAttendees,
            final String[] fixedResourceStandards, final boolean allDayEvent)
            throws ReservationException {
        RoomReservation reservation = receivedReservation;
        final List<RoomAllocation> rooms = receivedReservation.getRoomAllocations();
        
        if (rooms.isEmpty()) {
            // @translatable
            final String message = "No rooms in reservation";
            throw new ReservationException(message, RoomArrangementDataSource.class);
        }
        
        final RoomAllocation roomAllocation = rooms.get(0);
        if (StringUtil.notNullOrEmpty(reservation.getTimeZone()) && !allDayEvent) {
            // No adjustment for all-day events.
            // adjust the reservation date/time for the time zone of the requestor
            final Date startDateTime =
                    TimeZoneConverter.calculateDateTimeForBuilding(roomAllocation.getBlId(),
                        reservation.getStartDate(), reservation.getStartTime(),
                        reservation.getTimeZone(), true);
            
            // adjust the reservation date/time for the time zone of the requestor
            final Date endDateTime =
                    TimeZoneConverter.calculateDateTimeForBuilding(roomAllocation.getBlId(),
                        reservation.getEndDate(), reservation.getEndTime(),
                        reservation.getTimeZone(), true);
            
            // create a new reservation object, don't modify the one passed in
            reservation = new RoomReservation(reservation.getReserveId());
            final TimePeriod period = new TimePeriod();
            period.setStartDateTime(startDateTime);
            period.setEndDateTime(endDateTime);
            reservation.setTimePeriod(period);
            reservation.addRoomAllocation(roomAllocation);
            reservation.setAttendees(receivedReservation.getAttendees());
        }
        
        List<DataRecord> results = null;
        if (reservation.getEndDate() == null
                || reservation.getStartDate().equals(reservation.getEndDate())
                || (allDayEvent && (reservation.getTimePeriod().getDaysDifference() == 1.0))) {
            results =
                    findAvailableRoomRecordsInLocalTime(reservation, roomAllocation,
                        numberAttendees, fixedResourceStandards, allDayEvent);
        } else {
            // Don't return any results if the reservation spans multiple days.
            results = new ArrayList<DataRecord>(0);
        }
        return results;
    }
    
    /**
     * Find available rooms for the specified reservation, which is already in the local time zone
     * of the building.
     * 
     * @param reservation the reservation in the time zone of the building
     * @param roomAllocation domain object representing the location restrictions
     * @param numberAttendees number of attendees
     * @param fixedResourceStandards fixed resource standards
     * @param allDayEvent true to look for rooms available for all day events
     * @return the list of results
     */
    private List<DataRecord> findAvailableRoomRecordsInLocalTime(final RoomReservation reservation,
            final RoomAllocation roomAllocation, final Integer numberAttendees,
            final String[] fixedResourceStandards, final boolean allDayEvent) {
        // since the remote service is a singleton Spring bean and data sources prototypes, we
        // create copy
        final DataSource dataSource = this.createCopy();
        
        Date localCurrentDate = TimePeriod.clearTime(Utility.currentDate());
        Time localCurrentTime = Utility.currentTime();
        
        if (StringUtil.notNullOrEmpty(roomAllocation.getBlId())) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.BL_ID_FIELD_NAME,
                roomAllocation.getBlId()));
            // get the current date and time of the building location
            localCurrentDate =
                    TimePeriod.clearTime(LocalDateTimeUtil.currentLocalDate(null, null, null,
                        roomAllocation.getBlId()));
            localCurrentTime =
                    new Time(LocalDateTimeUtil.currentLocalTime(null, null, null,
                        roomAllocation.getBlId()).getTime());
            
        }
        if (StringUtil.notNullOrEmpty(roomAllocation.getFlId())) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.FL_ID_FIELD_NAME,
                roomAllocation.getFlId()));
        }
        if (StringUtil.notNullOrEmpty(roomAllocation.getRmId())) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.RM_ID_FIELD_NAME,
                roomAllocation.getRmId()));
        }
        
        if (StringUtil.notNullOrEmpty(roomAllocation.getConfigId())) {
            dataSource.addRestriction(Restrictions.eq(this.tableName,
                Constants.CONFIG_ID_FIELD_NAME, roomAllocation.getConfigId()));
        }
        if (StringUtil.notNullOrEmpty(roomAllocation.getArrangeTypeId())) {
            dataSource.addRestriction(Restrictions.eq(this.tableName,
                Constants.RM_ARRANGE_TYPE_ID_FIELD_NAME, roomAllocation.getArrangeTypeId()));
        }
        
        // see if they are reservable (KB#3035993)
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.RESERVABLE_FIELD_NAME,
            1));
        // also see if they are reservable in rm (KB#3036598)
        dataSource.addRestriction(Restrictions.eq(Constants.ROOM_TABLE,
            Constants.RESERVABLE_FIELD_NAME, 1));
        
        this.log.debug("Local current date " + localCurrentDate);
        this.log.debug("Local current time " + localCurrentTime);
        
        addRestrictions(dataSource, reservation, localCurrentDate, localCurrentTime, allDayEvent);
        
        // extra
        addNumberOfAttendeesRestriction(numberAttendees, dataSource);
        addFixedResourcesRestriction(fixedResourceStandards, dataSource);
        
        return dataSource.getRecords();
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> findAvailableRooms(final RoomReservation reservation,
            final Integer numberAttendees, final String[] fixedResourceStandards,
            final boolean allDayEvent, final String timeZone) throws ReservationException {
        final List<RoomArrangement> results =
                convertRecordsToObjects(this.findAvailableRoomRecords(reservation, numberAttendees,
                    fixedResourceStandards, allDayEvent));
        
        // Convert the dayStart and dayEnd properties to the requested time zone.
        if (StringUtil.notNullOrEmpty(timeZone)) {
            final Date now = new Date();
            for (final RoomArrangement arrangement : results) {
                if (arrangement.getDayStart() != null) {
                    arrangement.setDayStart(new Time(TimeZoneConverter
                        .calculateDateTimeForBuilding(arrangement.getBlId(), now,
                            arrangement.getDayStart(), timeZone, false).getTime()));
                }
                if (arrangement.getDayEnd() != null) {
                    arrangement.setDayEnd(new Time(TimeZoneConverter.calculateDateTimeForBuilding(
                        arrangement.getBlId(), now, arrangement.getDayEnd(), timeZone, false)
                        .getTime()));
                }
            }
        }
        
        return results;
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> findAvailableRooms(final String blId, final String flId,
            final String rmId, final String arrangeTypeId, final TimePeriod timePeriod,
            final Integer numberAttendees, final String[] fixedResourceStandards)
            throws ReservationException {
        // Create the corresponding domain objects for the query.
        final RoomArrangement roomArrangement =
                new RoomArrangement(blId, flId, rmId, null, arrangeTypeId);
        final RoomReservation reservation = new RoomReservation(timePeriod, roomArrangement);
        
        return this.findAvailableRooms(reservation, numberAttendees, fixedResourceStandards, false,
            null);
    }
    
    /**
     * {@inheritDoc}
     */
    public final RoomArrangement get(final String blId, final String flId, final String rmId,
            final String configId, final String arrangeTypeId) {
        
        final DataSource dataSource = this.createCopy();
        
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.BL_ID_FIELD_NAME, blId));
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.FL_ID_FIELD_NAME, flId));
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.RM_ID_FIELD_NAME, rmId));
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.CONFIG_ID_FIELD_NAME,
            configId));
        dataSource.addRestriction(Restrictions.eq(this.tableName,
            Constants.RM_ARRANGE_TYPE_ID_FIELD_NAME, arrangeTypeId));
        
        final DataRecord record = dataSource.getRecord();
        RoomArrangement arrangement = null;
        if (record != null) {
            arrangement = convertRecordToObject(record);
        }
        return arrangement;
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> getReservableRooms(final String blId, final String flId,
            final String rmType) {
        
        if (blId == null) {
            // @translatable
            throw new ReservationException("Building code is required",
                RoomArrangementDataSource.class);
        }
        
        final DataSource dataSource = this.createCopy();
        
        dataSource.addTable(Constants.ROOM_TABLE, DataSource.ROLE_STANDARD);
        dataSource.addField(Constants.ROOM_TABLE, Constants.NAME_FIELD_NAME);
        
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.BL_ID_FIELD_NAME, blId));
        
        if (flId != null) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.FL_ID_FIELD_NAME,
                flId));
        }
        if (rmType != null) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, "rm_type", rmType));
        }
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.RESERVABLE_FIELD_NAME,
            1));
        dataSource.addRestriction(Restrictions.eq(Constants.ROOM_TABLE,
            Constants.RESERVABLE_FIELD_NAME, 1));
        
        return convertRecordsToObjects(this.getRecords());
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> getRoomsForFloor(final String blId, final String flId) {
        
        final DataSource dataSource = this.createCopy();
        
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.BL_ID_FIELD_NAME, blId));
        dataSource
            .addRestriction(Restrictions.eq(this.tableName, Constants.FL_ID_FIELD_NAME, flId));
        
        return convertRecordsToObjects(dataSource.getRecords());
    }
    
    /**
     * Adds the fixed resources restriction.
     * 
     * @param fixedResourceStandards the fixed resource standards
     * @param dataSource the data source
     * 
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     * 
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    protected final void addFixedResourcesRestriction(final String[] fixedResourceStandards,
            final DataSource dataSource) {
        if (fixedResourceStandards != null) {
            dataSource.addParameter(Constants.RESOURCE_STD_PARAMETER_NAME, "",
                DataSource.DATA_TYPE_TEXT);
            
            for (final String resourceStd : fixedResourceStandards) {
                dataSource.setParameter(Constants.RESOURCE_STD_PARAMETER_NAME, resourceStd);
                final String restriction =
                        " EXISTS (select resource_std from rm_resource_std where rm_resource_std.bl_id = rm_arrange.bl_id and rm_resource_std.fl_id = rm_arrange.fl_id and rm_resource_std.rm_id = rm_arrange.rm_id  "
                                + " and rm_resource_std.config_id = rm_arrange.config_id and rm_resource_std.arrange_type_id = rm_arrange.arrange_type_id and rm_resource_std.resource_std = ${parameters['resourceStd']}) ";
                
                dataSource.addRestriction(Restrictions.sql(restriction));
            }
        }
    }
    
    /**
     * Adds the number of attendees restriction.
     * 
     * @param numberAttendees the number attendees
     * @param dataSource the ds
     *            <p>
     *            Suppress warning avoid final local variable
     *            <p>
     *            Justification: Turning local variable into field is not usefull
     */
    @SuppressWarnings({ "PMD.AvoidFinalLocalVariable" })
    protected final void addNumberOfAttendeesRestriction(final Integer numberAttendees,
            final DataSource dataSource) {
        if (numberAttendees != null) {
            dataSource.addRestriction(Restrictions.gte(this.tableName, "max_capacity",
                numberAttendees));
            
            // Do not add the min_required restriction for Reservation Manager and Reservation
            // Service Desk members.
            final User user = ContextStore.get().getUser();
            if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                    && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
                dataSource.addRestriction(Restrictions.lte(this.tableName, "min_required",
                    numberAttendees));
            }
        }
    }
    
    /**
     * Adds the restrictions.
     * 
     * @param dataSource the ds
     * @param reservation the reservation
     * @param localCurrentDate the local current date
     * @param localCurrentTime the local current time
     * @param allDayEvent true to look for rooms available for all day events
     * @throws ReservationException the reservation exception
     */
    protected final void addRestrictions(final DataSource dataSource,
            final IReservation reservation, final Date localCurrentDate,
            final Time localCurrentTime, final boolean allDayEvent) throws ReservationException {
        
        addTimePeriodParameters(dataSource, reservation);
        // checks free busy of rooms
        addTimeRestriction(dataSource, reservation);
        // add restriction for announce days
        addAnnounceRestriction(dataSource, reservation, localCurrentDate, localCurrentTime);
        // add restriction for maximum days ahead
        addMaxDayAheadRestriction(dataSource, reservation, localCurrentDate);
        // add restriction for security groups
        addSecurityRestriction(dataSource);
        
        if (!allDayEvent) {
            // add pre and post- block start/end date
            addDayStartEndRestriction(dataSource, reservation);
        }
        
        // KB#3035994
        // add restriction for rooms allowing external attendees
        if (reservation.getAttendees() != null) {
            final String[] attendees = reservation.getAttendees().split(";");
            for (final String attendeeEmail : attendees) {
                if (!DataSourceUtils.isEmployeeEmail(attendeeEmail)) {
                    dataSource.addRestriction(Restrictions
                        .eq(this.tableName, "external_allowed", 1));
                    break;
                }
            }
        }
    }
    
    /**
     * Adds the time restriction.
     * 
     * @param dataSource the ds
     * @param reservation the reservation
     */
    protected final void addTimeRestriction(final DataSource dataSource,
            final IReservation reservation) {
        Integer reserveId = Integer.valueOf(0);
        Date startDate = null;
        Time startTime = null;
        Time endTime = null;
        if (reservation != null) {
            reserveId = reservation.getReserveId();
            startDate = reservation.getStartDate();
            startTime = reservation.getStartTime();
            endTime = reservation.getEndTime();
        }
        
        this.addTimeRestriction(startDate, startTime, endTime, reserveId, dataSource);
    }
    
    // check for editing existing reservation
    /**
     * Adds the time restriction.
     * 
     * @param startDate the start date
     * @param startTime the start time
     * @param endTime the end time
     * @param reserveId the reserve id
     * @param dataSource the ds
     * 
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    protected final void addTimeRestriction(final Date startDate, final Time startTime,
            final Time endTime, final Integer reserveId, final DataSource dataSource) {
        // if (startDate == null || startTime == null || endTime == null) return;
        
        String editRestriction = "";
        if (reserveId != null) {
            dataSource.addParameter("reserveId", reserveId, DataSource.DATA_TYPE_INTEGER);
            editRestriction = " reserve_rm.res_id <> ${parameters['reserveId']} and ";
        }
        
        dataSource.addParameter("startDate", startDate, DataSource.DATA_TYPE_DATE);
        
        String reservationRestriction =
                " NOT EXISTS (select res_id from reserve_rm left outer join rm_arrange ra "
                        + " on reserve_rm.bl_id = ra.bl_id and reserve_rm.fl_id = ra.fl_id and reserve_rm.rm_id = ra.rm_id and reserve_rm.config_id = ra.config_id and reserve_rm.rm_arrange_type_id = ra.rm_arrange_type_id "
                        + "  where "
                        + editRestriction
                        + " reserve_rm.bl_id = rm_arrange.bl_id "
                        + " and reserve_rm.fl_id = rm_arrange.fl_id and reserve_rm.rm_id = rm_arrange.rm_id "
                        +
                        // don't check on config an arrange type !!!!
                        // " and reserve_rm.config_id = rm_arrange.config_id and reserve_rm.rm_arrange_type_id = rm_arrange.rm_arrange_type_id "
                        // +
                        " and reserve_rm.date_start = ${parameters['startDate']} "
                        + " and (reserve_rm.status = 'Awaiting App.' or reserve_rm.status = 'Confirmed') ";
        
        if (startDate != null && startTime != null && endTime != null) {
            
            dataSource.addParameter("startTime", startTime, DataSource.DATA_TYPE_TIME);
            dataSource.addParameter("endTime", endTime, DataSource.DATA_TYPE_TIME);
            
            // check if the reservation overlaps other reservations.
            // Check that no other room reservation exists with other.endTime + preblock + postblock
            // > new.startTime and other.startTime - preblock - postblock < new.endTime
            if (dataSource.isOracle()) {
                reservationRestriction +=
                        " and ( reserve_rm.time_start - (ra.pre_block + rm_arrange.post_block) / (24*60) < ${parameters['endTime']} ) "
                                + " and ( reserve_rm.time_end + (rm_arrange.pre_block + ra.post_block) / (24*60) > ${parameters['startTime']} ) ";
                
            } else if (dataSource.isSqlServer()) {
                reservationRestriction +=
                        " and ( DATEADD(mi, -ra.pre_block - rm_arrange.post_block, reserve_rm.time_start) < ${parameters['endTime']}) "
                                + " and ( DATEADD(mi, rm_arrange.pre_block + ra.post_block, reserve_rm.time_end) > ${parameters['startTime']}) ";
                
            } else {
                reservationRestriction +=
                        " and ( Convert(char(10), DATEADD(mi, -ra.pre_block - rm_arrange.post_block, reserve_rm.time_start), 108) < Convert(char(10), ${parameters['endTime']}, 108) ) "
                                + " and ( Convert(char(10), DATEADD(mi, rm_arrange.pre_block + ra.post_block, reserve_rm.time_end), 108) > Convert(char(10), ${parameters['startTime']}, 108) ) ";
            }
        }
        
        // end EXISTS
        reservationRestriction += Constants.RIGHT_PAR;
        
        dataSource.addRestriction(Restrictions.sql(reservationRestriction));
    }
    
    /**
     * Create fields to properties mapping. To be compatible with version 19.
     * 
     * @return mapping
     */
    @Override
    protected final Map<String, String> createFieldToPropertyMapping() {
        final Map<String, String> mapping = super.createFieldToPropertyMapping();
        
        mapping.put(this.tableName + ".bl_id", "blId");
        mapping.put(this.tableName + ".fl_id", "flId");
        mapping.put(this.tableName + ".rm_id", "rmId");
        
        mapping.put(this.tableName + ".config_id", "configId");
        mapping.put(this.tableName + ".rm_arrange_type_id", "arrangeTypeId");
        
        mapping.put(this.tableName + ".min_required", "minRequired");
        mapping.put(this.tableName + ".max_capacity", "maxCapacity");
        
        mapping.put(this.tableName + ".res_stds_not_allowed", "standardsNotAllowed");
        
        // add the name of the room
        mapping.put("rm.name", Constants.NAME_FIELD_NAME);
        
        return mapping;
    }
    
}
