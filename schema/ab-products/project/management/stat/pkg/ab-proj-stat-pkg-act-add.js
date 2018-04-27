var projStatPkgActAddController = View.createController('projStatPkgActAdd', {

	projStatPkgActAdd_form1_onSave: function() {
		var valid = true;
		if (!this.projStatPkgActAdd_form1.save() | !this.projStatPkgActAdd_form2.save() | !this.projStatPkgActAdd_form3.save()
			| !this.projStatPkgActAdd_form4.save() | !this.projStatPkgActAdd_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatPkgActGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});