
var resourceReservConflictsController = View.createController("resourceReservConflictsController", {
	
	mainTabs:null,
	globalParameters:null,
	onLoadCount:0,
	
	/**
	 * This function is called when the page is loaded into the browser.
	 */
	afterInitialDataFetch: function(){
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
        this.onStart();
		this.onLoadCount++;
    },
	
	rsConflictReport_afterRefresh:function(){
		if (this.onLoadCount > 0) {
			this.onStart();
		}
	},
	/**
 	* OnStart function inicialize button next like disabled and show grid 
 	* with conflicts from JSON objects.
 	*/
 	onStart:function(){
    	//onloadHelper();
    	inicializeActionTitle();
    
    	//Handles displaying the conflicts
    	conflictRedraw();
	}
	
})



/**
 * This function checks if conflicts need to be resolved. If not, the NEXT button will be enabled.
 */
function conflictRedraw(){
    //If there aren't conflicts, then NEXT button will be enabled
    //if ( !(roomConflicts.length > 0) )
    $("btnNext").disabled = false;
    
    var columns = initializeColumnObjects();
    var globalRowsFromJSON = resourceReservConflictsController.globalParameters.resourceConflicts;
	
	var rowsFromJSON = ABRV_Clone(globalRowsFromJSON);
	
    for (var i = 0; i < rowsFromJSON.length; i++) {
		rowsFromJSON[i].quantity = ""+rowsFromJSON[i].quantity;
        rowsFromJSON[i].time_start = ABRV_convert12H(left(rowsFromJSON[i].time_start, 5));
        rowsFromJSON[i].time_end = ABRV_convert12H(left(rowsFromJSON[i].time_end, 5));
        rowsFromJSON[i].date_start = ABRV_ISODate2UserDate(rowsFromJSON[i].date_start);
    }
    
    // find the control to be modified
    var grid = View.getControl('', "rsConflictReport");
    if (grid == null) {
        View.showMessage(getMessage("errNotFound"));
        return;
    }
    
	var configObj = new Ab.view.ConfigObject();
	configObj['rows'] = rowsFromJSON;
    configObj['columns'] = columns;
    
    grid = new Ab.grid.ReportGrid('rsReport_grid', configObj);	
	
    grid.sortEnabled = false;
    if (rowsFromJSON.length == 0) {
        grid.hasNoRecords = true;
    }
	
    grid.build();	
}

/**
 * Return array of column OBJECTS to be passed to reloadRows
 */
function initializeColumnObjects(){
    var columnArray = new Array();
    
    columnArray.push(new Ab.grid.Column("date_start", getMessage("date"), "text"));
    columnArray.push(new Ab.grid.Column("resource_id", getMessage("resource"), "text"));
    columnArray.push(new Ab.grid.Column("quantity", getMessage("quantity"), "text"));
    columnArray.push(new Ab.grid.Column("time_start", getMessage("startTime"), "text"));
    columnArray.push(new Ab.grid.Column("time_end", getMessage("endTime"), "text"));
    columnArray.push(new Ab.grid.Column("reason", getMessage("reason"), "text"));
    columnArray.push(new Ab.grid.Column("status_text", getMessage("status"), "text"));
    return columnArray;
}

/**
 * This function is called when clicking the Go Back button in the Resolve Conflict Page 
 */
function onGoBack(){
    //This function must show a confirm window to the user: user must be warned that all 
    //resolved conflicts will be lost when proceeding with this command
    if (confirm(getMessage("msgGoBack"))) {
        //Clear the JSObjects roomConflicts and resourceConflicts
        resourceReservConflictsController.globalParameters.resourceConflicts = null;
        //guo added
        var existedResourcesReservations = new Array();
        for (var i = 0; i <resourceReservConflictsController.globalParameters.resourcesReservations.length; i++) {
            if (resourceReservConflictsController.globalParameters.resourcesReservations[i].rsres_id ) {
                existedResourcesReservations.push(resourceReservConflictsController.globalParameters.resourcesReservations[i]);
            }
        }
		resourceReservConflictsController.globalParameters.resourcesReservations.length = 0;
		 for (var i = 0; i <existedResourcesReservations.length; i++) {
		 	resourceReservConflictsController.globalParameters.resourcesReservations.push(existedResourcesReservations[i]);
        }
        //Redirect to Select Room tab page
        resourceReservConflictsController.mainTabs.hideTab("resourceReservationConflicts");
        resourceReservConflictsController.mainTabs.showTab("resourcesReservation", true);
        resourceReservConflictsController.mainTabs.selectTab("resourcesReservation");
    }
}

/**
 * Method when clicking in the Cancel button in the Resolve Conflict page
 */
function onCancel(){
    //Show a confirm window to the user to ensure that the user wants to cancel the process
    //In case affirmative, clear all the JSObjects
    if (confirm(getMessage("msgBackExit"))) {
        //Clear all the JSObjects
        setToNull(resourceReservConflictsController.globalParameters.roomReservation);
        setToNull(resourceReservConflictsController.globalParameters.reservation);
        setToNull(resourceReservConflictsController.globalParameters.resourcesReservations);
        setToNull(resourceReservConflictsController.globalParameters.resourcesStd);
        setToNull(resourceReservConflictsController.globalParameters.roomConflicts);
        setToNull(resourceReservConflictsController.globalParameters.resourceConflicts);
        //Redirect to Define Criteria, myReservations tab page
        resourceReservConflictsController.mainTabs.hideTab("resourceReservationConflicts");
        resourceReservConflictsController.mainTabs.showTab("resourcesReservation", true);
        resourceReservConflictsController.mainTabs.selectTab("my-reservations");
    }
}

/**
 * Method when clicking in the NEXT button in the Resolve Conflicts page
 */
function onConfirmNext(){
	//This form insert the grid atribute in resource conflict JSON, 
	//it make a infinite cycle when we use the toJSON method
	//To resolve this problem we must change the grid attribute value empty
	//Added by ZY, 2008-07-09.
	for (i=0;i<resourceReservConflictsController.globalParameters.resourceConflicts.length;i++) {
		resourceReservConflictsController.globalParameters.resourceConflicts[i].grid = "";
	}
    resourceReservConflictsController.mainTabs.showTab("resourceReservationConfirm", true);
    resourceReservConflictsController.mainTabs.hideTab("resourceReservationConflicts");
    resourceReservConflictsController.mainTabs.selectTab("resourceReservationConfirm");// Move to confirmation page
}
/**
 * 
 */
function inicializeActionTitle(){
    $("btnGoBack").value = getMessage("btnGoBackTitle");
    $("btnCancel").value = getMessage("btnCancelTitle");
    $("btnNext").value = getMessage("btnNextTitle");
}

/**
 * 
 * @param {Object} value
 */
function setToNull(value){
    if (valueExists(value)) {
        value = null;
    }
}
/**
 * 
 * @param {Object} str
 * @param {Object} n
 */
function left(str, n){
    if (n <= 0) 
        return "";
    else 
        if (n > String(str).length) 
            return str;
        else 
            return String(str).substring(0, n);
}

