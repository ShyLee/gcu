var projStatPkgActUpController = View.createController('projStatPkgActUp', {
	records: null,
	
	afterInitialDataFetch: function() {
		this.records = View.parameters.updateParameters.records;
	},
	
	projStatPkgActUp_form_onSave : function() {
		var status = this.projStatPkgActUp_form.getFieldValue('activity_log.status');
		var pct_complete = this.projStatPkgActUp_form.getFieldValue('activity_log.pct_complete');
		var date_started = this.projStatPkgActUp_form.getFieldValue('activity_log.date_started');
		var date_completed = this.projStatPkgActUp_form.getFieldValue('activity_log.date_completed');
		var verified_by = this.projStatPkgActUp_form.getFieldValue('activity_log.verified_by');
		for (var i = 0; i < this.records.length; i++) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_log_id', this.records[i].getValue('activity_log.activity_log_id'));
			var record = this.projStatPkgActUpDs0.getRecord(restriction);
			if (status != '') record.setValue('activity_log.status', status);
			if (pct_complete != '') record.setValue('activity_log.pct_complete', pct_complete);
			if (date_started != '') record.setValue('activity_log.date_started', date_started);
			if (date_completed != '') record.setValue('activity_log.date_completed', date_completed);
			if (verified_by != '') record.setValue('activity_log.verified_by', verified_by);
			//if (valueExists(duration_act)) record.setValue('activity_log.duration_act', duration_act);
			this.projStatPkgActUpDs0.saveRecord(record);
		}		
		var openerController = View.getOpenerView().controllers.get('projStatPkgAct');
		openerController.projStatPkgActGrid.refresh();
		View.closeThisDialog();
	}
});

function statusListener() {
	var controller = View.controllers.get('projStatPkgActUp');
	var status = controller.projStatPkgActUp_form.getFieldValue('activity_log.status');
	if (status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {
		controller.projStatPkgActUp_form.setFieldValue('activity_log.pct_complete', 100);
		//controller.projStatPkgActUp_form.setFieldValue('activity_log.date_complete', );
	}
}