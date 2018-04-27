
/**
 * The controller relate to ab-rr-content-approve-resources.axvw, and ab-rr-content-approve-rooms,
 * and It is main used for holding some parameters.
 */
var abRCARVResRoomController = View.createController('abRrContentApproveRVResourcesRoomController', {
});

/**
 * The method is called when user click the "Approve" button for approving room or approving resource.
 * 
 *  all selected rows will be coverted to the format 
 *  	<records>
 *  		<record key1='value1' key2='value2' ... >
 *  			<keys key1='value1' key2='value2' ... />
 *  		</record>
 *  	</records>,
 *  then as parameters be passed into WFR. 
 *  
 * @param {Object} res_type 'room'/'resource' according to different views.
 */
function onApproveReservation(res_type, panelId) {

	var panel = View.panels.get(panelId);	
	
	if (panel.getSelectedRows().length > 0) {
       
        var res_pk_list = "<records>"
        for (var i = 0; i < panel.getSelectedRows().length; i++) {
        	var row = panel.getSelectedRows()[i];
			res_pk_list += panel.getPrimaryKeyRecordForRow(row);
        }
        res_pk_list += "</records>";
		
		try{
			var results = Workflow.callMethod("AbWorkplaceReservations-common-approveReservation", res_type, res_pk_list);
			setApproveReservation(results)
		}catch(e){
			Workflow.handleError(e);
		}
    } else {
        View.showMessage(getMessage("seletedReservationCode"));
    }
}

/**
 * Handling the approve Reservation WFR 
 * @param {Object} result, the JSON object of WFR returns.
 */
function setApproveReservation(result) {
	if (result.code == "executed") {
    	if (result.message != "OK") {
			alert(result.message);
		} else {
			View.controllers.get("abRrContentApproveRVController").selectedPanel.refresh();
		}		
	} else {
		View.showMessage(result.message);
	}
}

/**
 * The function gets as parameter the reservation type involved ('room' or 'resource'), 
 * and the reservation identifier the user has selected to reject (a reserve_rm.rmres_id or 
 * reserve_rs.rsres_id value), and must try to reject it
 * @param {Object} res_type 'room'/'resource'
 */
function onRejectReservation(res_type, panelId) {
	var panel = View.panels.get(panelId);	
	var row = panel.rows[panel.selectedRowIndex];
	
	var res_pk_list = "<records>"
 	res_pk_list += panel.getPrimaryKeyRecordForRow(row);
    res_pk_list += "</records>";

	abRCARVResRoomController.res_pk_list = res_pk_list;
	abRCARVResRoomController.res_type = res_type;
	
	View.openDialog("ab-rr-content-approve-reject-comments.axvw", null, true);
}