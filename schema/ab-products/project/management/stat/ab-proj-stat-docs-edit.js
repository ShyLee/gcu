var projStatDocsEditController = View.createController('projStatDocsEdit', {

	afterInitialDataFetch: function() {
		this.refreshFormPanels(this.projStatDocsEdit_form1.restriction);
	},

	refreshFormPanels: function(restriction) {
		this.projStatDocsEdit_form2.refresh(restriction);
		this.projStatDocsEdit_form3.refresh(restriction);
		this.projStatDocsEdit_form4.refresh(restriction);
		this.projStatDocsEdit_form5.refresh(restriction);
	},
	
	projStatDocsEdit_form1_onSave: function() {
		var valid = true;
		if (!this.projStatDocsEdit_form1.save() | !this.projStatDocsEdit_form2.save() | !this.projStatDocsEdit_form3.save()
			| !this.projStatDocsEdit_form4.save() | !this.projStatDocsEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projStatDocsGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});