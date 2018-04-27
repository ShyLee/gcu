package com.archibus.app.common.recurring;

import java.util.*;

/**
 * Helper class for RecurringSchedulePattern.
 * 
 * @author Zhang Yi
 * 
 * @since 20.2 for refactoring
 */
public final class RecurringScheduleHelper {
    
    /**
     * Default weekly pattern value.
     */
    private static final String DEFAULT_WEEKLY_VALUE = "0,0,0,0,0,0,0";
    
    /**
     * Constant: NUMBER 5.
     */
    private static final int FIVE = 5;
    
    /**
     * Constant: NUMBER 4.
     */
    private static final int FOUR = 4;
    
    /**
     * Constant: NUMBER 10.
     */
    private static final int TEN = 10;
    
    /**
     * Constant: NUMBER 3.
     */
    private static final int THREE = 3;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     * 
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private RecurringScheduleHelper() throws InstantiationException {
        throw new InstantiationException("Never instantiate " + this.getClass().getName()
                + "; use static methods!");
    }
    
    /**
     * Calculate the end date of a Recurring Schedule Rule Pattern Object.
     * 
     * @param rule Recurring Schedule Rule Pattern Object
     * 
     */
    public static void calculateDateEnd(final RecurringSchedulePattern rule) {
        
        Date end = rule.getDateEnd();
        if ("year".equals(rule.getRecurringType())) {
            
            // for yearly recurrence , if date end is null or after 10 years of date start, set date
            // start + 10 years as end date
            if (rule.getDateEnd() == null
                    || RecurringScheduleHelper.checkAfterNumberOfYears(rule.getDateEnd(),
                        rule.getDateStart(), TEN)) {
                
                final Calendar start = Calendar.getInstance();
                start.setTime(rule.getDateStart());
                start.add(Calendar.YEAR, TEN);
                end = start.getTime();
                
            }
            
        } else {
            
            // for the other type recurrence , if date end is null or after 5 years of date start,
            // set date start + 5 years as end date
            if (rule.getDateEnd() == null
                    
                    || RecurringScheduleHelper.checkAfterNumberOfYears(rule.getDateEnd(),
                        rule.getDateStart(), FIVE)) {
                
                final Calendar start = Calendar.getInstance();
                start.setTime(rule.getDateStart());
                start.add(Calendar.YEAR, FIVE);
                end = start.getTime();
            }
        }
        
        rule.setDateEnd(end);
    }
    
    /**
     * Calculate String format of value1 of Recurring Schedule Rule Pattern object.
     * 
     * 
     * @param rule Recurring Schedule Rule Pattern Object
     * @param calendar Calendar object set to start date
     * 
     */
    public static void calculateValue1OfWeekly(final RecurringSchedulePattern rule,
            final Calendar calendar) {
        
        String value = "";
        
        if (DEFAULT_WEEKLY_VALUE.equals(rule.getValue1())) {
            
            final int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
            
            switch (dayOfWeek) {
                case Calendar.MONDAY:
                    value = "1,0,0,0,0,0,0";
                    break;
                case Calendar.TUESDAY:
                    value = "0,1,0,0,0,0,0";
                    break;
                case Calendar.WEDNESDAY:
                    value = "0,0,1,0,0,0,0";
                    break;
                case Calendar.THURSDAY:
                    value = "0,0,0,1,0,0,0";
                    break;
                case Calendar.FRIDAY:
                    value = "0,0,0,0,1,0,0";
                    break;
                case Calendar.SATURDAY:
                    value = "0,0,0,0,0,1,0";
                    break;
                case Calendar.SUNDAY:
                    value = "0,0,0,0,0,0,1";
                    break;
                default:
                    value = DEFAULT_WEEKLY_VALUE;
            }
            rule.setValue1(value);
        }
    }
    
    /**
     * Check if to date is after given number of year of from date.
     * 
     * @param dateFrom date from
     * @param dateTo date to
     * @param number number of years for checking date to
     * 
     * @return true or false
     */
    public static boolean checkAfterNumberOfYears(final Date dateTo, final Date dateFrom,
            final int number) {
        boolean isAfter = false;
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(dateFrom);
        calendar.add(Calendar.YEAR, number);
        if (dateTo.after(calendar.getTime())) {
            isAfter = true;
        }
        return isAfter;
    }
    
    /**
     * Determine if date of calendar in processing is after end date and return a boolean sign. If
     * no also add processing date value to dates list.
     * 
     * @param date date for comparing
     * @param dateEnd end date for comparing
     * @param dateStart start date for comparing
     * @param datesList date list
     * 
     * @return boolean sign indicates if date of calendar in processing is after end date.
     */
    public static boolean compareDates(final Date date, final Date dateEnd, final Date dateStart,
            final List<Date> datesList) {
        boolean isAfterEndDate = false;
        if (date.after(dateEnd)) {
            isAfterEndDate = true;
        } else if (!date.before(dateStart)) {
            datesList.add(date);
        }
        return isAfterEndDate;
    }
    
    /**
     * @return calendar set to initial start date.
     * 
     * @param dateStart given start date
     */
    public static Calendar getInitialStartCalendar(final Date dateStart) {
        
        final Calendar calendar = Calendar.getInstance();
        // initial calendar value with start date
        calendar.setTime(dateStart);
        // when set date start, need to clear other time fields
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        
        return calendar;
    }
    
    /**
     * get next interval date.
     * 
     * @param date base date
     * @param intevalType inteval type
     * @param diff difference value
     * @return next interval date
     */
    public static Date getNextInterval(final Date date, final int intevalType, final int diff) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(intevalType, diff);
        return calendar.getTime();
    }
    
    /**
     * move calendar to week index.
     * 
     * @param calendar calendar
     * @param dayDiff dayDiff
     * @param monthIndex monthIndex
     * @param yearIndex yearIndex
     * @param weekIndex weekIndex
     */
    public static void moveCalendarToWeekIndex(final Calendar calendar, final int dayDiff,
            final int monthIndex, final int yearIndex, final String weekIndex) {
        
        if (RecurringSchedulePattern.SECOND.equals(weekIndex)) {
            
            // get 2nd date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff);
            
        } else if (RecurringSchedulePattern.THIRD.equals(weekIndex)) {
            
            // get 3rd date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff);
            
        } else if (RecurringSchedulePattern.FORTH.equals(weekIndex)) {
            
            // get 4th date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff + dayDiff);
            
        } else if (RecurringSchedulePattern.LAST.equals(weekIndex)) {
            
            // get last date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff + dayDiff + dayDiff);
            
            if (calendar.get(Calendar.YEAR) > yearIndex
                    || (calendar.get(Calendar.YEAR) == yearIndex && calendar.get(Calendar.MONTH) > monthIndex)) {
                calendar.add(Calendar.DATE, -dayDiff);
            }
        }
    }
    
    /**
     * move given calendar toward until to next Weekendday.
     * 
     * @param calendar given calendar
     * @param sequence sequence string of wanted weekday "1st"/"2nd"/"3rd"/"4th"
     * @param isWeekDay indicates move to next week day or weekend day of given sequence number
     * 
     */
    public static void moveCalenderToNextSequenceDayOfWeek(final Calendar calendar,
            final String sequence, final boolean isWeekDay) {
        
        int seq = 0;
        if (RecurringSchedulePattern.FIRST.equals(sequence)) {
            seq = 1;
            
        } else if (RecurringSchedulePattern.SECOND.equals(sequence)) {
            
            // get 2nd date of parameter 'week'
            seq = 2;
            
        } else if (RecurringSchedulePattern.THIRD.equals(sequence)) {
            
            // get 3rd date of parameter 'week'
            seq = THREE;
            
        } else if (RecurringSchedulePattern.FORTH.equals(sequence)) {
            
            // get 4th date of parameter 'week'
            seq = FOUR;
            
        }
        
        if (isWeekDay) {
            
            moveCalenderToNextWeekDay(calendar, seq);
            
        } else {
            
            moveCalenderToNextWeekendDay(calendar, seq);
        }
        
    }
    
    /**
     * move given calendar toward until to next given order weekday .
     * 
     * @param calendar given calendar
     * @param number sequence number of wanted weekday 0/1/2/3
     */
    public static void moveCalenderToNextWeekDay(final Calendar calendar, final int number) {
        
        while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, 1);
        }
        
        int count = 1;
        while (count < number) {
            
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            
            while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                    || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
            }
            count++;
        }
        
    }
    
    /**
     * move given calendar toward until to next Weekendday.
     * 
     * @param calendar given calendar
     * @param number sequence number of wanted weekday 0/1/2/3
     * 
     */
    public static void moveCalenderToNextWeekendDay(final Calendar calendar, final int number) {
        
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, 1);
        }
        
        int count = 1;
        while (count < number) {
            
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            count++;
            
            while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                    && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
            }
            
        }
        
    }
    
    /**
     * move given calendar back until to previous weekday.
     * 
     * @param calendar given calendar
     */
    public static void moveCalenderToPreviousWeekDay(final Calendar calendar) {
        while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
    }
    
    /**
     * move given calendar back until to previous Weekendday.
     * 
     * @param calendar given calendar
     */
    public static void moveCalenderToPreviousWeekendDay(final Calendar calendar) {
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
    }
    
}
