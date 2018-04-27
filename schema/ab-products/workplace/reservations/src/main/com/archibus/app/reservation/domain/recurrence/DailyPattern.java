package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Daily pattern for recurring reservations.
 * 
 * @author Bart Vanderschoot
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "DailyPattern")
public class DailyPattern extends AbstractIntervalPattern {
    
    /**
     * Default constructor.
     */
    public DailyPattern() {
        super();
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param interval interval
     */
    public DailyPattern(final Date startDate, final Date endDate, final int interval) {
        super(startDate, endDate, interval);
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param interval interval
     */
    public DailyPattern(final Date startDate, final int interval) {
        super(startDate, interval);
    }
    
    /**
     * Implementation of the loop method for creating individual reservation records.
     * 
     * @param action occurrence action to implement
     * 
     * @throws ReservationException reservation exception
     * 
     */
    @Override
    public final void loopThroughRepeats(final OccurrenceAction action) throws ReservationException {
        Date date = getStartDate();
        final Calendar cal = getStartDateCalendar();
        
        int index = 1;
        boolean userWantsToContinue = true;
        while (userWantsToContinue && isBeforeEndOfPattern(index, date)) {
            cal.add(Calendar.DATE, getInterval());
            date = cal.getTime();
            userWantsToContinue = action.handleOccurrence(date);
            index++;
        }
    }
    
    /**
     * Create XML string for recurring rule.
     * 
     * @return xml string
     */
    @Override
    public final String toString() {
        return "<options type=\"day\">" + "<ndays value=\"" + getInterval() + "\" />"
                + "</options>";
    }
    
}
