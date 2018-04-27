package com.archibus.app.reservation.domain.recurrence;

import java.util.Date;

import javax.xml.bind.annotation.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Interval pattern.
 * 
 * @author Bart Vanderschoot
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "IntervalPattern")
public abstract class AbstractIntervalPattern extends Recurrence {
    /** days is a week. */
    protected static final int DAYS_IN_WEEK = 7;
    
    /** last week day. */
    protected static final int LAST_WEEKDAY = 5;
    
    /**
     * Interface to implement for looping through recurrent reservations.
     * 
     * @author Bart Vanderschoot
     */
    public interface OccurrenceAction {
        /**
         * Handle a single occurrence of the interval pattern.
         * 
         * @param date the date of the occurrence to handle
         * 
         * @return true if the loop should continue, false to stop
         * 
         * @throws ReservationException reservation exception
         */
        boolean handleOccurrence(Date date) throws ReservationException;
    }
    
    /** The interval. */
    protected Integer interval = 1;
    
    /**
     * Default constructor.
     */
    protected AbstractIntervalPattern() {
        super();
    }
    
    /**
     * Constructor with parameters.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param interval interval
     */
    public AbstractIntervalPattern(final Date startDate, final Date endDate, final Integer interval) {
        super();
        setInterval(interval);
        setStartDate(startDate);
        setEndDate(endDate);
    }
    
    /**
     * Constructor with parameters.
     * 
     * @param startDate start date
     * @param interval interval
     */
    public AbstractIntervalPattern(final Date startDate, final Integer interval) {
        super();
        setInterval(interval);
        setStartDate(startDate);
    }
    
    /**
     * Loop through all repeats of the pattern, thus excluding the first instance. End the loop if
     * the OccurrenceAction return value is false.
     * 
     * @param action the action to perform on each repeat
     * @throws ReservationException reservation exception
     */
    public abstract void loopThroughRepeats(OccurrenceAction action) throws ReservationException;
    
    /**
     * Get the interval.
     * 
     * @return interval
     */
    public int getInterval() {
        return this.interval;
    }
    
    /**
     * Set the interval.
     * 
     * @param interval interval
     */
    public final void setInterval(final int interval) {
        this.interval = interval;
    }
    
    /**
     * Helper method to check whether the loop through all repeats should continue.
     * 
     * @param index the index of the occurrence that was last handled
     * @param date the date of the occurrence that was last handled
     * @return true if the loop should continue, false otherwise
     */
    protected boolean isBeforeEndOfPattern(final int index, final Date date) {
        boolean isBeforeEnd = true;
        final Integer numberOfOccurrences = getNumberOfOccurrences();
        final Date endDate = getEndDate();
        if (numberOfOccurrences != null && numberOfOccurrences <= index) {
            isBeforeEnd = false;
        } else if (endDate != null && endDate.compareTo(date) <= 0) {
            isBeforeEnd = false;
        } else if ((numberOfOccurrences == null && endDate == null) || getInterval() == 0) {
            /*
             * When no end date and no number of occurrences is specified, of if interval is 0, the
             * loop should not continue. This avoids an endless loop.
             */
            isBeforeEnd = false;
        }
        return isBeforeEnd;
    }
    
}
