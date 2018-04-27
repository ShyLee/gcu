package com.archibus.eventhandler.reservations;

import java.util.HashMap;
import java.util.Map;

import junit.framework.TestCase;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.fixture.EventHandlerFixture;
import com.archibus.utility.ExceptionBase;

public class TestReservationsRoomHandler extends TestCase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     * Workflow rule IDs.
     */
    static final String ACTIVITY_ID = "AbWorkplaceReservations";

    static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.reservations.ReservationsRoomHandler";

    protected void setUp() throws Exception {
        this.fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
        this.fixture.setUp();
    }

    protected void tearDown() throws Exception {
        this.fixture.tearDown();
    }

    // -------------------------------------------------------------------------------------------------
    // Test testGetReservationInfo wfr
    //
    public void testGetReservationInfo() throws ExceptionBase {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            // "", in new or search reservations
            // res_id, in edit reservation
            String resId = ""; // It must be obligatory and it must be comprehensive with DB data

            inputs
                    .put(
                         "User",
                         "[{'locale': 'en_US', 'role_name': 'ARCHIBUS SYSTEM ADMINISTRATOR', 'groups': ['%'], 'user_name': 'AFM', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'}]");
            inputs.put("res_id", resId);

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "getReservationInfo", inputs, response,
                                               transactionContext);

            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {

                // Check response parameter values
                if (!response.containsKey("jsonExpression")) {
                    fail("JSONObject not created");
                }

                JSONObject results = new JSONObject((String) response.get("jsonExpression"));

                assertTrue("it has got reservations: ", results.has("reservation"));
                assertTrue("it has got resourcesReservations: ", results
                        .has("resourcesReservations"));
                assertTrue("it has got roomReservations: ", results.has("roomReservation"));
                assertTrue("get created user", (results.getJSONObject("reservation")
                        .has("user_created_by") && !results.getJSONObject("reservation")
                        .getString("user_created_by").equals("")));
            }
        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testGetArrangementFixedResources wfr
    //
    public void testGetArrangementFixedResources() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            inputs
                    .put(
                         "RoomReservation",
                         "[{'comments': '', 'rmres_id': '', 'cost_rmres': '', 'time_end': '', 'rm_arrange_type_id': '', 'config_id': '', 'time_start': '', 'status': '', 'rm_id': '', 'bl_id': '', 'fl_id': '', 'date_start': ['2006-11-26','2006-11-27','2006-11-28']}]");

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "getArrangementFixedResources", inputs, response,
                                               transactionContext);

            // Check response parameter values
            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {
                if (!response.containsKey("jsonExpression")) {
                    fail("JSONObject not created");
                }

                JSONArray results = new JSONArray((String) response.get("jsonExpression"));
                assertEquals("Incorrect number of status codes", 1, results.length());

                JSONObject result1 = results.getJSONObject(0);
                assertTrue("get fixed Resuorces", result1.has("fixed_resource"));
            }
        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testLoadTimeline wfr
    //
    public void testLoadTimeline() {

        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            inputs
                    .put(
                         "reservation",
                         "[{'locale': 'en_US', 'role_name': 'ARCHIBUS SYSTEM ADMINISTRATOR', 'groups': ['%'], 'user_name': 'AFM', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'}, {'phone': '227-2508', 'comments': '', 'res_id': '', 'dp_id': 'ENGINEERING', 'time_start': '', 'status': '', 'user_created_by': 'AFM', 'group_size': '6', 'user_requested_by': 'AFM', 'date_start': ['2006-11-26','2006-11-27','2006-11-28'], 'cost_res': '', 'reservation_name': '', 'ext_guest': '1', 'time_end': '', 'user_requested_for': 'AFM', 'ctry_id': 'USA', 'all_resource_stds': [{'type': 'CATERING-COLD', 'name': 'Cold food catering', 'selected': false}, {'type': 'PROJECTOR-FIXED', 'name': 'Project - Fixed', 'selected': false}, {'type': 'PROJECTOR-LCD', 'name': 'Projector - LCD - portable', 'selected': false}, {'type': 'TV - 50 INCH', 'name': 'TV - 50 Inch large screen', 'selected': false}], 'site_id': 'MARKET', 'email': 'afm@tgd.com', 'rm_id': '126', 'doc_event': '', 'bl_id': 'HQ', 'fl_id': '17', 'dv_id': 'ELECTRONIC SYS.', 'rm_arrange_type_id': '', 'resource_stds': []}, {'comments': '', 'rmres_id': '', 'cost_rmres': '', 'time_end': '', 'rm_arrange_type_id': '', 'config_id': '', 'time_start': '', 'status': '', 'rm_id': '', 'bl_id': '', 'fl_id': '', 'date_start': ['2006-11-26','2006-11-27','2006-11-28']}]");

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "loadTimeline",
                                               inputs, response, transactionContext);

            // Check response parameter values
            if (!response.containsKey("jsonExpression")) {
                fail("JSONObject not created");
            }

            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {
                JSONObject results = new JSONObject((String) response.get("jsonExpression"));

                assertTrue("It has events:", results.has("events"));
                assertTrue("It has timemarks:", results.has("timemarks"));
                assertTrue("It has minorToMajorRatio:", results.has("minorToMajorRatio"));
                assertTrue("It has resources:", results.has("resources"));
            }

        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    /*
     * public void testReadRequestorProperties(){
     *  // begin database transaction Object transactionContext = fixture.beginTransaction();
     * 
     * try { // add test input values Map inputs = new HashMap(); inputs.put("em_id", "AFM");
     *  // prepare response map Map response = new HashMap();
     *  // execute WFR event handler this.fixture.runEventHandlerMethod(ACTIVITY_ID,
     * EVENT_HANDLER_CLASS, "getReservationInfo", inputs, response, transactionContext);
     * 
     * if ( response.containsKey("message") ){ assertTrue("message is not null",
     * response.get("message")!=null); }else{ // check response parameter values if
     * (!response.containsKey("jsonExpression")) { fail("JSONObject not created"); } JSONObject
     * results = new JSONObject((String)response.get("jsonExpression")); assertTrue("it has got
     * phone:", ( results.has("phone") && !results.getString("phone").equals("") ) ); assertTrue("it
     * has got email:", ( results.has("email") && !results.getString("email").equals("") ) );
     * assertTrue("it has got dv_id:", ( results.has("dv_id") &&
     * !results.getString("dv_id").equals("") ) ); assertTrue("it has got dp_id:", (
     * results.has("dp_id") && !results.getString("dp_id").equals("") ) ); }
     * 
     * }catch ( Throwable e ){
     * 
     * fail(" Global Exception "+e);
     *  } finally {
     *  // whatever happened, rollback all database changes
     * fixture.rollbackTransaction(transactionContext); } }
     */

    // -------------------------------------------------------------------------------------------------
    // Test testAddRoomReservation wfr
    //
    public void testAddRoomReservation() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            String StartHour = "'13:30:00'";
            String EndHour = "'14:30:00'";
            String DateStart = "['2006-12-10','2006-12-12','2006-12-16']";
            String DateEnd = "'2006-12-16'";
            String res_id = "''";
            String rmres_id = "''";
            String res_type = "'recurring'"; // recurring
            String input = "["
                    +
                    /* User */"{'locale': 'en_US', 'role_name': 'ARCHIBUS SYSTEM ADMINISTRATOR', 'groups': {'0': '%'}, 'user_name': 'AFM', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'},"
                    +
                    /* Reservation */"{'recurring_rule':'xml.....','res_type':"
                    + res_type
                    + ",'date_end':"
                    + DateEnd
                    + ",'recurval1':[],'recurval2':[],'phone': '333-66998', 'comments': 'AFM', 'res_id': "
                    + res_id
                    + ", 'dp_id': 'ENGINEERING', 'time_start': "
                    + StartHour
                    + ", 'status': '', 'user_created_by': 'AFM', 'group_size': '6', 'user_requested_by': 'AFM', 'date_start': "
                    + DateStart
                    + ", 'cost_res': '', 'reservation_name': 'AFM', 'ext_guest': '1', 'time_end': "
                    + EndHour
                    + ", 'user_requested_for': 'AFM', 'ctry_id': 'USA', 'all_resource_stds': {'0': {'type': 'CATERING-COLD', 'name': 'Cold food catering', 'selected': false}, '1': {'type': 'PROJECTOR-FIXED', 'name': 'Project - Fixed', 'selected': false}, '2': {'type': 'PROJECTOR-LCD', 'name': 'Projector - LCD - portable', 'selected': false}, '3': {'type': 'TV - 50 INCH', 'name': 'TV - 50 Inch large screen', 'selected': false}}, 'site_id': 'MARKET', 'email': 'afm@tgd.com', 'rm_id': '110', 'doc_event': '', 'bl_id': 'HQ', 'fl_id': '19', 'dv_id': 'ELECTRONIC SYS.', 'rm_arrange_type_id': '', 'resource_stds': {}},"
                    +
                    /* roomReservation */"{'comments': '', 'rmres_id': "
                    + rmres_id
                    + ", 'cost_rmres': '', 'time_end': "
                    + EndHour
                    + ", 'rm_arrange_type_id': 'CLASSROOM', 'config_id': 'A1', 'time_start': "
                    + StartHour
                    + ", 'status': '', 'rm_id': '110', 'bl_id': 'HQ', 'fl_id': '19', 'date_start': "
                    + DateStart + ", 'resource_stds': {}}," + "[]," + "[]," + "[]" + "]";
            inputs.put("reservation", input);
            // 'yes', the system must notify the users on the creation or update of the reservation
            // 'no', the system doesn’t need to notify the operation done
            inputs.put("notify", "no");

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "addRoomReservation", inputs, response,
                                               transactionContext);

            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {
                // Check response parameter values
                if (!response.containsKey("jsonExpression")) {
                    fail("JSONObject not created");
                }

                JSONArray results = new JSONArray((String) response.get("jsonExpression"));
                assertEquals("Incorrect number of status codes", 2, results.length());

                JSONObject result1 = results.getJSONObject(0);
                assertTrue("Exists res_id not null:", (!result1.getString("res_id").equals("")));

                JSONObject result2 = results.getJSONObject(1);
                assertTrue("Exists rmres_id not null: ",
                           (!result2.getString("rmres_id").equals("")));
            }

        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testCreateWorkRequest wfr
    //
    public void testCreateWorkRequest() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            // Either parent_id or res_id will be empty
            inputs.put("res_id", "86"); // It must be obligatory and it must be comprehensive with
                                        // DB data
            inputs.put("res_parent", "0"); // It must be obligatory and it must be comprehensive
                                            // with DB data

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "createWorkRequest", inputs, response,
                                               transactionContext);

            // Check response parameter values
            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            }
        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testSearchReservationsAdditionalInfo wfr
    //
    public void testSearchReservationsAdditionalInfo() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            String resType = "reserve"; // reserve, room or resource

            inputs.put("res_type", resType);
            inputs
                    .put(
                         "User",
                         "[{'locale': 'en_US', 'role_name': 'ARCHIBUS SYSTEM ADMINISTRATOR', 'groups': ['%'], 'user_name': 'AFM', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'}]");
            inputs
                    .put(
                         "res_pk_list",
                         "<userInputRecordsFlag><records><record reserve.res_id='88' reserve_rm.rmres_id='74'><keys reserve.res_id='88' reserve_rm.rmres_id='74'/></record><record reserve.res_id='87' reserve_rm.rmres_id='73'><keys reserve.res_id='87' reserve_rm.rmres_id='73'/></record><record reserve.res_id='86' reserve_rm.rmres_id='72'><keys reserve.res_id='86' reserve_rm.rmres_id='72'/></record><record reserve.res_id='85' reserve_rm.rmres_id='71'><keys reserve.res_id='85' reserve_rm.rmres_id='71'/></record><record reserve.res_id='84' reserve_rm.rmres_id='70'><keys reserve.res_id='84' reserve_rm.rmres_id='70'/></record><record reserve.res_id='83' reserve_rm.rmres_id='69'><keys reserve.res_id='83' reserve_rm.rmres_id='69'/></record><record reserve.res_id='82' reserve_rm.rmres_id='68'><keys reserve.res_id='82' reserve_rm.rmres_id='68'/></record><record reserve.res_id='81' reserve_rm.rmres_id='67'><keys reserve.res_id='81' reserve_rm.rmres_id='67'/></record><record reserve.res_id='79' reserve_rm.rmres_id='66'><keys reserve.res_id='79' reserve_rm.rmres_id='66'/></record><record reserve.res_id='78' reserve_rm.rmres_id='65'><keys reserve.res_id='78' reserve_rm.rmres_id='65'/></record><record reserve.res_id='76' reserve_rm.rmres_id='64'><keys reserve.res_id='76' reserve_rm.rmres_id='64'/></record><record reserve.res_id='76' reserve_rm.rmres_id='63'><keys reserve.res_id='76' reserve_rm.rmres_id='63'/></record><record reserve.res_id='74' reserve_rm.rmres_id='62'><keys reserve.res_id='74' reserve_rm.rmres_id='62'/></record><record reserve.res_id='74' reserve_rm.rmres_id='61'><keys reserve.res_id='74' reserve_rm.rmres_id='61'/></record><record reserve.res_id='72' reserve_rm.rmres_id='60'><keys reserve.res_id='72' reserve_rm.rmres_id='60'/></record><record reserve.res_id='72' reserve_rm.rmres_id='59'><keys reserve.res_id='72' reserve_rm.rmres_id='59'/></record><record reserve.res_id='70' reserve_rm.rmres_id='58'><keys reserve.res_id='70' reserve_rm.rmres_id='58'/></record><record reserve.res_id='70' reserve_rm.rmres_id='57'><keys reserve.res_id='70' reserve_rm.rmres_id='57'/></record><record reserve.res_id='67' reserve_rm.rmres_id='56'><keys reserve.res_id='67' reserve_rm.rmres_id='56'/></record><record reserve.res_id='66' reserve_rm.rmres_id='55'><keys reserve.res_id='66' reserve_rm.rmres_id='55'/></record><record reserve.res_id='65' reserve_rm.rmres_id='54'><keys reserve.res_id='65' reserve_rm.rmres_id='54'/></record><record reserve.res_id='64' reserve_rm.rmres_id='53'><keys reserve.res_id='64' reserve_rm.rmres_id='53'/></record><record reserve.res_id='63' reserve_rm.rmres_id='52'><keys reserve.res_id='63' reserve_rm.rmres_id='52'/></record><record reserve.res_id='62' reserve_rm.rmres_id='51'><keys reserve.res_id='62' reserve_rm.rmres_id='51'/></record><record reserve.res_id='61' reserve_rm.rmres_id='50'><keys reserve.res_id='61' reserve_rm.rmres_id='50'/></record><record reserve.res_id='60' reserve_rm.rmres_id='49'><keys reserve.res_id='60' reserve_rm.rmres_id='49'/></record><record reserve.res_id='59' reserve_rm.rmres_id='48'><keys reserve.res_id='59' reserve_rm.rmres_id='48'/></record></records></userInputRecordsFlag>");

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "searchReservationsAdditionalInfo", inputs,
                                               response, transactionContext);

            // Check response parameter values
            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            }

        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testCancelReservation wfr
    //
    public void testCancelReservation() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            String resId = "65"; // It must be obligatory and it must be comprehensive with DB
                                    // data
            String isSingle = "no";

            inputs
                    .put(
                         "User",
                         "[{'locale': 'en_US', 'role_name': 'ARCHIBUS SYSTEM ADMINISTRATOR', 'groups': ['%','RESERVATION MANAGER'], 'user_name': 'AFM', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'}]");
            inputs.put("res_id", "<record reserve.res_id='" + resId + "'><keys reserve.res_id='"
                    + resId + "'/></record>");
            // 'yes', only the current reservation
            // 'no', all reservations that are in the same recurring or continuous reservation
            inputs.put("single", isSingle);

            // execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "cancelReservation", inputs, response,
                                               transactionContext);

            // check response parameter values
            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            }

        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testDetectRoomConflicts wfr
    //
    public void testDetectRoomConflicts() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            String StartHour = "'10:30:00'";
            String EndHour = "'12:30:00'";
            String DateStart = "['2006-12-03','2006-12-05','2006-12-07','2006-12-09','2006-12-11','2006-12-13']";
            String DateEnd = "'2006-12-13'";
            String res_id = "''";
            String rmres_id = "''";
            String res_type = "'recurring'"; // "'regular'"
            String input = "[" +
            /* Reservation */"{'recurring_rule':'xml.....','res_type':"
                    + res_type
                    + ",'date_end':"
                    + DateEnd
                    + ",'recurval1':[],'recurval2':[],'phone': '333-66998', 'comments': 'AFM', 'res_id': "
                    + res_id
                    + ", 'dp_id': 'ENGINEERING', 'time_start': "
                    + StartHour
                    + ", 'status': '', 'user_created_by': 'AFM', 'group_size': '6', 'user_requested_by': 'AFM', 'date_start': "
                    + DateStart
                    + ", 'cost_res': '', 'reservation_name': 'AFM', 'ext_guest': '1', 'time_end': "
                    + EndHour
                    + ", 'user_requested_for': 'AFM', 'ctry_id': 'USA', 'all_resource_stds': {'0': {'type': 'CATERING-COLD', 'name': 'Cold food catering', 'selected': false}, '1': {'type': 'PROJECTOR-FIXED', 'name': 'Project - Fixed', 'selected': false}, '2': {'type': 'PROJECTOR-LCD', 'name': 'Projector - LCD - portable', 'selected': false}, '3': {'type': 'TV - 50 INCH', 'name': 'TV - 50 Inch large screen', 'selected': false}}, 'site_id': 'MARKET', 'email': 'afm@tgd.com', 'rm_id': '110', 'doc_event': '', 'bl_id': 'HQ', 'fl_id': '19', 'dv_id': 'ELECTRONIC SYS.', 'rm_arrange_type_id': '', 'resource_stds': {}},"
                    +
                    /* roomReservation */"{'comments': '', 'rmres_id': "
                    + rmres_id
                    + ", 'cost_rmres': '', 'time_end': "
                    + EndHour
                    + ", 'rm_arrange_type_id': 'CLASSROOM', 'config_id': 'A1', 'time_start': "
                    + StartHour
                    + ", 'status': '', 'rm_id': '110', 'bl_id': 'HQ', 'fl_id': '19', 'date_start': "
                    + DateStart + ", 'resource_stds': {}}," +
                    /* resourceReservation */"[]" + "]";
            inputs.put("reservation", input);

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "detectRoomConflicts", inputs, response,
                                               transactionContext);

            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {
                // Check response parameter values
                if (!response.containsKey("jsonExpression")) {
                    fail("JSONObject not created");
                }

                JSONArray results = new JSONArray((String) response.get("jsonExpression"));
                assertEquals("Incorrect number of status codes", 2, results.length());
                /*
                 * JSONObject result1 = results.getJSONObject(0); assertTrue("Exists res_id not
                 * null:", ( !result1.getString("res_id").equals("") ));
                 * 
                 * JSONObject result2 = results.getJSONObject(1); assertTrue("Exists rmres_id not
                 * null: ", ( !result2.getString("rmres_id").equals("") ));
                 */
            }

        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }

    // -------------------------------------------------------------------------------------------------
    // Test testGetReservationType wfr
    //
    public void testGetReservationType() {
        // Begin database transaction
        Object transactionContext = fixture.beginTransaction();

        try {
            // Add test input values
            Map inputs = new HashMap();
            // Prepare response map
            Map response = new HashMap();

            String resId = "64"; // It must be obligatory and it must be comprehensive with DB
                                    // data

            inputs.put("res_id", "<record reserve.res_id='" + resId + "'><keys reserve.res_id='"
                    + resId + "'/></record>");

            // Execute WFR event handler
            this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS,
                                               "getReservationType", inputs, response,
                                               transactionContext);

            if (response.containsKey("message")) {
                assertTrue("message is not null", response.get("message") != null);
            } else {
                if (!response.containsKey("jsonExpression")) {
                    fail("jsonExpression not created");
                }
            }
        } catch (Throwable e) {
            fail(" Global Exception " + e);
        } finally {
            // Whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
    }
}
