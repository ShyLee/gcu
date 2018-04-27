package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Weekly pattern for recurring reservations.
 * 
 * @author Bart Vanderschoot
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "WeeklyPattern")
public class WeeklyPattern extends AbstractIntervalPattern {
    
    /** The days of the week. */
    private List<DayOfTheWeek> daysOfTheWeek = new ArrayList<DayOfTheWeek>();
    
    /** date for first day the week. */
    private Calendar firstDayOfWeek;
    
    /**
     * Default constructor.
     */
    public WeeklyPattern() {
        super();
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param interval interval
     * @param daysOfTheWeek days of the week
     */
    public WeeklyPattern(final Date startDate, final Date endDate, final int interval,
            final List<DayOfTheWeek> daysOfTheWeek) {
        super(startDate, endDate, interval);
        this.daysOfTheWeek = daysOfTheWeek;
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param interval interval
     */
    public WeeklyPattern(final Date startDate, final int interval) {
        super(startDate, interval);
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date start date
     * @param interval interval interval
     * @param daysOfTheWeeks the days of the weeks
     */
    public WeeklyPattern(final Date startDate, final int interval,
            final DayOfTheWeek... daysOfTheWeeks) {
        super(startDate, interval);
        
        for (final DayOfTheWeek day : daysOfTheWeeks) {
            this.daysOfTheWeek.add(day);
        }
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param startDate start date
     * @param interval interval
     * @param daysOfTheWeek days of the week
     */
    public WeeklyPattern(final Date startDate, final int interval,
            final List<DayOfTheWeek> daysOfTheWeek) {
        super(startDate, interval);
        this.daysOfTheWeek = daysOfTheWeek;
    }
    
    /**
     * Check if the day is selected.
     * 
     * @param day of the week
     * 
     * @return true or false
     */
    public final boolean checkDayOfTheWeek(final DayOfTheWeek day) {
        return this.daysOfTheWeek.contains(day);
    }
    
    /**
     * Get selected days of the week.
     * 
     * @return days of the week
     */
    public final List<DayOfTheWeek> getDaysOfTheWeek() {
        return this.daysOfTheWeek;
    }
    
    /**
     * Get first day of the week.
     * 
     * @return calendar date of first day of the week
     */
    public final Calendar getFirstDayOfWeek() {
        return this.firstDayOfWeek;
    }
    
    /**
     * Implementation of the loop method for creating individual reservation records.
     * 
     * @param action occurrence action to be implemented
     * 
     * @throws ReservationException reservation exception
     */
    @Override
    public final void loopThroughRepeats(final OccurrenceAction action) throws ReservationException {
        Date date = getStartDate();
        final Calendar cal = getStartDateCalendar();
        
        final List<DayOfTheWeek> dayList = getDaysOfTheWeekWithoutSpecials();
        // set the day of week iterator to the correct position for the second day
        ListIterator<DayOfTheWeek> dayOfWeekIterator =
                createIteratorForSecondOccurrence(cal.get(Calendar.DAY_OF_WEEK), dayList);
        
        int index = 1;
        boolean userWantsToContinue = true;
        while (userWantsToContinue && isBeforeEndOfPattern(index, date)) {
            
            if (!dayOfWeekIterator.hasNext()) {
                // start back at the beginning
                dayOfWeekIterator = dayList.listIterator();
                // add an interval
                cal.add(Calendar.DATE, getInterval() * DAYS_IN_WEEK);
            }
            final DayOfTheWeek day = dayOfWeekIterator.next();
            cal.set(Calendar.DAY_OF_WEEK, day.getIntValue());
            date = cal.getTime();
            
            userWantsToContinue = action.handleOccurrence(date);
            
            index++;
        }
    }
    
    /**
     * Set days selected of the week.
     * 
     * @param daysOfTheWeek days of the week
     */
    public final void setDaysOfTheWeek(final List<DayOfTheWeek> daysOfTheWeek) {
        this.daysOfTheWeek = daysOfTheWeek;
    }
    
    /**
     * Set first day of the week.
     * 
     * @param firstDayOfWeek first day of the week
     */
    public final void setFirstDayOfWeek(final Calendar firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
    }
    
    /**
     * Create XML string for recurring rule.
     * 
     * @return xml string
     */
    @Override
    public final String toString() {
        return "<options type=\"week\">" + "<weekly mon=\""
                + checkDayOfTheWeek(DayOfTheWeek.Monday) + "\" tue=\""
                + checkDayOfTheWeek(DayOfTheWeek.Tuesday) + "\" wed=\""
                + checkDayOfTheWeek(DayOfTheWeek.Wednesday) + "\" thu=\""
                + checkDayOfTheWeek(DayOfTheWeek.Thursday) + "\" fri=\""
                + checkDayOfTheWeek(DayOfTheWeek.Friday) + "\" sat=\""
                + checkDayOfTheWeek(DayOfTheWeek.Saturday) + "\" sun=\""
                + checkDayOfTheWeek(DayOfTheWeek.Sunday) + "\" />" + "</options>";
    }
    
    /**
     * Get an iterator over the list of days of the week, positioned for the second occurrence in
     * the pattern.
     * 
     * @param startDayOfWeek index of the
     * @param dayList list of days of the week in the pattern, without special cases
     * @return an iterator over the list of days of the week, positioned for the second occurrence
     *         in the pattern
     * @throws ReservationException if the dayIndex represents a day not in the list of days
     */
    private ListIterator<DayOfTheWeek> createIteratorForSecondOccurrence(final int startDayOfWeek,
            final List<DayOfTheWeek> dayList) throws ReservationException {
        // set the day of week iterator to the correct position for the second day
        final ListIterator<DayOfTheWeek> dayOfWeekIterator = dayList.listIterator();
        boolean foundDayOfWeek = false;
        while (!foundDayOfWeek && dayOfWeekIterator.hasNext()) {
            if (dayOfWeekIterator.next().getIntValue() == startDayOfWeek) {
                foundDayOfWeek = true;
            }
        }
        if (!foundDayOfWeek) {
            // @ translatable
            throw new ReservationException(
                "Recurrence pattern start date is not on a day in the weekly pattern",
                WeeklyPattern.class);
        }
        return dayOfWeekIterator;
    }
    
    /**
     * Get the days of the week that are part of the recurrence pattern. Convert specials such as
     * 'any week day' to a list that contains only real week days.
     * 
     * @return the list of days of the week in the pattern, without specials
     */
    private List<DayOfTheWeek> getDaysOfTheWeekWithoutSpecials() {
        final List<DayOfTheWeek> dayList = getDaysOfTheWeek();
        // Check for three special cases. If any of those is present,
        // the rest is removed!
        if (dayList.contains(DayOfTheWeek.Day)) {
            dayList.clear();
            // add every day to the list
            dayList.add(DayOfTheWeek.Monday);
            dayList.add(DayOfTheWeek.Tuesday);
            dayList.add(DayOfTheWeek.Wednesday);
            dayList.add(DayOfTheWeek.Thursday);
            dayList.add(DayOfTheWeek.Friday);
            dayList.add(DayOfTheWeek.Saturday);
            dayList.add(DayOfTheWeek.Sunday);
        } else if (dayList.contains(DayOfTheWeek.Weekday)) {
            dayList.clear();
            
            // add every weekday to the list
            dayList.add(DayOfTheWeek.Monday);
            dayList.add(DayOfTheWeek.Tuesday);
            dayList.add(DayOfTheWeek.Wednesday);
            dayList.add(DayOfTheWeek.Thursday);
            dayList.add(DayOfTheWeek.Friday);
        } else if (dayList.contains(DayOfTheWeek.WeekendDay)) {
            dayList.clear();
            
            // add every weekend day to the list separately
            dayList.add(DayOfTheWeek.Saturday);
            dayList.add(DayOfTheWeek.Sunday);
        }
        return dayList;
    }
    
}
