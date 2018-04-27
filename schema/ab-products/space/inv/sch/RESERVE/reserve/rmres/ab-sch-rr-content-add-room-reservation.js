/**
 *
 */
var addRoomReservContentController = View.createController("addRoomReservContentController", {
	hasAddOnResizeEvent: false,
    onLoadCount: 0,
    
    /**
     * the main tabs panel which includes adding room ,add resource, my reservations tab
     */
    mainTabs: null,
    
    /**
     * a global parameters for holding varibale and values.
     */
    globalParameters: null,
    
    timeMarksTimezone: null,
    roomTimeline: null,
    hasCreateResStdsCheckboxes: false,
    
    afterInitialDataFetch: function() {
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
		this.onLoadCount++;	
        this.onStart();
    },
    
    /**
     *
     */
    selectRoomConsolePanel_afterRefresh: function() {
        if (this.onLoadCount > 0) {
            this.onStart();
        }
    },
    
    /**
     *
     */
    onStart: function() {
        //Generate the translated label for the "All" checkbox
        var checkboxAll = document.getElementById("resource_std_all");
        var checkboxParent = checkboxAll.parentNode;
        checkboxParent.appendChild(document.createTextNode(getMessage("allResourcesStds")));
        
        this.timezonePanel.enableField("afm_timezones.timezone_id", false);
        this.timezonePanel.setFieldValue("afm_timezones.timezone_id", '');
		
        this.timezonePanel.showHeader(false);
        this.timezonePanel.show(true, false);
        
        // the function in the file ab-rr-content-add-recurring-panel.js
        ABRV_RP_translateOptions();
        ABRV_RPRM_initRecurringOption();
        // KB#3027113
        $("res_instructions").innerHTML = getMessage("res_instructions");
       
	   if (!valueExists(this.roomTimeline)) {
            this.roomTimeline = new Ab.application.RoomTimeline("timeline1", this.globalParameters, "timelinePanel", "selectRoomConsolePanel", "timezonePanel");
        }
      	
		// If it's a new reservation, we get the user information
        if (!valueExists(this.globalParameters.user)) {
            var parameters = {};
    		Workflow.runRule("AbCommonResources-getUser", parameters, this.setUser.createDelegate(this));
		} else { // Else if it's a reserve edition, we load fields and timeline
  	    	this.roomTimeline.updateTimeline();
            var reservation = this.globalParameters.reservation;
            var roomReservation = this.globalParameters.roomReservation;
            
			if (valueExists(roomReservation)) {
				this.roomTimeline.enablePanelActions(true);
			} else {
            	this.roomTimeline.enablePanelActions(false);
        	}
			
            if (valueExists(reservation) && valueExists(reservation.res_id)) {
                var i;
                if (reservation.res_id != "") {
                    this.selectRoomConsolePanel.enableField("reserve.res_type", false);
                }
                
                // When editing an existing reservation, the console should empty the values 
                // of fl_id, rm_id and rm_arrange_type_id before filling the console with default 
                // values. So when reservation.res_id <> Null:
                reservation.fl_id = "";
                reservation.rm_id = "";
                reservation.rm_arrange_type_id = "";
                reservation.config_id = "";
                
                this.updateConsole();
                this.recurring_panel.setFieldValue("reserve.date_end", reservation.date_end);
                
                if (reservation.recur_type == "day") {
                    ABRV_RP_enabledDay(true);
                    ABRV_RP_enabledWeek(false);
                    ABRV_RP_enabledMonth(false);
                    
                    document.getElementById("day").checked = true;
                    document.getElementById("ndays").value = reservation.recur_val1[0];
                } else if (reservation.recur_type == "week") {
                    ABRV_RP_enabledDay(false);
                    ABRV_RP_enabledWeek(true);
                    ABRV_RP_enabledMonth(false);
                    
                    document.getElementById("week").checked = true;
                    for (i = 0; i < 7; i++) {
                        if (reservation.recur_val1[i]) {
                            document.getElementById("weekly_" + this.globalParameters.WeekDays[i].type).checked = true;
                        }
                    }
                } else if (reservation.recur_type == "month") {
                    ABRV_RP_enabledDay(false);
                    ABRV_RP_enabledWeek(false);
                    ABRV_RP_enabledMonth(true);
                    
                    document.getElementById("month").checked = true;
                    i = reservation.recur_val1[0];
                    document.getElementById("" + this.globalParameters.Months[i - 1].type).checked = true;
                    j = reservation.recur_val2[0];
                    document.getElementById("month_" + this.globalParameters.WeekDays[j].type).checked = true;
                }
                
                this.globalParameters.reservation = reservation;
                
                //Load the timeline
                if (this.setSearchValues()) {
                    this.roomTimeline.loadTimeLine("yes");
                }
                //Guo added 2008-08-19 by spec 37
                if (this.globalParameters.reservation.res_type == "recurring") {
                    this.recurring_panel.show(true);
                }
                
            }
        }
    },
    
    /**
     * setRoomReservation
     *
     */
    setUser: function(result) {
    	if (result.code != "executed") {
			return;
		}
		
		var userInfo = eval("(" + result.jsonExpression + ")");
		this.globalParameters.user = userInfo;
	   
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        
        if (valueExists(reservation)) {
            if (valueExists(reservation.res_id)) {
                handleExistsReservation(reservation, roomReservation);
            }
        } else {
            var user = [this.globalParameters.user];
            var jsonExpression = toJSON(user);
            
            var res_id = '';
		    var jsonUser = jsonExpression;

			try{
				var results = Workflow.callMethod("AbWorkplaceReservations-room-getReservationInfo", res_id, jsonUser);
				this.setReservationInfo(results)
			}catch(e){
				Workflow.handleError(e);
			}
        }
    },
    
    /**
     * handle exists reservation.
     * @param {Object} reservation reservation object.
     * @param {Object} roomReservation room reservation object.
     */
    handleExistsReservation: function(reservation, roomReservation) {
        //This field however is only visible when creating a new reservation. 
        //When editing an existing reservation we only allow individual editing
        this.selectRoomConsolePanel.enableField("reserve.res_type", false);
        
        //Also the console values for Floor, room and arrangement type will be reset				
        reservation.fl_id = "";
        reservation.rm_id = "";
        reservation.rm_arrange_type_id = "";
        reservation.config_id = "";
        
        this.globalParameters.reservation = reservation;
        this.globalParameters.roomReservation = roomReservation;
        
        if (valueExists(roomReservation)) {
            this.roomTimeline.enablePanelActions(true);
        } else {
            this.roomTimeline.enablePanelActions(false);
        }
        
        this.updateConsole();
        
        if (this.setSearchValues()) {
            this.roomTimeline.loadTimeLine("yes");
        }
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    setReservationInfo: function(result) {
        if (result.code != "executed") {
            View.showMessage(result.message);
            return;
        }
        
        var GeneralInfo = eval("(" + result.jsonExpression + ")");
        
        if (View.user.isMemberOfGroup("RESERVATION SERVICE DESK") 
				|| View.user.isMemberOfGroup("RESERVATION MANAGER") 
				|| View.user.isMemberOfGroup("%")) {
        
		    GeneralInfo.reservation.user_requested_by = "";
            GeneralInfo.reservation.user_requested_for = "";
            GeneralInfo.reservation.phone = "";
            GeneralInfo.reservation.email = "";
            GeneralInfo.reservation.dv_id = "";
            GeneralInfo.reservation.dp_id = "";
        }
        
        //This field however is only visible when creating a new reservation. 
        //When editing an existing reservation we only allow individual editing
        this.selectRoomConsolePanel.enableField("reserve.res_type", true);
        
        this.globalParameters.roomReservation = GeneralInfo.roomReservation;
        this.globalParameters.reservation = GeneralInfo.reservation;
        this.globalParameters.resourcesReservations = GeneralInfo.resourcesReservations;
		
		this.updateConsole();
    },
    
    /**
     *
     */
    updateConsole: function() {
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        var resourcesReservations = this.globalParameters.resourcesReservations;
        
        var consolePanel = this.selectRoomConsolePanel;
        consolePanel.setFieldValue("bl.ctry_id", reservation.ctry_id);
        consolePanel.setFieldValue("bl.site_id", reservation.site_id);
        consolePanel.setFieldValue("reserve_rm.bl_id", reservation.bl_id);
        consolePanel.setFieldValue("reserve_rm.fl_id", reservation.fl_id);
        consolePanel.setFieldValue("reserve_rm.rm_id", reservation.rm_id);
		if (!valueExists(reservation.config_id)) {
			reservation.config_id = "";	
		}
        consolePanel.setFieldValue("reserve_rm.config_id", reservation.config_id);
        consolePanel.setFieldValue("reserve_rm.rm_arrange_type_id", reservation.rm_arrange_type_id);
        
        //For recurring reservations there will be more values in date_start[1], date_start[2] ...
        consolePanel.setFieldValue("reserve.date_start", reservation.date_start[0]);
        consolePanel.setFieldValue("reserve.time_start", reservation.time_start);
        consolePanel.setFieldValue("reserve.time_end", reservation.time_end);
        consolePanel.setFieldValue("reserve_rm.guests_internal", reservation.group_size);
        consolePanel.setFieldValue("reserve_rm.guests_external", reservation.ext_guest);
        consolePanel.setFieldValue("reserve.res_type", reservation.res_type);
        
        //Options to when the reserve type is recurring
        if (reservation.res_type == "recurring") {
            this.recurring_panel.show(true);
            // Finally disables the <, >, <<, >> buttons when it?s not a regular reservation	
            this.roomTimeline.enablePreNextButtons(false);
        }
        
        //Display room arrangement types as checkboxes
        this.createResourcesStandardsCheckboxes("resource_std", reservation.all_resource_stds);
    },
    
    /**
     * Creates a number of checkbox controls from specified array of names and values.
     * The controls are created next to the specified "All" checkbox.
     * @param {Object} checkboxIdPrefix -- ID attribute prefix for checkbox HTML elements.
     * @param {Object} values -- Array of objects that must contain "name" and "type" properties.
     *                           Name property is displayed next to the checkbox.
     *                           Value property is set as a checkbox value.
     */
    createResourcesStandardsCheckboxes: function(checkboxIdPrefix, values) {
        if (this.hasCreateResStdsCheckboxes == true) {
            return;
        }
        
        var checkboxAll = $(checkboxIdPrefix + "_all");
        var checkboxParent = checkboxAll.parentNode;
        var PER_LINE = 5;
        
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            
            var checkbox = window.document.createElement("input");
            
            checkbox.type = "checkbox";
            checkbox.id = checkboxIdPrefix + "_" + value.type;
            checkbox.value = value.type;
            checkboxParent.appendChild(checkbox);
            checkboxParent.appendChild(window.document.createTextNode(value.name));
            
            if ((i + 1) % PER_LINE == 0) {
                checkboxParent.appendChild(window.document.createElement("br"));
            }
        }
        
        this.hasCreateResStdsCheckboxes = true;
    },
    
  

    /**
     * This function is called when clicking in the Clear button
     * #####TO DO : $("left1") and document.getElementById("left1")
     */
    selectRoomConsolePanel_onClear: function() {
        var reservation = this.globalParameters.reservation;
        
        
        //Clear all the console field values
        var consolePanel = this.selectRoomConsolePanel;
        consolePanel.setFieldValue("bl.ctry_id", "");
        consolePanel.setFieldValue("bl.site_id", "");
        consolePanel.setFieldValue("reserve_rm.bl_id", "");
        consolePanel.setFieldValue("reserve_rm.fl_id", "");
        consolePanel.setFieldValue("reserve_rm.rm_id", "");
        consolePanel.setFieldValue("reserve.date_start", "");
        consolePanel.setFieldValue("reserve.time_start", "");
        consolePanel.setFieldValue("reserve.time_end", "");
        consolePanel.setFieldValue("reserve_rm.guests_internal", "");
        consolePanel.setFieldValue("reserve_rm.guests_external", "");
        consolePanel.setFieldValue("reserve_rm.config_id", "");
        consolePanel.setFieldValue("reserve_rm.rm_arrange_type_id", "");
        consolePanel.setFieldValue("reserve.res_type", "regular");
        consolePanel.setFieldValue("reserve.date_end", "");
        document.getElementById("currentDate").innerHTML = "";
        
        
        //The recurrence panel hides itself by default
        this.recurring_panel.show(false);
        
        ABRV_RPRM_initRecurringOption();
        
        //Uncheck all the resources standards checkboxes
        var checkboxAll = $("resource_std_all");
        
        checkboxAll.checked = false;
        
        for (var i = 0; i < reservation.all_resource_stds.length; i++) {
            var value = reservation.all_resource_stds[i];
            var checkbox = $("resource_std_" + value.type);
            
            checkbox.checked = false;
        }
        
        //Clear the timeline control    
        this.globalParameters.timelineData = null;
        this.roomTimeline.clear();
		
		if (valueExists(this.roomTimeline.timelineController.timelineLayerDiv)) {
			// KB3025085
			this.roomTimeline.timelineController.timelineLayerDiv.style.display = "none";
		}
		
        // Boolean indicating if selected timezone times are showed must be set to false
        this.roomTimeline.existTimelineTimezone = false;
        
        // Select additional timezone should be empty and disabled
        this.timezonePanel.setFieldValue('afm_timezones.timezone_id', '');
        this.timezonePanel.enableField('afm_timezones.timezone_id', false);
    },
    
    /**
     * This function is called when clicking in the Next button
     */
    timelinePanel_onNext: function() {
        //Check that the user has selected a room arrangement and time period to reserve, 
        //and store this selected information in the this
        if (!valueExists(this.globalParameters.timelineData)) {
            View.showMessage(getMessage("selectRoomAndTimeError"));
            return;
        }
        
        var timeline = this.roomTimeline.timelineController;
        
        if (timeline.getPendingEvents().length != 1) {
            View.showMessage(getMessage("selectRoomAndTimeError"));
            return;
        }
        
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        
        
        
        var row = timeline.model.events[(timeline.model.events.length - 1)].getRow();
        var column = (timeline.model.events[(timeline.model.events.length - 1)].columnStart) + 1;
        if (reservation.res_type == 'recurring') {
            var events = timeline.model.getRowEvents(row);
            
            for (i = 0; i < events.length; i++) {
                if ((events[i].eventId == null) && (events[i].columnStart == column)) 
                    ;
                var event = events[i];
            }
        } else {
            //Get the added event by using the getUpdatedEvents function from the Timeline API
            var event = timeline.getEvent(row, column - 1);
        }
        
        //Get the selected time start and time end from the Event property of the Timeline, 
        //and update with this information the this properties
        var arrayRoom = [];
        var infoRoom = event.resource.room;
        arrayRoom = infoRoom.split(":");
        var building = arrayRoom[0];
        var floor = arrayRoom[1];
        var room = arrayRoom[2];
        var time_start = event.dateTimeStart;
        var time_end = event.dateTimeEnd;
        var roomConfiguration = event.resource.roomConfiguration;
        var roomArrangement = event.resource.roomArrangement;
        //Update the this values with the selected room arrangement
        roomReservation.bl_id = building;
        roomReservation.fl_id = floor;
        roomReservation.rm_id = room;
        reservation.bl_id = building;
        reservation.fl_id = floor;
        reservation.rm_id = room;
        reservation.config_id = roomConfiguration;
        reservation.rm_arrange_type_id = roomArrangement;
        reservation.time_start = time_start;
        reservation.time_end = time_end;
        roomReservation.config_id = roomConfiguration;
        roomReservation.rm_arrange_type_id = roomArrangement;
        roomReservation.time_start = time_start;
        roomReservation.time_end = time_end;
        roomReservation.date_start = reservation.date_start[0];
        
        //IF IT'S A NEW RESERVATION, save the default reservation name
        if (reservation.res_id == "") {
            var reservation_name = "";
            if (reservation.res_type == 'recurring') {
				reservation_name += getMessage("recurringresfor") + " ";
			} else {
				reservation_name += getMessage("reservationfor") + " ";
			}
			reservation_name += building + "-" + floor + "-" + room + " ";
            
			if (reservation.res_type == 'recurring') {
				reservation_name += getMessage("recurringresstart") + " ";
			}
			reservation_name += reservation.date_start[0] + " " + time_start;
            reservation.reservation_name = reservation_name;
        }
        
        // PC KB 3022749
        //IF IT'S EDITING A RESERVATION and it's a single reservation where the default name was used,
        //then change it to show new room, date and times reserved
        if ((reservation.res_id != "") 
				&& (reservation.original_res_type != "recurring") 
				&& (reservation.reservation_name.indexOf(getMessage("reservationfor")) != -1)) {
            //If reservation name contains the reservationfor message, then set the new name with the new selected values
            var reservation_name = "";
            reservation_name += getMessage("reservationfor") + " ";
            reservation_name += building + "-" + floor + "-" + room + " ";
            reservation_name += reservation.date_start[0] + " " + time_start;
            reservation.reservation_name = reservation_name;
        }
        
		
        var objectsToSave = [roomReservation];
        var jsonExpression = toJSON(objectsToSave);
       
		var jsonRoomReservation = jsonExpression;
       
		try{
			var results = Workflow.callMethod("AbWorkplaceReservations-room-getArrangementFixedResources", jsonRoomReservation);
			this.setArrangementFixedResources(results);
		}catch(e){
			Workflow.handleError(e);
		}
    },
    
    /**
     * This function is called when clicking in the Cancel button
     */
    timelinePanel_onCancel: function() {
        //Show a confirm window to the user to ensure that the user wants to cancel the process
        if (confirm(getMessage("msgBackExit"))) {
            //In case affirmative, clear all the this
            this.globalParameters.user = null;
            this.globalParameters.roomReservation = null;
            this.globalParameters.reservation = null;
            this.globalParameters.resourcesReservations = null;
            this.globalParameters.resourcesStd = null;
            this.globalParameters.timelineData = null; //Clear the timeline control
            
			// this.timeline.clear();
            this.roomTimeline.clear();
            //Boolean indicating if selected timezone times are showed must be set to false
            this.roomTimeline.existTimelineTimezone = false;
            
            //Redirect to My Reservations tab page
            this.mainTabs.selectTab("my-reservations");
        }
    },
    
    /**
     * This function is called when clicking in the Search button
     */
    selectRoomConsolePanel_onSearch: function() {
        var timeStart = this.selectRoomConsolePanel.getFieldValue("reserve.time_start");
        var timeEnd = this.selectRoomConsolePanel.getFieldValue("reserve.time_end");
        
        if (!ABRV_isMinnor(timeStart, timeEnd)) {
            View.showMessage(getMessage("selectTimeError"));
            return;
        }
		//kb#3037327: In order to select available room arrangements for recurring reservations, the user must enter in times on the top panel (both a Time Start and Time End).
		if ("recurring"==this.selectRoomConsolePanel.getFieldValue("reserve.res_type")  && (!timeStart || !timeEnd) ){
            View.showMessage(getMessage("emptyTimeForRecurring"));
            return;
		} 
			

        if (this.setSearchValues()) {
			
			if (valueExists(this.roomTimeline.timelineController.timelineLayerDiv)) {
				// KB3025085
				this.roomTimeline.timelineController.timelineLayerDiv.style.display = "";
			}
			
            //Boolean indicating if selected timezone times are showed must be set to false
            this.roomTimeline.existTimelineTimezone = false;
            
            //Select additional timezone should be empty and disabled
            this.timezonePanel.setFieldValue('afm_timezones.timezone_id', '');
            this.timezonePanel.enableField('afm_timezones.timezone_id', false);
            
	        this.roomTimeline.loadTimeLine("yes");
			
			var reservation = this.globalParameters.reservation;
            if (reservation.res_type != "regular") {
                this.roomTimeline.enablePreNextButtons(false);
            } 

			this.showHideRecurringPanel(true);
			
			// KB#3025626
			// roll back for geting resolution from Core Team
			// this.showScrollBars();
        }
    },
    
    /**
     * This function is called when clicking in the Search button.
     * Without considering the hours.
     */
    selectRoomConsolePanel_onSearchAlternative: function() {
        var reservation = this.globalParameters.reservation;
        
        if (this.setSearchValues()) {
        
            //Boolean indicating if selected timezone times are showed must be set to false
            this.roomTimeline.existTimelineTimezone = false;
            
            this.roomTimeline.loadTimeLine("no");
            
            //Finally disables the <, >, <<, >> buttons when it's not a regular reservation
            if (reservation.res_type != "regular") {
                this.roomTimeline.enablePreNextButtons(false);
				 // KB 3025625, Hiden the recurring panel after clicking the button "Check alternative"   
				ABRV_showHidePanel("recurring_panel", false, false);
				this.recurring_panel.actions.get("showOrHide").forceDisable(false);
            } else {
                this.roomTimeline.enablePreNextButtons(true);
            }
			// KB#3025626
			// roll back for geting resolution from Core Team
			// this.showScrollBars();
        }
    },
	
	/**
	 * show the scroll bars, vertical bar and horizon bar as default
	 */
	showScrollBars: function() {
		//=================================
		var panel = View.getControl('', "viewContent");
		panel.frame.dom.style.height = 795;
		panel.frame.dom.style.width = 965;
		
		if(!this.hasAddOnResizeEvent) {
			this.hasAddOnResizeEvent = true;
			window.attachEvent("onresize", new function(){
				panel.frame.dom.style.height = 795;
				panel.frame.dom.style.width = 965;
			});
		}
	},
		
	
    /**
     *
     */
    recurring_panel_onShowOrHide: function() {
        var showPanel = this.recurring_panel.visible;
		ABRV_showHidePanel("recurring_panel", !showPanel, false);
		this.recurring_panel.actions.get("showOrHide").forceDisable(false);
	},
    
    /**
     *
     * @param {boolean} onlyHide
     */
    showHideRecurringPanel: function(onlyHide) {
        if (this.selectRoomConsolePanel.getFieldValue("reserve.res_type") == "recurring") {
            if (onlyHide) {
                ABRV_showHidePanel("recurring_panel", false, false);
				this.recurring_panel.actions.get("showOrHide").forceDisable(false);
            } else {
                ABRV_showHidePanel("recurring_panel", true, false);
				this.recurring_panel.actions.get("showOrHide").forceDisable(false);
		    }
        }
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    setArrangementFixedResources: function(result) {
        if (result.code != "executed") {
            View.showMessage(result.message);
            return;
        }
        
        var roomReservation = this.globalParameters.roomReservation;
        var reservation = this.globalParameters.reservation;
        var resourcesReservations = this.globalParameters.resourcesReservations;
        
        
        var resType = this.selectRoomConsolePanel.getFieldValue("reserve.res_type");
        var checkConflicts = false;
        
		if (result.message == "OK") {
            var fixedResources = eval("(" + result.jsonExpression + ")");
            roomReservation.fixed_resources = fixedResources.fixed_resource;
        } else {
            roomReservation.fixed_resources = [];
        }
        
        if (resType == "recurring") {
            ABRV_RP_createXmlRecurring(this.globalParameters.reservation, "reserve.recurring_rule");
        } else {
            this.recurring_panel.setFieldValue("reserve.recurring_rule", "");
            reservation.recurring_rule = "";
        }
        
        //Check what is the type of the current reservation. In some cases we can 
        //immediately move forward to the confirmation page
        if (reservation.res_id == "") { //If new reservation
            if (reservation.res_type == "recurring") { //If a recurring reservation
                checkConflicts = true; //We might find a conflict
            }
        } else { // If editing a reservation
            if (roomReservation != null) { // And it's a room reservation
                if (resourcesReservations.length > 0) { // And resources are linked to the room
                    //Added by ZY, 2008-06-05, for room reservation edition. 
                    checkConflicts = true; // We might encounter a conflict
                    //alert(getMessage("warningOnNext"));
                }
            }
        }
        
        if (!checkConflicts) { // When no conflicts, move to confirmation page
            this.globalParameters.roomConflicts = [];
            this.globalParameters.resourceConflicts = [];
            
            this.mainTabs.showTab("roomReservationConfirm", true);
            this.mainTabs.hideTab("roomReservation");
            this.mainTabs.selectTab("roomReservationConfirm");
        } else {
            //If conflicts  are possible,  pass the user request stored in 
            //reservation/roomreservation/resourcereservations lists to a WFR.
            var objectsToSave = [reservation, roomReservation, resourcesReservations, View.user];
            var jsonExpression = toJSON(objectsToSave);
            
            var jsonReservation = jsonExpression;
            
			try{
				var results = Workflow.callMethod('AbWorkplaceReservations-room-detectRoomConflicts', jsonReservation);
				this.afterDetectRoomConflicts(results)
			}catch(e){
				Workflow.handleError(e);
			}
        }
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    afterDetectRoomConflicts: function(result) {
		 if (result.code != "executed") {
		 	View.showMessage(result.message);
			return;
		 }
		 
         //var controller = View.controllers.get('addRoomReservContentController');
         var roomReservation = this.globalParameters.roomReservation;
         var reservation = this.globalParameters.reservation;
         var resourcesReservations = this.globalParameters.resourcesReservations;
         
         //The WFR returns the room and resource conflicts in two separate lists.
         if (result.message == "OK") {
             var conflicts = eval("(" + result.jsonExpression + ")");
             
             roomConflicts = conflicts[0];
             resourceConflicts = conflicts[1];
         } else {
             roomConflicts = [];
             resourceConflicts = [];
         }
         
         this.globalParameters.roomConflicts = roomConflicts;
         this.globalParameters.resourceConflicts = resourceConflicts;
         
         //The WFR builds a list of room conflicts to present to the user.
         //Modified by ZY 2008-06-05,for room-resources reservation edition.
         if ((this.globalParameters.roomConflicts.length == 0) 
		 	&& (this.globalParameters.resourceConflicts.length == 0)) { // No conflicts detected                
             this.mainTabs.showTab("roomReservationConfirm", true);
             this.mainTabs.hideTab("roomReservation");
             this.mainTabs.selectTab("roomReservationConfirm");// Move to confirmation page
         } else {
             //Temporary while conflicts can't be solved, check that there's any available date. If all the dates are conflicts, then alert the user and stop here
             if ((this.globalParameters.reservation.res_type == "recurring") 
			 		&& (this.globalParameters.roomConflicts.length == this.globalParameters.reservation.date_start.length)) {
                 View.showMessage(getMessage("allDatesOccupiedError"));
             } else {
                 //The WFR will automatically set all dates in the room conflicts list to cancelled
                 //User will not see an option to find alternatives
                 this.mainTabs.showTab("roomReservationConflicts", true);
                 this.mainTabs.hideTab("roomReservation");
                 this.mainTabs.selectTab("roomReservationConflicts");// Redirect to resolve conflict page
             }
         }
    },
    
    /**
     * Check that the user has introduced all the mandatory fields to do the search
     */
    setSearchValues: function() {
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        
        var consolePanel = this.selectRoomConsolePanel;
        
        var ctry_id = consolePanel.getFieldValue("bl.ctry_id");
        var site_id = consolePanel.getFieldValue("bl.site_id");
        var bl_id = consolePanel.getFieldValue("reserve_rm.bl_id");
        var fl_id = consolePanel.getFieldValue("reserve_rm.fl_id");
        var rm_id = consolePanel.getFieldValue("reserve_rm.rm_id");
        var date_start = consolePanel.getFieldValue("reserve.date_start");
        var time_start = consolePanel.getFieldValue("reserve.time_start");
        var time_end = consolePanel.getFieldValue("reserve.time_end");
        var guests_internal = consolePanel.getFieldValue("reserve_rm.guests_internal");
        var guests_external = consolePanel.getFieldValue("reserve_rm.guests_external");
        var config_id = consolePanel.getFieldValue("reserve_rm.config_id");
        var rm_arrange_type_id = consolePanel.getFieldValue("reserve_rm.rm_arrange_type_id");
        var res_type = consolePanel.getFieldValue("reserve.res_type");
        
        var date_end = this.recurring_panel.getFieldValue("reserve.date_end");
        var typeRecurring = ABRV_getSelectedRadioButton("recurrent_type");
        
        //Mandatory fields
//        if (ctry_id == "") {
//            View.showMessage(getMessage("selectCtry"));
//            return false;
//        } else
        	if (site_id == "") {
            View.showMessage(getMessage("selectSite"));
            return false;
        } else if (date_start == "") {
            View.showMessage(getMessage("selectDateStart"));
            return false;
        } else if (guests_internal == "") {
            View.showMessage(getMessage("selectGuestInt"));
            return false;
        } else if (guests_external == "") {
            View.showMessage(getMessage("selectGuestExt"));
            return false;
        } else if ((date_end == "") && (res_type != "regular")) {
            View.showMessage(getMessage("selectDateEnd"));
            return false;
        } else if ((res_type != "regular") && !ABRV_bISODateIsBefore(date_start, ABRV_getDateModified(date_end, 1))) {
            View.showMessage(getMessage("fillGreaterDateEnd"));
            return false;
        } else if ((res_type != "regular") &&
        (typeRecurring == "day") &&
        document.getElementById("ndays").value == "") {
            View.showMessage(getMessage("fillDays"));
            return false;
        } else if ((res_type != "regular") &&
        (typeRecurring == "day") &&
        document.getElementById("ndays").value != "" &&
        !/^[1-9]\d*$/.test(document.getElementById("ndays").value)) {
            View.showMessage(getMessage("daysInputError"));
            return false;
        } else if ((res_type != "regular") 
				&& (typeRecurring == "week") 
				&& (document.getElementById("weekly_mon").checked == false) 
				&& (document.getElementById("weekly_tue").checked == false) 
				&& (document.getElementById("weekly_wed").checked == false) 
				&& (document.getElementById("weekly_thu").checked == false) 
				&& (document.getElementById("weekly_fri").checked == false) 
				&& (document.getElementById("weekly_sat").checked == false) 
				&& (document.getElementById("weekly_sun").checked == false)) {
            View.showMessage(getMessage("fillPattern"));
            return false;
        } else if (((res_type != "regular") 
				&& (typeRecurring == "month") 
				&& (document.getElementById("month_mon").checked == false) 
				&& (document.getElementById("month_tue").checked == false) 
				&& (document.getElementById("month_wed").checked == false) 
				&& (document.getElementById("month_thu").checked == false) 
				&& (document.getElementById("month_fri").checked == false) 
				&& (document.getElementById("month_sat").checked == false) 
				&& (document.getElementById("month_sun").checked == false)) 
				||
				((res_type != "regular") 
				&& (typeRecurring == "month") 
				&& (document.getElementById("first").checked == false) 
				&& (document.getElementById("second").checked == false) 
				&& (document.getElementById("third").checked == false) 
				&& (document.getElementById("fourth").checked == false) 
				&& (document.getElementById("last").checked == false))) {
					
            View.showMessage(getMessage("fillPattern"));
            return false;
        } else if ((res_type != "regular") && (typeRecurring == null)) {
            View.showMessage(getMessage("fillPattern"));
            return false;
        } else {
            //Update the this values with the selected information in the console fields
            reservation.ctry_id = ctry_id;
            reservation.site_id = site_id;
            reservation.bl_id = bl_id;
            reservation.fl_id = fl_id;
            reservation.rm_id = rm_id;
            
            if (res_type == "regular") {
                reservation.date_start = [date_start];
            } else {
                reservation.date_start = [];
            }
            
            if (res_type == "regular") {
                roomReservation.date_start = date_start;
            } else {
                roomReservation.date_start = "";
            }
            
            reservation.date_end = date_end;
            reservation.time_start = time_start;
            reservation.time_end = time_end;
            roomReservation.time_start = time_start;
            roomReservation.time_end = time_end;
            reservation.group_size = guests_internal;
            reservation.ext_guest = guests_external;
            reservation.rm_arrange_type_id = rm_arrange_type_id;
            reservation.config_id = config_id;
            reservation.recur_type = typeRecurring;
			reservation.res_type = res_type;
            
            //To store the array created with the selected resource standards
            this.saveResourcesStdTypes();
            if (this.setRecurringOptions()) {
                return true;
            } else {
                View.showMessage(getMessage("RecurringConfError"));
                return false;
            }
        }
    },
    
    /**
     * Save an array with the selected resource standards.
     */
    saveResourcesStdTypes: function() {
        var reservation = this.globalParameters.reservation;
        var resourcesStd = ABRV_getCheckboxValues("resource_std", reservation.all_resource_stds);
        var arrayResourcesStd = [];
        
        if (resourcesStd != "") 
            arrayResourcesStd = resourcesStd.split(",");
        
        reservation.resource_stds = arrayResourcesStd;
    },
    
    /**
     * Handles to the allocation of some variables considering the type of reserve.
     */
    setRecurringOptions: function() {
        var reservation = this.globalParameters.reservation;
        var date_start = this.selectRoomConsolePanel.getFieldValue("reserve.date_start");
        var date_end = this.recurring_panel.getFieldValue("reserve.date_end");
        
        if (reservation.res_type == "regular") {
            reservation.recur_type = null;
            reservation.recur_val1 = [null];
            reservation.recur_val2 = [null];
            reservation.date_start = [date_start];
        } else { //is recurring
            var i;
            reservation.recur_val1 = [null];
            reservation.recur_val2 = [null];
            
            if (reservation.recur_type == "day") {
                reservation.date_start = [date_start];
                reservation.recur_val1 = [$("ndays").value];
                i = 1;
                
                while ((reservation.date_start[i - 1] != null) &&
                (ABRV_bISODateIsBefore(ABRV_getDateModified(reservation.date_start[i - 1], reservation.recur_val1[0]), ABRV_getDateModified(date_end, 1)))) {
                    reservation.date_start[i] = ABRV_getDateModified(reservation.date_start[i - 1], reservation.recur_val1[0]);
                    i++;
                }
            } else if (reservation.recur_type == "week") { //type_recur is weekly		
                for (i = 0; i < 7; i++) {
                    reservation.recur_val1[i] = ((document.getElementById("weekly_" + this.globalParameters.WeekDays[i].type).checked == true) ? this.globalParameters.WeekDays[i].value : null);
                }
                
                consoleDay = ABRV_getDayOfWeek(date_start);
                dayDif = 7;
                
                for (i = 0; i < 7; i++) {
                    if (reservation.recur_val1[i] != null) {
                        temp = reservation.recur_val1[i] - consoleDay;
                        if (temp < 0) {
                            temp = temp + 7;
                        }
                        dayDif = ABRV_min(dayDif, temp);
                    }
                }
                
                if (ABRV_bISODateIsBefore(ABRV_getDateModified(date_start, dayDif), ABRV_getDateModified(reservation.date_end, 1))) {
                    reservation.date_start[0] = ABRV_getDateModified(date_start, dayDif);
                    temp = ABRV_getDateModified(reservation.date_start[0], 1);
                    i = 1;
                    while (ABRV_bISODateIsBefore(temp, ABRV_getDateModified(date_end, 1))) {
                        if ((ABRV_getDayOfWeek(temp) == reservation.recur_val1[0]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[1]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[2]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[3]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[4]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[5]) ||
                        (ABRV_getDayOfWeek(temp) == reservation.recur_val1[6])) {
                            reservation.date_start[i] = temp;
                            i++;
                        }
                        
                        temp = ABRV_getDateModified(temp, 1);
                    }
                }
            } else {
                //Begin type_recur is monthly
                reservation.recur_val1 = [ABRV_getSelectedRadioButton("recurrent_type2")];
                reservation.recur_val2 = [ABRV_getSelectedRadioButton("recurrent_type3")];
                startRecurring = date_start;
                endRecurring = date_end;
                i = 0;
                
                while (true) {
                    arrayDate = startRecurring.split("-");
                    weekDayMonthone = ABRV_getDayOfWeek(arrayDate[0] + "-" + arrayDate[1] + "-01");
                    addDays = reservation.recur_val2[0] - weekDayMonthone;
                    
                    if (addDays < 0) {
                        addDays += 7;
                    }
                    
                    daymonth1st = ABRV_getDateModified(arrayDate[0] + "-" + arrayDate[1] + "-01", addDays);
                    daymonth2nd = ABRV_getDateModified(daymonth1st, 7);
                    daymonth3rd = ABRV_getDateModified(daymonth2nd, 7);
                    daymonth4th = ABRV_getDateModified(daymonth3rd, 7);
                    daymonthlast = ABRV_getDateModified(daymonth4th, 7);
                    arraydaymonth1st = daymonth1st.split("-");
                    arraydaymonthlast = daymonthlast.split("-");
                    
                    if (arraydaymonthlast[1] != arraydaymonth1st[1]) {
                        daymonthlast = daymonth4th;
                    }
                    
                    if ((reservation.recur_val1[0] == 1) &&
                    (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth1st, 1)))) {
                    
                        if (ABRV_bISODateIsBefore(endRecurring, daymonth1st)) {
                            break;
                        } else {
                            reservation.date_start[i] = daymonth1st;
                            i++;
                        }
                    } else if ((reservation.recur_val1[0] == 2) &&
                    (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth2nd, 1)))) {
                    
                        if (ABRV_bISODateIsBefore(endRecurring, daymonth2nd)) {
                            break;
                        } else {
                            reservation.date_start[i] = daymonth2nd;
                            i++;
                        }
                    } else if ((reservation.recur_val1[0] == 3) &&
                    (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth3rd, 1)))) {
                    
                        if (ABRV_bISODateIsBefore(endRecurring, daymonth3rd)) {
                            break;
                        } else {
                            reservation.date_start[i] = daymonth3rd;
                            i++;
                        }
                    } else if ((reservation.recur_val1[0] == 4) &&
                    (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth4th, 1)))) {
                    
                        if (ABRV_bISODateIsBefore(endRecurring, daymonth4th)) {
                            break;
                        } else {
                            reservation.date_start[i] = daymonth4th;
                            i++;
                        }
                    } else if ((reservation.recur_val1[0] == 5) &&
                    (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonthlast, 1)))) {
                    
                        if (ABRV_bISODateIsBefore(endRecurring, daymonthlast)) {
                            break;
                        } else {
                            reservation.date_start[i] = daymonthlast;
                            i++;
                        }
                    }
                    
                    if (arrayDate[1] == 12) {
                        startRecurring = (parseInt(arrayDate[0], 10) + 1) + "-01-01";
                    } else {
                        startRecurring = arrayDate[0] + "-" +
                        (((parseInt(arrayDate[1], 10) + 1) > 9) ? (parseInt(arrayDate[1], 10) + 1) : "0" +
                        (parseInt(arrayDate[1], 10) + 1)) +
                        "-01";
                    }
                }  
            }  
        }
        
        if (reservation.date_start.length > 0) {
            reservation.date_end = reservation.date_start[reservation.date_start.length - 1];
            
            document.getElementById("currentDate").innerHTML = ABRV_ISODate2UserDate(reservation.date_start[0]);
            
            if (reservation.res_type == "recurring") {
                document.getElementById("currentDate").innerHTML += " " + getMessage("recurringText");
            }
        }
        
        this.globalParameters.reservation = reservation;
        
		if (reservation.date_start.length > 0) {
            return true;
        }
        
        return false;
    }
});

/**
 * Method when user changes the time start or time end fields in the Select Room form
 *
 * @param {Object} fieldName
 */
function onChangeTimes(fieldName) {
    if (valueExists(fieldName)) {
        afm_form_values_changed = true;
    }
	
    addRoomReservContentController.roomTimeline.handleRadioButtons();
}

/**
 * Test method to display checkbox values set by the user.
 */
function toggleResourceStdTypes() {
    var reservation = addRoomReservContentController.globalParameters.reservation;
    ABRV_setCheckboxValues("resource_std", reservation.all_resource_stds);
}

/**
 * This function is called when clicking in the Prev Week button
 */
function onPreviousWeek() {
   onChangeDate(-7);
}


/**
 * This function is called when clicking in the Prev Day button
 */
function onPreviousDay() {
    onChangeDate(-1);
}

/**
 * This function is called when clicking in the Next Day button
 */
function onNextDay() {
    onChangeDate(1);
}

/**
 * This function is called when clicking in the Next Week button
 */
function onNextWeek() {
   onChangeDate(7);
}

/**
 * 
 * @param {Object} dayCount
 */
function onChangeDate(dayCount) {
	 if (valueExists(addRoomReservContentController.globalParameters.timelineData)) {
        var roomReservation = addRoomReservContentController.globalParameters.roomReservation;
        var reservation = addRoomReservContentController.globalParameters.reservation;
        
		var consolePanel = View.panels.get("selectRoomConsolePanel");
        var date_select = consolePanel.getFieldValue("reserve.date_start");
        
		//Add one week to this date
        var date_modified = ABRV_getDateModified(date_select, dayCount);
        
        //Update both, the JSObject value, and the console field date_start value
        reservation.date_start[0] = date_modified;
        roomReservation.date_start = date_modified;
		
        consolePanel.setFieldValue("reserve.date_start", date_modified);
        document.getElementById("currentDate").innerHTML = date_select;
        
        //Afterwards it invokes the onsearch JS
        addRoomReservContentController.selectRoomConsolePanel_onSearch();
    }
}

/**
 * Load/Hidden the recurring_panel and enable/disable some timeline's buttons
 */
function optionResType() {
    var resType = View.panels.get("selectRoomConsolePanel").getFieldValue("reserve.res_type");
    
    if (resType == "recurring") {
        //View.getLayoutManager('nested_north').expandRegion('south');
        View.panels.get("recurring_panel").show(true);
        //Finally disables the <, >, <<, >> buttons when it?s not a regular reservation	
        addRoomReservContentController.roomTimeline.enablePreNextButtons(false);
    	
		var divScroll = Ext.getDom("mainLayout_north_div");
		try {
			divScroll.parentNode.scrollTop = divScroll.scrollHeight;
		}catch(e){
			//Nothing
		}
	} else {
        addRoomReservContentController.roomTimeline.enablePreNextButtons(true);
        View.panels.get("recurring_panel").show(false);
        
		ABRV_RPRM_initRecurringOption();
    }
    addRoomReservContentController.roomTimeline.timelineController.refreshRowBlocks();
}


/**
 *
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectTimezone(fieldName, selectedValue, previousValue) {
   var siteId = View.panels.get("selectRoomConsolePanel").getFieldValue("bl.site_id");
   addRoomReservContentController.roomTimeline.afterSelectTimezone(selectedValue, siteId);
}
