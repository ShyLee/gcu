/**
 * controller for confirming resource reservations
 */
var confirmResReservController = View.createController("confirmResReservController", {
    refreshCount: 0,
    mainTabs: null,
    globalParameters: null,
    rows: null,
    
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        if (this.mainTabs == null) {
            this.mainTabs = View.getControl('', 'createEditResevationTabs');
            this.globalParameters = View.getOpenerView().controllers.get(0);
            this.onStart();
            this.refreshCount++;
        };
    },
    
    resourcesReservationsPanel_afterRefresh: function(){
        if (this.refreshCount > 0) {
            this.onStart();
        }
    },
    
    /**
     *
     */
    onStart: function(){
        this.loadFields();
        this.loadRestrictions();
        this.buildResourcesDetail();
    },
    /**
     * Method to inicializate and to disable the consola values.
     */
    loadFields: function(){
        var reservation = this.globalParameters.reservation;
        this.resourcesReservationsPanel.setFieldValue('bl.ctry_id', reservation.ctry_id);
        this.resourcesReservationsPanel.setFieldValue('bl.site_id', reservation.site_id);
        //$('Showbl.site_id').innerHTML = reservation.site_id;
        
        this.resourcesReservationsPanel.setFieldValue('reserve_rs.date_start', reservation.date_start[0]);
        this.resourcesReservationsPanel.setInputValue('reserve_rs.time_start', reservation.time_start);
        this.resourcesReservationsPanel.setInputValue('reserve_rs.time_end', reservation.time_end);
        
        //PC KB item 3015654
        this.confirmResReservationsPanel.setFieldValue('reserve_rs.bl_id', reservation.bl_id);
        this.confirmResReservationsPanel.setFieldValue('reserve_rs.fl_id', reservation.fl_id);
        this.confirmResReservationsPanel.setFieldValue('reserve_rs.rm_id', reservation.rm_id);
        
        this.resourcesReservationsPanel.enableField("reserve_rs.date_start", false);
        this.resourcesReservationsPanel.enableField("reserve_rs.time_start", false);
        this.resourcesReservationsPanel.enableField("reserve_rs.time_end", false);
        
        var buttonAllView = $('btnAllView');
        buttonAllView.value = getMessage("allView");
    },
    /**
     * Method to inicializate the select value button and fields non editables.
     */
    loadRestrictions: function(){
        var user = View.user;
        var reservation = this.globalParameters.reservation;
        var existGroupHOST = false;
        
        if (reservation.bl_id != null) {
            this.confirmResReservationsPanel.setFieldValue("reserve_rs.bl_id", reservation.bl_id);
        }
        
        this.confirmResReservationsPanel.setFieldValue("reserve_rs.fl_id", reservation.fl_id);
        this.confirmResReservationsPanel.setFieldValue("reserve_rs.rm_id", reservation.rm_id);
        
        this.confirmResReservationsPanel.enableField("reserve.user_created_by", false);
        
        this.confirmResReservationsPanel.setFieldValue("reserve.user_created_by", reservation.user_created_by);
        this.confirmResReservationsPanel.setFieldValue("reserve.phone", reservation.phone);
        this.confirmResReservationsPanel.setFieldValue("reserve.email", reservation.email);
        this.confirmResReservationsPanel.setFieldValue("reserve.reservation_name", reservation.reservation_name);
        this.confirmResReservationsPanel.setFieldValue("reserve.comments", reservation.comments);
        this.confirmResReservationsPanel.setFieldValue("reserve.user_requested_by", reservation.user_requested_by);
        this.confirmResReservationsPanel.setFieldValue("reserve.user_requested_for", reservation.user_requested_for);
        this.confirmResReservationsPanel.setFieldValue("reserve.dv_id", reservation.dv_id);
        this.confirmResReservationsPanel.setFieldValue("reserve.dp_id", reservation.dp_id);
        
        if (ABRV_isMemberOfGroup(user, 'RESERVATION HOST')) {
            existGroupHOST = true;
        }
        
        //If the connected user belongs to the ?RESERVATION HOST? security group
        if (existGroupHOST) {
            this.confirmResReservationsPanel.enableField("reserve.dv_id", false);
            this.confirmResReservationsPanel.enableField("reserve.dp_id", false);
            this.confirmResReservationsPanel.enableField("reserve.user_requested_by", false);
            this.confirmResReservationsPanel.enableField("reserve.user_requested_for", false);
        }
    },
    /**
     * Method to create the Resources Reservations Details panel.
     */
    buildResourcesDetail: function(){
        var disabledNext = false;
        var layerText = "";
        var status = "";
        //window.tabs = getFrameObject(parent, 'tabsFrame');
        
        // -------------------------------------------------------------------------------------------------
        // Build lists of resources reservations from window.tabs.resourcesReservations.
        // -------------------------------------------------------------------------------------------------
        layerText = '<table class="panelReport"><tbody><tr>';
        layerText += '<th>' + getMessage("titleResource") + '</th>';
        layerText += '<th>' + getMessage("titleFrom") + '</th>';
        layerText += '<th>' + getMessage("titleUntil") + '</th>';
        layerText += '<th>' + getMessage("titleResQuantity") + '</th>';
        layerText += '<th>' + getMessage("titleStatus") + '</th></tr>';
        
        
        for (var i = 0; i < this.globalParameters.resourcesReservations.length; i++) {
            if ((this.globalParameters.resourcesReservations[i] != null) && (this.globalParameters.resourcesReservations[i] != 'undefined')) {
                if (this.globalParameters.resourcesReservations[i].status) {
                    status = this.globalParameters.resourcesReservations[i].status;
                }
                else {
                    status = "";
                }
                layerText += '<tr class="dataRow"><td>' +
                this.globalParameters.resourcesReservations[i].resource_id +
                '</td><td>' +
                ABRV_convert12H(this.globalParameters.resourcesReservations[i].starttime) +
                '</td><td>' +
                ABRV_convert12H(this.globalParameters.resourcesReservations[i].endtime) +
                '</td><td>' +
                this.globalParameters.resourcesReservations[i].quantity +
                '</td><td>' +
                status +
                '</td></tr>';
                disabledNext = true;
            }
        }
        
        layerText += '</tbody></table>';
        
        writeLayer('resourcesDetail', '', layerText);
        
        //Always show confirm button if come from edit resource
        if (typeof this.globalParameters.resourcesReservations != "undefined") {
            if (this.globalParameters.resourcesReservations.length > 0) {
                if (this.globalParameters.resourcesReservations[0].rsres_id != null && this.globalParameters.resourcesReservations[0].rsres_id > "") {
                    disabledNext = true;
                }
            }
        }
        
        //Enable/Disabled the confirm and finish button
        this.confirmResReservationsPanel.actions.get("finish").enable(disabledNext);
        //document.getElementById("btnFinish").disabled = !disabledNext;
    },
    
    /**
     * This function is called when clicking in the Cancel button
     */
    confirmResReservationsPanel_onCancel: function(){
        var reservation = this.globalParameters.reservation;
        
        //Show a confirm window to the user to ensure that the user wants to cancel the process
        //In case affirmative, clear all the JSObjects
        if (confirm(getMessage("msgBackExit"))) {
            //Clear all the JSObjects
            this.globalParameters.timelineData = null;
            this.globalParameters.user = null;
            this.globalParameters.roomReservation = null;
            this.globalParameters.reservation = null;
            this.globalParameters.resourcesReservations = null;
            this.globalParameters.resourcesStd = null;
            
            //Redirect to Define Criteria, myReservations tab page
            this.mainTabs.hideTab('resourceReservationConfirm');
            this.mainTabs.showTab('resourcesReservation', true);
            this.mainTabs.selectTab('my-reservations');
        }
    },
    
    /**
     * This function is called when clicking in the Change Resource/Date button
     */
    confirmResReservationsPanel_onChange: function(){
        var user = this.globalParameters.user;
        var reservation = this.globalParameters.reservation;
        var existGroupHOST = false;
        //Guo added 2008-07-17
        var resourceConflicts = this.globalParameters.resourceConflicts;
        var follow = false;
        
        //Guo added 2008-07-17
        //Any conflicts resolved will be discarded when user goes back to the select resource form 
        //So in case any resource conflicts have been detected (resourceconflicts.length > 0), 
        //the user should be warned conflict resolutions will be lost.
        if (resourceConflicts.length > 0) {
            //This function must show a confirm window to the user: user must be warned that all 
            //resolved conflicts will be lost when proceeding with this command
            follow = confirm(getMessage("msgGoBack"));
        }
        
        if (follow || !(resourceConflicts.length > 0)) {
        
            //The system must get from the form the introduced contact information, 
            //department and division, reservation name and comments
            reservation.phone = this.confirmResReservationsPanel.getFieldValue('reserve.phone');
            reservation.email = this.confirmResReservationsPanel.getFieldValue('reserve.email');
            reservation.comments = this.confirmResReservationsPanel.getFieldValue('reserve.comments');
            reservation.reservation_name = this.confirmResReservationsPanel.getFieldValue('reserve.reservation_name');
            //Added by ZY, 2008-06-20.
            reservation.bl_id = this.confirmResReservationsPanel.getFieldValue('reserve_rs.bl_id');
            reservation.fl_id = this.confirmResReservationsPanel.getFieldValue('reserve_rs.fl_id');
            reservation.rm_id = this.confirmResReservationsPanel.getFieldValue('reserve_rs.rm_id');
            
            if (ABRV_isMemberOfGroup(user, 'RESERVATION HOST')) {
                existGroupHOST = true;
            }
            
            //If the connected user doesn't belong to the 'RESERVATION HOST' security group
            if (!existGroupHOST) {
                reservation.user_requested_by = this.confirmResReservationsPanel.getFieldValue('reserve.user_requested_by');
                reservation.user_requested_for = this.confirmResReservationsPanel.getFieldValue('reserve.user_requested_for');
                reservation.dv_id = this.confirmResReservationsPanel.getFieldValue('reserve.dv_id');
                reservation.dp_id = this.confirmResReservationsPanel.getFieldValue('reserve.dp_id');
            }
            
            //Guo added 2007-07-17
            var existedResourcesReservations = new Array();
            for (var i = 0; i < this.globalParameters.resourcesReservations.length; i++) {
                if (this.globalParameters.resourcesReservations[i].rsres_id) {
                    existedResourcesReservations.push(this.globalParameters.resourcesReservations[i]);
                }
            }
            this.globalParameters.resourcesReservations.length = 0;
            for (var i = 0; i < existedResourcesReservations.length; i++) {
                this.globalParameters.resourcesReservations.push(existedResourcesReservations[i]);
            }
            
            this.globalParameters.timelineData = null;
            //Guo added 2007-07-17
            this.globalParameters.resourceConflicts = null;
            //Redirect to Define Criteria, select Room tab page
            this.mainTabs.hideTab('resourceReservationConfirm');
            this.mainTabs.showTab('resourcesReservation');
            this.mainTabs.selectTab('resourcesReservation');
        }
    },
    
    /**
     * This function is called when clicking in the Confirm and Finish button
     */
    confirmResReservationsPanel_onFinish: function(){
        //PC KB item 3015654
        var bl_id = this.confirmResReservationsPanel.getFieldValue("reserve_rs.bl_id");
        var fl_id = this.confirmResReservationsPanel.getFieldValue("reserve_rs.fl_id");
        var rm_id = this.confirmResReservationsPanel.getFieldValue("reserve_rs.rm_id");
        var user_requested_for = this.confirmResReservationsPanel.getFieldValue("reserve.user_requested_for");
        var user_requested_by = this.confirmResReservationsPanel.getFieldValue("reserve.user_requested_by");
        var reservation_name = this.confirmResReservationsPanel.getFieldValue("reserve.reservation_name"); //Added by Keven 2008-08-01
        //PC KB item 3015654
        if (user_requested_for == "" || user_requested_by == "" || bl_id == "" || fl_id == "" || rm_id == "" || reservation_name == "") {
            View.showMessage(getMessage("warning_message"));
            
            //mouse focus
            if (user_requested_by == "") 
                this.confirmResReservationsPanel.getFieldElement("reserve.user_requested_by").focus();
            else 
                if (user_requested_for == "") 
                    this.confirmResReservationsPanel.getFieldElement("reserve.user_requested_for").focus();
                //PC KB item 3015654
                else 
                    if (bl_id == "") 
                        this.confirmResReservationsPanel.getFieldElement("reserve_rs.bl_id").focus();
                    else 
                        if (fl_id == "") 
                            this.confirmResReservationsPanel.getFieldElement("reserve_rs.fl_id").focus();
                        else 
                            if (rm_id == "") 
                                this.confirmResReservationsPanel.getFieldElement("reserve_rs.rm_id").focus();
                            else 
                                this.confirmResReservationsPanel.getFieldElement("reserve.reservation_name").focus();
            
            return;
        }
        else {
            var user = View.user;
            var reservation = this.globalParameters.reservation;
            //var resourcesReservationsArray = new Array();
            var existGroupHOST = false;
            
            //Check that we have the additional information needed (requested_by and requested_for)
            if (valueExistsNotEmpty(user_requested_by) && valueExistsNotEmpty(user_requested_for)) {
                //Update the JSObjects
                reservation.phone = this.confirmResReservationsPanel.getFieldValue('reserve.phone');
                reservation.email = this.confirmResReservationsPanel.getFieldValue('reserve.email');
                reservation.reservation_name = reservation_name;
                reservation.comments = this.confirmResReservationsPanel.getFieldValue('reserve.comments');
                
                if (ABRV_isMemberOfGroup(user, 'RESERVATION HOST')) {
                    existGroupHOST = true;
                }
                
                //If the connected user doesn't belong to the 'RESERVATION HOST' security group...
                if (!existGroupHOST) {
                    reservation.user_requested_by = user_requested_by;
                    reservation.user_requested_for = user_requested_for;
                    reservation.dv_id = this.confirmResReservationsPanel.getFieldValue('reserve.dv_id');
                    reservation.dp_id = this.confirmResReservationsPanel.getFieldValue('reserve.dp_id');
                }
                
                //PC KB item 3015654
                reservation.resource_bl_id = bl_id;
                reservation.resource_fl_id = fl_id;
                reservation.resource_rm_id = rm_id;
                
                //getResourcesReservationsArray(resourcesReservationsArray);
                var resourceReservations = this.globalParameters.resourcesReservations;//start guo added
                for (var i = 0; i < resourceReservations.length; i++) {
                    resourceReservations[i].bl_id = reservation.resource_bl_id;
                    resourceReservations[i].fl_id = reservation.resource_fl_id;
                    resourceReservations[i].rm_id = reservation.resource_rm_id;
                }//end guo added
                if (!valueExists(this.globalParameters.roomConflicts)) {
                    this.globalParameters.roomConflicts = [];
                }
                //Invokes addRoomReservation WFR to save the reservation records
                // PC 2018035 Added user to check resource permissions on times
                var objectsToSave = [this.globalParameters.reservation, this.globalParameters.roomReservation, resourceReservations, this.globalParameters.roomConflicts, this.globalParameters.resourceConflicts, View.user];//guo changed
                var reservations = toJSON(objectsToSave);
                
				try{
					var results = Workflow.callMethod("AbWorkplaceReservations-resource-saveResourceReservations", reservations);
					this.resultaddResourcesReservation1(results);
				}catch(e){
					Workflow.handleError(e);
				}
            }
            else 
                View.showMessage(getMessage('fillMandatoryFieldsError'));
        }
    },
    
    /**
     *
     * @param {Object} result
     */
    resultaddResourcesReservation1: function(result){
        if (result.code == 'executed') {
			//two possible errors: email notification error and conflicts error
			if(result.message != "OK"){
                //It is possible that while the user was selecting a resource or resolving any conflicts, 
                //another user reserved the room or resource that would create a new conflict. The WFR checks this.
                //If a new conflict is found, user is warned, leaving no other option than to go back to the select resources page and start all over again.
				alert(result.message);
			}

			//kb#3036675: remove useless code related to email notificaton error
			//var reservationRecords = eval("(" + result.jsonExpression + ")");
			//if (valueExists(reservationRecords.messageEmail) && reservationRecords.messageEmail != '') {
			//   View.showMessage(reservationRecords.messageEmail);
			//}
			
			this.globalParameters.timelineData = null;
			this.globalParameters.resourcesReservations = null;
			this.globalParameters.resourcesStd = null;
			
			this.globalParameters.reservation = null;//start guo added
			this.globalParameters.roomReservation = null;
			this.globalParameters.resourcesReservations = null;
			this.globalParameters.resourceConflicts = null;
			this.globalParameters.roomConflicts = null;//end guo added
			//Redirect to Define Criteria, myReservations tab page
			this.mainTabs.hideTab('resourceReservationConfirm');
			this.mainTabs.showTab('resourcesReservation', true);
			this.mainTabs.selectTab('my-reservations');
        }
        else {
			View.showMessage(result.message);
        }
    }
})

/**
 * this method put reserves in grid and open pop-up
 */
function onViewAllRecurring(){
    var reservation = confirmResReservController.globalParameters.reservation;
    var resourceConflicts = confirmResReservController.globalParameters.resourceConflicts;
    var resourceReservations = confirmResReservController.globalParameters.resourcesReservations;
    var rowArray = new Array();
    
    //From the JSObjects Reservation and roomConflicts we present a view of 
    //the reservations for all the dates in the recurringrule
    for (var i = 0; i < reservation.date_start.length; i++) {
        //Guo changed 2008-08-27 to solve KB3019344
        for (var j = 0; j < resourceReservations.length; j++) {
            var conflictfound = false;
            for (var k = 0; k < resourceConflicts.length; k++) {
                if (resourceConflicts[k].original_date_start == reservation.date_start[i] &&
                resourceConflicts[k].original_time_start == resourceReservations[j].starttime &&
                resourceConflicts[k].original_time_end == resourceReservations[j].endtime &&
                resourceConflicts[k].resource_id == resourceReservations[j].resource_id &&
                resourceConflicts[k].quantity == resourceReservations[j].quantity) {
                    conflictfound = true;
                    if (resourceConflicts[k].status == 'Resolved') {
                        var row = new Object();
                        row['col1'] = resourceConflicts[k].date_start;
                        row['col2'] = resourceConflicts[k].resource_id;
                        row['col3'] = resourceConflicts[k].time_start;
                        row['col4'] = resourceConflicts[k].time_end;
                        row['col5'] = rresourceConflicts[k].quantity;
                        rowArray.push(row);
                        break;
                    }
                }
            }
            if (!conflictfound) {
                // form record objects and then toJSON them
                var row = new Object();
                row['col1'] = reservation.date_start[i];
                row['col2'] = resourceReservations[j].resource_id;
                row['col3'] = resourceReservations[j].starttime;//time_start;
                row['col4'] = resourceReservations[j].endtime;//time_end;
                row['col5'] = resourceReservations[j].quantity;
                rowArray.push(row);
            }
        }
    }
    
    confirmResReservController.rows = rowArray;
    
    View.openDialog('ab-rr-resource-viewallrecurring.axvw');
}

/**
 * Method to insert a panel into the view.
 * @param {Object} ID
 * @param {Object} parentID
 * @param {Object} sText
 */
function writeLayer(ID, parentID, sText){
    if (document.layers) {
		var layerApp;
		
		if (parentID) {
			layerApp = eval('document.' + parentID + '.document.' + ID + '.document');
		}
		else {
			layerApp = document.layers[ID].document;
		}
		
		layerApp.open();
		layerApp.write(sText);
		layerApp.close();
	}
	else 
		if ((parseInt(navigator.appVersion) >= 5) && (navigator.appName == "Netscape")) {
			document.getElementById(ID).innerHTML = sText;
		}
		else 
			if (document.all) {
				document.all[ID].innerHTML = sText;
			}
}

