var projStatDashMileEditController = View.createController('projStatDashMileEdit', {

	afterInitialDataFetch: function() {
		this.refreshFormPanels(this.projStatDashMileEdit_form1.restriction);
	},

	refreshFormPanels: function(restriction) {
		this.projStatDashMileEdit_form2.refresh(restriction);
		this.projStatDashMileEdit_form3.refresh(restriction);
		this.projStatDashMileEdit_form4.refresh(restriction);
		this.projStatDashMileEdit_form5.refresh(restriction);
	},
	
	projStatDashMileEdit_form1_onSave: function() {
		var valid = true;
		if (!this.projStatDashMileEdit_form1.save() | !this.projStatDashMileEdit_form2.save() | !this.projStatDashMileEdit_form3.save()
			| !this.projStatDashMileEdit_form4.save() | !this.projStatDashMileEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatDashMile_grid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});