
/**
 * It calls WFR when user click the "Reject" button.
 * 
 * the parameters 
 * 	<pre>
 * 		abRCARVController.res_pk_list,
 * 		abRCARVController.res_pk_list
 * 	</pre>
 *  are set when the user click the button "Reject" on the view 
 *  ab-rr-approve-rersources.axvw / ab-rr-approve-rooms.axvw.
 *  
 * @see ab-rr-content-approve-resources-room.js#onRejectReservation()
 */
function onReject(){
	var abRCARVController = View.getOpenerView().controllers.get("abRrContentApproveRVResourcesRoomController");
	var panel = View.getControl('', 'add_comment_form');
	
	var res_type = abRCARVController.res_type;
	var res_pk_list = abRCARVController.res_pk_list;
	var comments = panel.getFieldValue("reserve.comments");

	try{
		var results =  Workflow.callMethod("AbWorkplaceReservations-common-rejectReservation", res_type, res_pk_list, comments);
		setRejectReservation(results); 
	}catch(e){
		Workflow.handleError(e);
	}
}

/**
 * Close this Dialog when user click "Cancel" button.
 */
function onCancel(){
	View.getOpenerView().closeDialog();		
}

/**
 * Handling the WFR for reject a reservation
 *  
 * @param {Object} result, the value of the corresponding WFR's return.
 */
function setRejectReservation(result) {
	var openerView = View.getOpenerView();
	if (result.code == 'executed') {
		if (result.message != "OK") {
    		alert(result.message);
    		openerView.closeDialog();
    	} else {
    		openerView.closeDialog();		
    	}	
		openerView.controllers.get("abRrContentApproveRVController").selectedPanel.refresh();
   } else {
		alert(result.message);
		openerView.closeDialog();
	}
}