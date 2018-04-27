package com.archibus.eventhandler.hoteling;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class HotelingHandler extends EventHandlerBase {
    
    /**
     * This method serve as a WFR to search all available spaces and return result as data records
     * list, by which the JS code will manually create a Building-Floor-Room tree.
     * 
     * @param filterParameters: console filter values.
     * @param recurringRule: recurring rule xml string.
     * @throws ParseException
     * @throws NoSuchElementException
     * 
     */
    public void searchAvailableSpaces(final JSONObject filterParameters, final String recurringRule)
            throws NoSuchElementException, ParseException {
        HotelingBookingService.searchAvailableSpaces(filterParameters, recurringRule);
        
    }
    
    /**
     * Create bookings. The booking list is from the drawing selection in the client view.
     * 
     * @param userDvId: user division.
     * @param userDpId: user department.
     * @param dayPart: day part.
     * @param dateStart: start date.
     * @param dateEnd: end date.
     * @param recurringRule: recurring rule xml string.
     * @param bookings: booking list from the client view.
     */
    public void createBookings(final String userDvId, final String userDpId, final String dayPart,
            final Date dateStart, final Date dateEnd, final String recurringRule,
            final JSONArray bookings) throws Exception {
        
        HotelingBookingService.createBookings(userDvId, userDpId, dayPart, dateStart, dateEnd,
            recurringRule, bookings);
    }
    
    /**
     * Cancel bookings. Cancel the select bookings in the client view.
     * 
     * @param operationLevel: "1" - recurring level, "0" - regular level.
     * @param pctIDs: the selected primary keys.
     * @param dayPart: day part.
     * @param parentPctId: parent pct_id.
     * @param emIDs: employee list.
     * @param visitorIDs: visitor list.
     * @param blIDs: building list.
     * @param activityLogId: activity log id.
     * 
     */
    public void cancelBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentPctId, final JSONArray emIDs, final JSONArray visitorIDs,
            final JSONArray blIDs, final String activityLogId) {
        
        HotelingBookingService.cancelBookings(operationLevel, pctIDs, parentPctId, emIDs,
            visitorIDs, blIDs, activityLogId);
    }
    
    /**
     * Approve bookings. Approve the select bookings in the client view.
     * 
     * @param operationLevel: "1" - recurring level, "0" - regular level.
     * @param pctIDs: the selected primary keys.
     * @param dayPart: day part.
     * @param parentPctId: parent pct_id.
     * @param emIDs: employee list.
     * @param visitorIDs: visitor list.
     * @param activityLogId: activity log id.
     */
    public void approveBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentPctId, final JSONArray emIDs, final JSONArray visitorIDs,
            final String activityLogId) {
        
        HotelingBookingService.approveBookings(operationLevel, pctIDs, parentPctId, emIDs,
            visitorIDs, activityLogId);
    }
    
    /**
     * Reject bookings. Reject the select bookings in the client view.
     * 
     * @param operationLevel: "1" - recurring level, "0" - regular level.
     * @param pctIDs: the selected primary keys.
     * @param dayPart: day part.
     * @param parentPctId: parent pct_id.
     * @param emIDs: employee list.
     * @param visitorIDs: visitor list.
     * @param activityLogId: activity log id.
     */
    public void rejectBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentPctId, final JSONArray emIDs, final JSONArray visitorIDs,
            final String activityLogId) {
        
        HotelingBookingService.rejectBookings(operationLevel, pctIDs, parentPctId, emIDs,
            visitorIDs, activityLogId);
    }
    
    /**
     * Set selected rooms hotelable.
     * 
     * @param blId: building code.
     * @param flId: floor code.
     * @param isHotelable: the flag of the room hotelable 0|1.
     * @param rmIdArr: room code array.
     */
    public void makeHotelable(final String blId, final String flId, final String isHotelable,
            final JSONArray rmIdArr) {
        
        final DataSource rmUpdateDs =
                DataSourceFactory.createDataSourceForFields("rm", new String[] { "rm_id",
                        "hotelable" });
        
        String rmIds = "";
        final StringBuffer insql = new StringBuffer();
        
        for (int i = 0; i < rmIdArr.length(); i++) {
            insql.append(",'" + rmIdArr.getString(i) + "'");
        }
        rmIds = insql.substring(1).toString();
        
        final String hotelableSql =
                " UPDATE rm " + " SET hotelable=${parameters['hotelable']} "
                        + " WHERE   rm_id in (" + rmIds + ") " + " AND bl_id='" + blId + "'"
                        + " AND fl_id='" + flId + "'";
        
        rmUpdateDs.addQuery(hotelableSql).addParameter("hotelable", "", DataSource.DATA_TYPE_TEXT)
            .setParameter("hotelable", isHotelable).executeUpdate();
    }
    
    /**
     * Check bookings in all dates that followed the recurring rule passed current date.
     * 
     * @param dateStart: date start.
     * @param dateEnd: date end.
     * @param recurringRule: The recurring rule xml string.
     * @param bookings: booking list.
     */
    public void checkIsDatePassed(final Date dateStart, final Date dateEnd,
            final String recurringRule, final JSONArray bookings) throws Exception {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final List<Date> datesList =
                HotelingRecurringService.getDateList(dateStart, dateEnd, recurringRule);
        
        for (int j = 0; j < bookings.length(); j++) {
            final JSONObject booking = bookings.getJSONObject(j).getJSONObject("values");
            final String blId = booking.getString("rmpct.bl_id");
            // Check if all dates is available
            for (int i = 0; i < datesList.size(); i++) {
                // Consider the time zone when compare server's date and building's date
                if (!ContextStore.get().getUser().isMemberOfGroup("HOTELING ADMINISTRATION")) {
                    final Date timeZoneDate =
                            HotelingUtility.getTimeZoneDateOfBl(Utility.currentDate(), blId);
                    final Calendar timeZoneDateCalc = Calendar.getInstance();
                    timeZoneDateCalc.setTime(timeZoneDate);
                    timeZoneDateCalc.set(Calendar.HOUR_OF_DAY, 0);
                    timeZoneDateCalc.set(Calendar.MINUTE, 0);
                    timeZoneDateCalc.set(Calendar.SECOND, 0);
                    timeZoneDateCalc.set(Calendar.MILLISECOND, 0);
                    if (timeZoneDateCalc.getTime().compareTo(datesList.get(i)) > 0) {
                        context.addResponseParameter("message", "err2");
                        return;
                    }
                }
            }
        }
    }
    
    /**
     * This method serve as a WFR to check if each booking matches the room standard and employee
     * standard restriction based on rMstd_emstd table.
     * 
     * @param bookings: booking list.
     */
    public void checkRmstdEmstd(final JSONArray bookings) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Prepare checking SQL QUERY and DataSource
        final StringBuilder SQL_RMSTD = new StringBuilder();
        SQL_RMSTD
            .append(" SELECT bl_id, fl_id, rm_id, rm_std FROM rm ")
            .append(" WHERE ")
            .append("(")
            .append(
                " rm.rm_std IN (SELECT rmstd_emstd.rm_std FROM rmstd_emstd WHERE rmstd_emstd.em_std =${parameters['emStd']}) ")
            .append(" OR rm.rm_std NOT IN ( SELECT rmstd_emstd.rm_std FROM rmstd_emstd )")
            .append(
                " OR ${parameters['emStd']} NOT IN ( SELECT rmstd_emstd.em_std FROM rmstd_emstd )")
            .append(")").append(" AND bl_id=${parameters['blId']}")
            .append(" AND fl_id=${parameters['flId']}").append(" AND rm_id=${parameters['rmId']}");
        final DataSource rmDS =
                DataSourceFactory
                    .createDataSourceForFields("rm",
                        new String[] { "bl_id", "fl_id", "rm_id", "rm_std" })
                    .addQuery(SQL_RMSTD.toString())
                    .addParameter("emStd", "", DataSource.DATA_TYPE_TEXT)
                    .addParameter("blId", "", DataSource.DATA_TYPE_TEXT)
                    .addParameter("flId", "", DataSource.DATA_TYPE_TEXT)
                    .addParameter("rmId", "", DataSource.DATA_TYPE_TEXT);
        
        final JSONArray unMatchedBookings = new JSONArray();
        
        for (int j = 0; j < bookings.length(); j++) {
            // Retrieve room standard from room of booking
            final JSONObject booking = bookings.getJSONObject(j).getJSONObject("values");
            final String blId = booking.getString("rmpct.bl_id");
            final String flId = booking.getString("rmpct.fl_id");
            final String rmId = booking.getString("rmpct.rm_id");
            final String emId = booking.getString("rmpct.em_id");
            String emStd = "";
            if (StringUtil.notNullOrEmpty(emId)) {
                emStd = HotelingUtility.getEmployeeStandard(emId);
                if (StringUtil.notNullOrEmpty(emStd)) {
                    final DataRecord rmRec =
                            rmDS.setParameter("emStd", emStd).setParameter("blId", blId)
                                .setParameter("flId", flId).setParameter("rmId", rmId).getRecord();
                    if (rmRec == null) {
                        final JSONObject unMatchBooking = new JSONObject();
                        unMatchBooking.put("loc", blId + "-" + flId + "-" + rmId);
                        unMatchBooking.put("emStd", emStd);
                        unMatchedBookings.put(unMatchBooking);
                    }
                }
            }
        }
        
        context.addResponseParameter("jsonExpression", unMatchedBookings.toString());
    }
    
    /**
     * Check Hoteling Approval, this is a schduled wfr . If the activity parameter
     * 'ApprovalRequired' is 'Yes', according the the activity parameter ApproveDays value, which
     * indicates number of days to approve the hotel if it's in status "Requested" When time
     * expired, then this WFR will check which action to execute (ActionApprovalExpired):
     * automatically Approve it, Reject it, or Notify (the user defined in UserApprovalExpired)
     * 
     * @param context: EventHandlerContext.
     */
    public void checkHotelingApproval(final EventHandlerContext context) {
        final String approvalRequired =
                getActivityParameterString(context, HotelingConstants.AB_SPACE_HOTELLING,
                    "ApprovalRequired");
        if ("Yes".equals(approvalRequired)) {
            final String approveDays =
                    getActivityParameterString(context, HotelingConstants.AB_SPACE_HOTELLING,
                        "ApproveDays");
            final String actionApprovalExpired =
                    getActivityParameterString(context, HotelingConstants.AB_SPACE_HOTELLING,
                        "ActionApprovalExpired");
            final String userApprovalExpired =
                    getActivityParameterString(context, HotelingConstants.AB_SPACE_HOTELLING,
                        "UserApprovalExpired");
            
            String sql = "";
            final String currentDate = "CurrentDateTime";
            
            // Check the hotel in status 'Requested' where the time to approve expired
            sql =
                    " SELECT pct_id, parent_pct_id, em_id, visitor_id ,activity_log_id, bl_id, fl_id, rm_id, date_start, date_end, day_part, status"
                            + " FROM rmpct "
                            + " WHERE exists(select 1 from activity_log where activity_log.activity_log_id = rmpct.activity_log_id and activity_log.activity_type='SERVICE DESK - HOTELING') "
                            + "   and rmpct.status = 0 AND "
                            + formatSqlDaysBetween(context, currentDate, "rmpct.date_start")
                            + " < " + approveDays;
            
            final List<Map<String, Object>> records = retrieveDbRecords(context, sql);
            
            if (!records.isEmpty()) {
                if ("Notify".equals(actionApprovalExpired)) {
                    new HotelingNotifyService().notityUserApprovalExpired(context, records,
                        userApprovalExpired);
                } else {
                    for (final Object element : records) {
                        try {
                            final Map<String, Object> record = (Map<String, Object>) element;
                            final String pctId =
                                    getIntegerValue(context, record.get("pct_id")).toString();
                            String emId = "";
                            if (record.get("em_id") != null) {
                                emId = (String) record.get("em_id");
                            }
                            String visitorId = "";
                            if (record.get("visitor_id") != null) {
                                visitorId =
                                        getIntegerValue(context, record.get("visitor_id"))
                                            .toString();
                            }
                            final JSONArray pctIdArray = new JSONArray();
                            pctIdArray.put(pctId);
                            final JSONArray emArray = new JSONArray();
                            emArray.put(emId);
                            final JSONArray visitorIdArray = new JSONArray();
                            visitorIdArray.put(visitorId);
                            String parentPctId = "";
                            if (record.get("parent_pct_id") != null) {
                                parentPctId =
                                        getIntegerValue(context, record.get("parent_pct_id"))
                                            .toString();
                            }
                            String activityLogId = "";
                            if (record.get("activity_log_id") != null) {
                                activityLogId =
                                        getIntegerValue(context, record.get("activity_log_id"))
                                            .toString();
                            }
                            if ("Approve".equals(actionApprovalExpired)) { // If the system must
                                                                           // automatically approve
                                                                           // the room reservation
                                this.approveBookings("1", pctIdArray, parentPctId, emArray,
                                    visitorIdArray, activityLogId);
                                
                            } else if ("Reject".equals(actionApprovalExpired)) {// If the system
                                                                                // must
                                                                                // automatically
                                                                                // reject the room
                                                                                // reservation
                                this.rejectBookings("1", pctIdArray, parentPctId, emArray,
                                    visitorIdArray, activityLogId);
                            }
                        } catch (final Exception e) {
                            this.log.error("checkHotelingApproval(EventHandlerContext context)", e);
                        }
                    }
                }
            }
        }
    }
    
}
