var projExportWorkpkgsMsProjectController = View.createController('projExportWorkpkgsMsProject', {
	project_id : '',
	work_pkg_id : '',
	
	projExportWorkpkgsMsProjectGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
	},
	
	projExportWorkpkgsMsProjectGrid_onSelectWorkPkgId : function(row) {
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projExportWorkpkgsMsProjectActionsGrid.refresh(restriction);
		this.projExportWorkpkgsMsProjectActionsGrid.show(true);
		this.projExportWorkpkgsMsProjectActionsGrid.appendTitle(this.work_pkg_id);
	},
	
	projExportWorkpkgsMsProjectActionsGrid_onExportMsProject : function() {
		var parameters = {
				'project_id' : this.project_id,
				'work_pkg_id' : this.work_pkg_id};
		var result = Workflow.runRuleAndReturnResult('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
		if (result.code == 'executed') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('work_pkgs.project_id', this.project_id);
			restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
			this.projExportWorkpkgsMsProjectForm.refresh(restriction);
			this.projExportWorkpkgsMsProjectForm.showInWindow({
			    width: 300,
			    height: 300
			});
		} else {
			View.showMessage(result.message);
		}
	}
});