/**
 * Controller for the form enable or disable actions example.
 * Zhang Yi
 */
var abExFormEnableFieldActionsCtrl = View.createController('abExFormEnableFieldActionsCtrl', {

	afterInitialDataFetch:function(){
		this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", false);
	},

	abExFormEnableFieldActions_form_onEnableFieldActions: function(){
		//enable select-value button
		this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", true);
		
		this.abExFormEnableFieldActions_form.actions.get("enableFieldActions").enable(false);
		this.abExFormEnableFieldActions_form.actions.get("disableFieldActions").enable(true);

		//set form title 
		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldActionEnabled") );
	},
	
	abExFormEnableFieldActions_form_onDisableFieldActions: function(){
		//disable select-value button
		this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", false);

		this.abExFormEnableFieldActions_form.actions.get("disableFieldActions").enable(false);
		this.abExFormEnableFieldActions_form.actions.get("enableFieldActions").enable(true);

		//set form title 
		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldActionDisabled") );
	}
});