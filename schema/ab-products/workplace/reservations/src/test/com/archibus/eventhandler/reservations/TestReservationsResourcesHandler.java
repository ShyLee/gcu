package com.archibus.eventhandler.reservations;

import java.util.HashMap;
import java.util.Map;

import junit.framework.TestCase;

import com.archibus.fixture.EventHandlerFixture;

public class TestReservationsResourcesHandler extends TestCase {
	static final String ACTIVITY_ID = "AbWorkplaceReservations";

	static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.reservations.ReservationsResourcesHandler";

	private EventHandlerFixture fixture = null;

	public void setUp() throws Exception {
		this.fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
		this.fixture.setUp();
	}

	/**
	 * JUnit clean-up method.
	 */
	public void tearDown() {
		this.fixture.tearDown();
	}

    /**
     * Tests testSaveResourceReservations WFR.
     *
     */
	public void testSaveResourceReservations() {
		Object transactionContext = fixture.beginTransaction();

		try {
			// add test input values
			Map inputs = new HashMap();
			// prepare response map
			Map response = new HashMap();

			//It must be obligatory and it must be comprehensive with DB data
			String resources_data = "[{'resource_id': 'TV1', 'endtime': '1:00 PM', 'starttime': '12:00 PM', 'quantity': '1', 'time_end': '13:00.00.000', 'time_start': '12:00.00.000', 'comments': '', 'date_start': '2007-02-15', 'rsres_id': ''}]";
			String dateStart = "['2007-02-15']";

			inputs.put("reservation", "[{'comments': '', 'phone': '998-6223', 'recur_val1': '', 'attendees': '', 'res_type': 'regular', 'group_size': '', 'date_start': " + dateStart + ", 'reservation_name': '', 'time_end': '13:00.00.000', 'user_requested_for': 'BACHMAN, ELLEN', 'rm_arrange_type_id': '', 'all_resource_stds': [{'type': 'CATERING-COLD', 'name': 'Cold food catering'}, {'type': 'PROJECTOR-FIXED', 'name': 'Projector - Fixed'}, {'type': 'PROJECTOR-LCD', 'name': 'Projector - LCD - portable'}, {'type': 'TV - 50 INCH', 'name': 'TV - 50 Inch large screen'}, {'type': 'CATERING-COLD 2', 'name': 'Cold food catering Class A'}, {'type': 'CHAIRS', 'name': 'Chairs'}, {'type': 'COFFEE', 'name': 'Coffee Can'}, {'type': 'IT-SUPPORT', 'name': 'IT Person'}, {'type': 'NETWORK-CABLE', 'name': 'Network cable for PC'}, {'type': 'SOFT DRINKS', 'name': 'Soft Drinks No Alcohol'}, {'type': 'SPECIAL DECORAT.', 'name': 'Special Event Decorations'}, {'type': 'TABLES', 'name': 'Tables'}], 'recur_val2': '', 'dv_id': 'SOFTWARE SOLN.', 'dp_id': 'ACCOUNTING', 'res_id': '', 'time_start': '12:00.00.000', 'user_created_by': 'AFM', 'status': '', 'require_reply': false, 'user_requested_by': 'RICHTER, STEVEN', 'cost_res': '', 'recur_type': 'day', 'ext_guest': '0', 'ctry_id': 'USA', 'email': 'srichter@dc', 'site_id': 'MARKET', 'rm_id': '', 'bl_id': 'HQ', 'fl_id': '', 'resource_std': '', 'resource_fl_id': '17', 'resource_rm_id': '107'}, {'comments': '', 'rmres_id': '', 'cost_rmres': '', 'time_end': '', 'rm_arrange_type_id': '', 'config_id': '', 'time_start': '', 'status': '', 'rm_id': '', 'bl_id': '', 'fl_id': ''}, "+ resources_data + "]");

			// execute WFR event handler
			this.fixture.runEventHandlerMethod(ACTIVITY_ID, EVENT_HANDLER_CLASS, "saveResourceReservations", inputs, response, transactionContext);
        } catch (Throwable e) {
        	fail(" Global Exception "+e);
        } finally {
            // whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
	}

    /**
     * Tests testReadAvailableResources WFR.
     *
     */
	public void testReadAvailableResources() {
		Object transactionContext = fixture.beginTransaction();

		try {
			//Add test input values
			Map inputs = new HashMap();
			//Prepare response map
			Map response = new HashMap();
			
			String dateStart = "['2007-01-22']";

			inputs.put("reservation","[{'locale': 'en_US', 'role_name': 'RESERVATION MANAGER', 'groups': ['RESERVATION MANAGER', 'SPAC%'], 'user_name': 'RESERVATION MANAGER', 'Employee': {'Building': {'ctry_id': 'USA', 'site_id': 'MARKET'}, 'phone': '227-2508', 'dp_id': 'ENGINEERING', 'em_number': '', 'em_id': 'AFM', 'rm_id': '126', 'bl_id': 'HQ', 'dv_id': 'ELECTRONIC SYS.', 'fl_id': '17'}, 'email': 'afm@tgd.com'}, {'comments': '', 'phone': '227-2508', 'recur_val1': '', 'res_type': 'regular', 'group_size': '', 'date_start': " + dateStart + ", 'reservation_name': '', 'time_end': '14:00.00.000', 'user_requested_for': 'AFM', 'rm_arrange_type_id': '', 'all_resource_stds': [{'type': 'CATERING-COLD', 'name': 'Cold food catering'}, {'type': 'PROJECTOR-FIXED', 'name': 'Projector - Fixed'}, {'type': 'PROJECTOR-LCD', 'name': 'Projector - LCD - portable'}, {'type': 'TV - 50 INCH', 'name': 'TV - 50 Inch large screen'}, {'type': 'CATERING-COLD 2', 'name': 'Cold food catering Class A'}, {'type': 'CHAIRS', 'name': 'Chairs'}, {'type': 'COFFEE', 'name': 'Coffee Can'}, {'type': 'IT-SUPPORT', 'name': 'IT Person'}, {'type':'NETWORK-CABLE', 'name': 'Network cable for PC'}, {'type': 'SOFT DRINKS', 'name': 'Soft Drinks No Alcohol'}, {'type': 'SPECIAL DECORAT.', 'name': 'Special Event Decorations'}, {'type': 'TABLES', 'name': 'Tables'}], 'recur_val2': '', 'dv_id': 'ELECTRONIC SYS.', 'dp_id': 'ENGINEERING', 'res_id': '', 'time_start': '13:00.00.000', 'user_created_by': 'AFM', 'status': '', 'user_requested_by': 'AFM', 'cost_res': '', 'recur_type': 'day', 'ext_guest': '0', 'ctry_id': 'USA', 'email':'afm@tgd.com', 'site_id': 'MARKET', 'rm_id': '', 'bl_id': 'HQ', 'fl_id': '', 'resource_std': ''}, {'comments': '', 'rmre_id': '', 'cost_rmres': '', 'time_end': '', 'rm_arrange_type_id': '', 'config_id': '', 'time_start': '', 'status': '','rm_id': '', 'bl_id': '', 'fl_id': ''}, []]");

			//Execute WFR event handler
			this.fixture.runEventHandlerMethod(ACTIVITY_ID,
					EVENT_HANDLER_CLASS, "readAvailableResources", inputs,
					response, transactionContext);
			if ( response.containsKey("message") ){
				assertTrue("message is not null", response.get("message")!=null);
			}
			else {
				//Check response parameter values
				if (!response.containsKey("jsonExpression"))
					fail("JSONObject not created");
				else
					assertTrue("jsonObject created", response.containsKey("jsonExpression"));
			}
        } catch (Throwable e) {
        	fail(" Global Exception "+e);
        } finally {
            // whatever happened, rollback all database changes
            fixture.rollbackTransaction(transactionContext);
        }
	}
}