package com.archibus.app.reservation.domain.recurrence;

import java.util.Calendar;

/**
 * Specifies the day of the week. For the standard days of the week (Sunday, Monday...) the
 * DayOfTheWeek enum value is the same as the System.DayOfWeek enum type. These values can be safely
 * cast between the two enum types. The special days of the week (Day, Weekday and WeekendDay) are
 * used for monthly and yearly recurrences and cannot be cast to System.DayOfWeek values.
 */
public enum DayOfTheWeek {
    
    // Any day of the week
    /** The Day. */
    Day(),

    // Friday
    /** The Friday. */
    Friday(Calendar.FRIDAY),

    // Monday
    /** The Monday. */
    Monday(Calendar.MONDAY),

    // Saturday
    /** The Saturday. */
    Saturday(Calendar.SATURDAY),

    // Sunday
    /** The Sunday. */
    Sunday(Calendar.SUNDAY),

    // Thursday
    /** The Thursday. */
    Thursday(Calendar.THURSDAY),

    // Tuesday
    /** The Tuesday. */
    Tuesday(Calendar.TUESDAY),

    // Wednesday
    /** The Wednesday. */
    Wednesday(Calendar.WEDNESDAY),

    // Any day of the usual business week (Monday-Friday)
    /** The Weekday. */
    Weekday(),

    // Any weekend day (Saturday or Sunday)
    /** The Weekend day. */
    WeekendDay;
    
    /** The day of week. */
    private int dayOfWeek;
    
    /**
     * Instantiates a new day of the week.
     */
    DayOfTheWeek() {
        // default constructor, instantiates a new day of the week
    }
    
    /**
     * Instantiates a new day of the week.
     * 
     * @param dayOfWeek the day of week
     */
    DayOfTheWeek(final int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
    
    /**
     * Get the integer value as defined in System.
     * 
     * @return the value
     */
    public int getIntValue() {
        return this.dayOfWeek;
    }
    
}
