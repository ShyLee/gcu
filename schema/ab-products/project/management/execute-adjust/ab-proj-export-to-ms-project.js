var projExportMsProjectController = View.createController('projExportMsProject', {
	projExportMsProjectGrid_onExportMsProject : function() {
		var projectId = this.projExportMsProjectGrid.restriction.clauses[0].value;
		var parameters = {
				'project_id' : projectId,
				'work_pkg_id' : ''};
		var result = Workflow.runRuleAndReturnResult('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
		if (result.code == 'executed') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectId);
			this.projExportMsProjectForm.refresh(restriction);
			this.projExportMsProjectForm.showInWindow({
			    width: 300,
			    height: 300
			});
		} else {
			View.showMessage(result.message);
		}
	}
});