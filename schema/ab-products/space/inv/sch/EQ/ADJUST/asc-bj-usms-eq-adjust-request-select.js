var abSelectTabController = View.createController("abSelectTabController", {
	afterViewLoad:function(){
		var emId=View.user.name;
		var dvId=ASEQ_getUserDvId(emId);
		this.eqListPanel.addParameter("dvOldId","eq_change.dv_id_old!='"+dvId+"'");
		this.requestedPanel.addParameter("adjustDvId","eq_change.adjust_dv_id='"+dvId+"'");
	},
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	 },
	 eqListPanel_adjust_onClick:function(row){
		var record = row.getRecord();
	    var eqId=record.getValue("eq_change.eq_id");
	    var rtrId=record.getValue("eq_change.rtr_dip_id");
		this.tabs.eqId = eqId;
		this.tabs.rtrId = rtrId;
		
	    var nextTabName="requestTab";
	    this.tabs.findTab(nextTabName).show(true);
	    this.tabs.selectTab(nextTabName,null,false,true,false);
		}
});