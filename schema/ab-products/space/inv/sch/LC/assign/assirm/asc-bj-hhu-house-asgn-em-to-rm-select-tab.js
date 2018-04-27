var assignRoomController = View.createController("assignRoomController", {
	 tabs: null,
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.approvedInfoGrid.addParameter('activityType', ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_DV);
		this.approvedInfoGrid.refresh();
	},
	approvedInfoGrid_next_onClick:function(row){
		var activityLogId=row.record['activity_log.activity_log_id.key'];
		this.tabs.activityLogId=activityLogId;
		var nextTabName = 'selectEm';
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    nextTab.show(true);
	    this.tabs.selectTab(nextTabName);
	},
	approvedInfoGrid_view_onClick:function(row){
		this.detailPanel.showInWindow({
			x:300,
			y:100,
            width: 600,
            height: 400
        });
        var activityLogId=row.record['activity_log.activity_log_id.key'];
        var restriction=new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id",activityLogId,"=");
		this.detailPanel.refresh(restriction);
	}
});
