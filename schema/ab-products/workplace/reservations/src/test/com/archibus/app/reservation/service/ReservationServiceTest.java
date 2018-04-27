package com.archibus.app.reservation.service;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import junit.framework.Assert;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.dao.datasource.Utils;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.util.TimeZoneConverter;

/**
 * The Class ReservationServiceTest.
 */
public class ReservationServiceTest extends ReservationServiceTestBase {
    
    /** ID of the resource to allocate. */
    private static final String RESOURCE_ID = "LCD-PROJECTOR1";
    
    /** Time zone of the HQ building. */
    private static final String HQ_TIMEZONE = "America/New_York";
    
    /**
     * Test find available rooms.
     */
    public final void testFindAvailableRooms() {
        final Date startDate = Utils.getDate(10);
        
        final TimePeriod timePeriod =
                new TimePeriod(startDate, startDate, this.startTime, this.endTime);
        
        final RoomReservation roomReservation =
                new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        
        try {
            final List<RoomArrangement> rooms =
                    this.reservationService.findAvailableRooms(roomReservation, 5, null, false,
                        null);
            
            Assert.assertNotNull(rooms);
            
            Assert.assertFalse(rooms.isEmpty());
        } catch (ReservationException exception) {
            Assert.fail(exception.toString());
        }
    }
    
    /**
     * 
     * test Find available Rooms No Results.
     * 
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public final void testFindAvalaibleRoomsNoResults() throws Exception {
        final Date startDate = Utils.getDate(10);
        
        final Time startTime2 = new Time(this.timeFormatter.parse("1899-12-30 07:00:00").getTime());
        final Time endTime2 = new Time(this.timeFormatter.parse("1899-12-30 11:10:00").getTime());
        final TimePeriod timePeriod = new TimePeriod(startDate, startDate, startTime2, endTime2);
        
        final RoomReservation roomReservation =
                new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        
        final List<RoomArrangement> rooms =
                this.reservationService.findAvailableRooms(roomReservation, 5, null, false, null);
        
        Assert.assertNotNull(rooms);
        Assert.assertTrue(rooms.isEmpty());
    }
    
    /**
     * Test save room reservation.
     */
    public final void testSaveRoomReservation() {
        
        final RoomReservation roomReservation = createRoomReservation();
        
        try {
            this.reservationService.saveReservation(roomReservation);
        } catch (ReservationException exception) {
            Assert.fail(exception.toString());
        }
        Assert.assertNotNull(roomReservation.getReserveId());
    }
    
    /**
     * Test save room reservation.
     */
    public final void testSaveRoomReservationWithResources() {
        
        final RoomReservation roomReservation = createRoomReservation();
        
        final Resource resource = new Resource();
        resource.setResourceId(RESOURCE_ID);
        
        final ResourceAllocation resourceAllocation =
                new ResourceAllocation(resource, roomReservation, 1);
        
        // the resource allocation should be in a room
        resourceAllocation.setBlId(BL_ID);
        resourceAllocation.setFlId(FL_ID);
        resourceAllocation.setRmId(RM_ID);
        
        roomReservation.addResourceAllocation(resourceAllocation);
        
        try {
            this.reservationService.saveReservation(roomReservation);
        } catch (ReservationException exception) {
            Assert.fail(exception.toString());
        }
        Assert.assertNotNull(roomReservation.getReserveId());
    }
    
    /**
     * Test save room reservation failed.
     * 
     * @throws ParseException ParseException
     */
    public final void testSaveRoomReservationFailed() throws ParseException {
        
        try {
            final Date startDate = Utils.getDate(10);
            
            // try to reserve before starting hour
            final Time startTime2 =
                    new Time(this.timeFormatter.parse("1899-12-30 07:30:00").getTime());
            final Time endTime2 =
                    new Time(this.timeFormatter.parse("1899-12-30 11:20:00").getTime());
            
            final TimePeriod timePeriod =
                    new TimePeriod(startDate, startDate, startTime2, endTime2);
            
            final RoomReservation roomReservation =
                    new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
            
            final Employee creator = this.employeeService.findEmployee(AFM_EMAIL);
            roomReservation.setCreator(creator);
            
            roomReservation.setReservationName(TEST);
            roomReservation.setReservationType(TYPE_REGULAR);
            roomReservation.setStatus(CONFIRMED);
            
            // reservationService.saveReservation(roomReservation);
            // fail();
            
            roomReservation.setStartTime(new Time(this.timeFormatter.parse("1899-12-30 15:00:00")
                .getTime()));
            roomReservation.setEndTime(new Time(this.timeFormatter.parse("1899-12-30 20:30:00")
                .getTime()));
            
            // reservationService.saveReservation(roomReservation);
            // fail();
            
            roomReservation.setStartTime(new Time(this.timeFormatter.parse("1899-12-30 09:30:00")
                .getTime()));
            roomReservation.setEndTime(new Time(this.timeFormatter.parse("1899-12-30 11:30:00")
                .getTime()));
            
            this.reservationService.saveReservation(roomReservation);
            // ok
            
            final RoomReservation overlappingReservation =
                    new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
            
            overlappingReservation.setStartTime(new Time(this.timeFormatter.parse(
                "1899-12-30 10:00:00").getTime()));
            overlappingReservation.setEndTime(new Time(this.timeFormatter.parse(
                "1899-12-30 12:30:00").getTime()));
            
            roomReservation.setCreator(creator);
            
            roomReservation.setReservationName(TEST);
            roomReservation.setReservationType(TYPE_REGULAR);
            roomReservation.setStatus(CONFIRMED);
            
            this.reservationService.saveReservation(overlappingReservation);
            // should fail
            fail();
            
        } catch (ReservationException e) {
            Assert.assertEquals("The room is not available.", e.getPattern());
        }
    }
    
    /**
     * Test saving a recurring reservation.
     */
    public void testSaveRecurringRoomReservation() {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        final Time startTime = roomReservation.getStartTime();
        final Time endTime = roomReservation.getEndTime();
        
        try {
            final List<RoomReservation> reservations =
                    this.reservationService.saveRecurringReservation(roomReservation, recurrence);
            Assert.assertNotNull(roomReservation.getReserveId());
            Assert.assertEquals(roomReservation.getReserveId(), reservations.get(0).getReserveId());
            Assert
                .assertEquals(recurrence.getNumberOfOccurrences().intValue(), reservations.size());
            assertTrue("All reservations adhere to the recurrence pattern.",
                this.reservationService.verifyRecurrencePattern(UNIQUE_ID, recurrence, startTime,
                    endTime, HQ_TIMEZONE));
        } catch (ReservationException exception) {
            Assert.fail(exception.toString());
        }
    }
    
    /**
     * Test saving a recurring reservation in different time zones.
     */
    public void testSaveRecurringRoomReservationWithTimeZones() {
        final Recurrence recurrence = createRecurrence();
        final List<String> timeZones = new ArrayList<String>();
        timeZones.add("Europe/Brussels");
        timeZones.add("Europe/Moscow");
        timeZones.add("Asia/Bangkok");
        timeZones.add("Australia/Brisbane");
        timeZones.add("Pacific/Auckland");
        timeZones.add("America/Los_Angeles");
        
        for (final String timeZone : timeZones) {
            final RoomReservation roomReservation =
                    createReservationForRecurrenceTest(timeZone, recurrence.getStartDate());
            final Time startTime = roomReservation.getStartTime();
            final Time endTime = roomReservation.getEndTime();
            try {
                final List<RoomReservation> reservations =
                        this.reservationService.saveRecurringReservation(roomReservation,
                            recurrence);
                Assert.assertNotNull(roomReservation.getReserveId());
                Assert.assertEquals(roomReservation.getReserveId(), reservations.get(0)
                    .getReserveId());
                Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(),
                    reservations.size());
                
                assertTrue(
                    timeZone + ": All reservations are according to the recurrence pattern.",
                    this.reservationService.verifyRecurrencePattern(UNIQUE_ID, recurrence,
                        startTime, endTime, timeZone));
                
                // cancel the reservations again
                this.reservationService.cancelRecurringReservation(UNIQUE_ID, AFM_EMAIL, false);
            } catch (ReservationException exception) {
                Assert.fail(timeZone + ": " + exception.toString());
            }
            
        }
    }
    
    /**
     * Create a recurrence pattern for testing.
     * 
     * @return the recurrence pattern.
     */
    private Recurrence createRecurrence() {
        final Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DATE, DAYS_AHEAD);
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.FRIDAY);
        final Date startDate = TimePeriod.clearTime(calendar.getTime());
        // CHECKSTYLE:OFF Justification: magic number used for testing
        calendar.add(Calendar.DATE, 14);
        // CHECKSTYLE:ON
        final Date endDate = calendar.getTime();
        final List<DayOfTheWeek> daysOfTheWeek = new ArrayList<DayOfTheWeek>(3);
        daysOfTheWeek.add(DayOfTheWeek.Monday);
        daysOfTheWeek.add(DayOfTheWeek.Wednesday);
        daysOfTheWeek.add(DayOfTheWeek.Friday);
        final Recurrence pattern = new WeeklyPattern(startDate, endDate, 1, daysOfTheWeek);
        // CHECKSTYLE:OFF Justification: used for testing.
        pattern.setNumberOfOccurrences(7);
        // CHECKSTYLE:ON
        return pattern;
    }
    
    /**
     * Create a reservation to use for recurrence testing. It is a different room with properties
     * more suitable for multiple bookings.
     * 
     * @param timeZone time zone for the reservation
     * @param date the date for the reservation (in building time zone)
     * @return reservation to be used for recurrence testing.
     */
    private RoomReservation createReservationForRecurrenceTest(final String timeZone,
            final Date date) {
        final RoomReservation roomReservation = createRoomReservation();
        final RoomAllocation allocation = roomReservation.getRoomAllocations().get(0);
        // change to a different room that allows more bookings
        allocation.setBlId("HQ");
        allocation.setFlId("17");
        allocation.setRmId("127");
        allocation.setConfigId("CONF-BIG-A");
        allocation.setArrangeTypeId("CONFERENCE");
        roomReservation.setUniqueId(UNIQUE_ID);
        roomReservation.setTimeZone(timeZone);
        roomReservation.setStartDate(date);
        roomReservation.setEndDate(date);
        
        if (!HQ_TIMEZONE.equals(roomReservation.getTimeZone())) {
            // The time currently in the reservation object is in building time.
            // Convert it to the requested time zone.
            final Date startDateTime =
                    TimeZoneConverter.calculateDateTimeForBuilding(allocation.getBlId(),
                        roomReservation.getTimePeriod().getStartDateTime(),
                        roomReservation.getTimeZone(), false);
            final int durationInMinutes =
                    (int) (roomReservation.getEndDateTime().getTime() - roomReservation
                        .getStartDateTime().getTime()) / TimePeriod.MINUTE_MILLISECONDS;
            
            final TimePeriod timePeriod =
                    new TimePeriod(date, new Time(startDateTime.getTime()), durationInMinutes,
                        timeZone);
            roomReservation.setTimePeriod(timePeriod);
        }
        
        return roomReservation;
    }
    
}
