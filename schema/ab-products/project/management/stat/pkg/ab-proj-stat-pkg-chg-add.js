var projStatPkgChgAddController = View.createController('projStatPkgChgAdd', {

	projStatPkgChgAdd_form1_onSave: function() {
		var valid = true;
		if (!this.projStatPkgChgAdd_form1.save() | !this.projStatPkgChgAdd_form2.save() | !this.projStatPkgChgAdd_form3.save()
			| !this.projStatPkgChgAdd_form4.save() | !this.projStatPkgChgAdd_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatPkgChgGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});