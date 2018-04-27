var projStatController = View.createController('projStat',{	
	project_id: '',
	
	afterViewLoad:function() {
		this.projStatTabs.showTab('projStatDash', false);
		this.projStatTabs.showTab('projStatTeam', false);
		this.projStatTabs.showTab('projStatLogs', false);
		this.projStatTabs.showTab('projStatDocs', false);
		this.projStatTabs.showTab('projStatPkg', false);
		//onCalcEndDatesForProject('');
	}
});

