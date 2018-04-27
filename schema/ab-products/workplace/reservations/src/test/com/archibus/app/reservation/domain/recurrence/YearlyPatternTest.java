package com.archibus.app.reservation.domain.recurrence;

import java.text.ParseException;
import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.Month;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Test for YearlyPattern.
 */
public class YearlyPatternTest extends RecurrencePatternTestBase {
    
    /**
     * Test YearlyPattern.loopThroughRepeats() using a fixed yearly date.
     */
    public void testLoopThroughRepeatsFixedDate() {
        // Create a new pattern occurring on a fixed day of the month.
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);
        pattern.setEndDate(this.endDate);
        
        final TestOccurrenceAction testAction = new TestOccurrenceAction();
        try {
            pattern.loopThroughRepeats(testAction);
            
            // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
            Assert.assertEquals(6, testAction.getNumberOfVisitedDates());
            // CHECKSTYLE:ON
            final List<Date> visitedDates = testAction.getVisitedDates();
            Assert.assertEquals(this.dateFormatter.parse("2013-05-17"), visitedDates.get(0));
            Assert.assertEquals(this.dateFormatter.parse("2014-05-17"), visitedDates.get(1));
            Assert.assertEquals(this.dateFormatter.parse("2015-05-17"), visitedDates.get(2));
            // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
            Assert.assertEquals(this.dateFormatter.parse("2016-05-17"), visitedDates.get(3));
            Assert.assertEquals(this.dateFormatter.parse("2017-05-17"), visitedDates.get(4));
            Assert.assertEquals(this.dateFormatter.parse("2018-05-17"), visitedDates.get(5));
        } catch (final ParseException exception) {
            fail(exception.toString());
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }
    
    /**
     * Test YearlyPattern.loopThroughRepeats() using a specified yearly instance of a week day in a
     * specific month.
     * <p>
     * Suppress warning avoid final local variable
     * <p>
     * Justification: Turning local variable into field is not useful in this case.
     */
    @SuppressWarnings("PMD.AvoidFinalLocalVariable")
    public void testLoopThroughRepeatsWeekDay() {
        // Create a new pattern occurring on a specific instance of a weekday day each month.
        final DayOfTheWeek dayOfTheWeek = DayOfTheWeek.Thursday;
        final int weekOfMonth = 3;
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, this.endDate, Month.May, weekOfMonth,
                    dayOfTheWeek);
        
        final TestOccurrenceAction testAction = new TestOccurrenceAction();
        try {
            pattern.loopThroughRepeats(testAction);
            
            // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
            Assert.assertEquals(6, testAction.getNumberOfVisitedDates());
            // CHECKSTYLE:ON
            final List<Date> visitedDates = testAction.getVisitedDates();
            Assert.assertEquals(this.dateFormatter.parse("2013-05-16"), visitedDates.get(0));
            Assert.assertEquals(this.dateFormatter.parse("2014-05-15"), visitedDates.get(1));
            Assert.assertEquals(this.dateFormatter.parse("2015-05-21"), visitedDates.get(2));
            // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
            Assert.assertEquals(this.dateFormatter.parse("2016-05-19"), visitedDates.get(3));
            Assert.assertEquals(this.dateFormatter.parse("2017-05-18"), visitedDates.get(4));
            Assert.assertEquals(this.dateFormatter.parse("2018-05-17"), visitedDates.get(5));
        } catch (final ParseException exception) {
            fail(exception.toString());
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }
}
