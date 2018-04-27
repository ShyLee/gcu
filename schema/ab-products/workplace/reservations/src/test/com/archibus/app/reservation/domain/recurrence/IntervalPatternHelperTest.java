package com.archibus.app.reservation.domain.recurrence;

import java.util.Calendar;

import junit.framework.*;

/**
 * Test for IntervalPatternHelper.
 */
public class IntervalPatternHelperTest extends TestCase {
    
    /** Calendar instance used for testing. */
    private Calendar calendar;
    
    /** Calendar instance that indicates the expected day of a test. */
    private Calendar correctDay;
    
    /**
     * Set up for a test case.
     * 
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.calendar = Calendar.getInstance();
        this.calendar.clear();
        this.correctDay = Calendar.getInstance();
        this.correctDay.clear();
        
        // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
        this.calendar.set(2011, Calendar.NOVEMBER, 29);
        // CHECKSTYLE:ON
    }
    
    /**
     * Test IntervalPatternHelper.toDayOfTheWeekInstance() with simple days of the week.
     */
    public void testToWeekDaySimple() {
        // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
        this.correctDay.set(2011, Calendar.NOVEMBER, 3);
        
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Thursday, 1);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Thursday, 5);
        this.correctDay.set(2011, Calendar.NOVEMBER, 24);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 20);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Sunday, 3);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 28);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Monday, 5);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 14);
        // CHECKSTYLE:ON
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Monday, 2);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
    }
    
    /**
     * Test IntervalPatternHelper.toDayOfTheWeekInstance() with DayOfTheWeek.Weekday.
     */
    public void testToWeekDayWeekday() {
        // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
        this.correctDay.set(2011, Calendar.NOVEMBER, 30);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Weekday, 5);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.calendar.set(2011, Calendar.DECEMBER, 18);
        this.correctDay.set(2011, Calendar.DECEMBER, 6);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Weekday, 4);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.DECEMBER, 2);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Weekday, 2);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.DECEMBER, 30);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Weekday, 5);
        // CHECKSTYLE:ON
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
    }
    
    /**
     * Test IntervalPatternHelper.toDayOfTheWeekInstance() with DayOfTheWeek.WeekendDay.
     */
    public void testToWeekDayWeekendDay() {
        // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
        this.correctDay.set(2011, Calendar.NOVEMBER, 27);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.WeekendDay, 5);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 12);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.WeekendDay, 3);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 5);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.WeekendDay, 1);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.calendar.set(2012, Calendar.JANUARY, 18);
        this.correctDay.set(2012, Calendar.JANUARY, 1);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.WeekendDay, 1);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2012, Calendar.JANUARY, 7);
        // CHECKSTYLE:ON
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.WeekendDay, 2);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
    }
    
    /**
     * Test IntervalPatternHelper.toDayOfTheWeekInstance() with DayOfTheWeek.Day (i.e. any day).
     */
    public void testToWeekDayDay() {
        // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
        this.calendar.set(2011, Calendar.NOVEMBER, 29);
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 30);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Day, 5);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 1);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Day, 1);
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
        
        this.correctDay.set(2011, Calendar.NOVEMBER, 4);
        IntervalPatternHelper.toDayOfTheWeekInstance(this.calendar, DayOfTheWeek.Day, 4);
        // CHECKSTYLE:ON
        Assert.assertEquals(this.correctDay.getTime(), this.calendar.getTime());
    }
    
}
