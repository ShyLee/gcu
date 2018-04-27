var adjustSelectAttachController=View.createController('adjustSelectAttachController',{
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
	needApprovePanel_view_onClick:function(row){
		var record = row.getRecord();
		var changeId=record.getValue("eq_attach_change.id");
		var eqAttachId=record.getValue("eq_attach_change.eq_attach_id");
	    var rtrId=record.getValue("eq_attach_change.rtr_dip_id");
	    this.tabs.changeId = changeId;
		this.tabs.eqAttachId = eqAttachId;
		this.tabs.rtrId = rtrId;
		
	    var nextTabName="requestAttachTab";
	    this.tabs.findTab(nextTabName).show(true);
	    this.tabs.findTab("selectAttachTab").enable(false);
	    this.tabs.selectTab(nextTabName,null,false,true,false);
	}
});
