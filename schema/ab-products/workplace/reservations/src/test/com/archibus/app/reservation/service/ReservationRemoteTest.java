package com.archibus.app.reservation.service;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.*;
import com.archibus.app.reservation.dao.datasource.RoomReservationDataSource;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.DailyPattern;

/**
 * Test for the ReservationRemoteService interface.
 * <p>
 * Suppress warning "PMD.TooManyMethods".
 * <p>
 * Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ReservationRemoteTest extends ReservationServiceTestBase {
    
    /** Dummy body message for a reservation. */
    private static final String BODY_MESSAGE = "body message";
    
    /** Email address used for testing. */
    private static final String EMAIL = "afm@tgd.com";
    
    /** Requestor time zone used for testing. */
    private static final String TIME_ZONE = "Europe/Brussels";
    
    /** Room capacity used for testing. */
    private static final int CAPACITY = 5;
    
    /** UTC time zone identifier. */
    private static final String UTC_TIME_ZONE = "UTC";
    
    /** The object under test: implementation of ReservationRemoteService. */
    private ReservationRemoteService reservationRemoteService;
    
    /** Room reservation data source used for verifying test results. */
    private RoomReservationDataSource roomReservationDataSource;

    /**
     * Test ReservationRemoteService.getSites().
     */
    public void testGetSites() {
        final List<Site> sites = this.reservationRemoteService.getSites();
        
        Assert.assertNotNull(sites);
        Assert.assertFalse(sites.isEmpty());
    }
    
    /**
     * Test ReservationRemoteService.getBuildings().
     */
    public void testGetBuildings() {
        final List<Building> buildings = this.reservationRemoteService.getBuildings(SITE_ID);
        
        Assert.assertNotNull(buildings);
        Assert.assertFalse(buildings.isEmpty());
        for (final Building building : buildings) {
            Assert.assertEquals(SITE_ID, building.getSiteId());
        }
    }
    
    /**
     * Test ReservationRemoteService.getBuildingDetails().
     */
    public void testGetBuildingDetails() {
        final Building building = this.reservationRemoteService.getBuildingDetails(BL_ID);
        
        Assert.assertNotNull(building);
        Assert.assertEquals(BL_ID, building.getBuildingId());
    }
    
    /**
     * Test ReservationRemoteService.getFloors().
     */
    public void testGetFloors() {
        final List<Floor> floors = this.reservationRemoteService.getFloors(BL_ID);
        
        Assert.assertNotNull(floors);
        Assert.assertFalse(floors.isEmpty());
        for (final Floor floor : floors) {
            Assert.assertEquals(BL_ID, floor.getBuildingId());
        }
    }
    
    /**
     * Test ReservationRemoteService.findAvailableRooms().
     */
    public void testFindAvailableRooms() {
        final RoomReservation reservation =
                new RoomReservation(new TimePeriod(this.startDate, this.startDate, this.startTime,
                    this.endTime));
        reservation
            .addRoomAllocation(new RoomAllocation(BL_ID, null, null, null, null, reservation));
        reservation.setTimeZone(null);
        
        List<RoomArrangement> rooms =
                this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false);
        
        Assert.assertNotNull(rooms);
        
        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(BL_ID, room.getBlId());
        }
        
        reservation.setTimeZone(TIME_ZONE);
        
        rooms = this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false);
        
        Assert.assertNotNull(rooms);
        Assert.assertEquals(0, rooms.size());
        
        try {
            this.startTime = new Time(this.timeFormatter.parse("1899-12-30 16:00:00").getTime());
            this.endTime = new Time(this.timeFormatter.parse("1899-12-30 17:00:00").getTime());
        } catch (final ParseException exception) {
            fail(exception.toString());
        }
        reservation.setStartTime(this.startTime);
        reservation.setEndTime(this.endTime);
        
        rooms = this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false);
        
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());
        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(BL_ID, room.getBlId());
        }
    }
    
    /**
     * Test ReservationRemoteService.saveRoomReservation().
     */
    public void testSaveRoomReservation() {
        final RoomArrangement roomArrangement =
                new RoomArrangement(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        RoomReservation reservation =
                new RoomReservation(new TimePeriod(this.startDate, this.endDate, this.startTime,
                    this.endTime), roomArrangement);
        reservation.setEmail(EMAIL);
        reservation.setUniqueId(UNIQUE_ID);
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);
        
        reservation = this.reservationRemoteService.saveRoomReservation(reservation);
        
        Assert.assertNotNull(reservation);
        
        final RoomReservation retrievedReservation =
                this.reservationRemoteService.getRoomReservationById(reservation.getReserveId());
        Assert.assertNotNull(retrievedReservation);
        Assert.assertEquals(reservation.getReserveId(), retrievedReservation.getReserveId());
        
        try {
            reservation =
                    new RoomReservation(new TimePeriod(this.startDate, this.endDate,
                        this.startTime, this.endTime), roomArrangement);
            reservation.setEmail(EMAIL);
            reservation.setUniqueId(UNIQUE_ID);
            reservation.setReservationName(RESERVATION_NAME);
            reservation.setComments(BODY_MESSAGE);
            
            reservation.setTimeZone("GMT");
            
            this.reservationRemoteService.saveRoomReservation(reservation);
            
            Assert
                .fail("The save should have thrown an exception because the room is not available at the given time.");
        } catch (final ReservationException exception) {
            Assert.assertNull(reservation.getReserveId());
        }
    }
    
    /**
     * Test ReservationRemoteService.saveRecurringRoomReservation().
     */
    public void testSaveRecurringRoomReservation() {
        final RoomArrangement roomArrangement =
                new RoomArrangement(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.endDate);
        // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
        calendar.add(Calendar.DATE, 3);
        // CHECKSTYLE:ON
        final Date endDateOfPattern = calendar.getTime();
        
        final RoomReservation reservation =
                new RoomReservation(new TimePeriod(this.startDate, this.startDate, this.startTime,
                    this.endTime), roomArrangement);
        reservation.setEmail(EMAIL);
        
        reservation.setUniqueId("123456789");
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);
        
        final DailyPattern recurrence = new DailyPattern(this.startDate, 1);
        recurrence.setEndDate(endDateOfPattern);
        
        final List<RoomReservation> reservations =
                this.reservationRemoteService.saveRecurringRoomReservation(reservation, recurrence);
        
        Assert.assertNotNull(reservations);
        Assert.assertFalse(reservations.isEmpty());
        Assert.assertEquals(this.startDate, reservations.get(0).getStartDate());
    }
    
    /**
     * Test ReservationRemoteService.getRoomReservationsByUniqueId().
     */
    public void testGetRoomReservationsByUniqueId() {
        createReservation(UNIQUE_ID);
        
        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservationsByUniqueId(UNIQUE_ID);
        
        Assert.assertNotNull(reservations);
        Assert.assertFalse(reservations.isEmpty());
    }
    
    /**
     * Test ReservationRemoteService.cancelRoomReservation().
     */
    public void testCancelRoomReservation() {
        createReservation(UNIQUE_ID);
        
        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservationsByUniqueId(UNIQUE_ID);
        
        Assert.assertEquals(1, reservations.size());
        final RoomReservation roomReservation = reservations.get(0);
        
        this.reservationRemoteService.cancelRoomReservation(roomReservation);
        final RoomReservation cancelledReservation =
                roomReservationDataSource.get(roomReservation.getReserveId());
        Assert.assertEquals("Cancelled", cancelledReservation.getStatus());
        
        final List<RoomReservation> result =
                this.reservationRemoteService.getRoomReservationsByUniqueId(UNIQUE_ID);
        
        Assert.assertTrue(result.isEmpty());
        
    }
    
    /**
     * Test ReservationRemoteService.disconnectRoomReservation().
     */
    public void testDisconnectRoomReservation() {
        createReservation(UNIQUE_ID);
        
        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservationsByUniqueId(UNIQUE_ID);
        
        Assert.assertEquals(1, reservations.size());
        RoomReservation roomReservation = reservations.get(0);
        final Integer reserveId = roomReservation.getReserveId();
        Assert.assertEquals(UTC_TIME_ZONE, roomReservation.getTimeZone());
        final Date startDateTime = roomReservation.getStartDateTime();
        final Date endDateTime = roomReservation.getEndDateTime();
        
        this.reservationRemoteService.disconnectRoomReservation(roomReservation);
        
        final List<RoomReservation> result =
                this.reservationRemoteService.getRoomReservationsByUniqueId(UNIQUE_ID);
        
        Assert.assertTrue(result.isEmpty());
        
        roomReservation = this.reservationRemoteService.getRoomReservationById(reserveId);
        Assert.assertNull(roomReservation.getUniqueId());
        
        // Verify that the timing has not changed (KB 3037586).
        Assert.assertEquals(UTC_TIME_ZONE, roomReservation.getTimeZone());
        Assert.assertEquals(startDateTime, roomReservation.getStartDateTime());
        Assert.assertEquals(endDateTime, roomReservation.getEndDateTime());
        for (final RoomAllocation roomAllocation : roomReservation.getRoomAllocations()) {
            Assert.assertEquals(UTC_TIME_ZONE, roomAllocation.getTimeZone());
            Assert.assertEquals(startDateTime, roomAllocation.getStartDateTime());
            Assert.assertEquals(endDateTime, roomAllocation.getEndDateTime());
        }
    }
    
    /**
     * Test ReservationRemoteService.getRoomDetails().
     */
    public void testGetRoomDetails() {
        final Room room = this.reservationRemoteService.getRoomDetails(BL_ID, FL_ID, RM_ID);
        
        Assert.assertNotNull(room);
        Assert.assertEquals(BL_ID, room.getBuildingId());
        Assert.assertEquals(FL_ID, room.getFloorId());
        Assert.assertEquals(RM_ID, room.getId());
    }
    
    /**
     * Test ReservationRemoteService.getUserLocation().
     */
    public void testGetUserLocation() {
        final UserLocation userLocation = this.reservationRemoteService.getUserLocation(EMAIL);
        
        Assert.assertNotNull(userLocation);
    }
    
    /**
     * Set the ReservationRemoteService to test.
     * 
     * @param reservationRemoteService the reservation remote service to set
     */
    public void setReservationRemoteService(final ReservationRemoteService reservationRemoteService) {
        this.reservationRemoteService = reservationRemoteService;
    }
    
    /**
     * Set the RoomReservationDataSource used for verifying test results.
     * 
     * @param roomReservationDataSource the room reservation data source to set
     */
    public void setRoomReservationDataSource(
            final RoomReservationDataSource roomReservationDataSource) {
        this.roomReservationDataSource = roomReservationDataSource;
    }
    
    /**
     * Create a reservation based on the static test properties with the given unique ID.
     * 
     * @param uniqueId the unique ID of the reservation to create
     */
    private void createReservation(final String uniqueId) {
        final RoomArrangement roomArrangement =
                new RoomArrangement(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        final RoomReservation reservation =
                new RoomReservation(new TimePeriod(this.startDate, this.startDate, this.startTime,
                    this.endTime), roomArrangement);
        reservation.setEmail(EMAIL);
        
        reservation.setUniqueId(uniqueId);
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);
        this.reservationRemoteService.saveRoomReservation(reservation);
    }
}
