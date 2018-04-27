package com.archibus.eventhandler.hoteling;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * HotelingBookingService is used for booking request logic.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 * 
 */
public final class HotelingBookingService {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     */
    
    private HotelingBookingService() {
    }
    
    /**
     * This method serve as a WFR to search all available spaces and return result as data records
     * list, by which the JS code will manually create a Building-Floor-Room tree.
     * 
     * @param searchParameter search parameter from the console in the client
     * @param recurringRule recurring rule
     */
    public static void searchAvailableSpaces(final JSONObject searchParameter,
            final String recurringRule) {
        
        // call HotelingBookingSearch.searchAvailableSpaces to get the available space DataSetList
        final DataSetList dataSet =
                HotelingBookingSearchAction.searchAvailableSpaces(searchParameter, recurringRule);
        
        // add the DataSetList to context response
        ContextStore.get().getEventHandlerContext().setResponse(dataSet);
        
    }
    
    /**
     * create bookings for use selection.
     * 
     * @param userDvId user dv_id
     * @param userDpId user dp_id
     * @param dayPart day Part
     * @param dateStart date Start
     * @param dateEnd date End
     * @param recurringRule recurring Rule xml string
     * @param bookings booking list from client
     */
    public static void createBookings(final String userDvId, final String userDpId,
            final String dayPart, final Date dateStart, final Date dateEnd,
            final String recurringRule, final JSONArray bookings) {
        
        List<DataRecord> newRmptList = null;
        
        // create bookings
        if (StringUtil.notNullOrEmpty(recurringRule)) {
            
            // if recurring, create bookings for all recurring dates
            newRmptList =
                    HotelingBookingCreateAction.createRecurringBookings(bookings, userDvId,
                        userDpId, dayPart, recurringRule, dateStart, dateEnd);
            
        } else {
            
            // if regular, create bookings for duration [date start to date end]
            newRmptList =
                    HotelingBookingCreateAction.createRegularBookings(bookings, dateStart, dateEnd,
                        userDvId, userDpId, dayPart);
            
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String result = context.getString(HotelingConstants.JSON_EXPRESSION);
        
        // auto approve the bookings that do NOT need approve
        if (newRmptList != null) {
            HotelingBookingCreateAction.checkAutoApprove(newRmptList);
        }
        
        // add the result to the context response parameter
        context.addResponseParameter(HotelingConstants.JSON_EXPRESSION, result);
    }
    
    /**
     * approve bookings for use selection.
     * 
     * @param operationLevel operationLevel
     * @param pctIDs the selected rmpct
     * @param parentPctId parent rmpct
     * @param emIDs employees
     * @param visitorIDs visitors
     * @param activityLogId request
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void approveBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentPctId, final JSONArray emIDs, final JSONArray visitorIDs,
            final String activityLogId) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final DataSource selectRecordDs =
                HotelingUtility.getDatasourceByOperationLevel(operationLevel);
        selectRecordDs.addRestriction(Restrictions.eq(HotelingConstants.RMPCT,
            HotelingConstants.STATUS, 0));
        
        // FOR send email
        final HotelingNotifyService notifyService = new HotelingNotifyService();
        notifyService.addParametertoContextForNotify();
        
        final JSONArray notCanceled = new JSONArray();
        Date datesStart = null;
        
        List<DataRecord> bookingsList = new ArrayList<DataRecord>();
        
        for (int i = 0; i < pctIDs.length(); i++) {
            final int pctId = pctIDs.getInt(i);
            
            datesStart = HotelingUtility.getDateStartByPctId(pctId);
            
            // kb:3025154@lei compare the current time to the date_start of the record
            final int isDatePassed = HotelingUtility.isDatePassed(datesStart, null);
            if (isDatePassed > 0
                    && !ContextStore.get().getUser()
                        .isMemberOfGroup(HotelingConstants.HOTELING_ADMINISTRATION)) {
                notCanceled.put(pctId);
                continue;
            } else {
                if (HotelingConstants.OPERATION_LEVEL_0.equals(operationLevel)) {
                    selectRecordDs.setParameter(HotelingConstants.PCT_ID, pctId);
                    
                    bookingsList = selectRecordDs.getRecords();
                    
                    HotelingBookingApproveAction.setActivityLogToApproved(pctId);
                    
                    final String updateRmpctStatus =
                            "UPDATE rmpct set status=1 WHERE parent_pct_id=" + pctId;
                    HotelingUtility.getRmpctDataSource().addQuery(updateRmpctStatus)
                        .executeUpdate();
                    
                    // handle baseline records
                    HotelingBookingApproveAction.handleBaseLineRecords(bookingsList);
                    
                } else if (HotelingConstants.OPERATION_LEVEL_1.equals(operationLevel)) {
                    // IS IT FIRST RECORD?
                    // FOR send email get text.
                    
                    selectRecordDs.setParameter(HotelingConstants.PCT_ID, pctId);
                    
                    bookingsList = selectRecordDs.getRecords();
                    
                    final String updateRmpctStatus =
                            "UPDATE rmpct set status=1 WHERE pct_id=" + pctId;
                    HotelingUtility.getRmpctDataSource().addQuery(updateRmpctStatus)
                        .executeUpdate();
                    
                    // handle baseline records
                    HotelingBookingApproveAction.handleBaseLineRecords(bookingsList);
                    
                    HotelingBookingApproveAction.setRecurringActivityLogToApproved(parentPctId);
                    // 3 update activity_log.status =
                }
                HotelingUtility.updateActivityLogStatus(Integer.valueOf(activityLogId), "APPROVED");
            }
            
            final JSONObject booking = new JSONObject();
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.EM_ID,
                emIDs.getString(i));
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.VISITOR_ID, visitorIDs.getString(i));
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DV_ID,
                "");
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DP_ID,
                "");
            
            notifyService.prepareEmailNotificationList(booking, bookingsList);
        }
        
        // Make sure the database operation is completed even below email notification may occurs
        // error.
        context.addResponseParameter(HotelingConstants.JSON_EXPRESSION, notCanceled.toString());
        
        try {
            notifyService.sendNotification(HotelingConstants.BOOKING_ACTION_APPROVED, "");
        } catch (final ExceptionBase e) {
            context.addResponseParameter(HotelingConstants.MESSAGE, HotelingConstants.ERROR_1);
        }
    }
    
    /**
     * cancel bookings for use selection.
     * 
     * @param operationLevel operationLevel
     * @param pctIDs the selected rmpct
     * @param parentId parent rmpct
     * @param emIDs employees
     * @param visitorIDs visitors
     * @param blIDs building codes
     * @param activityLogId request
     */
    public static void cancelBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentId, final JSONArray emIDs, final JSONArray visitorIDs,
            final JSONArray blIDs, final String activityLogId) {
        
        cancelOrRejectBookings(operationLevel, pctIDs, parentId, emIDs, visitorIDs, blIDs,
            "CANCELLED");
    }
    
    /**
     * reject bookings for use selection.
     * 
     * @param operationLevel operationLevel
     * @param pctIDs the selected rmpct
     * @param parentId parent rmpct
     * @param emIDs employees
     * @param visitorIDs visitors
     * @param activityLogId request
     */
    public static void rejectBookings(final String operationLevel, final JSONArray pctIDs,
            final String parentId, final JSONArray emIDs, final JSONArray visitorIDs,
            final String activityLogId) {
        cancelOrRejectBookings(operationLevel, pctIDs, parentId, emIDs, visitorIDs, null, "REJECT");
        
    }
    
    /**
     * cancel or reject bookings for use selection.
     * 
     * @param operationLevel operationLevel
     * @param pctIdArray the selected rmpct
     * @param parentId parent rmpct
     * @param emIDs employees
     * @param visitorIdArray visitors
     * @param blIdArray building codes
     * @param status status
     */
    private static void cancelOrRejectBookings(final String operationLevel,
            final JSONArray pctIdArray, final String parentId, final JSONArray emIDs,
            final JSONArray visitorIdArray, final JSONArray blIdArray, final String status) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // FOR send email
        final HotelingNotifyService notifyService = new HotelingNotifyService();
        notifyService.addParametertoContextForNotify();
        
        final DataSource selectRecordDs =
                HotelingUtility.getDatasourceByOperationLevel(operationLevel);
        
        final DataSource rmpctDs = HotelingUtility.getRmpctDataSource();
        
        final JSONArray notCanceled = new JSONArray();
        Date datesStart = null;
        List<DataRecord> bookingsList = new ArrayList<DataRecord>();
        
        int parentPctId = Integer.valueOf(parentId);
        
        for (int i = 0; i < pctIdArray.length(); i++) {
            final int pctId = pctIdArray.getInt(i);
            
            // GET THE DATE_START FOR KOWNING IS NOT THE THE RECORD BE DELETED BY RESTRICTION OF
            // USER GROUP
            
            datesStart =
                    rmpctDs.getRecord(HotelingConstants.PCT_ID + " = " + pctId).getDate(
                        HotelingConstants.RMPCT + HotelingConstants.DOT
                                + HotelingConstants.DATE_START);
            
            final int isDatePassed =
                    HotelingUtility.isDatePassed(datesStart,
                        HotelingBookingCancelAction.getBuildingCodeFromArray(blIdArray, i));
            
            if (isDatePassed > 0
                    && !ContextStore.get().getUser()
                        .isMemberOfGroup(HotelingConstants.HOTELING_ADMINISTRATION)) {
                notCanceled.put(pctId);
                continue;
            } else {
                if (HotelingConstants.OPERATION_LEVEL_0.endsWith(operationLevel)) {
                    selectRecordDs.setParameter(HotelingConstants.PCT_ID, pctId);
                    
                    bookingsList = selectRecordDs.getAllRecords();
                    
                    HotelingBookingCancelAction.cancelOrRejectParentBooking(pctId, status);
                    
                } else if (HotelingConstants.OPERATION_LEVEL_1.equals(operationLevel)) {
                    selectRecordDs.setParameter(HotelingConstants.PCT_ID, pctId);
                    
                    bookingsList = selectRecordDs.getAllRecords();
                    
                    parentPctId =
                            HotelingBookingCancelAction.cancelOrRejectSubBooking(parentPctId,
                                pctId, status);
                }
                
            }
            
            final JSONObject booking = new JSONObject();
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.EM_ID,
                emIDs.getString(i));
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.VISITOR_ID, visitorIdArray.getString(i));
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DV_ID,
                "");
            booking.put(HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.DP_ID,
                "");
            
            notifyService.prepareEmailNotificationList(booking, bookingsList);
        }
        
        // Make sure the database operation is completed even below email notification may occurs
        // error.
        // KB3038334 and KB3038314 -return a new parent_pct_id after the current parent_pct_id was
        // canceled or reject
        final JSONObject json = new JSONObject();
        json.put("parectPctId", parentPctId);
        json.put("notCanceled", notCanceled.toString());
        context.addResponseParameter("jsonExpression", json.toString());
        
        final String bookingAction =
                HotelingConstants.ACTIVITY_LOG_CANCELLED.equals(status) ? HotelingConstants.BOOKING_ACTION_CANCELED
                        : HotelingConstants.BOOKING_ACTION_REJECTED;
        try {
            notifyService.sendNotification(bookingAction, "");
        } catch (final ExceptionBase e) {
            context.addResponseParameter(HotelingConstants.MESSAGE, HotelingConstants.ERROR_1);
        }
        
    }
}
