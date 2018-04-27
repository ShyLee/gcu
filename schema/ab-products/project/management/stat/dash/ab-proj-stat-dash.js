var projStatDashController = View.createController('projStatDash',{	
	project_id: null,

	refreshProjDash: function(record) {
		var project_id = record.getValue('project.project_id');
		this.project_id = project_id;
		var project_name = record.getValue('project.project_name');
		var date = new Date();
		var formattedDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), strDateShortPattern);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projStatDashMile_grid.refresh(restriction);		
		this.projStatDashCps_cps.refresh(restriction);
		this.projStatDashCps_cps.appendTitle(getMessage('reportUpdated') + ' ' + formattedDate);
		this.projStatDashProf_form.setTitle(project_id);
		//var openerController = View.getOpenerView().controllers.get('projStat');
		//openerController.projStatTabs.setTabTitle('projStatDash', project_id);
	}
});

