
/**
 * Save the form, especially the rm.reservale, since other field can't be changed.
 */
function onSaveRoom() {
	var panel = View.panels.get("rm_form");	
	
	if (panel.getFieldValue('rm.bl_id') != '' 
			&& panel.getFieldValue('rm.fl_id') != '' 
			&& panel.getFieldValue('rm.rm_id') != '' 
			&& panel.getFieldValue('rm.reservable') != ''){
						
		var record = ABRV_getDataRecord(panel);
		
		try{
			var results =  Workflow.callMethod('AbWorkplaceReservations-common-saveRoomOverride', record);
			handleResult(results);
		}catch(e){
			Workflow.handleError(e);
		}
	} else {
		View.showMessage(getMessage('mandatory'));
	}
}

/**
 * Handling the WFR result.
 * 
 * @param {Object} result
 */
function handleResult(result) {
    if (result.code != 'executed') {
        View.showMessage(result.message);
    }
}
