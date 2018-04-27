/**
 * this common js used by three sub tab view in my reservations view
 * and these methods were in ab-rr-common.js original
 * 		1 ab-rr-my-reservations-info.axvw
 * 		2 ab-rr-my-reservations-rm.axvw
 * 		3 ab-rr-my-reservations-rs.axvw
 */


/**
 * Load all the JSObjects with the needed information (the existing information into the database of the
 * reservation selected to edit) and invokes getReservationInfo WFR
 * @param {Object} row -- Data row to edit
 * @param {Object} reservationType -- Reserve type, that is, "reserve","room" or "resource"
 */
function ABRV_editNewReservation(row, reservationType){
    var reservationRecord = ABRV_getPKRecordForSelectedRow(row.panel.id,row);
    var user = ABRV_getUserInfo();
    var objectsToSave = [user];
    var jsonExpression = toJSON(objectsToSave);
    
	var res_id = reservationRecord
    var jsonUser = jsonExpression;
    
	try{
		var results = Workflow.callMethod("AbWorkplaceReservations-room-getReservationInfo", res_id, jsonUser)
		ABRV_setReservationInfo(results);
	}catch(e){
		Workflow.handleError(e);
	}
}

function ABRV_setReservationInfo(result){

    // the tabs variable should refer to the top-level tabs frame
    var mainTabs = View.getControl('', 'createEditResevationTabs');
    var globalParameters = View.getOpenerView().controllers.get(0);
    
    if (result.code == "executed") {
        if (result.message != "OK") {
			View.showMessage(result.message);
		}
        
        //All the needed information (existing values for edit existing reservation) is loaded into the JSObjects
        var GeneralInfo = eval("(" + result.jsonExpression + ")");
        
        GeneralInfo.constructor();
        
        globalParameters.reservation = GeneralInfo.reservation;
        globalParameters.roomReservation = GeneralInfo.roomReservation;
        globalParameters.resourcesReservations = GeneralInfo.resourcesReservations;
        
        // Check if the user wants to edit an only room reservation, or an only resources 
        // reservation to redirect him to the correct form as follows:
        if ((GeneralInfo.roomReservation.rmres_id != null) && (GeneralInfo.roomReservation.rmres_id != "")) {
			//use this flag for refreshing the current detail tab after edit the reservation
			globalParameters.isReturnFromEditTab = true;
			//Redirect the user to the Define Criteria, Select Room page
            mainTabs.selectTab("roomReservation");
        }
        else {
            if ((GeneralInfo.resourcesReservations.length > 0) && (GeneralInfo.resourcesReservations[0].rsres_id != "")) {
				//use this flag for refreshing the current detail tab after edit the reservation
				globalParameters.isReturnFromEditTab = true;
				//Redirect the user to the Define Criteria, Select Resources page
                mainTabs.selectTab("resourcesReservation");
            }
        }
    }
    else {
        View.showMessage(result.message);
    }
}

function ABRV_getRecordsForAllRows(gridPanelId){
    var gridPanel = View.panels.get(gridPanelId);
    var res_pk_list = '<userInputRecordsFlag><records>';
    gridPanel.gridRows.each(function(row){
        var row1 = new Object();
        row1 = row;
        if (!row1.record['reserve.res_id.key']) {
            row1.record['reserve.res_id.key'] = row1.record['reserve.res_id'];
        }
        res_pk_list += gridPanel.getPrimaryKeyRecordForRow(row1.record);
    })
    res_pk_list += '</records></userInputRecordsFlag>';
    return res_pk_list;
}
/**
 * Get the pk record for xml format like
 * <record reserve.res_id="61" reserve_rm.rmres_id="47"><keys reserve.res_id="61" reserve_rm.rmres_id="47"/></record>
 * used by getReservationInfo WFR
 * @param {Object} gridPanelId
 * @param {Object} row
 */
function ABRV_getPKRecordForSelectedRow(gridPanelId,row){
	var gridPanel = View.getControl('',gridPanelId);
    var row1 = new Object();
    row1 = row;
    if (!row1.record['reserve.res_id.key']) {
        row1.record['reserve.res_id.key'] = row1.record['reserve.res_id'];
    }
    var res_pk_list = gridPanel.getPrimaryKeyRecordForRow(row1.record);
    return res_pk_list;
}

/**
 * To view comments in my reservation tab
 *
 * @param {Object} tableName -- table name of the comments field.(reserve/reserve_rm/reserve_rs)
 * @param {Object} pkeys --JSON Object of primary keys value of data row to view
 */
function ABRV_viewComments(tableName, pkeys){

    var rowPKs = "";
    switch (tableName) {
        case 'reserve':
            rowPKs = pkeys['reserve.res_id'];
            rowPKs = "reserve.res_id='" + rowPKs + "'";
            break;
        case 'reserve_rm':
            rowPKs = pkeys['reserve_rm.rmres_id'];
            rowPKs = "reserve_rm.rmres_id='" + rowPKs + "'";
            break;
        case 'reserve_rs':
            rowPKs = pkeys['reserve_rs.rsres_id'];
            rowPKs = "reserve_rs.rsres_id='" + rowPKs + "'";
            break;
    }
    
    var fieldName = tableName + '.comments';
    var parameters = {
        tableName: tableName,
        fieldNames: toJSON([fieldName]),
        restriction: rowPKs
    };
    var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    var commnets = '';
    if (result.code == 'executed') {
        commnets = result.data.records[0][fieldName];
    }
    var mainTabs = View.getControl('', 'createEditResevationTabs');
    mainTabs.comments = commnets;
	//solved kb3025065, use command to openDialog
	/*
    View.openDialog("ab-rr-content-my-reservation-comments.axvw", null, true,{
            width: 780,
            height: 400,
            closeButton: false
    });
    */
}

/**
 * get current user by AbCommonHandlers-CommandHandlers-getUserInfo
 */
function ABRV_getUserInfo(){
    var userInfo = null;
    var result = Workflow.runRuleAndReturnResult('AbCommonResources-getUser', {});
    if (result.code == 'executed') {
        return userInfo = eval("(" + result.jsonExpression + ")");
    }
    else {
        alert(result.code + " :: " + result.message);
    }
    return userInfo;
}
