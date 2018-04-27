package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Monthly pattern for recurring reservations.
 * 
 * This pattern has two options: either a fixed date specified via the day of the month, or a
 * specific weekday specified via the day of the week and which instance of that day of the week.
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "MonthlyPattern")
public class MonthlyPattern extends AbstractMonthlyPattern {
    
    /**
     * Default constructor.
     */
    public MonthlyPattern() {
        super();
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param interval interval
     * @param weekOfMonth week of the month
     * @param dayOfTheWeek day of the week
     */
    public MonthlyPattern(final Date startDate, final Date endDate, final Integer interval,
            final Integer weekOfMonth, final DayOfTheWeek dayOfTheWeek) {
        super(startDate, endDate, interval, weekOfMonth, dayOfTheWeek);
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param interval interval
     * @param dayOfMonth day of month
     */
    public MonthlyPattern(final Date startDate, final Integer interval, final int dayOfMonth) {
        super(startDate, interval, dayOfMonth);
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param interval interval
     * @param weekOfMonth week of month
     * @param dayOfTheWeek day of the week
     */
    public MonthlyPattern(final Date startDate, final Integer interval, final Integer weekOfMonth,
            final DayOfTheWeek dayOfTheWeek) {
        super(startDate, interval, weekOfMonth, dayOfTheWeek);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public final void loopThroughRepeats(final OccurrenceAction action) throws ReservationException {
        Date date = getStartDate();
        final Calendar cal = getStartDateCalendar();
        
        int index = 1;
        boolean userWantsToContinue = true;
        while (userWantsToContinue && isBeforeEndOfPattern(index, date)) {
            cal.add(Calendar.MONTH, this.interval);
            
            IntervalPatternHelper.toDayOfMonth(cal, getDayOfTheWeek(), getWeekOfMonth(),
                getDayOfMonth());
            date = cal.getTime();
            userWantsToContinue = action.handleOccurrence(date);
            index++;
        }
    }
    
    /**
     * Create XML string for recurring rule.
     * 
     * @return the string
     */
    @Override
    public final String toString() {
        return "<options type=\"month\">" + "<monthly 1st=\"" + checkWeekOfTheMonth(ONE)
                + "\"  2nd=\"" + checkWeekOfTheMonth(TWO) + "\" 3rd=\""
                + checkWeekOfTheMonth(THREE) + "\"  4th=\"" + checkWeekOfTheMonth(FOUR)
                + "\" last=\"" + checkWeekOfTheMonth(FIVE) + "\" " + " mon=\""
                + checkDayOfTheWeek(DayOfTheWeek.Monday) + "\" tue=\""
                + checkDayOfTheWeek(DayOfTheWeek.Tuesday) + "\" wed=\""
                + checkDayOfTheWeek(DayOfTheWeek.Wednesday) + "\" thu=\""
                + checkDayOfTheWeek(DayOfTheWeek.Thursday) + "\" fri=\""
                + checkDayOfTheWeek(DayOfTheWeek.Friday) + "\" sat=\""
                + checkDayOfTheWeek(DayOfTheWeek.Saturday) + "\" sun=\""
                + checkDayOfTheWeek(DayOfTheWeek.Sunday) + "\" />" + "</options>";
    }
}
