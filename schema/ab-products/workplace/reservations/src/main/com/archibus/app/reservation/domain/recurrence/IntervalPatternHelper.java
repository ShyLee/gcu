package com.archibus.app.reservation.domain.recurrence;

import java.util.Calendar;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Utility class providing calendar manipulation methods. Used as helper for interval patterns.
 * 
 * @author Yorik Gerlo
 */
public final class IntervalPatternHelper {
    /** days is a week. */
    private static final int DAYS_IN_WEEK = 7;
    
    /** last week day. */
    private static final int LAST_WEEKDAY = 5;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private IntervalPatternHelper() {
    }
    
    /**
     * Move the calendar to a day of the month, specified via day number or via week number plus day
     * of the week.
     * 
     * @param cal the calendar to move
     * @param dayOfTheWeek day(s) of the week in the pattern
     * @param weekOfMonth week of the month in the pattern
     * @param dayOfMonth explicit numbered day of the month in the pattern
     * @throws ReservationException when the recurrence pattern is invalid
     */
    public static void toDayOfMonth(final Calendar cal, final DayOfTheWeek dayOfTheWeek,
            final Integer weekOfMonth, final Integer dayOfMonth) throws ReservationException {
        if (dayOfMonth == null) {
            if (weekOfMonth == null) {
                // @translatable
                throw new ReservationException(
                    "Invalid recurrence pattern: neither the day of the month nor the day of the week are set",
                    IntervalPatternHelper.class);
            } else {
                // the weekOfMonth system is totally different in .NET
                toDayOfTheWeekInstance(cal, dayOfTheWeek, weekOfMonth);
            }
        } else {
            // verify the actual maximum (especially for February 29!)
            final int actualMax = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
            if (actualMax < dayOfMonth) {
                cal.set(Calendar.DAY_OF_MONTH, actualMax);
            } else {
                cal.set(Calendar.DAY_OF_MONTH, dayOfMonth);
            }
        }
    }
    
    /**
     * Move the calendar within its current month to the correct instance of the weekday.
     * 
     * @param cal the calendar to move
     * @param dayOfTheWeek the day of the week to set
     * @param instance which occurrence of the weekday to set (1 for the first... up to 4 for the
     *            fourth, but 5 for the last)
     */
    public static void toDayOfTheWeekInstance(final Calendar cal, final DayOfTheWeek dayOfTheWeek,
            final int instance) {
        // initialize to first day of the month
        cal.set(Calendar.DATE, 1);
        
        // Call getTime() to make sure the Calendar finalizes the date change before
        // setting the day of the week. Without getTime(), the above call is ignored.
        // This seems to be a bug in the Calendar implementation...
        // DO NOT REMOVE
        cal.getTime();
        
        // Handle the special cases separately.
        if (instance == LAST_WEEKDAY) {
            toLastDayOfTheWeekInstance(cal, dayOfTheWeek);
        } else {
            toNumberedDayOfTheWeekInstance(cal, dayOfTheWeek, instance);
        }
    }
    
    /**
     * Move the calendar to the last instance of a week day.
     * 
     * @param cal the calendar to move
     * @param dayOfTheWeek the day of the week to set
     */
    private static void toLastDayOfTheWeekInstance(final Calendar cal,
            final DayOfTheWeek dayOfTheWeek) {
        switch (dayOfTheWeek) {
            case Day:
                // the last day of the month
                cal.set(Calendar.DATE, cal.getActualMaximum(Calendar.DATE));
                break;
            case Weekday:
                // the last weekday of the month
                cal.set(Calendar.DATE, cal.getActualMaximum(Calendar.DATE));
                while (isWeekendDay(cal)) {
                    cal.add(Calendar.DATE, -1);
                }
                break;
            case WeekendDay:
                // the last weekend day of the month
                cal.set(Calendar.DATE, cal.getActualMaximum(Calendar.DATE));
                while (!isWeekendDay(cal)) {
                    cal.add(Calendar.DATE, -1);
                }
                break;
            default:
                toSpecificDayOfTheWeek(cal, dayOfTheWeek, LAST_WEEKDAY);
                break;
        }
    }
    
    /**
     * Move the calendar within its current month to the correct numbered instance of the weekday.
     * 
     * @param cal the calendar to move
     * @param dayOfTheWeek the day of the week to set
     * @param instance which occurrence of the weekday to set (1 for the first... up to 4 for the
     *            fourth)
     */
    private static void toNumberedDayOfTheWeekInstance(final Calendar cal,
            final DayOfTheWeek dayOfTheWeek, final int instance) {
        switch (dayOfTheWeek) {
            case Day:
                // simple: the <instance>'th day of the month
                // where instance in {1,2,3,4}
                cal.set(Calendar.DATE, instance);
                break;
            case Weekday:
                // the <instance>'th weekday of the month
                toNthWeekDayInstance(cal, instance);
                break;
            case WeekendDay:
                // the <instance>'th weekend day of the month
                toNthWeekendDayInstance(cal, instance);
                break;
            default:
                toSpecificDayOfTheWeek(cal, dayOfTheWeek, instance);
                break;
        }
    }
    
    /**
     * Move the calendar to the <instance>'th weekday of the month.
     * 
     * @param cal the calendar to move
     * @param instance numbered instance of the weekday to move to
     */
    private static void toNthWeekDayInstance(final Calendar cal, final int instance) {
        int index = 1;
        while (index < instance || isWeekendDay(cal)) {
            if (!isWeekendDay(cal)) {
                // only count weekdays
                ++index;
            }
            cal.add(Calendar.DATE, 1);
        }
    }
    
    /**
     * Move the calendar to the <instance>'th weekend day of the month.
     * 
     * @param cal the calendar to move
     * @param instance numbered instance of the weekend day to move to
     */
    private static void toNthWeekendDayInstance(final Calendar cal, final int instance) {
        int index = 1;
        while (index < instance || !isWeekendDay(cal)) {
            if (isWeekendDay(cal)) {
                ++index;
            }
            cal.add(Calendar.DATE, 1);
        }
    }
    
    /**
     * Move the calendar to a specific day of the week (i.e. no special cases such as any weekend
     * day or any week day).
     * 
     * @param cal the calendar to move
     * @param dayOfTheWeek the day of the week to set
     * @param instance which occurrence of the weekday to set (1 for the first... up to 4 for the
     *            fourth, but 5 for the last)
     */
    private static void toSpecificDayOfTheWeek(final Calendar cal, final DayOfTheWeek dayOfTheWeek,
            final int instance) {
        // get the month
        final int month = cal.get(Calendar.MONTH);
        // an actual day of the week is specified
        cal.set(Calendar.DAY_OF_WEEK, dayOfTheWeek.getIntValue());
        
        // By setting the day of the week, we might have ended up in the previous month.
        // Correct this if that is the case.
        if (cal.get(Calendar.MONTH) != month) {
            cal.add(Calendar.DATE, DAYS_IN_WEEK);
        }
        
        // we are now at the first instance: add weeks until we reach the correct instance
        cal.add(Calendar.DATE, DAYS_IN_WEEK * (instance - 1));
        
        /*
         * If we passed into the next month, go back one week. This happens only if weekOfMonth is
         * set to 5 (meaning the last instance), while there are only four instances of that day in
         * the month.
         */
        if (cal.get(Calendar.MONTH) != month) {
            cal.add(Calendar.DATE, -DAYS_IN_WEEK);
        }
    }
    
    /**
     * Checks the date to be weekend day.
     * 
     * @param cal calendar date to check
     * 
     * @return true or false
     */
    private static boolean isWeekendDay(final Calendar cal) {
        return cal.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY
                || cal.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY;
    }
    
}
