var rplmAmendmentController = View.createController('rplmAmendment',{
	selectedId:null,
	leaseId:null,
	refreshControllers:new Array(),
	formAmendment_onSave: function(){
		if(this.selectedId == null){
			if(this.formAmendment.getFieldValue('ls_amendment.description').length == 0){
				View.showMessage(getMessage('error_no_description'));
				return;
			}
			var record = this.formAmendment.getRecord();
			record.setValue('ls_amendment.ls_id', this.leaseId);
			this.formAmendment.setRecord(record);
			this.formAmendment.save();
			for (var i = 0; i < this.refreshControllers.length; i++) {
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
			}
			this.formAmendment.enableField('ls_amendment.ls_amend_id', false);
			this.selectedId = this.formAmendment.getFieldValue('ls_amendment.ls_amend_id');
		}else{
			this.formAmendment.save();
			for(var i=0;i<this.refreshControllers.length;i++){
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
			}
			View.closeThisDialog();
		}
	},
	formAmendment_onCancel: function(){
		View.closeThisDialog();
	}
})