package com.archibus.eventhandler.energy;

import java.text.*;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * TimePeriodUtil - This class handles all calculations related
 * to time_period, index and Dates
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class TimePeriodUtilService {
    
    /**
     * getDateRange Returns a date range by converting the startPeriod param which is in time_period format
     * (yyyy-mm) into a Date obj and subtracting the amount of months provided by size param.
     * 
     * @param startPeriod
     * @param range
     * @return the date range
     */
    public static List<Date> getDateRange(String startTimePeriod, Integer size) {

        String[] timePeriodFlds = { "time_period", "period_index", "name" };
        DataSource timePeriodDS = DataSourceFactory.createDataSourceForFields("energy_time_period",timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "time_period",startTimePeriod));
        DataRecord timePeriodRecord = timePeriodDS.getRecord();

        Integer start_index = Integer.parseInt(timePeriodRecord.getValue("energy_time_period.period_index").toString());
        Integer end_index = start_index - size;

        timePeriodDS.clearRestrictions();
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "period_index", end_index));
        timePeriodRecord = timePeriodDS.getRecord();
        String endDate = timePeriodRecord.getValue("energy_time_period.time_period").toString();

        Date date_start = new Date();
        Date date_end = new Date();
        ArrayList<Date> dateRange = new ArrayList<Date>();
        try {
            date_start = convertTimePeriodToDate(startTimePeriod);
            date_end = convertTimePeriodToDate(endDate);
            dateRange.add(date_start);
            dateRange.add(date_end);
        } catch (ParseException e) {
            throw new ExceptionBase("end_date or start_date have invalid values for indices :"+ start_index + " and " + end_index);
        }
        return dateRange;
    }

    /**
     * convertTimePeriodToDate Returns the date corresponding to
     * the time_period provided.
     * 
     * @param startPeriod
     * @return calculated date
     */
    public static Date convertTimePeriodToDate(String timePeriod) throws ParseException {
        SimpleDateFormat dateFormat;
        Date date;

        if (timePeriod == null) {
            throw new ParseException("Null time period string", 0);
        }
        dateFormat = new SimpleDateFormat("yyyy-MM");
        try {
            date = dateFormat.parse(timePeriod);
        } catch (ParseException e) {
            throw new ExceptionBase("Time Period Provided was invalid: " + timePeriod);
        }

        return date;
    }

    /**
     * convertDatePeriodToTimePeriod Returns the time_period corresponding to
     * the Date provided.
     * 
     * @param date
     * @return calculated time period
     */    
    public static String convertDatePeriodToTimePeriod(String date) throws ParseException {
        String timePeriod = date.substring(0, 6);
        return timePeriod;
    }
    
    /**
     * getPeriodIndexNow Returns the index for the time_period associated
     * with the current day
     * 
     * @return current time period
     */ 
    public static Integer getPeriodIndexNow() {
        Calendar cal = Calendar.getInstance();
        Integer month = cal.get(Calendar.MONTH) + 1;
        String sMonth = null;
        if (month < 10) {
            sMonth = "0" + month.toString();
        } else {
            sMonth = month.toString();
        }
        int year = cal.get(Calendar.YEAR);
        String currentTimePeriod = year + "-" + sMonth;
        String[] timePeriodFlds = { "time_period", "period_index", "name" };
        DataSource timePeriodDS = DataSourceFactory.createDataSourceForFields("energy_time_period",timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "time_period",currentTimePeriod));
        DataRecord timePeriodRecord = timePeriodDS.getRecord();
        Integer index = Integer.parseInt(timePeriodRecord.getValue("energy_time_period.period_index").toString());
        return index;

    }

    /**
     * convertIndexToTimePeriod Returns the time_period for the index provided
     * 
     * @param index
     * @return calculated time period
     */ 
    public static String convertIndexToTimePeriod(Integer index) {
        if(index == 0){
            index = 1;
        }
        String[] timePeriodFlds = { "time_period", "period_index", "name" };
        DataSource timePeriodDS = DataSourceFactory.createDataSourceForFields("energy_time_period",timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions.eq("energy_time_period", "period_index", index));
        DataRecord timePeriodRecord = timePeriodDS.getRecord();
        String timePeriod = timePeriodRecord.getValue("energy_time_period.time_period").toString();
        return timePeriod;

    }

    /**
     * convertTimePeriodToIndex Returns the index for the time_period provided
     * 
     * @param timePeriod
     * @return calculated index
     */ 
    public static Integer convertTimePeriodToIndex(String timePeriod) {
        String[] timePeriodFlds = { "time_period", "period_index", "name" };
        DataSource timePeriodDS = DataSourceFactory.createDataSourceForFields("energy_time_period",
            timePeriodFlds);
        timePeriodDS.addRestriction(Restrictions
            .eq("energy_time_period", "time_period", timePeriod));
        DataRecord timePeriodRecord = timePeriodDS.getRecord();
        Integer index = Integer.parseInt(timePeriodRecord.getValue(
            "energy_time_period.period_index").toString());
        return index;

    }
}
