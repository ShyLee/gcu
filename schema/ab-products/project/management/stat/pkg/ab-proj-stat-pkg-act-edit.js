var projStatPkgActEditController = View.createController('projStatPkgActEdit', {

	afterInitialDataFetch: function() {
		this.projStatPkgActEdit_form2.refresh(this.projStatPkgActEdit_form1.restriction);
		this.projStatPkgActEdit_form3.refresh(this.projStatPkgActEdit_form1.restriction);
		this.projStatPkgActEdit_form4.refresh(this.projStatPkgActEdit_form1.restriction);
		this.projStatPkgActEdit_form5.refresh(this.projStatPkgActEdit_form1.restriction);
	},
	
	projStatPkgActEdit_form1_onStopAction : function() {
		this.projStatPkgActEdit_form2.setFieldValue('activity_log.status', 'STOPPED');
		this.saveForms();
	},
	
	projStatPkgActEdit_form1_onCancelAction : function() {
		this.projStatPkgActEdit_form2.setFieldValue('activity_log.status', 'CANCELLED');
		this.saveForms();
	},
	
	projStatPkgActEdit_form1_onSave: function() {
		this.saveForms();
	},
	
	saveForms: function() {
		var valid = true;
		if (!this.projStatPkgActEdit_form1.save() | !this.projStatPkgActEdit_form2.save() | !this.projStatPkgActEdit_form3.save()
			| !this.projStatPkgActEdit_form4.save() | !this.projStatPkgActEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatPkgActGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});