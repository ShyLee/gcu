var controller = View.createController('eqNewSurveyController', {
	
	afterViewLoad: function() {
		
		//hide all the buttons at title bar.
		if(Ext.get("alterButton")!=null)
			Ext.get("alterButton").dom.hidden = true;
	
		if(Ext.get("favoritesButton")!=null)
			Ext.get("favoritesButton").dom.hidden = true;
		
		if(Ext.get("printButton")!=null)
			Ext.get("printButton").dom.hidden = true;
		
		if(Ext.get("emailButton")!=null)
			Ext.get("emailButton").dom.hidden = true;
		
		if(Ext.get("loggingButton")!=null)
			Ext.get("loggingButton").dom.hidden = true;
		
	}
});

function onCreateSurvey() {

	var surveyForm = View.panels.get('eqNewSurvey_form');
	
	var survey_id = surveyForm.getFieldValue('survey.survey_id');
	var performed_by = surveyForm.getFieldValue('survey.em_id');
	var survey_date = surveyForm.getFieldValue('survey.survey_date');
	var description = surveyForm.getFieldValue('survey.description');
	var bl_id = surveyForm.getFieldValue('survey.bl_id');
	var fl_id = surveyForm.getFieldValue('survey.fl_id');
	var dv_id = surveyForm.getFieldValue('survey.dv_id');
	var dp_id = surveyForm.getFieldValue('survey.dp_id');
	var eq_std = surveyForm.getFieldValue('survey.eq_std');

	if(survey_id != '') {
		var performed_by = surveyForm.fields.get('survey.em_id').dom.value;
		var records = View.dataSources.get("eqNewSurvey_ds").getRecords("EXISTS (SELECT 1 FROM em, afm_users WHERE em.email = afm_users.email AND em.em_id = " + makeLiteral(performed_by) + ")");
   	    if(records==null || records.length<1){
   	    	surveyForm.validationResult.valid = false;
   	    	surveyForm.validationResult.message = getMessage('errorInvalidEmployee1') + "[" + performed_by +"]. " + getMessage('errorInvalidEmployee2');
   	    	surveyForm.validationResult.invalidFields['survey.em_id'] = "";
   	    	surveyForm.displayValidationResult();
   	    	return false;
   	    } else {
   	    	var result = null;
		   	try {
			   	result = Workflow.callMethod('AbAssetManagement-AssetMobileService-createSurvey', survey_id, survey_date,
						performed_by, description);
	       	}catch (e) {
	     		if (e.code=='ruleFailed'){
	       		  View.showMessage(e.message);
	       		}else{
	     		  Workflow.handleError(e);
	     		}
	     		return;
	       	}	 
			if (result.code == 'executed') {
				//creatSurvey returns the user name
				var user_name = result.message;
				try {
					result = Workflow.callMethod('AbAssetManagement-AssetMobileService-importEquipmentToSurvey', survey_id, bl_id, fl_id, dv_id, dp_id, user_name, eq_std);
			    }catch (e) {
			    	if (e.code=='ruleFailed'){
			    		View.showMessage(e.message);
			    	}else{
			    		Workflow.handleError(e);
			     	}
			     	return;
			    }	
			       	
			    if (result.code == 'executed') {
					 //if no record exists in eq table, ask user if they like to create a new survey without any records in eq_audit table.
					 if(result.value<1){
						 View.confirm(getMessage('noEqRecordsConfirmMessage'), function(button) {
						    if (button == 'yes') {
						    	 // new survey is created, close the dialog
						    	 View.getOpenerView().panels.get('eqSurveyGrid_grid').refresh();
						    	 //clear the task grid
						    	 View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh("1!=1");
								 View.getOpenerView().closeDialog();
							} else {
								// delete the new survey, 
								try {
									result = Workflow.callMethod('AbAssetManagement-AssetMobileService-deleteSurvey', survey_id);
							    }catch (e) {
							    	if (e.code=='ruleFailed'){
							    		View.showMessage(e.message);
							    	}else{
							    		Workflow.handleError(e);
							     	}
							     	return;
							    }	
							    if (result.code == 'executed') {
									View.getOpenerView().panels.get('eqSurveyGrid_grid').refresh();
									//clear the task grid
									View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh("1!=1");
								}
							}
						});
					 } else {
						 View.getOpenerView().panels.get('eqSurveyGrid_grid').refresh();
						 //clear the task grid
						 View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh("1!=1");
		  				 View.getOpenerView().closeDialog();
					 }
				 }
			}
   	    }
    }

			
}


function makeLiteral(value){
	return "'" + value.replace(/\'/g, "''") +"'";
}