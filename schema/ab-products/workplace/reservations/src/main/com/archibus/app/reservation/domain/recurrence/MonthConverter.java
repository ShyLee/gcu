package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import microsoft.exchange.webservices.data.Month;

/**
 * Utility class. Provides methods to convert between month representations.
 * <p>
 * 
 * Used by YearlyPattern to convert from the month representation used in the recurrence pattern to
 * the month representation in java.util.Calendar.
 * 
 * @author Yorik Gerlo
 * @since 20.1
 */
public final class MonthConverter {
    
    /** Maps the months. */
    private final Map<Month, Integer> monthMapping = new HashMap<Month, Integer>();
    
    /**
     * Instantiate a month converter.
     */
    public MonthConverter() {
        this.monthMapping.put(Month.January, Calendar.JANUARY);
        this.monthMapping.put(Month.February, Calendar.FEBRUARY);
        this.monthMapping.put(Month.March, Calendar.MARCH);
        this.monthMapping.put(Month.April, Calendar.APRIL);
        this.monthMapping.put(Month.May, Calendar.MAY);
        this.monthMapping.put(Month.June, Calendar.JUNE);
        this.monthMapping.put(Month.July, Calendar.JULY);
        this.monthMapping.put(Month.August, Calendar.AUGUST);
        this.monthMapping.put(Month.September, Calendar.SEPTEMBER);
        this.monthMapping.put(Month.October, Calendar.OCTOBER);
        this.monthMapping.put(Month.November, Calendar.NOVEMBER);
        this.monthMapping.put(Month.December, Calendar.DECEMBER);
    }
    
    /**
     * Convert a month to it's value according to java.util.Calendar.
     * 
     * @param month the month to convert
     * 
     * @return the value according to java.util.Calendar
     */
    public int convertMonth(final Month month) {
        final Integer result = this.monthMapping.get(month);
        if (result == null) {
            // @ translatable
            throw new IllegalArgumentException("Unknown month: " + month);
        }
        return result;
    }
    
}
