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
		var nextTabName = 'asgnEmToRm';
		this.tabs.emId=this.approvedInfoGrid.getFieldValue("activity_log.requestor");
		this.tabs.emName=this.approvedInfoGrid.getFieldValue("activity_log.requestor_name");
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    nextTab.show(true);
	    this.tabs.selectTab(nextTabName);
	},
	approvedInfoGrid_onBack:function(){
        var tabName = 'selectLcTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
	}
});