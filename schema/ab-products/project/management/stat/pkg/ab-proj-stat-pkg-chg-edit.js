var projStatPkgChgEditController = View.createController('projStatPkgChgEdit', {

	afterInitialDataFetch: function() {
		this.projStatPkgChgEdit_form2.refresh(this.projStatPkgChgEdit_form1.restriction);
		this.projStatPkgChgEdit_form3.refresh(this.projStatPkgChgEdit_form1.restriction);
		this.projStatPkgChgEdit_form4.refresh(this.projStatPkgChgEdit_form1.restriction);
		this.projStatPkgChgEdit_form5.refresh(this.projStatPkgChgEdit_form1.restriction);
	},
	
	projStatPkgChgEdit_form1_onStopAction : function() {
		this.projStatPkgChgEdit_form2.setFieldValue('activity_log.status', 'STOPPED');
		this.saveForms();
	},
	
	projStatPkgChgEdit_form1_onCancelAction : function() {
		this.projStatPkgChgEdit_form2.setFieldValue('activity_log.status', 'CANCELLED');
		this.saveForms();
	},
	
	projStatPkgChgEdit_form1_onSave: function() {
		this.saveForms();
	},
	
	saveForms: function() {
		var valid = true;
		if (!this.projStatPkgChgEdit_form1.save() | !this.projStatPkgChgEdit_form2.save() | !this.projStatPkgChgEdit_form3.save()
			| !this.projStatPkgChgEdit_form4.save() | !this.projStatPkgChgEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatPkgChgGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});