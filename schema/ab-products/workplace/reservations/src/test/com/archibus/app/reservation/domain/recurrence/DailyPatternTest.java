package com.archibus.app.reservation.domain.recurrence;

import java.text.SimpleDateFormat;
import java.util.*;

import junit.framework.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Test for DailyPattern.
 */
public class DailyPatternTest extends TestCase {
    
    /** The recurrence pattern under test. */
    private DailyPattern pattern;
    
    /** Start date of the pattern. */
    private Date startDate;
    
    /** End date of the pattern. */
    private Date endDate;
    
    /** Number of occurrences in the pattern when interval == 1. */
    private int defaultNumberOfOccurrences;
    
    /**
     * Number of repeats in the pattern when interval == 1. This is one less than the number of
     * occurrence because the first occurrence doesn't count as a repeat.
     */
    private int defaultNumberOfRepeats;
    
    /**
     * Occurrence action used for testing the loopThroughRepeats().
     */
    private TestOccurrenceAction testAction;
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        
        this.startDate = dateFormatter.parse("2011-11-09");
        this.endDate = dateFormatter.parse("2011-11-19");
        // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
        this.defaultNumberOfOccurrences = 11;
        // CHECKSTYLE:ON
        this.defaultNumberOfRepeats = this.defaultNumberOfOccurrences - 1;
        
        this.pattern = new DailyPattern(this.startDate, this.endDate, 1);
        
        this.testAction = new TestOccurrenceAction();
    }
    
    /**
     * Test for DailyPattern.loopThroughRepeats() with only an end date specified.
     */
    public void testLoopThroughRepeatsEndDate() {
        try {
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals(this.defaultNumberOfRepeats,
                this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            int interval = 2;
            this.pattern.setInterval(interval);
            this.pattern.loopThroughRepeats(this.testAction);
            // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
            Assert.assertEquals(5, this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            /*
             * The end date in the recurrence pattern indicates when the loop should stop: there is
             * exactly one occurrence of the pattern on or after the specified end date.
             */
            interval = 3;
            this.pattern.setInterval(interval);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals(4, this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            interval = 4;
            this.pattern.setInterval(interval);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals(3, this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            for (interval = 5; interval < this.defaultNumberOfRepeats; ++interval) {
                // CHECKSTYLE:ON
                this.pattern.setInterval(interval);
                this.pattern.loopThroughRepeats(this.testAction);
                Assert.assertEquals("Number of repeats for interval = " + interval, 2,
                    this.testAction.getNumberOfVisitedDates());
                this.testAction.clearVisitedDates();
            }
            for (interval = this.defaultNumberOfRepeats; interval < 2 * this.defaultNumberOfOccurrences; ++interval) {
                this.pattern.setInterval(interval);
                this.pattern.loopThroughRepeats(this.testAction);
                Assert.assertEquals("interval = " + interval, 1,
                    this.testAction.getNumberOfVisitedDates());
                this.testAction.clearVisitedDates();
            }
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }
    
    /**
     * Test DailyPattern.loopThroughRepeats with number of occurrences and end date specified.
     */
    public void testLoopThroughRepeatsOccurrences() {
        try {
            /*
             * When the number of occurrences is specified in the pattern, this number is never
             * exceeded. The number of repeats is smaller if the end date is reached beforehand.
             */
            this.pattern.setInterval(1);
            this.pattern.setNumberOfOccurrences(1);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals("One occurrence means no repeats.", 0,
                this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            int numberOfOccurrences = this.defaultNumberOfOccurrences / 2;
            this.pattern.setNumberOfOccurrences(numberOfOccurrences);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals("Number of occurrences limits the number of visited dates.",
                numberOfOccurrences - 1, this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            numberOfOccurrences = 2 * this.defaultNumberOfOccurrences;
            this.pattern.setNumberOfOccurrences(numberOfOccurrences);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals(
                "Larger number of occurrences is ignored when end date is specified.",
                this.defaultNumberOfRepeats, this.testAction.getNumberOfVisitedDates());
            this.testAction.clearVisitedDates();
            
            this.pattern.setEndDate(null);
            this.pattern.loopThroughRepeats(this.testAction);
            Assert.assertEquals(
                "Larger number of occurrences is applied when no end date is specified.",
                numberOfOccurrences - 1, this.testAction.getNumberOfVisitedDates());
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }
    
    /**
     * Test for AbstractIntervalPattern.isBeforeEndOfPattern().
     */
    public void testIsBeforeEndOfPattern() {
        Assert.assertTrue(this.pattern.isBeforeEndOfPattern(1, this.startDate));
        Assert.assertFalse(this.pattern.isBeforeEndOfPattern(this.defaultNumberOfOccurrences,
            this.endDate));
        
        this.pattern.setNumberOfOccurrences(this.defaultNumberOfOccurrences);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.endDate);
        int occurrenceIndex = this.defaultNumberOfOccurrences - 1;
        calendar.add(Calendar.DATE, -1);
        Assert.assertTrue(this.pattern.isBeforeEndOfPattern(occurrenceIndex, calendar.getTime()));
        
        occurrenceIndex = this.defaultNumberOfOccurrences;
        Assert.assertFalse(this.pattern.isBeforeEndOfPattern(occurrenceIndex, this.endDate));
        
        this.pattern.setInterval(0);
        assertFalse("Always false if interval is 0.",
            this.pattern.isBeforeEndOfPattern(1, this.startDate));
        
        this.pattern.setInterval(1);
        this.pattern.setNumberOfOccurrences(null);
        this.pattern.setEndDate(null);
        assertFalse("Always false if no end date and no number of occurrences is specified.",
            this.pattern.isBeforeEndOfPattern(1, this.startDate));
    }
    
}
