package com.archibus.app.common.recurring;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * RecurringServicePattern Object class.
 * 
 * @author Zhang Yi
 * 
 * @since 20.2
 */
public class RecurringSchedulePattern {
    
    /**
     * Constant: first.
     */
    public static final String FIRST = "1st";
    
    /**
     * Constant: forth.
     */
    public static final String FORTH = "4th";
    
    /**
     * Constant: last.
     */
    public static final String LAST = "last";
    
    /**
     * Arrays of Month values used in pattern.
     */
    public static final String[] MONTH_VALUE_ARRAY = new String[] { "jan", "feb", "mar", "apr",
            "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" };
    
    /**
     * Constant: second.
     */
    public static final String SECOND = "2nd";
    
    /**
     * Constant: third.
     */
    public static final String THIRD = "3rd";
    
    /**
     * Constant: recurring type "day".
     */
    public static final String TYPE_DAY = "day";
    
    /**
     * Constant: recurring type "month".
     */
    public static final String TYPE_MONTH = "month";
    
    /**
     * Constant: recurring type "once".
     */
    public static final String TYPE_ONCE = "once";
    
    /**
     * Constant: recurring type "week".
     */
    public static final String TYPE_WEEK = "week";
    
    /**
     * Constant: recurring type "year".
     */
    public static final String TYPE_YEAR = "year";
    
    /**
     * Arrays of Month values used in pattern.
     */
    public static final String[] WEEK_VALUE_ARRAY = new String[] { "sun", "mon", "tue", "wed",
            "thu", "fri", "sat" };
    
    /**
     * End date to calculate date list.
     */
    private Date dateEnd;
    
    /**
     * Initial dates list.
     */
    private List<Date> datesList = new ArrayList<Date>();
    
    /**
     * Start date to calculate date list.
     */
    private Date dateStart;
    
    /**
     * Recurring Pattern interval.
     */
    private int interval = -1;
    
    /**
     * Recurring rule type.
     */
    private String recurringType = "";
    
    /**
     * Recurring rule total Occurs.
     */
    private int total = Integer.MAX_VALUE;
    
    /**
     * Recurring rule value 1.
     */
    private String value1 = "";
    
    /**
     * Recurring rule value 2.
     */
    private String value2 = "";
    
    /**
     * Recurring rule value 3.
     */
    private String value3 = "";
    
    /**
     * Constructor: initial dateStart and dateEnd.
     * 
     * @param dateStart the start date
     * @param dateEnd the end date
     */
    public RecurringSchedulePattern(final Date dateStart, final Date dateEnd) {
        super();
        
        // set values of start date and end date
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        
        // if date start is null , set today as default
        if (dateStart == null) {
            this.dateStart = new Date();
        }
    }
    
    /**
     * Get date list base on the recurring type of the rule.
     * 
     */
    public void calculateDatesList() {
        
        final Calendar calendar = RecurringScheduleHelper.getInitialStartCalendar(this.dateStart);
        
        // KB3034635 if there empty value in xml pattern, get value from data start
        this.checkPatternForEmptyValue(calendar);
        
        if (TYPE_ONCE.equals(this.recurringType) && !this.dateStart.after(this.dateEnd)) {
            
            // just add date start to the list for type 'once' if date start<=date end
            this.datesList.add(this.dateStart);
            
        } else if (TYPE_DAY.equals(this.recurringType)) {
            
            this.interval = Integer.parseInt(this.value1);
            while (!calendar.getTime().after(this.dateEnd)) {
                this.datesList.add(calendar.getTime());
                // get next day to test
                calendar.add(Calendar.DAY_OF_YEAR, this.interval);
            }
            
        } else if (TYPE_WEEK.equals(this.recurringType)) {
            
            this.interval = Integer.parseInt(this.value2);
            this.calculateDateListByWeek(calendar);
            
        } else if (TYPE_MONTH.equals(this.recurringType)) {
            
            this.interval = Integer.parseInt(this.value3);
            if ("".equals(this.value2)) {
                
                calculateDateListByMonthDay(calendar);
                
            } else {
                
                calculateDateListByMonthWeekIndex(calendar);
            }
            
        } else if (TYPE_YEAR.equals(this.recurringType)) {
            
            this.interval = Integer.parseInt(this.value3);
            this.calculateDateListByYear(calendar);
            
        }
        
    }
    
    /**
     * Getter for the dateEnd property.
     * 
     * @see dateEnd
     * @return the dateEnd property.
     */
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    /**
     * Getter for the datesList property.
     * 
     * @see datesList
     * @return the datesList property.
     */
    public List<Date> getDatesList() {
        
        // sort the date ascending
        Collections.sort(this.datesList);
        
        // get sublist if the list exceed the total occurs
        List<Date> result;
        if (this.datesList.size() > this.total) {
            result = this.datesList.subList(0, this.total);
        } else {
            result = this.datesList;
        }
        
        return result;
    }
    
    /**
     * Getter for the dateStart property.
     * 
     * @see dateStart
     * @return the dateStart property.
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * Getter for the interval property.
     * 
     * @see interval
     * @return the interval property.
     */
    public int getInterval() {
        return this.interval;
    }
    
    /**
     * Getter for the recurringType property.
     * 
     * @see recurringType
     * @return the recurringType property.
     */
    public String getRecurringType() {
        return this.recurringType;
    }
    
    /**
     * Getter for the total property.
     * 
     * @see total
     * @return the total property.
     */
    public int getTotal() {
        return this.total;
    }
    
    /**
     * Getter for the value1 property.
     * 
     * @see value1
     * @return the value1 property.
     */
    public String getValue1() {
        return this.value1;
    }
    
    /**
     * Getter for the value2 property.
     * 
     * @see value2
     * @return the value2 property.
     */
    public String getValue2() {
        return this.value2;
    }
    
    /**
     * Getter for the value3 property.
     * 
     * @see value3
     * @return the value3 property.
     */
    public String getValue3() {
        return this.value3;
    }
    
    /**
     * Setter for the dateEnd property.
     * 
     * @see dateEnd
     * @param dateEnd the dateEnd to set
     */
    
    public void setDateEnd(final Date dateEnd) {
        this.dateEnd = dateEnd;
    }
    
    /**
     * Setter for the datesList property.
     * 
     * @see datesList
     * @param datesList the datesList to set
     */
    
    public void setDatesList(final List<Date> datesList) {
        this.datesList = datesList;
    }
    
    /**
     * Setter for the dateStart property.
     * 
     * @see dateStart
     * @param dateStart the dateStart to set
     */
    
    public void setDateStart(final Date dateStart) {
        this.dateStart = dateStart;
    }
    
    /**
     * Setter for the interval property.
     * 
     * @see interval
     * @param interval the interval to set
     */
    
    public void setInterval(final int interval) {
        this.interval = interval;
    }
    
    /**
     * Setter for the recurringType property.
     * 
     * @see recurringType
     * @param recurringType the recurringType to set
     */
    
    public void setRecurringType(final String recurringType) {
        this.recurringType = recurringType;
    }
    
    /**
     * Setter for the total property.
     * 
     * @see total
     * @param total the total to set
     */
    
    public void setTotal(final int total) {
        this.total = total;
    }
    
    /**
     * Setter for the value1 property.
     * 
     * @see value1
     * @param value1 the value1 to set
     */
    
    public void setValue1(final String value1) {
        this.value1 = value1;
    }
    
    /**
     * Setter for the value2 property.
     * 
     * @see value2
     * @param value2 the value2 to set
     */
    
    public void setValue2(final String value2) {
        this.value2 = value2;
    }
    
    /**
     * Setter for the value3 property.
     * 
     * @see value3
     * @param value3 the value3 to set
     */
    
    public void setValue3(final String value3) {
        this.value3 = value3;
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "".
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthDay(final Calendar calendar) {
        
        final int dayOfMonth = Integer.parseInt(this.value1);
        calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
        
        Date date = calendar.getTime();
        if (date.before(this.dateStart)) {
            date = RecurringScheduleHelper.getNextInterval(date, Calendar.MONTH, this.interval);
        }
        
        while (!date.after(this.dateEnd)) {
            this.datesList.add(date);
            date = RecurringScheduleHelper.getNextInterval(date, Calendar.MONTH, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "day" and value1 is
     * from 1st|2nd|3rd|4th|last.
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthDayIndex(final Calendar calendar) {
        
        boolean isAfterEndDate = false;
        while (!isAfterEndDate) {
            
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            final String weekIndex = this.value1;
            
            if (SECOND.equals(weekIndex)) {
                
                // get 2nd date of parameter 'week'
                calendar.add(Calendar.DATE, 1);
                
            } else if (THIRD.equals(weekIndex)) {
                
                // get 3rd date of parameter 'week'
                calendar.add(Calendar.DATE, 2);
                
            } else if (FORTH.equals(weekIndex)) {
                
                // get 4th date of parameter 'week'
                calendar.add(Calendar.DATE, 2 + 1);
                
            } else if (LAST.equals(weekIndex)) {
                
                // get last date of parameter 'week'
                calendar.add(Calendar.MONTH, 1);
                calendar.add(Calendar.DAY_OF_YEAR, -1);
            }
            
            isAfterEndDate =
                    RecurringScheduleHelper.compareDates(calendar.getTime(), this.dateEnd,
                        this.dateStart, this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is from
     * mon|tue|wed|thu|fri|sat|sun and value1 is from 1st|2nd|3rd|4th|last.
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthSpecificDayIndex(final Calendar calendar) {
        
        final Map<String, Integer> weekMap = new HashMap<String, Integer>();
        for (int i = 0; i < WEEK_VALUE_ARRAY.length; i++) {
            weekMap.put(WEEK_VALUE_ARRAY[i], i + 1);
            
        }
        
        final int dayDiff = Integer.parseInt("7");
        boolean isAfterEndDate = false;
        while (!isAfterEndDate) {
            
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            final int monthIndex = calendar.get(Calendar.MONTH);
            final int yearIndex = calendar.get(Calendar.YEAR);
            
            calendar.set(Calendar.DAY_OF_WEEK, weekMap.get(this.value2));
            if (calendar.get(Calendar.MONTH) != monthIndex) {
                calendar.add(Calendar.DATE, dayDiff);
            }
            
            final String weekIndex = this.value1;
            
            RecurringScheduleHelper.moveCalendarToWeekIndex(calendar, dayDiff, monthIndex,
                yearIndex, weekIndex);
            
            isAfterEndDate =
                    RecurringScheduleHelper.compareDates(calendar.getTime(), this.dateEnd,
                        this.dateStart, this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "weekday" or
     * "weekendday" and value1 is from 1st|2nd|3rd|4th|last.
     * 
     * @param calendar Calendar object set to start date
     * @param isWeekend indicate if for calculating of specified weekend day index
     */
    private void calculateDateListByMonthWeekDayIndex(final Calendar calendar,
            final boolean isWeekend) {
        
        boolean isAfterEndDate = false;
        while (!isAfterEndDate) {
            
            final String weekIndex = this.value1;
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            
            if (LAST.equals(weekIndex)) {
                // get last date of parameter 'week'
                calendar.add(Calendar.MONTH, 1);
                calendar.add(Calendar.DAY_OF_YEAR, -1);
                
                if (isWeekend) {
                    RecurringScheduleHelper.moveCalenderToPreviousWeekendDay(calendar);
                    
                } else {
                    RecurringScheduleHelper.moveCalenderToPreviousWeekDay(calendar);
                }
                
            } else {
                
                RecurringScheduleHelper.moveCalenderToNextSequenceDayOfWeek(calendar, weekIndex,
                    false);
            }
            
            isAfterEndDate =
                    RecurringScheduleHelper.compareDates(calendar.getTime(), this.dateEnd,
                        this.dateStart, this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
        
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is not "" and value1 is
     * from 1st|2nd|3rd|4th|last.
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthWeekIndex(final Calendar calendar) {
        
        if (TYPE_DAY.equals(this.value2)) {
            
            calculateDateListByMonthDayIndex(calendar);
            
        } else if ("weekday".equals(this.value2)) {
            
            calculateDateListByMonthWeekDayIndex(calendar, false);
            
        } else if ("weekendday".equals(this.value2)) {
            
            calculateDateListByMonthWeekDayIndex(calendar, true);
            
        } else {
            
            calculateDateListByMonthSpecificDayIndex(calendar);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is week.
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByWeek(final Calendar calendar) {
        
        final String[] matchArray = this.value1.split(",");
        
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        
        for (final String element : matchArray) {
            
            if ("1".equals(element)) {
                
                Date date = calendar.getTime();
                
                if (date.before(this.dateStart)) {
                    date =
                            RecurringScheduleHelper.getNextInterval(date, Calendar.WEEK_OF_YEAR,
                                this.interval);
                }
                
                while (!date.after(this.dateEnd)) {
                    this.datesList.add(date);
                    date =
                            RecurringScheduleHelper.getNextInterval(date, Calendar.WEEK_OF_YEAR,
                                this.interval);
                }
            }
            
            calendar.add(Calendar.DAY_OF_YEAR, 1);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is year.
     * 
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByYear(final Calendar calendar) {
        
        final int day = Integer.parseInt(this.value1);
        final String month = this.value2;
        
        final Map<String, Integer> monthMap = new HashMap<String, Integer>();
        for (int i = 0; i < MONTH_VALUE_ARRAY.length; i++) {
            monthMap.put(MONTH_VALUE_ARRAY[i], i);
            
        }
        
        calendar.set(Calendar.MONTH, monthMap.get(month));
        calendar.set(Calendar.DAY_OF_MONTH, day);
        
        Date date = calendar.getTime();
        
        if (date.before(this.dateStart)) {
            date = RecurringScheduleHelper.getNextInterval(date, Calendar.YEAR, this.interval);
        }
        
        while (!date.after(this.dateEnd)) {
            this.datesList.add(date);
            date = RecurringScheduleHelper.getNextInterval(date, Calendar.YEAR, this.interval);
        }
    }
    
    /**
     * Check pattern value if there exists empty value , get value from date start.
     * 
     * @param calendar Calendar object set to start date
     */
    private void checkPatternForEmptyValue(final Calendar calendar) {
        
        if (TYPE_WEEK.equals(this.getRecurringType())) {
            
            RecurringScheduleHelper.calculateValue1OfWeekly(this, calendar);
            
        } else if (TYPE_MONTH.equals(this.getRecurringType())) {
            
            if (!StringUtil.notNullOrEmpty(this.getValue1())
                    && !StringUtil.notNullOrEmpty(this.getValue2())) {
                
                this.setValue1(String.valueOf(calendar.get(Calendar.DAY_OF_MONTH)));
            }
            
        } else if (TYPE_YEAR.equals(this.getRecurringType())
                && (StringUtil.isNullOrEmpty(this.getValue1()) || StringUtil.isNullOrEmpty(this
                    .getValue2()))) {
            
            this.setValue1(String.valueOf(calendar.get(Calendar.DAY_OF_MONTH)));
            
            this.setValue2(MONTH_VALUE_ARRAY[calendar.get(Calendar.MONTH)]);
            
        }
    }
    
}