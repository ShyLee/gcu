package com.archibus.app.reservation.service;

import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.Utility;

/**
 * Base class fore reservation services.
 * 
 * @author bv
 * @since 20.1
 * 
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a suite that groups other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ReservationServiceTestBase extends DataSourceTestBase {
    
    /** test. */
    protected static final String TEST = "test";
    
    /** Dummy unique ID for testing. */
    protected static final String UNIQUE_ID = "12345678";
    
    /** Dummy reservation name. */
    protected static final String RESERVATION_NAME = "test name";
    
    /** confirmed. */
    protected static final String CONFIRMED = "Confirmed";
    
    /** regular. */
    protected static final String TYPE_REGULAR = "regular";
    
    /** email. */
    protected static final String AFM_EMAIL = "afm@tgd.com";
    
    /** The site id. */
    protected static final String SITE_ID = "MARKET";
    
    /** The bl id. */
    protected static final String BL_ID = "HQ";
    
    /** The fl id. */
    protected static final String FL_ID = "19";
    
    /** The rm id. */
    protected static final String RM_ID = "110";
    
    /** The arrange type id. */
    protected static final String ARRANGE_TYPE_ID = "THEATER";
    
    /** The config id. */
    protected static final String CONFIG_ID = "A1";
    
    /** Number of days ahead to test reservations. */
    protected static final int DAYS_AHEAD = 7;
    
    /** The reservation service. */
    protected IReservationService reservationService;
    
    /** The employee service. */
    protected IEmployeeService employeeService;
    
    /** The space service. */
    protected ISpaceService spaceService;
    
    /** The time formatter. */
    protected final SimpleDateFormat timeFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss",
        Locale.ENGLISH);
    
    /** The start date used for testing. */
    protected Date startDate;
    
    /** The end date used for testing. */
    protected Date endDate;
    
    /** The start time for testing. */
    protected Time startTime;
    
    /** The end time for testing. */
    protected Time endTime;
    
    /**
     * Set up time for a test case.
     * 
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        final Calendar cal = Calendar.getInstance();
        cal.setTime(Utility.currentDate());
        cal.add(Calendar.DATE, DAYS_AHEAD);
        
        this.startDate = cal.getTime();
        this.startDate = TimePeriod.clearTime(this.startDate);
        this.endDate = this.startDate;
        this.startTime = new Time(this.timeFormatter.parse("1899-12-30 09:00:00").getTime());
        this.endTime = new Time(this.timeFormatter.parse("1899-12-30 11:00:00").getTime());
    }
    
    /**
     * 
     * Create Room Reservation.
     * 
     * @return Room Reservation.
     */
    protected RoomReservation createRoomReservation() {
        
        final TimePeriod timePeriod =
                new TimePeriod(this.startDate, this.startDate, this.startTime, this.endTime);
        
        final RoomReservation roomReservation =
                new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        
        final Employee creator = this.employeeService.findEmployee(AFM_EMAIL);
        roomReservation.setCreator(creator);
        
        roomReservation.setReservationName(TEST);
        roomReservation.setReservationType(TYPE_REGULAR);
        
        return roomReservation;
    }
    
    /**
     * Set the reservation service for this test.
     * 
     * @param reservationService the new reservation service
     */
    public final void setReservationService(final IReservationService reservationService) {
        this.reservationService = reservationService;
    }
    
    /**
     * Set the employee service for this test.
     * 
     * @param employeeService the new employee service
     */
    public final void setEmployeeService(final IEmployeeService employeeService) {
        this.employeeService = employeeService;
    }
    
    /**
     * Set the space service for this test.
     * 
     * @param spaceService the new space service
     */
    public final void setSpaceService(final ISpaceService spaceService) {
        this.spaceService = spaceService;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "reservation-service.xml" };
    }
    
}
