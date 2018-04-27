
var roomReservConflictsController = View.createController("roomReservConflictsController", {
	
	mainTabs:null,
	globalParameters:null,
	onLoadCount:0,
	
	/**
	 * This function is called when the page is loaded into the browser.
	 */
	afterInitialDataFetch:function(){
		this.mainTabs = View.getControl('', "createEditResevationTabs");
		this.globalParameters = View.getOpenerView().controllers.get(0);
		this.onStart();
		this.onLoadCount++;
	},
	
	rmConflictReport_afterRefresh: function(){
		if (this.onLoadCount > 0) {
			this.onStart();
		}
    },
    
    /**
     * inicialize button next like disabled and show grid
     * with conflicts from JSON objects.
     *
     * This function invoke conflictRedraw(). Modified by ZY, 2008-0605.
     */
    onStart: function(){
        // Disabled next button
        document.getElementById("btnNext").disabled = true;
        //Guo added 2008-07-14
        $("btnGoBack").value = getMessage("btnGoBackTitle");
        $("btnCancel").value = getMessage("btnCancelTitle");
        $("btnNext").value = getMessage("btnNextTitle");
        //Handles displaying the conflicts
        conflictRedraw();
    }
})


/**
 * This function checks if conflicts need to be resolved. If not, the NEXT button will be enabled.
 */
function conflictRedraw() {

	//If there aren't conflicts, then NEXT button will be enabled
	//if ( !(roomConflicts.length > 0) )
	document.getElementById("btnNext").disabled = false;

	if (roomReservConflictsController.globalParameters.roomConflicts.length > 0) {
		showConflicts(roomReservConflictsController.globalParameters.roomConflicts, "room");
		var grid = View.panels.get("rsConflictReport");
		grid.visible=true;
		grid.show(false,true);
	}
		
	else {
			if (roomReservConflictsController.globalParameters.resourceConflicts.length > 0) {//Added by ZY, 2008-06-05.
				showConflicts(roomReservConflictsController.globalParameters.resourceConflicts, "resource");
				var grid = View.panels.get("rmConflictReport");
				grid.visible=true;
				grid.show(false,true);
			}
	}
}

/**
 * Generate and show the given conflicts list in correct panel.
 * @param {Object} conflictsArray
 * @param {Object} conflictsType
 */
function showConflicts(conflictsArray,conflictsType){
	var columns;
	var rowsFromJSON = ABRV_Clone(conflictsArray);
	
	
	for (var i=0; i<conflictsArray.length; i++) {
		rowsFromJSON[i].time_start = ABRV_convert12H(rowsFromJSON[i].time_start);
		rowsFromJSON[i].time_end = ABRV_convert12H(rowsFromJSON[i].time_end);
		rowsFromJSON[i].date_start = ABRV_ISODate2UserDate(rowsFromJSON[i].date_start);
	}

	// find the control to be modified
    var grid;
	var htmlDivId;
    if(conflictsType=="room"){
		columns = initializeColumnObjectsOfRoom();	
		htmlDivId = "rmReport_grid";
	}
    else if(conflictsType=="resource"){
		for (var i=0; i<conflictsArray.length; i++) {
			rowsFromJSON[i].quantity = ""+rowsFromJSON[i].quantity;
		}
		columns = initializeColumnObjectsOfResource();
		htmlDivId = "rsReport_grid";	
	}
	
    var configObj = new Ab.view.ConfigObject();
	configObj['rows'] = rowsFromJSON; 
    configObj['columns'] = columns;
    
    grid = new Ab.grid.ReportGrid(htmlDivId, configObj);	
	
	if (grid == null) {
		View.showMessage(getMessage("errNotFound"));
		return;
	}
	
    grid.sortEnabled = false;
    if (rowsFromJSON.length == 0) {
        grid.hasNoRecords = true;
    }
	
    grid.build();	
	
}

/**
 * Return array of column OBJECTS for showing room conflicts. Be passed to reloadRows
 */
function initializeColumnObjectsOfRoom() {
	var columnArray = new Array();
	
	columnArray.push(new Ab.grid.Column("date_start",getMessage("DateStart"),"text"));
	columnArray.push(new Ab.grid.Column("bl_id",getMessage("BuildingCode"),"text"));
	columnArray.push(new Ab.grid.Column("fl_id",getMessage("FloorCode"),"text"));
	columnArray.push(new Ab.grid.Column("rm_id",getMessage("RoomCode"),"text"));
	columnArray.push(new Ab.grid.Column("config_id",getMessage("ConfigurationCode"),"text"));
	columnArray.push(new Ab.grid.Column("rm_arrange_type_id",getMessage("RoomArrangementType"),"text"));
	columnArray.push(new Ab.grid.Column("time_start",getMessage("TimeStart"),"text"));
	columnArray.push(new Ab.grid.Column("time_end",getMessage("TimeEnd"),"text"));
	columnArray.push(new Ab.grid.Column("reason",getMessage("Reason"),"text"));
	columnArray.push(new Ab.grid.Column("status_text",getMessage("StatusOfReservation"),"text"));

	return columnArray;
}

/**
 * Return array of column OBJECTS for showing resource conflicts. Be passed to reloadRows
 * Added by ZY, 2008-06-05.
 */
function initializeColumnObjectsOfResource() {
	var columnArray = new Array();
	
	columnArray.push(new Ab.grid.Column("date_start",getMessage("DateStart"),"text"));
    columnArray.push(new Ab.grid.Column("resource_id", getMessage("Resource"), "text"));
    columnArray.push(new Ab.grid.Column("quantity", getMessage("Quantity"), "text"));
	columnArray.push(new Ab.grid.Column("time_start",getMessage("TimeStart"),"text"));
	columnArray.push(new Ab.grid.Column("time_end",getMessage("TimeEnd"),"text"));
	columnArray.push(new Ab.grid.Column("reason",getMessage("Reason"),"text"));
	columnArray.push(new Ab.grid.Column("status_text",getMessage("StatusOfReservation"),"text"));

	return columnArray;
}


/**
 * This function is called when clicking the Go Back button in the Resolve Conflict Page
 */
function onGoBack() {
	var reservation = roomReservConflictsController.globalParameters.reservation;
	var roomConflicts = roomReservConflictsController.globalParameters.roomConflicts;
	var roomReservation = roomReservConflictsController.globalParameters.roomReservation;
	var user = roomReservConflictsController.globalParameters.user;
	//This function must show a confirm window to the user: user must be warned that all 
	//resolved conflicts will be lost when proceeding with this command
	if (confirm(getMessage("msgGoBack"))) {
		// Put timelineData to null.
		roomReservConflictsController.globalParameters.timelineData = null;
		//Clear the JSObjects roomConflicts and resourceConflicts
		roomReservConflictsController.globalParameters.roomConflicts = null;	
		roomReservConflictsController.globalParameters.resourceConflicts = null;
		
		//Also the console values for Floor, room and arrangement type will be reset
		reservation.fl_id = "";
		reservation.rm_id = "";
		reservation.config_id = "";
		reservation.rm_arrange_type_id = "";
		roomReservation.fl_id = "";
		roomReservation.rm_id = "";
		roomReservation.config_id = "";
		roomReservation.rm_arrange_type_id = "";
		if (reservation.res_type == "recurring"){
			reservation.time_start = "";
			reservation.time_end = "";
			roomReservation.time_start = "";
			roomReservation.time_end = "";
		}
		
		// Reload new values in windows tabs
		roomReservConflictsController.globalParameters.reservation = reservation;
		roomReservConflictsController.globalParameters.roomReservation = roomReservation;
		
		//Redirect to Select Room tab page
		roomReservConflictsController.mainTabs.hideTab("roomReservationConflicts");
		roomReservConflictsController.mainTabs.showTab("roomReservation", true);
		roomReservConflictsController.mainTabs.selectTab("roomReservation");
    }
}

/**
 * Method when clicking in the Cancel button in the Resolve Conflict page
 */
function onCancel() {
	//Show a confirm window to the user to ensure that the user wants to cancel the process
	//In case affirmative, clear all the JSObjects
	if (confirm(getMessage("msgBackExit"))) {
		//Clear all the JSObjects
		roomReservConflictsController.globalParameters.timelineData = null;	
		roomReservConflictsController.globalParameters.user = null;
		roomReservConflictsController.globalParameters.roomReservation = null;
		roomReservConflictsController.globalParameters.reservation = null;
		roomReservConflictsController.globalParameters.resourcesReservations = null;
		roomReservConflictsController.globalParameters.resourcesStd = null;
		roomReservConflictsController.globalParameters.roomConflicts = null;	
		roomReservConflictsController.globalParameters.resourceConflicts = null;
		
		//Redirect to Define Criteria, myReservations tab page
	    roomReservConflictsController.mainTabs.hideTab("roomReservationConflicts");
	    roomReservConflictsController.mainTabs.showTab("roomReservation", true);
	    roomReservConflictsController.mainTabs.selectTab("my-reservations");
    }
}

/**
 * Method when clicking in the NEXT button in the Resolve Conflicts page
 */
function onNext() {
	//This form insert the grid atribute in room conflict JSON, 
	//it make a infinite bucle when we use the toJSON method
	//To resolve this problem we must change the grid attribute value empty
	for (var i=0;i<roomReservConflictsController.globalParameters.roomConflicts.length;i++) {
		roomReservConflictsController.globalParameters.roomConflicts[i].grid = "";
	}
	roomReservConflictsController.mainTabs.showTab("roomReservationConfirm", true);
	roomReservConflictsController.mainTabs.hideTab("roomReservationConflicts");
	roomReservConflictsController.mainTabs.selectTab("roomReservationConfirm");// Move to confirmation page

}