package com.archibus.eventhandler.hoteling;

import java.io.StringReader;
import java.util.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;

import com.archibus.utility.DateTime;

/**
 * Service class for Hoteling recurring rule.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingRecurringService {
    
    /**
     * Constant: week array.
     */
    private static final String[] WEEK_ARRAY = { "mon", "tue", "wed", "thu", "fri", "sat", "sun" };
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingRecurringService() {
    }
    
    /**
     * get date list.
     * 
     * @param dateStart date start
     * @param dateEnd date end
     * @param rucurringRule recurring rule
     * @return date list
     */
    public static List<Date> getDateList(final Date dateStart, final Date dateEnd,
            final String rucurringRule) {
        final List<Date> datesList = new ArrayList<Date>();
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(dateStart);
        if ("".equals(rucurringRule)) {
            while (!calendar.getTime().after(dateEnd)) {
                datesList.add(calendar.getTime());
                calendar.add(Calendar.DAY_OF_YEAR, 1);
            }
        } else {
            while (!calendar.getTime().after(dateEnd)) {
                if (isDateMatchRecurringRule(rucurringRule, dateStart, calendar.getTime())) {
                    datesList.add(calendar.getTime());
                }
                calendar.add(Calendar.DAY_OF_YEAR, 1);
            }
        }
        
        return datesList;
    }
    
    /**
     * To decide whether the testDate match the recurring rule from dateStart.
     * 
     * @param recurringRule recurring rule
     * @param dateStartInput recurring rule date_start
     * @param testDate test date
     * @return true or false
     */
    private static boolean isDateMatchRecurringRule(final String recurringRule,
            final Date dateStartInput, final Date testDate) {
        boolean isMatch = false;
        final Date dateStart = dateStartInput;
        // if testDate is before the startDate, not matched
        if (!dateStart.after(testDate)) {
            try {
                // parse the xml format recurring rule
                final Document recordXmlDoc = new SAXReader().read(new StringReader(recurringRule));
                final Element rootElement = recordXmlDoc.getRootElement();
                final String recurringType = rootElement.attributeValue("type");
                final String value1 = rootElement.attributeValue("value1");
                final String value2 = rootElement.attributeValue("value2");
                
                // if the recurring type is 'day', add days by interval(define in value1) until
                // equals or after the test date
                // if equals, matched, else not matched
                if ("day".equals(recurringType)) {
                    isMatch = testDayMatch(testDate, dateStart, value1);
                } else if ("week".equals(recurringType)) {
                    // if the recurring type is 'week',check whether the test day in the week is
                    // selected (define in value1 like '0,1,1,0,0,0,0', 0--unselected, 1--selected )
                    isMatch = testWeekMatch(testDate, value1);
                } else if ("month".equals(recurringType)) {
                    // if the recurring type is 'month' get the right date of test month by
                    // recurring
                    // rule
                    // (value1:'1st','2nd','3rd','4th','last' value2:'mon', 'tue'....)
                    isMatch = testMonthMatch(testDate, dateStart, value1, value2);
                }
            } catch (final DocumentException e) {
                isMatch = false;
            }
        }
        
        return isMatch;
    }
    
    /**
     * test match "day" rule.
     * 
     * @param testDate the test date
     * @param dateStartInput date start
     * @param xmlRuleValue1 xml rule value1
     * @return true or false
     */
    private static boolean testDayMatch(final Date testDate, final Date dateStartInput,
            final String xmlRuleValue1) {
        
        boolean isMatch = false;
        final int interval = Integer.parseInt(xmlRuleValue1);
        
        if (DateTime.getElapsedDays(testDate, dateStartInput) % interval == 0) {
            isMatch = true;
        }
        
        return isMatch;
    }
    
    /**
     * test match "week" rule.
     * 
     * @param testDate the test date
     * @param xmlRuleValue1 xml rule value1
     * @return true or false
     */
    private static boolean testWeekMatch(final Date testDate, final String xmlRuleValue1) {
        boolean isMatch = false;
        
        final int dayOfWeek = getDayOfWeek(testDate);
        final String[] tempArray = xmlRuleValue1.split(",");
        if ("1".equals(tempArray[dayOfWeek])) {
            isMatch = true;
        }
        return isMatch;
    }
    
    /**
     * test match "month" rule.
     * 
     * @param testDate the test date
     * @param dateStart date start
     * @param xmlRuleValue1 xml rule value1
     * @param xmlRuleValue2 xml rule value2
     * @return true or false
     */
    private static boolean testMonthMatch(final Date testDate, final Date dateStart,
            final String xmlRuleValue1, final String xmlRuleValue2) {
        
        boolean isMatch = false;
        
        final int dayOfWeek = getDayOfWeek(testDate);
        if (WEEK_ARRAY[dayOfWeek].equals(xmlRuleValue2)) {
            final Date targetDate =
                    getMatchDateInMonth(dateStart, testDate, 1, xmlRuleValue1, xmlRuleValue2);
            if (targetDate != null && DateTime.sameDay(targetDate, testDate)) {
                isMatch = true;
            }
        }
        return isMatch;
    }
    
    /**
     * get which day in the week: 0--mon, 1--tue, 2--wed, 3--thu,4--fri,5--sat,6--sun).
     * 
     * @param date which day to test
     * @return the day number in the week
     */
    private static int getDayOfWeek(final Date date) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        dayOfWeek -= 2;
        if (dayOfWeek < 0) {
            dayOfWeek += HotelingConstants.NUMBER_7;
        }
        return dayOfWeek;
    }
    
    /**
     * Get the date in the test month(month of testDate) that match the recurring rule
     * type:"month","bimonth","trimonth".
     * 
     * @param dateStart recurring rule --date_star
     * @param testDate testDate's month is test month
     * @param monDiff month:1, bimonth:2,trimonth:3
     * @param weekIndex '1st' || '2nd' || '3rd' || '4th' || 'last'
     * @param week "mon" || "tue" || "wed" || "thu" || "fri" || "sat" || "sun"
     * @return the matched day in month
     */
    private static Date getMatchDateInMonth(final Date dateStart, final Date testDate,
            final int monDiff, final String weekIndex, final String week) {
        Date targetDate = null;
        final Calendar calendar = Calendar.getInstance();
        
        calendar.setTime(dateStart);
        final int startMonthIndex = calendar.get(Calendar.MONTH);
        
        calendar.setTime(testDate);
        final int testMonthIndex = calendar.get(Calendar.MONTH);
        final int testYearIndex = calendar.get(Calendar.YEAR);
        
        final boolean isMonthMathced = (testMonthIndex - startMonthIndex) % monDiff == 0;
        if (isMonthMathced) {
            calendar.set(Calendar.DATE, 1);
            // get which day in the week of the first day of month
            final int weekDayMonthOne = getDayOfWeek(calendar.getTime());
            int index = 0;
            while (index < HotelingConstants.NUMBER_7) {
                if (WEEK_ARRAY[index].equals(week)) {
                    break;
                } else {
                    index++;
                }
            }
            
            int addDays = index - weekDayMonthOne;
            if (addDays < 0) {
                addDays += HotelingConstants.NUMBER_7;
            }
            
            // get 1st date of parameter 'week'
            calendar.add(Calendar.DATE, addDays);
            
            targetDate = selectDayByWeekIndex(weekIndex, calendar, testYearIndex, testMonthIndex);
        }
        
        return targetDate;
    }
    
    /**
     * select day by week index.
     * 
     * @param weekIndex week index
     * @param calendar calendar
     * @param testYearIndex year index
     * @param testMonthIndex month index
     * @return the matched date
     */
    private static Date selectDayByWeekIndex(final String weekIndex, final Calendar calendar,
            final int testYearIndex, final int testMonthIndex) {
        
        Date targetDate = null;
        
        final Date daymonth1st = calendar.getTime();
        
        // get 2nd date of parameter 'week'
        calendar.add(Calendar.DATE, HotelingConstants.NUMBER_7);
        final Date daymonth2nd = calendar.getTime();
        
        // get 3rd date of parameter 'week'
        calendar.add(Calendar.DATE, HotelingConstants.NUMBER_7);
        final Date daymonth3rd = calendar.getTime();
        
        // get 4th date of parameter 'week'
        calendar.add(Calendar.DATE, HotelingConstants.NUMBER_7);
        final Date daymonth4th = calendar.getTime();
        
        // get last date of parameter 'week'
        calendar.add(Calendar.DATE, HotelingConstants.NUMBER_7);
        Date daymonthlast = calendar.getTime();
        
        // Guo Jiangtao changed 2009-12-15 to fix KB3025150
        if (calendar.get(Calendar.YEAR) > testYearIndex
                || (calendar.get(Calendar.YEAR) == testYearIndex && calendar.get(Calendar.MONTH) > testMonthIndex)) {
            daymonthlast = daymonth4th;
        }
        
        if ("1st".equals(weekIndex)) {
            targetDate = daymonth1st;
        } else if ("2nd".equals(weekIndex)) {
            targetDate = daymonth2nd;
        } else if ("3rd".equals(weekIndex)) {
            targetDate = daymonth3rd;
        } else if ("4th".equals(weekIndex)) {
            targetDate = daymonth4th;
        } else if ("last".equals(weekIndex)) {
            targetDate = daymonthlast;
        }
        return targetDate;
    }
    
}
