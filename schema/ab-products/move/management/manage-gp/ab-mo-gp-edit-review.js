

// On Approve a Group Move

function onAutoAproveMove() {
	var form = View.panels.items[0];
	var project_id = form.getFieldValue('project.project_id');

	try {
		Workflow.callMethod('AbMoveManagement-MoveService-autoApproveGroupMove',project_id);
		// hide the Issue button and change the project status to
		// Issued-In Process
		form.enableAction('issueButton', false);
		/*
		 * 04/15/2010 IOAN KB 3027046
		 */
		setStatusAddingOption(form, form.fields.get('project.status'), "Approved");
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}

function enableDisableIssueButton(){
	var panel = View.panels.get('form_abMoGroupEditReview_pr');
	
	if(View.taskInfo.processId == 'Move Scenario Planner') {
		panel.enableAction('issueButton', false);
	} else {
		var status = panel.getFieldValue('project.status');
		var enable = (status.slice(0,9) == 'Requested' && status != 'Requested-Rejected');
		panel.enableAction('issueButton', enable);
	}
}