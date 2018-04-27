var adjustSelectController=View.createController('adjustSelectController',{
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
	needApprovePanel_view_onClick:function(row){
		var record = row.getRecord();
		var changeId=record.getValue("eq_change.id");
		var eqId=record.getValue("eq_change.eq_id");
	    var rtrId=record.getValue("eq_change.rtr_dip_id");
	    this.tabs.changeId = changeId;
		this.tabs.eqId = eqId;
		this.tabs.rtrId = rtrId;
		
	    var nextTabName="requestTab";
	    this.tabs.findTab(nextTabName).show(true);
	    this.tabs.findTab("selectTab").enable(false);
	    this.tabs.selectTab(nextTabName,null,false,true,false);
	}
});

