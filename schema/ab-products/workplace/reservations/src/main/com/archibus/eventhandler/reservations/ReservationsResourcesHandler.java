package com.archibus.eventhandler.reservations;

import java.math.BigDecimal;
import java.sql.Time;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;

public class ReservationsResourcesHandler extends ReservationsEventHandlerBase {
    
    static final String ACTIVITY_ID = "AbWorkplaceReservations";
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN readAvailableResources wfr
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Get all resources the current user is authorized for and that meet the criteria of the
     * console. A flag determines if time criteria in the console have to be met, or not (giving the
     * user a chance to find an alternative)
     * 
     * Inputs: User : Info on the current user ResourceReservations : Info on all resource
     * reservations in this general reservation RoomReservation : Info on the general reservation
     * Reservation : Info on the linked room reservation AvailableForTimeframeOnly : A flag
     * indicating if time criteria have to be met or not Outputs: ResourceNatures : A list of
     * tabnames to categorize the resources UniqueResources : A list of available unique resources
     * NonUniqueResources : A list of available non unique resources ConcurrentResourceReservations
     * : A list of all reservations for the available resources for the day, except for the
     * reservations of the current reservation ResourceReservations : In the list of resource
     * reservations flags have been set to indicate if they are editable or removable Message : Info
     * on error
     * 
     * @param context Event handler context.
     */
    public void readAvailableResources(final String reservation, String AvailableForTimeframeOnly) {
        final String RULE_ID = "readAvailableResources";
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String jsonExpression = reservation;
        
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' ..... ");
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "READAVAILABLERESOURCES_WFR",
                    "READAVAILABLERESOURCESERROR", null);
        
        // initializing parameters
        JSONArray concurrentResourceReservationJsonArray = new JSONArray();
        JSONObject User = null;
        JSONArray ResourceReservations = null;
        JSONObject RoomReservation = null;
        JSONObject Reservation = null;
        List StandardsNotAllowed = null;
        List uniqueResources = new ArrayList();
        List nonUniqueResources = new ArrayList();
        Set ResourceNatures = null;
        // kb#3028194: Added for showing localization values of enum list of field resource nature
        Set ResourceNaturesEnumlist = null;
        final ArrayList nonUniqueResourceID = new ArrayList();
        final ArrayList uniqueResourceID = new ArrayList();
        List ConcurrentresourceReservations = null;
        // AvailableForTimeframeOnly = "false";
        
        String sql = "";
        
        String dateSet = "";
        String dateStart = "";
        String dateLastStart = "";
        
        try {
            
            // get input parameters from context
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            
            User = objectsToSave.getJSONObject(0);
            Reservation = objectsToSave.getJSONObject(1);
            
            RoomReservation = objectsToSave.getJSONObject(2);
            ResourceReservations = objectsToSave.getJSONArray(3);
            
            // if lenght !=0 if resourcereservation[0].rsres_id!=null :
            // AvailableForTimeframeOnly=true
            if (ResourceReservations.length() != 0) {
                AvailableForTimeframeOnly = "false";
            }
            
            // Initialization of response parameters
            StandardsNotAllowed = null;
            uniqueResources = new ArrayList();
            nonUniqueResources = new ArrayList();
            ResourceNatures = new HashSet();
            // kb#3028194: Added for showing localization values of enum list of field resource
            // nature
            ResourceNaturesEnumlist = new HashSet();
            ConcurrentresourceReservations = new ArrayList();
            
            // BEGIN: it gets dateset in a dateSet var
            for (int i = 0; i < Reservation.getJSONArray("date_start").length(); i++) {
                dateSet +=
                        " "
                                + formatSqlIsoToNativeDate(context,
                                    Reservation.getJSONArray("date_start").getString(i));
                if (i != (Reservation.getJSONArray("date_start").length() - 1)) {
                    dateSet += ",";
                }
            }
            dateStart = Reservation.getJSONArray("date_start").getString(0);
            dateLastStart =
                    Reservation.getJSONArray("date_start").getString(
                        (Reservation.getJSONArray("date_start").length() - 1));
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID
                    + " : Could not retrieve parameters from context : ", errMessage, e);
        }
        
        try {
            
            // PC - KB item 3016454 Removed the default values for time_start and time_end
            
            final JSONArray groups = User.getJSONArray("groups");
            
            // In case of a room reservation with resources, some room
            // arrangements don't allow certain resource standards.
            if (RoomReservation.getString("bl_id").equals("null")
                    || RoomReservation.getString("bl_id").equals("")) {
                StandardsNotAllowed = null;
            }
            
            sql =
                    " SELECT res_stds_not_allowed FROM rm_arrange WHERE rm_arrange.bl_id = "
                            + literal(context, RoomReservation.getString("bl_id"))
                            + " AND rm_arrange.fl_id = "
                            + literal(context, RoomReservation.getString("fl_id"))
                            + " AND rm_arrange.rm_id = "
                            + literal(context, RoomReservation.getString("rm_id"))
                            + " AND rm_arrange.config_id = "
                            + literal(context, RoomReservation.getString("config_id"))
                            + " AND rm_arrange.rm_arrange_type_id = "
                            + literal(context, RoomReservation.getString("rm_arrange_type_id"));
            // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "' sql1: "+sql);
            StandardsNotAllowed = selectDbRecords(context, sql);
            
            /*
             * Execute SQL2 to query the resource table for all resources that meet the console
             * criteria and the authorization criteria for the current user.
             * 
             * In this query: (1)A resource has to be reservable (2)The resource must be of the
             * requested standard (3)The resource must be available in the requested site (4)The
             * resource must be available in the requested building (5)The availableforgroup field
             * must be empty or any of the user groups must be the availableforgroup value (not for
             * service desk or reservation manager) (6)The resource cannot have a daystart or dayend
             * that conflicts with requested times (availableForTimeframeOnly=true) (7)The requested
             * timeslot cannot conflict with any existing reservation
             * (availableForTimeframeOnly=true) (8)In case of reservation-resource-only, the
             * resource should be available for roomservice and any of the groups of the current
             * user should be the for roomservice availablegroup (9)In case of
             * reservation-resource-room, that room must allow resources of this standard (10)The
             * requested timeslot cannot conflict with the minimum days a reservation has to be
             * announced (not for servicedesk and reservation manager) (11)The requested timeslot
             * cannot be more than a certain number of days ahead in the future (not for servicedesk
             * and reservation manager and assistant)
             */
            
            if (isOracle(context)) {
                // Oracle doesn't accept : ='' but accept : =0
                if (Reservation.getString("res_id").equals("")) {
                    Reservation.put("res_id", "0");
                }
            }
            
            sql =
                    " ("
                            + " SELECT resources.resource_id  as resourceId,resources.resource_std,resources.resource_name,"
                            + " resources.resource_type, resources.quantity,resources.pre_block,resources.post_block,";
            
            // With oracle, select is different for date (to_char(date,'formatDate'))
            if (isOracle(context)) {
                sql += " to_char(day_start,'HH24:MI:SS'),to_char(day_end,'HH24:MI:SS'),";
            }
            if (isSybase(context) || isSqlServer(context)) {
                sql += " resources.day_start,resources.day_end,";
            }
            
            sql +=
                    " resources.approval,resource_std.resource_name,resource_std.resource_nature,"
                    // Modified by Keven 2008-06-24
                            + " resources.default_calculation, 'true', 'true',resources.quantity as maxQuantity ";
            
            // PC KB 3018035 - For doing time checks we need the timezone offset
            // for the resource and date involved, so we'll do this check later
            final String currentDate = "CurrentDateTime";
            sql +=
                    " , " + formatSqlDaysBetween(context, currentDate, dateStart)
                            + " AS daystodatestart, announce_days, announce_time, ";
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
            // END PC KB 3018035
            
            sql +=
                    " FROM resources LEFT OUTER JOIN resource_std "
                            + " ON resources.resource_std = resource_std.resource_std"
                            + " WHERE resources.reservable = 1";
            
            if (!Reservation.getString("resource_std").equals("")) {
                sql +=
                        " AND resources.resource_std="
                                + literal(context, Reservation.getString("resource_std"));
            }
            
            // Guo added 2008-08-04 to solve KB3018838
            if (propertyExistsNotNull(Reservation, "ctry_id")
                    && (!Reservation.getString("ctry_id").equals("null"))) {
                sql +=
                        " AND ((resources.bl_id is NULL OR resources.bl_id IN (select DISTINCT  bl_id from bl where ctry_id is NULL or ctry_id= "
                                + literal(context, Reservation.getString("ctry_id"))
                                + "))"
                                + " AND (resources.site_id is NULL OR resources.site_id IN (select DISTINCT site_id from site where ctry_id is NULL or ctry_id= "
                                + literal(context, Reservation.getString("ctry_id")) + ")))";
            }
            
            sql +=
                    " AND "
                            + formatSqlIsNull(
                                context,
                                "resources.site_id,"
                                        + literal(context, Reservation.getString("site_id"))) + "="
                            + literal(context, Reservation.getString("site_id"));
            // PC - KB item 3015654
            if (propertyExistsNotNull(Reservation, "bl_id")
                    && (!Reservation.getString("bl_id").equals("null"))) {
                sql +=
                        " AND "
                                + formatSqlIsNull(
                                    context,
                                    "resources.bl_id,"
                                            + literal(context, Reservation.getString("bl_id")))
                                + "=" + literal(context, Reservation.getString("bl_id"));
            }
            
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                sql +=
                        " AND (resources.available_for_group IS NULL OR resources.available_for_group IN "
                                + printJsonArray(groups) + ")";
            }
            
            // PC - KB item 3016454
            if (propertyExistsNotNull(Reservation, "time_end")
                    && propertyExistsNotNull(Reservation, "time_start")
                    && (!AvailableForTimeframeOnly.equals("false"))) {
                // KB# 3018894 Keven 2008-08-05
                // Reservation spans or equals the resource availability
                sql +=
                        " AND (("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " <= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " >= resources.day_end) OR "
                                // Reservation straddles the resource day_start time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " <= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " <= resources.day_end AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " > resources.day_start) OR "
                                // Reservation straddles the resource day_end time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " >= resources.day_end AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " >= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " < resources.day_end) OR "
                                // Reservation completely within or equal to the resource time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " >= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)") + " <= resources.day_end))";
            }
            
            // PC - KB item 3016454
            if (propertyExistsNotNull(Reservation, "date_start")
                    && propertyExistsNotNull(Reservation, "time_end")
                    && propertyExistsNotNull(Reservation, "time_start")
                    && (!AvailableForTimeframeOnly.equals("false"))) {
                sql += " AND (NOT EXISTS ( SELECT 1 FROM reserve_rs WHERE ";
                if (propertyExistsNotNull(Reservation, "res_id")) {
                    sql +=
                            " reserve_rs.res_id <> "
                                    + literal(context, Reservation.getString("res_id")) + " AND ";
                }
                sql +=
                        " reserve_rs.status <> 'Cancelled' "
                                + " AND reserve_rs.status <> 'Rejected' "
                                + " AND reserve_rs.resource_id = resources.resource_id "
                                + " AND reserve_rs.date_start IN ("
                                + dateSet
                                + ")  "
                                + " AND reserve_rs.time_start < "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.pre_block + resources.post_block)")
                                + " AND reserve_rs.time_end > "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block + resources.post_block)") + "))";
            }
            
            if (!propertyExistsNotNull(RoomReservation, "rmres_id")) {
                sql +=
                        " AND (resources.room_service=1) "
                                + " AND (resources.room_service_group is NULL OR "
                                + "resources.room_service_group IN " + printJsonArray(groups) + ")";
            }
            
            if (!StandardsNotAllowed.isEmpty()) {
                sql +=
                        " AND (resources.resource_std NOT IN " + printList(StandardsNotAllowed)
                                + ")";
            }
            
            // Guo changed to solve the kb3018744
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                // PC KB 3018035 - For doing time checks we need timezone offset for
                // the resource and date, so we'll do this check later now only days check
                // sql += " AND ((" + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                // + " > resources.announce_days) OR " + "("
                // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                // + " = resources.announce_days AND " + "("
                // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                // + " < resources.announce_time)))";
                
                sql +=
                        " AND (" + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                + " >= resources.announce_days)";
                
            }
            
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT"))) {
                sql +=
                        " AND (" + formatSqlDaysBetween(context, "CurrentDateTime", dateLastStart)
                                + " <= resources.max_days_ahead ) ";
            }
            
            sql += " UNION ";
            
            // It's neccesary the nonUniqueResources
            sql +=
                    "SELECT resources.resource_id as resourceId,resources.resource_std,resources.resource_name,resources.resource_type,resources.quantity,";
            sql += "resources.pre_block, resources.post_block, ";
            if (isSybase(context) || isSqlServer(context)) {
                sql += "resources.day_start, resources.day_end, ";
            }
            if (isOracle(context)) {
                sql += "to_char(day_start, 'HH24:MI:SS'), to_char(day_end, 'HH24:MI:SS'), ";
            }
            
            // Modified by Keven 2008-06-24
            sql +=
                    "resources.approval, resource_std.resource_name, resource_std.resource_nature, resources.default_calculation, 'true', 'true',resources.quantity as maxQuantity ";
            
            // PC KB 3018035 - For doing time checks we need the timezone offset
            // for the resource and date involved, so we'll do this check later
            sql +=
                    " , " + formatSqlDaysBetween(context, currentDate, dateStart)
                            + " AS daystodatestart, announce_days, announce_time, ";
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
            // END PC KB 3018035
            
            sql +=
                    "FROM resources LEFT OUTER JOIN resource_std ON resources.resource_std = resource_std.resource_std "
                            + " WHERE resources.reservable=1";
            
            if (!Reservation.getString("resource_std").equals("")) {
                sql +=
                        " AND resources.resource_std="
                                + literal(context, Reservation.getString("resource_std"));
            }
            
            // Guo added 2008-08-04 to solve KB3018838
            if (propertyExistsNotNull(Reservation, "ctry_id")
                    && (!Reservation.getString("ctry_id").equals("null"))) {
                sql +=
                        " AND ((resources.bl_id is NULL OR resources.bl_id IN (select DISTINCT  bl_id from bl where ctry_id is NULL or ctry_id= "
                                + literal(context, Reservation.getString("ctry_id"))
                                + "))"
                                + " AND (resources.site_id is NULL OR resources.site_id IN (select DISTINCT site_id from site where ctry_id is NULL or ctry_id= "
                                + literal(context, Reservation.getString("ctry_id")) + ")))";
            }
            
            sql +=
                    " AND "
                            + formatSqlIsNull(
                                context,
                                "resources.site_id,"
                                        + literal(context, Reservation.getString("site_id"))) + "="
                            + literal(context, Reservation.getString("site_id"));
            
            // PC - KB item 3015654
            if (propertyExistsNotNull(Reservation, "bl_id")
                    && (!Reservation.getString("bl_id").equals("null"))) {
                sql +=
                        " AND "
                                + formatSqlIsNull(
                                    context,
                                    "resources.bl_id,"
                                            + literal(context, Reservation.getString("bl_id")))
                                + "=" + literal(context, Reservation.getString("bl_id"));
            }
            
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                sql +=
                        " AND (resources.available_for_group IS NULL OR resources.available_for_group IN "
                                + printJsonArray(groups) + ")";
            }
            
            // PC - KB item 3016454
            if (propertyExistsNotNull(Reservation, "time_end")
                    && propertyExistsNotNull(Reservation, "time_start")
                    && (!AvailableForTimeframeOnly.equals("false"))) {
                // KB# 3018894 Keven 2008-08-05
                // Reservation spans or equals the resource availibility
                sql +=
                        " AND (("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " <= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " >= resources.day_end) OR "
                                // Reservation straddles the resource day_start time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " <= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " <= resources.day_end AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " > resources.day_start) OR "
                                // Reservation straddles the resource day_end time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)")
                                + " >= resources.day_end AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " >= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " < resources.day_end) OR "
                                // Reservation completely within or equal to the resource time
                                + "("
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block)")
                                + " >= resources.day_start AND "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.post_block)") + " <= resources.day_end))";
            }
            
            // PC - KB item 3016454
            if (propertyExistsNotNull(Reservation, "date_start")
                    && propertyExistsNotNull(Reservation, "time_end")
                    && propertyExistsNotNull(Reservation, "time_start")
                    && (!AvailableForTimeframeOnly.equals("false"))) {
                sql += " AND (EXISTS ( SELECT 1 FROM reserve_rs WHERE ";
                if (propertyExistsNotNull(Reservation, "res_id")) {
                    sql +=
                            "reserve_rs.res_id <> "
                                    + literal(context, Reservation.getString("res_id")) + " AND ";
                }
                sql +=
                        "reserve_rs.status <> 'Cancelled' AND "
                                + "reserve_rs.status <> 'Rejected' AND "
                                + "reserve_rs.resource_id = resources.resource_id AND "
                                + "resource_type <> 'Unique' AND "
                                + "reserve_rs.date_start  IN ("
                                + dateSet
                                + ")  "
                                + " AND "
                                + "reserve_rs.time_start < "
                                + formatSqlAddMinutes(context, Reservation.getString("time_end"),
                                    "(resources.pre_block + resources.post_block)")
                                + " AND "
                                + "reserve_rs.time_end > "
                                + formatSqlAddMinutes(context, Reservation.getString("time_start"),
                                    "-(resources.pre_block + resources.post_block)") + "))";
            }
            
            if (!propertyExistsNotNull(RoomReservation, "rmres_id")) {
                sql +=
                        " AND (resources.room_service=1) AND "
                                + "(resources.room_service_group is NULL OR "
                                + "resources.room_service_group IN " + printJsonArray(groups) + ")";
            }
            
            if (!StandardsNotAllowed.isEmpty()) {
                sql +=
                        " AND (resources.resource_std NOT IN " + printList(StandardsNotAllowed)
                                + ")";
            }
            
            // Guo changed to solve the kb3018744
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                // PC KB 3018035 - For doing time checks we need timezone offset for
                // the resource and date, so we'll do this check later now only days check
                // sql += " AND ((" + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                // + "> resources.announce_days ) OR " + "("
                // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                // + "= resources.announce_days AND " + "("
                // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                // + " < resources.announce_time)))";
                
                sql +=
                        " AND (" + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                + " >= resources.announce_days) ";
                
            }
            
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT"))) {
                sql +=
                        " AND (" + formatSqlDaysBetween(context, "CurrentDateTime", dateLastStart)
                                + "<= resources.max_days_ahead)";
            }
            
            // Modified for KB 3018807, by ZY, 2008-08-13.
            sql += ")" + " ORDER BY resourceId ";
            
            if (isOracle(context)) {
                if (Reservation.getString("res_id").equals("0")) {
                    Reservation.put("res_id", "");
                }
            }
            
            /*
             * Any record in this query with resource_type=unique will be added to the
             * UniqueResources list. Any record with resource_type<>unique will be added to the
             * NonUniqueResources list
             */
            
            // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "' sentences clean: " + sql);
            final List recordsList = selectDbRecords(context, sql);
            
            boolean mustaddresource;
            
            for (int i = 0; i < recordsList.size(); i++) {
                final Object[] record = (Object[]) recordsList.get(i);
                
                // PC KB 3018035 Not all resources in the results must be added.
                // If it's a simple user we need to check that the resource
                // enforces the time check taking into account the timezone offset
                mustaddresource = true;
                
                // PC KB 3021918
                if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                        && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                    
                    final int daystodatestart = getIntegerValue(context, record[16]).intValue();
                    final int announce_days = getIntegerValue(context, record[17]).intValue();
                    
                    if (daystodatestart == announce_days) {
                        // PC KB 3018035 - We need to use timezone offset for doing times check
                        String cityTimezone = record[19].toString();
                        if (cityTimezone.trim().equals("")) {
                            cityTimezone = record[20].toString();
                        }
                        final int finaloffset =
                                getTotalMinutesOffset(context, cityTimezone,
                                    getDateValue(context, dateStart));
                        
                        final Time announcetime = getTimeValue(context, record[18]);
                        final Date announcedatetime =
                                new Date(new Date().getYear(), new Date().getMonth(),
                                    new Date().getDate(), announcetime.getHours(),
                                    announcetime.getMinutes(), announcetime.getSeconds());
                        long time = announcedatetime.getTime();
                        time += (finaloffset * 60 * 1000);
                        announcedatetime.setTime(time);
                        
                        final Date currentdatetime = new Date();
                        
                        if (!(currentdatetime.getTime() < announcedatetime.getTime())) {
                            mustaddresource = false;
                        }
                    }
                }
                
                if (mustaddresource) {
                    if (record[3].toString().trim().equals("Unique")) {
                        // Here extract a method to adjust preBlock and postBlock values according
                        // to
                        // parameter: MinutesTimeUnit. Modified by ZY, 2008-08-01.
                        adjustPreAndPostBlockValue(context, record);
                        uniqueResources.add(record);
                    } else {
                        nonUniqueResources.add(record);
                    }
                }
            }
            /*
             * I add this record at nonUniqueResources, but now I have to calculate the real
             * available quantity
             */
            /*
             * int minutePerBlock = 0; sql = "SELECT param_value FROM afm_activity_params WHERE
             * param_id='MinutesTimeUnit'"; List listMinutePerBlock = selectDbRecords(context, sql);
             * int counterListMinutePerBlock = listMinutePerBlock.size(); for (int i = 0; i <
             * counterListMinutePerBlock; i++) { Object[] record = (Object[])
             * listMinutePerBlock.get(i); minutePerBlock = new
             * Integer(record[0].toString().trim()).intValue(); }
             */
            final Iterator iteratorNonUniqueResource = nonUniqueResources.iterator();
            /*
             * Calculating the real available quantity for the nonUnique resources
             */
            // PC - KB item 3016454
            if (propertyExistsNotNull(Reservation, "time_end")
                    && propertyExistsNotNull(Reservation, "time_start")) {
                // Added by Keven 2008-08-12
                final JSONArray cancelledResourceReservations =
                        getCancelledResourceReservations(ResourceReservations);
                final String clauseNotINCancelled =
                        getClauseOfNotInCancelled(context, cancelledResourceReservations);
                final JSONObject tempResourceReservationItem = new JSONObject();
                while (iteratorNonUniqueResource.hasNext()) {
                    final Object[] objectNonUnique = (Object[]) iteratorNonUniqueResource.next();
                    final String resource_id = objectNonUnique[0].toString();
                    sql =
                            "SELECT resource_id, resource_std, day_start, day_end, max_days_ahead, pre_block, post_block,resource_type, quantity "
                                    + " FROM resources WHERE resource_id = "
                                    + literal(context, resource_id);
                    final List listRecordsOfResource = retrieveDbRecords(context, sql);
                    
                    final JSONArray reservationDateStartArray =
                            Reservation.getJSONArray("date_start");
                    final String reservationDateStart =
                            reservationDateStartArray.getString(0).toString();
                    final String reservationTimeStart = Reservation.getString("time_start");
                    final String reservationTimeEnd = Reservation.getString("time_end");
                    
                    tempResourceReservationItem.put("resource_id", resource_id);
                    tempResourceReservationItem.put("date_start", reservationDateStart);
                    tempResourceReservationItem.put("starttime", reservationTimeStart);
                    tempResourceReservationItem.put("endtime", reservationTimeEnd);
                    
                    final int tempQuantityObjectNonUnique =
                            getMinAvailableResourceQuantity(context, tempResourceReservationItem,
                                cancelledResourceReservations, clauseNotINCancelled,
                                listRecordsOfResource);
                    
                    objectNonUnique[4] = String.valueOf(tempQuantityObjectNonUnique);
                }
            }
            
            // We have to check that resources of the current reservation are in
            // the (non)UniqueResources list although maybe not editable.
            
            if (ResourceReservations.length() != 0) {
                
                for (int counterResourceReservation = 0; counterResourceReservation < ResourceReservations
                    .length(); counterResourceReservation++) {
                    
                    final JSONObject objectCurrentCounterResourceReservation =
                            (JSONObject) ResourceReservations.get(counterResourceReservation);
                    
                    boolean containUni = false;
                    boolean containNonUni = false;
                    
                    /*
                     * See if the uniqueResources or nonUniqueResources contains the
                     * objectCurrentCounterResourceReservation
                     */
                    final Iterator uniCon = uniqueResources.iterator();
                    while (uniCon.hasNext()) {
                        final Object[] uniqueResourcesObjects = (Object[]) uniCon.next();
                        if (uniqueResourcesObjects[0]
                            .toString()
                            .trim()
                            .equals(
                                objectCurrentCounterResourceReservation.getString("resource_id")
                                    .toString().trim())) {
                            containUni = true;
                        }
                    }
                    final Iterator nonUniCon = nonUniqueResources.iterator();
                    while (nonUniCon.hasNext()) {
                        final Object[] nonUniqueResourcesObject = (Object[]) nonUniCon.next();
                        if (nonUniqueResourcesObject[0]
                            .toString()
                            .trim()
                            .equals(
                                objectCurrentCounterResourceReservation.getString("resource_id")
                                    .toString().trim())) {
                            containNonUni = true;
                        }
                    }
                    /*
                     * if not uniqueResources or nonUniqueResources contains the
                     * objectCurrentCounterResourceReservation, we get info of this resources, and
                     * we add this resource to uniqueResource or nonUniqueResource
                     */
                    if (!containUni
                            && !containNonUni
                            && !objectCurrentCounterResourceReservation.getString("status").equals(
                                "Cancelled")) {
                        
                        sql =
                                "SELECT resources.resource_id, resources.resource_std, resources.resource_name, resources.resource_type, resources.quantity, "
                                        + "resources.pre_block, resources.post_block, resources.day_start,  resources.day_end, resources.approval, "
                                        + "resource_std.resource_name, resource_std.resource_nature,  resources.default_calculation,'false', "
                                        // PC KB 3018035 here we want to return 'true' if the
                                        // reservation
                                        // can be cancelled and 'false' if not, but we need to get
                                        // the
                                        // resource timezone
                                        // before and do this later
                                        // + "(If ("
                                        // + formatSqlDaysBetween(context, "CurrentDateTime",
                                        // dateStart)
                                        // + " > resources.cancel_days) OR "
                                        // + "(("
                                        // + formatSqlDaysBetween(context, "CurrentDateTime",
                                        // dateStart)
                                        // + "= resources.cancel_days) AND ("
                                        // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        // +
                                        // " < resources.cancel_time)) THEN 'true' ELSE 'false' Endif) "
                                        + " 'true' "
                                        // Modified by Keven 2008-06-24
                                        + ",resources.quantity as maxQuantity ";
                        
                        // PC KB 3018035 - For doing time checks we need the timezone offset
                        // for the resource and date involved, so we'll do this check later
                        sql +=
                                " , " + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                        + " AS daystodatestart, cancel_days, cancel_time, ";
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
                        
                        sql +=
                                "FROM resources LEFT OUTER JOIN resource_std ON resources.resource_std =  resource_std.resource_std "
                                        + "WHERE resources.resource_id = "
                                        + literal(context,
                                            objectCurrentCounterResourceReservation
                                                .getString("resource_id"));
                        // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "' sql5: "+sql);
                        final List resourcesList = selectDbRecords(context, sql);
                        
                        for (int i = 0; i < resourcesList.size(); i++) {
                            final Object[] record = (Object[]) resourcesList.get(i);
                            
                            // PC KB 3018035 We need to get resource's timezone and check if can be
                            // cancelled or not
                            final int daystodatestart =
                                    getIntegerValue(context, record[16]).intValue();
                            final int cancel_days = getIntegerValue(context, record[17]).intValue();
                            String canbecancelled;
                            
                            if (daystodatestart < cancel_days) {
                                canbecancelled = "'false'";
                            } else {
                                canbecancelled = "'true'";
                                if (daystodatestart == cancel_days) {
                                    // PC KB 3018035 - We need to use timezone offset for doing
                                    // times check
                                    String cityTimezone = record[19].toString();
                                    if (cityTimezone.trim().equals("")) {
                                        cityTimezone = record[20].toString();
                                    }
                                    final int finaloffset =
                                            getTotalMinutesOffset(context, cityTimezone,
                                                getDateValue(context, dateStart));
                                    
                                    final Time canceltime = getTimeValue(context, record[18]);
                                    final Date canceldatetime =
                                            new Date(new Date().getYear(), new Date().getMonth(),
                                                new Date().getDate(), canceltime.getHours(),
                                                canceltime.getMinutes(), canceltime.getSeconds());
                                    long time = canceldatetime.getTime();
                                    time += (finaloffset * 60 * 1000);
                                    canceldatetime.setTime(time);
                                    
                                    final Date currentdatetime = new Date();
                                    
                                    if (!(currentdatetime.getTime() < canceldatetime.getTime())) {
                                        canbecancelled = "'false'";
                                    }
                                }
                            }
                            record[14] = canbecancelled;
                            
                            if (record[3].equals("Unique")) {
                                // Here also need to call a method to adjust preBlock and postBlock
                                // values according to parameter: MinutesTimeUnit. Added by ZY,
                                // 2008-08-01.
                                adjustPreAndPostBlockValue(context, record);
                                uniqueResources.add(record);
                            } else {
                                nonUniqueResources.add(record);
                            }
                        }
                    }
                }
                
            }
            // _________________________________________________________
            
            /*
             * Now we can process all resources to query what resource natures (Tabs in the select
             * resource form) are available for the user. These are added to the ResourceNatures
             * list.
             * 
             * ResourceNatures list is a HashSet, so all the elements will be different
             */
            
            final Iterator iteratorUniqueResource = uniqueResources.iterator();
            while (iteratorUniqueResource.hasNext()) {
                final Object[] objectUnique = (Object[]) iteratorUniqueResource.next();
                ResourceNatures.add(objectUnique[11].toString().trim());
                // kb#3028194: Added for showing localization values of enum list of field resource
                // nature
                final String enumText =
                        getEnumFieldDisplayedValue(context, "resource_std", "resource_nature",
                            objectUnique[11].toString().trim());
                ResourceNaturesEnumlist.add(enumText);
                uniqueResourceID.add(objectUnique[0].toString().trim());
            }
            final Iterator iteratorNonUniqueRes = nonUniqueResources.iterator();
            while (iteratorNonUniqueRes.hasNext()) {
                final Object[] objectNonUnique = (Object[]) iteratorNonUniqueRes.next();
                ResourceNatures.add(objectNonUnique[11].toString().trim());
                // kb#3028194: Added for showing localization values of enum list of field resource
                // nature
                final String enumText =
                        getEnumFieldDisplayedValue(context, "resource_std", "resource_nature",
                            objectNonUnique[11].toString().trim());
                ResourceNaturesEnumlist.add(enumText);
                nonUniqueResourceID.add(objectNonUnique[0].toString().trim());
            }
            
            /*
             * we will query all reservations of the available unique and limited resources for the
             * date entered in the console and add them to the ConcurrentresourceReservations list.
             * Except for the reservations of the current reservation. These are already stored in
             * ResourceReservations. For regular and recurring reservations we only need the
             * reservations of the first date. For continuous reservations we need the reservations
             * of all dates.
             */
            
            if (isOracle(context)) {
                if (Reservation.getString("res_id").equals("")) {
                    Reservation.put("res_id", "0");
                }
            }
            
            sql = "SELECT reserve_rs.resource_id, reserve_rs.date_start, ";
            
            // Modified for fixing errors in Oracle and making code consistent with that in room
            // handler. By ZY 2008-08-21.
            sql += " reserve_rs.time_start, reserve_rs.time_end, ";
            sql +=
                    " reserve_rs.comments, reserve_rs.status, resources.pre_block, resources.post_block, "
                            + "resource_std.resource_nature,reserve_rs.rsres_id,"
                            + "ROUND((resources.pre_block * (SELECT DISTINCT 60/afm_activity_params.param_value FROM afm_activity_params WHERE activity_id='AbWorkplaceReservations' and param_id='MinutesTimeUnit')/60)+0.49,0) as cal_pre_block,"
                            + "ROUND((resources.post_block * (SELECT DISTINCT 60/afm_activity_params.param_value FROM afm_activity_params WHERE activity_id='AbWorkplaceReservations' and param_id='MinutesTimeUnit')/60)+0.49,0) as cal_post_block,"
                            + "reserve_rs.quantity "
                            + "FROM reserve_rs LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id "
                            + "LEFT OUTER JOIN resource_std ON resources.resource_std = resource_std.resource_std ";
            if ("recurring".equals(Reservation.getString("res_type"))) {
                sql += "WHERE reserve_rs.date_start IN  (" + dateSet + ") " + " AND ";
            } else {
                sql +=
                        "WHERE reserve_rs.date_start = "
                                + formatSqlIsoToNativeDate(context, dateStart) + " AND ";
            }
            if (propertyExistsNotNull(Reservation, "res_id")) {
                sql +=
                        "reserve_rs.res_id <> " + literal(context, Reservation.getString("res_id"))
                                + " AND ";
            }
            sql +=
                    "(reserve_rs.resource_id IN " + printListArray(uniqueResourceID)
                            + " OR reserve_rs.resource_id IN "
                            + printListArray(nonUniqueResourceID) + ")"
                            + " AND reserve_rs.status NOT IN ('Rejected','Cancelled')";
            
            try {
                
                // Fill in the concurrentResourceReservation
                
                if (isOracle(context)) {
                    if (Reservation.getString("res_id").equals("0")) {
                        Reservation.put("res_id", "");
                    }
                }
                
                // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "' sentences clean 2: " + sql);
                
                // Modified below code for fixing errors in Oracle and making code consistent with
                // that in room
                // handler. By ZY 2008-08-21.
                ConcurrentresourceReservations = retrieveDbRecords(context, sql);
                final Iterator iteratorConcurrentResourceReservation =
                        ConcurrentresourceReservations.iterator();
                concurrentResourceReservationJsonArray = new JSONArray();
                while (iteratorConcurrentResourceReservation.hasNext()) {
                    final Map objectCurrentResourceReservation =
                            (Map) iteratorConcurrentResourceReservation.next();
                    final JSONObject objectToAddToConcurrentResourceReservationJsonArray =
                            new JSONObject();
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "resource_id",
                        ((objectCurrentResourceReservation.get("resource_id") == null) ? ""
                                : ((objectCurrentResourceReservation.get("resource_id").toString()
                                    .trim()))));
                    
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "date_start",
                        ((objectCurrentResourceReservation.get("date_start") == null) ? ""
                                : ((getDateValue(context,
                                
                                objectCurrentResourceReservation.get("date_start")).toString()
                                    .trim()))));
                    
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "time_start",
                        ((objectCurrentResourceReservation.get("time_start") == null) ? ""
                                : ((getTimeValue(context,
                                    objectCurrentResourceReservation.get("time_start")).toString()
                                    .trim()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "time_end",
                        ((objectCurrentResourceReservation.get("time_end") == null) ? ""
                                : ((getTimeValue(context,
                                    objectCurrentResourceReservation.get("time_end")).toString()
                                    .trim()))));
                    
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "comments",
                        ((objectCurrentResourceReservation.get("comments") == null) ? ""
                                : ((objectCurrentResourceReservation.get("comments").toString()
                                    .trim()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put("status",
                        ((objectCurrentResourceReservation.get("status") == null) ? ""
                                : ((objectCurrentResourceReservation.get("status").toString()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put("pre_block",
                        ((objectCurrentResourceReservation.get("pre_block") == null) ? ""
                                : ((objectCurrentResourceReservation.get("cal_pre_block")
                                    .toString().trim()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put("post_block",
                        ((objectCurrentResourceReservation.get("post_block") == null) ? ""
                                : ((objectCurrentResourceReservation.get("cal_post_block")
                                    .toString().trim()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put("resource_nature",
                        ((objectCurrentResourceReservation.get("resource_nature") == null) ? ""
                                : ((objectCurrentResourceReservation.get("resource_nature")
                                    .toString().trim()))));
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "rs_res_id",
                        ((objectCurrentResourceReservation.get("rsres_id") == null) ? ""
                                : ((objectCurrentResourceReservation.get("rsres_id").toString()
                                    .trim()))));
                    // Added by Keven 2008-07-14
                    objectToAddToConcurrentResourceReservationJsonArray.put(
                        "quantity",
                        ((objectCurrentResourceReservation.get("quantity") == null) ? ""
                                : ((objectCurrentResourceReservation.get("quantity").toString()
                                    .trim()))));
                    concurrentResourceReservationJsonArray
                        .put(objectToAddToConcurrentResourceReservationJsonArray);
                    
                }
                
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                        + " : Could not retrieve quantity : ", errMessage, e);
            }
            
            // Different users have different rights for editing or canceling a reservation
            // Modified by Keven 2008-07-04 by Spec
            
            // PC KB 3021918
            if ((ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    || (ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                for (int i = 0; i < ResourceReservations.length(); i++) {
                    // JSONObject rr=ResourceReservations;
                    final JSONObject objectOfResourceReservation =
                            (JSONObject) ResourceReservations.get(i);
                    objectOfResourceReservation.put("editable", true);
                    objectOfResourceReservation.put("removable", true);
                }
                
            } else {
                for (int i = 0; i < ResourceReservations.length(); i++) {
                    final JSONObject objectOfResourceReservation =
                            (JSONObject) ResourceReservations.get(i);
                    
                    final Date currentdatetime = new Date();
                    
                    // PC KB 3018035 - For doing time checks we need timezone offset for
                    // the resource and date, so we'll do this check later now only days check
                    sql =
                            " SELECT 1,  "
                                    + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    + " AS daystodatestart, announce_days, announce_time, "
                                    // Get timezone from the resources.site_id
                                    + " (SELECT city.timezone_id FROM site LEFT OUTER JOIN city "
                                    + " ON city.city_id=site.city_id AND city.state_id=site.state_id "
                                    + " WHERE site.site_id = resources.site_id ) AS timezone1, "
                                    // Get timezone from the resources.bl_id
                                    + " (SELECT city.timezone_id FROM bl LEFT OUTER JOIN city "
                                    + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id "
                                    + " WHERE bl.bl_id = resources.bl_id ) AS timezone2 ";
                    
                    sql +=
                            " FROM resources WHERE resource_id= "
                                    + literal(context,
                                        objectOfResourceReservation.getString("resource_id"))
                                    // + " AND (("
                                    // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    // + "> resources.announce_days) OR " + "(("
                                    // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    // + "= resources.announce_days) AND " + "("
                                    // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                    // + " < resources.announce_time)))";
                                    + " AND ("
                                    + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    + ">= resources.announce_days)";
                    
                    final List resourcesCanEdit = retrieveDbRecords(context, sql);
                    if (!resourcesCanEdit.isEmpty()) {
                        
                        final Map recordCanEdit = (Map) resourcesCanEdit.get(0);
                        
                        final int daystodatestart =
                                getIntegerValue(context, recordCanEdit.get("daystodatestart"))
                                    .intValue();
                        final int announce_days =
                                getIntegerValue(context, recordCanEdit.get("announce_days"))
                                    .intValue();
                        boolean isEditable = true;
                        
                        // PC KB 3018035 - We need to use timezone offset for doing times check
                        String cityTimezone = getString(recordCanEdit, "timezone1");
                        if (cityTimezone.trim().equals("")) {
                            cityTimezone = getString(recordCanEdit, "timezone2");
                        }
                        final int finaloffset =
                                getTotalMinutesOffset(context, cityTimezone,
                                    getDateValue(context, dateStart));
                        
                        if (daystodatestart == announce_days) {
                            // PC KB 3018035 - We need to use timezone offset for doing times check
                            final Time announcetime =
                                    getTimeValue(context, recordCanEdit.get("announce_time"));
                            final Date announcedatetime =
                                    new Date(new Date().getYear(), new Date().getMonth(),
                                        new Date().getDate(), announcetime.getHours(),
                                        announcetime.getMinutes(), announcetime.getSeconds());
                            long time = announcedatetime.getTime();
                            time += (finaloffset * 60 * 1000);
                            announcedatetime.setTime(time);
                            
                            if (!(currentdatetime.getTime() < announcedatetime.getTime())) {
                                isEditable = false;
                            }
                        }
                        
                        // KB 3018035 Also check that reservation doesn't occur in the past
                        final Date reservationdate = getDateValue(context, dateStart);
                        final Time reservationtime =
                                getTimeFromString(objectOfResourceReservation
                                    .getString("starttime"));
                        final Date reservationdatetime =
                                new Date(reservationdate.getYear(), reservationdate.getMonth(),
                                    reservationdate.getDate(), reservationtime.getHours(),
                                    reservationtime.getMinutes(), reservationtime.getSeconds());
                        long time = reservationdatetime.getTime();
                        time += (finaloffset * 60 * 1000);
                        reservationdatetime.setTime(time);
                        
                        if (!(currentdatetime.getTime() < reservationdatetime.getTime())) {
                            isEditable = false;
                        }
                        
                        objectOfResourceReservation.put("editable", isEditable);
                        
                    } else {
                        objectOfResourceReservation.put("editable", false);
                    }
                    
                    // PC KB 3018035 - For doing time checks we need timezone offset for
                    // the resource and date, so we'll do this check later now only days check
                    sql =
                            " SELECT 1, "
                                    + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    + " AS daystodatestart, cancel_days, cancel_time, "
                                    // Get timezone from the resources.site_id
                                    + " (SELECT city.timezone_id FROM site LEFT OUTER JOIN city "
                                    + " ON city.city_id=site.city_id AND city.state_id=site.state_id "
                                    + " WHERE site.site_id = resources.site_id ) AS timezone1, "
                                    // Get timezone from the resources.bl_id
                                    + " (SELECT city.timezone_id FROM bl LEFT OUTER JOIN city "
                                    + " ON city.city_id=bl.city_id AND city.state_id=bl.state_id "
                                    + " WHERE bl.bl_id = resources.bl_id ) AS timezone2 ";
                    
                    sql +=
                            " FROM resources WHERE resource_id= "
                                    + literal(context,
                                        objectOfResourceReservation.getString("resource_id"))
                                    // + " AND (("
                                    // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    // + "> resources.cancel_days) OR " + "(("
                                    // + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    // + "= resources.cancel_days) AND " + "("
                                    // + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                    // + " < resources.cancel_time)))";
                                    + " AND ("
                                    + formatSqlDaysBetween(context, "CurrentDateTime", dateStart)
                                    + ">= resources.cancel_days)";
                    
                    final List resourcesCanRemove = retrieveDbRecords(context, sql);
                    if (!resourcesCanRemove.isEmpty()) {
                        
                        final Map recordCanRemove = (Map) resourcesCanRemove.get(0);
                        
                        final int daystodatestart =
                                getIntegerValue(context, recordCanRemove.get("daystodatestart"))
                                    .intValue();
                        final int cancel_days =
                                getIntegerValue(context, recordCanRemove.get("cancel_days"))
                                    .intValue();
                        boolean isRemovable = true;
                        
                        // PC KB 3018035 - We need to use timezone offset for doing times check
                        String cityTimezone = getString(recordCanRemove, "timezone1");
                        if (cityTimezone.trim().equals("")) {
                            cityTimezone = getString(recordCanRemove, "timezone2");
                        }
                        final int finaloffset =
                                getTotalMinutesOffset(context, cityTimezone,
                                    getDateValue(context, dateStart));
                        
                        if (daystodatestart == cancel_days) {
                            // PC KB 3018035 - We need to use timezone offset for doing times check
                            final Time canceltime =
                                    getTimeValue(context, recordCanRemove.get("cancel_time"));
                            final Date canceldatetime =
                                    new Date(new Date().getYear(), new Date().getMonth(),
                                        new Date().getDate(), canceltime.getHours(),
                                        canceltime.getMinutes(), canceltime.getSeconds());
                            long time = canceldatetime.getTime();
                            time += (finaloffset * 60 * 1000);
                            canceldatetime.setTime(time);
                            
                            if (!(currentdatetime.getTime() < canceldatetime.getTime())) {
                                isRemovable = false;
                            }
                        }
                        
                        // KB 3018035 Also check that reservation doesn't occur in the past
                        final Date reservationdate = getDateValue(context, dateStart);
                        final Time reservationtime =
                                getTimeFromString(objectOfResourceReservation
                                    .getString("starttime"));
                        final Date reservationdatetime =
                                new Date(reservationdate.getYear(), reservationdate.getMonth(),
                                    reservationdate.getDate(), reservationtime.getHours(),
                                    reservationtime.getMinutes(), reservationtime.getSeconds());
                        long time = reservationdatetime.getTime();
                        time += (finaloffset * 60 * 1000);
                        reservationdatetime.setTime(time);
                        
                        // KB 3018035 Also check that reservation doesn't occur in the past
                        if (!(currentdatetime.getTime() < reservationdatetime.getTime())) {
                            isRemovable = false;
                        }
                        
                        objectOfResourceReservation.put("removable", isRemovable);
                        
                    } else {
                        objectOfResourceReservation.put("removable", false);
                    }
                }
            }
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + "error", errMessage, e);
        } finally {
            // SENDING all parameters to the response (javascript)
            final JSONObject results = new JSONObject();
            final JSONArray jsonResNat = new JSONArray(ResourceNatures);
            results.put("ResourceNatures", jsonResNat);
            // kb#3028194: Added for showing localization values of enum list of field resource
            // nature
            final JSONArray jsonResNatEnum = new JSONArray(ResourceNaturesEnumlist);
            results.put("ResourceNaturesEnumlist", jsonResNatEnum);
            
            // uniqueresources and nonuniqueresources are arraylist, not
            // jsonarray, so we must transorm them :
            
            final JSONArray jsonunique = new JSONArray();
            final Iterator it = uniqueResources.iterator();
            while (it.hasNext()) {
                final Object[] uniqueResourcesObject = (Object[]) it.next();
                final JSONObject uniqueResource = new JSONObject();
                uniqueResource.put("resourceId", uniqueResourcesObject[0].toString().trim());
                uniqueResource.put("resources_std", uniqueResourcesObject[1].toString().trim());
                uniqueResource.put("resources_name", uniqueResourcesObject[2].toString().trim());
                uniqueResource.put("resources_type", uniqueResourcesObject[3].toString().trim());
                uniqueResource
                    .put("resources_quantity", uniqueResourcesObject[4].toString().trim());
                uniqueResource.put("preBlockTimeslots",
                    Float.valueOf(uniqueResourcesObject[5].toString().trim()).intValue());
                // Guo changed 2008-07-23 to solve KB3018843
                uniqueResource.put("postBlockTimeslots",
                    Float.valueOf(uniqueResourcesObject[6].toString().trim()).intValue());
                if (isSqlServer(context)) {
                    uniqueResource.put("resources_date_start",
                        getTimeValue(context, (uniqueResourcesObject[7].toString().trim()))
                            .toString());
                    uniqueResource.put("resources_day_end",
                        getTimeValue(context, (uniqueResourcesObject[8].toString().trim()))
                            .toString());
                } else {
                    uniqueResource.put("resources_date_start", uniqueResourcesObject[7].toString()
                        .trim());
                    uniqueResource.put("resources_day_end", uniqueResourcesObject[8].toString()
                        .trim());
                }
                
                uniqueResource
                    .put("resources_approval", uniqueResourcesObject[9].toString().trim());
                uniqueResource.put("resource_name", uniqueResourcesObject[10].toString().trim());
                uniqueResource.put("resource_nature", uniqueResourcesObject[11].toString().trim());
                uniqueResource.put("default_calculation", uniqueResourcesObject[12].toString()
                    .trim());
                uniqueResource.put("editable", uniqueResourcesObject[13].toString().trim());
                uniqueResource.put("removable", uniqueResourcesObject[14].toString().trim());
                uniqueResource.put("quantity", "1");
                jsonunique.put(uniqueResource);
            }
            
            final JSONArray jsonnonunique = new JSONArray();
            final Iterator iteratorNonUnique = nonUniqueResources.iterator();
            while (iteratorNonUnique.hasNext()) {
                final Object[] objectOfNonUnique = (Object[]) iteratorNonUnique.next();
                final JSONObject nonUniqueResource = new JSONObject();
                nonUniqueResource.put("resources_id", objectOfNonUnique[0].toString().trim());
                nonUniqueResource.put("resources_std", objectOfNonUnique[1].toString().trim());
                nonUniqueResource.put("resources_name", objectOfNonUnique[2].toString().trim());
                nonUniqueResource.put("resources_type", objectOfNonUnique[3].toString().trim());
                nonUniqueResource.put("resources_quantity", objectOfNonUnique[4].toString().trim());
                nonUniqueResource
                    .put("resources_pre_block", objectOfNonUnique[5].toString().trim());
                nonUniqueResource.put("resources_post_block", objectOfNonUnique[6].toString()
                    .trim());
                
                if (!isOracle(context)) {
                    nonUniqueResource.put("resources_date_start",
                        getTimeValue(context, objectOfNonUnique[7].toString().trim()).toString());
                    nonUniqueResource.put("resources_day_end",
                        getTimeValue(context, objectOfNonUnique[8].toString().trim()).toString());
                } else {
                    nonUniqueResource.put("resources_date_start", objectOfNonUnique[7].toString()
                        .trim());
                    nonUniqueResource.put("resources_day_end", objectOfNonUnique[8].toString()
                        .trim());
                }
                
                nonUniqueResource.put("resources_approval", objectOfNonUnique[9].toString().trim());
                nonUniqueResource.put("resource_name", objectOfNonUnique[10].toString().trim());
                nonUniqueResource.put("resource_nature", objectOfNonUnique[11].toString().trim());
                nonUniqueResource.put("default_calculation", objectOfNonUnique[12].toString()
                    .trim());
                nonUniqueResource.put("editable", objectOfNonUnique[13].toString().trim());
                nonUniqueResource.put("removable", objectOfNonUnique[14].toString().trim());
                // Modified by Keven 2008-06-24 saving the max quantity of this resources
                nonUniqueResource.put("quantity", objectOfNonUnique[15].toString().trim());
                
                jsonnonunique.put(nonUniqueResource);
            }
            
            results.put("UniqueResources", jsonunique.toString());
            results.put("NonUniqueResources", jsonnonunique.toString());
            results.put("ConcurrentResourceReservations",
                concurrentResourceReservationJsonArray.toString());
            results.put("ResourceReservations", ResourceReservations.toString());
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"json: " + results.toString());
            context.addResponseParameter("jsonExpression", results.toString());
        }
        
    }
    
    private void adjustPreAndPostBlockValue(final EventHandlerContext context, final Object[] record) {
        final String sql1 =
                "SELECT "
                        + "pre_block, "
                        + "ROUND((resources.pre_block * (SELECT DISTINCT 60/afm_activity_params.param_value FROM afm_activity_params WHERE activity_id='AbWorkplaceReservations' and param_id='MinutesTimeUnit')/60)+0.49,0), "
                        + "post_block, "
                        + "ROUND((resources.post_block * (SELECT DISTINCT 60/afm_activity_params.param_value FROM afm_activity_params WHERE activity_id='AbWorkplaceReservations' and param_id='MinutesTimeUnit')/60)+0.49,0) "
                        + "FROM resources where resource_id="
                        + literal(context, record[0].toString().trim());
        // this.log.info("'" + ACTIVITY_ID + "-" + RULE_ID + "' sql3:
        // "+sql);
        final List lsPreAndPostBlock = selectDbRecords(context, sql1);
        final Object[] lsPreAndPostBlockObject = (Object[]) lsPreAndPostBlock.get(0);
        final String newpreblock = lsPreAndPostBlockObject[1].toString().trim();
        final String newpostblock = lsPreAndPostBlockObject[3].toString().trim();
        
        /*
         * change pre_block value because we need to use the afm_activity_params.param_value
         */
        record[5] = newpreblock;
        record[6] = newpostblock;
    }
    
    // ---------------------------------------------------------------------------------------------
    // END readAvailableResources wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN loadTimeline wfr
    // ---------------------------------------------------------------------------------------------
    public void loadTimeline(final String objUniqueResources,
            final String objConcurrentResourceReservations,
            final String objEditableResourceReservation) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "LOADTIMELINE_WFR", "INVALIDPARAMETERERROR",
                    null);
        
        final String RULE_ID = "loadTimeline";
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' .... ");
        final JSONObject timeline = new JSONObject();
        
        try {
            // Get the input parameters
            final JSONArray UniqueResources = new JSONArray("" + objUniqueResources + ")");
            final JSONArray ConcurrentResourceReservations =
                    new JSONArray("" + objConcurrentResourceReservations + ")");
            final JSONArray editableResourceReservation =
                    new JSONArray("" + objEditableResourceReservation + ")");
            
            // BEGIN: init timeline, created timeline mark
            int timelineStartHour = 8;
            int timelineEndHour = 20;
            int minorSegments = 6;
            
            // Generate the output Timeline object
            final JSONArray events = new JSONArray();
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
            
            // add columnAvailableFrom and columnAvailableTo to the resource
            // object
            for (int i = 0; i < UniqueResources.length(); i++) {
                final JSONObject UniqueResourcesObj = UniqueResources.getJSONObject(i);
                
                final String resourcesDateStart =
                        UniqueResourcesObj.getString("resources_date_start");
                final String resourcesDayEnd = UniqueResourcesObj.getString("resources_day_end");
                /*
                 * If format resourcesDateStart=XX:XX:XX do split, else on fait
                 * getTimeValue(resourcesDateStart)
                 */
                Time tempStart = null;
                Time tempEnd = null;
                
                if (resourcesDateStart.length() < 10) {
                    final String[] resourcesDateStartArray = resourcesDateStart.split(":");
                    final String resourcesDateStartHour = resourcesDateStartArray[0];
                    final String resourcesDateStartArrayMin = resourcesDateStartArray[1];
                    tempStart =
                            new Time(new Integer(resourcesDateStartHour).intValue(), new Integer(
                                resourcesDateStartArrayMin).intValue(), 0);
                    
                    final String[] resourcesDayEndArray = resourcesDayEnd.split(":");
                    final String resourcesDayEndHour = resourcesDayEndArray[0];
                    final String resourcesDayEndMin = resourcesDayEndArray[1];
                    tempEnd =
                            new Time(new Integer(resourcesDayEndHour).intValue(), Integer.valueOf(
                                resourcesDayEndMin).intValue(), 0);
                    
                } else {
                    tempStart = getTimeValue(context, resourcesDateStart);
                    tempEnd = getTimeValue(context, resourcesDayEnd);
                }
                
                final int columnAvailableFrom =
                        getTimeColumn(timelineStartHour, minorSegments, tempStart,
                            MaxTimemarksColumn);
                final int columnAvailableTo =
                        getTimeColumn(timelineStartHour, minorSegments, tempEnd, MaxTimemarksColumn);
                UniqueResourcesObj.put("columnAvailableFrom", columnAvailableFrom);
                UniqueResourcesObj.put("columnAvailableTo", columnAvailableTo);
            }
            
            timeline.put("resources", UniqueResources);
            if (ConcurrentResourceReservations.length() != 0) {
                // format reservation record as XML and add it to the response
                // XML DOM
                for (int i = 0; i < ConcurrentResourceReservations.length(); i++) {
                    final JSONObject obj = (JSONObject) ConcurrentResourceReservations.get(i);
                    
                    final String resId = obj.getString("resource_id");
                    final String rsresId = obj.getString("rs_res_id");
                    final JSONObject event = new JSONObject();
                    
                    /*
                     * start the position search We have resId, we search in Uniqueresources object
                     * who have the same res_id, and we return the position in uniqueResource
                     */
                    
                    int position = -1;
                    for (int j = 0; j < UniqueResources.length(); j++) {
                        final JSONObject UniqueResourcesObj = UniqueResources.getJSONObject(j);
                        if (UniqueResourcesObj.getString("resourceId").equals(resId)) {
                            /*
                             * Here is the position
                             */
                            position = j;
                        }
                    }
                    /*
                     * end of the position search
                     */
                    
                    if (position >= 0) {
                        event.put("eventId", rsresId);
                        event.put("resourceRow", position);
                        
                        final String timeStart = obj.getString("time_start");
                        
                        final String timeEnd = obj.getString("time_end");
                        Time timeStartTemp = null;
                        Time timeEndTemp = null;
                        
                        if (timeStart.length() < 10) {
                            final String[] timeStartArray = timeStart.split(":");
                            final String timeStartHour = timeStartArray[0];
                            final String timeStartMin = timeStartArray[1];
                            timeStartTemp =
                                    new Time(new Integer(timeStartHour).intValue(), Integer
                                        .valueOf(timeStartMin).intValue(), 0);
                            final String[] timeEndArray = timeEnd.split(":");
                            final String timeEndHour = timeEndArray[0];
                            final String timeEndMin = timeEndArray[1];
                            timeEndTemp =
                                    new Time(new Integer(timeEndHour).intValue(), Integer.valueOf(
                                        timeEndMin).intValue(), 0);
                        } else {
                            timeStartTemp = getTimeValue(context, timeStart);
                            timeEndTemp = getTimeValue(context, timeEnd);
                        }
                        
                        event.put(
                            "columnStart",
                            getTimeColumn(timelineStartHour, minorSegments, timeStartTemp,
                                MaxTimemarksColumn));
                        event.put(
                            "columnEnd",
                            getTimeColumn(timelineStartHour, minorSegments, timeEndTemp,
                                MaxTimemarksColumn) - 1);
                        event.put("status", 0);
                        
                        // Add for KB 3018920, by ZY 2008-07-31.
                        event.put("isConcurrent", true);
                        
                        events.put(event);
                    }
                }
            }
            
            if (editableResourceReservation.length() != 0) {
                for (int it = 0; it < editableResourceReservation.length(); it++) {
                    final JSONObject obj = (JSONObject) editableResourceReservation.get(it);
                    
                    // Added for KB 3019158,by ZY 2008-08-18.
                    // For cancelled NonUnique resource reservation, do not create timeline event.
                    final String resStatus = obj.getString("status");
                    if ("Cancelled".equalsIgnoreCase(resStatus)) {
                        continue;
                    }
                    
                    final String resId = obj.getString("resource_id");
                    final String rsresId = obj.getString("rsres_id");
                    final JSONObject event = new JSONObject();
                    event.put("rsres_id", rsresId);
                    /*
                     * start the position search We have resId, we search in Uniqueresources object
                     * who have the same res_id, and we return the position in uniqueResource
                     */
                    int position = -1;
                    for (int p = 0; p < UniqueResources.length(); p++) {
                        final JSONObject UniqueResourcesObj = UniqueResources.getJSONObject(p);
                        
                        if (UniqueResourcesObj.getString("resourceId").equals(resId)) {
                            /*
                             * Here is the position
                             */
                            position = p;
                        }
                    }
                    /*
                     * end of the position search
                     */
                    if (position >= 0) {
                        // event.put("eventId", resId);
                        event.put("eventId", rsresId);
                        event.put("resourceRow", position);
                        
                        final String timeStart = obj.getString("starttime");
                        
                        final String timeEnd = obj.getString("endtime");
                        Time tempStart = null;
                        Time tempEnd = null;
                        
                        if (timeStart.length() < 10) {
                            final String[] timeStartArray = timeStart.split(":");
                            final String timeStartHour = timeStartArray[0];
                            final String timeStartMin = timeStartArray[1];
                            tempStart =
                                    new Time(new Integer(timeStartHour).intValue(), Integer
                                        .valueOf(timeStartMin).intValue(), 0);
                            
                            final String[] timeEndArray = timeEnd.split(":");
                            final String timeEndArrayHour = timeEndArray[0];
                            final String timeEndArrayMin = timeEndArray[1];
                            tempEnd =
                                    new Time(new Integer(timeEndArrayHour).intValue(), new Integer(
                                        timeEndArrayMin).intValue(), 0);
                            
                        } else {
                            tempStart = getTimeValue(context, timeStart);
                            tempEnd = getTimeValue(context, timeEnd);
                            
                        }
                        
                        event.put(
                            "columnStart",
                            getTimeColumn(timelineStartHour, minorSegments, tempStart,
                                MaxTimemarksColumn));
                        event.put(
                            "columnEnd",
                            getTimeColumn(timelineStartHour, minorSegments, tempEnd,
                                MaxTimemarksColumn) - 1);
                        event.put("status", 3);
                        
                        // Modified for KB 3018920, by ZY 2008-07-31.
                        event.put("canEdit", obj.getBoolean("editable"));
                        event.put("canDelete", obj.getBoolean("removable"));
                        
                        event.put("comments", obj.getString("comments"));
                        events.put(event);
                    }
                }
            }
            
            timeline.put("events", events);
            
            if (!context.parameterExists("message")) {
                context.addResponseParameter("message", "OK");
            }
            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"json: " + timeline.toString());
            context.addResponseParameter("jsonExpression", timeline.toString());
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID + " : Could not retrieve timeline : ",
                errMessage, e);
        }
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END loadTimeline wfr
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN saveResourceReservations wfr
    // ---------------------------------------------------------------------------------------------
    /**
     * Saves the resource reservations to the database, but not after checking if the requested
     * resources are still available. Other users could have confirmed a resource reservation in the
     * time between requesting and confirming. After saving the records, costs for the reservation
     * is calculated and confirmation mails are sent to the employee in requested by and the
     * employee in requested for (it those employees differ). Workflow rules NotifyRequestedBy and
     * NotifyRequestedFor from the main document can be used. Finally work requests are created for
     * trades and vendors for delivery and pick-up of resources. Inputs: Reservation : Info on the
     * general reservation; RoomReservation : Info on the room reservation ResourceReservations : A
     * list of all resource reservations of the 'current' reservation RoomConflicts: conflict of
     * rooms ResourceConflicts: conflicts of resources User: information on the connected user
     * Outputs: message error message in necesary case
     * 
     * @param context Event handler context.
     */
    public void saveResourceReservations(final String reservations) {
        final String RULE_ID = "saveResourceReservations";
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' ..... ");
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // Get input parameters
        final String jsonExpression = reservations;
        // this.log.info(ACTIVITY_ID + "-" + RULE_ID + "[jsonExpression]: " + jsonExpression);
        
        // saveResourceReservations rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "SAVERESOURCERESERVATIONS_WFR",
                    "SAVERESOURCEERROR", null);
        String notify = "";
        String sql = "";
        // Guo changed 2008-08-20
        // isInResourceConflicts is flag to describe whether the resource reservation is in the
        // resourceConflicts list
        boolean isInResourceConflicts = false;
        // Guo added 2008-08-20
        // isSucessOfProcess is flag to describe whether executing the method
        // processResouceReservationItem sucessfully without conflicts
        boolean isSucessOfProcess = true;
        String newResId = "0";
        String parentId = "0";
        
        JSONArray objectsToSave = null;
        JSONObject objectsReturnFromProcess = new JSONObject();
        try {
            objectsToSave = new JSONArray("" + jsonExpression + ")");
        } catch (final Throwable e1) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID
                    + ": Could not retrieve parameters from context: ", errMessage, e1);
        }
        
        final JSONObject reservation = objectsToSave.getJSONObject(0);
        final JSONObject roomReservation = objectsToSave.getJSONObject(1);
        final JSONArray resourceReservations = objectsToSave.getJSONArray(2);
        final JSONArray roomConflicts = objectsToSave.getJSONArray(3);
        final JSONArray resourceConflicts = objectsToSave.getJSONArray(4);
        // PC 2018035 Added user to check resource permissions on times
        final JSONObject user = objectsToSave.getJSONObject(5);
        try {
            user.put("groups", user.getJSONArray("groups"));
        } catch (final Throwable e) {
            user.put("groups",
                user.getJSONObject("groups").toJSONArray(user.getJSONObject("groups").names()));
        }
        
        // added by GUO, 2008-07-25 to solve KB3018883.
        final JSONArray cancelledResourceReservations =
                getCancelledResourceReservations(resourceReservations);
        final String clauseNotINCancelled =
                getClauseOfNotInCancelled(context, cancelledResourceReservations);
        
        JSONArray dateStart = new JSONArray();
        dateStart = reservation.getJSONArray("date_start");
        reservation.put("time_start", transformDate(reservation.getString("time_start")));
        reservation.put("time_end", transformDate(reservation.getString("time_end")));
        
        if (reservation.has("notify")) {
            notify = reservation.getString("notify");
        } else {
            notify = "1";
        }
        
        List reserveIdList = null;
        if ("recurring".equals(reservation.getString("res_type"))
                && propertyExistsNotNull(reservation, "res_id")) {
            sql =
                    "SELECT res_parent FROM RESERVE WHERE res_id = "
                            + literal(context, reservation.getString("res_id"))
                            + " AND status not in ('Cancelled','Rejected')";
            parentId = getString((Map) retrieveDbRecords(context, sql).get(0), "res_parent");
            
            sql =
                    "SELECT res_id,date_start FROM RESERVE WHERE res_parent = "
                            + literal(context, parentId);
            reserveIdList = retrieveDbRecords(context, sql);
        }
        
        for (int i = 0; i < dateStart.length(); i++) {
            if (reserveIdList != null) {
                boolean isFound = false;
                for (int count = 0; count < reserveIdList.size(); count++) {
                    final String dateStartTemp =
                            getDateValue(context,
                                ((Map) reserveIdList.get(count)).get("date_start")).toString();
                    if (dateStartTemp.equals(dateStart.get(i).toString())) {
                        reservation.put("res_id",
                            getString((Map) reserveIdList.get(count), "res_id"));
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    continue;
                }
            }
            newResId = "0";
            JSONObject resourceReservationItem = new JSONObject();
            for (int k = 0; k < resourceReservations.length(); k++) {
                isInResourceConflicts = false;
                resourceReservationItem = resourceReservations.getJSONObject(k);
                resourceReservationItem.put("date_start", dateStart.get(i).toString());
                
                if (propertyExistsNotNull(roomReservation, "rmres_id")) {
                    JSONObject roomConflictItem = new JSONObject();
                    for (int p = 0; p < roomConflicts.length(); p++) {
                        roomConflictItem = roomConflicts.getJSONObject(p);
                        if (dateStart.get(i).toString()
                            .equals(roomConflictItem.getString("original_date_start"))) {
                            resourceReservationItem.put("bl_id",
                                roomConflictItem.getString("bl_id"));
                            resourceReservationItem.put("fl_id",
                                roomConflictItem.getString("fl_id"));
                            resourceReservationItem.put("rm_id",
                                roomConflictItem.getString("rm_id"));
                            break;
                        }
                    }
                }
                
                JSONObject resourceConflictItem = new JSONObject();
                for (int n = 0; n < resourceConflicts.length(); n++) {
                    resourceConflictItem = resourceConflicts.getJSONObject(n);
                    if (resourceConflictItem.getString("original_date_start").equals(
                        resourceReservationItem.getString("date_start"))
                            && resourceConflictItem.getString("original_time_start").equals(
                                resourceReservationItem.getString("starttime"))
                            && resourceConflictItem.getString("original_time_end").equals(
                                resourceReservationItem.getString("endtime"))
                            && resourceConflictItem.getString("resource_id").equals(
                                resourceReservationItem.getString("resource_id"))
                            && resourceConflictItem.getString("quantity").equals(
                                resourceReservationItem.getString("quantity"))) {
                        if ("Deleted".equals(resourceConflictItem.getString("status"))) {
                            isInResourceConflicts = true;
                            break;
                        } else {
                            resourceReservationItem.put("date_start",
                                resourceConflictItem.getString("date_start"));
                            resourceReservationItem.put("starttime",
                                resourceConflictItem.getString("time_start"));
                            resourceReservationItem.put("endtime",
                                resourceConflictItem.getString("time_end"));
                            resourceReservationItem.put("quantity",
                                resourceConflictItem.getString("quantity"));
                            break;
                        }
                    }
                }// end for (int n = 0; n < resourceConflicts.length(); n++)
                if (!isInResourceConflicts) {
                    objectsReturnFromProcess =
                            processResouceReservationItem(context, resourceReservationItem,
                                reservation, roomReservation, dateStart.get(i).toString(),
                                parentId, newResId, cancelledResourceReservations,
                                clauseNotINCancelled, user);
                    newResId = objectsReturnFromProcess.getString("newResId");
                    parentId = objectsReturnFromProcess.getString("parentId");
                    isSucessOfProcess =
                            Boolean
                                .valueOf(objectsReturnFromProcess.getString("isSucessOfProcess"))
                                .booleanValue();
                }// end if (!isInResourceConflicts)
                
                // Guo added 2008-08-20 to exit the wfr if there are conflicts in
                // processResouceReservationItem() according the spec
                if (!isSucessOfProcess) {
                    break;
                }
            }// end for (int k = 0; k < resourceReservations.length(); k++)
            
            // Guo added 2008-08-20 to exit the wfr if there are conflicts in
            // processResouceReservationItem() according the spec
            if (!isSucessOfProcess) {
                break;
            }
        }// end for (int i = 0; i < dateStart.length(); i++)
        
        // PC Don't update reserve records, create wr and send notifications.
        // Rollback transaction to remove reservations already created in the proccess before the
        // error
        if (!isSucessOfProcess) {
            executeDbRollback(context);
        }
        // If there's no error
        else {
            // Changed by Guo 2008-07-11 --by spec27
            if (!"0".equals(parentId)) {
                sql = "SELECT res_id FROM RESERVE WHERE res_parent = " + literal(context, parentId);
                reserveIdList = retrieveDbRecords(context, sql);
                for (final Iterator iteratorOfReserveIdList = reserveIdList.iterator(); iteratorOfReserveIdList
                    .hasNext();) {
                    final String resId = getString((Map) iteratorOfReserveIdList.next(), "res_id");
                    updateReservationById(context, roomReservation, resId, RULE_ID, errMessage);
                }
            } else {
                if (!"0".equals(newResId)) {
                    updateReservationById(context, roomReservation, newResId, RULE_ID, errMessage);
                }
            }
            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
            // it sets in context the res_id param to next wfr to call
            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [Setting rs_Id]: "+res_id);
            if (reservation.getString("res_type").equals("regular")) {
                parentId = "0";
            } else {
                newResId = "0";
            }
            // BEGIN: Create Work Request
            createResourceWr(context, parentId, newResId);
            // END: Create Work Request
            
            final ReservationsCommonHandler handler = new ReservationsCommonHandler();
            // it sets in context the res_id param to next wfr to call
            // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [Setting rs_Id]: "+res_id);
            if (reservation.getString("res_type").equals("regular")) {
                context.addResponseParameter("res_id", newResId);
                context.addResponseParameter("res_parent", "0");
            } else {
                context.addResponseParameter("res_id", "0");
                context.addResponseParameter("res_parent", parentId);
            }
            
            // String to store the error message from the notification and sendInvitations WFRs
            String errorMessage = "";
            final String sendEmailNotifications =
                    getActivityParameterString(context, ACTIVITY_ID, "SendEmailNotifications");
            if (sendEmailNotifications != null
                    && sendEmailNotifications.toUpperCase().equals("YES")) {
                // BEGIN: Notify
                if (notify.equals("1")) {
                    handler.notifyRequestedBy(context);
                    if (context.parameterExists("message")) {
                        errorMessage += context.getParameter("message");
                    }
                    if (!reservation.getString("user_requested_by").equals(
                        reservation.getString("user_requested_for"))) {
                        handler.notifyRequestedFor(context);
                        if (context.parameterExists("message")) {
                            if (!(errorMessage.equals(context.getParameter("message")))) {
                                if (!(errorMessage.length() == 0)) {
                                    errorMessage += "\n";
                                }
                                errorMessage += context.getParameter("message");
                                context.addResponseParameter("message", errorMessage);
                            }
                        }
                    }
                }
            }// end if (sendEmailNotifications != null
            
            // it is all ok.
            if ("".equals(errorMessage)) {
                context.addResponseParameter("message", "OK");
            }
            
        } // end If there's no error
    }
    
    // ---------------------------------------------------------------------------------------------
    // END saveResourceReservations wfr
    // ---------------------------------------------------------------------------------------------
    
    /**
     * This method process every ResouceReservationItem of the resourceReservations
     * 
     * @param context Event handler context.
     * @param resourceReservationItem one item in resourceReservations.
     * @param roomReservation JavaScript object with the information related to the selected room
     *            arrangement.
     * @param dateStart One date in date_start[].
     * @param parentId For recurring reservation the first date reservation is the parent
     *            reservation of other date reservation.
     * @param newResId The new reservation id .
     * @param user Object with the information related to the connected user .
     */
    public JSONObject processResouceReservationItem(final EventHandlerContext context,
            final JSONObject resourceReservationItem, final JSONObject reservation,
            final JSONObject roomReservation, final String dateStart, String parentId,
            String newResId, final JSONArray cancelledResourceReservations,
            final String clauseNotINCancelled, final JSONObject user) {
        final String RULE_ID = "saveResourceReservations";
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' ..... ");
        
        // saveResourceReservations rule error message
        String errMessage =
                localizeMessage(context, ACTIVITY_ID, "SAVERESOURCERESERVATIONS_WFR",
                    "SAVERESOURCEERROR", null);
        String sql1 = "";
        Map resourceInfo = null;
        boolean allOk = true;
        boolean reservationInPast = false;
        try {
            
            // PC 3018035 we need to get resource's site_id and bl_id in order to get it's
            // timezone minutes offset to do the time comparisons
            final String sqlresourceSiteBl =
                    "SELECT site_id, bl_id FROM resources WHERE resource_id="
                            + literal(context, resourceReservationItem.getString("resource_id"));
            
            final List resourceSiteBl = retrieveDbRecords(context, sqlresourceSiteBl);
            final Map resouceTzInfo = (Map) resourceSiteBl.get(0);
            
            final Date dateCheckTimezone =
                    getDateValue(context, resourceReservationItem.getString("date_start"));
            final String cityTimezone =
                    getResourceResTimezone(context, getString(resouceTzInfo, "site_id"),
                        getString(resouceTzInfo, "bl_id"));
            final int finaloffset = getTotalMinutesOffset(context, cityTimezone, dateCheckTimezone);
            
            // Generate the query to search for the information of the selected resource,
            // and check if selected times are inside the resource availability
            sql1 =
                    " SELECT day_start,day_end,pre_block,post_block,announce_days, "
                            + " announce_time,max_days_ahead,cost_unit,cost_per_unit, "
                            + " cost_late_cancel_pct,quantity,resource_id,approval, "
                            + " ( CASE WHEN ("
                            + formatSqlDaysBetween(context, "CurrentDateTime",
                                resourceReservationItem.getString("date_start"))
                            + " > cancel_days)  OR (( "
                            + formatSqlDaysBetween(context, "CurrentDateTime",
                                resourceReservationItem.getString("date_start"))
                            + "=cancel_days) AND ("
                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                            + "<"
                            + formatSqlAddMinutesToExpression(context, "cancel_time",
                                Integer.toString(finaloffset)) + ")) THEN 0 ELSE 1  "
                            + " END ) AS late_cancel, resource_type, site_id, bl_id "
                            + " FROM resources " + " WHERE resource_id = "
                            + literal(context, resourceReservationItem.getString("resource_id"));
            if (propertyExistsNotNull(resourceReservationItem, "starttime")) {
                sql1 +=
                        " AND day_start <= "
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("starttime"), "-(pre_block)")
                                + " ";
            }
            if (propertyExistsNotNull(resourceReservationItem, "endtime")) {
                sql1 +=
                        " AND day_end >= "
                                + formatSqlAddMinutes(context,
                                    resourceReservationItem.getString("endtime"), "(post_block)")
                                + " ";
            }
            
            // PC KB 3018035
            // If none of the security groups in the User.groups array
            // is RESERVATION SERVICE DESK or RESERVATION MANAGER,
            // check if the user enforces the required times for doing the reservation
            // PC KB 3021918
            if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                    && (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION MANAGER"))) {
                
                final String currentDate = "CurrentDateTime";
                
                // If doens't have status or status is not Cancelled check the user enforces the
                // time to create the reservation
                if (!resourceReservationItem.has("status")
                        || !"Cancelled".equalsIgnoreCase(resourceReservationItem
                            .getString("status"))) {
                    
                    sql1 +=
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
                    // User.groups array is RESERVATION ASSISTANT,
                    // check another additional days restriction
                    // PC KB 3021918
                    if (!ContextStore.get().getUser().isMemberOfGroup("RESERVATION ASSISTANT")) {
                        sql1 +=
                                " AND ( " + formatSqlDaysBetween(context, currentDate, dateStart)
                                        + " <= max_days_ahead ) ";
                    }
                    
                    // KB 3018035 Also check that reservation doesn't occur in the past
                    final Date reservationdate = getDateValue(context, dateStart);
                    final Time reservationtime =
                            getTimeFromString(resourceReservationItem.getString("starttime"));
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
                                localizeMessage(context, ACTIVITY_ID,
                                    "SAVERESOURCERESERVATIONS_WFR", "TIMEPERIODINPAST", null);
                        allOk = false;
                        reservationInPast = true;
                    }
                }
                
            }
            
            if (allOk) {
                
                final List resourceinfolist = retrieveDbRecords(context, sql1);
                
                // PC Before doing the check on the quantity, check that user enforces the other
                // restrictions or show an error
                if (!resourceinfolist.isEmpty()) {
                    
                    resourceInfo = (Map) resourceinfolist.get(0);
                    
                    // PC KB 3021375
                    // If none of the security groups is RESERVATION SERVICE DESK or RESERVATION
                    // MANAGER, and the status is Cancelled then check if the user enforces the
                    // required times for cancelling the reservation and that it hasn't started
                    // already
                    // PC KB 3021918
                    if ((!ContextStore.get().getUser().isMemberOfGroup("RESERVATION SERVICE DESK"))
                            && (!ContextStore.get().getUser()
                                .isMemberOfGroup("RESERVATION MANAGER"))
                            && (resourceReservationItem.has("status"))
                            && ("Cancelled".equalsIgnoreCase(resourceReservationItem
                                .getString("status")))) {
                        
                        // Late cancel is not allowed for not advanced users, save the error
                        if (getString(resourceInfo, "late_cancel").equals("1")) {
                            
                            // Change the error message to give a more detailed information on the
                            // cause
                            errMessage =
                                    localizeMessage(context, ACTIVITY_ID,
                                        "SAVERESOURCERESERVATIONS_WFR", "CANCELRESOURCEERROR", null);
                            allOk = false;
                            reservationInPast = true;
                            
                        } else {
                            // KB 3018035 Also check that reservation to cancel start
                            // time is later than the location's current time
                            final Date reservationdate = getDateValue(context, dateStart);
                            final Time reservationtime =
                                    getTimeFromString(resourceReservationItem
                                        .getString("starttime"));
                            final Date reservationdatetime =
                                    new Date(reservationdate.getYear(), reservationdate.getMonth(),
                                        reservationdate.getDate(), reservationtime.getHours(),
                                        reservationtime.getMinutes(), reservationtime.getSeconds());
                            long time = reservationdatetime.getTime();
                            time += (finaloffset * 60 * 1000);
                            reservationdatetime.setTime(time);
                            
                            final Date currentdatetime = new Date();
                            
                            if (!(currentdatetime.getTime() < reservationdatetime.getTime())) {
                                // Change the error message to give a more detailed information on
                                // the
                                // cause
                                errMessage =
                                        localizeMessage(context, ACTIVITY_ID,
                                            "SAVERESOURCERESERVATIONS_WFR", "CANCELRESOURCEINPAST",
                                            null);
                                allOk = false;
                                reservationInPast = true;
                            }
                        }
                    }
                    // END PC KB 3021375
                    
                    if (allOk) {
                        
                        // If resource is unlimited, or if the reservation status is cancelled
                        if (getString(resourceInfo, "resource_type").equals("Unlimited")
                                || ((resourceReservationItem.has("status")) && ("Cancelled"
                                    .equalsIgnoreCase(resourceReservationItem.getString("status"))))) {
                            allOk = true;
                        } else {
                            allOk =
                                    checkLimitedResourceAvailbility(context,
                                        resourceReservationItem, cancelledResourceReservations,
                                        clauseNotINCancelled, resourceinfolist);
                        }
                    }
                    
                } else {
                    allOk = false;
                }
            }
            
            if (allOk) {
                // added by GUO, 2008-07-25 to solve KB3018883.
                if (!resourceReservationItem.has("status")
                        || !"Cancelled".equalsIgnoreCase(resourceReservationItem
                            .getString("status"))) {
                    // Guo changed 2008-07-30 to solve KB3018738
                    if (getString(resourceInfo, "approval").equals("1")) {
                        resourceReservationItem.put("status", "Awaiting App.");
                    } else {
                        resourceReservationItem.put("status", "Confirmed");
                    }
                }
            }
            
        } catch (final Throwable e) {
            handleError(context, ACTIVITY_ID + "-" + RULE_ID
                    + ": Could not process the new/changed reservations: ", errMessage, e);
        }
        if (allOk) {
            
            try {
                final int costUnit = new Integer(getString(resourceInfo, "cost_unit")).intValue();
                // Guo changed 2008-09-02 to solve KB3019459
                final int costLateCancelPct =
                        new Integer(getString(resourceInfo, "cost_late_cancel_pct")).intValue();
                
                if (resourceReservationItem.getString("quantity").equals("null")) {
                    resourceReservationItem.put("quantity", "1");
                }
                final BigDecimal costPerUnit =
                        new BigDecimal(getString(resourceInfo, "cost_per_unit"));
                BigDecimal cost_rs_res = new BigDecimal(0.0);
                
                final double time_in_minutes =
                        subtractMinutes(context, resourceReservationItem.getString("endtime"),
                            resourceReservationItem.getString("starttime"));
                final double time_in_hours =
                        subtractHours(context, resourceReservationItem.getString("endtime"),
                            resourceReservationItem.getString("starttime"));
                final BigDecimal quantity =
                        new BigDecimal(resourceReservationItem.getString("quantity"));
                
                switch (costUnit) {
                    case 0:// piece
                        cost_rs_res = costPerUnit.multiply(quantity);
                        break;
                    case 1:// minute
                        cost_rs_res =
                                costPerUnit.multiply(quantity).multiply(
                                    new BigDecimal(time_in_minutes));
                        break;
                    case 2:// hour
                        cost_rs_res =
                                costPerUnit.multiply(quantity).multiply(
                                    new BigDecimal(time_in_hours));
                        break;
                    case 3:// daypart
                        cost_rs_res =
                                costPerUnit.multiply(quantity).multiply(
                                    (new BigDecimal(time_in_hours)).divide(new BigDecimal(4.0), 0));
                        break;
                    case 4:// day
                        cost_rs_res = costPerUnit.multiply(quantity);
                        break;
                }
                
                resourceReservationItem.put("cost_rs_res", cost_rs_res.toString());
                
                if (resourceReservationItem.getString("status").equals("Cancelled")) {
                    if (getString(resourceInfo, "late_cancel").equals("1")) {
                        resourceReservationItem
                            .put(
                                "cost_rs_res",
                                (costLateCancelPct * Float.valueOf(
                                    resourceReservationItem.getString("cost_rs_res")).floatValue()) / 100);
                    } else {
                        resourceReservationItem.put("cost_rs_res", 0);
                    }
                }
                
            } catch (final Throwable e) {
                handleError(context,
                    ACTIVITY_ID + "-" + RULE_ID + ": Error creating cost_rs_res: ", errMessage, e);
            }
            
            try {
                // Calculate the total cost for the reservation
                int cost_res = 0;
                
                if (!reservation.getString("cost_res").equals("")) {
                    cost_res = new Double(reservation.getString("cost_res")).intValue();
                }
                
                reservation.put(
                    "cost_res",
                    cost_res
                            + new Double(resourceReservationItem.getString("cost_rs_res"))
                                .intValue());
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                        + ": Could not calculate costs for these reservations: ", errMessage, e);
            }
            
            // Set status and start and end times of the main reservation.
            reservation.put("status", "Confirmed");
            reservation.put("time_start", "null");
            reservation.put("time_end", "null");
            
            if (roomReservation.getString("status").equals("Confirmed")
                    || roomReservation.getString("status").equals("Awaiting App.")) {
                reservation.put("status", roomReservation.getString("status"));
                reservation.put("time_start", roomReservation.getString("time_start"));
                reservation.put("time_end", roomReservation.getString("time_end"));
            }
            
            try {
                
                if (resourceReservationItem.getString("status").equals("Awaiting App.")) {
                    reservation.put("status", "Awaiting App.");
                }
                if (!resourceReservationItem.getString("status").equals("Cancelled")) {
                    if (reservation.getString("time_start").equals("null")) {
                        reservation.put("time_start",
                            transformDate(resourceReservationItem.getString("starttime")));
                    } else {
                        // Change format date
                        final Time dateStart1 =
                                getTimeFromString(transformDate(reservation.getString("time_start")));
                        final Time dateStart2 =
                                getTimeFromString(transformDate(resourceReservationItem
                                    .getString("starttime")));
                        
                        if (dateStart1.before(dateStart2)) {
                            reservation.put("time_start",
                                transformDate(reservation.getString("time_start")));
                        } else {
                            reservation.put("time_start",
                                transformDate(resourceReservationItem.getString("starttime")));
                        }
                    }
                    
                    if (reservation.getString("time_end").equals("null")) {
                        reservation.put("time_end",
                            transformDate(resourceReservationItem.getString("endtime")));
                    } else {
                        final Time dateEnd1 =
                                getTimeFromString(transformDate(reservation.getString("time_end")));
                        final Time dateEnd2 =
                                getTimeFromString(transformDate(resourceReservationItem
                                    .getString("endtime")));
                        
                        if (dateEnd2.before(dateEnd1)) {
                            reservation.put("time_end",
                                transformDate(reservation.getString("time_end")));
                        } else {
                            reservation.put("time_end",
                                transformDate(resourceReservationItem.getString("endtime")));
                        }
                    }
                }
            } catch (final Throwable e) {
                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                        + ": Could not process general reservation status: ", errMessage, e);
            }
            
            if (!propertyExistsNotNull(reservation, "res_id") && "0".equals(newResId)) {
                try {
                    String sql =
                            " INSERT INTO reserve (res_type, recurring_rule,user_created_by,user_requested_for,user_requested_by, user_last_modified_by,"
                                    + " status,date_created, date_last_modified, dv_id, dp_id, Phone,Email, reservation_name, Comments, "
                                    + " Date_start, Date_end, time_start,time_end,cost_res) "
                                    + " VALUES ("
                                    + literal(context, reservation.getString("res_type"))
                                    + ","
                                    + literal(context, reservation.getString("recurring_rule"))
                                    + ","
                                    + literal(context, reservation.getString("user_created_by"))
                                    + ","
                                    + literal(context, reservation.getString("user_requested_for"))
                                    + ","
                                    + literal(context, reservation.getString("user_requested_by"))
                                    + ","
                                    + literal(context, reservation.getString("user_created_by"))
                                    + ","
                                    + literal(context, reservation.getString("status"))
                                    + ","
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + literal(context, reservation.getString("dv_id"))
                                    + ","
                                    + literal(context, reservation.getString("dp_id"))
                                    + ","
                                    + literal(context, reservation.getString("phone"))
                                    + ","
                                    + literal(context, reservation.getString("email"))
                                    + ","
                                    + literal(context, reservation.getString("reservation_name"))
                                    + ","
                                    + literal(context, reservation.getString("comments"))
                                    + ","
                                    + formatSqlIsoToNativeDate(context, dateStart)
                                    + ","
                                    + formatSqlIsoToNativeDate(context, dateStart)
                                    + ","
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(reservation.getString("time_start")))
                                    + ","
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(reservation.getString("time_end")))
                                    + ","
                                    + literal(context, reservation.getString("cost_res")) + ")";
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[Insert-1]: " + sql);
                    
                    executeDbSql(context, sql, false);
                    // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                    // executeDbCommit(context);
                    
                    sql = "SELECT MAX(res_id) " + " FROM reserve ";
                    // Added by Keven 2008-07-11 by spec rx27
                    sql +=
                            " WHERE res_type= "
                                    + literal(context, reservation.getString("res_type"));
                    if (propertyExistsNotNull(reservation, "recurring_rule")) {
                        sql +=
                                " AND recurring_rule="
                                        + literal(context, reservation.getString("recurring_rule"));
                    }
                    if (propertyExistsNotNull(reservation, "dv_id")) {
                        sql += " AND dv_id=" + literal(context, reservation.getString("dv_id"));
                    }
                    
                    if (propertyExistsNotNull(reservation, "dp_id")) {
                        sql += " AND dp_id=" + literal(context, reservation.getString("dp_id"));
                    }
                    
                    if (propertyExistsNotNull(reservation, "phone")) {
                        sql += " AND phone=" + literal(context, reservation.getString("phone"));
                    }
                    
                    if (propertyExistsNotNull(reservation, "email")) {
                        sql += " AND email=" + literal(context, reservation.getString("email"));
                    }
                    if (propertyExistsNotNull(reservation, "comments")) {
                        sql +=
                                " AND comments="
                                        + literal(context, reservation.getString("comments"));
                    }
                    sql +=
                            " AND user_created_by="
                                    + literal(context, reservation.getString("user_created_by"))
                                    + " AND user_requested_by="
                                    + literal(context, reservation.getString("user_requested_by"))
                                    + " AND user_requested_for="
                                    + literal(context, reservation.getString("user_requested_for"))
                                    + " AND user_last_modified_by="
                                    + literal(context, reservation.getString("user_created_by"))
                                    + " AND date_created="
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + " AND date_last_modified="
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime");
                    // Kb# 3019499 --remove by Keven
                    // + " AND reservation_name="
                    // + literal(context, reservation.getString("reservation_name"));
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [sql4]: "+sql);
                    // Modified by Guo 2008-07-11 only recurring reservation set res_parent --by
                    // Spec27
                    final List listMaxResId = selectDbRecords(context, sql);
                    final Object[] listMaxResIdObject = (Object[]) listMaxResId.get(0);
                    newResId = listMaxResIdObject[0].toString();
                    if ("recurring".equals(reservation.getString("res_type"))) {
                        if ("0".equals(parentId)) {
                            parentId = newResId;
                        }
                        sql =
                                " UPDATE reserve SET res_parent = " + literal(context, parentId)
                                        + " WHERE res_id = " + literal(context, newResId);
                        // this.log.info("'"+ACTIVITY_ID+"-"+RULE_ID+"' [sql 3.1.1]: "+sql);
                        executeDbSql(context, sql, false);
                        // tonight do flag
                    }
                    
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                            + ": Could not create general reservation record: ", errMessage, e);
                }
            } // End if (!propertyExistsNotNull(reservation, "res_id"))
            else {
                if (propertyExistsNotNull(reservation, "res_id")) {
                    newResId = reservation.getString("res_id");
                    // Modified by Guo 2008-07-11 for edit or recurring reservation with room
                    // reservation needn't get the parentId
                    // parentId = newResId;
                    // Edit the current reserve record
                    try {
                        if (!reservation.getString("time_start").trim().equals("null")) {
                            String sql =
                                    " UPDATE reserve SET user_requested_by="
                                            + literal(context,
                                                reservation.getString("user_requested_by"))
                                            + ","
                                            + " user_requested_for="
                                            + literal(context,
                                                reservation.getString("user_requested_for"))
                                            + ","
                                            + " user_last_modified_by="
                                            + literal(context,
                                                reservation.getString("user_created_by"))
                                            + ","
                                            + " date_last_modified="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + ","
                                            // Guo changed 2008-09-01
                                            // + " status="
                                            // + literal(context, reservation.getString("status")) +
                                            // ","
                                            + " dv_id="
                                            + literal(context, reservation.getString("dv_id"))
                                            + ","
                                            + " dp_id="
                                            + literal(context, reservation.getString("dp_id"))
                                            + ","
                                            + " phone="
                                            + literal(context, reservation.getString("phone"))
                                            + ","
                                            + " email="
                                            + literal(context, reservation.getString("email"))
                                            + ","
                                            + " reservation_name="
                                            + literal(context,
                                                reservation.getString("reservation_name")) + ","
                                            + " comments="
                                            + literal(context, reservation.getString("comments"))
                                            + ",";
                            
                            if (propertyExistsNotNull(reservation, "doc_event")) {
                                sql +=
                                        " doc_event="
                                                + literal(context,
                                                    reservation.getString("doc_event")) + ",";
                            }
                            
                            sql +=
                                    " date_start="
                                            + formatSqlIsoToNativeDate(context, dateStart)
                                            + ","
                                            + " date_end="
                                            + formatSqlIsoToNativeDate(context, dateStart)
                                            // Guo changed 2008-09-01 by spec
                                            // + ","
                                            // + " time_start=" +
                                            // formatSqlIsoToNativeTime(context,transformDate(reservation.getString("time_start")))
                                            // + ","
                                            // + " time_end=" +
                                            // formatSqlIsoToNativeTime(context,transformDate(reservation.getString("time_end")))
                                            // + ","
                                            // + " cost_res="
                                            // + literal(context, reservation.getString("cost_res"))
                                            + " WHERE res_id="
                                            + literal(context, reservation.getString("res_id"));
                            // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [Update-5]: "+sql);
                            
                            executeDbSql(context, sql, false);
                            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                            // executeDbCommit(context);
                        }
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                + ": Could not edit general reservation record: ", errMessage, e);
                    }
                }
            }
            
            if (propertyExistsNotNull(resourceReservationItem, "rsres_id")) {
                try {
                    final String sql8 =
                            " UPDATE reserve_rs SET comments="
                                    + literal(context,
                                        resourceReservationItem.getString("comments"))
                                    + ","
                                    + " date_start="
                                    + formatSqlIsoToNativeDate(context,
                                        resourceReservationItem.getString("date_start"))
                                    + ","
                                    + " cost_rsres="
                                    + literal(context,
                                        resourceReservationItem.getString("cost_rs_res"))
                                    + ","
                                    + " time_start="
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(resourceReservationItem
                                            .getString("starttime")))
                                    + ","
                                    + " time_end="
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(resourceReservationItem.getString("endtime")))
                                    + ","
                                    + " date_created="
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + " date_last_modified="
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + " user_last_modified_by="
                                    + literal(context, reservation.getString("user_created_by"))
                                    + ","
                                    + " quantity="
                                    + literal(context,
                                        resourceReservationItem.getString("quantity"))
                                    + ","
                                    + " bl_id="
                                    // PC KB item 3015654
                                    + literal(context, reservation.getString("resource_bl_id"))
                                    + ","
                                    + " fl_id="
                                    + literal(context, reservation.getString("resource_fl_id"))
                                    + ","
                                    + " rm_id="
                                    + literal(context, reservation.getString("resource_rm_id"))
                                    + ","
                                    + " status="
                                    + literal(context, resourceReservationItem.getString("status"))
                                    + " WHERE rsres_id="
                                    + literal(context,
                                        resourceReservationItem.getString("rsres_id"));
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [Update-6]: "+sql);
                    
                    executeDbSql(context, sql8, false);
                    // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                    // executeDbCommit(context);
                    
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                            + ": Could not edit existing resource reservation records: ",
                        errMessage, e);
                }
            } else {
                // It's a new reservation
                try {
                    final String sql9 =
                            " INSERT INTO reserve_rs (res_id, comments, date_start, cost_rsres,time_start, time_end,"
                                    + " date_created, date_last_modified, user_last_modified_by, resource_id, quantity,bl_id, fl_id, rm_id, status) "
                                    + " VALUES ("
                                    + literal(context, newResId)
                                    + ","
                                    + literal(context,
                                        resourceReservationItem.getString("comments"))
                                    + ","
                                    + formatSqlIsoToNativeDate(context,
                                        resourceReservationItem.getString("date_start"))
                                    + ","
                                    + literal(context,
                                        resourceReservationItem.getString("cost_rs_res"))
                                    + ","
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(resourceReservationItem
                                            .getString("starttime")))
                                    + ","
                                    + formatSqlIsoToNativeTime(context,
                                        transformDate(resourceReservationItem.getString("endtime")))
                                    + ","
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                    + ","
                                    + literal(context, reservation.getString("user_created_by"))
                                    + ","
                                    + literal(context,
                                        resourceReservationItem.getString("resource_id"))
                                    + ","
                                    + literal(context,
                                        resourceReservationItem.getString("quantity"))
                                    + ","
                                    // PC KB item 3015654
                                    + literal(context, reservation.getString("resource_bl_id"))
                                    + ","
                                    + literal(context, reservation.getString("resource_fl_id"))
                                    + ","
                                    + literal(context, reservation.getString("resource_rm_id"))
                                    + ","
                                    + literal(context, resourceReservationItem.getString("status"))
                                    + ")";
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[Insert-2]: " + sql);
                    
                    executeDbSql(context, sql9, false);
                    // Guo changed 2008-09-12 to remove all executeDbCommit(context)
                    // executeDbCommit(context);
                    /*
                     * String sql = "SELECT MAX(rsres_id) " + "FROM reserve_rs"; //
                     * this.log.info(ACTIVITY_ID+"-"+RULE_ID+" [sql5]: "+sql);
                     * 
                     * List listMaxRsResId = selectDbRecords(context, sql); Object[]
                     * listMaxRsResIdObject = (Object[]) listMaxRsResId.get(0);
                     * resourceReservationItem.put("rsres_id", "");
                     * resourceReservationItem.put("rsres_idSQL",
                     * listMaxRsResIdObject[0].toString());
                     */
                } catch (final Throwable e) {
                    handleError(context, ACTIVITY_ID + "-" + RULE_ID
                            + ": Could not create new resource reservation records: ", errMessage,
                        e);
                }
            }
        } else {// end if (allOk)}
        
            // If reservation is not in the past, change saveResourceReservations
            // rule error message when resource unavailable. Added by Guo, 2008-08-18.
            if (!reservationInPast) {
                errMessage =
                        localizeMessage(context, ACTIVITY_ID, "SAVERESOURCERESERVATIONS_WFR",
                            "RESOURCEUNAVAILABLE", null);
            }
            context.addResponseParameter("message", errMessage);
        }
        final JSONObject returnObject = new JSONObject();
        returnObject.put("parentId", parentId);
        returnObject.put("newResId", newResId);
        // Guo added 2008-08-20
        returnObject.put("isSucessOfProcess", allOk);
        return returnObject;
        
    }
    
    /**
     * Added by ZY,2008-08-12.
     * 
     * This method check if availiable quantity of one specified resource could match requested
     * quantity of one resource reservation
     * 
     * 
     * @param context Event handler context.
     * @param resourceReservationItem one item in resourceReservations.
     * @param cancelledResourceReservations JavaScript object array, contains cancelled resource
     *            reservations.
     * @param clauseNotINCancelled One string constructed from cancelledResourceReservations, used
     *            in 'not in' sql clause.
     * @param resourceinfo The resource array that contains resources.
     */
    private boolean checkLimitedResourceAvailbility(final EventHandlerContext context,
            final JSONObject resourceReservationItem,
            final JSONArray cancelledResourceReservations, final String clauseNotINCancelled,
            final List resourceinfo) {
        boolean isAllOk = true;
        if (getMinAvailableResourceQuantity(context, resourceReservationItem,
            cancelledResourceReservations, clauseNotINCancelled, resourceinfo) < Integer
            .parseInt(resourceReservationItem.getString("quantity"))) {
            isAllOk = false;
        }
        return isAllOk;
    }
    
    /**
     * Added by ZY,2008-08-12.
     * 
     * This method calcute and return minimum availiable quantity of one specified resource, for
     * requested time slot of given resource reservation.
     * 
     * 
     * @param context Event handler context.
     * @param resourceReservationItem one item in resourceReservations.
     * @param cancelledResourceReservations JavaScript object array, contains cancelled resource
     *            reservations.
     * @param clauseNotINCancelled One string constructed from cancelledResourceReservations, used
     *            in 'not in' sql clause.
     * @param resourceinfo The resource array that contains resources.
     */
    private int getMinAvailableResourceQuantity(final EventHandlerContext context,
            final JSONObject resourceReservationItem,
            final JSONArray cancelledResourceReservations, final String clauseNotINCancelled,
            final List resourceinfo) {
        String sql2;
        int preBlock;
        int postBlock;
        int minAvailableResourceQuantity = 0;
        // If the selected resource is reservable in the selected period, check if
        // reserved quantity is free or not
        if (!resourceinfo.isEmpty()) {
            
            final Map valuesresouceinfo = (Map) resourceinfo.get(0);
            final int resourcemaxquantity =
                    Integer.parseInt(getString(valuesresouceinfo, "quantity"));
            int maxReservedQuantity = 0;
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
                // AND b.rsres_id NOT IN (rsresid_toCancel)
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "b.rsres_id");
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
                
                // " AND a.rsres_id NOT IN (rsresid_toCancel)"
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "a.rsres_id");
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
                
                // " AND d.rsres_id NOT IN (rsresid_toCancel)"
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "d.rsres_id");
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
                
                // " AND c.rsres_id NOT IN (rsresid_toCancel)"
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "c.rsres_id");
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
                
                // " AND e.rsres_id NOT IN (rsresid_toCancel)"
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "e.rsres_id");
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
                
                // " AND f.rsres_id NOT IN (rsresid_toCancel)"
                if (cancelledResourceReservations.length() > 0) {
                    sql2 += clauseNotINCancelled.replaceAll("rsres_id", "f.rsres_id");
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
                    minAvailableResourceQuantity = resourcemaxquantity - maxReservedQuantity;
                } else {
                    minAvailableResourceQuantity = resourcemaxquantity;
                }
            }
        }
        return minAvailableResourceQuantity;
    }
    
    /*
     * CreateResourceWr
     */
    public void createResourceWr(final EventHandlerContext context, final String parentId,
            final String newResId) {
        final String RULE_ID = "createResourceWr";
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' ..... ");
        
        final int mtu = 1;
        // String res_id = (String) context.getParameter("res_id");
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
        
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "SAVERESOURCERESERVATIONS_WFR",
                    "SAVERESOURCEERROR", null);
        String sql = "";
        Object[] tradeToCreateObject = null;
        Object[] vendorToCreateObject = null;
        String wrId1 = "";
        String wrId2 = "";
        final List listResId = new ArrayList();
        
        boolean allOk = false;
        
        if (!"0".equals(parentId)) {
            sql = "SELECT res_id FROM reserve WHERE res_parent = " + literal(context, parentId);
            final List recurringResIdList = retrieveDbRecords(context, sql);
            for (final Iterator recurringResIterator = recurringResIdList.iterator(); recurringResIterator
                .hasNext();) {
                final String resIdTemp = getString((Map) recurringResIterator.next(), "res_id");
                listResId.add(resIdTemp);
            }
        } else if (!"0".equals(newResId)) {
            listResId.add(newResId);
        }
        for (final Iterator it = listResId.iterator(); it.hasNext();) {
            final String res_id = (String) it.next();
            sql =
                    "SELECT status, rsres_id, resource_id FROM reserve_rs WHERE res_id = "
                            + literal(context, res_id);
            final List resourceReservations = retrieveDbRecords(context, sql);
            for (int i = 0; i < resourceReservations.size(); i++) {
                final JSONObject event = new JSONObject();
                // event = resourceReservations.getJSONObject(i);
                
                // event.put("starttime", transformDate(event.getString("starttime")));
                // event.put("endtime", transformDate(event.getString("endtime")));
                
                event.put("status", getString((Map) resourceReservations.get(i), "status"));
                event.put("resource_id",
                    getString((Map) resourceReservations.get(i), "resource_id"));
                event.put("rsres_id", getString((Map) resourceReservations.get(i), "rsres_id"));
                
                if (event.getString("status").equals("Cancelled")
                        || event.getString("status").equals("Rejected")) {
                    // cancelled and rejected reservation: Cancel all work requests for this
                    // reservation by
                    // performing
                    try {
                        sql =
                                " UPDATE wr SET status='Can', date_stat_chg="
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + "," + " time_stat_chg="
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + " WHERE rsres_id="
                                        + literal(context, event.getString("rsres_id"))
                                        + " AND res_id=" + literal(context, res_id)
                                        + " AND status IN ('R','Rev','A','AA')";
                        
                        executeDbSql(context, sql, false);
                        
                        sql =
                                " UPDATE wr SET status='S', date_stat_chg="
                                        + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                        + "," + " time_stat_chg="
                                        + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                        + " WHERE rsres_id="
                                        + literal(context, event.getString("rsres_id"))
                                        + " AND res_id=" + literal(context, res_id)
                                        + " AND status IN ('I','HP','HA','HL')";
                        
                        executeDbSql(context, sql, false);
                        
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                + ": Could not retrieve existing work requests: ", errMessage, e);
                    }
                } else {
                    List tradeToCreate = new ArrayList();
                    List vendorToCreate = new ArrayList();
                    
                    // Guo added 2008-08-20 to solve KB3019197
                    final String statusOfReservation = event.getString("status");
                    
                    // Check if the resource has trade that accepts wrs from reservations
                    try {
                        sql =
                                " SELECT resource_std.tr_id FROM resource_std "
                                        + " LEFT OUTER JOIN tr ON resource_std.tr_id = tr.tr_id "
                                        + " LEFT OUTER JOIN resources ON resources.resource_std = resource_std.resource_std "
                                        + " WHERE tr.wr_from_reserve = 1 AND resources.resource_id = "
                                        + literal(context, event.getString("resource_id"));
                        
                        tradeToCreate = selectDbRecords(context, sql);
                        
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                + ": Could not retrieve trades for work requests: ", errMessage, e);
                    }
                    
                    // Check if resource has vendor that accepts wrs from reservations
                    try {
                        sql =
                                " SELECT resource_std.vn_id FROM resource_std "
                                        + " LEFT OUTER JOIN vn ON resource_std.vn_id = vn.vn_id "
                                        + " LEFT OUTER JOIN resources ON resources.resource_std = resource_std.resource_std "
                                        + " WHERE vn.wr_from_reserve = 1 AND resources.resource_id = "
                                        + literal(context, event.getString("resource_id"));
                        
                        vendorToCreate = selectDbRecords(context, sql);
                        
                    } catch (final Throwable e) {
                        handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                + ": Could not retrieve vendors for work requests: ", errMessage, e);
                    }
                    
                    if (tradeToCreate.size() > 0) {
                        // Start cancelling all existing work requests assigned to a different trade
                        String tradetoc = "";
                        tradeToCreateObject = (Object[]) tradeToCreate.get(0);
                        tradetoc = tradeToCreateObject[0].toString();
                        
                        try {
                            sql =
                                    " UPDATE wr SET status='Can', date_stat_chg="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + "," + " time_stat_chg="
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " WHERE rsres_id="
                                            + literal(context, event.getString("rsres_id"))
                                            + " AND res_id=" + literal(context, res_id)
                                            + " AND tr_id IS NOT NULL" + " AND tr_id <> "
                                            + literal(context, tradetoc)
                                            + " AND status IN ('R','Rev','A','AA')";
                            
                            executeDbSql(context, sql, false);
                            
                            sql =
                                    " UPDATE wr SET status='S', date_stat_chg="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + "," + " time_stat_chg="
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " WHERE rsres_id="
                                            + literal(context, event.getString("rsres_id"))
                                            + " AND res_id=" + literal(context, res_id)
                                            + " AND tr_id IS NOT NULL" + " AND tr_id <> "
                                            + literal(context, tradetoc)
                                            + " AND status IN ('I','HP','HA','HL')";
                            
                            executeDbSql(context, sql, false);
                            
                        } catch (final Throwable e) {
                            handleError(
                                context,
                                ACTIVITY_ID
                                        + "-"
                                        + RULE_ID
                                        + ": Could not cancel existing work requests for different trades: ",
                                errMessage, e);
                        }
                        
                        List wrFound = new ArrayList();
                        
                        // If it's a existing reservation: Get possible existing work requests for
                        // this
                        // trade
                        if (!event.getString("rsres_id").equals("")) {
                            try {
                                sql =
                                        " SELECT wr_id FROM wr WHERE rsres_id="
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id=" + literal(context, res_id)
                                                + " AND tr_id=" + literal(context, tradetoc)
                                                + " AND status <> 'Can'"
                                                + " AND status <> 'S' ORDER BY time_assigned";
                                
                                wrFound = selectDbRecords(context, sql);
                            } catch (final Throwable e) {
                                handleError(
                                    context,
                                    ACTIVITY_ID
                                            + "-"
                                            + RULE_ID
                                            + ": Could not retrieve existing work requests for trades: ",
                                    errMessage, e);
                            }
                        }
                        
                        if (event.getString("rsres_id").equals("") || wrFound.size() <= 0) {
                            tradeToCreateObject = (Object[]) tradeToCreate.get(0);
                            final String tradeTocreate = tradeToCreateObject[0].toString();
                            try {
                                // Insert new wr record for setup by
                                sql =
                                        " INSERT INTO wr (res_id,rsres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status,"
                                                + " date_assigned,time_assigned,date_requested,time_requested,tr_id,phone,dv_id,dp_id,"
                                                + " description,date_stat_chg,time_stat_chg,prob_type)"
                                                + " SELECT reserve.res_id,reserve_rs.rsres_id, reserve_rs.bl_id,reserve_rs.fl_id,reserve_rs.rm_id,"
                                                + " reserve.user_requested_by,ROUND(CAST("
                                                + formatSqlIsNull(context, "resources.pre_block,0")
                                                + " AS real)/60,2),"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rs.date_start, "
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rs.time_start",
                                                    " ("
                                                            + mtu
                                                            + "*"
                                                            + formatSqlIsNull(context,
                                                                "-(resources.pre_block),0") + ")")
                                                + ","
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + literal(context, tradeTocreate)
                                                + ",reserve.phone, reserve.dv_id,reserve.dp_id,"
                                                // PC KB 3038222
                                                + " '"
                                                + setupdesc
                                                + ". "
                                                + reservationComments
                                                + " '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve.comments)"
                                                + formatSqlConcat(context)
                                                + "'. '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve_rs.comments), "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ",'RES. SETUP'"
                                                + " FROM reserve_rs"
                                                + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id "
                                                + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id"
                                                + " WHERE Reserve.res_id = "
                                                + literal(context, res_id)
                                                + " AND reserve_rs.rsres_id = "
                                                + literal(context, event.getString("rsres_id"));
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not create work request for trade set-up: ",
                                    errMessage, e);
                            }
                            
                            try {
                                // Insert new wr record for cleaning by
                                sql =
                                        " INSERT INTO wr (res_id,rsres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status,"
                                                + " date_assigned,time_assigned,date_requested,time_requested,tr_id,phone,dv_id,dp_id,"
                                                + " description, date_stat_chg,time_stat_chg,prob_type)"
                                                + " SELECT reserve.res_id,reserve_rs.rsres_id, reserve_rs.bl_id, reserve_rs.fl_id, reserve_rs.rm_id,"
                                                + " reserve.user_requested_by,ROUND(CAST("
                                                + formatSqlIsNull(context, "resources.post_block,0")
                                                + " AS real)/60,2),"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rs.date_start,reserve_rs.time_end,"
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + literal(context, tradeTocreate)
                                                + ",reserve.phone, reserve.dv_id,reserve.dp_id,"
                                                // PC KB 3038222
                                                + " '"
                                                + cleanupdesc
                                                + ". "
                                                + reservationComments
                                                + " '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve.comments)"
                                                + formatSqlConcat(context)
                                                + "'. '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve_rs.comments), "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ",'RES. CLEANUP'"
                                                + " FROM reserve_rs"
                                                + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id "
                                                + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id"
                                                + " WHERE Reserve.res_id = "
                                                + literal(context, res_id)
                                                + " AND reserve_rs.rsres_id = "
                                                + literal(context, event.getString("rsres_id"));
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not create work request for trade clean-up: ",
                                    errMessage, e);
                            }
                        } // End if(!event.getString("rsres_id").equals("")||wrFound.size() <= 0)
                        else {
                            final Object[] wrObject = (Object[]) wrFound.get(0);
                            final Object[] wrObject1 = (Object[]) wrFound.get(1);
                            wrId1 = wrObject[0].toString();
                            wrId2 = wrObject1[0].toString();
                            
                            try {
                                // Update [wrId1] for setup work request
                                
                                // PC changed to solve KB item 3019287
                                if (isOracle(context)) {
                                    
                                    sql =
                                            " UPDATE wr SET ("
                                                    + " time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                    + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                    + " time_requested,phone,dv_id,dp_id"
                                                    + " ) = ( SELECT "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " reserve_rs.bl_id,"
                                                    + " reserve_rs.fl_id,"
                                                    + " reserve_rs.rm_id,"
                                                    + " reserve.user_requested_by,"
                                                    + " ROUND(CAST("
                                                    + formatSqlIsNull(context,
                                                        "resources.pre_block,0")
                                                    + " AS real)/60,2),"
                                                    // Guo changed 2008-08-20 to solve KB3019197
                                                    + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                            : " 'A'")
                                                    + ","
                                                    + " reserve_rs.date_start,"
                                                    + formatSqlAddMinutesToExpression(
                                                        context,
                                                        "reserve_rs.time_start",
                                                        formatSqlIsNull(context,
                                                            "-(resources.pre_block) , 0"))
                                                    + ","
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " reserve.phone,"
                                                    + " reserve.dv_id,"
                                                    + " reserve.dp_id "
                                                    + " FROM reserve_rs, reserve, resources "
                                                    + " WHERE reserve_rs.res_id = reserve.res_id "
                                                    + " AND reserve_rs.resource_id = resources.resource_id "
                                                    + " AND reserve.res_id = "
                                                    + literal(context, res_id)
                                                    + " AND reserve_rs.rsres_id = "
                                                    + literal(context, event.getString("rsres_id"))
                                                    + ")"
                                                    + " WHERE wr_id = "
                                                    + literal(context, wrId1);
                                    
                                } else {
                                    
                                    sql =
                                            " UPDATE wr SET bl_id = reserve_rs.bl_id,"
                                                    + " fl_id = reserve_rs.fl_id,"
                                                    + " rm_id = reserve_rs.rm_id,"
                                                    + " time_stat_chg = "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ", "
                                                    + " date_stat_chg = "
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ", "
                                                    + " requestor = reserve.user_requested_by,"
                                                    + " est_labor_hours = ROUND(CAST("
                                                    + formatSqlIsNull(context,
                                                        "resources.pre_block,0")
                                                    + " AS real)/60,2),"
                                                    + " date_assigned = reserve_rs.date_start,"
                                                    + " time_assigned =  "
                                                    + formatSqlAddMinutesToExpression(
                                                        context,
                                                        "reserve_rs.time_start",
                                                        formatSqlIsNull(context,
                                                            "-(resources.pre_block) , 0"))
                                                    + ","
                                                    + " date_requested = "
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " time_requested = "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " phone = reserve.phone,"
                                                    + " dv_id = reserve.dv_id,"
                                                    + " dp_id = reserve.dp_id "
                                                    // Guo changed 2008-08-20 to solve KB3019197
                                                    + ", status = "
                                                    + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                            : " 'A'")
                                                    + " FROM reserve_rs"
                                                    + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id "
                                                    + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id "
                                                    + " WHERE reserve.res_id = "
                                                    + literal(context, res_id)
                                                    + " AND reserve_rs.rsres_id = "
                                                    + literal(context, event.getString("rsres_id"))
                                                    + " AND wr_id = " + literal(context, wrId1);
                                    
                                }
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not update work request for trade set-up: ",
                                    errMessage, e);
                            }
                            
                            try {
                                // Update [wrId2] for setup work request
                                
                                // PC changed to solve KB item 3019287
                                if (isOracle(context)) {
                                    
                                    sql =
                                            " UPDATE wr SET ("
                                                    + " time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                    + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                    + " time_requested,phone,dv_id,dp_id"
                                                    + " ) = ( SELECT "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " reserve_rs.bl_id,"
                                                    + " reserve_rs.fl_id,"
                                                    + " reserve_rs.rm_id,"
                                                    + " reserve.user_requested_by,"
                                                    + " ROUND(CAST("
                                                    + formatSqlIsNull(context,
                                                        "resources.post_block,0")
                                                    + " AS real)/60,2),"
                                                    // Guo changed 2008-08-20 to solve KB3019197
                                                    + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                            : " 'A'")
                                                    + ","
                                                    + " reserve_rs.date_start,reserve_rs.time_end,"
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " reserve.phone,"
                                                    + " reserve.dv_id,"
                                                    + " reserve.dp_id "
                                                    + " FROM reserve_rs, reserve, resources "
                                                    + " WHERE reserve_rs.res_id = reserve.res_id "
                                                    + " AND reserve_rs.resource_id = resources.resource_id "
                                                    + " AND reserve.res_id = "
                                                    + literal(context, res_id)
                                                    + " AND reserve_rs.rsres_id = "
                                                    + literal(context, event.getString("rsres_id"))
                                                    + ")"
                                                    + " WHERE wr_id = "
                                                    + literal(context, wrId2);
                                    
                                } else {
                                    
                                    sql =
                                            " UPDATE wr SET bl_id = reserve_rs.bl_id,"
                                                    + " fl_id = reserve_rs.fl_id, rm_id = reserve_rs.rm_id,"
                                                    + " time_stat_chg = "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ", "
                                                    + " date_stat_chg = "
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ", "
                                                    + " requestor = reserve.user_requested_by,"
                                                    + " est_labor_hours = ROUND(CAST("
                                                    + formatSqlIsNull(context,
                                                        "resources.post_block,0")
                                                    + " AS real)/60,2),"
                                                    + " date_assigned = reserve_rs.date_start,"
                                                    + " time_assigned = reserve_rs.time_end,"
                                                    + " date_requested = "
                                                    + formatSqlIsoToNativeDate(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " time_requested = "
                                                    + formatSqlIsoToNativeTime(context,
                                                        "CurrentDateTime")
                                                    + ","
                                                    + " phone = reserve.phone,"
                                                    + " dv_id = reserve.dv_id,"
                                                    + " dp_id = reserve.dp_id"
                                                    // Guo changed 2008-08-20 to solve KB3019197
                                                    + ", status = "
                                                    + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                            : " 'A'")
                                                    + " FROM reserve_rs"
                                                    + " LEFT OUTER JOIN reserve on reserve_rs.res_id = reserve.res_id "
                                                    + " LEFT OUTER JOIN resources on reserve_rs.resource_id = resources.resource_id "
                                                    + " WHERE reserve.res_id = "
                                                    + literal(context, res_id)
                                                    + " AND reserve_rs.rsres_id = "
                                                    + literal(context, event.getString("rsres_id"))
                                                    + " AND wr_id = " + literal(context, wrId2);
                                    
                                }
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not update work request for trade clean-up: ",
                                    errMessage, e);
                            }
                        } // End else
                    } // End if (tradeToCreate.size() > 0)
                    else {
                        if (!event.getString("rsres_id").equals("")) {
                            // Existing reservation
                            try {
                                // Cancel all possible existing work requests for trades for this
                                // reservation
                                sql =
                                        " UPDATE wr SET status='Can', date_stat_chg="
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + " time_stat_chg="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime") + " WHERE rsres_id = "
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id = " + literal(context, res_id)
                                                + " AND tr_id IS NOT NULL"
                                                + " AND status IN ('R','Rev','A','AA')";
                                
                                executeDbSql(context, sql, false);
                                
                                sql =
                                        " UPDATE wr SET status='S', date_stat_chg="
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + " time_stat_chg="
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + " WHERE rsres_id = "
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id = "
                                                + literal(context, res_id)
                                                + " AND tr_id IS NOT NULL AND status IN ('I','HP','HA','HL')";
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not cancel existing work request for trades: ",
                                    errMessage, e);
                            }
                        }
                    }
                    
                    if (vendorToCreate.size() > 0) {
                        vendorToCreateObject = (Object[]) vendorToCreate.get(0);
                        final String vn = vendorToCreateObject[0].toString();
                        
                        // Start with cancelling all existing work requests assigned to a different
                        // vendor
                        try {
                            sql =
                                    " UPDATE wr SET status='Can', date_stat_chg="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + "," + " time_stat_chg="
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " WHERE rsres_id="
                                            + literal(context, event.getString("rsres_id"))
                                            + " AND res_id=" + literal(context, res_id)
                                            + " AND vn_id IS NOT NULL" + " AND vn_id <> "
                                            + literal(context, vn)
                                            + " AND status IN ('R','Rev','A','AA')";
                            
                            executeDbSql(context, sql, false);
                            
                            sql =
                                    " UPDATE wr SET status='S', date_stat_chg="
                                            + formatSqlIsoToNativeDate(context, "CurrentDateTime")
                                            + "," + " time_stat_chg="
                                            + formatSqlIsoToNativeTime(context, "CurrentDateTime")
                                            + " WHERE rsres_id="
                                            + literal(context, event.getString("rsres_id"))
                                            + " AND res_id=" + literal(context, res_id)
                                            + " AND vn_id IS NOT NULL" + " AND vn_id <> "
                                            + literal(context, vn)
                                            + " AND status IN ('I','HP','HA','HL')";
                            
                            executeDbSql(context, sql, false);
                        } catch (final Throwable e) {
                            handleError(
                                context,
                                ACTIVITY_ID
                                        + "-"
                                        + RULE_ID
                                        + ": Could not cancel existing work requests for different vendors: ",
                                errMessage, e);
                        }
                        
                        List wrIdList = new ArrayList();
                        
                        if (!event.getString("rsres_id").equals("")) {
                            // existing reservation
                            try {
                                // Get possible existing work requests for this vendor
                                sql =
                                        " SELECT wr_id FROM wr WHERE rsres_id = "
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id = " + literal(context, res_id)
                                                + " AND vn_id = " + literal(context, vn)
                                                + " AND status <> 'Can'" + " AND status <> 'S'";
                                
                                wrIdList = selectDbRecords(context, sql);
                            } catch (final Throwable e) {
                                handleError(
                                    context,
                                    ACTIVITY_ID
                                            + "-"
                                            + RULE_ID
                                            + ": Could not retrieve existing work requests for vendors: ",
                                    errMessage, e);
                            }
                        }
                        
                        if (event.getString("rsres_id").equals("") || wrIdList.size() == 0) {
                            try {
                                // Insert new wr record for setup by
                                sql =
                                        " INSERT INTO wr (res_id,rsres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status,"
                                                + " date_assigned,time_assigned,date_requested,time_requested,vn_id,phone,dv_id,dp_id,"
                                                + " description,date_stat_chg,time_stat_chg,prob_type) "
                                                + " SELECT reserve.res_id,reserve_rs.rsres_id,reserve_rs.bl_id,reserve_rs.fl_id,reserve_rs.rm_id,"
                                                + " reserve.user_requested_by,ROUND(CAST("
                                                + formatSqlIsNull(context, "resources.pre_block,0")
                                                + " AS real)/60,2),"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rs.date_start,"
                                                + formatSqlAddMinutesToExpression(
                                                    context,
                                                    "reserve_rs.time_start",
                                                    " ("
                                                            + mtu
                                                            + "*"
                                                            + formatSqlIsNull(context,
                                                                "-(resources.pre_block),0") + ")")
                                                + ","
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + literal(context, vn)
                                                + ","
                                                + " reserve.phone,reserve.dv_id,reserve.dp_id,"
                                                // PC KB 3038222
                                                + " '"
                                                + setupdesc
                                                + ". "
                                                + reservationComments
                                                + " '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve.comments)"
                                                + formatSqlConcat(context)
                                                + "'. '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve_rs.comments), "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ",'RES. SETUP'"
                                                + " FROM reserve_rs"
                                                + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id"
                                                + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id"
                                                + " WHERE Reserve.res_id = "
                                                + literal(context, res_id)
                                                + " AND reserve_rs.rsres_id = "
                                                + literal(context, event.getString("rsres_id"));
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not create work request for vendor set-up: ",
                                    errMessage, e);
                            }
                            
                            try {
                                // Insert new wr record for cleaning by
                                sql =
                                        " INSERT INTO wr (res_id,rsres_id,bl_id,fl_id,rm_id,requestor,est_labor_hours,status,"
                                                + " date_assigned,time_assigned,date_requested,time_requested,vn_id,phone,dv_id,dp_id,"
                                                + " description, date_stat_chg, time_stat_chg,prob_type) "
                                                + " SELECT reserve.res_id,reserve_rs.rsres_id,reserve_rs.bl_id,reserve_rs.fl_id,reserve_rs.rm_id,"
                                                + " reserve.user_requested_by,ROUND(CAST("
                                                + formatSqlIsNull(context, "resources.pre_block,0")
                                                + " AS real)/60,2),"
                                                // Guo changed 2008-08-20 to solve KB3019197
                                                + ("Awaiting App.".equals(statusOfReservation) ? " 'R'"
                                                        : " 'A'")
                                                + ",reserve_rs.date_start,reserve_rs.time_end,"
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + literal(context, vn)
                                                + ",reserve.phone, reserve.dv_id,reserve.dp_id,"
                                                // PC KB 3038222
                                                + " '"
                                                + cleanupdesc
                                                + ". "
                                                + reservationComments
                                                + " '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve.comments)"
                                                + formatSqlConcat(context)
                                                + "'. '"
                                                + formatSqlConcat(context)
                                                + "RTRIM(reserve_rs.comments), "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime")
                                                + ",'RES. CLEANUP'"
                                                + " FROM reserve_rs"
                                                + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id"
                                                + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id"
                                                + " WHERE Reserve.res_id = "
                                                + literal(context, res_id)
                                                + " AND reserve_rs.rsres_id = "
                                                + literal(context, event.getString("rsres_id"));
                                
                                executeDbSql(context, sql, false);
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not create work request for vendor clean-up: ",
                                    errMessage, e);
                            }
                        } // End if (event.getString("rsres_id").equals("") || wrIdList.size() ==
                          // 0)
                        else {
                            if (wrIdList.size() > 1) {
                                final Object[] wrObject = (Object[]) wrIdList.get(0);
                                final Object[] wrObject1 = (Object[]) wrIdList.get(1);
                                
                                if (wrObject.length >= 1 && wrObject1.length >= 1) {
                                    wrId1 = wrObject[0].toString();
                                    wrId2 = wrObject1[0].toString();
                                    
                                    try {
                                        // Update [wrId1] for setup work request
                                        
                                        // PC changed to solve KB item 3019287
                                        if (isOracle(context)) {
                                            
                                            sql =
                                                    " UPDATE wr SET ("
                                                            + " time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                            + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                            + " time_requested,phone,dv_id,dp_id"
                                                            + " ) = ( SELECT "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " reserve_rs.bl_id,"
                                                            + " reserve_rs.fl_id,"
                                                            + " reserve_rs.rm_id,"
                                                            + " reserve.user_requested_by,"
                                                            + " ROUND(CAST("
                                                            + formatSqlIsNull(context,
                                                                "resources.pre_block,0")
                                                            + " AS real)/60,2),"
                                                            // Guo changed 2008-08-20 to solve
                                                            // KB3019197
                                                            + ("Awaiting App."
                                                                .equals(statusOfReservation) ? " 'R'"
                                                                    : " 'A'")
                                                            + ","
                                                            + " reserve_rs.date_start,"
                                                            + formatSqlAddMinutesToExpression(
                                                                context,
                                                                "reserve_rs.time_start",
                                                                formatSqlIsNull(context,
                                                                    "-(resources.pre_block) , 0"))
                                                            + ","
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " reserve.phone,"
                                                            + " reserve.dv_id,"
                                                            + " reserve.dp_id "
                                                            + " FROM reserve_rs, reserve, resources "
                                                            + " WHERE reserve_rs.res_id = reserve.res_id "
                                                            + " AND reserve_rs.resource_id = resources.resource_id "
                                                            + " AND reserve.res_id = "
                                                            + literal(context, res_id)
                                                            + " AND reserve_rs.rsres_id = "
                                                            + literal(context,
                                                                event.getString("rsres_id"))
                                                            + ")"
                                                            + " WHERE wr_id = "
                                                            + literal(context, wrId1);
                                            
                                        } else {
                                            sql =
                                                    " UPDATE wr SET bl_id = reserve_rs.bl_id,"
                                                            + " fl_id = reserve_rs.fl_id,"
                                                            + " rm_id = reserve_rs.rm_id,"
                                                            + " time_stat_chg = "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ", "
                                                            + " date_stat_chg = "
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ", "
                                                            + " requestor = reserve.user_requested_by,"
                                                            + " est_labor_hours = ROUND(CAST("
                                                            + formatSqlIsNull(context,
                                                                "resources.pre_block,0")
                                                            + " AS real)/60,2),"
                                                            + " date_assigned = reserve_rs.date_start,"
                                                            + " time_assigned = "
                                                            + formatSqlAddMinutesToExpression(
                                                                context,
                                                                "reserve_rs.time_start",
                                                                formatSqlIsNull(context,
                                                                    "-(resources.pre_block) , 0"))
                                                            + ", date_requested = "
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ", time_requested = "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ", phone = reserve.phone"
                                                            + ", dv_id = reserve.dv_id"
                                                            + ", dp_id = reserve.dp_id"
                                                            // Guo changed 2008-08-20 to solve
                                                            // KB3019197
                                                            + ", status = "
                                                            + ("Awaiting App."
                                                                .equals(statusOfReservation) ? " 'R'"
                                                                    : " 'A'")
                                                            + " FROM reserve_rs"
                                                            + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id "
                                                            + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id "
                                                            + " WHERE reserve.res_id = "
                                                            + literal(context, res_id)
                                                            + " AND reserve_rs.rsres_id = "
                                                            + literal(context,
                                                                event.getString("rsres_id"))
                                                            + " AND wr_id = "
                                                            + literal(context, wrId1);
                                        }
                                        executeDbSql(context, sql, false);
                                        
                                    } catch (final Throwable e) {
                                        handleError(
                                            context,
                                            ACTIVITY_ID
                                                    + "-"
                                                    + RULE_ID
                                                    + ": Could not update work request for vendor set-up: ",
                                            errMessage, e);
                                    }
                                    
                                    try {
                                        // Update [wrId2] for setup work request
                                        
                                        // PC changed to solve KB item 3019287
                                        if (isOracle(context)) {
                                            
                                            sql =
                                                    " UPDATE wr SET ("
                                                            + " time_stat_chg,date_stat_chg,bl_id,fl_id,rm_id,"
                                                            + " requestor,est_labor_hours,status,date_assigned,time_assigned,date_requested,"
                                                            + " time_requested,phone,dv_id,dp_id"
                                                            + " ) = ( SELECT "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " reserve_rs.bl_id,"
                                                            + " reserve_rs.fl_id,"
                                                            + " reserve_rs.rm_id,"
                                                            + " reserve.user_requested_by,"
                                                            + " ROUND(CAST("
                                                            + formatSqlIsNull(context,
                                                                "resources.post_block,0")
                                                            + " AS real)/60,2),"
                                                            // Guo changed 2008-08-20 to solve
                                                            // KB3019197
                                                            + ("Awaiting App."
                                                                .equals(statusOfReservation) ? " 'R'"
                                                                    : " 'A'")
                                                            + ","
                                                            + " reserve_rs.date_start,reserve_rs.time_end,"
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " reserve.phone,"
                                                            + " reserve.dv_id,"
                                                            + " reserve.dp_id "
                                                            + " FROM reserve_rs, reserve, resources "
                                                            + " WHERE reserve_rs.res_id = reserve.res_id "
                                                            + " AND reserve_rs.resource_id = resources.resource_id "
                                                            + " AND reserve.res_id = "
                                                            + literal(context, res_id)
                                                            + " AND reserve_rs.rsres_id = "
                                                            + literal(context,
                                                                event.getString("rsres_id"))
                                                            + ")"
                                                            + " WHERE wr_id = "
                                                            + literal(context, wrId2);
                                            
                                        } else {
                                            
                                            sql =
                                                    " UPDATE wr SET bl_id = reserve_rs.bl_id,"
                                                            + " fl_id = reserve_rs.fl_id,"
                                                            + " rm_id = reserve_rs.rm_id,"
                                                            + " time_stat_chg = "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ", "
                                                            + " date_stat_chg = "
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ", "
                                                            + " requestor = reserve.user_requested_by,"
                                                            + " est_labor_hours = ROUND(CAST("
                                                            + formatSqlIsNull(context,
                                                                "resources.post_block,0")
                                                            + " AS real)/60,2),"
                                                            + " date_assigned = reserve_rs.date_start,"
                                                            + " time_assigned = reserve_rs.time_end,"
                                                            + " date_requested = "
                                                            + formatSqlIsoToNativeDate(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " time_requested = "
                                                            + formatSqlIsoToNativeTime(context,
                                                                "CurrentDateTime")
                                                            + ","
                                                            + " phone = reserve.phone,"
                                                            + " dv_id = reserve.dv_id,"
                                                            + " dp_id = reserve.dp_id "
                                                            // Guo changed 2008-08-20 to solve
                                                            // KB3019197
                                                            + ", status = "
                                                            + ("Awaiting App."
                                                                .equals(statusOfReservation) ? " 'R'"
                                                                    : " 'A'")
                                                            + " FROM reserve_rs"
                                                            + " LEFT OUTER JOIN reserve ON reserve_rs.res_id = reserve.res_id"
                                                            + " LEFT OUTER JOIN resources ON reserve_rs.resource_id = resources.resource_id"
                                                            + " WHERE reserve.res_id = "
                                                            + literal(context, res_id)
                                                            + " AND reserve_rs.rsres_id = "
                                                            + literal(context,
                                                                event.getString("rsres_id"))
                                                            + " AND wr_id = "
                                                            + literal(context, wrId2);
                                            
                                        }
                                        executeDbSql(context, sql, false);
                                    } catch (final Throwable e) {
                                        handleError(
                                            context,
                                            ACTIVITY_ID
                                                    + "-"
                                                    + RULE_ID
                                                    + ": Could not update work request for vendor clean-up: ",
                                            errMessage, e);
                                    }
                                }
                            } // End if (wrIdList.size() > 1)
                        } // End else
                    } // End if (vendorToCreate.size() > 0)
                    else {
                        if (!event.getString("rsres_id").equals("")) {
                            // Existing reservation
                            // Cancel all possible existing work requests for vendors for this
                            // reservation
                            try {
                                sql =
                                        " UPDATE wr SET status = 'Can', date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime") + " WHERE rsres_id = "
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id = " + literal(context, res_id)
                                                + " AND vn_id IS NOT NULL"
                                                + " AND status IN ('R','Rev','A','AA')";
                                
                                executeDbSql(context, sql, false);
                                
                                sql =
                                        " UPDATE wr SET status = 'S', date_stat_chg = "
                                                + formatSqlIsoToNativeDate(context,
                                                    "CurrentDateTime")
                                                + ","
                                                + " time_stat_chg = "
                                                + formatSqlIsoToNativeTime(context,
                                                    "CurrentDateTime") + " WHERE rsres_id = "
                                                + literal(context, event.getString("rsres_id"))
                                                + " AND res_id = " + literal(context, res_id)
                                                + " AND vn_id IS NOT NULL"
                                                + " AND status IN ('I','HP','HA','HL')";
                                
                                executeDbSql(context, sql, false);
                                
                            } catch (final Throwable e) {
                                handleError(context, ACTIVITY_ID + "-" + RULE_ID
                                        + ": Could not cancel existing work request for vendors: ",
                                    errMessage, e);
                            }
                        }
                    } // End else
                    
                    // kb#3036675: Commented below lines to use a consistent way to process email
                    // notification error
                    // JSONObject results = new JSONObject();
                    // results.put("messageEmail", (context.parameterExists("errorMessage")) ?
                    // context
                    // .getParameter("errorMessage") : "");
                    // context.addResponseParameter("jsonExpression", results.toString());
                }
                allOk = true;
                
            } // End for
        }// End for(Iterator it =listResId.iterator();it.hasNext();)
         // kb#3036675: Commented below lines to use a consistent way to process email notification
         // error
         // JSONObject results = new JSONObject();
         // results.put("messageEmail", (context.parameterExists("errorMessage")) ? context
         // .getParameter("errorMessage") : "");
         // context.addResponseParameter("jsonExpression", results.toString());
        
        if (allOk) {
            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
            // executeDbCommit(context);
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN detectResourceConflicts wfr
    // ---------------------------------------------------------------------------------------------
    
    /**
     * This rule gets the resource reservations request (recurring) and checks if any request causes
     * a conflict with existing reservation records. Inputs: User : Info on the current user
     * resourceReservations : Information related to the resource reservations roomReservation :
     * JavaScript object with the information related to the selected room arrangement reservation :
     * Information related to the main reservation roomConflicts : Info on possible conflict
     * resolution of the linked room reservation
     * 
     * @param context Event handler context.
     */
    public void detectResourceConflicts(final String jsonReservation) {
        final String RULE_ID = "detectResourceConflicts";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // this.log.info("Executing '" + ACTIVITY_ID + "-" + RULE_ID + "' .... ");
        // Get the selected arrangement from the input parameter
        final String jsonExpression = jsonReservation;
        
        // Create the output JSON Array
        JSONArray jsonResourceConflicts = new JSONArray();
        boolean allOk = false;
        // detectResourceConflicts rule error message
        final String errMessage =
                localizeMessage(context, ACTIVITY_ID, "DETECTRESOURCECONFLICTS_WFR",
                    "DETECTRESOURCECONFLICTSERROR", null);
        
        try {
            final JSONArray objectsToSave = new JSONArray("" + jsonExpression + ")");
            final JSONObject reservation = objectsToSave.getJSONObject(0);
            final JSONObject roomReservation = objectsToSave.getJSONObject(1);
            final JSONArray roomConflicts = objectsToSave.getJSONArray(2);
            final JSONArray resourceReservations = objectsToSave.getJSONArray(3);
            
            final JSONArray dateStart = reservation.getJSONArray("date_start");
            for (int i = 0; i < dateStart.length(); i++) {
                // For room and resources reservations
                // Check if for some date the room reservation has changed. In that case take
                // values from roomConflict item
                final String dateStartOfThisReservation = dateStart.get(i).toString();
                if (!"".equals(roomReservation.getString("rmres_id"))) {
                    // If any day the room had a conflict, then remove also the resources for this
                    // day
                    for (int n = 0; n < roomConflicts.length(); n++) {
                        final JSONObject roomConflict = roomConflicts.getJSONObject(n);
                        if (dateStartOfThisReservation.equals(roomConflict
                            .get("original_date_start"))) {
                            if ("Deleted".equalsIgnoreCase(roomConflict.getString("status"))) {
                                JSONObject resourceReservation = null;
                                for (int k = 0; k < resourceReservations.length(); k++) {
                                    final JSONObject jsonResourceConflict = new JSONObject();
                                    resourceReservation = resourceReservations.getJSONObject(k);
                                    jsonResourceConflict.put("original_date_start",
                                        dateStartOfThisReservation);
                                    jsonResourceConflict.put("original_time_start",
                                        resourceReservation.getString("starttime"));
                                    jsonResourceConflict.put("original_time_end",
                                        resourceReservation.getString("endtime"));
                                    jsonResourceConflict.put("date_start",
                                        dateStartOfThisReservation);
                                    jsonResourceConflict.put("time_start",
                                        resourceReservation.getString("starttime"));
                                    jsonResourceConflict.put("time_end",
                                        resourceReservation.getString("endtime"));
                                    jsonResourceConflict.put("resource_id",
                                        resourceReservation.getString("resource_id"));
                                    jsonResourceConflict.put("quantity",
                                        resourceReservation.getString("quantity"));
                                    
                                    // @translatable
                                    final String roomDeleted =
                                            "Room reservation for this date deleted";
                                    jsonResourceConflict.put("reason",
                                        localizeString(context, roomDeleted));
                                    // do not translate
                                    jsonResourceConflict.put("status", "Deleted");
                                    
                                    // @translatable
                                    final String statusDeleted = "Deleted";
                                    jsonResourceConflict.put("status_text",
                                        localizeString(context, statusDeleted));
                                    
                                    jsonResourceConflicts.put(jsonResourceConflict);
                                }
                            }
                        }
                    }
                    // Also even if room was available we should check if any resource is not
                    // available for any day
                    jsonResourceConflicts =
                            detectConflictsForAllSelectedResources(context,
                                dateStartOfThisReservation, resourceReservations,
                                jsonResourceConflicts);
                } else {
                    // For resources only reservations
                    jsonResourceConflicts =
                            detectConflictsForAllSelectedResources(context,
                                dateStartOfThisReservation, resourceReservations,
                                jsonResourceConflicts);
                }
            }
            context.addResponseParameter("jsonExpression", jsonResourceConflicts.toString());
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
    // END detectResourceConflicts wfr
    // ---------------------------------------------------------------------------------------------
    
    // This method is used to detect conflicts for all selected resources.
    // Added by Guo 2008-08-01.
    private JSONArray detectConflictsForAllSelectedResources(final EventHandlerContext context,
            final String dateStart, final JSONArray resourceReservations,
            final JSONArray jsonResourceConflicts) {
        final JSONArray cancelledResourceReservations =
                getCancelledResourceReservations(resourceReservations);
        // added by GUO, 2008-07-25 to solve KB3018883.
        final String clauseNotINCancelled =
                getClauseOfNotInCancelled(context, cancelledResourceReservations);
        for (int k = 0; k < resourceReservations.length(); k++) {
            final JSONObject resourceReservation = resourceReservations.getJSONObject(k);
            // Guo added 2008-08-18 to solve KB3019220
            resourceReservation.put("date_start", dateStart);
            String sql =
                    "SELECT resource_id, resource_std, day_start, day_end, max_days_ahead, pre_block, post_block,resource_type, quantity "
                            + " FROM resources WHERE resource_id = "
                            + literal(context, resourceReservation.getString("resource_id"));
            final List listRecordsOfResource = retrieveDbRecords(context, sql);
            
            // @translatable
            final String resourceUnavailable = "Resource unavailable";
            // @translatable
            final String quantityUnavailable = "Requested quantity unavailable";
            // @translatable
            final String statusDeleted = "Deleted";
            
            // it gets pre and post block
            if (!listRecordsOfResource.isEmpty()) {
                final Map resource = (Map) listRecordsOfResource.get(0);
                final String resourceType = getString(resource, "resource_type");
                final String resourceId = getString(resource, "resource_id");
                // int quantity = new Integer(getString(resource, "quantity")).intValue();
                final int preBlock = new Integer(getString(resource, "pre_block")).intValue();
                final int postBlock = new Integer(getString(resource, "post_block")).intValue();
                final int postblockTime = preBlock + postBlock;
                if ("unique".equalsIgnoreCase(resourceType)) {
                    sql =
                            " SELECT 1 FROM reserve_rs  "
                                    + " WHERE status not in ('Cancelled','Rejected')  "
                                    + " AND resource_id = "
                                    + literal(context, resourceId)
                                    + " AND  date_start = "
                                    + formatSqlIsoToNativeDate(context, dateStart)
                                    + " AND time_start < "
                                    + formatSqlAddMinutes(context,
                                        resourceReservation.getString("endtime"),
                                        Integer.toString(postblockTime))
                                    + " AND time_end > "
                                    + formatSqlAddMinutes(context,
                                        resourceReservation.getString("starttime"),
                                        Integer.toString(-postblockTime));
                    // Added by ZY, 2008-06-26.
                    if (propertyExistsNotNull(resourceReservation, "rsres_id")) {
                        sql +=
                                " AND rsres_id<>"
                                        + literal(context,
                                            resourceReservation.getString("rsres_id"));
                    }
                    
                    // added by GUO, 2008-07-25 to solve KB3018883.
                    if (cancelledResourceReservations.length() > 0) {
                        sql += clauseNotINCancelled;
                    }
                    // this.log.info(ACTIVITY_ID+"-"+RULE_ID+"[sql_Exists]: "+sql);
                    final List listExists = retrieveDbRecords(context, sql);
                    if (!listExists.isEmpty()) {
                        final JSONObject jsonResourceConflict = new JSONObject();
                        jsonResourceConflict.put("original_date_start", dateStart);
                        jsonResourceConflict.put("original_time_start",
                            resourceReservation.getString("starttime"));
                        jsonResourceConflict.put("original_time_end",
                            resourceReservation.getString("endtime"));
                        jsonResourceConflict.put("date_start", dateStart);
                        jsonResourceConflict.put("time_start",
                            resourceReservation.getString("starttime"));
                        jsonResourceConflict.put("time_end",
                            resourceReservation.getString("endtime"));
                        jsonResourceConflict.put("resource_id",
                            resourceReservation.getString("resource_id"));
                        jsonResourceConflict.put("quantity",
                            resourceReservation.getString("quantity"));
                        jsonResourceConflict.put("reason",
                            localizeString(context, resourceUnavailable));
                        // do not translate
                        jsonResourceConflict.put("status", "Deleted");
                        
                        jsonResourceConflict.put("status_text",
                            localizeString(context, statusDeleted));
                        
                        jsonResourceConflicts.put(jsonResourceConflict);
                    }
                } else if ("limited".equalsIgnoreCase(resourceType)) {
                    
                    // Use same checkResourceAvailbility method to detect conflict, modified by ZY,
                    // 2008-08-11.
                    if (!checkLimitedResourceAvailbility(context, resourceReservation,
                        cancelledResourceReservations, clauseNotINCancelled, listRecordsOfResource)) {
                        final JSONObject jsonResourceConflict = new JSONObject();
                        jsonResourceConflict.put("original_date_start", dateStart);
                        jsonResourceConflict.put("original_time_start",
                            resourceReservation.getString("starttime"));
                        jsonResourceConflict.put("original_time_end",
                            resourceReservation.getString("endtime"));
                        jsonResourceConflict.put("date_start", dateStart);
                        jsonResourceConflict.put("time_start",
                            resourceReservation.getString("starttime"));
                        jsonResourceConflict.put("time_end",
                            resourceReservation.getString("endtime"));
                        jsonResourceConflict.put("resource_id",
                            resourceReservation.getString("resource_id"));
                        jsonResourceConflict.put("quantity",
                            resourceReservation.getString("quantity"));
                        jsonResourceConflict.put("reason",
                            localizeString(context, quantityUnavailable));
                        // do not translate
                        jsonResourceConflict.put("status", "Deleted");
                        
                        jsonResourceConflict.put("status_text",
                            localizeString(context, statusDeleted));
                        
                        jsonResourceConflicts.put(jsonResourceConflict);
                    }
                }
            }
        }// end for (int k = 0; k < resourceReservations.length(); k++)
        
        return jsonResourceConflicts;
    }
    
    // This method is used to update the reserve table by sql10 in the WFR saveResourceResevation
    // Added by Guo 2008-07-11.
    private void updateReservationById(final EventHandlerContext context,
            final JSONObject roomReservation, final String resId, final String rule_id,
            final String errorMessage) {
        String sql =
                "SELECT DISTINCT status from RESERVE_RM WHERE res_id = " + literal(context, resId)
                        + " UNION ALL" + " SELECT DISTINCT status from RESERVE_RS WHERE res_id = "
                        + literal(context, resId);
        final List statusList = retrieveDbRecords(context, sql);
        String sql10 = "";
        List timeList = null;
        String str_minTimeStartOfRoom = "";
        String str_maxTimeEndOfRoom = "";
        String str_minTimeStartOfResource = "";
        String str_maxTimeEndOfResource = "";
        
        Time minTimeStartOfRoom = null;
        Time maxTimeEndOfRoom = null;
        Time minTimeStartOfResource = null;
        Time maxTimeEndOfResource = null;
        // Guo changed 2008-07-21 to solve KB3018793
        if (propertyExistsNotNull(roomReservation, "rmres_id")) {
            sql =
                    "Select min(time_start) as mintimestart ,max(time_end) as maxtimeend from reserve_rm where res_id = "
                            + literal(context, resId)
                            + " and status <> 'Cancelled' and status <>'Rejected'";
            timeList = retrieveDbRecords(context, sql);
            
            if (((Map) timeList.get(0)).get("mintimestart") != null
                    && ((Map) timeList.get(0)).get("maxtimeend") != null) {
                str_minTimeStartOfRoom =
                        getTimeValue(context, ((Map) timeList.get(0)).get("mintimestart"))
                            .toString();
                str_maxTimeEndOfRoom =
                        getTimeValue(context, ((Map) timeList.get(0)).get("maxtimeend")).toString();
                minTimeStartOfRoom = getTimeFromString(str_minTimeStartOfRoom);
                maxTimeEndOfRoom = getTimeFromString(str_maxTimeEndOfRoom);
            }
        }
        
        sql =
                "Select min(time_start) as mintimestart,max(time_end) as maxtimeend from reserve_rs where res_id = "
                        + literal(context, resId)
                        + " and status <> 'Cancelled' and status <>'Rejected'";
        timeList = retrieveDbRecords(context, sql);
        
        if (((Map) timeList.get(0)).get("mintimestart") != null
                && ((Map) timeList.get(0)).get("maxtimeend") != null) {
            str_minTimeStartOfResource =
                    getTimeValue(context, ((Map) timeList.get(0)).get("mintimestart")).toString();
            str_maxTimeEndOfResource =
                    getTimeValue(context, ((Map) timeList.get(0)).get("maxtimeend")).toString();
            minTimeStartOfResource = getTimeFromString(str_minTimeStartOfResource);
            maxTimeEndOfResource = getTimeFromString(str_maxTimeEndOfResource);
        }
        
        // Guo added 2008-09-01 to solve KB3019374
        List costList = null;
        double totCostRm = 0;
        double totCostRs = 0;
        
        sql = "SELECT SUM(cost_rmres) as totcostrm FROM reserve_rm WHERE res_id = " + resId;
        costList = retrieveDbRecords(context, sql);
        if (((Map) costList.get(0)).get("totcostrm") != null) {
            totCostRm = Double.parseDouble(getString((Map) costList.get(0), "totcostrm"));
        }
        
        sql = "SELECT SUM(cost_rsres) as totcostrs FROM reserve_rs WHERE res_id = " + resId;
        costList = retrieveDbRecords(context, sql);
        if (((Map) costList.get(0)).get("totcostrs") != null) {
            totCostRs = Double.parseDouble(getString((Map) costList.get(0), "totcostrs"));
        }
        
        if (propertyExistsNotNull(roomReservation, "rmres_id")) {
            // Guo changed 2008-09-01 to solve KB3019374
            sql10 =
                    "UPDATE RESERVE SET" + " cost_res = "
                            + new Double(totCostRm + totCostRs).toString();
            
            if ((minTimeStartOfRoom != null) && (minTimeStartOfResource != null)) {
                if (minTimeStartOfRoom.before(minTimeStartOfResource)) {
                    sql10 +=
                            " ,time_start = "
                                    + formatSqlIsoToNativeTime(context, str_minTimeStartOfRoom);
                } else {
                    sql10 +=
                            " ,time_start = "
                                    + formatSqlIsoToNativeTime(context, str_minTimeStartOfResource);
                }
            }
            
            if ((maxTimeEndOfRoom != null) && (maxTimeEndOfResource != null)) {
                if (maxTimeEndOfRoom.before(maxTimeEndOfResource)) {
                    sql10 +=
                            " ,time_end = "
                                    + formatSqlIsoToNativeTime(context, str_maxTimeEndOfResource);
                } else {
                    sql10 +=
                            " ,time_end = "
                                    + formatSqlIsoToNativeTime(context, str_maxTimeEndOfRoom);
                }
            }
        } else {
            // Guo changed 2008-09-01 to solve KB3019374
            sql10 =
                    "UPDATE RESERVE SET" + " cost_res = "
                            + new Double(totCostRm + totCostRs).toString();
            
            if (!"".equals(str_minTimeStartOfResource)) {
                sql10 +=
                        ", time_start =  "
                                + formatSqlIsoToNativeTime(context, str_minTimeStartOfResource);
            }
            if (!"".equals(str_maxTimeEndOfResource)) {
                sql10 +=
                        ", time_end =  "
                                + formatSqlIsoToNativeTime(context, str_maxTimeEndOfResource);
            }
        }
        boolean isReject = true;
        for (int i = 0; i < statusList.size(); i++) {
            final String status = getString((Map) statusList.get(i), "status");
            if ("Awaiting App.".equals(status)) {
                isReject = false;
                sql10 += ", Status = 'Awaiting App.'";
                break;
            }
        }
        if (isReject) {
            for (int i = 0; i < statusList.size(); i++) {
                final String status = getString((Map) statusList.get(i), "status");
                if ("Confirmed".equals(status)) {
                    isReject = false;
                    sql10 += ", Status = 'Confirmed'";
                    break;
                }
            }
        }
        if (isReject) {
            for (int i = 0; i < statusList.size(); i++) {
                final String status = getString((Map) statusList.get(i), "status");
                if ("Cancelled".equals(status)) {
                    isReject = false;
                    sql10 += ", Status = 'Cancelled'";
                    break;
                }
            }
        }
        if (isReject) {
            sql10 += ", Status = 'Rejected'";
        }
        sql10 += " WHERE res_id = " + literal(context, resId);
        try {
            executeDbSql(context, sql10, false);
            // Guo changed 2008-09-12 to remove all executeDbCommit(context)
            // executeDbCommit(context);
        } catch (final Throwable e1) {
            handleError(context, ACTIVITY_ID + "-" + rule_id + ": Could not update the datebase: "
                    + sql10, errorMessage, e1);
        }
    }
    
    // This method is used to get the cancelled recoure reservevation in resourceReservations array
    // Added by Guo 2008-07-25 to solve KB3018883.
    private JSONArray getCancelledResourceReservations(final JSONArray resourceReservations) {
        final JSONArray cancelledResourceReservations = new JSONArray();
        for (int i = 0; i < resourceReservations.length(); i++) {
            final JSONObject resourceReservationItem = resourceReservations.getJSONObject(i);
            // Guo changed 2008-08-19
            if (propertyExistsNotNull(resourceReservationItem, "rsres_id")
                    && resourceReservationItem.has("status")
                    && "Cancelled".equalsIgnoreCase(resourceReservationItem.getString("status"))) {
                cancelledResourceReservations.put(resourceReservationItem);
            }
        }
        return cancelledResourceReservations;
    }
    
    // This method is used to get the condition not in all cancelled reres_id
    // Added by Guo 2008-07-25 to solve KB3018883.
    private String getClauseOfNotInCancelled(final EventHandlerContext context,
            final JSONArray cancelledResourceReservations) {
        String sql = " AND rsres_id NOT IN (";
        for (int i = 0; i < cancelledResourceReservations.length(); i++) {
            final JSONObject cancelledResourceReservationItem =
                    cancelledResourceReservations.getJSONObject(i);
            if (propertyExistsNotNull(cancelledResourceReservationItem, "rsres_id")) {
                if (i != cancelledResourceReservations.length() - 1) {
                    sql +=
                            literal(context, cancelledResourceReservationItem.getString("rsres_id"))
                                    + ",";
                } else {
                    sql += literal(context, cancelledResourceReservationItem.getString("rsres_id"));
                }
            }
        }
        sql += ")";
        return sql;
    }
}
