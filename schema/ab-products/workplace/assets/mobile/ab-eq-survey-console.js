
var controller = View.createController('eqSurveyController', {
	afterViewLoad: function() {	
		//do not show any record
		this.eqSurveyTasksGrid_grid.refresh("eq_audit.survey_id IS NULL");
				
		this.eqSurveyGrid_grid.addEventListener('onMultipleSelectionChange', onEqSurveySelectionChange);
       
   	}
});

function onEqSurveySelectionChange(row) {

	var rows = View.panels.get('eqSurveyGrid_grid').getSelectedRows();
	var restriction = ' eq_audit.survey_id IN ('
	for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if(i>0)
        	restriction += ",";
        restriction = restriction + makeLiteral(row["survey.survey_id"]);
    }

	if(rows.length >0)
		restriction += ") ";
	else
		restriction = "eq_audit.survey_id IS NULL";

	var grid = View.panels.get('eqSurveyTasksGrid_grid');
	
	grid.refresh(restriction);
	
}

function onUpdateSurvey() {
	var form = View.panels.get('eqSurveyDetailForm_form');
	var survey_id = form.getFieldValue('survey.survey_id');
	var survey_date = form.getFieldValue('survey.survey_date');
	var performed_by = form.getFieldValue('survey.em_id');
	var description = form.getFieldValue('survey.description');
	var status = form.getFieldValue('survey.status');
	
	if(survey_id != '') {
		var performed_by = form.fields.get('survey.em_id').dom.value;
		var records = View.dataSources.get("eqSurvey_ds").getRecords("EXISTS (SELECT 1 FROM em, afm_users WHERE em.email = afm_users.email AND em.em_id = " + makeLiteral(performed_by) + ")");
   	    if(records==null || records.length<1){
   	    	form.validationResult.valid = false;
   	    	form.validationResult.message = getMessage('errorInvalidEmployee1') + "[" + performed_by +"]. " + getMessage('errorInvalidEmployee2');
   	    	form.validationResult.invalidFields['survey.em_id'] = "";
   	    	form.displayValidationResult();
   	    	return false;
   	    } else {
   	    	var result = null;
	   	    try {
	 			result = Workflow.callMethod('AbAssetManagement-AssetMobileService-updateSurvey', survey_id, survey_date,
						performed_by, description, status);
	       	}catch (e) {
	     		if (e.code=='ruleFailed'){
	       		  View.showMessage(e.message);
	       		}else{
	     		  Workflow.handleError(e);
	     		}
	     		return;
	       	}
   	    	if (result.code == 'executed') {
   	    		View.panels.get('eqSurveyGrid_grid').refresh();
   	    		View.panels.get('eqSurveyTasksGrid_grid').refresh();
   	    	}
   	    }
    }
}

function onCloseSurvey(row) {
	
	var record = row.row.getRecord();
    var surveyId = record.getValue('survey.survey_id');
    View.confirm(getMessage('closeActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
			 var result = null;
			 try {
				 result = Workflow.callMethod('AbAssetManagement-AssetMobileService-closeSurvey', surveyId);
			 }catch (e) {
			   	if (e.code=='ruleFailed'){
			   	  View.showMessage(e.message);
			   	}else{
			   	  Workflow.handleError(e);
			   	}
			   	return;
			 }
			 
			 if (result.code == 'executed') {
				View.panels.get('eqSurveyGrid_grid').refresh();
				View.panels.get('eqSurveyTasksGrid_grid').refresh();
			 }
		}
	});
}

function onPrintSurvey(row) {
	var record = row.row.getRecord();
    var surveyId = record.getValue('survey.survey_id');
    if(!valueExistsNotEmpty(surveyId)){
		return;
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('survey.survey_id', makeLiteral(surveyId),'=');
	View.openPaginatedReportDialog('ab-eq-survey-pgrp.axvw',{'eqSurvey_ds':restriction});
}

function onDeleteSurvey(row) {
	var record = row.row.getRecord();
    var surveyId = record.getValue('survey.survey_id');
    View.confirm(getMessage('deleteActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
	    	var result = null;
		   	try {
		   		result = Workflow.callMethod('AbAssetManagement-AssetMobileService-deleteSurvey', surveyId);
		    }catch (e) {
		    	if (e.code=='ruleFailed'){
		       	  View.showMessage(e.message);
		       	}else{
		     	  Workflow.handleError(e);
		     	}
		     	return;
		    }
			
		    if (result.code == 'executed') {
				View.panels.get('eqSurveyGrid_grid').refresh();
				View.panels.get('eqSurveyTasksGrid_grid').refresh();
			}
		}
	});

}

function makeLiteral(value){
	return "'" + value.replace(/\'/g, "''") +"'";
}