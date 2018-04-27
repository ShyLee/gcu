var projStatDocsAddController = View.createController('projStatDocsAdd', {

	projStatDocsAddDtl_form1_onSave: function() {
		var valid = true;
		if (!this.projStatDocsAddDtl_form1.save() | !this.projStatDocsAddDtl_form2.save() | !this.projStatDocsAddDtl_form3.save()
			| !this.projStatDocsAddDtl_form4.save() | !this.projStatDocsAddDtl_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatDocsGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});