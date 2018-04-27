/**
 *
 */
var confirmRoomReservController = View.createController("confirmRoomReservController", {
	
	 /**
     * a global parameters for holding varibale and values.
     */
    globalParameters: null,
	
    mainTabs: null,
    /**
     *
     */
    rows: null,
	refreshCount:0,
    
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
    	if (!valueExists(this.globalParameters)) {
			this.initParameters();
		}
		this.onStart();
		this.refreshCount++;
    },
    
    /**
     * This function is called after the panel is refreshed.
     */
    roomReservationsDatailsPanel_afterRefresh: function(){
		if (this.refreshCount > 0) {
			this.onStart();
		}
	},
	
	confirmRoomReservPanel_afterRefresh:function(){
		if (this.refreshCount > 0) {
			this.onStart();
		}
	},
	
	initParameters: function() {
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
	},
	/**
	 * 
	 */
	onStart: function(){
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        
        if (roomReservation.bl_id == null || roomReservation.fl_id == null ||
        roomReservation.rm_id == null ||
        reservation.date_start == null ||
        roomReservation.time_start == null ||
        roomReservation.time_end == null ||
        roomReservation.config_id == null ||
        roomReservation.rm_arrange_type_id == null) {
            View.showMessage(getMessage('selectRoomAndTimeError'));
        } else {
            this.loadFields();
            this.loadRestrictions();
        }
    },
	
	
	/**
     * Method to inicializate and to disable the console values.
     */
    loadFields: function(){
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        var resourcesReservations = this.globalParameters.resourcesReservations;
        var resourceConflicts = this.globalParameters.resourceConflicts;
        
        var consolePanel = this.roomReservationsDatailsPanel;
        consolePanel.setInputValue('reserve_rm.bl_id', roomReservation.bl_id);
        consolePanel.setInputValue('reserve_rm.fl_id', roomReservation.fl_id);
        consolePanel.setInputValue('reserve_rm.rm_id', roomReservation.rm_id);
        consolePanel.setInputValue('reserve_rm.date_start', roomReservation.date_start);
        consolePanel.setInputValue('reserve_rm.time_start', roomReservation.time_start);
        consolePanel.setInputValue('reserve_rm.time_end', roomReservation.time_end);
        consolePanel.setInputValue('reserve_rm.config_id', roomReservation.config_id);
        consolePanel.setInputValue('reserve_rm.rm_arrange_type_id', roomReservation.rm_arrange_type_id);
        
        if (roomReservation.fixed_resources.length > 0) {
            var value = "";
            for (var i = 0; i < roomReservation.fixed_resources.length; i++) {
                if (i == 0) 
                    value += roomReservation.fixed_resources[i];
                else {
                    if (i % 6 == 0) 
                        value += " , " + "<br/>" + roomReservation.fixed_resources[i];
                    else 
                        value += " , " + roomReservation.fixed_resources[i];
                }
            }
            document.getElementById("resource_std_fixed").innerHTML = value;
        } else {
			
			this.panelFixedResources.show(false);
	    }
        
        if (!(resourcesReservations.length > 0)) {
            showGrid(false);
        }
        else {
        
            var rowArray = new Array();
            
            //From the confirmRoomReservController.mainTabs Reservation and roomConflicts we present a view of 
            //the reservations for all the dates in the recurring rule
            for (var i = 0; i < resourcesReservations.length; i++) {
                //Commented by ZY. 2008-06-05.
                //resolved = false;
                //Added by ZY. 2008-06-05.
                var foundinconflicts = false;
                if (resourceConflicts.length > 0) {
                    for (var j = 0; j < resourceConflicts.length; j++) {
                        if ((resourceConflicts[j].original_date_start == resourcesReservations[i].date_start) &&
                        (resourceConflicts[j].original_time_start == resourcesReservations[i].starttime) &&
                        (resourceConflicts[j].original_time_end == resourcesReservations[i].endtime) &&
                        (resourceConflicts[j].resource_id == resourcesReservations[i].resource_id) &&
                        (resourceConflicts[j].quantity == resourcesReservations[i].quantity)) {
                            //Added by ZY. 2008-06-05.
                            foundinconflicts = true;
                            
                            //Commented by ZY. 2008-06-05.
                            //resolved = true;
                            break;
                        }
                    }
                }
                if (!foundinconflicts) {
                    //form record objects and then toJSON them
                    var row = new Object();
                    row['col1'] = resourcesReservations[i].resource_id;
                    row['col2'] = resourcesReservations[i].quantity;
                    row['col3'] = resourcesReservations[i].starttime;
                    row['col4'] = resourcesReservations[i].endtime;
                    row['col5'] = resourcesReservations[i].comments;
                    rowArray.push(row);
                }
                else 
                    if (resourceConflicts[j].status == 'Resolved') {
                        // form record objects and then toJSON them
                        var row = new Object();
                        row['col1'] = resourceConflicts[j].resource_id;
                        row['col2'] = resourcesReservations[i].quantity;
                        row['col3'] = resourceConflicts[j].time_start;
                        row['col4'] = resourceConflicts[j].time_end;
                        row['col5'] = resourcesReservations[i].comments;
                        rowArray.push(row);
                    }
                
            }
            
            if (rowArray.length != 0) {
                var columns = initializeColumnObjects();
                var rows = rowArray;
               
                // find the control to be modified
                var panel = View.panels.get('panelResourcesReservations');
				
                if (panel == null) {
                    View.showMessage(getMessage("errNotFound"));
                    return;
                }
								
                if (columns != null && rows != null) {
				
					var configObj = new Ab.view.ConfigObject();
					configObj['rows'] = rows;
					configObj['columns'] = columns;
					// document.getElementById("gridResourcesReservations").innerHTML = "";
					var grid = new Ab.grid.ReportGrid('gridResourcesReservations', configObj);
					grid.sortEnabled = false;
					if (rows.length == 0) {
						grid.hasNoRecords = true;
					}
					
					grid.build();
					
					// KB3025152
					showGrid(true);
				}
			} else {
                showGrid(false);
            }
        }
        
        var buttonAllView = $('btnAllView');
        buttonAllView.value = getMessage("allView");
        
        consolePanel.fields.each(function(field){
            consolePanel.enableField(field.getFullName(), false);
            field.actions.each(function(action){
                action.enable(false);
            })
        })
		
        var resource_std_fixed = $('resource_std_fixed');
        resource_std_fixed.disabled = true;
    },
    /**
     * Method to inicializate the select value button and fields non editables.
     */
    loadRestrictions: function(){
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        var user = View.user;
        
        var confirmPanel = this.confirmRoomReservPanel;
        
        confirmPanel.setFieldValue('reserve.user_created_by', reservation.user_created_by);
        confirmPanel.setFieldValue('reserve.phone', reservation.phone);
        confirmPanel.setFieldValue('reserve.email', reservation.email);
        confirmPanel.setFieldValue('reserve.reservation_name', reservation.reservation_name);
        confirmPanel.setFieldValue('reserve.comments', reservation.comments);
        confirmPanel.setFieldValue('reserve.user_requested_by', reservation.user_requested_by);
        confirmPanel.setFieldValue('reserve.user_requested_for', reservation.user_requested_for);
        confirmPanel.setFieldValue('reserve.dv_id', reservation.dv_id);
        confirmPanel.setFieldValue('reserve.dp_id', reservation.dp_id);
        confirmPanel.setFieldValue('reserve.attendees', reservation.attendees);
        confirmPanel.setFieldValue('reserve.cost_res', reservation.cost_res);
        $('require_reply').checked = reservation.require_reply;
        confirmPanel.enableField('reserve.user_created_by', false);
		
        var existGroupHOST = false;
        if(ABRV_isMemberOfGroup(user,'RESERVATION HOST')){
			existGroupHOST = true;
		}
        
        if (existGroupHOST) {
            confirmPanel.enableField('reserve.user_requested_for', false);
            confirmPanel.enableField('reserve.user_requested_by', false);
            confirmPanel.enableField('reserve.dv_id', false);
            confirmPanel.enableField('reserve.dp_id', false);
        }
        
        //Adding resources to a recurring reservation is not allowed
        //Remove disable condition for editing room-resources reservation. Modified by ZY, 2008-06-24.
        //Remove disable condition for recurring room-resources reservation. Modified by Guo, 2008-07-4.
    },
    /**
     * Method when clicking in the Cancel button in the Confirm Room Reservation page
     */
    confirmRoomReservPanel_onCancel: function(){
        var reservation = this.globalParameters.reservation;
        
        //Show a confirm window to the user to ensure that the user wants to cancel the process
        //In case affirmative, clear all the confirmRoomReservController.mainTabs
        if (confirm(getMessage("msgBackExit"))) {
            //Clear all the confirmRoomReservController.mainTabs
            this.globalParameters.roomConflicts = null;
            this.globalParameters.resourceConflicts = null;
            this.globalParameters.timelineData = null;
            this.globalParameters.user = null;
            this.globalParameters.roomReservation = null;
            this.globalParameters.reservation = null;
            this.globalParameters.resourcesReservations = null;
            this.globalParameters.resourcesStd = null;
            
            //Redirect to Define Criteria, myReservations tab page
            this.mainTabs.hideTab('roomReservationConfirm');
            this.mainTabs.showTab('roomReservation', true);
            this.mainTabs.selectTab('my-reservations');
        }
    },
    /**
     * Method when clicking in the Changue Room/Date button in the Confirm Room Reservation form
     */
    confirmRoomReservPanel_onChange: function(){
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        var roomConflicts = this.globalParameters.roomConflicts;
        var user = View.user;
        var existGroupHOST = false;
        var follow = false;
        
        //Any conflicts resolved will be discarded when user goes back to the select room 
        //form. So in case any room conlicts have been detected (roomconflicts.length > 0), 
        //the user should be warned conflict resolvements will be lost.
		
        if (roomConflicts.length > 0) {
            //This function must show a confirm window to the user: user must be warned that all 
            //resolved conflicts will be lost when proceeding with this command
            follow = confirm(getMessage("msgGoBack"));
        }
        
        if (follow || !(roomConflicts.length > 0)) {
            var confirmPanel = this.confirmRoomReservPanel;
            reservation.phone = confirmPanel.getFieldValue('reserve.phone');
            reservation.email = confirmPanel.getFieldValue('reserve.email');
            reservation.reservation_name = confirmPanel.getFieldValue('reserve.reservation_name');
            reservation.comments = confirmPanel.getFieldValue('reserve.comments');
            
            reservation.attendees = confirmPanel.getFieldValue('reserve.attendees');
            reservation.require_reply = $('require_reply').checked;
            
            if(ABRV_isMemberOfGroup(user,'RESERVATION HOST')){
				existGroupHOST = true;
			}
            //If the connected user doesn't belong to the 'RESERVATION HOST' security group...
            if (!existGroupHOST) {
                reservation.user_requested_by = confirmPanel.getFieldValue('reserve.user_requested_by');
                reservation.user_requested_for = confirmPanel.getFieldValue('reserve.user_requested_for');
                reservation.dv_id = confirmPanel.getFieldValue('reserve.dv_id');
                reservation.dp_id = confirmPanel.getFieldValue('reserve.dp_id');
            }
            
            // this.globalParameters.timelineData = null;
			
            //Clear the confirmRoomReservController.globalParameters roomConflicts and resourceConflicts
            this.globalParameters.roomConflicts = null;
            this.globalParameters.resourceConflicts = null;
            
            //Also the console values for Floor, room and arrangement type will be reset
            reservation.fl_id = "";
            reservation.rm_id = "";
            reservation.config_id = "";
            reservation.rm_arrange_type_id = "";
            roomReservation.fl_id = "";
            roomReservation.rm_id = "";
            roomReservation.config_id = "";
            roomReservation.rm_arrange_type_id = "";
            reservation.time_start = "";
            reservation.time_end = "";
            roomReservation.time_start = "";
            roomReservation.time_end = "";
            
            this.globalParameters.reservation = reservation;
            this.globalParameters.roomReservation = roomReservation;
            
            //Redirect to Define Criteria, select Room tab page
            this.mainTabs.hideTab('roomReservationConfirm');
            this.mainTabs.showTab('roomReservation', true);
            this.mainTabs.selectTab('roomReservation');
        }
    },
    /**
     * Method when clicking in the Confirm and Finish button in the Confirm Room Reservation form
     */
    confirmRoomReservPanel_onFinish: function(){
        this.doFinishOrNext('yes','no');
    },
    /**
     * Method when clicking in the Confirm and Add Resources button in the Confirm Room Reservation form
     */
    confirmRoomReservPanel_onNext: function(){
		//kb#3037440: change design to also notify room reservation firstly even when user press 'Confirm And Add Resurces' button.
        this.doFinishOrNext('yes','yes');
    },
	
	/**
	 * 
	 * @param {Object} notify -- 'yes' , 'no'
	 * KB 3038919 move to My Reservations if "Confirm and Finish" action button clicked or to Add Resource reservations if "Confirm and Add Resources" button clicked
	 * @param {Object} addResources -- 'yes' , 'no'
	 * 	 */
	doFinishOrNext:function(notify, addResources){
		var reservation = this.globalParameters.reservation;
        //var user = View.user;
        var user = ABRV_getUserInfo();
        var existGroupHOST = false;
        var confirmPanel = View.panels.get('confirmRoomReservPanel');
        
        //Check that we have the additional information needed (requested_by and requested_for and reservation_name)
		var requestedBy = confirmPanel.getFieldValue('reserve.user_requested_by');
		var requestedFor = confirmPanel.getFieldValue('reserve.user_requested_for');
		var reserveName = confirmPanel.getFieldValue('reserve.reservation_name');
        if (valueExistsNotEmpty(requestedBy) && valueExistsNotEmpty(requestedFor) &&
        valueExistsNotEmpty(reserveName)) {
            //Update the JSObject
            reservation.phone = confirmPanel.getFieldValue('reserve.phone');
            reservation.email = confirmPanel.getFieldValue('reserve.email');
            reservation.reservation_name = reserveName;
            reservation.comments = confirmPanel.getFieldValue('reserve.comments');
            
            reservation.attendees = confirmPanel.getFieldValue('reserve.attendees');
            reservation.require_reply = $('require_reply').checked;
            
            if(ABRV_isMemberOfGroup(user,'RESERVATION HOST')){
				existGroupHOST = true;
			}
            
            //If the connected user doesn't belong to the 'RESERVATION HOST' security group...
            if (!existGroupHOST) {
                reservation.user_requested_by = requestedBy;
                reservation.user_requested_for = requestedFor;
                reservation.dv_id = confirmPanel.getFieldValue('reserve.dv_id');
                reservation.dp_id = confirmPanel.getFieldValue('reserve.dp_id');
            }
            
            //Below codes needed when clear the property "grid" of each resource Conflict which were loaded in Grid previously.
            //Added by ZY, 2008-06-25.
            if (this.globalParameters.resourceConflicts && (this.globalParameters.resourceConflicts.length > 0)) {
				for (var i = 0; i < this.globalParameters.resourceConflicts.length; i++) {
					this.globalParameters.resourceConflicts[i].grid = null;
				}
			}
            //Invokes addRoomReservation WFR to save the reservation records
            var objectsToSave = [user, reservation, this.globalParameters.roomReservation, this.globalParameters.resourcesReservations, this.globalParameters.roomConflicts, this.globalParameters.resourceConflicts];
            var jsonExpression = toJSON(objectsToSave);
            
            var jsonReservation = jsonExpression;
            var notify = notify;
			try{
				var results = Workflow.callMethod("AbWorkplaceReservations-room-addRoomReservation", jsonReservation, notify);
				// KB 3038919 move to My Reservations if "Confirm and Finish" action button clicked or to Add Resource reservations if "Confirm and Add Resources" button clicked
				if (addResources == 'no'){
					this.resultaddRoomReservation1(results);
				}else{
					this.resultaddRoomReservation2(results)
				}
			}catch(e){
				Workflow.handleError(e);
			}
		}
        else 
            View.showMessage(getMessage('fillMandatoryFieldsError'));
	},
    /**
     * Method result to call addRoomReservation WFR, clear all JSON and jump
     * @param {Object} result
     */
    resultaddRoomReservation1: function(result){
        if (result.code == 'executed') {
            if (result.message != "OK") {
                alert(result.message);
                if (!result.jsonExpression) 
                    return;
            }
            
            var reservationRecords = eval("(" + result.jsonExpression + ")");
            
            this.globalParameters.roomConflicts = null;
            this.globalParameters.resourceConflicts = null;
            this.globalParameters.timelineData = null;
            this.globalParameters.user = null;
            this.globalParameters.roomReservation = null;
            this.globalParameters.reservation = null;
            this.globalParameters.resourcesReservations = null;
            this.globalParameters.resourcesStd = null;
          
		    //Redirect to Define Criteria, myReservations tab page
            this.mainTabs.hideTab('roomReservationConfirm');
            this.mainTabs.showTab('roomReservation', true);
            this.mainTabs.selectTab('my-reservations');
            
        }
        else {
            View.showMessage(result.message);
        }
    },
    
    /**
     * Method result to call addRoomReservation WFR, load JSON values in window.tabs
     * @param {Object} result
     */
    resultaddRoomReservation2: function(result){
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        
        if (result.code == 'executed') {
            if (result.message != "OK") {
                alert(result.message);
                if (!result.jsonExpression) 
                    return;
            }
            
            var reservationRecords = eval("(" + result.jsonExpression + ")");
            reservation.res_id = reservationRecords[0].res_id;
            //PCS added to solve KB item 3015580
            reservation.cost_res = reservationRecords[0].cost_res;
            roomReservation.rmres_id = reservationRecords[1].rmres_id;
            
            this.globalParameters.reservation = reservation;
            this.globalParameters.roomReservation = roomReservation;
            //Modified for KB 3019075, by ZY, 2008-08-06.
            this.globalParameters.resourcesReservations = reservationRecords[2];
            
            //Redirect to Define Criteria, add Resouce Reservations tab page
            this.mainTabs.hideTab('roomReservationConfirm');
            this.mainTabs.showTab('roomReservation', true);
            this.mainTabs.selectTab('resourcesReservation');
            
        }
        else {
            View.showMessage(result.message);
        }
    }
})

/**
 * Return array of column OBJECTS to be used as the grid's columns before reloadGrid is called
 *
 */
function initializeColumnObjects(){
    var columnArray = new Array();
    
    columnArray.push(new Ab.grid.Column('col1', getMessage("ResourceId"), 'text'));
    columnArray.push(new Ab.grid.Column('col2', getMessage("Quantity"), 'number'));
    columnArray.push(new Ab.grid.Column('col3', getMessage("TimeStart"), 'text'));
    columnArray.push(new Ab.grid.Column('col4', getMessage("TimeEnd"), 'text'));
    columnArray.push(new Ab.grid.Column('col5', getMessage("Comments"), 'text'));
    
    return columnArray;
}
/**
 * this method put reserves in grid and open pop-up
 */
function onViewAllRecurring(){
    var reservation = confirmRoomReservController.globalParameters.reservation;
    var roomConflicts = confirmRoomReservController.globalParameters.roomConflicts;
    var rowArray = new Array();
    
    //From the confirmRoomReservController.globalParameters Reservation and roomConflicts we present a view of 
    //the reservations for all the dates in the recurringrule
    for (var i = 0; i < reservation.date_start.length; i++) {
        var resolved = false;
        if (roomConflicts.length > 0) {
            for (var j = 0; j < roomConflicts.length; j++) {
                if (roomConflicts[j].original_date_start == reservation.date_start[i]) {
                    resolved = true;
                    break;
                }
            }
        }
        
        if (!resolved) {
            // form record objects and then toJSON them
            var row = new Object();
            row['col1'] = reservation.date_start[i];
            row['col2'] = reservation.bl_id;
            row['col3'] = reservation.fl_id;
            row['col4'] = reservation.rm_id;
            row['col5'] = reservation.config_id;
            row['col6'] = reservation.rm_arrange_type_id;
            row['col7'] = reservation.time_start;
            row['col8'] = reservation.time_end;
            rowArray.push(row);
        }
    }
    
    confirmRoomReservController.rows = rowArray;
    
	View.openDialog('ab-rr-room-viewallrecurring.axvw', null, true, null,null,1100,600);
}

/**
 * toggle the visibility of the grid with ID = 'panelResourcesReservations'
 * @param {Object} show
 */
function showGrid(show){
	View.panels.get('panelResourcesReservations').show(show);
}

/**
 *
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterAddEmployee(fieldName, selectedValue, previousValue){
    var confirmPanel = View.panels.get('confirmRoomReservPanel');
    var selected_attendees = confirmPanel.getFieldValue('reserve.attendees');
    if (selected_attendees != '') 
        selected_attendees = selected_attendees + ';';
    selected_attendees = selected_attendees + selectedValue;
    confirmPanel.setFieldValue('reserve.attendees', selected_attendees);
}

/**
 *
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterAddVisitor(fieldName, selectedValue, previousValue){
    var confirmPanel = View.panels.get('confirmRoomReservPanel');
    var selected_attendees = confirmPanel.getFieldValue('reserve.attendees');
    if (selected_attendees != '') 
        selected_attendees = selected_attendees + ';';
    selected_attendees = selected_attendees + selectedValue;
    confirmPanel.setFieldValue('reserve.attendees', selected_attendees);
}
