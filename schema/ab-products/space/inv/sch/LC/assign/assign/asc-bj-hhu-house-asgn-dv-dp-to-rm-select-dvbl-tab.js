var assignRoomBLDVController = View.createController("assignRoomBLDVController", {
	tabs: null,
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		var restriction = new Ab.view.Restriction();
		var activityLogId=this.tabs.activityLogId;
		restriction.addClause('activity_log.activity_log_id',activityLogId, '=');
		this.approvedInfoGrid.refresh(restriction);
	},
	approvedInfoGrid_onNext:function(){
		var nextTabName = 'asgnDvToRm';
		this.tabs.dvId=this.approvedInfoGrid.getFieldValue("activity_log.dv_id");
		this.tabs.dvName=this.approvedInfoGrid.getFieldValue("dv.dv_name");
		this.tabs.emId=this.approvedInfoGrid.getFieldValue("activity_log.requestor");
		this.tabs.emName=this.approvedInfoGrid.getFieldValue("activity_log.requestor_name");
		this.tabs.address=this.approvedInfoGrid.getFieldValue("activity_log.notes2");
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    nextTab.show(true);
	    this.tabs.selectTab(nextTabName);
	},
	approvedInfoGrid_onBack:function(){
        var tabName = 'selectLcTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
	}
});