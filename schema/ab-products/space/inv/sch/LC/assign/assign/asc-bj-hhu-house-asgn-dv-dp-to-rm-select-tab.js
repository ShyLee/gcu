var assignRoomController = View.createController("assignRoomController", {
	 tabs: null,
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	var activityType2=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_RM;
    	var activityType3=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_CZRM;
    	
    	var site=ascBjUsmsConstantControl.CZ_SITE_ID;
    	var emId=View.user.name;
    	var siteId=ASC_GetSiteId(emId);

    	if(siteId==site){
    		this.approvedInfoGrid.addParameter('activityType', "activity_type in ('"+activityType3+"')");
        }else{
        	this.approvedInfoGrid.addParameter('activityType', "activity_type in ('"+activityType2+"')");
        }
	},
	approvedInfoGrid_next_onClick:function(row){
		var activityLogId=row.record['activity_log.activity_log_id.key'];
		this.tabs.activityLogId=activityLogId;
		var nextTabName = 'selectDvAndBl';
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    nextTab.show(true);
	    this.tabs.selectTab(nextTabName);
	},
	approvedInfoGrid_view_onClick:function(row){
		this.detailPanel.showInWindow({
            width: 700,
            height: 600
        });
        var activityLogId=row.record['activity_log.activity_log_id.key'];
        var restriction=new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id",activityLogId,"=");
		this.detailPanel.refresh(restriction);
	}
});
