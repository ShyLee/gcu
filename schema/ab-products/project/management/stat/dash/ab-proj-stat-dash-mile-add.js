var projStatDashMileAddController = View.createController('projStatDashMileAdd', {

	projStatDashMileAdd_form1_onSave: function() {
		var valid = true;
		if (!this.projStatDashMileAdd_form1.save() | !this.projStatDashMileAdd_form2.save() | !this.projStatDashMileAdd_form3.save()
			| !this.projStatDashMileAdd_form4.save() | !this.projStatDashMileAdd_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatDashMile_grid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});