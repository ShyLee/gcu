var projStatPkgInvAddController = View.createController('projStatPkgInvAdd', {
	projStatPkgInvAdd_pay_onSave : function() {
		if (!this.projStatPkgInvAdd_pay.save()) return;
		this.applyPaymentToVendorInvoice();
	},
	
	applyPaymentToVendorInvoice : function() {
		var invoice_id = this.projStatPkgInvAdd_pay.getFieldValue('invoice_payment.invoice_id');
		var parameters = {'invoice.invoice_id':invoice_id};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-applyPaymentToVendorInvoice', parameters);
		if (result.code == 'executed') {
			View.getOpenerView().panels.get('projStatPkgInvGrid').refresh();
			View.closeThisDialog();	
	  	} 
	  	else 
	  	{
	    	View.showMessage(result.code + " :: " + result.message);
	  	}
	}
});


												