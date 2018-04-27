var projStatPkgProfController = View.createController('projStatPkgProf', {
	
	projectView_workpkgForm_afterRefresh:function() {
		var restriction = this.projectView_workpkgForm.restriction;	
		var records = this.projRecordPublishContractsDetailsDs0.getRecords(restriction);
		if (records.length == 0) this.projRecordPublishContractsDetailsForm.show(false);
		else {
			this.projRecordPublishContractsDetailsForm.refresh(restriction);
			this.projRecordPublishContractsDetailsForm.show(true);
			this.projEnterBidsGrid.show(false);
			return;
		}
		var status = this.projectView_workpkgForm.getFieldValue('work_pkgs.status');
/*		if (status == 'Approved-Out for Bid' || status == 'Approved-Bid Review') {
			this.projEnterBidsGrid.refresh(restriction);
			this.projEnterBidsGrid.show(true);
			if (this.projEnterBidsGrid.rows.length == 0) this.projEnterBidsGrid.setInstructions(getMessage('noBids'));
			else this.projEnterBidsGrid.setInstructions('');
		}
		else this.projEnterBidsGrid.show(false);*/
		this.projEnterBidsGrid.show(false);
	},

	projStatPkgProfForm_beforeSave : function() {
		this.projStatPkgProfForm.clearValidationResult();
		this.validateDates();
	},
	
	projectView_workpkgForm_onSendOutForBid:function() {
		var record = this.projStatPkgProfDs0.getRecord(this.projectView_workpkgForm.restriction);
		record.setValue('work_pkgs.status','Approved-Out for Bid');
		this.projStatPkgProfDs0.saveRecord(record);
		this.projectView_workpkgForm.refresh();
	},

	validateDates : function() {
		var valid = validateDateFields(this.projStatPkgProfForm, 'work_pkgs.date_est_start', 'work_pkgs.date_est_end', false);
		if (valid) valid = validateDateFields(this.projStatPkgProfForm, 'work_pkgs.date_act_start', 'work_pkgs.date_act_end', false);
		return valid;
	},
	
	projApproveBidsApproveColumnReport_onApprove : function(row, action) {
		var record = this.projApproveBidsApproveColumnReport.getRecord();
		var project_id = record.getValue('work_pkg_bids.project_id');
		var work_pkg_id = record.getValue('work_pkg_bids.work_pkg_id');
		var vn_id = record.getValue('work_pkg_bids.vn_id');
		var parameters = {
			"project_id": project_id,
			"work_pkg_id": work_pkg_id,
			"vn_id": vn_id
		};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-approveWorkPkgBid', parameters);
		if (result.code == 'executed') 
		{
			this.projApproveBidsApproveColumnReport.closeWindow();
			this.projectView_workpkgForm.refresh();
			View.getOpenerView().getOpenerView().controllers.get('projStatCps').projSummCps_activity_logs.refresh();
		} else 
		{ 
			alert(result.code + " :: " + result.message);
		}	
	},
	
	projRecordPublishContractsEditForm_onSignContract : function() {
		this.projRecordPublishContractsEditForm.setFieldValue('work_pkg_bids.status','Contract Signed');
		this.projRecordPublishContractsEditForm_onSave();
	},
	
	projRecordPublishContractsEditForm_onSave:function() {
		this.projRecordPublishContractsEditForm.save();
		this.projRecordPublishContractsEditForm.closeWindow();
		this.projectView_workpkgForm.refresh();
		View.getOpenerView().getOpenerView().controllers.get('projStatCps').projSummCps_activity_logs.refresh();
	
	}
});