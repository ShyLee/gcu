package com.archibus.eventhandler.reservations;

import java.io.*;
import java.sql.Time;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.TimeZone;
import java.util.TreeMap;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.StringUtil;

public class ReservationsEventHandlerBase extends EventHandlerBase {

    protected static Logger Classlog = Logger.getLogger(ReservationsEventHandlerBase.class);

    static final String ACTIVITY_ID = "AbWorkplaceReservations";

    /**
     * Put all messages of mail in a treemap
     * 
     * @param context
     * @param Std : it can be "By" or "For" only
     * @param locale : locale of user
     * @return TreeMap with messages
     */
    public TreeMap getMailMessages(EventHandlerContext context, String Std, String locale) {
        TreeMap messages = new TreeMap();
        int maxSubject = 4;
        int maxBody = 13;
        Std = Std.toUpperCase();
        for (int i = 1; i <= maxSubject; i++) {
            messages.put("SUBJECT" + i, localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED"
                    + Std + "_WFR", "NOTIFYREQUESTED" + Std + "_SUBJECT_PART" + i, locale));
        }
        for (int i = 1; i <= maxBody; i++) {
            messages.put("BODY" + i, localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std
                    + "_WFR", "NOTIFYREQUESTED" + Std + "_BODY_PART" + i, locale));
        }

        messages.put("BODY11_2", localizeMessage(context, ACTIVITY_ID, "NOTIFYREQUESTED" + Std
                + "_WFR", "NOTIFYREQUESTED" + Std + "_BODY_PART11_2", locale));

        return messages;
    }

    /**
     * create a attachment cite for a mail
     * 
     * @param parametersValues configuration parameters
     * @return String with route of created file.
     */
    public String createAttachments(EventHandlerContext context, TreeMap parametersValues) {

        String result = "";
        String errMessage = localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                            "SENDEMAILINVITATIONSERROR", null);
        final String RULE_ID = "createAttachments";

        try {

            Date curDateTime;
            SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyyMMdd");
            SimpleDateFormat timeFormatter = new SimpleDateFormat("HHmmss");
            String line = "";
            
            //kb#3034925: change encoding of ics file from default ansi to utf-8
            /*File file = new File((String) parametersValues.get("path"), (String) parametersValues
                    .get("filename"));
            BufferedWriter out = new BufferedWriter(new FileWriter(file));*/
            String outfilename = (String) (parametersValues.get("path") + (String) parametersValues.get("filename"));
            FileOutputStream file = new FileOutputStream(outfilename);
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(file, "UTF-8"));

            line = "BEGIN:VCALENDAR";
            out.write(line);
            out.newLine();

            line = "PRODID:-//hacksw/handcal//NONSGML v1.0//EN";
            out.write(line);
            out.newLine();

            line = "VERSION:2.0";
            out.write(line);
            out.newLine();

            line = "METHOD:" + (String) parametersValues.get("method");
            out.write(line);
            out.newLine();

            line = "BEGIN:VEVENT";
            out.write(line);
            out.newLine();

            line = (String) parametersValues.get("attendeesSection");
            out.write(line);
            out.newLine();

            line = "ORGANIZER:MAILTO:" + (String) parametersValues.get("mailTo");
            out.write(line);
            out.newLine();

            line = "DTSTART:" + (String) parametersValues.get("dateStart") + "T"
                    + (String) parametersValues.get("timeStart") + "Z";
            out.write(line);
            out.newLine();

            line = "DTEND:" + (String) parametersValues.get("dateEnd") + "T"
                    + (String) parametersValues.get("timeEnd") + "Z";
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("rruleFreq")) {
                line = "RRULE:FREQ=" + (String) parametersValues.get("rruleFreq");
                line += ";UNTIL=" + (String) parametersValues.get("rruleUntil");
                line += ";INTERVAL=" + (String) parametersValues.get("rruleInternal");
                if (parametersValues.containsKey("rruleBySetPos")) {
                    line += ";BYSETPOS=" + (String) parametersValues.get("rruleBySetPos");
                }
                if (parametersValues.containsKey("rruleByDay")) {
                    line += ";BYDAY=" + (String) parametersValues.get("rruleByDay");
                }
                line += ";WKST=" + (String) parametersValues.get("WKST");
                out.write(line);
                out.newLine();
            }
            if (parametersValues.containsKey("exDate")) {
                line = "EXDATE:" + (String) parametersValues.get("exDate");
                out.write(line);
                out.newLine();
            }

            if (parametersValues.containsKey("sequence")) {
                line = "SEQUENCE:" + (String) parametersValues.get("sequence");
                out.write(line);
                out.newLine();
            }
            line = "UID:" + (String) parametersValues.get("uid");
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("recurrence-id")) {
                line = "RECURRENCE-ID:" + (String) parametersValues.get("recurrence-id");
                out.write(line);
                out.newLine();
            }
            line = "LOCATION:" + (String) parametersValues.get("location");
            out.write(line);
            out.newLine();

            curDateTime = new Date();
            long time = curDateTime.getTime();
            int minutesoffset = curDateTime.getTimezoneOffset();
            DecimalFormat timeZoneFormatter = new DecimalFormat("00");
            String TimeZone = (minutesoffset / 60) < 0 ? "+"
                    + timeZoneFormatter.format(-minutesoffset / 60) : timeZoneFormatter
                    .format(-minutesoffset / 60);
            int absOffset = (minutesoffset > 0 ? minutesoffset : -minutesoffset);
            TimeZone += (absOffset % 60) > 0 ? ":" + timeZoneFormatter.format(absOffset % 60) : "";
            time += minutesoffset * 60 * 1000;
            curDateTime.setTime(time);
            line = "DTSTAMP:" + dateFormatter.format(curDateTime) + "T"
                    + timeFormatter.format(curDateTime);
            out.write(line);
            out.newLine();

            line = "SUMMARY:" + (String) parametersValues.get("summary");
            out.write(line);
            out.newLine();

            line = "DESCRIPTION:" + (String) parametersValues.get("description");
            out.write(line);
            out.newLine();

            line = "CLASS:PUBLIC";
            out.write(line);
            out.newLine();

            line = "END:VEVENT";
            out.write(line);
            out.newLine();

            line = "END:VCALENDAR";
            out.write(line);
            out.newLine();

            //kb#3034925: change encoding of ics file from default ansi to utf-8
            out.flush();
            
            out.close();

            //result = file.getAbsolutePath();
            result = outfilename;

        } catch (Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed creating attachments "
                    + e.getMessage(), errMessage, e);
            // log.info(ACTIVITY_ID+"-createAttachments: "+e);
        }

        return result;

    }

    /**
     * Put all mesages of mail for send mail in a treemap
     * 
     * @param context
     * @param locale : locale of user
     * @return TreeMap with messages
     */
    public TreeMap getSendMailMessages(EventHandlerContext context, String locale) {
        TreeMap messages = new TreeMap();
        int maxSubject = 4;
        int maxBody = 8;
        for (int i = 1; i <= maxSubject; i++) {
            messages.put("SUBJECT" + i, localizeMessage(context, ACTIVITY_ID,
                                                        "SENDEMAILINVITATIONS_WFR",
                                                        "SENDEMAILINVITATIONS_SUBJECT_PART" + i,
                                                        locale));
        }
        for (int i = 1; i <= maxBody; i++) {
            messages.put("BODY" + i, localizeMessage(context, ACTIVITY_ID,
                                                     "SENDEMAILINVITATIONS_WFR",
                                                     "SENDEMAILINVITATIONS_BODY_PART" + i, locale));
        }

        messages.put("BODY1_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                                "SENDEMAILINVITATIONS_BODY_PART1_2", locale));
        messages.put("BODY1_3", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                                "SENDEMAILINVITATIONS_BODY_PART1_3", locale));
        messages.put("BODY2_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                                "SENDEMAILINVITATIONS_BODY_PART2_2", locale));
        messages.put("BODY2_3", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                                "SENDEMAILINVITATIONS_BODY_PART2_3", locale));
        messages.put("BODY6_2", localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                                "SENDEMAILINVITATIONS_BODY_PART6_2", locale));

        return messages;
    }

    /**
     * This function will log the error and throw a new Exception with the desired description
     * 
     * @param context
     * @param logMessage
     * @param exceptionMessage
     * @param originalException
     * @return void
     */
    protected static void handleError(EventHandlerContext context, String logMessage,
            String exceptionMessage, Throwable originalException) {
        context.addResponseParameter("message", exceptionMessage);
        throw new ExceptionBase(null, exceptionMessage, originalException);
    }
    
    
    /**
     * This function will store the error of Email Notification to context with the desired description
     * 
     * @param context
     * @param logMessage
     * @param exceptionMessage
     * @param originalException
     * @param address
     * @return void
     */
    protected static void handleNotificationError(EventHandlerContext context, String logMessage,
            String exceptionMessage, Throwable originalException, String address) {                        
        String errorMessage;
        if(StringUtil.notNullOrEmpty(address)) {
            errorMessage = address+": "+exceptionMessage;
        } else {
            
            errorMessage = exceptionMessage;
        }

        context.addResponseParameter("message", errorMessage);
    }
    
    /**
     * return a value from Map. If this value not exist, return empty
     * 
     * @param record
     * @param name
     * @return String
     */
    protected static String getString(Map record, String name) {
        String s = (String) record.get(name);
        if (s == null) {
            s = "";
        }
        return s;
    }

    /**
     * Parses XML string and returns a list of child elements for specified XPath.
     * 
     * @param xml
     * @param xpath
     * @return
     */
    protected static List selectXmlNodes(String xml, String xpath) {
        try {
            Document document = DocumentHelper.parseText(xml);
            return document.selectNodes(xpath);
        } catch (Throwable e) {
            return new ArrayList();
        }
    }

    /**
     * return subtract hour1 to hour2 in minutes with ISO format "HH:MI:SS"
     * 
     * @param String hour1
     * @param String hour2
     * @return int
     */
    protected static int subtractMinutes(EventHandlerContext context, String hour1, String hour2) {
        int subtract = 0;
        String errMessage = localizeMessage(context, ACTIVITY_ID, "ADDROOMRESERVATION_WFR",
                                            "SUBTRACTTIMESERROR", null);
        try {
            StringTokenizer tokenHour1 = new StringTokenizer(hour1);
            int minutes1 = Integer.parseInt(tokenHour1.nextToken(":")) * 60;
            minutes1 += Integer.parseInt(tokenHour1.nextToken(":"));
            StringTokenizer tokenHour2 = new StringTokenizer(hour2);
            int minutes2 = Integer.parseInt(tokenHour2.nextToken(":")) * 60;
            minutes2 += Integer.parseInt(tokenHour2.nextToken(":"));
            subtract = minutes1 - minutes2;
        } catch (Throwable e) {
            handleError(context, ACTIVITY_ID + "- subtractMinutes error:" + e.getMessage(),
                        errMessage, e);
        }
        return subtract;
    }

    /**
     * return subtract hour1 to hour2 in hour with ISO format "HH:MI:SS"
     * 
     * @param String hour1
     * @param String hour2
     * @return int
     */
    protected static int subtractHours(EventHandlerContext context, String hour1, String hour2) {
        int hours = 0;
        int minutes = ReservationsEventHandlerBase.subtractMinutes(context, hour1, hour2);
        String errMessage = localizeMessage(context, ACTIVITY_ID, "ADDROOMRESERVATION_WFR",
                                            "SUBTRACTTIMESERROR", null);
        try {
            hours = Integer.parseInt(String.valueOf(Math.round((minutes) / 60.0)));
        } catch (Throwable e) {
            handleError(context, ACTIVITY_ID + "- subtractHours error:" + e.getMessage(),
                        errMessage, e);
        }
        return hours;
    }

    /**
     * @param timelineStartHour
     * @param minorSegments
     * @param timeOfDay
     * @return
     */
    protected static int getTimeColumn(int timelineStartHour, int minorSegments, Time timeOfDay,
            int MaxTimemarksColumn) {
        int resStartHour = timeOfDay.getHours();
        int resStartMin = timeOfDay.getMinutes();

        // Calculate column to nearest hour
        int columnAvailableFrom = (resStartHour - timelineStartHour) * minorSegments;

        // Add additional segments for minutes
        columnAvailableFrom += (int) Math.ceil(resStartMin * minorSegments / 60);

        // if the resource is availabe after the timeline end time, assume column
        // MaxTimemarksColumn-1
        if (columnAvailableFrom >= MaxTimemarksColumn) {
            columnAvailableFrom = MaxTimemarksColumn;
        }
        // if the resource is availabe before the timeline start time, assume column 0
        // negative column values are not allowed
        if (columnAvailableFrom < 0) {
            columnAvailableFrom = 0;
        }
        return columnAvailableFrom;
    }

    /**
     * Retrieves a room arrangement pre- or post-block value
     * 
     * @param activityId
     * @param paramName
     * @return
     */
    protected static int getRmArrangeBlockTimeslots(EventHandlerContext context, String blId,
            String flId, String rmId, String configId, String typeId, String paramName,
            int minorSegments) {

        Integer val = getIntegerValue(context, selectDbValue(context, "rm_arrange", paramName,
                                                             "bl_id = " + literal(context, blId)
                                                                     + " " + "AND fl_id = "
                                                                     + literal(context, flId) + " "
                                                                     + "AND rm_id = "
                                                                     + literal(context, rmId) + " "
                                                                     + "AND config_id = "
                                                                     + literal(context, configId)
                                                                     + " "
                                                                     + "AND rm_arrange_type_id = "
                                                                     + literal(context, typeId)
                                                                     + " "));

        if (val == null) {
            return 0;
        }
        // KB 3018952, for preBlock less than 1, make it equal to 1. Modified by ZY, 2008-08-05.
        double temp = val.doubleValue() * minorSegments / 60;
        return (int) Math.ceil(temp);
    }

    /**
     * createTimemarks Loads and returns to the UI the timemarks;
     * 
     * @param context
     * @param timeline
     * @param timelineStartHour test
     * @param timelineEndHour
     * @param minorSegments
     */
    protected static void retrieveTimemarks(EventHandlerContext context, JSONObject timeline,
            int timelineStartHour, int timelineEndHour, int minorSegments) {

        // generate major and minor timemarks and timeslots
        JSONArray timemarks = new JSONArray();

        int column = 0;
        for (int hour = timelineStartHour; hour < timelineEndHour; hour++) {
            Time t = new Time(hour, 0, 0);
            String dateTimeStart = t.toString();
            String dateTimeLabel = EventHandlerBase.formatFieldValue(context, t, "java.sql.Time",
                                                                     "aTime", true);

            JSONObject timemark = new JSONObject();
            timemark.put("column", column++);
            timemark.put("dateTimeStart", dateTimeStart);
            timemark.put("dateTimeLabel", dateTimeLabel);
            timemark.put("type", "major");
            timemarks.put(timemark);

            // Create minor timemarks for the intervals for all but the last hour
            if (hour < timelineEndHour) {
                for (int segment = 1; segment < minorSegments; segment++) {
                    int minutes = segment * (60 / minorSegments);
                    Time tMinor = new Time(hour, minutes, 0);
                    String minorTimeLabel = EventHandlerBase.formatFieldValue(context, tMinor,
                                                                              "java.sql.Time",
                                                                              "aTime", true);

                    JSONObject minorTimemark = new JSONObject();
                    minorTimemark.put("column", column++);
                    minorTimemark.put("dateTimeStart", tMinor.toString());
                    minorTimemark.put("dateTimeLabel", minorTimeLabel);
                    minorTimemark.put("type", "minor");
                    timemarks.put(minorTimemark);
                }
            }
        }
        timeline.put("timemarks", timemarks);
        timeline.put("dateTimeEnd", new Time(timelineEndHour, 0, 0).toString());

        // Classlog.info(ACTIVITY_ID+"-retrieveTimemarks: "+timemarks.toString());
        // Classlog.info(ACTIVITY_ID+"-retrieveTimemarks: dateTimeEnd"+new Time(timelineEndHour, 0,
        // 0).toString());
    }

    /**
     * Retrieves a timeline start or end hour from the afm_activity_params table
     * 
     * @param activityId
     * @param paramId
     * @return
     */
    protected static Integer getTimelineHourParam(EventHandlerContext context, String activityId,
            String paramId) {
        Integer val = null;
        String strTimelineHour = getActivityParameterString(context, activityId, paramId);
        
        //kb#3028185:support timeline end hours to be 24 
        if(paramId.equalsIgnoreCase("TimelineEndTime") && strTimelineHour.startsWith("24")){
            val = new Integer(24);
            return val;
        }
        
        // activityparameter error message
        String errMessage = localizeMessage(context, ACTIVITY_ID, "LOADTIMELINE_WFR",
                                            "INVALIDPARAMETERERROR", null);
        if (StringUtil.notNullOrEmpty(strTimelineHour)) {
            // First see if it's an integer
            try {
                val = new Integer(strTimelineHour);
            } catch (NumberFormatException ne) {
                // Not an int, see if it's a valid Time value
                try {
                    SimpleDateFormat format = new SimpleDateFormat("HH:mm.ss.SSS");
                    java.util.Date dateValue = format.parse(strTimelineHour);
                    val = new Integer(dateValue.getHours());
                } catch (Throwable e) {
                    // Invalid format - log error
                    // Classlog.error(errMessage+paramId);
                    context.addResponseParameter("message", errMessage + paramId);
                }
            }
        }
        return val;
    }

    /**
     * Changing HH:MM PM and am format into HH:MM:SS format
     * 
     * @param date
     * @return String
     */
    protected static String transformDate(String date) {
        String result = date;
        if (date.toUpperCase().indexOf("AM") > -1 || date.toUpperCase().indexOf("PM") > -1) {

            String hour = date.substring(0, date.indexOf(":"));
            String minute = date.substring(date.indexOf(":") + 1, date.indexOf(" "));
            if (date.indexOf("AM") > -1) {
                hour = (hour.equals("12") ? "00" : hour);
            }
            if (date.indexOf("PM") > -1) {
                hour = (hour.equals("12") ? hour : String.valueOf(Integer.parseInt(hour) + 12));
            }
            result = hour + ":" + minute + ":00";
        }
        return result;
    }

    /*
     * This function transform a String into a Time, with the correct format @param t @return Time
     */
    protected static Time getTimeFromString(String t) {
        String[] l1 = t.split(":");
        int h1 = new Integer(l1[0].toString()).intValue();
        int m1 = new Integer(l1[1].toString().substring(0, 2)).intValue();
        Time d1 = new Time(h1, m1, 0);

        return d1;
    }

    /**
     * return true if an field exists in the JSONArray
     * 
     * @param JSONArray elements
     * @param String field
     * @return boolean
     */
    protected static boolean exists(JSONArray elements, String field) {

        boolean found = false;
        int count = 0;
        while ((!found) && (count < elements.length())) {
            found = elements.get(count).equals(field);
            count++;
        }
        return found;
    }

    /**
     * return the position of a element in JSON Array if it's exists.
     * 
     * @param JSONArray elements
     * @param String field
     * @return int
     */
    protected static int elementPos(JSONArray elements, String field, String value) {
        boolean found = false;
        int pos = -1;
        int count = 0;
        while ((!found) && (count < elements.length())) {
            found = elements.get(count).equals(field);
            if (found && (elements.getString(count).equals(value))) {
                pos = count;
            }
            count++;
        }
        return pos;
    }

    /**
     * return true if an field exists in the JSONObejct and it not is empty
     * 
     * @param JSONArray elements
     * @param String field
     * @return boolean
     */
    protected static boolean propertyExistsNotNull(JSONObject json, String field) {
        return ((json.has(field)) && (!json.getString(field).equals("")));
    }

    /**
     * print Array list prepare to IN sql commnad
     * 
     * @param List l
     * @return String
     */
    protected static String printListArray(List l) {
        String result = "(";
        for (int i = 0; i < l.size(); i++) {
            if (i != 0) {
                result += ",";
            }
            result += "'" + l.get(i).toString().trim() + "'";
        }

        if (l.size() < 1) {
            result += "' '";
        }
        result += ")";
        return result;
    }

    /**
     * print Array list prepare to IN sql commnad
     * 
     * @param List l
     * @return String
     */
    protected static String printList(List l) {
        String result = "";
        if (!l.equals(null)) {
            result = "(";
            Iterator it = l.iterator();
            int i = 0;
            while (it.hasNext()) {
                if (i != 0) {
                    result += ",";
                }
                Object[] obj = (Object[]) it.next();
                result += "'" + obj[0] + "'";
                i += 1;
            }
            if (l.size() == 0) {
                result += "' '";
            }
            result += ")";
            if (result.equals("('null')")) {
                result = "(' ')";
            }
            if (!result.equals("(' ')") && !result.equals("(' ')")) {
                result = result.replaceAll("''", "'");
            }
        } else {
            result = "(' ')";
        }
        return result;
    }

    /**
     * print Json Array prepare to IN sql commnad
     * 
     * @param List l
     * @return String
     */
    protected static String printJsonArray(JSONArray ja) {
        String result = "(";

        for (int j = 0; j < ja.length(); j++) {
            if (j != 0) {
                result += ",";
            }
            result += "'" + ja.getString(j).trim() + "'";
        }

        if (ja.length() == 0) {
            result += "' '";
        }

        result += ")";
        return result;
    }

    /**
     * compare two object and return true if they are equals
     * 
     * @param Object o
     * @param Object oo
     * @return String
     */
    protected static String equal(Object o, Object oo) {
        if (o.equals(oo)) {
            return "true";
        } else {
            return "false";
        }
    }

    /**
     * compare two object and return true if they are not equals
     * 
     * @param Object o
     * @param Object oo
     * @return String
     */
    protected static String nonEqual(Object o, Object oo) {
        if (o.equals(oo)) {
            return "false";
        } else {
            return "true";
        }
    }

    /**
     * Retrieves the minutes offset to take into account in time comparisons between two different
     * time zones hours in one date PC KB 3018035
     */
    protected static int getTotalMinutesOffset(EventHandlerContext context,
            String reservedTimezone, Date dateCheckTimezone) {

        TimeZone reservedtz;
        TimeZone servertz = TimeZone.getDefault();

        if (!reservedTimezone.equals("")) {
            reservedtz = TimeZone.getTimeZone(reservedTimezone);
        } else {
            reservedtz = TimeZone.getDefault();
        }

        int reservedminutesoffset = -(reservedtz.getOffset(dateCheckTimezone.getTime()) / 60000);
        int serverminutesoffset = -(servertz.getOffset(dateCheckTimezone.getTime()) / 60000);
        int finaloffset = reservedminutesoffset - serverminutesoffset;

        return (finaloffset);
    }

    /**
     * Retrieves the timezone to consider for time comparisons in resource reservations given the
     * site_id and bl_id associated to the resource reservation PC KB 3018035
     */
    protected static String getResourceResTimezone(EventHandlerContext context, String site_id,
            String bl_id) {

        String cityTimezone = "";

        // PC KB 3018035 - Search first for the site timezone
        // to check the GMT offset
        String sqlTimezone = " SELECT city.timezone_id FROM site LEFT OUTER JOIN city "
                + " ON city.city_id=site.city_id AND city.state_id=site.state_id "
                + " WHERE site_id = " + literal(context, site_id);

        List listTimezone = retrieveDbRecords(context, sqlTimezone);

        if (!listTimezone.isEmpty()) {
            Map recordTimezone = (Map) listTimezone.get(0);
            cityTimezone = getString(recordTimezone, "timezone_id");
        }

        // If we didn't get the timezone from resources.site_id,
        // then try from resources.bl_id
        if (cityTimezone.equals("")) {

            sqlTimezone = " SELECT city.timezone_id FROM bl LEFT OUTER JOIN city "
                    + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id "
                    + " WHERE bl_id = " + literal(context, bl_id);

            listTimezone = retrieveDbRecords(context, sqlTimezone);

            if (!listTimezone.isEmpty()) {
                Map recordTimezone2 = (Map) listTimezone.get(0);
                cityTimezone = getString(recordTimezone2, "timezone_id");
            }
        }

        return (cityTimezone);
    }
    
    //kb#3035551: add different ics file to email attachment for requested_by 
    public String createAttachments_requestedBy(EventHandlerContext context, TreeMap parametersValues) {

        String result = "";
        String errMessage = localizeMessage(context, ACTIVITY_ID, "SENDEMAILINVITATIONS_WFR",
                                            "SENDEMAILINVITATIONSERROR", null);
        final String RULE_ID = "createAttachments";

        try {

            Date curDateTime;
            SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyyMMdd");
            SimpleDateFormat timeFormatter = new SimpleDateFormat("HHmmss");
            String line = "";
            
            //kb#3034925: change encoding of ics file from default ansi to utf-8
            /*File file = new File((String) parametersValues.get("path"), (String) parametersValues
                    .get("filename_requestedBy"));
            BufferedWriter out = new BufferedWriter(new FileWriter(file));*/
            String outfilename = (String) (parametersValues.get("path") + (String) parametersValues.get("filename_requestedBy"));
            FileOutputStream file = new FileOutputStream(outfilename);
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(file, "UTF-8"));
            //end kb3034925

            line = "BEGIN:VCALENDAR";
            out.write(line);
            out.newLine();

            line = "PRODID:-//hacksw/handcal//NONSGML v1.0//EN";
            out.write(line);
            out.newLine();

            line = "VERSION:2.0";
            out.write(line);
            out.newLine();

            line = "METHOD:" + (String) parametersValues.get("method");
            out.write(line);
            out.newLine();

            line = "BEGIN:VEVENT";
            out.write(line);
            out.newLine();

            line = (String) parametersValues.get("attendeesSection_requestedBy");
            out.write(line);
            out.newLine();
            
            line = "ORGANIZER:MAILTO:"+ getActivityParameterString(context, ACTIVITY_ID, "InternalServicesEmail");
            out.write(line);
            out.newLine();

            line = "DTSTART:" + (String) parametersValues.get("dateStart") + "T"
                    + (String) parametersValues.get("timeStart") + "Z";
            out.write(line);
            out.newLine();

            line = "DTEND:" + (String) parametersValues.get("dateEnd") + "T"
                    + (String) parametersValues.get("timeEnd") + "Z";
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("rruleFreq")) {
                line = "RRULE:FREQ=" + (String) parametersValues.get("rruleFreq");
                line += ";UNTIL=" + (String) parametersValues.get("rruleUntil");
                line += ";INTERVAL=" + (String) parametersValues.get("rruleInternal");
                if (parametersValues.containsKey("rruleBySetPos")) {
                    line += ";BYSETPOS=" + (String) parametersValues.get("rruleBySetPos");
                }
                if (parametersValues.containsKey("rruleByDay")) {
                    line += ";BYDAY=" + (String) parametersValues.get("rruleByDay");
                }
                line += ";WKST=" + (String) parametersValues.get("WKST");
                out.write(line);
                out.newLine();
            }
            if (parametersValues.containsKey("exDate")) {
                line = "EXDATE:" + (String) parametersValues.get("exDate");
                out.write(line);
                out.newLine();
            }

            if (parametersValues.containsKey("sequence")) {
                line = "SEQUENCE:" + (String) parametersValues.get("sequence");
                out.write(line);
                out.newLine();
            }
            line = "UID:" + (String) parametersValues.get("uid");
            out.write(line);
            out.newLine();

            if (parametersValues.containsKey("recurrence-id")) {
                line = "RECURRENCE-ID:" + (String) parametersValues.get("recurrence-id");
                out.write(line);
                out.newLine();
            }
            line = "LOCATION:" + (String) parametersValues.get("location");
            out.write(line);
            out.newLine();

            curDateTime = new Date();
            long time = curDateTime.getTime();
            int minutesoffset = curDateTime.getTimezoneOffset();
            DecimalFormat timeZoneFormatter = new DecimalFormat("00");
            String TimeZone = (minutesoffset / 60) < 0 ? "+"
                    + timeZoneFormatter.format(-minutesoffset / 60) : timeZoneFormatter
                    .format(-minutesoffset / 60);
            int absOffset = (minutesoffset > 0 ? minutesoffset : -minutesoffset);
            TimeZone += (absOffset % 60) > 0 ? ":" + timeZoneFormatter.format(absOffset % 60) : "";
            time += minutesoffset * 60 * 1000;
            curDateTime.setTime(time);
            line = "DTSTAMP:" + dateFormatter.format(curDateTime) + "T"
                    + timeFormatter.format(curDateTime);
            out.write(line);
            out.newLine();

            line = "SUMMARY:" + (String) parametersValues.get("summary");
            out.write(line);
            out.newLine();

            line = "DESCRIPTION:" + (String) parametersValues.get("description");
            out.write(line);
            out.newLine();

            line = "CLASS:PUBLIC";
            out.write(line);
            out.newLine();

            line = "END:VEVENT";
            out.write(line);
            out.newLine();

            line = "END:VCALENDAR";
            out.write(line);
            out.newLine();

            //kb#3034925: change encoding of ics file from default ansi to utf-8
            out.flush();
            
            out.close();

            result = outfilename;

        } catch (Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed creating attachments "
                    + e.getMessage(), errMessage, e);
            // log.info(ACTIVITY_ID+"-createAttachments: "+e);
        }

        return result;
    }
    

}
