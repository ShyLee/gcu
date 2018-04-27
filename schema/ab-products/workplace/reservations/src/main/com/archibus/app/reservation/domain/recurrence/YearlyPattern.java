package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import javax.xml.bind.annotation.*;

import microsoft.exchange.webservices.data.Month;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Yearly pattern for recurring reservations.
 * 
 * @author Bart Vanderschoot
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "YearlyPattern")
public class YearlyPattern extends AbstractMonthlyPattern {
    
    /** The converter for month values in the recurrence pattern and Calendar. */
    private final MonthConverter monthConverter = new MonthConverter();
    
    /** The month. */
    private Month month;
    
    /**
     * Default constructor.
     */
    public YearlyPattern() {
        super();
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param month month
     * @param weekOfMonth week of month
     * @param dayOfTheWeek day of the week
     */
    public YearlyPattern(final Date startDate, final Date endDate, final Month month,
            final int weekOfMonth, final DayOfTheWeek dayOfTheWeek) {
        super(startDate, endDate, 1, weekOfMonth, dayOfTheWeek);
        this.month = month;
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param month month
     * @param dayOfMonth day of month
     */
    public YearlyPattern(final Date startDate, final Month month, final int dayOfMonth) {
        super(startDate, 1, dayOfMonth);
        this.month = month;
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param month month
     * @param weekOfMonth week of month
     * @param dayOfTheWeek day of the week
     */
    public YearlyPattern(final Date startDate, final Month month, final int weekOfMonth,
            final DayOfTheWeek dayOfTheWeek) {
        super(startDate, 1, weekOfMonth, dayOfTheWeek);
        this.month = month;
    }
    
    /**
     * Get month.
     * 
     * @return month
     */
    public final Month getMonth() {
        return this.month;
    }
    
    /**
     * Implementation of the loop method for creating individual reservation records.
     * 
     * @param action occurence action to be implemented
     * 
     * @throws ReservationException reservation exception
     */
    @Override
    public final void loopThroughRepeats(final OccurrenceAction action) throws ReservationException {
        Date date = getStartDate();
        final Calendar cal = getStartDateCalendar();
        
        int index = 1;
        boolean userWantsToContinue = true;
        while (userWantsToContinue && isBeforeEndOfPattern(index, date)) {
            cal.add(Calendar.YEAR, getInterval());
            cal.set(Calendar.MONTH, this.monthConverter.convertMonth(this.month));
            
            IntervalPatternHelper.toDayOfMonth(cal, getDayOfTheWeek(), getWeekOfMonth(),
                getDayOfMonth());
            date = cal.getTime();
            
            userWantsToContinue = action.handleOccurrence(date);
            
            index++;
        }
    }
    
    /**
     * Set month.
     * 
     * @param month month
     */
    public final void setMonth(final Month month) {
        this.month = month;
    }
    
    /**
     * Create XML string for recurring rule.
     * 
     * @return string string
     */
    @Override
    public final String toString() {
        // TODO:
        return "<options type=\"year\"></options>";
    }
    
}
