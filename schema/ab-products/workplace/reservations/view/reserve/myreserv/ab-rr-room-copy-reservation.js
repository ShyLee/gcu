
var roomCopyReservController = View.createController("roomCopyReservController", {
	
	opener:null,
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterViewLoad: function(){
        this.onStart();
    },
    /**
     * it initialize the date_start with the present day.
     */
    onStart: function(){
        var dateObj = new Date();
        var day = dateObj.getDate();
        var month = dateObj.getMonth() + 1;
        var year = dateObj.getFullYear();
        
        var ISODate = year + "-" + month + "-" + day;
        this.dateStartPanel.setFieldValue("reserve_rm.date_start", ISODate);
    },
    /**
     * it call to getReservationInfo wfr to get JSON Object
     */
    copyReservationPanel_onSelect: function(){
		this.opener = View.getOpenerView().controllers.get("myReservInfoController");
        var reservationRecord = this.opener.detailstabs.reservationRecord;
        //Get the default console values for the user(case of New reservation)
		var user = ABRV_getUserInfo();
        var objectsToSave = [user];
        var jsonExpression = toJSON(objectsToSave);
        
        var res_id = reservationRecord;
        var jsonUser = jsonExpression;
		
		try{
			var results = Workflow.callMethod("AbWorkplaceReservations-room-getReservationInfo", res_id, jsonUser)
			setReservationInfo(results);
		}catch(e){
			Workflow.handleError(e);
		}
    }
});

/**
 * It get the reserve's values to copy
 * @param {Object} result
 */
function setReservationInfo(result){

    if (result.code == "executed") {
        if (result.message != "OK") 
            View.showMessage(result.message);
        
        var GeneralInfo = eval("(" + result.jsonExpression + ")");
        var wantContinue = true;
        
        var isOnlyResourceReservation = true;
        if ((GeneralInfo.roomReservation) && (GeneralInfo.roomReservation.rmres_id)) {
            isOnlyResourceReservation = false;
        }
        
        //If the reservation selected is a resources only reservation
        if (('Cancelled' != GeneralInfo.reservation.status) && ('Rejected' != GeneralInfo.reservation.status)) {
            var wantContinue = confirm(getMessage("CopyReservation"));
            if (wantContinue) {
				var date_start = View.panels.get("dateStartPanel").getFieldValue("reserve_rm.date_start");
                // It initializes some variables like new
                GeneralInfo.reservation.res_id = "";
                GeneralInfo.reservation.date_start[0] = date_start;
                GeneralInfo.reservation.date_end = date_start;
                GeneralInfo.reservation.status = "Awaiting Approval";
                GeneralInfo.reservation.recurring_rule = "";
                GeneralInfo.roomReservation.rmres_id = "";
                GeneralInfo.roomReservation.res_id = "";
                GeneralInfo.roomReservation.date_start = date_start;
                
                var resource_bl_id = "";
                var resource_fl_id = "";
                var resource_rm_id = "";
                for (var i = 0; i < GeneralInfo.resourcesReservations.length; i++) {
                    GeneralInfo.resourcesReservations[i].rsres_id = "";
                    GeneralInfo.resourcesReservations[i].res_id = "";
                    GeneralInfo.resourcesReservations[i].date_start = date_start;
                    resource_bl_id = GeneralInfo.resourcesReservations[i].bl_id;
                    resource_fl_id = GeneralInfo.resourcesReservations[i].fl_id;
                    resource_rm_id = GeneralInfo.resourcesReservations[i].rm_id;
                }
                
                //Save the default reservation name if it's a new reservation
                var reservation_name = "";
                reservation_name += getMessage("reservationfor") + " ";
                reservation_name += GeneralInfo.reservation.bl_id + "-" + GeneralInfo.reservation.fl_id + "-";
                reservation_name += GeneralInfo.reservation.rm_id + " ";
                reservation_name += GeneralInfo.reservation.date_start[0] + " " + GeneralInfo.reservation.time_start;
                GeneralInfo.reservation.reservation_name = reservation_name;
                
                // and updates json
                var reservation = roomCopyReservController.opener.detailstabs.reservation;
                var roomReservation = roomCopyReservController.opener.detailstabs.roomReservation;
                var resourcesReservations = roomCopyReservController.opener.detailstabs.resourcesReservations;
                reservation = GeneralInfo.reservation;
                roomReservation = GeneralInfo.roomReservation;
                resourcesReservations = GeneralInfo.resourcesReservations;
                
                //assemble input parameter for addResourcesReservation WFR
                reservation.resource_bl_id = resource_bl_id;
                reservation.resource_fl_id = resource_fl_id;
                reservation.resource_rm_id = resource_rm_id;
                
				var user = ABRV_getUserInfo();
                //Invokes addRoomReservation WFR to save the reservation records
                var objectsToSave;
                
				if (isOnlyResourceReservation) {
                    // PC 2018035 Added user to check resource permissions on times
                    objectsToSave = [reservation, roomReservation, resourcesReservations, roomCopyReservController.opener.globalParameters.roomConflicts, roomCopyReservController.opener.globalParameters.resourceConflicts, user];
                }
                else {
                    objectsToSave = [user, reservation, roomReservation, resourcesReservations, roomCopyReservController.opener.globalParameters.roomConflicts, roomCopyReservController.opener.globalParameters.resourceConflicts];
                }

                var reservations = toJSON(objectsToSave);
                var notify = "yes";
                
                if (isOnlyResourceReservation) {
					try{
						var results = Workflow.callMethod("AbWorkplaceReservations-resource-saveResourceReservations", reservations);
						resultAddResourcesReservation(results);
					}catch(e){
						Workflow.handleError(e);
					}
                }
                else {
					try{
						var jsonReservation = reservations;
						var results = Workflow.callMethod("AbWorkplaceReservations-room-addRoomReservation", jsonReservation, notify);
						resultAddRoomReservation(results);
					}catch(e){
						Workflow.handleError(e);
					}
                }
            }
            else {
                //If the user doesnt want to continue with the process, clear JSObjects Reservation, 
                //roomReservation and resourceReservations, and exit this function
                roomCopyReservController.opener.detailstabs.reservation = null;
                roomCopyReservController.opener.detailstabs.roomReservation = null;
                roomCopyReservController.opener.detailstabs.resourcesReservations = null;
            }
        }
        else {
            View.showMessage(getMessage("CancelledNoCopy"));
        }
    }
    else {
        View.showMessage(result.message);
    }
}

// -------------------------------------------------------------------------------------------------
// Show if wfr is ok or not (this function is called from setReservationInfo function)
//
function resultAddRoomReservation(result){
    if (result.code == "executed") {
        if (result.jsonExpression == null) {
            View.showMessage(result.message);
        }
        else {
            var reserveInfo = eval("(" + result.jsonExpression + ")");
            var resId = reserveInfo.res_id;
            
            if (result.message != "OK") 
                alert(result.message);
            
            if (resId != "") {
                alert(getMessage("CopyOk"));
                
                //Close the form
                View.closeThisDialog();
                
                //Show by default the first editable report
                roomCopyReservController.opener.detailstabs.selectTab("info-reservations");
            }
        }
    }
    else {
        View.showMessage(result.message);
    }
}

function resultAddResourcesReservation(result){
    if (result.code == "executed") {
        if (result.message == "OK") {
            alert(getMessage("CopyOk"));
        }
        else {
            alert(result.message);
        }
		//Close the form
		View.closeThisDialog();
		
		//Show by default the first editable report
		roomCopyReservController.opener.detailstabs.selectTab("info-reservations");
    }
    else {
        View.showMessage(result.message);
    }
}
