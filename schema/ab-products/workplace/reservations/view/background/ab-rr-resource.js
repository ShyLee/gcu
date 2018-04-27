
/**
 * This controller is used for ab-rr-resource.axvw view.
 * It is used as a container for holding parameters, and
 * other funcitons as common js functions exists.
 */
var abRrResourceController = View.createController('abRrResourceController', {
	timelineLimits: null
});

/**
 * This function is called when action_approval_expired field value changes
 */
function onChangeAction(){
	var panel = View.panels.get("resources_form");
	// If selected action when approval expired is Notify, enable the user to notify field, otherwise disable it
	if (panel.getFieldValue("resources.action_approval_expired") == 2) {
		panel.enableField("resources.user_approval_expired", true)
	} else {
		panel.enableField("resources.user_approval_expired", false);
		panel.setFieldValue("resources.user_approval_expired", '');		
	}
}


/**
 * This function is called after refreshing the edit form
 */
function resourcesFormAfterRefresh(){
	var panel = View.panels.get("resources_form");
	// If selected action when approval expired is Notify, enable the user to notify field, otherwise disable it
	if (panel.getFieldValue("resources.action_approval_expired") == 2) {
		panel.enableField("resources.user_approval_expired", true)
	} else {
		panel.enableField("resources.user_approval_expired", false)
	}
}

/**
 * it is called when user click the Save button.
 */
function onSaveForm() {
	var panel = View.panels.get("resources_form");
			
	if ((panel.getFieldValue('resources.day_start') != '') && (panel.getFieldValue('resources.day_end') != '')){
		if(panel.getFieldValue("resources.day_start") >= panel.getFieldValue("resources.day_end")){
			View.showMessage(getMessage('wrongTimeScopeError'));
		} else {
			//If the resource is Unique
			if (panel.getFieldValue('resources.resource_type') == 'Unique') {
				//Get the afm_activity_params value for TimelineStartTime and TimelineEndTime 
				if (!valueExists(abRrResourceController.timelineLimits)) {
					try{
						var results =  Workflow.callMethod("AbWorkplaceReservations-common-getTimelineLimits");
						setTimelineLimits(results);
					}catch(e){
						Workflow.handleError(e);
					}
				} else {
					checkCorrectValues()
				}
			} else {
				checkCorrectValues();
			}
		}
	} else {
		View.showMessage(getMessage('noTimeError'));
	}
	
}

/**
 * Handle WFR results
 * @param {Object} result
 */ 
function setTimelineLimits(result){
	if (result.code == "executed")
	{
		var timelineLimits = eval("(" + result.jsonExpression + ")");
		abRrResourceController.timelineLimits = timelineLimits;
		checkCorrectValues();
	} else {
		logError(result, 'AbWorkplaceReservations-getTimelineLimits');
	}
}

/**
 * Check the form before updating.
 */
function checkCorrectValues() {
	var errorfound = false;
	var form = View.panels.get('resources_form');
			
	if (form.getFieldValue("resources.resource_type") == 'Unique') {
		//Check the day_start and day_end are inside the timeline defined limits
		if ((ABRV_isMinnor(form.getFieldValue("resources.day_start"), abRrResourceController.timelineLimits.TimelineStartTime)) 
					|| (ABRV_isMinnor(abRrResourceController.timelineLimits.TimelineEndTime, form.getFieldValue("resources.day_end")))) {
			errorfound = true;
		}
	}
	
	if (errorfound) {
		View.showMessage(getMessage('outOfTimelineLimitsError'));
		return false;
	} 
	
	// If selected action when approval expired is Notify, then check the user selected the user to notify		
	if ((form.getFieldValue("resources.action_approval_expired") == 2) && (form.getFieldValue("resources.user_approval_expired") == '')) {
		View.showMessage(getMessage('noUserToNotifyError'));
		return false;
	} 
		
	//If the room has been set to non-reservable, check if it has any pending reservation
	if (form.getFieldValue('resources.reservable') == "0") {
		var xmlRecord = ABRV_getDataRecord(form);
		
		try{
			var results =  Workflow.callMethod('AbWorkplaceReservations-common-getNumberPendingResourceReservations', xmlRecord);
			setNumberPendingReservations(results);
		}catch(e){
			Workflow.handleError(e);
		}
	} else {
		 if (form.save()) {
	   		var panelResourceList = View.panels.get("resources_list");
			panelResourceList.refresh();		
	   	}
	}
}

/**
 * Handle the result from WFR
 * @param {Object} result
 */
function setNumberPendingReservations(result) {
	if (result.code != 'executed') {
    	View.showMessage(result.message);
		return false;
    } 
	var form = View.panels.get('resources_form');
	
	var pendingRes = eval("(" + result.jsonExpression + ")");
	if (pendingRes && pendingRes.numberPendingRes != '0'){
		View.confirm(
			getMessage('pendingReservationsError'),
			function(button) {
	            if (button == 'yes') {
	               if (form.save()) {
				   		var panelResourceList = View.panels.get("resources_list");
						panelResourceList.refresh();		
				   }
				}});
	} else {
		if (form.save()) {
	   		var panelResourceList = View.panels.get("resources_list");
			panelResourceList.refresh();		
	   	}
	}
}