var projStatDashChgController = View.createController('projStatDashChg', {

	projStatDashChg_form1_onSave: function() {
		var valid = true;
		if (!this.projStatDashChg_form1.save() | !this.projStatDashChg_form2.save() | !this.projStatDashChg_form3.save()
			| !this.projStatDashChg_form4.save() | !this.projStatDashChg_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatDashCps_cps').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});