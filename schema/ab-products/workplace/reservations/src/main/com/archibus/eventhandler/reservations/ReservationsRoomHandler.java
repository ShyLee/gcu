package com.archibus.eventhandler.reservations;

import java.io.StringReader;
import java.math.BigDecimal;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;
import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Contains common event handlers used in Rooms reservation WFRs.
 */
public class ReservationsRoomHandler extends ReservationsEventHandlerBase {
    
    /**
     * Event handler class should not contain any instance variables. Class variables (i.e. static
     * final int STATUS_AVAILABLE = 0) are allowed.
     */
    static final String ACTIVITY_ID = "AbWorkplaceReservations";
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN getReservationInfo wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * Loads or creates new reservation object and returns it to the UI. Inputs: resId Reservation
     * ID (xml structure); if empty, new reservation is created. User User information JSON Object
     * Outputs: jsonExpression JSON string containing reservation info.
     * 
     * @param context Event handler context.
     */
    public void getReservationInfo(final String res_id, final String jsonUser) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String reservationId = res_id;
        final String jsonExpression = jsonUser;
        
        final String RULE_ID = "getReservationInfo";
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' .....
        // ");
        
        // block 1 (reserve)
        String reservationRes_id = "";
        String reservationUser_created_by = "";
        String reservationUser_requested_by = "";
        String reservationUser_requested_for = "";
        String reservationCost_res = "";
        String reservationDv_id = "";
        String reservationDp_id = "";
        String reservationEmail = "";
        String reservationPhone = "";
        String reservationReservation_name = "";
        String reservationComments = "";
        final Vector reservationDate_start = new Vector();
        String reservationTime_start = "";
        String reservationTime_end = "";
        String reservationGroup_size = "";
        String reservationGuests_external = "";
        /* String reservationDoc_event = ""; */
        String reservationRm_arrange_type_id = "";
        String reservationAttendees = "";
        final boolean reservationRequire_reply = false;
        
        String reservationStatus = "";
        final String reservationRes_type = "regular";
        final String reservationRecur_type = "day";
        final String reservationRecur_val1 = "";
        final String reservationRecur_val2 = "";
        
        // PC KB 3022749
        // We want to store the original reservation type. For editing a recurring reservation we
        // will set
        // that reservation type is regular as just want to change this instance, but will help us
        // to know
        // that it's part of a recurring reservation
        String reservationOriginalRes_type = "";
        
        // block 2 (reserve_rm)
        String roomReservationRmres_id = "";
        String roomReservationComments = "";
        String roomReservationTime_start = "";
        String roomReservationTime_end = "";
        String roomReservationCost_rmres = "";
        String reservationSite_id = "";
        String reservationCtry_id = "";
        String reservationBl_id = "";
        String roomReservationBl_id = "";
        String reservationFl_id = "";
        String roomReservationFl_id = "";
        String reservationRm_id = "";
        String roomReservationRm_id = "";
        String roomReservationConfig_id = "";
        String roomReservationRm_arrange_type_id = "";
        String roomReservationStatus = "";
        // block 3 (reserve_rs)
        String resourceReservationRsres_id = "";
        String resourceReservationComments = "";
        String resourceReservationDate_start = "";
        String resourceReservationTime_start = "";
        String resourceReservationTime_end = "";
        String resourceReservationCost_rsres = "";
        String resourceReservationResource_id = "";
        String resourceReservationQuantity = "";
        String resourceReservationBl_id = "";
        String resourceReservationFl_id = "";
        String resourceReservationRm_id = "";
        String resourceReservationStatus = "";
        // block 4 (resource_std)
        final JSONArray resourceStds = new JSONArray();
        
        final JSONArray resourceReservations = new JSONArray();
        
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[jsonExpression]: " +
        // jsonExpression);
        
        String sql = "";
        
        // getReservationInfo rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "GETRESERVATIONINFO_WFR",
                    "RESERVATIONNOTFOUND", null);
        
        // Get the reservation identifier from the XML structure
        try {
            if (!reservationId.equals("")) {
                final SAXReader xmlReader = new SAXReader();
                final Document xmlDoc = xmlReader.read(new StringReader(reservationId));
                final Attribute reservationIdValue =
                        (Attribute) xmlDoc.getRootElement().attributes().get(0);
                reservationId = reservationIdValue.getValue();
            }
        } catch (final Throwable e) {
            reservationId = "";
            // this.log.info(ACTIVITY_ID + "-" + RULE_ID+ ": Failed parse XML "
            // + e);
        }
        
        // IF res_id specified - load reservation from DB
        if (reservationId.length() != 0) {
            
            try {
                // 1.- Get general information from reserve table
                try {
                    sql =
                            " SELECT "
                                    + " res_id,user_created_by,user_requested_by,user_requested_for,cost_res,"
                                    + " dv_id,dp_id,phone,email,reservation_name,comments,"
                                    + " date_start,time_start,time_end,status,recurring_rule,attendees "
                                    // PC KB 3022749
                                    + " ,res_type " + " FROM reserve WHERE res_id = "
                                    + reservationId;
                    // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[sql_r]: " +
                    // sql);
                    
                    final List recordsReservation = retrieveDbRecords(context, sql);
                    if (!recordsReservation.isEmpty()) {
                        final Map record = (Map) recordsReservation.get(0);
                        // save values in treemap
                        reservationRes_id =
                                getIntegerValue(context, record.get("res_id")).toString();
                        reservationUser_created_by = getString(record, "user_created_by");
                        reservationUser_requested_by = getString(record, "user_requested_by");
                        reservationUser_requested_for = getString(record, "user_requested_for");
                        reservationCost_res = getString(record, "cost_res");
                        reservationDv_id = getString(record, "dv_id");
                        reservationDp_id = getString(record, "dp_id");
                        reservationPhone = getString(record, "phone");
                        reservationEmail = getString(record, "email");
                        reservationReservation_name = getString(record, "reservation_name");
                        reservationComments = getString(record, "comments");
                        reservationDate_start.add(0,
                            getDateValue(context, record.get("date_start")).toString());
                        reservationTime_start =
                                getTimeValue(context, record.get("time_start")).toString();
                        reservationTime_end =
                                getTimeValue(context, record.get("time_end")).toString();
                        reservationStatus = getString(record, "status");
                        reservationAttendees = getString(record, "attendees");
                        // PC KB 3022749
                        reservationOriginalRes_type = getString(record, "res_type");
                    }
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed reserve table: "
                            + sql, errMessage, e);
                }
                
                // 2.- Get information of the room reservation from reserve_rm
                // table
                try {
                    sql =
                            " SELECT "
                                    + " rmres_id,reserve_rm.comments,time_start,time_end,cost_rmres,bl.site_id as site_id,"
                                    + "bl.ctry_id as ctry_id, bl.bl_id as bl_id,fl_id,rm_id,config_id,rm_arrange_type_id,reserve_rm.status, "
                                    + "(guests_internal+guests_external) as group_size,guests_external"
                                    + " FROM reserve_rm, bl "
                                    + " WHERE res_id = "
                                    + reservationId
                                    + " AND reserve_rm.bl_id=bl.bl_id "
                                    + " AND reserve_rm.status <> 'Rejected' AND reserve_rm.status <> 'Cancelled' ";
                    // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[sql_rm]: "+
                    // sql);
                    
                    final List recordsReservation = retrieveDbRecords(context, sql);
                    if (!recordsReservation.isEmpty()) {
                        final Map record = (Map) recordsReservation.get(0);
                        // save values in treemap. We'll only take the first
                        // room reservation
                        roomReservationRmres_id = getString(record, "rmres_id");
                        roomReservationComments = getString(record, "comments");
                        roomReservationTime_start =
                                getTimeValue(context, record.get("time_start")).toString();
                        roomReservationTime_end =
                                getTimeValue(context, record.get("time_end")).toString();
                        roomReservationCost_rmres = getString(record, "cost_rmres");
                        reservationGroup_size = getString(record, "group_size");
                        reservationGuests_external = getString(record, "guests_external");
                        reservationSite_id = getString(record, "site_id");
                        reservationCtry_id = getString(record, "ctry_id");
                        reservationBl_id = getString(record, "bl_id");
                        roomReservationBl_id = getString(record, "bl_id");
                        reservationFl_id = getString(record, "fl_id");
                        roomReservationFl_id = getString(record, "fl_id");
                        reservationRm_id = getString(record, "rm_id");
                        roomReservationRm_id = getString(record, "rm_id");
                        roomReservationConfig_id = getString(record, "config_id");
                        roomReservationRm_arrange_type_id = getString(record, "rm_arrange_type_id");
                        roomReservationStatus = getString(record, "status");
                        reservationRm_arrange_type_id = getString(record, "rm_arrange_type_id");
                    }
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                            + ": Failed reserve_rm table: " + sql, errMessage, e);
                }
                
                // 3.- Get information of the resource reservation from
                // reserve_rs table
                try {
                    sql =
                            " SELECT "
                                    + " rsres_id,date_start,reserve_rs.comments,time_start,time_end,cost_rsres,bl.site_id,bl.ctry_id, "
                                    + " resource_id,quantity,bl.bl_id,fl_id,rm_id,reserve_rs.status "
                                    + " FROM reserve_rs, bl "
                                    + " WHERE res_id = "
                                    + reservationId
                                    + " AND reserve_rs.bl_id=bl.bl_id "
                                    + " AND reserve_rs.status <> 'Rejected' AND reserve_rs.status <> 'Cancelled' ";
                    // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[sql_rs]: "+
                    // sql);
                    
                    final List recordsReservation = retrieveDbRecords(context, sql);
                    // BEGIN: create a jsonobject for each resource reservation
                    // record
                    if (!recordsReservation.isEmpty()) {
                        for (final Iterator it = recordsReservation.iterator(); it.hasNext();) {
                            final Map record = (Map) it.next();
                            // save values in treemap
                            resourceReservationRsres_id = getString(record, "rsres_id");
                            resourceReservationComments = getString(record, "comments");
                            resourceReservationDate_start =
                                    getDateValue(context, record.get("date_start")).toString();
                            resourceReservationTime_start =
                                    getTimeValue(context, record.get("time_start")).toString();
                            resourceReservationTime_end =
                                    getTimeValue(context, record.get("time_end")).toString();
                            resourceReservationCost_rsres = getString(record, "cost_rsres");
                            resourceReservationResource_id = getString(record, "resource_id");
                            resourceReservationQuantity = getString(record, "quantity");
                            resourceReservationBl_id = getString(record, "bl_id");
                            resourceReservationFl_id = getString(record, "fl_id");
                            resourceReservationRm_id = getString(record, "rm_id");
                            resourceReservationStatus = getString(record, "status");
                            if (reservationSite_id.equals("")) {
                                reservationSite_id = getString(record, "site_id");
                            }
                            if (reservationCtry_id.equals("")) {
                                reservationCtry_id = getString(record, "ctry_id");
                            }
                            if (reservationBl_id.equals("")) {
                                reservationBl_id = getString(record, "bl_id");
                            }
                            if (reservationFl_id.equals("")) {
                                reservationFl_id = getString(record, "fl_id");
                            }
                            if (reservationRm_id.equals("")) {
                                reservationRm_id = getString(record, "rm_id");
                            }
                            // create jsonObject
                            final JSONObject jsResourceReservation = new JSONObject();
                            
                            jsResourceReservation.put("rsres_id", resourceReservationRsres_id);
                            jsResourceReservation.put("comments", resourceReservationComments);
                            jsResourceReservation.put(
                                "date_start",
                                formatFieldValue(context, resourceReservationDate_start,
                                    "java.sql.Date", "reserve_rs.date_start", false));
                            jsResourceReservation.put(
                                "starttime",
                                formatFieldValue(context, resourceReservationTime_start,
                                    "java.sql.Time", "reserve_rs.time_start", false));
                            jsResourceReservation.put(
                                "endtime",
                                formatFieldValue(context, resourceReservationTime_end,
                                    "java.sql.Time", "reserve_rs.time_end", false));
                            jsResourceReservation.put("cost_rsres", resourceReservationCost_rsres);
                            jsResourceReservation
                                .put("resource_id", resourceReservationResource_id);
                            jsResourceReservation.put("quantity", resourceReservationQuantity);
                            jsResourceReservation.put("bl_id", resourceReservationBl_id);
                            jsResourceReservation.put("fl_id", resourceReservationFl_id);
                            jsResourceReservation.put("rm_id", resourceReservationRm_id);
                            jsResourceReservation.put("status", resourceReservationStatus);
                            // add jsonObjet to jsonarray
                            resourceReservations.put(jsResourceReservation);
                        }
                    }
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed reserve_rs table:"
                            + sql, errMessage, e);
                }
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception",
                    errMessage, e);
            }
            
            // IF no res_id specified - set the default reservation information
            // from the User object
        } else {
            try {
                final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
                final JSONObject user = objectsToSave.getJSONObject(0);
                try {
                    user.put("groups", user.getJSONArray("groups"));
                } catch (final Throwable e) {
                    user.put(
                        "groups",
                        user.getJSONObject("groups").toJSONArray(
                            user.getJSONObject("groups").names()));
                }
                reservationSite_id =
                        user.getJSONObject("Employee").getJSONObject("Building")
                            .getString("site_id");
                reservationCtry_id =
                        user.getJSONObject("Employee").getJSONObject("Building")
                            .getString("ctry_id");
                reservationBl_id = user.getJSONObject("Employee").getString("bl_id");
                reservationUser_created_by = user.getJSONObject("Employee").getString("em_id");
                reservationUser_requested_by = user.getJSONObject("Employee").getString("em_id");
                reservationUser_requested_for = user.getJSONObject("Employee").getString("em_id");
                reservationEmail = user.getString("email");
                reservationPhone = user.getJSONObject("Employee").getString("phone");
                reservationDv_id = user.getJSONObject("Employee").getString("dv_id");
                reservationDp_id = user.getJSONObject("Employee").getString("dp_id");
                // Return default values for some of the fields in the console
                reservationDate_start.add(0, getDateValue(context, new Date()).toString());
                reservationGroup_size = "";
                reservationGuests_external = "0";
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception",
                    errMessage, e);
            }
        }
        // Get the list of existing resources standards
        try {
            final List records =
                    selectDbRecords(context, "resource_std", new String[] { "resource_name",
                            "resource_std" }, "");
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final JSONObject resourceStd = new JSONObject();
                resourceStd.put("name", notNull(record[0]));
                resourceStd.put("type", notNull(record[1]));
                resourceStds.put(resourceStd);
            }
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed resource_std table",
                errMessage, e);
        }
        
        // set JSON Objects
        final JSONObject jsReservation = new JSONObject();
        final JSONArray dateSetArray = new JSONArray();
        
        for (final Iterator itSet = reservationDate_start.iterator(); itSet.hasNext();) {
            dateSetArray.put(itSet.next());
        }
        
        jsReservation.put("res_id", reservationRes_id);
        jsReservation.put("user_created_by", reservationUser_created_by);
        jsReservation.put("user_requested_by", reservationUser_requested_by);
        jsReservation.put("user_requested_for", reservationUser_requested_for);
        jsReservation.put("cost_res", reservationCost_res);
        jsReservation.put("dv_id", reservationDv_id);
        jsReservation.put("dp_id", reservationDp_id);
        jsReservation.put("phone", reservationPhone);
        jsReservation.put("email", reservationEmail);
        jsReservation.put("reservation_name", reservationReservation_name);
        jsReservation.put("comments", reservationComments);
        jsReservation.put("date_start", dateSetArray);
        jsReservation.put(
            "time_start",
            formatFieldValue(context, reservationTime_start, "java.sql.Time", "reserve.time_start",
                false));
        jsReservation.put(
            "time_end",
            formatFieldValue(context, reservationTime_end, "java.sql.Time", "reserve.time_end",
                false));
        jsReservation.put("group_size", reservationGroup_size);
        jsReservation.put("ext_guest", reservationGuests_external);
        jsReservation.put("status", reservationStatus);
        jsReservation.put("rm_arrange_type_id", reservationRm_arrange_type_id);
        jsReservation.put("res_type", reservationRes_type);
        jsReservation.put("recur_type", reservationRecur_type);
        jsReservation.put("recur_val1", reservationRecur_val1);
        jsReservation.put("recur_val2", reservationRecur_val2);
        // PC KB 3022749
        jsReservation.put("original_res_type", reservationOriginalRes_type);
        // common values
        jsReservation.put("site_id", reservationSite_id);
        jsReservation.put("ctry_id", reservationCtry_id);
        jsReservation.put("bl_id", reservationBl_id);
        jsReservation.put("fl_id", reservationFl_id);
        jsReservation.put("rm_id", reservationRm_id);
        // Resource Standars
        jsReservation.put("all_resource_stds", resourceStds);
        jsReservation.put("attendees", reservationAttendees);
        jsReservation.put("require_reply", reservationRequire_reply);
        
        final JSONObject jsRoomReservation = new JSONObject();
        jsRoomReservation.put("rmres_id", roomReservationRmres_id);
        jsRoomReservation.put("comments", roomReservationComments);
        jsRoomReservation.put(
            "time_start",
            formatFieldValue(context, roomReservationTime_start, "java.sql.Time",
                "reserve_rm.time_start", false));
        jsRoomReservation.put(
            "time_end",
            formatFieldValue(context, roomReservationTime_end, "java.sql.Time",
                "reserve_rm.time_end", false));
        jsRoomReservation.put("cost_rmres", roomReservationCost_rmres);
        jsRoomReservation.put("bl_id", roomReservationBl_id);
        jsRoomReservation.put("fl_id", roomReservationFl_id);
        jsRoomReservation.put("rm_id", roomReservationRm_id);
        jsRoomReservation.put("config_id", roomReservationConfig_id);
        jsRoomReservation.put("rm_arrange_type_id", roomReservationRm_arrange_type_id);
        jsRoomReservation.put("status", roomReservationStatus);
        
        // Create the output parameter
        final JSONObject results = new JSONObject();
        results.put("reservation", jsReservation);
        results.put("roomReservation", jsRoomReservation);
        results.put("resourcesReservations", resourceReservations);
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + ": Expression: "+
        // results.toString());
        context.addResponseParameter("jsonExpression", results.toString());
        if (!context.parameterExists("message")) {
            context.addResponseParameter("message", "OK");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END getReservationInfo wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN getArrangementFixedResources wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * Loads the list of fixed resources of the selected arrangement Inputs: RoomReservation JSON
     * Object containing the selected arrangement Outputs: jsonExpression JSON string containing
     * fixed resources list.
     * 
     * @param context Event handler context.
     */
    public void getArrangementFixedResources(final String jsonRoomReservation) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "getArrangementFixedResources";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the selected arrangement from the input parameter
        final String jsonExpression = jsonRoomReservation;
        // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"' [JSONExpression input]:
        // "+jsonExpression);
        // Create the output JSON Array
        final JSONArray fixedResourceStd = new JSONArray();
        boolean allOk = false;
        
        // getArrangementFixedResources rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "GETARRANGEMENTFIXEDRESOURCES_WFR",
                    "FIXEDRESOURCESNOTFOUND", null);
        
        try {
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            final JSONObject roomReservation = objectsToSave.getJSONObject(0);
            String sql = "";
            try {
                sql =
                        " SELECT fixed_resource_id " + " FROM rm_resource_std " + " WHERE bl_id="
                                + literal(context, roomReservation.getString("bl_id")) + " "
                                + " AND fl_id="
                                + literal(context, roomReservation.getString("fl_id")) + " "
                                + " AND rm_id="
                                + literal(context, roomReservation.getString("rm_id")) + " "
                                + " AND config_id="
                                + literal(context, roomReservation.getString("config_id")) + " "
                                + " AND rm_arrange_type_id= "
                                + literal(context, roomReservation.getString("rm_arrange_type_id"))
                                + " ";
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[sql_fixed_resource_id]:
                // "+sql);
                
                final List listRecordsFixedResourceStd = retrieveDbRecords(context, sql);
                
                if (!listRecordsFixedResourceStd.isEmpty()) {
                    final Iterator recordsFixedResourceStd = listRecordsFixedResourceStd.iterator();
                    while (recordsFixedResourceStd.hasNext()) {
                        final Map values = (Map) recordsFixedResourceStd.next();
                        fixedResourceStd.put(getString(values, "fixed_resource_id"));
                    }
                    // Modify the roomReservation Object to add the fixed
                    // resources
                    roomReservation.put("fixed_resource", fixedResourceStd);
                    allOk = true;
                }
                // Add the output parameter
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+": Expression:
                // "+roomReservation.toString());
                context.addResponseParameter("jsonExpression", roomReservation.toString());
                
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                        + ": Failed rm_resource_std table: " + sql, errMessage, e);
            }
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            context.addResponseParameter("message", "OK");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END getArrangementFixedResources wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN loadTimeline wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * return the available room arrangements for the user and the existing reservations for these
     * arrangements Inputs: RoomReservation RoomReservation JSONObject; Reservation Reservation
     * JSONObject; User User JSONObject; availableforTimeframeOnly String values: 'yes','no'
     * Outputs: jsonExpression JSON string containing timeline info.
     * 
     * @param context Event handler context.
     */
    public void loadTimeline(final String jsonReservation, final String availableforTimeframeOnly) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "loadTimeline";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input parameters
        final String jsonExpression = jsonReservation;
        
        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [jsonExpression input]:
        // "+jsonExpression+" ");
        String sql = "";
        int count = 0;
        boolean allOk = false;
        // Generate the output Timeline object
        final JSONObject timeline = new JSONObject();
        
        // loadTimeline rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "LOADTIMELINE_WFR", "LOADTIMELINEERROR", null);
        final String errMessage2 =
                localizeMessage(context, ACTIVITY_ID, "LOADTIMELINE_WFR",
                    "LOADTIMELINENOROOMSFOUND", null);
        
        try {
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            final JSONObject user = objectsToSave.getJSONObject(0);
            final JSONObject reservation = objectsToSave.getJSONObject(1);
            final JSONObject roomReservation = objectsToSave.getJSONObject(2);
            
            String dateSet = "";
            // BEGIN: it gets dateset in a dateSet var
            for (int i = 0; i < reservation.getJSONArray("date_start").length(); i++) {
                dateSet +=
                        " "
                                + formatSqlIsoToNativeDate(context,
                                    reservation.getJSONArray("date_start").getString(i));
                if (i != (reservation.getJSONArray("date_start").length() - 1)) {
                    dateSet += ",";
                }
            }
            // END: it gets dateset in a dateSet var
            
            // Generate the query to search for the available room arrangements
            // for the connected user, and selected date
            sql =
                    " SELECT rm_arrange.ac_id,reservable,res_stds_not_allowed,pre_block,post_block,"
                            + " min_required,max_days_ahead,max_capacity,is_default,group_name, "
                            + " external_allowed,doc_image,day_start,day_end,cost_per_unit_ext, "
                            + " cost_per_unit,cost_late_cancel_pct,cancel_time,cancel_days,available_for_group, "
                            + " approve_days,approval,announce_time,announce_days,cost_unit, "
                            + " rm_arrange.bl_id,fl_id,rm_id,config_id,rm_arrange_type_id, "
                            + " ( SELECT "
                            + formatSqlIsNull(context,
                                "rm_arrange_type.arrange_name , RTRIM(rm_arrange_type.rm_arrange_type_id)")
                            + " "
                            + " FROM rm_arrange_type "
                            + " WHERE rm_arrange_type.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ) AS arr_name , "
                            + " ( SELECT "
                            + formatSqlIsNull(context,
                                "rm_config.config_name,RTRIM(rm_config.bl_id)"
                                        + formatSqlConcat(context) + "' '"
                                        + formatSqlConcat(context) + "RTRIM(rm_config.fl_id)"
                                        + formatSqlConcat(context) + "' '"
                                        + formatSqlConcat(context) + "RTRIM(rm_config.rm_id)"
                                        + formatSqlConcat(context) + "' '"
                                        + formatSqlConcat(context) + "RTRIM(rm_config.config_id)")
                            + " "
                            + " FROM rm_config "
                            + " WHERE rm_config.bl_id=rm_arrange.bl_id AND rm_config.fl_id=rm_arrange.fl_id AND "
                            + " rm_config.rm_id=rm_arrange.rm_id AND rm_config.config_id=rm_arrange.config_id ) AS conf_name ";
            
            // BEGIN: get number of fixed resources available to order the
            // resulting arrangements
            if (propertyExistsNotNull(reservation, "resource_stds")) {
                JSONArray elements = new JSONArray();
                try {
                    elements = reservation.getJSONArray("resource_stds");
                } catch (final Throwable e) {
                    elements =
                            reservation.getJSONObject("resource_stds").toJSONArray(
                                reservation.getJSONObject("resource_stds").names());
                }
                if (elements.length() != 0) {
                    String resource_stds_list = "";
                    count = 0;
                    // Generate the comma-separated list with the selected
                    // resource standards
                    while (count < elements.length()) {
                        resource_stds_list +=
                                " " + literal(context, ((String) elements.get(count))) + " ";
                        count++;
                        if (count < elements.length()) {
                            resource_stds_list += ", ";
                        }
                    }
                    resource_stds_list += " ";
                    sql +=
                            " , ( SELECT COUNT(*) FROM rm_resource_std res "
                                    + " WHERE resource_std IN ("
                                    + resource_stds_list
                                    + ") "
                                    + " AND res.bl_id=rm_arrange.bl_id AND res.fl_id=rm_arrange.fl_id "
                                    + " AND res.rm_id=rm_arrange.rm_id AND res.config_id=rm_arrange.config_id "
                                    + " AND res.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ) "
                                    + " AS num_fixed_res ";
                } else {
                    sql += " , 0 AS num_fixed_res ";
                }
            } else {
                sql += " , 0 AS num_fixed_res ";
            }
            // END: get number of fixed resources available for order the
            // resulting arrangements
            
            // PC KB 3018035 - For doing time checks we need the timezone offset
            // for the arrangement and date involved, so we'll do this check later
            final String currentDate = "CurrentDateTime";
            final String dateStart = reservation.getJSONArray("date_start").getString(0);
            sql +=
                    " , " + formatSqlDaysBetween(context, currentDate, dateStart)
                            + " AS daystodatestart, city.timezone_id ";
            // END PC KB 3018035
            
            sql += " FROM rm_arrange ";
            
            // PC KB 3018035
            sql += " INNER JOIN bl ON rm_arrange.bl_id = bl.bl_id ";
            sql +=
                    " LEFT OUTER JOIN city ON bl.city_id = city.city_id AND bl.state_id = city.state_id ";
            // END PC KB 3018035
            
            sql +=
                    " WHERE reservable = 1 " + " AND EXISTS (SELECT 1 FROM rm "
                            + " WHERE rm.bl_id=rm_arrange.bl_id AND rm.fl_id=rm_arrange.fl_id "
                            + " AND rm.rm_id=rm_arrange.rm_id AND rm.reservable=1) ";
            
            // BEGIN: show only the arrangements the user can reserve
            try {
                user.put("groups", user.getJSONArray("groups"));
            } catch (final Throwable e) {
                user.put("groups",
                    user.getJSONObject("groups").toJSONArray(user.getJSONObject("groups").names()));
            }
            
            // If the user is not MANAGER or SERVICE DESK, check that has
            // permissions to reserve the room arrangement
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                final JSONArray groupElements = user.getJSONArray("groups");
                if (groupElements.length() != 0) {
                    String group_names_list = "";
                    count = 0;
                    // Generate the comma-separated list of the security groups
                    // the user belongs to
                    while (count < groupElements.length()) {
                        group_names_list +=
                                " " + literal(context, ((String) groupElements.get(count))) + " ";
                        count++;
                        if (count < groupElements.length()) {
                            group_names_list += ", ";
                        }
                    }
                    sql +=
                            " AND ( available_for_group IS NULL OR available_for_group IN ("
                                    + group_names_list + ") ) ";
                }
            }
            // END: show only the arrangements the user can reserve
            
            // BEGIN: if date_start is not null and not exists these groups in
            // User.groups show only the arrangement where the user enforces the
            // required time to do the reservation
            
            // PC KB 3021918
            if (!reservation.getJSONArray("date_start").isNull(0)
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                // PC KB 3018035 - For doing time checks we need timezone offset for
                // the arrangement and date, so we'll do this check later now only days check
                // sql += " AND ( (" + formatSqlDaysBetween(context, currentDate, dateStart)
                // + " > announce_days ) " + " OR ( "
                // + formatSqlDaysBetween(context, currentDate, dateStart)
                // + " = announce_days ) " + " AND ("
                // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                // + " < announce_time) " + ") ";
                
                sql +=
                        " AND (" + formatSqlDaysBetween(context, currentDate, dateStart)
                                + " >= announce_days)";
                
                // END PC KB 3018035
                
                // PC KB 3021918
                if (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT")) {
                    
                    String dateLastStart = dateStart;
                    // get the last date of array.
                    if (reservation.getJSONArray("date_start").length() > 1) {
                        dateLastStart =
                                reservation.getJSONArray("date_start").getString(
                                    (reservation.getJSONArray("date_start").length() - 1));
                    }
                    sql +=
                            " AND ( " + formatSqlDaysBetween(context, currentDate, dateLastStart)
                                    + " <= max_days_ahead ) ";
                }
            }
            // END: if date_start is not null and not exis these groups in
            // User.groups show only the arrangement where the user enforces the
            // required time to do the reservation
            
            // BEGIN: If Reservation.time_start is not null and
            // availableforTimeframeOnly=�yes�, check if the time is in the
            // available period
            if (propertyExistsNotNull(reservation, "time_start")
                    && (availableforTimeframeOnly.equals("yes"))) {
                sql +=
                        " AND day_start <= "
                                + formatSqlAddMinutes(context, reservation.getString("time_start"),
                                    "-(rm_arrange.pre_block)") + " ";
            }
            // END: If Reservation.time_start is not null and
            // availableforTimeframeOnly=�yes�, check if the time is in the
            // available period
            
            // BEGIN: If Reservation.time_end is not null and
            // availableforTimeframeOnly=�yes�, check if the time is in the
            // available period
            if (propertyExistsNotNull(reservation, "time_end")
                    && (availableforTimeframeOnly.equals("yes"))) {
                sql +=
                        " AND day_end >= "
                                + formatSqlAddMinutes(context, reservation.getString("time_end"),
                                    "(rm_arrange.post_block)") + " ";
            }
            // END: If Reservation.time_end is not null and
            // availableforTimeframeOnly=�yes�, check if the time is in the
            // available period
            
            // BEGIN: if availableOnly=yes then show only the free room
            // arrangements in the selected date and time
            if (!reservation.getJSONArray("date_start").isNull(0)
                    && propertyExistsNotNull(reservation, "time_start")
                    && propertyExistsNotNull(reservation, "time_end")
                    && availableforTimeframeOnly.equals("yes")) {
                
                // PC KB 3015543
                sql +=
                        " AND NOT EXISTS ( "
                                // kb#3035695:when judge by post_block and pre_block, use attached
                                // rm_arrange of reserve_rm but not main rm_arrange.
                                + " SELECT 1 FROM reserve_rm r, rm_config c, rm_arrange a "
                                + " WHERE status<>'Cancelled' AND status<>'Rejected' "
                                + " AND r.bl_id=c.bl_id AND r.fl_id=c.fl_id AND r.rm_id=c.rm_id AND r.config_id=c.config_id"
                                + " AND c.bl_id=rm_arrange.bl_id AND c.fl_id=rm_arrange.fl_id AND c.rm_id=rm_arrange.rm_id "
                                + " AND a.bl_id=r.bl_id AND a.fl_id=r.fl_id AND a.rm_id=r.rm_id AND a.config_id=r.config_id AND a.rm_arrange_type_id=r.rm_arrange_type_id "
                                + " AND (c.config_id=rm_arrange.config_id OR c.excluded_config like '%'''"
                                + formatSqlConcat(context)
                                + " rm_arrange.config_id "
                                + formatSqlConcat(context)
                                + "'''%') "
                                + " AND date_start IN ("
                                + dateSet
                                + ") AND "
                                + " "
                                + formatSqlAddMinutesToExpression(context, "time_end",
                                    "(a.post_block+a.pre_block)")
                                + " > "
                                + formatSqlIsoToNativeTime(context,
                                    reservation.getString("time_start"))
                                + " AND "
                                + " "
                                + formatSqlAddMinutesToExpression(context, "time_start",
                                    "-(a.pre_block+a.post_block)")
                                + " < "
                                + formatSqlIsoToNativeTime(context,
                                    reservation.getString("time_end")) + " ";
                if (propertyExistsNotNull(roomReservation, "rmres_id")) {
                    sql += " AND rmres_id <> " + roomReservation.getString("rmres_id") + " ";
                }
                sql += " ) ";
            }
            // END: if availableOnly=yes then show only the free room
            // arrangements in the selected date and time
            
            // BEGIN: If Reservation.site_id is not null filter the resulting
            // list to that site.
            if (propertyExistsNotNull(reservation, "site_id")) {
                sql +=
                        " AND rm_arrange.bl_id IN (SELECT distinct bl_id FROM bl WHERE site_id= "
                                + literal(context, (reservation.getString("site_id"))) + ") ";
            }
            // END: If Reservation.site_id is not null filter the resulting list
            // to that site.
            
            // BEGIN: If Reservation.ctry_id is not null filter the resulting
            // list to that country
            if (propertyExistsNotNull(reservation, "ctry_id")) {
                sql +=
                        " AND rm_arrange.bl_id IN (SELECT distinct bl_id FROM bl WHERE ctry_id= "
                                + literal(context, (reservation.getString("ctry_id"))) + ") ";
            }
            // END:If Reservation.ctry_id is not null filter the resulting list
            // to that country
            
            // BEGIN: If [Reservation.group_size] is not null check that the
            // arrangement allow this capacity
            if (propertyExistsNotNull(reservation, "group_size")) {
                sql += " AND max_capacity >= " + ((String) reservation.get("group_size")) + " ";
                // Also if none of the security groups in the [User.groups]
                // array is �RESERVATION SERVICE DESK� or �RESERVATION MANAGER�
                // check the minimum required
                // PC KB 3021918
                if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                        && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                    sql += " AND min_required <= " + ((String) reservation.get("group_size")) + " ";
                }
            }
            // END: If [Reservation.group_size] is not null check that the
            // arrangement allow this capacity
            
            // BEGIN: If [Reservation.ext_guest] is not null and
            // [Reservation.ext_guest] > 0 check that the arrangement allows
            // external visitors
            if (propertyExistsNotNull(reservation, "ext_guest")
                    && (Integer.parseInt((String) reservation.get("ext_guest")) > 0)) {
                sql += " AND external_allowed = 1 ";
            }
            // END: If [Reservation.ext_guest] is not null and
            // [Reservation.ext_guest] > 0 check that the arrangement allows
            // external visitors
            
            // BEGIN: check the required resource standards are allowed in the
            // room arrangement
            if (propertyExistsNotNull(reservation, "resource_stds")) {
                JSONArray resource_stds = new JSONArray();
                try {
                    resource_stds = reservation.getJSONArray("resource_stds");
                } catch (final Throwable e) {
                    resource_stds =
                            reservation.getJSONObject("resource_stds").toJSONArray(
                                reservation.getJSONObject("resource_stds").names());
                }
                if (resource_stds.length() != 0) {
                    String resource_stds_list = " AND ( (res_stds_not_allowed IS NULL) OR ( ";
                    count = 0;
                    while (count < resource_stds.length()) {
                        resource_stds_list +=
                                " ( res_stds_not_allowed NOT LIKE "
                                        + literal(context, "%'" + resource_stds.getString(count)
                                                + "'%") + " ) ";
                        count++;
                        if (count < resource_stds.length()) {
                            resource_stds_list += " AND ";
                        }
                    }
                    resource_stds_list += " ) )";
                    sql += resource_stds_list;
                }
            }
            // END: check the required resource standards are allowed in the
            // room arrangement
            
            // Modified for make roomReservation editable by ZY. 2008-05-22.
            // BEGIN: If RoomReservation.bl_id is not null filter the resulting
            // list to that building
            if (propertyExistsNotNull(reservation, "bl_id")) {
                sql +=
                        " AND rm_arrange.bl_id = "
                                + literal(context, ((String) reservation.get("bl_id"))) + " ";
            }
            // END: If RoomReservation.bl_id is not null filter the resulting
            // list to that building
            
            // BEGIN: If RoomReservation.fl_id is not null filter the resulting
            // list to that floor
            if (propertyExistsNotNull(reservation, "fl_id")) {
                sql +=
                        " AND fl_id = " + literal(context, ((String) reservation.get("fl_id")))
                                + " ";
            }
            // END: If RoomReservation.fl_id is not null filter the resulting
            // list to that floor
            
            // BEGIN: If RoomReservation.rm_id is not null filter the resulting
            // list to that room
            if (propertyExistsNotNull(reservation, "rm_id")) {
                sql +=
                        " AND rm_id = " + literal(context, ((String) reservation.get("rm_id")))
                                + " ";
            }
            // END: If RoomReservation.rm_id is not null filter the resulting
            // list to that room
            
            // BEGIN: If Reservation.arrange_type_id is not null filter the
            // resulting list to that arrangement type:
            if (propertyExistsNotNull(reservation, "rm_arrange_type_id")) {
                sql +=
                        " AND rm_arrange_type_id = "
                                + literal(context, ((String) reservation.get("rm_arrange_type_id")))
                                + " ";
            }
            // END: If Reservation.arrange_type_id is not null filter the
            // resulting list to that arrangement type:
            
            // BEGIN: If Reservation.config_id is not null filter the
            // resulting list to that configuration
            // PC KB 3015543
            if (propertyExistsNotNull(reservation, "config_id")) {
                sql +=
                        " AND config_id = "
                                + literal(context, ((String) reservation.get("config_id"))) + " ";
            }
            // END: If Reservation.config_id is not null filter the
            // resulting list to that configuration
            
            // For an existed room reservation which is edited now, its room
            // arrangement should be
            // also selected from database.
            // Added by ZY 2008-05-23.
            if (propertyExistsNotNull(roomReservation, "rmres_id")) {
                sql += " OR ( ";
                sql +=
                        " rm_arrange.bl_id="
                                + literal(context, ((String) roomReservation.get("bl_id")));
                sql += " AND fl_id=" + literal(context, ((String) roomReservation.get("fl_id")));
                sql += " AND rm_id=" + literal(context, ((String) roomReservation.get("rm_id")));
                sql +=
                        " AND rm_arrange_type_id="
                                + literal(context,
                                    ((String) roomReservation.get("rm_arrange_type_id")));
                // PC KB 3015543
                sql +=
                        " AND config_id="
                                + literal(context, ((String) roomReservation.get("config_id")));
                sql += " ) ";
            }
            // End for existed room reservation.
            
            sql += " ORDER BY num_fixed_res desc, is_default desc, max_capacity asc ";
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+": 1o select created
            // "+sql);
            
            // BEGIN: Search the existing reservations for each room arrangement
            final List listRmArrange = retrieveDbRecords(context, sql);
            
            // Initialize the timeline
            // BEGIN: init timeline, created timeline mark
            int timelineStartHour = 8;
            int timelineEndHour = 20;
            int minorSegments = 6;
            
            // Get time start and end values
            // Supported values are 0-24 integer as hour, or a formatted time
            // value that we can pull the hour out of
            final Integer nStartHour =
                    getTimelineHourParam(context, ACTIVITY_ID, "TimelineStartTime");
            if (nStartHour != null) {
                timelineStartHour = nStartHour.intValue();
            }
            final Integer nEndHour = getTimelineHourParam(context, ACTIVITY_ID, "TimelineEndTime");
            if (nEndHour != null) {
                timelineEndHour = nEndHour.intValue();
            }
            
            // Error checking on start and end time parameters
            timelineStartHour = Math.max(0, timelineStartHour);
            timelineEndHour = Math.min(24, timelineEndHour);
            timelineStartHour = Math.min(timelineStartHour, timelineEndHour);
            timelineEndHour = Math.max(timelineStartHour, timelineEndHour);
            
            // Number of segments each hour is broken into - these will be
            // separated by minor timemarks
            final Integer minutesTimeUnit =
                    getActivityParameterInt(context, ACTIVITY_ID, "MinutesTimeUnit");
            if (minutesTimeUnit != null) {
                // find out how many minor timemarks to generate per hour
                final int interval = minutesTimeUnit.intValue();
                // Valid intervals are between 1 and 30 - don't generate minor
                // marks outside that range
                if (interval > 0 && interval <= 30) {
                    // Number of minor marks is closest integer
                    minorSegments = 60 / interval;
                }
            }
            timeline.put("minorToMajorRatio", minorSegments);
            
            retrieveTimemarks(context, timeline, timelineStartHour, timelineEndHour, minorSegments);
            
            final int MaxTimemarksColumn = ((JSONArray) timeline.get("timemarks")).length();
            // END: init timeline, created timeline mark
            
            if (!listRmArrange.isEmpty()) {
                
                // BEGIN: create timeline resources object (reservations)
                final Iterator rmArrange = listRmArrange.iterator();
                count = 0;
                final JSONArray resources = new JSONArray();
                final JSONArray events = new JSONArray();
                
                boolean mustaddarrange;
                
                while (rmArrange.hasNext()) {
                    final Map records = (Map) rmArrange.next();
                    
                    // PC KB 3018035 Not all arrangements in the results must be added to the
                    // timeline. If it's a simple user we need to check that the arrangement
                    // enforces the time check taking into account the timezone offset
                    mustaddarrange = true;
                    
                    // PC KB 3021918
                    if (!reservation.getJSONArray("date_start").isNull(0)
                            && (!ContextStore.get().getUser()
                                .isMemberOfGroup("RESERVATION SERVICE DESK"))
                            && (!ContextStore.get().getUser()
                                .isMemberOfGroup("RESERVATION MANAGER"))) {
                        
                        final int daystodatestart =
                                getIntegerValue(context, records.get("daystodatestart")).intValue();
                        final int announce_days =
                                getIntegerValue(context, records.get("announce_days")).intValue();
                        
                        if (daystodatestart == announce_days) {
                            // PC KB 3018035 - We need to use timezone offset for doing times check
                            final String cityTimezone = getString(records, "timezone_id");
                            final int finaloffset =
                                    getTotalMinutesOffset(context, cityTimezone,
                                        getDateValue(context, dateStart));
                            
                            final Time announcetime =
                                    getTimeValue(context, records.get("announce_time"));
                            final Date announcedatetime =
                                    new Date(new Date().getYear(), new Date().getMonth(),
                                        new Date().getDate(), announcetime.getHours(),
                                        announcetime.getMinutes(), announcetime.getSeconds());
                            long time = announcedatetime.getTime();
                            time += (finaloffset * 60 * 1000);
                            announcedatetime.setTime(time);
                            
                            final Date currentdatetime = new Date();
                            
                            if (!(currentdatetime.getTime() < announcedatetime.getTime())) {
                                mustaddarrange = false;
                            }
                        }
                    }
                    
                    if (mustaddarrange) {
                        // Here call a function to generate a timeline row based on
                        // one room arrangement. Refactor by ZY 2008-05-23.
                        generateTimelineArrangementRow(resources, events, count, context, records,
                            reservation, roomReservation, dateSet, minorSegments,
                            timelineStartHour, MaxTimemarksColumn);
                        
                        count++;
                    }
                }
                // END: create timeline resources
                
                timeline.put("events", events);
                timeline.put("resources", resources);
                
                allOk = true;
                
                // If there are not free arrangements
            } else {
                timeline.put("resources", new JSONObject());
                timeline.put("events", new JSONObject());
            }
            // END: search the existing reservations for each row
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception. Failed sql: "
                    + sql, errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage2);
        } else {
            context.addResponseParameter("message", "OK");
        }
        
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + ": Expression: " + timeline.toString());
        context.addResponseParameter("jsonExpression", timeline.toString());
        
    }
    
    /**
     * This method is extracted from method loadtimeline. Its function is to generate a timeline row
     * and its contained timeline events, by using one room arrangement record.
     * 
     * @param context Event handler context.
     * @param resources Array of Timeline row
     * @param events Array of Timeline event
     * @param records room arrangement record
     * @param count current row's number
     */
    private void generateTimelineArrangementRow(final JSONArray resources, final JSONArray events,
            final int count, final EventHandlerContext context, final Map records,
            final JSONObject reservation, final JSONObject roomReservation, final String dateSet,
            final int minorSegments, final int timelineStartHour, final int MaxTimemarksColumn) {
        final String bl_id = getString(records, "bl_id");
        final String fl_id = getString(records, "fl_id");
        final String rm_id = getString(records, "rm_id");
        final String configId = getString(records, "config_id");
        final String typeId = getString(records, "rm_arrange_type_id");
        final Time timeDayStart = getTimeValue(context, records.get("day_start"));
        final Time timeDayEnd = getTimeValue(context, records.get("day_end"));
        final String approval = getString(records, "approval");
        final String numFixedRes = getString(records, "num_fixed_res");
        final String isDefault = getString(records, "is_default");
        final String maxCapacity = getString(records, "max_capacity");
        
        String record = new String("<record");
        record += " rm.bl_id='" + bl_id + "'";
        record += " rm.fl_id='" + fl_id + "'";
        record += " rm.rm_id='" + rm_id + "'";
        record += " />";
        
        final int preBlockTimeslots =
                getRmArrangeBlockTimeslots(context, bl_id, fl_id, rm_id, configId, typeId,
                    "pre_block", minorSegments);
        final int postBlockTimeslots =
                getRmArrangeBlockTimeslots(context, bl_id, fl_id, rm_id, configId, typeId,
                    "post_block", minorSegments);
        
        final int columnAvailableFrom =
                getTimeColumn(timelineStartHour, minorSegments, timeDayStart, MaxTimemarksColumn);
        final int columnAvailableTo =
                getTimeColumn(timelineStartHour, minorSegments, timeDayEnd, MaxTimemarksColumn);
        
        final JSONObject resource = new JSONObject();
        resource.put("row", count);
        resource.put("resourceId", record);
        resource.put("room", bl_id + ":" + fl_id + ":" + rm_id);
        resource.put("roomConfiguration", configId);
        resource.put("roomArrangement", typeId);
        resource.put("preBlockTimeslots", preBlockTimeslots);
        resource.put("postBlockTimeslots", postBlockTimeslots);
        resource.put("columnAvailableFrom", columnAvailableFrom);
        resource.put("columnAvailableTo", columnAvailableTo);
        resource.put("approval", approval);
        resource.put("isDefault", isDefault);
        resource.put("criteria", typeId + " | " + maxCapacity + " | " + numFixedRes);
        resources.put(resource);
        
        // Here call a function to generate timeline events of a timeline row.
        // Refactor by ZY 2008-05-23.
        generateEventsForTimelineRows(events, count, context, records, reservation,
            roomReservation, dateSet, minorSegments, timelineStartHour, MaxTimemarksColumn, bl_id,
            fl_id, rm_id, configId, timeDayStart, timeDayEnd);
        // END: create timeline events
    }
    
    /**
     * This method is extracted from method loadtimeline. Its function is to generate timeline
     * events for a timeline row(room arrangement record).
     * 
     * @param context Event handler context.
     * @param events Array of Timeline event
     * @param records room arrangement record
     * @param count current row's number
     */
    private void generateEventsForTimelineRows(final JSONArray events, final int count,
            final EventHandlerContext context, final Map records, final JSONObject reservation,
            final JSONObject roomReservation, final String dateSet, final int minorSegments,
            final int timelineStartHour, final int MaxTimemarksColumn, final String bl_id,
            final String fl_id, final String rm_id, final String configId, final Time timeDayStart,
            final Time timeDayEnd) {
        String sql = "";
        int preBlockTimeslots;
        int postBlockTimeslots;
        // BEGIN: create timeline events
        // PC KB 3015543
        sql =
                " SELECT r.bl_id,r.config_id,r.fl_id,r.res_id,r.rm_arrange_type_id,r.rm_id,r.time_end,r.time_start "
                        + " FROM reserve_rm r, rm_config c "
                        + " WHERE r.bl_id=c.bl_id AND r.fl_id=c.fl_id AND r.rm_id=c.rm_id AND r.config_id=c.config_id "
                        + " AND status <> 'Cancelled' AND status <> 'Rejected' "
                        + " AND r.bl_id="
                        + literal(context, bl_id)
                        + " AND r.fl_id="
                        + literal(context, fl_id)
                        + " AND r.rm_id="
                        + literal(context, rm_id)
                        + " AND (c.config_id="
                        + literal(context, configId)
                        + " OR c.excluded_config LIKE '%'''"
                        + formatSqlConcat(context)
                        + literal(context, configId)
                        + formatSqlConcat(context) + " '''%') ";
        
        if (propertyExistsNotNull(reservation, "date_start")) {
            sql += " AND date_start IN (" + dateSet + ") ";
        }
        
        final int preblockTime = getIntegerValue(context, records.get("pre_block")).intValue();
        final int postblockTime = getIntegerValue(context, records.get("post_block")).intValue();
        
        if (timeDayStart != null) {
            sql +=
                    " AND time_end > "
                            + formatSqlAddMinutes(context, timeDayStart.toString(),
                                Integer.toString(-postblockTime));
        }
        
        if (timeDayEnd != null) {
            sql +=
                    " AND time_start < "
                            + formatSqlAddMinutes(context, timeDayEnd.toString(),
                                Integer.toString(preblockTime));
        }
        
        // Comment below three lines for making roomReservation
        // editable in timeline. Added by Zy 2008-05-22.
        if (propertyExistsNotNull(roomReservation, "rmres_id")) {
            sql += " AND rmres_id <> " + ((String) roomReservation.get("rmres_id")) + " ";
        }
        
        sql += " ORDER BY time_start, time_end ";
        
        final List eventResources = retrieveDbRecords(context, sql);
        
        // If there are reservations for the arrangement
        if (!eventResources.isEmpty()) {
            
            // format reservation record as XML and add it to the
            // response XML DOM
            for (final Iterator it = eventResources.iterator(); it.hasNext();) {
                final Map values = (Map) it.next();
                final String resId = getString(values, "res_id");
                final JSONObject event = new JSONObject();
                event.put("eventId", resId);
                event.put("resourceRow", count);
                event.put(
                    "columnStart",
                    getTimeColumn(timelineStartHour, minorSegments,
                        getTimeValue(context, values.get("time_start")), MaxTimemarksColumn));
                event.put(
                    "columnEnd",
                    getTimeColumn(timelineStartHour, minorSegments,
                        getTimeValue(context, values.get("time_end")), MaxTimemarksColumn) - 1);
                // Search for the preblock and postblock timeslots
                // associated to the reserved arrangement
                preBlockTimeslots =
                        getRmArrangeBlockTimeslots(context, getString(values, "bl_id"),
                            getString(values, "fl_id"), getString(values, "rm_id"),
                            getString(values, "config_id"),
                            getString(values, "rm_arrange_type_id"), "pre_block", minorSegments);
                postBlockTimeslots =
                        getRmArrangeBlockTimeslots(context, getString(values, "bl_id"),
                            getString(values, "fl_id"), getString(values, "rm_id"),
                            getString(values, "config_id"),
                            getString(values, "rm_arrange_type_id"), "post_block", minorSegments);
                event.put("preBlockTimeslots", preBlockTimeslots);
                event.put("postBlockTimeslots", postBlockTimeslots);
                event.put("status", 0);
                events.put(event);
            }
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END loadTimeline wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN addRoomReservation wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * gets the JavaScript objects with general selected information, the room arrangement and time
     * periods selected, and the other details needed. Inputs: RoomReservation RoomReservation
     * JSONObject; Reservation Reservation JSONObject; User User JSONObject; notify String values:
     * 'yes','no' Outputs: jsonExpression JSON string containing reservation and roomReservation
     * info.
     * 
     * @param context Event handler context.
     */
    public void addRoomReservation(final String jsonReservation, final String notify) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "addRoomReservation";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input parameters
        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [jsonExpression input]:
        // "+jsonExpression+" ");
        String sql = "";
        String res_id = "";
        String rmres_id = "";
        boolean allOk = false;
        // Generate the ouput parameter array
        final JSONArray jsonResult = new JSONArray();
        String parentId = "0";
        // Used to check in recurrent reservations, if an instance has changed
        // it's date and send original date and times to the sendEmailInvitations WFR
        String original_date = null;
        String original_time_start = null;
        String original_time_end = null;
        String original_cityTimezone = null;
        // Used to indicate is we're updating a reservation or creating a new
        // one
        String invitation_type = "";
        
        // addRoomReservation rule error message
        String errMessage =
                localizeMessage(context, ACTIVITY_ID, "ADDROOMRESERVATION_WFR",
                    "TIMEPERIODNOTAVAILABLE", null);
        
        try {
            
            // BEGIN: get input json expression
            final JSONArray objectsToSave = new JSONArray("" + jsonReservation + ")");
            final JSONObject user = objectsToSave.getJSONObject(0);
            final JSONObject reservation = objectsToSave.getJSONObject(1);
            final JSONObject roomReservation = objectsToSave.getJSONObject(2);
            final JSONArray resourceReservations = objectsToSave.getJSONArray(3);
            final JSONArray roomConflicts = objectsToSave.getJSONArray(4);
            final JSONArray resourceConflicts = objectsToSave.getJSONArray(5);
            // END: get input json exresion
            
            // In case we are editing a room reservation with linked resources,
            // we have to process possible resourceConflicts in the resourceReservations list.
            processResourceReservations(resourceReservations, resourceConflicts);
            
            for (int cnt = 0; cnt < reservation.getJSONArray("date_start").length(); cnt++) {
                res_id = "";
                rmres_id = "";
                final JSONObject rritem = new JSONObject(roomReservation.toString());
                
                rritem.put("date_start", reservation.getJSONArray("date_start").getString(cnt));
                
                // BEGIN: check date in confict list Modified by ZY, 2008-06-13.
                int pos = -1;
                for (int i = 0; i < roomConflicts.length(); i++) {
                    if (roomConflicts.getJSONObject(i).getString("date_start")
                        .equals(rritem.getString("date_start"))) {
                        pos = i;
                    }
                }
                
                if ((pos != -1)
                        && (roomConflicts.getJSONObject(pos).getString("status")
                            .equalsIgnoreCase("deleted"))) {
                    continue;
                }
                // END: check date in confict list
                
                // BEGIN: addRoomReservation code
                
                // BEGIN: is the room occupied?
                sql =
                        " SELECT 1 FROM rm_arrange WHERE reservable=1 " + " AND bl_id="
                                + literal(context, rritem.getString("bl_id")) + " " + " AND fl_id="
                                + literal(context, rritem.getString("fl_id")) + " " + " AND rm_id="
                                + literal(context, rritem.getString("rm_id")) + " "
                                + " AND config_id="
                                + literal(context, rritem.getString("config_id")) + " "
                                + " AND rm_arrange_type_id="
                                + literal(context, rritem.getString("rm_arrange_type_id")) + " "
                                + " AND EXISTS (SELECT 1 FROM rm " + " WHERE rm.bl_id="
                                + literal(context, rritem.getString("bl_id")) + " "
                                + " AND rm.fl_id=" + literal(context, rritem.getString("fl_id"))
                                + " " + " AND rm.rm_id="
                                + literal(context, rritem.getString("rm_id")) + " "
                                + " AND rm.reservable=1) ";
                
                if (propertyExistsNotNull(rritem, "date_start")
                        && propertyExistsNotNull(rritem, "time_start")
                        && propertyExistsNotNull(rritem, "time_end")) {
                    
                    // PC KB 3015543
                    sql +=
                            " AND NOT EXISTS ( "
                                    + " SELECT 1 FROM reserve_rm r, rm_config c "
                                    + " WHERE status<>'Cancelled' "
                                    + " AND status<>'Rejected' "
                                    + " AND r.bl_id=c.bl_id AND r.fl_id=c.fl_id  AND r.rm_id=c.rm_id AND r.config_id=c.config_id "
                                    + " AND c.bl_id=rm_arrange.bl_id "
                                    + " AND c.fl_id=rm_arrange.fl_id "
                                    + " AND c.rm_id=rm_arrange.rm_id "
                                    + " AND (c.config_id=rm_arrange.config_id OR c.excluded_config like '%''' "
                                    + formatSqlConcat(context)
                                    + " rm_arrange.config_id "
                                    + formatSqlConcat(context)
                                    + " '''%')"
                                    + " AND date_start="
                                    + formatSqlIsoToNativeDate(context,
                                        rritem.getString("date_start"))
                                    + " "
                                    + " AND "
                                    + formatSqlAddMinutesToExpression(context, "time_end",
                                        "(rm_arrange.post_block+rm_arrange.pre_block)")
                                    + " > "
                                    + formatSqlIsoToNativeTime(context,
                                        rritem.getString("time_start"))
                                    + " "
                                    + " AND "
                                    + formatSqlAddMinutesToExpression(context, "time_start",
                                        "-(rm_arrange.pre_block+rm_arrange.post_block)")
                                    + " < "
                                    + formatSqlIsoToNativeTime(context,
                                        rritem.getString("time_end")) + " ";
                    
                    if (!rritem.getString("rmres_id").equals("")) {
                        sql += "  AND rmres_id <> " + rritem.getString("rmres_id") + " ";
                    }
                    sql += " ) ";
                }
                
                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 1]: "+sql);
                // END: is the room occupied?
                
                final List recordsSql1 = retrieveDbRecords(context, sql);
                
                // If the selected room arrangement is free
                if (!recordsSql1.isEmpty()) {
                    
                    // BEGIN: the arrangement can be reservabled in this period
                    sql =
                            " SELECT approval, cost_unit, cost_per_unit, cost_per_unit_ext "
                                    + " FROM rm_arrange " + " WHERE reservable=1 " + " AND bl_id="
                                    + literal(context, rritem.getString("bl_id")) + " "
                                    + " AND fl_id=" + literal(context, rritem.getString("fl_id"))
                                    + " " + " AND rm_id="
                                    + literal(context, rritem.getString("rm_id")) + " "
                                    + " AND config_id="
                                    + literal(context, rritem.getString("config_id")) + " "
                                    + " AND rm_arrange_type_id="
                                    + literal(context, rritem.getString("rm_arrange_type_id"))
                                    + " ";
                    
                    try {
                        user.put("groups", user.getJSONArray("groups"));
                    } catch (final Throwable e) {
                        user.put(
                            "groups",
                            user.getJSONObject("groups").toJSONArray(
                                user.getJSONObject("groups").names()));
                    }
                    // If rritem.date_start is not null, and none of the
                    // security groups in the User.groups array
                    // is �RESERVATION SERVICE DESK� or � RESERVATION MANAGER�,
                    // check if the user enforces the
                    // required times for doing the reservation
                    // PC KB 3021918
                    if (propertyExistsNotNull(rritem, "date_start")
                            && (!ContextStore.get().getUser()
                                .isMemberOfGroup("RESERVATION SERVICE DESK"))
                            && (!ContextStore.get().getUser()
                                .isMemberOfGroup("RESERVATION MANAGER"))) {
                        
                        // PC KB 3018035 - Get also the city timezone to check the GMT offset
                        String sqlTimezone = "";
                        String cityTimezone = "";
                        
                        sqlTimezone =
                                " SELECT city.timezone_id FROM bl LEFT OUTER JOIN city "
                                        + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                        + " WHERE bl_id = "
                                        + literal(context, rritem.getString("bl_id"));
                        
                        int finaloffset = 0;
                        
                        final List listTimezone = retrieveDbRecords(context, sqlTimezone);
                        
                        if (!listTimezone.isEmpty()) {
                            final Map recordTimezone = (Map) listTimezone.get(0);
                            cityTimezone = getString(recordTimezone, "timezone_id");
                            finaloffset =
                                    getTotalMinutesOffset(context, cityTimezone,
                                        getDateValue(context, rritem.getString("date_start")));
                        }
                        
                        final String currentDate = "CurrentDateTime";
                        final String dateStart = rritem.getString("date_start");
                        
                        sql +=
                                " AND ( ( "
                                        + formatSqlDaysBetween(context, currentDate, dateStart)
                                        + " > announce_days ) "
                                        + " OR ( "
                                        + formatSqlDaysBetween(context, currentDate, dateStart)
                                        + " = announce_days ) "
                                        + " AND ( "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + " < "
                                        + formatSqlAddMinutesToExpression(context, "announce_time",
                                            Integer.toString(finaloffset)) + ") " + ") ";
                        
                        // Also if none of the security groups in the
                        // User.groups array is �RESERVATION ASSISTANT�,
                        // check another additional days restriction
                        // PC KB 3021918
                        if (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT")) {
                            sql +=
                                    " AND ( "
                                            + formatSqlDaysBetween(context, currentDate, dateStart)
                                            + " <= max_days_ahead ) ";
                        }
                        
                        // KB 3018035 Also check that reservation doesn't occur in the past
                        final Date reservationdate =
                                getDateValue(context, rritem.getString("date_start"));
                        final Time reservationtime =
                                getTimeFromString(rritem.getString("time_start"));
                        final Date reservationdatetime =
                                new Date(reservationdate.getYear(), reservationdate.getMonth(),
                                    reservationdate.getDate(), reservationtime.getHours(),
                                    reservationtime.getMinutes(), reservationtime.getSeconds());
                        long time = reservationdatetime.getTime();
                        time += (finaloffset * 60 * 1000);
                        reservationdatetime.setTime(time);
                        
                        final Date currentdatetime = new Date();
                        
                        if (!(currentdatetime.getTime() < reservationdatetime.getTime())) {
                            // Change the error message to give a more detailed information on the
                            // cause
                            errMessage =
                                    localizeMessage(context, ACTIVITY_ID, "ADDROOMRESERVATION_WFR",
                                        "TIMEPERIODINPAST", null);
                            // PC Don't create room reservations, wr and send notifications.
                            // Rollback transaction to remove the reservations already
                            // created in the proccess before the error
                            allOk = false;
                            executeDbRollback(context);
                            break;
                        }
                        
                    }
                    
                    if (propertyExistsNotNull(rritem, "time_start")) {
                        sql +=
                                " AND day_start <= "
                                        + formatSqlAddMinutes(context,
                                            rritem.getString("time_start"),
                                            "-(rm_arrange.pre_block)") + " ";
                    }
                    
                    if (propertyExistsNotNull(rritem, "time_end")) {
                        sql +=
                                " AND day_end >= "
                                        + formatSqlAddMinutes(context,
                                            rritem.getString("time_end"), "(rm_arrange.post_block)")
                                        + " ";
                    }
                    
                    // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 2]:
                    // "+sql);
                    // END: the arrangement can be reservabled in this period
                    
                    // Get the cost and information related to the reservation
                    // to create
                    final List recordsSql2 = retrieveDbRecords(context, sql);
                    
                    if (!recordsSql2.isEmpty()) {
                        
                        // Begin : after verifying the room reservation(s), we might have to check
                        // resource reservations.
                        boolean resourcesAvaiable = true;
                        for (int i = 0; i < resourceReservations.length(); i++) {
                            final JSONObject resourceReservation =
                                    resourceReservations.getJSONObject(i);
                            if (!checkResourceAvailability(context, resourceReservation)) {
                                resourcesAvaiable = false;
                                // Change addRoomReservation rule error message when resource
                                // unavailable. Added by ZY, 2008-07-29.
                                errMessage =
                                        localizeMessage(context, ACTIVITY_ID,
                                            "ADDROOMRESERVATION_WFR", "RESOURCEUNAVAILABLE", null);
                                break;
                            }
                            
                        }
                        if (!resourcesAvaiable) {
                            // PC Don't create room reservations, wr and send notifications.
                            // Rollback transaction to remove the reservations already
                            // created in the proccess before the error
                            allOk = false;
                            executeDbRollback(context);
                            break;
                            // End check resource reservations.
                        }
                        
                        // BEGIN: calculate the cost
                        final Map recordOfSql2 = (Map) recordsSql2.get(0);
                        final Integer approval =
                                getIntegerValue(context, recordOfSql2.get("approval"));
                        
                        // Add approval property to current room reservation, because this is needed
                        // in method writeResourceReservationsToDB().
                        // By ZY, 2008-06-24.
                        rritem.put("approval", approval);
                        
                        final int cost_unit =
                                getIntegerValue(context, recordOfSql2.get("cost_unit")).intValue();
                        final BigDecimal cost_per_unit =
                                new BigDecimal(getString(recordOfSql2, "cost_per_unit"));
                        BigDecimal cost_rm_res = new BigDecimal(0.0);
                        final double time_in_minutes =
                                subtractMinutes(context, rritem.getString("time_end"),
                                    rritem.getString("time_start"));
                        final double time_in_hours =
                                subtractHours(context, rritem.getString("time_end"),
                                    rritem.getString("time_start"));
                        
                        switch (cost_unit) {
                            case 0:
                                cost_rm_res = cost_per_unit;
                                break;
                            case 1:
                                cost_rm_res =
                                        cost_per_unit.multiply(new BigDecimal(time_in_minutes));
                                break;
                            case 2:
                                cost_rm_res = cost_per_unit.multiply(new BigDecimal(time_in_hours));
                                break;
                            case 3:
                                cost_rm_res =
                                        cost_per_unit.multiply((new BigDecimal(time_in_hours))
                                            .divide(new BigDecimal(4.0), 0));
                                break;
                            case 4:
                                cost_rm_res = cost_per_unit;
                                break;
                        }
                        
                        // PCS KB item 3015580: Update the reservation object
                        // cost value to use it while adding resources to the
                        // room reservation
                        reservation.put("cost_res", cost_rm_res);
                        // END: calculate the cost
                        
                        if (reservation.getString("res_type").equals("recurring")) {
                            reservation.put("res_id", "");
                        }
                        
                        // BEGIN: If reservation exists, UPDATE reservation
                        if (propertyExistsNotNull(reservation, "res_id")) {
                            
                            Integer reservationApproval = approval;
                            // KB3025189, get approval value if the reservation exists,
                            if ((approval == 0) && propertyExistsNotNull(reservation, "res_id")) {
                                final String reservationId = reservation.getString("res_id");
                                final String queryStatusFromRmRs =
                                        "SELECT DISTINCT status from RESERVE_RM WHERE res_id = "
                                                + literal(context, reservationId)
                                                + " UNION ALL"
                                                + " SELECT DISTINCT status from RESERVE_RS WHERE res_id = "
                                                + literal(context, reservationId);
                                
                                final List statusList =
                                        retrieveDbRecords(context, queryStatusFromRmRs);
                                
                                if (statusList != null && statusList.size() > 0) {
                                    for (int i = 0; i < statusList.size(); i++) {
                                        final String status =
                                                getString((Map) statusList.get(i), "status");
                                        if ("Awaiting App.".equals(status)) {
                                            reservationApproval = 1;
                                            break;
                                        }
                                    }
                                }
                            }
                            rritem.put("approval", reservationApproval);
                            
                            res_id = reservation.getString("res_id");
                            invitation_type = "update";
                            
                            // Check if it's a recurrent reservation, and the
                            // original date has changed. If this is the case,
                            // store the old reservation date, times and city
                            Integer recurring_date_modified = new Integer(0);
                            
                            sql =
                                    " SELECT reserve.date_start,reserve.res_parent,reserve_rm.time_start,reserve_rm.time_end,city.timezone_id "
                                            + " FROM reserve, reserve_rm, bl LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE reserve.res_id="
                                            + res_id
                                            + " AND res_parent IS NOT NULL"
                                            + " AND reserve.res_id=reserve_rm.res_id"
                                            + " AND reserve_rm.bl_id=bl.bl_id";
                            
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // change date]: "+sql);
                            final List recordsSqldate = retrieveDbRecords(context, sql);
                            if (!recordsSqldate.isEmpty()) {
                                final Map recordOfSqldate = (Map) recordsSqldate.get(0);
                                final String sql_date_start =
                                        getDateValue(context, recordOfSqldate.get("date_start"))
                                            .toString();
                                parentId =
                                        getIntegerValue(context, recordOfSqldate.get("res_parent"))
                                            .toString();
                                if (!(rritem.getString("date_start").equals(sql_date_start))) {
                                    recurring_date_modified = new Integer(1);
                                    original_date = sql_date_start;
                                    original_time_start =
                                            getTimeValue(context, recordOfSqldate.get("time_start"))
                                                .toString();
                                    original_time_end =
                                            getTimeValue(context, recordOfSqldate.get("time_end"))
                                                .toString();
                                    original_cityTimezone =
                                            getString(recordOfSqldate, "timezone_id");
                                }
                            }
                            
                            sql =
                                    " UPDATE reserve SET " + " user_created_by = "
                                            + literal(context,
                                                reservation.getString("user_created_by"))
                                            + ", "
                                            + " user_requested_by = "
                                            + literal(context,
                                                reservation.getString("user_requested_by"))
                                            + ", "
                                            + " user_requested_for = "
                                            + literal(context,
                                                reservation.getString("user_requested_for"))
                                            + ", "
                                            + " user_last_modified_by = "
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + ", "
                                            + " cost_res = "
                                            + cost_rm_res
                                            + ", "
                                            + " date_last_modified = "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ", "
                                            + " dv_id = "
                                            + literal(context, reservation.getString("dv_id"))
                                            + ", "
                                            + " dp_id = "
                                            + literal(context, reservation.getString("dp_id"))
                                            + ", "
                                            + " phone = "
                                            + literal(context, reservation.getString("phone"))
                                            + ", "
                                            + " email = "
                                            + literal(context, reservation.getString("email"))
                                            + ", "
                                            + " reservation_name = "
                                            + literal(context,
                                                reservation.getString("reservation_name"))
                                            + ", "
                                            + " comments = "
                                            + literal(context, reservation.getString("comments"))
                                            + ", "
                                            + " date_start = "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " date_end = "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " time_start = "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + ", "
                                            + " time_end = "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + ", "
                                            + " status = "
                                            + ((reservationApproval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'") + ", " + " attendees = "
                                            + literal(context, reservation.getString("attendees"));
                            if (recurring_date_modified.intValue() == 1) {
                                sql += ", " + " recurring_date_modified = 1";
                            }
                            sql += " WHERE reserve.res_id=" + reservation.getString("res_id");
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                        }
                        // END: If reservation exists, UPDATE reservation
                        
                        // BEGIN: If reservation doesn't exist, INSERT
                        // reservation
                        else {
                            
                            invitation_type = "new";
                            
                            sql =
                                    " INSERT INTO reserve "
                                            + " (recurring_rule,res_type,user_created_by,user_requested_by,user_requested_for, "
                                            + " user_last_modified_by,cost_res,date_created,dv_id,dp_id,phone, "
                                            + " email,reservation_name,comments,date_start,date_end,time_start, "
                                            + " time_end,status,attendees,recurring_date_modified) "
                                            + " VALUES " + " ( " + " "
                                            + literal(context,
                                                reservation.getString("recurring_rule"))
                                            + ", "
                                            + " "
                                            + literal(context, reservation.getString("res_type"))
                                            + ", "
                                            + " "
                                            + literal(context,
                                                reservation.getString("user_created_by"))
                                            + ", "
                                            + " "
                                            + literal(context,
                                                reservation.getString("user_requested_by"))
                                            + ", "
                                            + " "
                                            + literal(context,
                                                reservation.getString("user_requested_for"))
                                            + ", "
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + ","
                                            + cost_rm_res
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ","
                                            + " "
                                            + literal(context, reservation.getString("dv_id"))
                                            + ","
                                            + literal(context, reservation.getString("dp_id"))
                                            + ", "
                                            + " "
                                            + literal(context, reservation.getString("phone"))
                                            + ","
                                            + literal(context, reservation.getString("email"))
                                            + ", "
                                            + " "
                                            + literal(context,
                                                reservation.getString("reservation_name"))
                                            + ", "
                                            + literal(context, reservation.getString("comments"))
                                            + ","
                                            + " "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + ", "
                                            + ((approval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'")
                                            + ","
                                            + literal(context, reservation.getString("attendees"))
                                            + ",0" + " ) ";
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                        }
                        // END: If reservation doesn't exist, INSERT reservation
                        
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 3]:
                        // "+sql);
                        
                        // BEGIN: Retrieve the created res_id from the database
                        if (res_id.equals("")) {
                            sql = " SELECT MAX(res_id) as max_res_id FROM reserve ";
                            
                            // Added By Keven 2008-07-11 by spec rx46
                            sql +=
                                    " WHERE res_type = "
                                            + literal(context, reservation.getString("res_type"));
                            if (propertyExistsNotNull(reservation, "recurring_rule")) {
                                sql +=
                                        " AND recurring_rule="
                                                + literal(context,
                                                    reservation.getString("recurring_rule"));
                            }
                            if (propertyExistsNotNull(reservation, "dv_id")) {
                                sql +=
                                        " AND dv_id="
                                                + literal(context, reservation.getString("dv_id"));
                            }
                            
                            if (propertyExistsNotNull(reservation, "dp_id")) {
                                sql +=
                                        " AND dp_id="
                                                + literal(context, reservation.getString("dp_id"));
                            }
                            
                            if (propertyExistsNotNull(reservation, "phone")) {
                                sql +=
                                        " AND phone="
                                                + literal(context, reservation.getString("phone"));
                            }
                            
                            if (propertyExistsNotNull(reservation, "email")) {
                                sql +=
                                        " AND email="
                                                + literal(context, reservation.getString("email"));
                            }
                            if (propertyExistsNotNull(reservation, "comments")) {
                                sql +=
                                        " AND comments="
                                                + literal(context,
                                                    reservation.getString("comments"));
                            }
                            sql +=
                                    " AND user_created_by ="
                                            + literal(context,
                                                reservation.getString("user_created_by"))
                                            + " AND user_requested_by = "
                                            + literal(context,
                                                reservation.getString("user_requested_by"))
                                            + " AND user_requested_for = "
                                            + literal(context,
                                                reservation.getString("user_requested_for"))
                                            + " AND user_last_modified_by ="
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + " AND cost_res ="
                                            + cost_rm_res
                                            + " AND date_created= "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            // kb# 3019499 Removed by Keven
                                            // + " AND reservation_name= "
                                            // + literal(context,
                                            // reservation.getString("reservation_name"))
                                            + " AND date_start="
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + " AND date_end= "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + " AND time_start= "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + " AND time_end = "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + " AND status= "
                                            + ((approval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'");
                            // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "'[sql 3.1]: " +
                            // sql);
                            final List recordsSql3 = retrieveDbRecords(context, sql);
                            if (!recordsSql3.isEmpty()) {
                                final Map recordOfSql3 = (Map) recordsSql3.get(0);
                                res_id = getString(recordOfSql3, "max_res_id");
                                if (parentId.equals("0")) {
                                    parentId = res_id;
                                }
                                if (reservation.getString("res_type").equals("recurring")) {
                                    sql =
                                            " UPDATE reserve " + " SET res_parent = "
                                                    + literal(context, parentId) + " "
                                                    + " WHERE res_id = " + literal(context, res_id);
                                    // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"'
                                    // [sql 3.1.1]: "+sql);
                                    try {
                                        executeDbSql(context, sql, false);
                                    } catch (final Throwable e) {
                                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                                + ": Failed sql: " + sql, errMessage, e);
                                    }
                                }
                            }
                        }
                        // END: Retrieve the created res_id from the database
                        
                        // BEGIN: if reservations.res_id and
                        // roomReservations.rmres_id is not null It updates the
                        // existing database room reservation
                        if (propertyExistsNotNull(reservation, "res_id")
                                && propertyExistsNotNull(rritem, "rmres_id")) {
                            
                            rmres_id = rritem.getString("rmres_id");
                            
                            sql =
                                    " UPDATE reserve_rm SET " + " res_id = "
                                            + literal(context, reservation.getString("res_id"))
                                            + ", "
                                            + " guests_internal = ("
                                            + reservation.getString("group_size")
                                            + " - "
                                            + reservation.getString("ext_guest")
                                            + "), "
                                            + " guests_external = "
                                            + reservation.getString("ext_guest")
                                            + ", "
                                            + " comments = "
                                            + literal(context, rritem.getString("comments"))
                                            + ", "
                                            + " date_start = "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " time_start = "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + ", "
                                            + " time_end = "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + ", "
                                            + " cost_rmres = "
                                            + cost_rm_res
                                            + ", "
                                            + " user_last_modified_by = "
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + ", "
                                            + " date_last_modified = "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ", "
                                            + " bl_id = "
                                            + literal(context, rritem.getString("bl_id"))
                                            + ", "
                                            + " fl_id = "
                                            + literal(context, rritem.getString("fl_id"))
                                            + ", "
                                            + " rm_id = "
                                            + literal(context, rritem.getString("rm_id"))
                                            + ", "
                                            + " config_id = "
                                            + literal(context, rritem.getString("config_id"))
                                            + ", "
                                            + " rm_arrange_type_id = "
                                            + literal(context,
                                                rritem.getString("rm_arrange_type_id"))
                                            + ", "
                                            + " status = "
                                            + ((approval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'")
                                            + " WHERE reserve_rm.rmres_id="
                                            + rritem.getString("rmres_id") + " ";
                            
                            try {
                                executeDbSql(context, sql, false);
                                allOk = true;
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 4.1]: "+sql);
                        }
                        // END: if reservations.res_id and
                        // roomREservations.rmres_id is not null It updates the
                        // existing database room reservation
                        
                        // BEGIN: if reservations.res_id and
                        // roomREservations.rmres_id is null It updates the
                        // existing database room reservation
                        if (!propertyExistsNotNull(roomReservation, "res_id")
                                && !propertyExistsNotNull(rritem, "rmres_id")) {
                            
                            sql =
                                    " INSERT INTO reserve_rm "
                                            + " (res_id,guests_internal,guests_external,comments,date_start,time_start,time_end,cost_rmres,user_last_modified_by, "
                                            + " date_last_modified,date_created,bl_id,fl_id,rm_id,config_id,rm_arrange_type_id,status) "
                                            + " VALUES " + " ("
                                            + literal(context, res_id)
                                            + ", "
                                            + " ("
                                            + reservation.getString("group_size")
                                            + " - "
                                            + reservation.getString("ext_guest")
                                            + "), "
                                            + " "
                                            + reservation.getString("ext_guest")
                                            + ", "
                                            + " "
                                            + literal(context, rritem.getString("comments"))
                                            + ","
                                            + " "
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + ","
                                            + cost_rm_res
                                            + ","
                                            + " "
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + ", "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ","
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ","
                                            + literal(context, rritem.getString("bl_id"))
                                            + ", "
                                            + " "
                                            + literal(context, rritem.getString("fl_id"))
                                            + ", "
                                            + literal(context, rritem.getString("rm_id"))
                                            + ", "
                                            + " "
                                            + literal(context, rritem.getString("config_id"))
                                            + ", "
                                            + " "
                                            + literal(context,
                                                rritem.getString("rm_arrange_type_id"))
                                            + ", "
                                            + " "
                                            + ((approval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'") + " ) ";
                            
                            try {
                                executeDbSql(context, sql, false);
                                allOk = true;
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 4.2]: "+sql);
                        }
                        // END: if reservations.res_id and
                        // roomREservations.rmres_id is null It updates the
                        // existing database room reservation
                        
                        // Do the commit to ensure the notification and work
                        // request WFR takes the updated or generated
                        // information
                        if (allOk) {
                            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                            // executeDbCommit(context);
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 4.X.1]: do commit");
                        }
                        
                        // BEGIN: Retrieve the created rmres_id from the
                        // database
                        if (rmres_id.equals("")) {
                            sql = " SELECT MAX(rmres_id) as max_rmres_id FROM reserve_rm ";
                            // Added by Keven 2008-07-11 by spec rx46
                            sql +=
                                    " WHERE date_start="
                                            + formatSqlIsoToNativeDate(context,
                                                rritem.getString("date_start"))
                                            + " AND time_start= "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_start"))
                                            + " AND time_end= "
                                            + formatSqlIsoToNativeTime(context,
                                                rritem.getString("time_end"))
                                            + " AND cost_rmres="
                                            + cost_rm_res
                                            + " AND user_last_modified_by="
                                            + literal(context, user.getJSONObject("Employee")
                                                .getString("em_id"))
                                            + " AND date_last_modified= "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " AND date_created="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " AND bl_id="
                                            + literal(context, rritem.getString("bl_id"))
                                            + " AND fl_id= "
                                            + literal(context, rritem.getString("fl_id"))
                                            + " AND rm_id= "
                                            + literal(context, rritem.getString("rm_id"))
                                            + " AND config_id= "
                                            + literal(context, rritem.getString("config_id"))
                                            + " AND rm_arrange_type_id= "
                                            + literal(context,
                                                rritem.getString("rm_arrange_type_id"))
                                            + " AND status= "
                                            + ((approval.intValue() == 0) ? "'Confirmed'"
                                                    : "'Awaiting App.'") + " AND guests_internal="
                                            + " (" + reservation.getString("group_size") + " - "
                                            + reservation.getString("ext_guest") + ") "
                                            + " AND guests_external="
                                            + reservation.getString("ext_guest");
                            if (propertyExistsNotNull(rritem, "comments")) {
                                sql +=
                                        " AND comments="
                                                + literal(context, rritem.getString("comments"));
                            }
                            
                            final List recordsSql4 = retrieveDbRecords(context, sql);
                            if (!recordsSql4.isEmpty()) {
                                final Map recordOfSql4 = (Map) recordsSql4.get(0);
                                rmres_id = getString(recordOfSql4, "max_rmres_id");
                                rritem.put("rmres_id", rmres_id);
                            }
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 4.X.2]: "+sql);
                        }
                        // END: Retrieve the created rmres_id from the database
                    }
                    
                    // After writing the reservation record(s) and room(s) records, write resource
                    // reservations to the database (if any). Added by ZY 2008-06-16.
                    if (resourceReservations.length() > 0) {
                        writeResourceReservationsToDB(context, reservation, resourceReservations,
                            rritem, RULE_ID, errMessage, res_id);
                    }
                    
                }
                // If the selected room arrangement is NOT free
                else {
                    // PC Don't create wr and send notifications. Rollback transaction to remove
                    // the reservations already created in the proccess before the error
                    allOk = false;
                    executeDbRollback(context);
                    break;
                }
            }
            
            if (allOk) {
                // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                
                // it sets in context the res_id param to next wfr to call
                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [Setting rs_Id]:
                // "+res_id);
                if (reservation.getString("res_type").equals("regular")) {
                    context.addResponseParameter("res_id", res_id);
                    context.addResponseParameter("res_parent", "0");
                } else {
                    context.addResponseParameter("res_id", "0");
                    context.addResponseParameter("res_parent", parentId);
                }
                
                // BEGIN: Create Work Request
                this.createWorkRequest(context);
                // END: Create Work Request
                
                // BEGIN :Create Work Request for resource reservation added by keven by spec
                if (resourceReservations.length() > 0) {
                    final ReservationsResourcesHandler resourceHandler =
                            new ReservationsResourcesHandler();
                    resourceHandler.createResourceWr(context, "0", res_id);
                }
                // END :Create Work Request for resource reservation
                
                final ReservationsCommonHandler handler = new ReservationsCommonHandler();
                // it sets in context the res_id param to next wfr to call
                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [Setting rs_Id]:
                // "+res_id);
                if (reservation.getString("res_type").equals("regular")) {
                    context.addResponseParameter("res_id", res_id);
                    context.addResponseParameter("res_parent", "0");
                } else {
                    context.addResponseParameter("res_id", "0");
                    context.addResponseParameter("res_parent", parentId);
                }
                // String to store the error message from the notification and
                // sendInvitations WFRs
                String notifyErrorMessage = "";
                final String sendEmailNotifications =
                        getActivityParameterString(context, ACTIVITY_ID, "SendEmailNotifications");
                
                // 26/04/2007 Check if the system must send the email
                // notifications
                // 16/05/2007 KB items 3015439, 3015425
                if (sendEmailNotifications != null
                        && sendEmailNotifications.toUpperCase().equals("YES")) {
                    // BEGIN: Notify
                    if (notify.equals("yes")) {
                        handler.notifyRequestedBy(context);
                        if (context.parameterExists("message")) {
                            // KB 3019419: when happens email notify error, set the errorMessage to
                            // returned message after return from notifyRequestedBy().
                            // Modified by ZY, 2008-09-04.
                            notifyErrorMessage = (String) context.getParameter("message");
                        }
                        handler.notifyRequestedFor(context);
                        if (context.parameterExists("message")) {
                            if (!(notifyErrorMessage.equals(context.getParameter("message")))) {
                                if (!(notifyErrorMessage.length() == 0)) {
                                    notifyErrorMessage += "\n";
                                }
                                notifyErrorMessage += context.getParameter("message");
                            }
                        }
                    }
                    // END: Notify
                    // BEGIN: SendemailInvitations
                    if (!(reservation.getString("attendees").equals(""))) {
                        context.addResponseParameter("email_invitations",
                            reservation.getString("attendees"));
                        context.addResponseParameter("invitation_type", invitation_type);
                        context.addResponseParameter("require_reply",
                            Boolean.valueOf(reservation.getString("require_reply")));
                        context.addResponseParameter("date_cancel", null);
                        if ((reservation.getString("res_type").equals("recurring"))
                                && (invitation_type.equals("new"))) {
                            context.addResponseParameter("Reservation", reservation.toString());
                            context.addResponseParameter("RoomConflicts", roomConflicts.toString());
                        } else {
                            context.addResponseParameter("Reservation", null);
                            context.addResponseParameter("RoomConflicts", null);
                        }
                        // While updating one instance of the recurrent
                        // reservation, we must know the res_parent but also the
                        // instance to update
                        if ((invitation_type.equals("update")) && (!parentId.equals("0"))) {
                            context.addResponseParameter("res_id", res_id);
                            context.addResponseParameter("res_parent", parentId);
                        }
                        context.addResponseParameter("original_date", original_date);
                        context.addResponseParameter("original_time_start", original_time_start);
                        context.addResponseParameter("original_time_end", original_time_end);
                        context
                            .addResponseParameter("original_cityTimezone", original_cityTimezone);
                        // Clear the error message parameter before calling the
                        // WFR
                        context.addResponseParameter("message", "");
                        handler.sendEmailInvitations(context);
                        if (context.parameterExists("message")) {
                            if (!(notifyErrorMessage.length() == 0)) {
                                notifyErrorMessage += "\n";
                            }
                            notifyErrorMessage += context.getParameter("message");
                        }
                    }
                    // END: SendemailInvitations
                }
                
                // String to store the error message from the notification and
                // sendInvitations WFRs
                if (!(notifyErrorMessage.length() == 0)) {
                    context.addResponseParameter("message", notifyErrorMessage);
                }
                
                // Create json output parameter
                reservation.put("res_id", res_id);
                roomReservation.put("rmres_id", rmres_id);
                jsonResult.put(reservation);
                jsonResult.put(roomReservation);
                
                // Modified for KB 3019075, by ZY 2008-08-06.
                final JSONArray processedResourceReservations = new JSONArray();
                for (int k = 0; k < resourceReservations.length(); k++) {
                    final JSONObject resourceReservation = resourceReservations.getJSONObject(k);
                    if (resourceReservation.getString("status").equalsIgnoreCase("cancelled")) {
                        continue;
                    }
                    processedResourceReservations.put(resourceReservation);
                }
                jsonResult.put(processedResourceReservations);
                
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+": Expression:
                // "+jsonResult.toString());
                context.addResponseParameter("jsonExpression", jsonResult.toString());
                
            }
            
        } catch (final Throwable e) {
            // KB 3019419: when happens email notify error, set the errorMessage to
            // returned message after return from notifyRequestedBy().
            // Modified by ZY, 2008-09-04.
            if ((context.parameterExists("message")) && (context.getString("message").length() > 0)) {
                errMessage = context.getString("message");
            }
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            if (!context.parameterExists("message")
                    || StringUtil.isNullOrEmpty(context.getParameter("message"))) {
                context.addResponseParameter("message", "OK");
            }
        }
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END addRoomReservation wfr
    // ---------------------------------------------------------------------------------------------
    
    // This method is used for addRoomReservation() to process possible resourceConflicts in the
    // resourceReservations list.
    // Added by ZY 2008-06-16.
    private void processResourceReservations(final JSONArray resourceReservations,
            final JSONArray resourceConflicts) {
        for (int i = 0; i < resourceReservations.length(); i++) {
            final JSONObject resourceReservation = resourceReservations.getJSONObject(i);
            for (int j = 0; j < resourceConflicts.length(); j++) {
                final JSONObject resourceConflict = resourceConflicts.getJSONObject(j);
                if (resourceConflict.getString("original_date_start").equalsIgnoreCase(
                    resourceReservation.getString("date_start"))
                        && resourceConflict.getString("original_time_start").equalsIgnoreCase(
                            resourceReservation.getString("starttime"))
                        && resourceConflict.getString("original_time_end").equalsIgnoreCase(
                            resourceReservation.getString("endtime"))
                        && resourceConflict.getString("resource_id").equalsIgnoreCase(
                            resourceReservation.getString("resource_id"))
                        && resourceConflict.getString("quantity").equalsIgnoreCase(
                            resourceReservation.getString("quantity"))) {
                    if (resourceConflict.getString("status").equalsIgnoreCase("deleted")) {
                        resourceReservation.put("status", "Cancelled");
                    } else {
                        resourceReservation.put("date_start",
                            resourceConflict.getString("date_start"));
                        resourceReservation.put("starttime",
                            resourceConflict.getString("time_start"));
                        resourceReservation.put("endtime", resourceConflict.getString("time_end"));
                    }
                }
            }
        }
    }
    
    // This method is used to write related resource reservations of one room reservation to the
    // database (if any).
    // Added by ZY, 2006-06-16.
    private void writeResourceReservationsToDB(final EventHandlerContext context,
            final JSONObject reservation, final JSONArray resourceReservations,
            final JSONObject rritem, final String RULE_ID, final String errMessage,
            final String newResId) {
        String totStatus = "";
        double totCost = 0;
        if (rritem.getInt("approval") == 1) {
            totStatus = "'Awaiting App.'";
        } else {
            totStatus = "'Confirmed'";
        }
        
        String sql;
        String rsres_id = "";
        
        for (int i = 0; i < resourceReservations.length(); i++) {
            final JSONObject resourceReservation = resourceReservations.getJSONObject(i);
            // (1) Get resource information via a query. Execute SQL1 to get the
            // resource info
            sql = "";
            sql = " SELECT approval, cost_unit, cost_per_unit, cost_per_unit_ext ";
            sql += " FROM resources ";
            sql +=
                    " WHERE resource_id="
                            + literal(context, resourceReservation.getString("resource_id"));
            final List recordsSql1 = retrieveDbRecords(context, sql);
            if (recordsSql1.isEmpty()) {
                continue;
            }
            
            final Map recordOfSql = (Map) recordsSql1.get(0);
            
            // If resourceReservations[i].status = 'Cancelled', update Status
            // ='Cancelled' and Cost_rs_res = 0
            if (resourceReservation.getString("status").equalsIgnoreCase("Cancelled")) {
                sql = " UPDATE reserve_rs SET status = 'Cancelled',cost_rsres = 0 ";
                sql +=
                        " WHERE rsres_id="
                                + literal(context, resourceReservation.getString("rsres_id"));
                try {
                    executeDbSql(context, sql, false);
                } catch (final Throwable e) {
                    // handleError(context, this.ACTIVITY_ID + "-"
                    // + RULE_ID + ": Failed sql: " + sql,
                    // errMessage, e);
                }
            } else {
                // Calculate costs according to these rules:
                // BEGIN: calculate the cost
                final Integer approval = getIntegerValue(context, recordOfSql.get("approval"));
                final int cost_unit =
                        getIntegerValue(context, recordOfSql.get("cost_unit")).intValue();
                final BigDecimal cost_per_unit =
                        new BigDecimal(getString(recordOfSql, "cost_per_unit"));
                BigDecimal cost = new BigDecimal(0.0);
                final double time_in_minutes =
                        subtractMinutes(context, resourceReservation.getString("endtime"),
                            resourceReservation.getString("starttime"));
                final double time_in_hours =
                        subtractHours(context, resourceReservation.getString("endtime"),
                            resourceReservation.getString("starttime"));
                // Guo added 2008-09-02 according spec
                final BigDecimal resourceQuantity =
                        new BigDecimal(resourceReservation.getString("quantity"));
                switch (cost_unit) {
                    case 0:
                        cost = cost_per_unit.multiply(resourceQuantity);
                        break;
                    case 1:
                        cost =
                                cost_per_unit.multiply(new BigDecimal(time_in_minutes)).multiply(
                                    resourceQuantity);
                        break;
                    case 2:
                        cost =
                                cost_per_unit.multiply(new BigDecimal(time_in_hours)).multiply(
                                    resourceQuantity);
                        break;
                    case 3:
                        cost =
                                cost_per_unit.multiply(
                                    (new BigDecimal(time_in_hours)).divide(new BigDecimal(4.0), 0))
                                    .multiply(resourceQuantity);
                        break;
                    case 4:
                        cost = cost_per_unit.multiply(resourceQuantity);
                        break;
                }
                totCost = totCost + cost.doubleValue();
                
                final String date_start = resourceReservation.getString("date_start");
                final String time_start = resourceReservation.getString("starttime");
                final String time_end = resourceReservation.getString("endtime");
                final String quantity = resourceReservation.getString("quantity");
                final String bl_id = resourceReservation.getString("bl_id");
                final String fl_id = resourceReservation.getString("fl_id");
                final String rm_id = resourceReservation.getString("rm_id");
                final String resource_id = resourceReservation.getString("resource_id");
                
                if (propertyExistsNotNull(resourceReservation, "rsres_id")) {
                    // Update the reserve_rs record for
                    // resourcereservations[i].rsres_id
                    rsres_id = resourceReservation.getString("rsres_id");
                    sql =
                            " UPDATE reserve_rs SET " + " res_id = "
                                    + literal(context, reservation.getString("res_id"))
                                    + ", "
                                    + " date_start = "
                                    + formatSqlIsoToNativeDate(context, date_start)
                                    + ", "
                                    + " time_start = "
                                    + formatSqlIsoToNativeTime(context, time_start)
                                    + ", "
                                    + " time_end = "
                                    + formatSqlIsoToNativeTime(context, time_end)
                                    + ", "
                                    + " quantity  = "
                                    + quantity.toString()
                                    + ", "
                                    + " bl_id = "
                                    + literal(context, rritem.getString("bl_id"))
                                    + ", "
                                    + " fl_id = "
                                    + literal(context, rritem.getString("fl_id"))
                                    + ", "
                                    + " rm_id = "
                                    + literal(context, rritem.getString("rm_id"))
                                    + ", "
                                    + " cost_rsres = "
                                    + cost.toString()
                                    + ", "
                                    + " status = "
                                    + ((approval.intValue() == 0) ? "'Confirmed'"
                                            : "'Awaiting App.'") + " WHERE reserve_rs.rsres_id="
                                    + rsres_id + " ";
                    
                    try {
                        executeDbSql(context, sql, false);
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql,
                            errMessage, e);
                    }
                } else {
                    // (copying a reservation){
                    // Generate a new reserve_rs record
                    sql =
                            " INSERT INTO reserve_rs "
                                    + " (res_id,date_start,time_start,time_end,quantity,bl_id,fl_id,rm_id,cost_rsres,status,resource_id) "
                                    + " VALUES " + " ( " + " "
                                    + literal(context, newResId)
                                    + ", "
                                    + " "
                                    + formatSqlIsoToNativeDate(context, date_start)
                                    + ", "
                                    + " "
                                    + formatSqlIsoToNativeTime(context, time_start)
                                    + ", "
                                    + " "
                                    + formatSqlIsoToNativeTime(context, time_end)
                                    + ", "
                                    + " "
                                    + literal(context, quantity.toString())
                                    + ", "
                                    + " "
                                    + literal(context, bl_id)
                                    + ", "
                                    + " "
                                    + literal(context, fl_id)
                                    + ","
                                    + " "
                                    + literal(context, rm_id)
                                    + ","
                                    + " "
                                    + literal(context, cost.toString())
                                    + ","
                                    + " "
                                    + ((approval.intValue() == 0) ? "'Confirmed'"
                                            : "'Awaiting App.'")
                                    + ","
                                    + " "
                                    + literal(context, resource_id) + " ) ";
                    
                    try {
                        executeDbSql(context, sql, false);
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql,
                            errMessage, e);
                    }
                }
                
                if (rsres_id.equals("")) {
                    sql = " SELECT MAX(rsres_id) as max_rsres_id FROM reserve_rs ";
                    // Added by Keven 2008-07-11 by spec rx46
                    sql +=
                            " WHERE res_id="
                                    + literal(context, newResId)
                                    + " AND date_start= "
                                    + formatSqlIsoToNativeDate(context, date_start)
                                    + " AND time_start= "
                                    + formatSqlIsoToNativeTime(context, time_start)
                                    + " AND time_end= "
                                    + formatSqlIsoToNativeTime(context, time_end)
                                    + " AND quantity= "
                                    + literal(context, quantity.toString())
                                    + " AND bl_id= "
                                    + literal(context, bl_id)
                                    + " AND fl_id= "
                                    + literal(context, fl_id)
                                    + " AND rm_id="
                                    + literal(context, rm_id)
                                    + " AND cost_rsres="
                                    + literal(context, cost.toString())
                                    + " AND status="
                                    + ((approval.intValue() == 0) ? "'Confirmed'"
                                            : "'Awaiting App.'") + " AND resource_id="
                                    + literal(context, resource_id);
                    final List recordsSql3 = retrieveDbRecords(context, sql);
                    if (!recordsSql3.isEmpty()) {
                        final Map recordOfSql3 = (Map) recordsSql3.get(0);
                        rsres_id = getString(recordOfSql3, "max_rsres_id");
                        resourceReservation.put("rsres_id", rsres_id);
                    }
                    // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                    // 3.1]: "+sql);
                }
            }
        }
        // KB 3019420:Set cost_res=cost_res+totCost, by ZY 2008-08-29.
        sql =
                " UPDATE reserve SET cost_res=cost_res+" + new Double(totCost).toString()
                        + ", status=" + totStatus;
        sql += " WHERE res_id=" + literal(context, reservation.getString("res_id"));
        try {
            executeDbSql(context, sql, false);
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql, errMessage,
                e);
        }
    }
    
    // This method is used to check Availability of one given resource reservation.
    // Added by ZY 2008-06-16.
    private boolean checkResourceAvailability(final EventHandlerContext context,
            final JSONObject resourceReservation) {
        boolean available = true;
        
        if (!resourceReservation.getString("status").equalsIgnoreCase("Cancelled")) {
            // Execute SQL1 to get the resource info
            String sql = "";
            sql =
                    " SELECT resource_id, resource_std, day_start, day_end, max_days_ahead, pre_block, post_block, resource_type, quantity ";
            sql += " FROM resources ";
            sql +=
                    " WHERE resource_id="
                            + literal(context, resourceReservation.getString("resource_id"));
            final List recordsSql1 = retrieveDbRecords(context, sql);
            
            if (!recordsSql1.isEmpty()) {
                final Map recordOfSql1 = (Map) recordsSql1.get(0);
                final String resourceType = getString(recordOfSql1, "resource_type");
                final String resourceId = getString(recordOfSql1, "resource_id");
                final String dateStart = (String) resourceReservation.get("date_start");
                final int postblockTime =
                        Integer.parseInt(getString(recordOfSql1, "pre_block"))
                                + Integer.parseInt(getString(recordOfSql1, "post_block"));
                
                final String startTime = resourceReservation.getString("starttime");
                final String endTime = resourceReservation.getString("endtime");
                
                if (resourceType.equalsIgnoreCase("unique")) {
                    // If EXISTS(SQL2 )Unavailability detected
                    String sql2 = " SELECT 1 " + " FROM reserve_rs ";
                    if (propertyExistsNotNull(resourceReservation, "rsres_id")) {
                        sql2 += " WHERE rsres_id<>" + resourceReservation.getString("rsres_id");
                    } else {
                        sql2 += " WHERE 1=1 ";
                    }
                    
                    sql2 =
                            appendWhereClausesForResourceReservationConflict(resourceId, dateStart,
                                postblockTime, startTime, endTime, context, sql2);
                    
                    final List recordsSql2 = retrieveDbRecords(context, sql2);
                    if (!recordsSql2.isEmpty()) {
                        available = false;
                    }
                    
                } else if (resourceType.equalsIgnoreCase("limited")) {
                    // Modified for making check availbility correct, by ZY 2008-08-11.
                    if (!checkLimitedResourceAvailbility(context, resourceReservation, recordsSql1)) {
                        available = false;
                    }
                }
            }
        }
        return available;
    }
    
    // This method is used for checking availbility of limited NonUnique resources, by ZY
    // 2008-08-11.
    private boolean checkLimitedResourceAvailbility(final EventHandlerContext context,
            final JSONObject resourceReservationItem, final List resourceinfo) {
        String sql2;
        int preBlock;
        int postBlock;
        boolean isAllOk = true;
        // If the selected resource is reservable in the selected period, check if
        // reserved quantity is free or not
        if (!resourceinfo.isEmpty()) {
            
            final Map valuesresouceinfo = (Map) resourceinfo.get(0);
            final int resourcemaxquantity =
                    Integer.parseInt(getString(valuesresouceinfo, "quantity"));
            int maxReservedQuantity = 0;
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [PC resourcemaxquantity]:
            // "+resourcemaxquantity);
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [PC resource_type]:
            // "+getString(valuesresouceinfo,"resource_type"));
            preBlock = Integer.parseInt(getString(valuesresouceinfo, "pre_block"));
            postBlock = Integer.parseInt(getString(valuesresouceinfo, "post_block"));
            final int prepostblockTime = preBlock + postBlock;
            // If the resource_type is Unlimited we don't have to check if the quantity
            // is available
            if (!getString(valuesresouceinfo, "resource_type").equals("Unlimited")) {
                
                sql2 =
                        " ( SELECT "
                                + formatSqlAddMinutesToExpression(context, "time_start",
                                    Integer.toString(-preBlock))
                                + ", "
                                + " isnull( (SELECT SUM(quantity) FROM reserve_rs b "
                                + " WHERE b.time_start<=a.time_start "
                                + " AND b.time_end >"
                                + formatSqlAddMinutesToExpression(context, "a.time_start",
                                    Integer.toString(-prepostblockTime))
                                + " AND b.date_start=a.date_start "
                                + " AND b.resource_id=a.resource_id "
                                + " AND b.status<>'Cancelled' " + " AND b.status <> 'Rejected' ";
                // " AND b.rsres_id <> resourceReservationItem[rritem.rsres_id] (only if
                // rritem.rsres_id is not null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND b.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                sql2 += "  ), 0) as numreserves FROM reserve_rs a ";
                
                sql2 +=
                        " WHERE a.time_start >="
                                + formatSqlIsoToNativeTime(context,
                                    resourceReservationItem.getString("starttime"))
                                // " AND a.time_start-[preblock] <= [rritem.endtime]+[postblock] "
                                + " AND a.time_start<"
                                + formatSqlAddMinutes(context,
                                    transformDate(resourceReservationItem.getString("endtime")),
                                    Integer.toString(prepostblockTime))
                                
                                // + " AND a.date_start=[rritem.date_start] "
                                + " AND a.date_start="
                                + formatSqlIsoToNativeDate(context,
                                    resourceReservationItem.getString("date_start"))
                                
                                + " AND a.resource_id="
                                + literal(context, resourceReservationItem.getString("resource_id"))
                                
                                + " AND a.status<>'Cancelled' AND a.status <> 'Rejected' ";
                
                // " AND a.rsres_id <> [rritem.rsres_id] (only if rritem.rsres_id is not
                // null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND a.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                
                sql2 +=
                        " UNION "
                                + " SELECT "
                                + formatSqlAddMinutesToExpression(context, "time_end",
                                    Integer.toString(postBlock))
                                + ", "
                                + " isnull( (SELECT SUM(quantity)  FROM reserve_rs d "
                                
                                // " WHERE d.time_start-[preblock]<=c.time_end+[postblock] "
                                + " WHERE d.time_start<"
                                + formatSqlAddMinutesToExpression(context, "c.time_end",
                                    Integer.toString(prepostblockTime))
                                
                                + " AND d.time_end>=c.time_end "
                                + " AND d.date_start=c.date_start "
                                + " AND d.resource_id=c.resource_id "
                                + " AND d.status<>'Cancelled' AND d.status <> 'Rejected' ";
                
                // " AND d.rsres_id <> [rritem.rsres_id] (only if rritem.rsres_id is not
                // null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND d.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                
                sql2 +=
                        " ),0) as numreserves FROM reserve_rs c "
                                
                                // " WHERE c.time_end+[postblock] >= [rritem.starttime]-[preblock] "
                                + " WHERE c.time_end>"
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("starttime"),
                                    Integer.toString(-prepostblockTime))
                                
                                // " AND c.time_end+[postblock] <= [rritem.endtime]+[postblock] "
                                + " AND c.time_end<="
                                + formatSqlIsoToNativeTime(context,
                                    resourceReservationItem.getString("endtime"))
                                
                                // + " AND c.date_start=[rritem.date_start] "
                                + " AND c.date_start="
                                + formatSqlIsoToNativeDate(context,
                                    resourceReservationItem.getString("date_start"))
                                
                                + " AND c.resource_id="
                                + literal(context, resourceReservationItem.getString("resource_id"))
                                
                                + " AND c.status<>'Cancelled' AND c.status <> 'Rejected' ";
                
                // " AND c.rsres_id <> [rritem.rsres_id] (only if rritem.rsres_id is not
                // null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND c.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                
                sql2 +=
                        " UNION "
                                + " SELECT "
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("starttime"),
                                    Integer.toString(-preBlock))
                                + " as time_start,  "
                                + "isnull ( SUM(quantity),0 ) as numreserves FROM reserve_rs e "
                                
                                // " WHERE e.time_start-[preblock] <= [rritem.starttime]-[preblock] "
                                + " WHERE e.time_start<="
                                + formatSqlIsoToNativeTime(context,
                                    resourceReservationItem.getString("starttime"))
                                
                                // " AND e.time_end+[postblock]>= [rritem.starttime]-[preblock] "
                                + " AND e.time_end>"
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("starttime"),
                                    Integer.toString(-prepostblockTime))
                                
                                + " AND e.date_start="
                                + formatSqlIsoToNativeDate(context,
                                    resourceReservationItem.getString("date_start"))
                                
                                + " AND e.resource_id="
                                + literal(context, resourceReservationItem.getString("resource_id"))
                                
                                + " AND e.status<>'Cancelled' AND e.status <> 'Rejected' ";
                
                // " AND e.rsres_id <> [rritem.rsres_id] (only if rritem.rsres_id is not
                // null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND e.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                
                sql2 +=
                        " UNION "
                                + " SELECT "
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("endtime"),
                                    Integer.toString(postBlock))
                                + " as time_end,  "
                                + "isnull(SUM(quantity),0) as numreserves FROM reserve_rs f "
                                
                                // " WHERE f.time_start-[preblock] <= [rritem.endtime]+[postblock] "
                                + " WHERE f.time_start<"
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("endtime"),
                                    Integer.toString(prepostblockTime))
                                // " AND f.time_end+[postblock] >= [rritem.endtime]+[postblock] "
                                + " AND f.time_end>="
                                + formatSqlIsoToNativeTime(context,
                                    resourceReservationItem.getString("endtime"))
                                
                                + " AND f.date_start="
                                + formatSqlIsoToNativeDate(context,
                                    resourceReservationItem.getString("date_start"))
                                
                                + " AND f.resource_id="
                                + literal(context, resourceReservationItem.getString("resource_id"))
                                
                                + " AND f.status<>'Cancelled' AND f.status <> 'Rejected' ";
                
                // " AND f.rsres_id <> [rritem.rsres_id] (only if rritem.rsres_id is not
                // null) "
                if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                    sql2 +=
                            " AND f.rsres_id <> "
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                }
                
                sql2 += " ) " + " ORDER BY numreserves DESC ";
                
                if (isOracle(context)) {
                    sql2 = sql2.replaceAll("isnull", "nvl");
                }
                final List resourcereserv = retrieveDbRecords(context, sql2);
                
                // If there are results for this sql2
                if (!resourcereserv.isEmpty()) {
                    final Map records = (Map) resourcereserv.get(0);
                    maxReservedQuantity = Integer.parseInt(getString(records, "numreserves"));
                }
                
                if (Integer.parseInt(resourceReservationItem.getString("quantity")) > resourcemaxquantity
                        - maxReservedQuantity) {
                    isAllOk = false;
                }
            }
        } else {
            isAllOk = false;
        }
        return isAllOk;
    }
    
    // This method is used for checkResourcesAvailability() to add where clauses for given sql and
    // conditions.
    // Added by ZY 2008-06-16.
    private String appendWhereClausesForResourceReservationConflict(final String resource_id,
            final String date_start, final int postblockTime, final String startTime,
            final String endTime, final EventHandlerContext context, final String sql) {
        String returnedSql =
                sql + " AND status not in ('Cancelled','Rejected') " + " AND resource_id="
                        + literal(context, resource_id);
        
        returnedSql += " AND date_start=" + formatSqlIsoToNativeDate(context, date_start);
        
        returnedSql +=
                " AND time_start<"
                        + formatSqlAddMinutes(context, endTime, Integer.toString(postblockTime))
                        + " ";
        
        returnedSql +=
                " AND time_end>"
                        + formatSqlAddMinutes(context, startTime, Integer.toString(-postblockTime))
                        + " ";
        return returnedSql;
    }
    
    // ---------------------------------------------------------------------------------------------
    // END addRoomReservation wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN createWorkRequest wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * gets the identifier of a created or modified room reservation and generates or updates the
     * work request associated to thisreservation in needed Inputs: res_id res_id (String);
     * parent_id parent_id (String); Outputs: message error message in necesary case
     * 
     * @param context Event handler context.
     */
    public void createWorkRequest(final EventHandlerContext context) {
        
        final String RULE_ID = "createWorkRequest";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input res_id parameter
        String resId = (String) context.getParameter("res_id");
        final String parentId = (String) context.getParameter("res_parent");
        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [res_id]: "+resId+" ");
        
        String tradeToCreate = "";
        String vendorToCreate = "";
        String sql = "";
        boolean allOk = false;
        
        // createWorkRequest rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR",
                    "CREATEWORKREQUESTERROR", null);
        // createWorkRequest setup and cleanup description messages
        final String setupdesc =
                localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR",
                    "CREATEWORKREQUESTSETUPDESCRIPTION", null);
        final String cleanupdesc =
                localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR",
                    "CREATEWORKREQUESTCLEANUPDESCRIPTION", null);
        // createWorkRequest reservation comments description messages
        final String reservationComments =
                localizeMessage(context, ACTIVITY_ID, "CREATEWORKREQUEST_WFR",
                    "CREATEWORKREQUESTRESERVATIONCOMMENTSDESCRIPTION", null);
        
        try {
            // BEGIN: it gets one o more room reserve
            final Vector vectorRes_Id = new Vector();
            if (!parentId.equals("0")) {
                sql = " SELECT res_id " + " FROM reserve " + " WHERE res_parent= " + parentId;
                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 0]: "+sql);
                
                final List recordsSql0 = retrieveDbRecords(context, sql);
                
                if (!recordsSql0.isEmpty()) {
                    int i = 0;
                    for (final Iterator it = recordsSql0.iterator(); it.hasNext();) {
                        final Map values = (Map) it.next();
                        vectorRes_Id.add(i, values.get("res_id"));
                        i++;
                    }
                } else {
                    vectorRes_Id.add(0, "0");
                }
            }
            // END: it gets one o more room reserve
            else {
                vectorRes_Id.add(0, resId);
            }
            
            // BEGIN: For each res_id do createWorkRequest
            for (final Iterator it = vectorRes_Id.iterator(); it.hasNext();) {
                resId = (String) it.next();
                if (!resId.equals("0") && !resId.equals("")) {
                    // Guo added 2008-08-20 to solve KB3019197
                    final String statusOfRoomReservation =
                            (String) selectDbValue(context, "reserve_rm", "status", "res_id="
                                    + resId);
                    // -----------------------------------------------------------------------------------
                    // BEGIN: WORK REQUEST FOR TRADE
                    // -----------------------------------------------------------------------------------
                    
                    // BEGIN: the system must get the filed "tr_id" in "tr"
                    // table to generate the work
                    sql =
                            " SELECT tr.tr_id as tradetocreate "
                                    + " FROM reserve_rm, rm_arrange_type, tr "
                                    + " WHERE reserve_rm.rm_arrange_type_id=rm_arrange_type.rm_arrange_type_id "
                                    + " AND reserve_rm.res_id= " + resId
                                    + " AND rm_arrange_type.tr_id IS NOT NULL "
                                    + " AND rm_arrange_type.tr_id=tr.tr_id "
                                    + " AND tr.wr_from_reserve=1 ";
                    // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 1]:
                    // "+sql);
                    
                    final List recordsSql1 = retrieveDbRecords(context, sql);
                    
                    // BEGIN: If the system must create the wr for the asociated
                    // trade
                    if (!recordsSql1.isEmpty()) {
                        final Map recordOfSql1 = (Map) recordsSql1.get(0);
                        tradeToCreate = getString(recordOfSql1, "tradetocreate");
                        
                        // BEGIN: cancel wr for this room reservation and
                        // diferent trade
                        sql =
                                " UPDATE wr " + " SET status = 'Can', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND tr_id IS NOT NULL "
                                        + " AND tr_id <> " + literal(context, tradeToCreate)
                                        + " AND status IN ('R','Rev','A','AA') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 2]:
                        // "+sql);
                        executeDbSql(context, sql, false);
                        
                        // BEGIN: stop wr for this room reservation and diferent
                        // trade
                        sql =
                                " UPDATE wr " + " SET status = 'S', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND tr_id IS NOT NULL "
                                        + " AND tr_id <> " + literal(context, tradeToCreate)
                                        + " AND status IN ('I','HP','HA','HL') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 3]:
                        // "+sql);
                        executeDbSql(context, sql, false);
                        
                        // BEGIN: exist work request for this trade
                        sql =
                                " SELECT wr_id " + " FROM wr " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND status <> 'Can' "
                                        + " AND tr_id = " + literal(context, tradeToCreate)
                                        + " ORDER BY time_assigned ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 4]:
                        // "+sql);
                        
                        final List recordsSql2 = retrieveDbRecords(context, sql);
                        
                        if (!recordsSql2.isEmpty()) {
                            
                            final Map recordOfSql2_1 = (Map) recordsSql2.get(0);
                            final String wr_id_1 = getString(recordOfSql2_1, "wr_id");
                            final Map recordOfSql2_2 = (Map) recordsSql2.get(1);
                            final String wr_id_2 = getString(recordOfSql2_2, "wr_id");
                            
                            // BEGIN: Update work request for setting up and
                            // cleaning
                            if (isOracle(context)) {
                                sql =
                                        " UPDATE wr SET ("
                                                + " res_id,rmres_id,time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                + " time_requested,tr_id,phone,dv_id,dp_id"
                                                + " ) = ( SELECT "
                                                + " reserve_rm.res_id,reserve_rm.rmres_id, "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " reserve_rm.bl_id,reserve_rm.fl_id,reserve_rm.rm_id, "
                                                + " reserve.user_requested_by, "
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.pre_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rm.date_start, "
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rm.time_start",
                                                    formatSqlIsNull(context,
                                                        "-(rm_arrange.pre_block) , 0"))
                                                + ","
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + literal(context, tradeToCreate)
                                                + ", "
                                                + " reserve.phone,reserve.dv_id,reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id )"
                                                + " WHERE wr.wr_id= " + wr_id_1;
                            } else {
                                sql =
                                        " UPDATE wr " + " SET res_id=reserve_rm.res_id, "
                                                + " rmres_id=reserve_rm.rmres_id, "
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " bl_id=reserve_rm.bl_id, "
                                                + " fl_id=reserve_rm.fl_id, "
                                                + " rm_id=reserve_rm.rm_id, "
                                                + " requestor=reserve.user_requested_by, "
                                                + " est_labor_hours="
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.pre_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + " status= "
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ","
                                                + " date_assigned=reserve_rm.date_start, "
                                                + " time_assigned = "
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rm.time_start",
                                                    formatSqlIsNull(context,
                                                        "-(rm_arrange.pre_block) , 0"))
                                                + ", "
                                                + " date_requested = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " time_requested="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " tr_id= "
                                                + literal(context, tradeToCreate)
                                                + ", "
                                                + " phone=reserve.phone, "
                                                + " dv_id=reserve.dv_id, "
                                                + " dp_id=reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND wr.wr_id= "
                                                + wr_id_1
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            }
                            
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 5]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                            if (isOracle(context)) {
                                sql =
                                        " UPDATE wr SET ("
                                                + " res_id,rmres_id,time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                + " time_requested,tr_id,phone,dv_id,dp_id"
                                                + " ) = ( SELECT "
                                                + " reserve_rm.res_id,reserve_rm.rmres_id, "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " reserve_rm.bl_id,reserve_rm.fl_id,reserve_rm.rm_id, "
                                                + " reserve.user_requested_by, "
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.post_block , 0")
                                                + "/60 ,"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rm.date_start,reserve_rm.time_end, "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + literal(context, tradeToCreate)
                                                + ", "
                                                + " reserve.phone,reserve.dv_id,reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id )"
                                                + " WHERE wr.wr_id= " + wr_id_2;
                            } else {
                                sql =
                                        " UPDATE wr " + " SET res_id=reserve_rm.res_id, "
                                                + " rmres_id=reserve_rm.rmres_id, "
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " bl_id=reserve_rm.bl_id, "
                                                + " fl_id=reserve_rm.fl_id, "
                                                + " rm_id=reserve_rm.rm_id, "
                                                + " requestor=reserve.user_requested_by, "
                                                + " est_labor_hours="
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.post_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + " status= "
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ","
                                                + " date_assigned=reserve_rm.date_start, "
                                                + " time_assigned=reserve_rm.time_end, "
                                                + " date_requested="
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " time_requested="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " tr_id="
                                                + literal(context, tradeToCreate)
                                                + ", "
                                                + " phone=reserve.phone, "
                                                + " dv_id=reserve.dv_id, "
                                                + " dp_id=reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND wr.wr_id= "
                                                + wr_id_2
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            }
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 6]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                        }
                        // END: Update work request for setting up and cleaning
                        
                        // BEGIN: Create two new work request for setting up and
                        // cleaning
                        else {
                            
                            sql =
                                    " INSERT INTO wr "
                                            + " (res_id,rmres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status, "
                                            + " date_assigned,time_assigned,date_requested,time_requested,tr_id,phone, "
                                            + " dv_id,dp_id,description,prob_type) "
                                            + " SELECT reserve_rm.res_id, reserve_rm.rmres_id, "
                                            + " reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id, "
                                            + " reserve.user_requested_by as requestor, " + " "
                                            + formatSqlIsNull(context, "rm_arrange.pre_block , 0")
                                            + "/60 as est_labor_hours, "
                                            // Guo changed 2008-08-20 to solve KB3019197
                                            + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                    : " 'A'")
                                            + " as status, reserve_rm.date_start as date_assigned, "
                                            + " "
                                            + formatSqlAddMinutesToExpression(
                                                context,
                                                "reserve_rm.time_start",
                                                formatSqlIsNull(context,
                                                    "-(rm_arrange.pre_block),0"))
                                            + " as time_assigned, "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " as date_requested, "
                                            + " "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " as time_requested, "
                                            + " "
                                            + literal(context, tradeToCreate)
                                            + " as tr_id, "
                                            + " reserve.phone, reserve.dv_id, reserve.dp_id, "
                                            // PC KB 3038222
                                            + literal(context, setupdesc)
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + literal(context, reservationComments)
                                            + formatSqlConcat(context)
                                            + "' '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve.comments) , ''")
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve_rm.comments) , ''")
                                            + " AS description, "
                                            + " 'RES. SETUP' as prob_type "
                                            + " FROM reserve_rm, reserve, rm_arrange "
                                            + " WHERE reserve_rm.res_id=reserve.res_id "
                                            + " AND reserve_rm.res_id= "
                                            + resId
                                            + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                            + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                            + " AND reserve_rm.config_id=rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 7]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, true);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                            sql =
                                    " INSERT INTO wr  "
                                            + " (res_id,rmres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status, "
                                            + " date_assigned,time_assigned,date_requested,time_requested,tr_id,phone, "
                                            + " dv_id,dp_id,description,prob_type) "
                                            + " SELECT reserve_rm.res_id, reserve_rm.rmres_id, "
                                            + " reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id, "
                                            + " reserve.user_requested_by as requestor, " + " "
                                            + formatSqlIsNull(context, "rm_arrange.post_block , 0")
                                            + "/60 as est_labor_hours, "
                                            // Guo changed 2008-08-20 to solve KB3019197
                                            + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                    : " 'A'")
                                            + " as status, reserve_rm.date_start as date_assigned, "
                                            + " reserve_rm.time_end as time_assigned, "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " as date_requested, "
                                            + " "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " as time_requested, "
                                            + " "
                                            + literal(context, tradeToCreate)
                                            + " as tr_id, "
                                            + " reserve.phone, reserve.dv_id, reserve.dp_id, "
                                            // PC KB 3038222
                                            + literal(context, cleanupdesc)
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + literal(context, reservationComments)
                                            + formatSqlConcat(context)
                                            + "' '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve.comments) , ''")
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve_rm.comments) , ''")
                                            + " AS description, "
                                            + " 'RES. CLEANUP' as prob_type "
                                            + " FROM reserve_rm, reserve, rm_arrange "
                                            + " WHERE reserve_rm.res_id=reserve.res_id "
                                            + " AND reserve_rm.res_id= "
                                            + resId
                                            + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                            + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                            + " AND reserve_rm.config_id=rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 8]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, true);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                        }
                        // END: Create two new work request for setting up and
                        // cleaning
                        
                    }
                    // END: If the system must create the wr for the asociated
                    // trade
                    
                    // BEGIN: If the system doesn't have to create the wr for
                    // the asociated trade
                    else {
                        
                        // Cancel and Stop all wr
                        sql =
                                " UPDATE wr " + " SET status = 'Can', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id = " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND tr_id IS NOT NULL "
                                        + " AND status IN ('R','Rev','A','AA') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 9]:
                        // "+sql);
                        
                        executeDbSql(context, sql, false);
                        
                        sql =
                                " UPDATE wr  " + " SET status = 'S', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id = " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND tr_id IS NOT NULL "
                                        + " AND status IN ('I','HP','HA','HL') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 10]: "+sql);
                        
                        executeDbSql(context, sql, false);
                    }
                    // END: If the system doesn't have to create the wr for the
                    // asociated trade
                    // -----------------------------------------------------------------------------------
                    // END: WORK REQUEST FOR TRADE
                    // -----------------------------------------------------------------------------------
                    
                    // -----------------------------------------------------------------------------------
                    // BEGIN: WORK REQUEST FOR VENDOR
                    // -----------------------------------------------------------------------------------
                    // BEGIN: the system must get the filed "vn_id" in "vn"
                    // table to generate the work
                    sql =
                            " SELECT vn.vn_id as vendortocreate "
                                    + " FROM reserve_rm, rm_arrange_type, vn "
                                    + " WHERE reserve_rm.rm_arrange_type_id=rm_arrange_type.rm_arrange_type_id "
                                    + " AND reserve_rm.res_id= " + resId
                                    + " AND rm_arrange_type.vn_id IS NOT NULL "
                                    + " AND rm_arrange_type.vn_id=vn.vn_id "
                                    + " AND vn.wr_from_reserve=1 ";
                    // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 11]:
                    // "+sql);
                    
                    final List recordsSql3 = retrieveDbRecords(context, sql);
                    
                    // BEGIN: If the system must create the wr for the asociated
                    // vendor
                    if (!recordsSql3.isEmpty()) {
                        
                        final Map recordOfSql3 = (Map) recordsSql3.get(0);
                        vendorToCreate = getString(recordOfSql3, "vendortocreate");
                        
                        // BEGIN: cancel wr for this room reservation and
                        // diferent vendor
                        sql =
                                " UPDATE wr SET status = 'Can', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND vn_id IS NOT NULL "
                                        + " AND vn_id <> " + literal(context, vendorToCreate) + " "
                                        + " AND status IN ('R','Rev','A','AA') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 12]: "+sql);
                        
                        executeDbSql(context, sql, false);
                        
                        // BEGIN: stop wr for this room reservation and diferent
                        // vendor
                        sql =
                                " UPDATE wr SET status = 'S', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND vn_id IS NOT NULL "
                                        + " AND vn_id <> " + literal(context, vendorToCreate) + " "
                                        + " AND status IN ('I','HP','HA','HL') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 13]: "+sql);
                        
                        executeDbSql(context, sql, false);
                        
                        // BEGIN: exist work request for this vendor
                        sql =
                                " SELECT wr_id " + " FROM wr " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND status <> 'Can' "
                                        + " AND vn_id = " + literal(context, vendorToCreate) + " "
                                        + " ORDER BY time_assigned ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 14]: "+sql);
                        
                        final List recordsSql4 = retrieveDbRecords(context, sql);
                        
                        if (!recordsSql4.isEmpty()) {
                            
                            final Map recordOfSql4_1 = (Map) recordsSql4.get(0);
                            final String wr_id_1 = getString(recordOfSql4_1, "wr_id");
                            final Map recordOfSql4_2 = (Map) recordsSql4.get(1);
                            final String wr_id_2 = getString(recordOfSql4_2, "wr_id");
                            
                            // BEGIN: Update work request for setting up and
                            // cleaning
                            
                            // PC changed 2008-09-02 to solve KB item 3019287
                            if (isOracle(context)) {
                                sql =
                                        " UPDATE wr SET ("
                                                + " res_id,rmres_id,time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                + " time_requested,vn_id,phone,dv_id,dp_id"
                                                + " ) = ( SELECT "
                                                + " reserve_rm.res_id,reserve_rm.rmres_id, "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " reserve_rm.bl_id,reserve_rm.fl_id,reserve_rm.rm_id, "
                                                + " reserve.user_requested_by, "
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.pre_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rm.date_start, "
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rm.time_start",
                                                    formatSqlIsNull(context,
                                                        "-(rm_arrange.pre_block) , 0"))
                                                + ","
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + literal(context, vendorToCreate)
                                                + ", "
                                                + " reserve.phone,reserve.dv_id,reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id )"
                                                + " WHERE wr.wr_id= " + wr_id_1;
                            } else {
                                sql =
                                        " UPDATE wr " + " SET res_id=reserve_rm.res_id, "
                                                + " rmres_id=reserve_rm.rmres_id, "
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " bl_id=reserve_rm.bl_id, "
                                                + " fl_id=reserve_rm.fl_id, "
                                                + " rm_id=reserve_rm.rm_id, "
                                                + " requestor=reserve.user_requested_by, "
                                                + " est_labor_hours="
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.pre_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + " status= "
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ","
                                                + " date_assigned=reserve_rm.date_start, "
                                                + " time_assigned = "
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rm.time_start",
                                                    formatSqlIsNull(context,
                                                        "-(rm_arrange.pre_block) , 0"))
                                                + " , "
                                                + " date_requested="
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " time_requested="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " vn_id="
                                                + literal(context, vendorToCreate)
                                                + ", "
                                                + " phone=reserve.phone, "
                                                + " dv_id=reserve.dv_id, "
                                                + " dp_id=reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND wr.wr_id="
                                                + wr_id_1
                                                + " "
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                                // 15]: "+sql);
                            }
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                            // PC changed 2008-09-02 to solve KB item 3019287
                            if (isOracle(context)) {
                                sql =
                                        " UPDATE wr SET ("
                                                + " res_id,rmres_id,time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                + " time_requested,vn_id,phone,dv_id,dp_id"
                                                + " ) = ( SELECT "
                                                + " reserve_rm.res_id,reserve_rm.rmres_id, "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " reserve_rm.bl_id,reserve_rm.fl_id,reserve_rm.rm_id, "
                                                + " reserve.user_requested_by, "
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.post_block , 0")
                                                + "/60 ,"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rm.date_start,reserve_rm.time_end, "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + literal(context, vendorToCreate)
                                                + ", "
                                                + " reserve.phone,reserve.dv_id,reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id )"
                                                + " WHERE wr.wr_id= " + wr_id_2;
                            } else {
                                
                                sql =
                                        " UPDATE wr " + " SET res_id=reserve_rm.res_id, "
                                                + " rmres_id=reserve_rm.rmres_id, "
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " bl_id=reserve_rm.bl_id, "
                                                + " fl_id=reserve_rm.fl_id, "
                                                + " rm_id=reserve_rm.rm_id, "
                                                + " requestor=reserve.user_requested_by, "
                                                + " est_labor_hours="
                                                + formatSqlIsNull(context,
                                                    "rm_arrange.post_block , 0")
                                                + "/60 , "
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + " status= "
                                                + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ","
                                                + " date_assigned=reserve_rm.date_start, "
                                                + " time_assigned=reserve_rm.time_end, "
                                                + " date_requested="
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " time_requested="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ", "
                                                + " vn_id="
                                                + literal(context, vendorToCreate)
                                                + ", "
                                                + " phone=reserve.phone, "
                                                + " dv_id=reserve.dv_id, "
                                                + " dp_id=reserve.dp_id "
                                                + " FROM reserve_rm, reserve, rm_arrange "
                                                + " WHERE reserve_rm.res_id=reserve.res_id "
                                                + " AND reserve_rm.res_id= "
                                                + resId
                                                + " AND wr.wr_id="
                                                + wr_id_2
                                                + " "
                                                + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                                + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                                + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                                + " AND reserve_rm.config_id=rm_arrange.config_id "
                                                + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                                // 16]: "+sql);
                            }
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                        }
                        // END: Update work request for setting up and cleaning
                        
                        // BEGIN: Create two new work request for setting up and
                        // cleaning
                        else {
                            
                            sql =
                                    " INSERT INTO wr "
                                            + " (res_id,rmres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status, "
                                            + " date_assigned,time_assigned,date_requested,time_requested,vn_id,phone, "
                                            + " dv_id,dp_id,description,prob_type) "
                                            + " SELECT reserve_rm.res_id, reserve_rm.rmres_id, "
                                            + " reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id, "
                                            + " reserve.user_requested_by as requestor, " + " "
                                            + formatSqlIsNull(context, "rm_arrange.pre_block , 0")
                                            + "/60 as est_labor_hours, "
                                            // Guo changed 2008-08-20 to solve KB3019197
                                            + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                    : " 'A'")
                                            + " as status, reserve_rm.date_start as date_assigned, "
                                            + " "
                                            + formatSqlAddMinutesToExpression(
                                                context,
                                                "reserve_rm.time_start",
                                                formatSqlIsNull(context,
                                                    "-(rm_arrange.pre_block) , 0"))
                                            + " as time_assigned, "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " as date_requested, "
                                            + " "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " as time_requested, "
                                            + " "
                                            + literal(context, vendorToCreate)
                                            + " as vn_id, "
                                            + " reserve.phone, reserve.dv_id, reserve.dp_id, "
                                            // PC KB 3038222
                                            + literal(context, setupdesc)
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + literal(context, reservationComments)
                                            + formatSqlConcat(context)
                                            + "' '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve.comments) , ''")
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve_rm.comments) , ''")
                                            + " AS description, "
                                            + " 'RES. SETUP' as prob_type "
                                            + " FROM reserve_rm, reserve, rm_arrange "
                                            + " WHERE reserve_rm.res_id=reserve.res_id "
                                            + " AND reserve_rm.res_id= "
                                            + resId
                                            + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                            + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                            + " AND reserve_rm.config_id=rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 17]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                            sql =
                                    " INSERT INTO wr "
                                            + " (res_id,rmres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status, "
                                            + " date_assigned,time_assigned,date_requested,time_requested,vn_id,phone, "
                                            + " dv_id,dp_id,description,prob_type) "
                                            + " SELECT reserve_rm.res_id, reserve_rm.rmres_id, "
                                            + " reserve_rm.bl_id, reserve_rm.fl_id, reserve_rm.rm_id, "
                                            + " reserve.user_requested_by as requestor, " + " "
                                            + formatSqlIsNull(context, "rm_arrange.post_block , 0")
                                            + "/60 as est_labor_hours, "
                                            // Guo changed 2008-08-20 to solve KB3019197
                                            + ("Awaiting App.".equals(statusOfRoomReservation) ? " 'R'"
                                                    : " 'A'")
                                            + " as status, reserve_rm.date_start as date_assigned, "
                                            + " reserve_rm.time_end as time_assigned, "
                                            + " "
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + " as date_requested, "
                                            + " "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " as time_requested, "
                                            + " "
                                            + literal(context, vendorToCreate)
                                            + " as vn_id, "
                                            + " reserve.phone, reserve.dv_id, reserve.dp_id, "
                                            // PC KB 3038222
                                            + literal(context, cleanupdesc)
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + literal(context, reservationComments)
                                            + formatSqlConcat(context)
                                            + "' '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve.comments) , ''")
                                            + formatSqlConcat(context)
                                            + "'. '"
                                            + formatSqlConcat(context)
                                            + formatSqlIsNull(context,
                                                "RTRIM(reserve_rm.comments) , ''")
                                            + " AS description, "
                                            + " 'RES. CLEANUP' as prob_type "
                                            + " FROM reserve_rm, reserve, rm_arrange "
                                            + " WHERE reserve_rm.res_id=reserve.res_id "
                                            + " AND reserve_rm.res_id= "
                                            + resId
                                            + " AND reserve_rm.bl_id=rm_arrange.bl_id "
                                            + " AND reserve_rm.fl_id=rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id=rm_arrange.rm_id "
                                            + " AND reserve_rm.config_id=rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id=rm_arrange.rm_arrange_type_id ";
                            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                            // 18]: "+sql);
                            
                            try {
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                            
                        }
                        // END: Create two new work request for setting up and
                        // cleaning
                        
                    }
                    // END: If the system must create the wr for the asociated
                    // vendor
                    
                    // BEGIN: If the system doesn't have to create the wr for
                    // the asociated vendor
                    else {
                        
                        // BEGIN: Cancel and Stop all wr
                        sql =
                                " UPDATE wr SET status = 'Can', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND vn_id IS NOT NULL "
                                        + " AND status IN ('R','Rev','A','AA') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 19]: "+sql);
                        
                        executeDbSql(context, sql, false);
                        
                        sql =
                                " UPDATE wr SET status = 'S', " + " time_stat_chg = "
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + ", " + " date_stat_chg = "
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + " " + " WHERE res_id= " + resId
                                        + " AND rmres_id IS NOT NULL " + " AND vn_id IS NOT NULL "
                                        + " AND status IN ('I','HP','HA','HL') ";
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql
                        // 20]: "+sql);
                        
                        executeDbSql(context, sql, false);
                    }
                    // END: If the system doesn't have to create the wr for the
                    // asociated vendor
                    
                    // -----------------------------------------------------------------------------------
                    // END: WORK REQUEST FOR VENDOR
                    // -----------------------------------------------------------------------------------
                    
                    allOk = true;
                } // end if
            }// end for
             // END: For each res_id do createWorkRequest
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql, errMessage,
                e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
            // executeDbCommit(context);
            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 21]: do
            // commit");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END: createWorkRequest wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN searchReservationsAdditionalInfo wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * get the showed reservations identifiers, and check if the reservations can be cancelled,
     * recurrent reservation cancelled and edited or not Inputs: res_pk_list The list of
     * reservations primary keys to check res_type Define the type of reservation that must be
     * evaluated. Values: 'reserve','room','resource' User User JSONObject; Outputs:
     * 
     * @param context Event handler context.
     */
    public void searchReservationsAdditionalInfo(final String res_type, final String jsonUser,
            final String res_pk_list) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "searchReservationsAdditionalInfo";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input parameters
        final String reservation_type = res_type;
        final String jsonExpression = jsonUser;
        final String pkList = res_pk_list;
        
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "' [pkList input]: " + pkList);
        // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"' [JSONExpression input]:
        // "+jsonExpression);
        boolean allOk = false;
        String sql = "";
        // PC KB 3018035 - Get also the city timezone and the date to check the GMT offset
        String sqlTimezone = "";
        String cityTimezone = "";
        Date dateCheckTimezone = null;
        List listmeetTimeCriteria = null;
        String sqlmeetTimeCriteria = "";
        boolean meetTimeCriteria = true;
        
        // searchReservationsAdditionalInfo rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "SEARCHRESERVATIONSADDITIONALINFO_WFR",
                    "RESERVATIONADDITIONALINFOERROR", null);
        
        try {
            final String currentDate = "CurrentDateTime";
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            final JSONObject user = objectsToSave.getJSONObject(0);
            // Generate the output parameters
            final JSONArray jsonResult = new JSONArray();
            final JSONArray jsonEditResult = new JSONArray();
            final JSONArray jsonCancelResult = new JSONArray();
            final JSONArray jsonCancelRecurrentResult = new JSONArray();
            final JSONArray jsonCopyResult = new JSONArray();
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"' [1]: ");
            
            try {
                user.put("groups", user.getJSONArray("groups"));
            } catch (final Throwable e) {
                user.put("groups",
                    user.getJSONObject("groups").toJSONArray(user.getJSONObject("groups").names()));
            }
            
            final List pkElements = selectXmlNodes(pkList, "descendant::record");
            
            // If there are reservations to check if can be edited and cancelled
            if (!pkElements.isEmpty()) {
                
                for (final Iterator it = pkElements.iterator(); it.hasNext();) {
                    
                    final Element recordElement = (Element) it.next();
                    // get one reservation PK values as a map
                    final Map PKs = parseRecord(context, recordElement);
                    
                    // If we are in the general information TAB
                    if (reservation_type.equals("reserve")) {
                        
                        final Integer res_id = (Integer) PKs.get("reserve.res_id");
                        
                        // -----------
                        // CANBEEDITED
                        // -----------
                        sql =
                                " SELECT res_id " + " FROM reserve " + " WHERE res_id= " + res_id
                                        + " AND status IN ('Awaiting App.','Confirmed') ";
                        
                        meetTimeCriteria = true;
                        
                        // Modified this sql by Keven 2008-07-10 , by spec 46
                        // If none of the security groups in the [User.groups]
                        // array is 'RESERVATION SERVICE DESK' or
                        // 'RESERVATION MANAGER', check that the user enforces
                        // the required times for editing the
                        // reservation for room or resources reservations
                        // PC KB 3021918
                        if ((!ContextStore.get().getUser()
                            .isMemberOfGroup("RESERVATION SERVICE DESK"))
                                && (!ContextStore.get().getUser()
                                    .isMemberOfGroup("RESERVATION MANAGER"))) {
                            
                            // PC KB 3018035 - Get also the city timezone and the date to check the
                            // GMT offset
                            meetTimeCriteria = false;
                            
                            // First check if the room arrangement meet all the criteria to be
                            // edited
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id"
                                            + " FROM reserve_rm INNER JOIN bl "
                                            + " ON reserve_rm.bl_id=bl.bl_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE res_id = " + res_id
                                            + " AND status IN ('Awaiting App.','Confirmed') ";
                            
                            int finaloffset = 0;
                            
                            final List listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            // If reservation has room reservations that meet status criteria, then
                            // continue checking times criteria
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                                
                                // Check if the room reservation meet the status and time criteria
                                sqlmeetTimeCriteria =
                                        sql
                                                + "AND EXISTS "
                                                + " (SELECT 1 FROM reserve_rm r, rm_arrange a "
                                                + " WHERE r.res_id=reserve.res_id "
                                                + " AND status IN ('Awaiting App.','Confirmed') "
                                                + " AND r.bl_id=a.bl_id AND r.fl_id=a.fl_id AND r.rm_id=a.rm_id AND r.config_id=a.config_id "
                                                + " AND r.rm_arrange_type_id=a.rm_arrange_type_id "
                                                + " AND (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + " > a.announce_days) OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + "=a.announce_days) AND ("
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "a.announce_time",
                                                    Integer.toString(finaloffset))
                                                + ")))"
                                                // KB 3018035 check to make sure the reservation's
                                                // start
                                                // time is later than the location's current time
                                                + " AND (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + " > 0) OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + " = 0) AND ("
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "r.time_start", Integer.toString(finaloffset))
                                                + "))))";
                                
                                listmeetTimeCriteria =
                                        retrieveDbRecords(context, sqlmeetTimeCriteria);
                                
                                // If the room reservation meets all the criteria to be edited
                                if (!listmeetTimeCriteria.isEmpty()) {
                                    meetTimeCriteria = true;
                                }
                            }
                            
                            // If the room arrangement reservation didn't meet the criteria, then
                            // check if any resource meets it
                            if (!meetTimeCriteria) {
                                
                                String sqlResources = "";
                                
                                // First check if any resource meets the criteria without need of
                                // time and timezone checking
                                
                                sqlResources =
                                        sql
                                                + " AND EXISTS "
                                                + " (SELECT 1 FROM reserve_rs r, resources res "
                                                + " WHERE r.res_id=reserve.res_id "
                                                + " AND status IN ('Awaiting App.','Confirmed') "
                                                + " AND r.resource_id=res.resource_id "
                                                + " AND ("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start") + " > res.announce_days))";
                                
                                List listResources = retrieveDbRecords(context, sqlResources);
                                
                                // If any resource reservation meets all the criteria to be edited
                                if (!listResources.isEmpty()) {
                                    meetTimeCriteria = true;
                                }
                                
                                // If we need to check if resources meet the announce_time criteria
                                if (!meetTimeCriteria) {
                                    
                                    // First, get the list of resources and dates reserved, and it's
                                    // site and building
                                    sqlResources =
                                            " SELECT date_start, rsres_id, site_id, resources.bl_id"
                                                    + " FROM reserve_rs INNER JOIN resources "
                                                    + " ON reserve_rs.resource_id = resources.resource_id "
                                                    + " WHERE res_id = "
                                                    + res_id
                                                    + " AND status IN ('Awaiting App.','Confirmed') ";
                                    
                                    // Go through the resources and check if any of them meet the
                                    // status
                                    // and time criteria
                                    listResources = retrieveDbRecords(context, sqlResources);
                                    
                                    for (final Iterator it2 = listResources.iterator(); it2
                                        .hasNext();) {
                                        final Map recordResource = (Map) it2.next();
                                        dateCheckTimezone =
                                                getDateValue(context,
                                                    recordResource.get("date_start"));
                                        cityTimezone =
                                                getResourceResTimezone(context,
                                                    getString(recordResource, "site_id"),
                                                    getString(recordResource, "bl_id"));
                                        
                                        finaloffset =
                                                getTotalMinutesOffset(context, cityTimezone,
                                                    dateCheckTimezone);
                                        
                                        // Check if the resource reservation meet the status and
                                        // time
                                        // criteria
                                        sqlmeetTimeCriteria =
                                                sql
                                                        + " AND EXISTS "
                                                        + " (SELECT 1 FROM reserve_rs r, resources res "
                                                        + " WHERE r.res_id=reserve.res_id "
                                                        + " AND r.rsres_id= "
                                                        + recordResource.get("rsres_id")
                                                        + " AND status IN ('Awaiting App.','Confirmed') "
                                                        + " AND r.resource_id=res.resource_id "
                                                        + " AND (("
                                                        + formatSqlDaysBetween(context,
                                                            currentDate, "r.date_start")
                                                        + ">res.announce_days) OR (("
                                                        + formatSqlDaysBetween(context,
                                                            currentDate, "r.date_start")
                                                        + " = res.announce_days) AND ("
                                                        + formatSqlIsoToNativeTime(context,
                                                            "CurrentDateTime")
                                                        + " <"
                                                        + formatSqlAddMinutesToExpression(context,
                                                            "res.announce_time",
                                                            Integer.toString(finaloffset))
                                                        + ")))"
                                                        // KB 3018035 check to make sure the
                                                        // reservation's
                                                        // start
                                                        // time is later than the location's current
                                                        // time
                                                        + " AND (("
                                                        + formatSqlDaysBetween(context,
                                                            currentDate, "r.date_start")
                                                        + ">0) OR (("
                                                        + formatSqlDaysBetween(context,
                                                            currentDate, "r.date_start")
                                                        + " = 0) AND ("
                                                        + formatSqlIsoToNativeTime(context,
                                                            "CurrentDateTime")
                                                        + " <"
                                                        + formatSqlAddMinutesToExpression(context,
                                                            "r.time_start",
                                                            Integer.toString(finaloffset)) + "))))";
                                        
                                        listmeetTimeCriteria =
                                                retrieveDbRecords(context, sqlmeetTimeCriteria);
                                        
                                        // If the resource reservation meets all the criteria to be
                                        // edited
                                        if (!listmeetTimeCriteria.isEmpty()) {
                                            meetTimeCriteria = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[Select-1]: " + sql);
                        final List listRecordsCanEdited = retrieveDbRecords(context, sql);
                        
                        // If the result is not empty the reservation can be
                        // edited
                        if ((!listRecordsCanEdited.isEmpty()) && meetTimeCriteria) {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "yes");
                            jsonEditResult.put(reservationInfo);
                        } else {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "no");
                            jsonEditResult.put(reservationInfo);
                        }
                        
                        // --------------
                        // CANBECANCELLED
                        // --------------
                        sql =
                                " SELECT res_id, res_type " + " FROM reserve " + " WHERE res_id= "
                                        + res_id + " AND status IN ('Awaiting App.','Confirmed') ";
                        
                        meetTimeCriteria = true;
                        
                        // If none of the security groups in the [User.groups]
                        // array is 'RESERVATION SERVICE DESK' or
                        // 'RESERVATION MANAGER', check that the user enforces
                        // the required times for cancelling both,
                        // room and resources reservations
                        // PC KB 3021918
                        if ((!ContextStore.get().getUser()
                            .isMemberOfGroup("RESERVATION SERVICE DESK"))
                                && (!ContextStore.get().getUser()
                                    .isMemberOfGroup("RESERVATION MANAGER"))) {
                            
                            // First check if the room arrangement doesn't meet all the criteria to
                            // be cancelled
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id"
                                            + " FROM reserve_rm INNER JOIN bl "
                                            + " ON reserve_rm.bl_id=bl.bl_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE res_id = " + res_id
                                            + " AND status IN ('Awaiting App.','Confirmed') ";
                            
                            int finaloffset = 0;
                            
                            final List listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            // If reservation has room reservations that meet status criteria, then
                            // continue checking times criteria
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                                
                                // Check if the room reservation doesn't meet the status and time
                                // criteria
                                sqlmeetTimeCriteria =
                                        sql
                                                + " AND EXISTS "
                                                + " (SELECT 1 FROM reserve_rm r, rm_arrange a "
                                                + " WHERE r.res_id=reserve.res_id "
                                                + " AND status IN ('Awaiting App.','Confirmed') "
                                                + " AND r.bl_id=a.bl_id AND r.fl_id=a.fl_id AND r.rm_id=a.rm_id AND r.config_id=a.config_id "
                                                + " AND r.rm_arrange_type_id=a.rm_arrange_type_id "
                                                + " AND ( NOT ( "
                                                + "("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + " > a.cancel_days) OR "
                                                + "(("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + "= a.cancel_days) AND "
                                                + "( "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "a.cancel_time", Integer.toString(finaloffset))
                                                + "))) "
                                                // KB 3018035 check to make sure the reservation's
                                                // start
                                                // time is later than the location's current time
                                                + " OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "r.date_start")
                                                + " = 0) AND "
                                                + "( "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " > "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "r.time_start", Integer.toString(finaloffset))
                                                + ")))) ";
                                
                                listmeetTimeCriteria =
                                        retrieveDbRecords(context, sqlmeetTimeCriteria);
                                
                                // If the room reservation doesn't meets all the criteria to be
                                // cancelled
                                if (!listmeetTimeCriteria.isEmpty()) {
                                    meetTimeCriteria = false;
                                }
                            }
                            
                            // If the room arrangement reservation meet the criteria, then
                            // check if any resource doesn't meet it
                            if (meetTimeCriteria) {
                                
                                String sqlResources = "";
                                
                                // First, get the list of resources and dates reserved, and it's
                                // site and building
                                sqlResources =
                                        " SELECT date_start, rsres_id, site_id, resources.bl_id"
                                                + " FROM reserve_rs INNER JOIN resources "
                                                + " ON reserve_rs.resource_id = resources.resource_id "
                                                + " WHERE res_id = " + res_id
                                                + " AND status IN ('Awaiting App.','Confirmed') ";
                                
                                // Go through the resources and check if any of them doesn't meet
                                // the status and time criteria
                                final List listResources = retrieveDbRecords(context, sqlResources);
                                
                                for (final Iterator it2 = listResources.iterator(); it2.hasNext();) {
                                    final Map recordResource = (Map) it2.next();
                                    dateCheckTimezone =
                                            getDateValue(context, recordResource.get("date_start"));
                                    cityTimezone =
                                            getResourceResTimezone(context,
                                                getString(recordResource, "site_id"),
                                                getString(recordResource, "bl_id"));
                                    finaloffset =
                                            getTotalMinutesOffset(context, cityTimezone,
                                                dateCheckTimezone);
                                    
                                    // Check if the resource reservation doesn't meet the status and
                                    // time criteria
                                    sqlmeetTimeCriteria =
                                            sql
                                                    + " AND EXISTS "
                                                    + " (SELECT 1 FROM reserve_rs r, resources res "
                                                    + " WHERE r.res_id=reserve.res_id "
                                                    + " AND r.rsres_id= "
                                                    + recordResource.get("rsres_id")
                                                    + " AND status IN ('Awaiting App.','Confirmed') "
                                                    + " AND r.resource_id=res.resource_id "
                                                    + " AND ( NOT ("
                                                    + "("
                                                    + formatSqlDaysBetween(context, currentDate,
                                                        "r.date_start")
                                                    + ">res.cancel_days) OR (("
                                                    + formatSqlDaysBetween(context, currentDate,
                                                        "r.date_start")
                                                    + " = res.cancel_days) AND ("
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + " <"
                                                    + formatSqlAddMinutesToExpression(context,
                                                        "res.cancel_time",
                                                        Integer.toString(finaloffset))
                                                    + ")))"
                                                    // KB 3018035 check to make sure the
                                                    // reservation's start
                                                    // time is later than the location's current
                                                    // time
                                                    + " OR (("
                                                    + formatSqlDaysBetween(context, currentDate,
                                                        "r.date_start")
                                                    + " = 0) AND "
                                                    + "( "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + " > "
                                                    + formatSqlAddMinutesToExpression(context,
                                                        "r.time_start",
                                                        Integer.toString(finaloffset)) + "))))";
                                    
                                    listmeetTimeCriteria =
                                            retrieveDbRecords(context, sqlmeetTimeCriteria);
                                    
                                    // If the resource reservation doesn't meet all the criteria
                                    // to be cancelled
                                    if (!listmeetTimeCriteria.isEmpty()) {
                                        meetTimeCriteria = false;
                                        break;
                                    }
                                }
                            }
                        }
                        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[Select-2]: " + sql);
                        final List listRecordsCanCancelled = retrieveDbRecords(context, sql);
                        
                        // If the result is not empty the reservation can be
                        // cancelled
                        if ((!listRecordsCanCancelled.isEmpty()) && meetTimeCriteria) {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeCancelled", "yes");
                            jsonCancelResult.put(reservationInfo);
                            final JSONObject reservationInfoRec = new JSONObject();
                            final Map record = (Map) listRecordsCanCancelled.get(0);
                            if (getString(record, "res_type").equals("regular")) {
                                reservationInfoRec.put("canBeRecurrentCancelled", "no");
                            } else {
                                reservationInfoRec.put("canBeRecurrentCancelled", "yes");
                            }
                            jsonCancelRecurrentResult.put(reservationInfoRec);
                        } else {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeCancelled", "no");
                            jsonCancelResult.put(reservationInfo);
                            final JSONObject reservationInfoRec = new JSONObject();
                            reservationInfoRec.put("canBeRecurrentCancelled", "no");
                            jsonCancelRecurrentResult.put(reservationInfoRec);
                        }
                        
                        // --------------
                        // CANBECOPIED
                        // --------------
                        sql =
                                " SELECT 1 FROM reserve WHERE res_id= " + res_id
                                        + " AND status IN ('Awaiting App.','Confirmed') ";
                        
                        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[Select-3]: " + sql);
                        final List listRecordsCanCopied = retrieveDbRecords(context, sql);
                        
                        // If the result is not empty the reservation can be
                        // copied
                        if (!listRecordsCanCopied.isEmpty()) {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeCopied", "yes");
                            jsonCopyResult.put(reservationInfo);
                        } else {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeCopied", "no");
                            jsonCopyResult.put(reservationInfo);
                        }
                        
                        allOk = true;
                    }
                    
                    // If we are in the rooms reservation TAB
                    if (reservation_type.equals("room")) {
                        
                        final Integer rmres_id = (Integer) PKs.get("reserve_rm.rmres_id");
                        
                        // -----------
                        // CANBEEDITED
                        // -----------
                        sql =
                                " SELECT rmres_id " + " FROM reserve_rm " + " WHERE rmres_id= "
                                        + rmres_id
                                        + " AND status IN ('Awaiting App.','Confirmed') ";
                        
                        // If none of the security groups in the [User.groups]
                        // array is 'RESERVATION SERVICE DESK' or
                        // 'RESERVATION MANAGER', check that the user enforces
                        // the required times for editing the
                        // reservation for room
                        // PC KB 3021918
                        if ((!ContextStore.get().getUser()
                            .isMemberOfGroup("RESERVATION SERVICE DESK"))
                                && (!ContextStore.get().getUser()
                                    .isMemberOfGroup("RESERVATION MANAGER"))) {
                            
                            // PC KB 3018035 - Get also the city timezone and the date to check the
                            // GMT offset
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id"
                                            + " FROM reserve_rm INNER JOIN bl "
                                            + " ON reserve_rm.bl_id=bl.bl_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE rmres_id = " + rmres_id;
                            
                            int finaloffset = 0;
                            
                            final List listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                            }
                            
                            sql +=
                                    " AND NOT EXISTS "
                                            + " (SELECT 1 FROM rm_arrange a "
                                            + " WHERE reserve_rm.bl_id=a.bl_id AND reserve_rm.fl_id=a.fl_id AND reserve_rm.rm_id=a.rm_id "
                                            + " AND reserve_rm.config_id=a.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id=a.rm_arrange_type_id "
                                            + " AND ( NOT "
                                            + "(("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " > a.announce_days) OR "
                                            + "(("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + "= a.announce_days) AND "
                                            + " ( "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " < "
                                            + formatSqlAddMinutesToExpression(context,
                                                "a.announce_time", Integer.toString(finaloffset))
                                            + "))) OR "
                                            // KB 3018035 check to make sure the reservation's start
                                            // time is later than the location's current time
                                            + "(("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + "= 0) AND "
                                            + " ( "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " > "
                                            + formatSqlAddMinutesToExpression(context,
                                                "reserve_rm.time_start",
                                                Integer.toString(finaloffset)) + "))))";
                        }
                        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[Select-4]: " + sql);
                        final List listRecordsCanEdited2 = retrieveDbRecords(context, sql);
                        
                        // If the result is not empty the room reservation can
                        // be edited
                        if (!listRecordsCanEdited2.isEmpty()) {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "yes");
                            jsonEditResult.put(reservationInfo);
                        } else {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "no");
                            jsonEditResult.put(reservationInfo);
                        }
                        allOk = true;
                    }
                    
                    // If we are in the resources reservation TAB
                    if (reservation_type.equals("resource")) {
                        
                        final Integer rsres_id = (Integer) PKs.get("reserve_rs.rsres_id");
                        
                        // -----------
                        // CANBEEDITED
                        // -----------
                        sql =
                                " SELECT rsres_id " + " FROM reserve_rs " + " WHERE rsres_id= "
                                        + rsres_id
                                        + " AND status IN ('Awaiting App.','Confirmed') ";
                        
                        // If none of the security groups in the [User.groups]
                        // array is 'RESERVATION SERVICE DESK' or
                        // 'RESERVATION MANAGER', check that the user enforces
                        // the required times for editing the resources reservations
                        // PC KB 3021918
                        if ((!ContextStore.get().getUser()
                            .isMemberOfGroup("RESERVATION SERVICE DESK"))
                                && (!ContextStore.get().getUser()
                                    .isMemberOfGroup("RESERVATION MANAGER"))) {
                            
                            // PC KB 3018035 - Search first for the site timezone
                            // and the date to check the GMT offset
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id "
                                            + " FROM reserve_rs INNER JOIN resources "
                                            + " ON reserve_rs.resource_id=resources.resource_id "
                                            + " LEFT OUTER JOIN site "
                                            + " ON site.site_id=resources.site_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=site.city_id AND city.state_id=site.state_id "
                                            + " WHERE rsres_id = " + rsres_id;
                            
                            int finaloffset = 0;
                            
                            final List listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                            }
                            
                            // If we didn't get the timezone from resources.site_id, then try from
                            // resources.bl_id
                            if (cityTimezone.equals("")) {
                                
                                sqlTimezone =
                                        " SELECT date_start, city.timezone_id "
                                                + " FROM reserve_rs INNER JOIN resources "
                                                + " ON reserve_rs.resource_id=resources.resource_id "
                                                + " LEFT OUTER JOIN bl "
                                                + " ON bl.bl_id=resources.bl_id "
                                                + " LEFT OUTER JOIN city "
                                                + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id "
                                                + " WHERE rsres_id = " + rsres_id;
                                
                                final List listTimezone2 = retrieveDbRecords(context, sqlTimezone);
                                
                                if (!listTimezone2.isEmpty()) {
                                    final Map recordTimezone2 = (Map) listTimezone2.get(0);
                                    cityTimezone = getString(recordTimezone2, "timezone_id");
                                }
                            }
                            
                            finaloffset =
                                    getTotalMinutesOffset(context, cityTimezone, dateCheckTimezone);
                            
                            // resources reservations
                            sql +=
                                    " AND NOT EXISTS "
                                            + " (SELECT 1 FROM resources res "
                                            + " WHERE reserve_rs.resource_id=res.resource_id "
                                            + " AND ( NOT (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rs.date_start")
                                            + " >res.announce_days) OR (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rs.date_start")
                                            + " = res.announce_days) AND "
                                            + " ( "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " < "
                                            + formatSqlAddMinutesToExpression(context,
                                                "res.announce_time", Integer.toString(finaloffset))
                                            + "))) OR "
                                            // KB 3018035 check to make sure the reservation's start
                                            // time is later than the location's current time
                                            + " (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rs.date_start")
                                            + " = 0) AND ( "
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " > "
                                            + formatSqlAddMinutesToExpression(context,
                                                "reserve_rs.time_start",
                                                Integer.toString(finaloffset)) + "))))";
                        }
                        
                        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[Select-5]: " + sql);
                        final List listRecordsCanEdited3 = retrieveDbRecords(context, sql);
                        
                        // If the result is not empty the resource reservation
                        // can be edited
                        if (!listRecordsCanEdited3.isEmpty()) {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "yes");
                            jsonEditResult.put(reservationInfo);
                        } else {
                            final JSONObject reservationInfo = new JSONObject();
                            reservationInfo.put("canBeEdited", "no");
                            jsonEditResult.put(reservationInfo);
                        }
                        allOk = true;
                    }
                }
                // Generate the output parameters
                jsonResult.put(jsonEditResult);
                jsonResult.put(jsonCancelResult);
                jsonResult.put(jsonCancelRecurrentResult);
                jsonResult.put(jsonCopyResult);
                context.addResponseParameter("jsonExpression", jsonResult.toString());
                // this.log.info( ACTIVITY_ID+"-"+RULE_ID+": jsonExpression
                // "+jsonResult.toString() );
            }
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            context.addResponseParameter("message", "OK");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END searchReservationsAdditionalInfo wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN cancelReservation wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * get the selected reservation identifier, and check if the reservations can be cancelled or
     * not Inputs: res_id Reservation ID (xml structure); Must match the existing reserve.res:id
     * value. User User JSONObject; Outputs:
     * 
     * @param context Event handler context.
     */
    public void cancelReservation(final String res_id, final String jsonUser, final String single) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "cancelReservation";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        String reservationId = res_id;
        final String jsonExpression = jsonUser;
        
        String resParent = "0";
        
        // cancelReservation rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "CANCELRESERVATION_WFR",
                    "CANCELRESERVATIONERROR", null);
        
        // Get the reservation identifier from the XML structure
        try {
            if (!reservationId.equals("")) {
                final SAXReader xmlReader = new SAXReader();
                final Document xmlDoc = xmlReader.read(new StringReader(reservationId));
                final Attribute reservationIdValue =
                        (Attribute) xmlDoc.getRootElement().attributes().get(0);
                reservationId = reservationIdValue.getValue();
            }
        } catch (final Throwable e) {
            reservationId = "";
        }
        
        // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"' [JSONExpression input]: "+jsonExpression);
        boolean allOk = false;
        
        // PC KB 3018035 - Get room and resources GTM offset to do time comparisons
        String sqlTimezone = "";
        List listTimezone = null;
        int finaloffset = 0;
        String cityTimezone = "";
        Date dateCheckTimezone = null;
        
        try {
            
            // If we have the identifier of the reservation to cancel
            if (!reservationId.equals("")) {
                
                final String currentDate = "CurrentDateTime";
                final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
                final JSONObject user = objectsToSave.getJSONObject(0);
                String sql = "";
                
                // BEGIN: Build a query to retrieve the reservations that need to be cancelled
                if (single.toUpperCase().equals("YES")) {
                    sql = " SELECT res_id, res_parent FROM reserve WHERE res_id = " + reservationId;
                } else {
                    sql =
                            " SELECT res_id, res_parent FROM reserve "
                                    + " WHERE res_parent = (SELECT res_parent FROM reserve WHERE res_id = "
                                    + reservationId
                                    + " ) AND NOT (reserve.status='Cancelled' OR reserve.status='Rejected')";
                }
                
                final List listReservationId = retrieveDbRecords(context, sql);
                
                // END: Build a query to retrieve the reservations that need to be cancelled
                
                try {
                    try {
                        user.put("groups", user.getJSONArray("groups"));
                    } catch (final Throwable e) {
                        user.put(
                            "groups",
                            user.getJSONObject("groups").toJSONArray(
                                user.getJSONObject("groups").names()));
                    }
                    
                    boolean simpleUser = true;
                    // PC KB 3021918
                    if (ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK")
                            || ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER")) {
                        simpleUser = false;
                    }
                    
                    // BEGIN: If the user doesn't belong the the SERVICE DESK or
                    // MANAGER groups, then check that enforces the requirements
                    // to cancel the reservation
                    if (simpleUser) {
                        for (final Iterator it = listReservationId.iterator(); it.hasNext();) {
                            
                            final Map record = (Map) it.next();
                            reservationId = getString(record, "res_id");
                            
                            // Get the total number of room reservations to
                            // cancel and resource reservations to cancel
                            sql =
                                    " SELECT  res_id , "
                                            + " (SELECT COUNT(*) FROM reserve_rm "
                                            + " WHERE res_id="
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed')) AS totalrm , "
                                            + " (SELECT COUNT(*) FROM reserve_rs "
                                            + " WHERE res_id="
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed')) AS totalrs "
                                            + " FROM reserve WHERE res_id=" + reservationId;
                            
                            final List listRoomAndResourceReservations =
                                    retrieveDbRecords(context, sql);
                            int numTotalRm = 0;
                            int numTotalRs = 0;
                            
                            if (!listRoomAndResourceReservations.isEmpty()) {
                                final Map recordOfSql1 =
                                        (Map) listRoomAndResourceReservations.get(0);
                                numTotalRm =
                                        getIntegerValue(context, recordOfSql1.get("totalrm"))
                                            .intValue();
                                numTotalRs =
                                        getIntegerValue(context, recordOfSql1.get("totalrs"))
                                            .intValue();
                            }
                            
                            // PC KB 3018035 - To check if the room reservation can be cancelled,
                            // get the city timezone and the date to check the GMT offset
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id"
                                            + " FROM reserve_rm INNER JOIN bl "
                                            + " ON reserve_rm.bl_id=bl.bl_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE res_id = " + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed')";
                            
                            finaloffset = 0;
                            
                            listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            // Get the timezone offset of the room reservation to cancel, if there's
                            // one
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                            }
                            
                            // Get number of room reservations the user can cancel (1 or 0)
                            sql =
                                    " SELECT  COUNT(*) AS cancelrm "
                                            + " FROM reserve_rm, rm_arrange "
                                            + " WHERE reserve_rm.bl_id= rm_arrange.bl_id AND reserve_rm.fl_id= rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id= rm_arrange.rm_id "
                                            + " AND reserve_rm.config_id= rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id= rm_arrange.rm_arrange_type_id "
                                            + " AND res_id="
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed') "
                                            + " AND (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " > cancel_days) OR (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " = cancel_days) AND ("
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " < "
                                            + formatSqlAddMinutesToExpression(context,
                                                "cancel_time", Integer.toString(finaloffset))
                                            + " )))"
                                            // KB 3018035 check to make sure the reservation's start
                                            // time is
                                            // later than the location's current time
                                            + " AND (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " > 0) OR (("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " = 0) AND ("
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " < "
                                            + formatSqlAddMinutesToExpression(context,
                                                "time_start", Integer.toString(finaloffset))
                                            + " )))";
                            
                            final List listCanCancelledRoomReservations =
                                    retrieveDbRecords(context, sql);
                            int numRm = 0;
                            
                            // Number of room reservations the user can cancel
                            if (!listCanCancelledRoomReservations.isEmpty()) {
                                final Map recordOfSql2 =
                                        (Map) listCanCancelledRoomReservations.get(0);
                                numRm =
                                        getIntegerValue(context, recordOfSql2.get("cancelrm"))
                                            .intValue();
                            }
                            
                            // PC KB 3018035 - For counting the resource reservations that can be
                            // cancelled, get site and building timezone and the date to check GMT
                            // offset
                            int numRs = 0;
                            
                            // First, get the list of resources and dates reserved, and it's
                            // site and building
                            sqlTimezone =
                                    " SELECT date_start, rsres_id, site_id, resources.bl_id"
                                            + " FROM reserve_rs INNER JOIN resources "
                                            + " ON reserve_rs.resource_id = resources.resource_id "
                                            + " WHERE res_id = "
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed') ";
                            
                            // Go through the resources and check if they can be cancelled or not
                            listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            for (final Iterator it2 = listTimezone.iterator(); it2.hasNext();) {
                                // Get the resource's timezone offset
                                final Map recordResource = (Map) it2.next();
                                dateCheckTimezone =
                                        getDateValue(context, recordResource.get("date_start"));
                                cityTimezone =
                                        getResourceResTimezone(context,
                                            getString(recordResource, "site_id"),
                                            getString(recordResource, "bl_id"));
                                
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                                
                                // Get number of resource reservations the user can cancel (1 or 0)
                                sql =
                                        " SELECT  COUNT(*) AS cancelrs "
                                                + " FROM reserve_rs, resources "
                                                + " WHERE reserve_rs.resource_id= resources.resource_id "
                                                + " AND res_id="
                                                + reservationId
                                                + " AND rsres_id="
                                                + getString(recordResource, "rsres_id")
                                                + " AND (status='Awaiting App.' OR status='Confirmed') "
                                                + " AND (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + "> cancel_days ) OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + " = cancel_days ) AND ("
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "cancel_time", Integer.toString(finaloffset))
                                                + "))) "
                                                // KB 3018035 check to make sure the reservation's
                                                // start
                                                // time is
                                                // later than the location's current time
                                                + " AND (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + "> 0 ) OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + " = 0 ) AND ("
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "time_start", Integer.toString(finaloffset))
                                                + "))) ";
                                
                                final List listCanCancelledResourceReservations =
                                        retrieveDbRecords(context, sql);
                                
                                // Number of resource reservations the user can cancel
                                if (!listCanCancelledResourceReservations.isEmpty()) {
                                    final Map recordOfSql3 =
                                            (Map) listCanCancelledResourceReservations.get(0);
                                    numRs +=
                                            getIntegerValue(context, recordOfSql3.get("cancelrs"))
                                                .intValue();
                                }
                                
                            }
                            
                            // Check if the user can cancel all the related room
                            // and resource reservations
                            if (!((numTotalRm > numRm) || (numTotalRs > numRs))) {
                                
                                try {
                                    // Cancel room reservations
                                    sql =
                                            " UPDATE reserve_rm SET status='Cancelled',"
                                                    + " user_last_modified_by = "
                                                    + literal(
                                                        context,
                                                        user.getJSONObject("Employee").getString(
                                                            "em_id"))
                                                    + ", date_cancelled="
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ", cost_rmres=0 "
                                                    + " WHERE res_id="
                                                    + reservationId
                                                    + " AND (status='Awaiting App.' OR status='Confirmed') ";
                                    
                                    executeDbSql(context, sql, false);
                                    
                                    // Cancel resource reservations
                                    sql =
                                            " UPDATE reserve_rs SET status = 'Cancelled',"
                                                    + " user_last_modified_by = "
                                                    + literal(
                                                        context,
                                                        user.getJSONObject("Employee").getString(
                                                            "em_id"))
                                                    + ", date_cancelled="
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ", cost_rsres=0 "
                                                    + " WHERE res_id="
                                                    + reservationId
                                                    + " AND (status='Awaiting App.' OR status='Confirmed')";
                                    
                                    executeDbSql(context, sql, false);
                                    
                                    allOk = true;
                                    
                                } catch (final Throwable e) {
                                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                            + ": Failed sql: " + sql, errMessage, e);
                                }
                            } else {
                                allOk = false;
                                break;
                            }
                        } // for
                    }
                    // END: If the user doesn't belong the the SERVICE DESK or
                    // MANAGER groups, then check that enforces the requirements
                    // to cancel the reservation
                    
                    // BEGIN: If the user belong the the SERVICE DESK or MANAGER
                    // groups
                    else {
                        
                        for (final Iterator it = listReservationId.iterator(); it.hasNext();) {
                            
                            final Map record = (Map) it.next();
                            reservationId = getString(record, "res_id");
                            
                            // PC KB 3018035 - To check if the room reservation can be cancelled,
                            // get the city timezone and the date to check the GMT offset
                            sqlTimezone =
                                    " SELECT date_start, city.timezone_id"
                                            + " FROM reserve_rm INNER JOIN bl "
                                            + " ON reserve_rm.bl_id=bl.bl_id "
                                            + " LEFT OUTER JOIN city "
                                            + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id"
                                            + " WHERE res_id = "
                                            + reservationId
                                            + " AND (reserve_rm.status='Awaiting App.' OR reserve_rm.status='Confirmed')";
                            
                            finaloffset = 0;
                            
                            listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            if (!listTimezone.isEmpty()) {
                                final Map recordTimezone = (Map) listTimezone.get(0);
                                cityTimezone = getString(recordTimezone, "timezone_id");
                                dateCheckTimezone =
                                        getDateValue(context, recordTimezone.get("date_start"));
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                            }
                            
                            // Get the room reservation to cancel, and check if it's a late cancel
                            // or not
                            sql =
                                    " SELECT rmres_id, cost_rmres, cost_late_cancel_pct, "
                                            + " ( CASE WHEN ("
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " > cancel_days) OR (( "
                                            + formatSqlDaysBetween(context, currentDate,
                                                "reserve_rm.date_start")
                                            + " = cancel_days) AND ("
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + "<"
                                            + formatSqlAddMinutesToExpression(context,
                                                "cancel_time", Integer.toString(finaloffset))
                                            + ")) THEN 0 ELSE 1 END ) AS latecancel "
                                            + " FROM reserve_rm, rm_arrange "
                                            + " WHERE reserve_rm.bl_id= rm_arrange.bl_id AND reserve_rm.fl_id= rm_arrange.fl_id "
                                            + " AND reserve_rm.rm_id= rm_arrange.rm_id  "
                                            + " AND reserve_rm.config_id= rm_arrange.config_id "
                                            + " AND reserve_rm.rm_arrange_type_id= rm_arrange.rm_arrange_type_id "
                                            + " AND res_id= "
                                            + reservationId
                                            + " AND (reserve_rm.status='Awaiting App.' OR reserve_rm.status='Confirmed') ";
                            
                            final List listRmReservations = retrieveDbRecords(context, sql);
                            
                            // If there is a room reservation to cancel
                            if (!listRmReservations.isEmpty()) {
                                final Map RmReservations = (Map) listRmReservations.get(0);
                                final String rm_res_id = getString(RmReservations, "rmres_id");
                                final BigDecimal cost_rm_res =
                                        new BigDecimal(getString(RmReservations, "cost_rmres"));
                                final int cost_late_cancel_pct_rm =
                                        getIntegerValue(context,
                                            RmReservations.get("cost_late_cancel_pct")).intValue();
                                
                                BigDecimal CancellationCost_rm = new BigDecimal(0.0);
                                if (getString(RmReservations, "latecancel").equals("1")) {
                                    CancellationCost_rm =
                                            (cost_rm_res.multiply(new BigDecimal(
                                                cost_late_cancel_pct_rm)).divide(new BigDecimal(
                                                100.0), 0));
                                }
                                final String CancellationCostRm = CancellationCost_rm.toString();
                                
                                // Cancel the room reservation
                                try {
                                    sql =
                                            " UPDATE reserve_rm SET status = 'Cancelled'"
                                                    + ", user_last_modified_by="
                                                    + literal(
                                                        context,
                                                        user.getJSONObject("Employee").getString(
                                                            "em_id"))
                                                    + ", date_cancelled="
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime") + ", cost_rmres= "
                                                    + CancellationCostRm + " WHERE res_id="
                                                    + reservationId + " AND rmres_id= " + rm_res_id;
                                    executeDbSql(context, sql, false);
                                } catch (final Throwable e) {
                                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                            + ": Failed sql: " + sql, errMessage, e);
                                }
                            }
                            
                            // Get the list of resource reservations to cancel and dates,
                            // and it's site and building
                            sqlTimezone =
                                    " SELECT date_start, rsres_id, site_id, resources.bl_id"
                                            + " FROM reserve_rs INNER JOIN resources "
                                            + " ON reserve_rs.resource_id = resources.resource_id "
                                            + " WHERE res_id = "
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed') "
                                            + " ORDER BY rsres_id ";
                            
                            // Go through the resources to cancel and check if it's a late cancel or
                            // not
                            listTimezone = retrieveDbRecords(context, sqlTimezone);
                            
                            for (final Iterator it2 = listTimezone.iterator(); it2.hasNext();) {
                                // Get the resource's timezone offset
                                final Map recordResource = (Map) it2.next();
                                dateCheckTimezone =
                                        getDateValue(context, recordResource.get("date_start"));
                                cityTimezone =
                                        getResourceResTimezone(context,
                                            getString(recordResource, "site_id"),
                                            getString(recordResource, "bl_id"));
                                
                                finaloffset =
                                        getTotalMinutesOffset(context, cityTimezone,
                                            dateCheckTimezone);
                                
                                sql =
                                        " SELECT cost_rsres, cost_late_cancel_pct, "
                                                + " (CASE WHEN ("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + " > cancel_days) OR (("
                                                + formatSqlDaysBetween(context, currentDate,
                                                    "reserve_rs.date_start")
                                                + " = cancel_days) AND ("
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " < "
                                                + formatSqlAddMinutesToExpression(context,
                                                    "cancel_time", Integer.toString(finaloffset))
                                                + ")) THEN 0 ELSE 1 END ) AS latecancel "
                                                + " FROM reserve_rs, resources "
                                                + " WHERE reserve_rs.resource_id = resources.resource_id  "
                                                + " AND res_id="
                                                + reservationId
                                                + " AND rsres_id="
                                                + getString(recordResource, "rsres_id")
                                                + " AND (status='Awaiting App.' OR status='Confirmed') ";
                                
                                final List listRsReservations = retrieveDbRecords(context, sql);
                                
                                // If there is a resource reservation to cancel
                                if (!listRsReservations.isEmpty()) {
                                    final Map RsReservations = (Map) listRsReservations.get(0);
                                    final BigDecimal cost_rsres =
                                            new BigDecimal(getString(RsReservations, "cost_rsres"));
                                    final int cost_late_cancel_pct_rs =
                                            getIntegerValue(context,
                                                RsReservations.get("cost_late_cancel_pct"))
                                                .intValue();
                                    BigDecimal CancellationCost_rs = new BigDecimal(0.0);
                                    if (getString(RsReservations, "latecancel").equals("1")) {
                                        CancellationCost_rs =
                                                (cost_rsres.multiply(new BigDecimal(
                                                    cost_late_cancel_pct_rs)).divide(
                                                    new BigDecimal(100.0), 0));
                                    }
                                    final String CancellationCostRs =
                                            CancellationCost_rs.toString();
                                    // Cancel the resource reservation
                                    try {
                                        sql =
                                                " UPDATE reserve_rs SET status = 'Cancelled'"
                                                        + ", user_last_modified_by="
                                                        + literal(context,
                                                            user.getJSONObject("Employee")
                                                                .getString("em_id"))
                                                        + ", date_cancelled="
                                                        + formatSqlIsoToNativeDate(context,
                                                            "CurrentDateTime") + ", cost_rsres= "
                                                        + CancellationCostRs + " WHERE res_id="
                                                        + reservationId + " AND rsres_id= "
                                                        + getString(recordResource, "rsres_id");
                                        executeDbSql(context, sql, false);
                                    } catch (final Throwable e) {
                                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                                + ": Failed sql: " + sql, errMessage, e);
                                    }
                                }
                            }
                        }
                        allOk = true;
                    }
                    // END: If the user belong the the SERVICE DESK or MANAGER
                    // groups
                    
                    if (allOk) {
                        
                        allOk = false;
                        
                        for (final Iterator it = listReservationId.iterator(); it.hasNext();) {
                            
                            final Map record = (Map) it.next();
                            reservationId = getString(record, "res_id");
                            resParent = getString(record, "res_parent");
                            
                            // After cancelling the room or resources reservations in
                            // both cases normal or advanced users, the system must check
                            // the changes to do to the general reservation information table.
                            
                            // First, check if all room and resource reservations for
                            // the reserve record have been cancelled
                            sql =
                                    " SELECT res_id, " + " (SELECT COUNT(*) FROM reserve_rm "
                                            + " WHERE res_id="
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed')) "
                                            + " AS totalrm , "
                                            + " (SELECT "
                                            + formatSqlIsNull(context, "SUM(cost_rmres) , 0")
                                            + " FROM reserve_rm "
                                            + " WHERE res_id="
                                            + reservationId
                                            + ") AS costrm, "
                                            + " (SELECT COUNT(*) FROM reserve_rs "
                                            + " WHERE res_id="
                                            + reservationId
                                            + " AND (status='Awaiting App.' OR status='Confirmed')) "
                                            + " AS totalrs, "
                                            + " (SELECT "
                                            + formatSqlIsNull(context, "SUM(cost_rsres) , 0")
                                            + " FROM reserve_rs "
                                            + " WHERE res_id="
                                            + reservationId
                                            + ") AS costrs "
                                            + " FROM reserve WHERE res_id=" + reservationId;
                            
                            final List listCancelledReservations = retrieveDbRecords(context, sql);
                            BigDecimal costRm = new BigDecimal(0.0);
                            BigDecimal costRs = new BigDecimal(0.0);
                            int totalRm = -1;
                            int totalRs = -1;
                            
                            if (!listCancelledReservations.isEmpty()) {
                                final Map recordOfSqlCommon1 =
                                        (Map) listCancelledReservations.get(0);
                                totalRm =
                                        getIntegerValue(context, recordOfSqlCommon1.get("totalrm"))
                                            .intValue();
                                costRm = new BigDecimal(getString(recordOfSqlCommon1, "costrm"));
                                totalRs =
                                        getIntegerValue(context, recordOfSqlCommon1.get("totalrs"))
                                            .intValue();
                                costRs = new BigDecimal(getString(recordOfSqlCommon1, "costrs"));
                            }
                            final String costTot = (costRm.add(costRs)).toString();
                            
                            // Change the required reservation global fields
                            try {
                                sql =
                                        " UPDATE reserve "
                                                + " SET user_last_modified_by="
                                                + literal(context, user.getJSONObject("Employee")
                                                    .getString("em_id")) + ", cost_res =" + costTot;
                                
                                if (totalRm == 0 && totalRs == 0) {
                                    sql +=
                                            ",status='Cancelled',date_cancelled="
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime");
                                }
                                
                                sql += " WHERE res_id=" + reservationId;
                                
                                executeDbSql(context, sql, false);
                                
                                // Do the needed operations to the work requests
                                try {
                                    
                                    // Sometimes work requests can be cancelled, other times must
                                    // be stopped, and others we can't change the status
                                    sql =
                                            " UPDATE wr SET status='Can'"
                                                    + ", time_stat_chg="
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ", date_stat_chg ="
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime") + " WHERE res_id = "
                                                    + reservationId
                                                    + " AND status IN ('R','Rev','A','AA')";
                                    
                                    executeDbSql(context, sql, false);
                                    
                                    sql =
                                            " UPDATE wr "
                                                    + " SET status='S',time_stat_chg="
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ", date_stat_chg = "
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime") + " WHERE res_id = "
                                                    + reservationId
                                                    + " AND status IN ('I','HP','HA','HL')";
                                    
                                    executeDbSql(context, sql, false);
                                    // allOk = true;
                                    
                                    // Do the commit to ensure the notification
                                    // and work request WFR takes the updated or
                                    // generated information
                                    // executeDbCommit(context);
                                    
                                } catch (final Throwable e) {
                                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                            + ": Failed sql: " + sql, errMessage, e);
                                }
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: "
                                        + sql, errMessage, e);
                            }
                        }
                        
                        allOk = true;
                        
                        // Do the commit to ensure the notification and work
                        // request WFR takes the updated or generated
                        // information
                        // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                        // executeDbCommit(context);
                    }
                    
                    if (allOk) {
                        final ReservationsCommonHandler handler = new ReservationsCommonHandler();
                        // String to store the error message from the notify and
                        // sendInvitations WFRs
                        String errorMessage = "";
                        final String sendEmailNotifications =
                                getActivityParameterString(context, ACTIVITY_ID,
                                    "SendEmailNotifications");
                        
                        // 26/04/2007 Check if the system must send the email
                        // notifications
                        // 16/05/2007 KB items 3015439, 3015425
                        if (sendEmailNotifications != null
                                && sendEmailNotifications.toUpperCase().equals("YES")) {
                            // BEGIN: Notify
                            // it sets in context the res_id param to next wfr
                            if (single.toUpperCase().equals("YES")) {
                                context.addResponseParameter("res_id", reservationId);
                                context.addResponseParameter("res_parent", "0");
                            } else {
                                context.addResponseParameter("res_id", "0");
                                context.addResponseParameter("res_parent", resParent);
                            }
                            handler.notifyRequestedBy(context);
                            if (context.parameterExists("message")) {
                                errorMessage += context.getParameter("message");
                            }
                            handler.notifyRequestedFor(context);
                            if (context.parameterExists("message")) {
                                if (!(errorMessage.equals(context.getParameter("message")))) {
                                    if (!(errorMessage.length() == 0)) {
                                        errorMessage += "\n";
                                    }
                                    errorMessage += context.getParameter("message");
                                }
                            }
                            // END: Notify
                            // BEGIN: sendEmailInvitations
                            // Check if it must send email cancel invitations,
                            // and the dates to cancel
                            sql =
                                    "SELECT attendees,date_start,time_start,time_end,res_parent,res_type FROM reserve "
                                            + " WHERE reserve.res_id = " + reservationId;
                            
                            final List recordsSqlcancel = retrieveDbRecords(context, sql);
                            
                            if (!recordsSqlcancel.isEmpty()) {
                                
                                final Map recordOfSqlcancel = (Map) recordsSqlcancel.get(0);
                                final String sql_attendees =
                                        getString(recordOfSqlcancel, "attendees");
                                final String sql_res_type =
                                        getString(recordOfSqlcancel, "res_type");
                                final String sql_date_start =
                                        getDateValue(context, recordOfSqlcancel.get("date_start"))
                                            .toString();
                                final String sql_res_parent =
                                        getString(recordOfSqlcancel, "res_parent");
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"'
                                // [attendees]: "+sql_attendees);
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"'
                                // [date_start]: "+sql_date_start);
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"'
                                // [time_start]: "+sql_date_start);
                                // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"'
                                // [res_parent]: "+sql_res_parent);
                                // If it must send cancel invitations
                                if (!sql_attendees.equals("")) {
                                    // If it's a regular reservation
                                    if (sql_res_type.equals("regular")) {
                                        context.addResponseParameter("res_id", reservationId);
                                        context.addResponseParameter("res_parent", "0");
                                        context.addResponseParameter("date_cancel", null);
                                    }
                                    // If it's a recurring reservation
                                    else {
                                        context.addResponseParameter("res_id", "0");
                                        context.addResponseParameter("res_parent", sql_res_parent);
                                        // User wants to cancel only one date of
                                        // the recurrence
                                        if (single.toUpperCase().equals("YES")) {
                                            context.addResponseParameter("date_cancel",
                                                sql_date_start);
                                            // User wants to cancel all the
                                            // dates of the recurrence
                                        } else {
                                            context.addResponseParameter("date_cancel", null);
                                        }
                                    }
                                    context
                                        .addResponseParameter("email_invitations", sql_attendees);
                                    context.addResponseParameter("invitation_type", "cancel");
                                    context.addResponseParameter("require_reply",
                                        Boolean.valueOf("false"));
                                    context.addResponseParameter("Reservation", null);
                                    context.addResponseParameter("RoomConflicts", null);
                                    context.addResponseParameter("original_date", null);
                                    // Clear the error message parameter before
                                    // calling the WFR
                                    context.addResponseParameter("message", "");
                                    
                                    handler.sendEmailInvitations(context);
                                    if (context.parameterExists("message")) {
                                        if (!(errorMessage.length() == 0)) {
                                            errorMessage += "\n";
                                        }
                                        errorMessage += context.getParameter("message");
                                    }
                                }
                            }
                            // END: sendEmailInvitations
                        }
                        
                        // String to store the error message from the notify and
                        // sendInvitations WFRs
                        if (!(errorMessage.length() == 0)) {
                            context.addResponseParameter("message", errorMessage);
                        }
                        
                    }
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed sql: " + sql,
                        errMessage, e);
                }
            }
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            if (!context.parameterExists("message")
                    || StringUtil.isNullOrEmpty(context.getParameter("message"))) {
                context.addResponseParameter("message", "OK");
            }
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END cancelReservation wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN detectRoomConflicts wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * This rule gets the reservation request (recurring and regular) and checks if any request
     * causes a conflict with existing reservation records. Inputs: Reservation JSONObject
     * Information related to the main reservation RoomReservation JSONObject JavaScript object with
     * the information related to the selected room arrangement ResourceReservations JSONObject
     * Information related to the resource reservations User JSONObject JavaScript object with the
     * connected user information Outputs: message String Error returned if the information is not
     * found roomConflicts JSONObject List of all room reservations that conflict resourceConflicts
     * JSONObject List of all resource reservations that conflict
     * 
     * @param context Event handler context.
     */
    public void detectRoomConflicts(final String jsonReservation) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String RULE_ID = "detectRoomConflicts";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the selected arrangement from the input parameter
        final String jsonExpression = jsonReservation;
        // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"' [JSONExpression input]:
        // "+jsonExpression);
        // Create the output JSON Array
        final JSONArray jsonResult = new JSONArray();
        final JSONArray jsonRoomConflict = new JSONArray();
        final JSONArray jsonResourceConflict = new JSONArray();
        boolean allOk = false;
        int preBlock = 0;
        int postBlock = 0;
        
        // getArrangementFixedResources rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "DETECTROOMCONFLICTS_WFR",
                    "DETECTROOMCONFLICTSERROR", null);
        
        try {
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            final JSONObject reservation = objectsToSave.getJSONObject(0);
            final JSONObject roomReservation = objectsToSave.getJSONObject(1);
            final JSONArray resourceReservations = objectsToSave.getJSONArray(2);
            final JSONObject user = objectsToSave.getJSONObject(3);
            try {
                user.put("groups", user.getJSONArray("groups"));
            } catch (final Throwable e) {
                user.put("groups",
                    user.getJSONObject("groups").toJSONArray(user.getJSONObject("groups").names()));
            }
            
            String sql = "";
            
            if (reservation.getString("res_type").equals("regular")) {
                allOk =
                        detectRoomConflictsForRegular(context, objectsToSave, reservation,
                            roomReservation, resourceReservations, jsonResourceConflict, user);
            }
            
            if (reservation.getString("res_type").equals("recurring")) {
                
                // BEGIN: Room Conflict
                
                sql =
                        " SELECT pre_block, post_block " + " FROM rm_arrange " + " WHERE bl_id = "
                                + literal(context, roomReservation.getString("bl_id"))
                                + " AND fl_id = "
                                + literal(context, roomReservation.getString("fl_id"))
                                + " AND rm_id = "
                                + literal(context, roomReservation.getString("rm_id"))
                                + " AND config_id = "
                                + literal(context, roomReservation.getString("config_id"))
                                + " AND rm_arrange_type_id = "
                                + literal(context, roomReservation.getString("rm_arrange_type_id"));
                
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[sql_PreAndPost]: "+sql);
                
                final List listRecordsPreAndPost = retrieveDbRecords(context, sql);
                // it gets pre and post block
                if (!listRecordsPreAndPost.isEmpty()) {
                    final Map valuesPreAndPost = (Map) listRecordsPreAndPost.get(0);
                    preBlock = Integer.parseInt(getString(valuesPreAndPost, "pre_block"));
                    postBlock = Integer.parseInt(getString(valuesPreAndPost, "post_block"));
                }
                
                final int postblockTime = preBlock + postBlock;
                
                for (int i = 0; i < reservation.getJSONArray("date_start").length(); i++) {
                    
                    // PC KB 3015543
                    sql =
                            " SELECT 1 FROM reserve_rm r, rm_config c "
                                    + " WHERE status NOT IN ('Cancelled','Rejected') ";
                    if (propertyExistsNotNull(reservation, "res_id")) {
                        sql +=
                                " AND res_id <> "
                                        + literal(context, reservation.getString("res_id")) + " ";
                    }
                    sql +=
                            " AND r.bl_id=c.bl_id AND r.fl_id=c.fl_id AND r.rm_id=c.rm_id AND r.config_id=c.config_id ";
                    sql +=
                            " AND c.bl_id = "
                                    + literal(context, roomReservation.getString("bl_id"))
                                    + " AND c.fl_id = "
                                    + literal(context, roomReservation.getString("fl_id"))
                                    + " AND c.rm_id = "
                                    + literal(context, roomReservation.getString("rm_id"))
                                    + " AND (c.config_id = "
                                    + literal(context, roomReservation.getString("config_id"))
                                    + " OR c.excluded_config LIKE '%'''"
                                    + formatSqlConcat(context)
                                    + literal(context, roomReservation.getString("config_id"))
                                    + formatSqlConcat(context)
                                    + " '''%' ) "
                                    + " AND date_start = "
                                    + formatSqlIsoToNativeDate(context, (String) reservation
                                        .getJSONArray("date_start").get(i))
                                    + " AND time_start < "
                                    + formatSqlAddMinutes(context,
                                        reservation.getString("time_end"),
                                        Integer.toString(postblockTime))
                                    + " AND time_end > "
                                    + formatSqlAddMinutes(context,
                                        reservation.getString("time_start"),
                                        Integer.toString(-postblockTime)) + " ";
                    
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[sql_Exists]:
                    // "+sql);
                    final List listExists = retrieveDbRecords(context, sql);
                    
                    if (!listExists.isEmpty()) {
                        final JSONObject jsonConflict = new JSONObject();
                        jsonConflict.put("original_date_start",
                            reservation.getJSONArray("date_start").get(i));
                        jsonConflict.put("date_start", reservation.getJSONArray("date_start")
                            .get(i));
                        jsonConflict.put("time_start", roomReservation.getString("time_start"));
                        jsonConflict.put("time_end", roomReservation.getString("time_end"));
                        jsonConflict.put("site_id", reservation.getString("site_id"));
                        jsonConflict.put("bl_id", roomReservation.getString("bl_id"));
                        jsonConflict.put("fl_id", roomReservation.getString("fl_id"));
                        jsonConflict.put("rm_id", roomReservation.getString("rm_id"));
                        jsonConflict.put("config_id", roomReservation.getString("config_id"));
                        jsonConflict.put("rm_arrange_type_id",
                            roomReservation.getString("rm_arrange_type_id"));
                        // @translatable
                        final String roomUnavailable = "Room arrangement unavailable";
                        jsonConflict.put("reason", localizeString(context, roomUnavailable));
                        // do not translate
                        jsonConflict.put("status", "Deleted");
                        // @translatable
                        final String statusDeleted = "Deleted";
                        jsonConflict.put("status_text", localizeString(context, statusDeleted));
                        
                        jsonRoomConflict.put(jsonConflict);
                        
                    }
                }
            }
            
            // Add the output parameter
            jsonResult.put(jsonRoomConflict);
            jsonResult.put(jsonResourceConflict);
            context.addResponseParameter("jsonExpression", jsonResult.toString());
            // this.log.info( ACTIVITY_ID+"-"+RULE_ID+": jsonExpression
            // "+jsonResult.toString() );
            
            allOk = true;
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        } else {
            context.addResponseParameter("message", "OK");
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END detectRoomConflicts wfr
    // ---------------------------------------------------------------------------------------------
    
    private boolean detectRoomConflictsForRegular(final EventHandlerContext context,
            final JSONArray objectsToSave, final JSONObject reservation,
            final JSONObject roomReservation, final JSONArray resourceReservations,
            final JSONArray resourceConflicts, final JSONObject user) {
        
        int nResourceConflicts = 0;
        for (int i = 0; i < resourceReservations.length(); i++) {
            final JSONObject resourceReservation = resourceReservations.getJSONObject(i);
            resourceReservation.put("bl_id", roomReservation.getString("bl_id"));
            resourceReservation.put("fl_id", roomReservation.getString("fl_id"));
            resourceReservation.put("rm_id", roomReservation.getString("rm_id"));
            
            final Map resource =
                    getResourceById(context, resourceReservation.getString("resource_id"));
            
            if (resource == null) {
                return false;
            }
            // *1* The resource standard should be allowed in the new room
            if (!checkIfStandardAllowedInRoom(context, roomReservation, resource,
                resourceReservation, resourceConflicts, nResourceConflicts)) {
                nResourceConflicts++;
                continue;
            }
            
            // 2* The resource start and end time should not conflict with the
            // requested room times
            if (!checkIfResourceConsistantWithRoomReservation(context, resource,
                resourceReservation, roomReservation, resourceConflicts, nResourceConflicts)) {
                nResourceConflicts++;
                continue;
            }
            
            // *3* Resource timeslot will automatically adapt to room timeslot
            if (!adaptToRoomTimeslot(context, resource, resourceReservation, roomReservation,
                resourceConflicts, nResourceConflicts, user)) {
                nResourceConflicts++;
                continue;
            }
        }
        return true;
    }
    
    private boolean adaptToRoomTimeslot(final EventHandlerContext context, final Map resource,
            final JSONObject resourceReservation, final JSONObject roomReservation,
            final JSONArray resourceConflicts, final int nResourceConflicts, final JSONObject user) {
        // TODO Auto-generated method stub
        final Time roomTimeStart = getTimeFromString(roomReservation.getString("time_start"));
        final Time roomTimeEnd = getTimeFromString(roomReservation.getString("time_end"));
        final Time resourceTimeStart =
                getTimeFromString(resourceReservation.getString("starttime"));
        final Time resourceTimeEnd = getTimeFromString(resourceReservation.getString("endtime"));
        // Temporaly solve the KB 3018670. 2008-07-16 by zy.
        final int length = ((String) resource.get("day_start")).split(" ").length;
        final Time dayStart =
                getTimeFromString(((String) resource.get("day_start")).split(" ")[length - 1]);
        final Time dayEnd =
                getTimeFromString(((String) resource.get("day_end")).split(" ")[length - 1]);
        
        final JSONObject resourceConflict = new JSONObject();
        // If the resource reservation date or times should be changed and adapted to room timeslot
        if (!roomReservation.getString("date_start").equalsIgnoreCase(
            resourceReservation.getString("date_start"))
                || (roomTimeStart.after(resourceTimeStart))
                || (roomTimeEnd.before(resourceTimeEnd))) {
            
            resourceConflict
                .put("original_date_start", resourceReservation.getString("date_start"));
            resourceConflict.put("original_time_start", resourceReservation.getString("starttime"));
            resourceConflict.put("original_time_end", resourceReservation.getString("endtime"));
            resourceConflict.put("date_start", roomReservation.getString("date_start"));
            resourceConflict.put("resource_id", resourceReservation.getString("resource_id"));
            resourceConflict.put("quantity", resourceReservation.getInt("quantity"));
            
            if ((resourceTimeStart.before(roomTimeStart)) || (resourceTimeStart.after(roomTimeEnd))) {
                // max(roomreservation.time_start,day_start)
                resourceConflict.put("time_start",
                    (roomTimeStart.after(dayStart)) ? roomReservation.getString("time_start")
                            : (String) resource.get("day_start"));
            } else {
                resourceConflict.put("time_start", resourceReservation.getString("starttime"));
            }
            
            if ((resourceTimeEnd.after(roomTimeEnd)) || (resourceTimeEnd.before(roomTimeStart))) {
                // min(roomreservation.time_end,day_end)
                resourceConflict.put("time_end",
                    (roomTimeEnd.before(dayEnd)) ? roomReservation.getString("time_end")
                            : (String) resource.get("day_end"));
            } else {
                resourceConflict.put("time_end", resourceReservation.getString("endtime"));
            }
            
            // @translatable
            final String timeslotChanged = "Timeslot changed to room reservation";
            resourceConflict.put("reason", localizeString(context, timeslotChanged));
            // do not translate
            resourceConflict.put("status", "Resolved");
            // @translatable
            final String statusResolved = "Resolved";
            resourceConflict.put("status_text", localizeString(context, statusResolved));
            
            final String resourceType = (String) resource.get("resource_type");
            final Time original_time_start =
                    getTimeFromString(resourceConflict.getString("original_time_start"));
            final Time original_time_end =
                    getTimeFromString(resourceConflict.getString("original_time_end"));
            final Time time_start = getTimeFromString(resourceConflict.getString("time_start"));
            final Time time_end = getTimeFromString(resourceConflict.getString("time_end"));
            
            if ((!resourceType.equalsIgnoreCase("unlimited"))
                    && ((!resourceConflict.getString("original_date_start").equalsIgnoreCase(
                        resourceConflict.getString("date_start")))
                            || original_time_start.after(time_start)
                            || original_time_end.before(time_start)
                            || original_time_end.before(time_end) || original_time_start
                        .after(time_end))) {
                // Get reserved number of this resource in this timeslot and compare
                // this with the
                // actual quantity available of this resource
                // If unavailable
                // resourceConflicts[nResourceConflicts].reason = �Unavailable in
                // new timeslot�
                // resourceConflicts[nResourceConflicts].status = �Deleted�
                final String oldDateStart = resourceReservation.getString("date_start");
                
                // Here use adjusted time slot to checkResourceAvailability, then restore original
                // date and time.
                // Added for KB3018961, by ZY 2008-07-31.
                final String oldTimeStart = resourceReservation.getString("starttime");
                final String oldTimeEnd = resourceReservation.getString("endtime");
                resourceReservation.put("starttime", resourceConflict.getString("time_start"));
                resourceReservation.put("endtime", resourceConflict.getString("time_end"));
                
                resourceReservation.put("date_start", resourceConflict.getString("date_start"));
                if (!checkResourceAvailability(context, resourceReservation)) {
                    // @translatable
                    final String resourceUnavailable = "Resource unavailable in new timeslot";
                    resourceConflict.put("reason", localizeString(context, resourceUnavailable));
                    // do not translate
                    resourceConflict.put("status", "Deleted");
                    // @translatable
                    final String statusDeleted = "Deleted";
                    resourceConflict.put("status_text", localizeString(context, statusDeleted));
                }
                resourceReservation.put("date_start", oldDateStart);
                // Added for KB3018961, by ZY 2008-07-31.
                resourceReservation.put("starttime", oldTimeStart);
                resourceReservation.put("endtime", oldTimeEnd);
            }
            
            // @translatable
            final String resourceUnavailable = "Resource unavailable in new timeslot";
            
            user.getJSONArray("groups");
            
            // Get the difference between the date_start and current date to check if user enforces
            // the times restrictions
            final Date current =
                    new Date(new Date().getYear(), new Date().getMonth(), new Date().getDate(), 0,
                        0, 0);
            Date date_start =
                    getDateValue(context, resourceConflict.getString("date_start") + " 00:00:00");
            date_start =
                    new Date(date_start.getYear(), date_start.getMonth(), date_start.getDate(), 0,
                        0, 0);
            final long daysdiff =
                    (date_start.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
            
            // Do the check on [announce_days], [announce_time] and [max_days_ahead] for the
            // [resource]
            // PC KB 3021375
            
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                // Do the check on [max_days_ahead] for the [resource]
                // PC KB 3021918
                if (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT")) {
                    final int max_days_ahead =
                            Integer.parseInt((String) resource.get("max_days_ahead"));
                    if (daysdiff > max_days_ahead) {
                        resourceConflict
                            .put("reason", localizeString(context, resourceUnavailable));
                        // do not translate
                        resourceConflict.put("status", "Deleted");
                        // @translatable
                        final String statusDeleted = "Deleted";
                        resourceConflict.put("status_text", localizeString(context, statusDeleted));
                    }
                }
                
                // Do the check on [announce_days] and [announce_time] for the [resource]
                final int announce_days = Integer.parseInt((String) resource.get("announce_days"));
                final Time announce_time = getTimeValue(context, resource.get("announce_time"));
                
                // PC KB 3018035 - We need to use timezone offset for doing times check
                String cityTimezone = (String) resource.get("timezone1");
                if (cityTimezone.trim().equals("")) {
                    cityTimezone = (String) resource.get("timezone2");
                }
                final int finaloffset =
                        getTotalMinutesOffset(context, cityTimezone,
                            getDateValue(context, resourceConflict.getString("date_start")));
                final Date currentdatetime = new Date();
                
                if (daysdiff < announce_days) {
                    resourceConflict.put("reason", localizeString(context, resourceUnavailable));
                    // do not translate
                    resourceConflict.put("status", "Deleted");
                } else if (daysdiff == announce_days) {
                    final Date announcedatetime =
                            new Date(new Date().getYear(), new Date().getMonth(),
                                new Date().getDate(), announce_time.getHours(),
                                announce_time.getMinutes(), announce_time.getSeconds());
                    long time = announcedatetime.getTime();
                    time += (finaloffset * 60 * 1000);
                    announcedatetime.setTime(time);
                    
                    if (!(currentdatetime.getTime() < announcedatetime.getTime())) {
                        resourceConflict
                            .put("reason", localizeString(context, resourceUnavailable));
                        // do not translate
                        resourceConflict.put("status", "Deleted");
                        // @translatable
                        final String statusDeleted = "Deleted";
                        resourceConflict.put("status_text", localizeString(context, statusDeleted));
                    }
                }
                
                // KB 3018035 Also check that reservation doesn't occur in the past
                final Date reservationdatetime =
                        new Date(date_start.getYear(), date_start.getMonth(), date_start.getDate(),
                            time_start.getHours(), time_start.getMinutes(), time_start.getSeconds());
                
                long time = reservationdatetime.getTime();
                time += (finaloffset * 60 * 1000);
                reservationdatetime.setTime(time);
                
                if (!(currentdatetime.getTime() < reservationdatetime.getTime())) {
                    resourceConflict.put("reason", localizeString(context, resourceUnavailable));
                    // do not translate
                    resourceConflict.put("status", "Deleted");
                    // @translatable
                    final String statusDeleted = "Deleted";
                    resourceConflict.put("status_text", localizeString(context, statusDeleted));
                }
            }
            
            resourceConflicts.put(nResourceConflicts, resourceConflict);
            return false;
        }
        return true;
    }
    
    private boolean checkIfResourceConsistantWithRoomReservation(final EventHandlerContext context,
            final Map resource, final JSONObject resourceReservation,
            final JSONObject roomReservation, final JSONArray resourceConflicts,
            final int nResourceConflicts) {
        
        final JSONObject resourceConflict = new JSONObject();
        
        // Get the [day_end] and [day_start] for the [resource]
        // Temporaly solve the KB 3018670. 2008-07-16 by zy.
        final int length = ((String) resource.get("day_start")).split(" ").length;
        final Time dayStart =
                getTimeFromString(((String) resource.get("day_start")).split(" ")[length - 1]);
        final Time dayEnd =
                getTimeFromString(((String) resource.get("day_end")).split(" ")[length - 1]);
        final Time roomTimeStart = getTimeFromString(roomReservation.getString("time_start"));
        final Time roomTimeEnd = getTimeFromString(roomReservation.getString("time_end"));
        
        if ((roomTimeStart.after(dayEnd)) || (roomTimeEnd.before(dayStart))) {
            resourceConflict
                .put("original_date_start", resourceReservation.getString("date_start"));
            resourceConflict.put("original_time_start", resourceReservation.getString("starttime"));
            resourceConflict.put("original_time_end", resourceReservation.getString("endtime"));
            resourceConflict.put("date_start", roomReservation.getString("date_start"));
            resourceConflict.put("resource_id", resourceReservation.getString("resource_id"));
            resourceConflict.put("quantity", resourceReservation.getInt("quantity"));
            resourceConflict.put("time_start", roomReservation.getString("time_start"));
            resourceConflict.put("time_end", roomReservation.getString("time_end"));
            
            // @translatable
            final String resourceUnavailable = "Resource unavailable because of time limits";
            resourceConflict.put("reason", localizeString(context, resourceUnavailable));
            // do not translate
            resourceConflict.put("status", "Deleted");
            // @translatable
            final String statusDeleted = "Deleted";
            resourceConflict.put("status_text", localizeString(context, statusDeleted));
            
            resourceConflicts.put(nResourceConflicts, resourceConflict);
            return false;
        }
        return true;
    }
    
    private Map getResourceById(final EventHandlerContext context, final String resourceId) {
        // TODO Auto-generated method stub
        String sql = "SELECT resources.resource_id, resources.resource_std,";
        sql += "resources.day_start, resources.day_end, resources.max_days_ahead, ";
        sql += "resources.pre_block, resources.post_block, resources.resource_type ";
        
        // PC KB 3021375 - For doing time checks we need the timezone offset
        // for the resource and date involved, so we'll do this check later
        sql += " , announce_days, announce_time, ";
        // Get timezone from the resources.site_id
        sql +=
                " (SELECT city.timezone_id FROM site LEFT OUTER JOIN city "
                        + " ON city.city_id=site.city_id AND city.state_id=site.state_id "
                        + " WHERE site.site_id = resources.site_id ) AS timezone1, ";
        // Get timezone from the resources.bl_id
        sql +=
                " (SELECT city.timezone_id FROM bl LEFT OUTER JOIN city "
                        + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id "
                        + " WHERE bl.bl_id = resources.bl_id ) AS timezone2 ";
        // END PC KB 3021375
        
        sql +=
                " FROM resources LEFT OUTER JOIN resource_std ON resources.resource_std = resource_std.resource_std ";
        sql += " WHERE resource_id=" + literal(context, resourceId);
        
        final List recordsSql = retrieveDbRecords(context, sql);
        if (!recordsSql.isEmpty()) {
            return (Map) recordsSql.get(0);
        }
        return null;
    }
    
    private boolean checkIfStandardAllowedInRoom(final EventHandlerContext context,
            final JSONObject roomReservation, final Map resource,
            final JSONObject resourceReservation, final JSONArray resourceConflicts,
            final int nResourceConflicts) {
        
        final JSONObject resourceConflict = new JSONObject();
        
        String sql = " SELECT res_stds_not_allowed ";
        sql += " FROM rm_arrange ";
        sql += " WHERE bl_id=" + literal(context, roomReservation.getString("bl_id"));
        sql += " AND fl_id=" + literal(context, roomReservation.getString("fl_id"));
        sql += " AND rm_id=" + literal(context, roomReservation.getString("rm_id"));
        sql += " AND config_id=" + literal(context, roomReservation.getString("config_id"));
        sql +=
                " AND rm_arrange_type_id="
                        + literal(context, roomReservation.getString("rm_arrange_type_id"));
        
        final List recordsSql = retrieveDbRecords(context, sql);
        if (!recordsSql.isEmpty()) {
            final Map record = (Map) recordsSql.get(0);
            final String res_stds_not_allowed = (String) (record.get("res_stds_not_allowed"));
            if (res_stds_not_allowed != null) {
                final String[] rs = res_stds_not_allowed.split(",");
                if (rs.length > 0) {
                    for (final String element : rs) {
                        // PC KB 3021773 Changed to check resource_std against room arrangement
                        // resources standards not allowed
                        if (element.equalsIgnoreCase("\'" + (String) resource.get("resource_std")
                                + "\'")) {
                            
                            resourceConflict.put("original_date_start",
                                resourceReservation.getString("date_start"));
                            resourceConflict.put("original_time_start",
                                resourceReservation.getString("starttime"));
                            resourceConflict.put("original_time_end",
                                resourceReservation.getString("endtime"));
                            resourceConflict.put("date_start",
                                roomReservation.getString("date_start"));
                            resourceConflict.put("resource_id",
                                resourceReservation.getString("resource_id"));
                            resourceConflict
                                .put("quantity", resourceReservation.getInt("quantity"));
                            resourceConflict.put("time_start",
                                resourceReservation.getString("starttime"));
                            resourceConflict.put("time_end",
                                resourceReservation.getString("endtime"));
                            // @translatable
                            final String resourceUnavailable = "Resource not allowed in this room";
                            resourceConflict.put("reason",
                                localizeString(context, resourceUnavailable));
                            // do not translate
                            resourceConflict.put("status", "Deleted");
                            // @translatable
                            final String statusDeleted = "Deleted";
                            resourceConflict.put("status_text",
                                localizeString(context, statusDeleted));
                            
                            resourceConflicts.put(nResourceConflicts, resourceConflict);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN getReservationType wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * gets the value of res_type for a res_id Inputs: res_id Reserve id (String); Outputs: res_type
     * The reserve Type (String) message Error returned if the information is not found
     * 
     * @param context Event handler context.
     */
    public void getReservationType(final EventHandlerContext context) {
        
        final String RULE_ID = "getReservationType";
        // this.log.info("Executing '"+ACTIVITY_ID+"-"+RULE_ID+"' .... ");
        // Get the input parameter
        final String xmlResId = (String) context.getParameter("res_id");
        String resId = "";
        String resType = "";
        boolean allOk = false;
        final JSONObject result = new JSONObject();
        
        // readRequestorProperties rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "GETRESERVATIONTYPE_WFR",
                    "GETRESERVATIONTYPERERROR", null);
        
        // Get the reservation identifier from the XML structure
        try {
            if (!xmlResId.equals("")) {
                final SAXReader xmlReader = new SAXReader();
                final Document xmlDoc = xmlReader.read(new StringReader(xmlResId));
                final Attribute reservationIdValue =
                        (Attribute) xmlDoc.getRootElement().attributes().get(0);
                resId = reservationIdValue.getValue();
            }
        } catch (final Throwable e) {
            resId = "";
            // this.log.info(ACTIVITY_ID + "-" + RULE_ID + ": Failed parse XML "
            // + e);
        }
        
        try {
            String sql = "";
            try {
                sql =
                        " SELECT res_type " + " FROM reserve " + " WHERE res_id="
                                + literal(context, resId);
                
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[sql_res]: "+sql);
                final List listEm = retrieveDbRecords(context, sql);
                
                if (!listEm.isEmpty()) {
                    final Map values = (Map) listEm.get(0);
                    resType = getString(values, "res_type");
                    allOk = true;
                }
                
                // Add the employee information object as output parameter
                result.put("resType", resType);
                result.put("xmlResId", xmlResId);
                context.addResponseParameter("jsonExpression", result.toString());
                
                // this.log.info(ACTIVITY_ID+"-"+RULE_ID+": resType:
                // "+result.toString());
                
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Failed res table: " + sql,
                    errMessage, e);
            }
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception ", errMessage, e);
        }
        
        if (!allOk) {
            context.addResponseParameter("message", errMessage);
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // END getReservationType wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN loadTimezonesTimeline wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * return a timeline object where only timemarks are created and no resources or events exist
     * just to show to the user a city selected timezone times header to compare with current room
     * or resources timezone header. Inputs: timezoneId selected timezone to show; siteId console
     * selected site; dateStart the date to check timezones offset. Outputs: jsonExpression JSON
     * string containing timeline info.
     * 
     * @param context Event handler context.
     */
    public void loadTimezonesTimeline(final String timeZoneId, final String siteId,
            final String strDateStart, final String jsonTimemarks) {
        final String RULE_ID = "loadTimezonesTimeline";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        Date dateStart = getDateValue(context, strDateStart);
        
        // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [timeZoneId]: "+timeZoneId+" [siteId]: "+siteId+"
        // [minorToMajorRatio]: "+minorToMajorRatio+" [dateTimeEnd]: "+timelineTimeEnd+"
        // [dateStart]: "+dateStart_str);
        
        // Generate the output Timeline object
        final JSONObject timelinetz = new JSONObject();
        
        // We have the console searched site_id, get it's timezone offset
        String sql = "";
        
        sql = "SELECT city.timezone_id";
        sql += " FROM site LEFT OUTER JOIN city ";
        sql += " ON city.city_id=site.city_id AND city.state_id=site.state_id";
        sql += " WHERE site_id = " + literal(context, siteId);
        
        final List recordsSql = retrieveDbRecords(context, sql);
        String siteCityTimezone = "";
        int minutesoffsetsite = 0;
        
        if (!recordsSql.isEmpty()) {
            final Map recordOfSql = (Map) recordsSql.get(0);
            siteCityTimezone = getString(recordOfSql, "timezone_id");
            TimeZone siteTz;
            if (!siteCityTimezone.equals("")) {
                siteTz = TimeZone.getTimeZone(siteCityTimezone);
            } else {
                siteTz = TimeZone.getDefault();
            }
            minutesoffsetsite = (siteTz.getOffset(dateStart.getTime()) / 60000);
        }
        
        // We have the user selected timeZoneId, get it's timezone offset
        int minutesoffset = 0;
        TimeZone tz;
        if (!timeZoneId.equals("")) {
            tz = TimeZone.getTimeZone(timeZoneId);
        } else {
            tz = TimeZone.getDefault();
        }
        minutesoffset = (tz.getOffset(dateStart.getTime()) / 60000);
        
        final int offsetdiff = minutesoffset - minutesoffsetsite;
        
        // loadTimeline rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "LOADTIMELINE_WFR", "LOADTIMELINEERROR", null);
        
        try {
            final JSONArray objectsToSave = new JSONArray("" + jsonTimemarks + ")");
            final JSONArray timemarks = objectsToSave.getJSONArray(0);
            JSONObject timemark = null;
            long time = 0;
            final SimpleDateFormat timeFormatter = new SimpleDateFormat("HH:mm:ss");
            
            for (int i = 0; i < timemarks.length(); i++) {
                timemark = timemarks.getJSONObject(i);
                final String dateTimeStart = timemark.getString("dateTimeStart");
                final Time TimeStart = getTimeFromString(dateTimeStart);
                dateStart =
                        new Date(dateStart.getYear(), dateStart.getMonth(), dateStart.getDate(),
                            TimeStart.getHours(), TimeStart.getMinutes(), TimeStart.getSeconds());
                time = dateStart.getTime();
                time += offsetdiff * 60 * 1000;
                dateStart.setTime(time);
                
                final String dateTimeLabel =
                        EventHandlerBase.formatFieldValue(context, dateStart, "java.sql.Time",
                            "aTime", true);
                
                timemark.put("dateTimeStart", timeFormatter.format(dateStart));
                timemark.put("dateTimeLabel", dateTimeLabel);
                timemarks.put(i, timemark);
                
            }
            
            timelinetz.put("timemarks", timemarks);
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + ": Global Exception ", errMessage, e);
        }
        
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + " timelinetz: " + timelinetz.toString());
        context.addResponseParameter("jsonExpression", timelinetz.toString());
    }
    
} // class
