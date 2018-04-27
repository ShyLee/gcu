package com.archibus.service;

import java.text.MessageFormat;
import java.util.*;

import com.archibus.utility.*;

/**
 * Describes a date period used in calculations.
 * <p>
 * Supported period types:
 * <li>Month
 * <li>Quarter
 * <li>Year
 * <li>Custom period (N days)
 * <p>
 * DatePeriod objects are immutable - their properties cannot be changed after construction.
 */
public class Period implements Immutable {
    
    /**
     * Interface that Period clients can implement to iterate through the date range.
     */
    public static interface Callback {
        /**
         * Called for each date within the period, starting at dateStart and ending at dateEnd.
         * 
         * @param currentDate
         * @return true to continue, false to stop the iteration.
         */
        public boolean call(Date currentDate);
    }
    
    /**
     * Constant: interval type.
     */
    public static final String CUSTOM = "CUSTOM";
    
    /**
     * Constant: interval type.
     */
    public static final String DATE_RANGE = "DATE_RANGE";
    
    /**
     * number of milliseconds per day; used to calculate days number from date range
     */
    public static final int MILISECS_PER_DAY = 1000 * 60 * 60 * 24;
    
    /**
     * Constant: interval type.
     */
    public static final String MONTH = "MONTH";
    
    /**
     * Constant: interval type.
     */
    public static final String QUARTER = "QUARTER";
    
    /**
     * Constant: interval type.
     */
    public static final String WEEK = "week";
    
    /**
     * Constant: interval type.
     */
    public static final String YEAR = "YEAR";
    
    /**
     * End date of the period (inclusive).
     */
    private final Date dateEnd;
    
    /**
     * Start date of the period.
     */
    private final Date dateStart;
    
    /**
     * Interval (in intervalType units).
     */
    private final int interval;
    
    /**
     * Interval number - number of intervals that are added.
     */
    private int intervalNo;
    
    /**
     * Interval type: month, quarter, year, custom (in days) , or date range.
     */
    private final String intervalType;
    
    /**
     * Constructor, can be used for non-custom periods.
     * 
     * @param period
     * @param dateStart
     */
    public Period(final String period, final Date dateStart) {
        this(period, 1, dateStart);
    }
    
    /**
     * Constructor that is used for date_range periods.
     * 
     * @param period - period type "DATE_RANGE"
     * @param dateStart - range start date
     * @param dateEnd - range end date
     */
    public Period(final String period, final Date dateStart, final Date dateEnd) {
        this(period, (int) ((dateEnd.getTime() - dateStart.getTime()) / MILISECS_PER_DAY),
            dateStart);
    }
    
    /**
     * Constructor, can be used for custom and non-custom periods.
     * 
     * @param intervalType
     * @param interval
     * @param dateStart
     */
    public Period(final String intervalType, final int interval, final Date dateStart) {
        // 0 in database is used for all interval types except CUSTOM
        // in calculations it means "use one period, e.g. WEEK, MONTH, QUARTER, or YEAR"
        this.interval = interval > 0 ? interval : 1;
        this.dateStart = dateStart;
        this.intervalNo = 1;
        
        if (intervalType.equals("d")) {
            this.intervalType = CUSTOM;
        } else if (intervalType.equals("ww")) {
            this.intervalType = WEEK;
        } else if (intervalType.equals("m")) {
            this.intervalType = MONTH;
        } else if (intervalType.equals("q")) {
            this.intervalType = QUARTER;
        } else if (intervalType.equals("yyyy")) {
            this.intervalType = YEAR;
        } else {
            this.intervalType = intervalType;
        }
        
        // determine end date
        final Calendar c = Calendar.getInstance();
        c.setTime(dateStart);
        addPeriodToCalendar(c);
        c.add(Calendar.DAY_OF_YEAR, -1);
        // reset interval number
        this.intervalNo = 1;
        this.dateEnd = c.getTime();
    }
    
    /**
     * Increments the start date by specified interval, until it is greater or equal to target date.
     * 
     * @param dateStart
     * @param dateTarget
     * @param intervalType
     * @param interval
     * @return
     */
    public static Date getDateAfter(final Date dateStart, final Date dateTarget,
            final String intervalType, final int interval) {
        final Period p = new Period(intervalType, interval, dateStart);
        
        final Calendar c = Calendar.getInstance();
        c.setTime(p.getDateStart());
        
        while (!(c.getTime().after(dateTarget))) {
            p.addPeriodToCalendar(c);
        }
        
        return c.getTime();
    }
    
    /**
     * Increments the start date by specified interval.
     * 
     * @param dateStart
     * @param intervalType
     * @param interval
     * @return
     */
    public static Date incrementDate(final Date dateStart, final String intervalType,
            final int interval) {
        final Period p = new Period(intervalType, interval, dateStart);
        
        final Calendar c = Calendar.getInstance();
        c.setTime(p.getDateStart());
        p.addPeriodToCalendar(c);
        return c.getTime();
    }
    
    /**
     * Adds one period (month, quarter, year, or custom number of days) to specified calendar. This
     * method does not change the DatePeriod object itself.
     * 
     * @param c Calendar
     */
    public void addPeriodToCalendar(final Calendar c) {
        if (this.intervalType.equals(Period.WEEK)) {
            c.add(Calendar.WEEK_OF_YEAR, this.interval * this.intervalNo);
        } else if (this.intervalType.equals(Period.MONTH)) {
            c.add(Calendar.MONTH, this.interval * this.intervalNo);
        } else if (this.intervalType.equals(Period.QUARTER)) {
            c.add(Calendar.MONTH, this.interval * 3 * this.intervalNo);
        } else if (this.intervalType.equals(Period.YEAR)) {
            c.add(Calendar.YEAR, this.interval * this.intervalNo);
        } else if (this.intervalType.equals(Period.CUSTOM)) {
            c.add(Calendar.DAY_OF_YEAR, this.interval * this.intervalNo);
        } else if (this.intervalType.equals(Period.DATE_RANGE)) {
            c.add(Calendar.DAY_OF_YEAR, this.interval * this.intervalNo);
        }
        this.intervalNo++;
    }
    
    /**
     * Adds one period (month, quarter, year, or custom number of days) to specified date and
     * returns the result. This method does not change the DatePeriod object itself.
     * 
     * @param date
     * @return
     */
    public Date addPeriodToDate(final Date date) {
        final Calendar c = Calendar.getInstance();
        c.setTime(date);
        this.intervalNo = 1;
        addPeriodToCalendar(c);
        return c.getTime();
    }
    
    /**
     * Checks whether this period contains specified date.
     * 
     * @param date
     * @return
     */
    public boolean containsDate(final Date date) {
        return (!this.dateStart.after(date) && !this.dateEnd.before(date));
    }
    
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    public Date getDateStart() {
        return this.dateStart;
    }
    
    public String getPeriod() {
        return this.intervalType;
    }
    
    public int getPeriodCustom() {
        return this.interval;
    }
    
    /**
     * Iterates through the date range.
     * 
     * @param callback
     */
    public void iterate(final Date dateFrom, final Date dateTo, final Callback callback) {
        final Calendar c = Calendar.getInstance();
        c.setTime(getDateStart());
        
        // increment date, starting from dateStart, until it is on or after dateFrom
        while (c.getTime().before(dateFrom)) {
            c.setTime(getDateStart());
            addPeriodToCalendar(c);
        }
        
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        
        // while date is not after dateTo, increment date and call the callback on each increment
        while (!c.getTime().after(dateTo)) {
            
            if (!callback.call(c.getTime())) {
                break;
            }
            c.setTime(getDateStart());
            addPeriodToCalendar(c);
        }
    }
    
    /**
     * Return correction factor if asset period is interval fraction.
     * 
     * @param dateFrom asset start date
     * @param dateTo asset end date
     * @param interval interval type
     * @return correction factor
     */
    public double getCorrectionFactor(final Date dateFrom, final Date dateTo, final String interval) {
        final int periodLength = getMonthsBetween(this.dateStart, this.dateEnd);
        Date start = this.dateStart;
        if (StringUtil.notNullOrEmpty(dateFrom) && dateFrom.after(this.dateStart)) {
            start = dateFrom;
        }
        Date end = this.dateEnd;
        if (StringUtil.notNullOrEmpty(dateTo) && this.dateEnd.after(dateTo)) {
            end = dateTo;
            if (QUARTER.equals(interval) || YEAR.equals(interval)) {
            }
        }
        final int intervalLength = getMonthsBetween(start, end);
        double result = 1;
        if (periodLength > 0 && intervalLength > 0) {
            result =
                    Integer.valueOf(intervalLength).doubleValue()
                            / Integer.valueOf(periodLength).doubleValue();
        }
        
        return result;
    }
    
    @Override
    public String toString() {
        return MessageFormat.format("[{0, date} - {1, date}]", new Object[] { this.dateStart,
                this.dateEnd });
    }
    
    /**
     * Get months between two dates.
     * 
     * @param dateStart start date
     * @param dateEnd end date
     * @return int
     */
    public static int getMonthsBetween(final Date dateStart, final Date dateEnd) {
        int result = 0;
        Date tmpDate = dateStart;
        while (!tmpDate.after(dateEnd)) {
            result++;
            tmpDate = incrementDate(dateStart, MONTH, result);
        }
        return result;
    }
    
}
