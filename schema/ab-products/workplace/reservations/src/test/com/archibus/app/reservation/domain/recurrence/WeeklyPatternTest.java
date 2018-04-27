package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import junit.framework.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Weekly pattern test.
 * 
 * @author Yorik Gerlo
 */
public class WeeklyPatternTest extends TestCase {
    
    /** The year used for testing. */
    private static final int YEAR = 2011;
    
    /** The interval pattern under test. */
    private AbstractIntervalPattern pattern;
    
    /** A calendar instance used for testing. */
    private Calendar calendar;
    
    /**
     * Set up for a test case.
     * 
     * @throws Exception when setup fails
     *             <p>
     *             Suppress warning avoid final local variable
     *             <p>
     *             Justification: Turning local variable into field is not useful
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.AvoidFinalLocalVariable", "PMD.SignatureDeclareThrowsException" })
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        this.pattern = new MonthlyPattern();
        this.calendar = Calendar.getInstance();
        this.calendar.clear();
        
        final int dayOfMonth = 29;
        this.calendar.set(YEAR, Calendar.NOVEMBER, dayOfMonth);
    }
    
    /**
     * Test Recurrence.getStartDateCalendar().
     */
    public void testGetStartDateCalendar() {
        this.pattern.setStartDate(this.calendar.getTime());
        Assert.assertEquals(this.calendar, this.pattern.getStartDateCalendar());
    }
    
    /**
     * Test looping through a weekly pattern.
     * <p>
     * Suppress warning avoid final local variable
     * <p>
     * Justification: Turning local variable into field is not useful
     */
    @SuppressWarnings("PMD.AvoidFinalLocalVariable")
    public void testLoopThroughRepeats() {
        final int endDay = 20;
        final Calendar endDate = Calendar.getInstance();
        endDate.clear();
        endDate.set(YEAR, Calendar.DECEMBER, endDay);
        final List<DayOfTheWeek> dayOfTheWeek = new ArrayList<DayOfTheWeek>();
        dayOfTheWeek.add(DayOfTheWeek.Tuesday);
        final WeeklyPattern weeklyPattern =
                new WeeklyPattern(this.calendar.getTime(), endDate.getTime(), 1, dayOfTheWeek);
        final TestOccurrenceAction testAction = new TestOccurrenceAction();
        try {
            weeklyPattern.loopThroughRepeats(testAction);
        } catch (final ReservationException exception) {
            fail("Looping through a valid pattern shouldn't cause an exception: " + exception);
        }
        final List<Date> visitedDates = testAction.getVisitedDates();
        final int expectedVisits = 3;
        
        Assert.assertEquals(expectedVisits, visitedDates.size());
        final int daysInWeek = 7;
        this.calendar.add(Calendar.DATE, daysInWeek);
        Assert.assertEquals(this.calendar.getTime(), visitedDates.get(0));
        this.calendar.add(Calendar.DATE, daysInWeek);
        Assert.assertEquals(this.calendar.getTime(), visitedDates.get(1));
        this.calendar.add(Calendar.DATE, daysInWeek);
        Assert.assertEquals(this.calendar.getTime(), visitedDates.get(2));
    }
}
