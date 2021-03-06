var projStatDashPkgController = View.createController('projStatDashPkg', {
	project_id : '',
	work_pkg_id : '',
	
	afterInitialDataFetch : function() {

	},
	
	projStatDashPkgEditWorkPkgForm_beforeSave : function() {
		var form = View.panels.get('projStatDashPkgEditWorkPkgForm'); 
		var curDate = new Date();
		var date_start = getDateObject(this.projStatDashPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
		var date_end = getDateObject(this.projStatDashPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
		if (date_end < date_start) {
			this.projStatDashPkgEditWorkPkgForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
			return false;
		}
		if ((curDate - date_start)/(1000*60*60*24) >= 1){
	    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
		}
		this.projStatDashPkgEditWorkPkgForm.setFieldValue('work_pkgs.date_act_start', this.projStatDashPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));
		this.projStatDashPkgEditWorkPkgForm.setFieldValue('work_pkgs.date_act_end', this.projStatDashPkgEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
	    return true;
	},
	
	selectWorkPkgReport_onSelectWorkPkgId : function(row) {
		this.project_id = row.record['work_pkgs.project_id.key'];
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projStatDashPkgActionsGrid.refresh(restriction);
		this.projStatDashPkgActionsGrid.show(true);
		this.projStatDashPkgActionsGrid.appendTitle(this.work_pkg_id);
		
		this.projStatDashPkgWorkPkgColumnReport.refresh(restriction);
		this.projStatDashPkgWorkPkgColumnReport.show(true);
	},
		
	projStatDashPkgEditWorkPkgForm_onSave : function() {
		if (!this.projStatDashPkgEditWorkPkgForm.save()) return;
		
		var record = this.projStatDashPkgEditWorkPkgForm.getRecord();
		this.project_id = record.getValue('work_pkgs.project_id');
		this.work_pkg_id = record.getValue('work_pkgs.work_pkg_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		
		this.selectWorkPkgReport.refresh();
		this.projStatDashPkgWorkPkgColumnReport.refresh(restriction);
		this.projStatDashPkgWorkPkgColumnReport.show(true);		
		this.projStatDashPkgActionsGrid.refresh(restriction);
		this.projStatDashPkgActionsGrid.show(true);
		this.projStatDashPkgActionsGrid.appendTitle(this.work_pkg_id);
		
		this.projStatDashPkgEditWorkPkgForm.closeWindow();
	},
	
	projStatDashPkgActionsGrid_onAssignActions : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		this.projStatDashPkgCopyActionsGrid.refresh(restriction);
		this.projStatDashPkgCopyActionsGrid.showInWindow({
			width: 800,
			height: 400
		});
	},
	
	projStatDashPkgActionsGrid_onAddNew : function() {
		this.projStatDashPkgActionForm.refresh(this.projStatDashPkgActionsGrid.restriction, true);
		this.projStatDashPkgActionForm.showInWindow({
			newRecord: true,
			width: 800,
			height: 400,
			closeButton: true
		});
	},
	
	projStatDashPkgCopyActionsGrid_onAssignSelectedRecords : function() {
		var selectedRows = this.projStatDashPkgCopyActionsGrid.getPrimaryKeysForSelectedRows();
		for (var i = 0; i < selectedRows.length; i++) {
			var row = selectedRows[i];
		    var record = this.projStatDashPkgDs2.getRecord(row);
		    record.setValue('activity_log.work_pkg_id', this.work_pkg_id);
		    this.projStatDashPkgDs2.saveRecord(record);
		}		
		this.projStatDashPkgActionsGrid.refresh();
		this.projStatDashPkgActionsGrid.show(true);
	},
	
	selectWorkPkgReport_onDeleteSelected: function() {
		var records = this.selectWorkPkgReport.getPrimaryKeysForSelectedRows();
		if (records.length == 0){
			View.showMessage(getMessage('noSelection'));
			return;
		}
		var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
				var parameters = {
					'records': toJSON(records),
					'tableName': 'work_pkgs',
			        'fieldNames': toJSON(['work_pkgs.work_pkg_id'])
				};
				var result = null;
				try {
					result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters); 
					controller.selectWorkPkgReport.refresh();
					controller.projStatDashPkgWorkPkgColumnReport.show(false);
					controller.projStatDashPkgActionsGrid.show(false);
				}
				catch (e) {
					Workflow.handleError(result);
	            }
			}
        });
	},
	
	projStatDashPkgActionsGrid_onDeleteSelected: function(){
		var records = this.projStatDashPkgActionsGrid.getPrimaryKeysForSelectedRows();
		if (records.length == 0){
			View.showMessage(getMessage('noSelection'));
			return;
		}
		var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
				var parameters = {
					'records': toJSON(records),
					'tableName': 'activity_log',
			        'fieldNames': toJSON(['activity_log.activity_log_id'])
				};
				var result = null;
				try {
					result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters); 
					controller.projStatDashPkgActionsGrid.refresh();
				}
				catch (e) {
					Workflow.handleError(result);
	            }
			}
        });
	},
	
	projStatDashPkgActionForm_beforeSave : function() {
		var curDate = new Date();
		var date_required = getDateObject(this.projStatDashPkgActionForm.getFieldValue('activity_log.date_required'));//note that getFieldValue returns date in ISO format
		var date_scheduled = getDateObject(this.projStatDashPkgActionForm.getFieldValue('activity_log.date_scheduled'));
		if ((curDate - date_required)/(1000*60*60*24) >= 1 || (curDate - date_scheduled)/(1000*60*60*24) >= 1){
	    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
		}
	    return true;
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

												