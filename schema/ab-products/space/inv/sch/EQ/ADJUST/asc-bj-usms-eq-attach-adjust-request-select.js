var abSelectTabController = View.createController("abSelectTabController", {
	afterViewLoad:function(){
		var emId=View.user.name;
		var dvId=ASEQ_getUserDvId(emId);
		this.eqAttachListPanel.addParameter("dvOldId","eq_attach_change.dv_id_old!='"+dvId+"'");
		this.requestedPanel.addParameter("adjustDvId","eq_attach_change.adjust_dv_id='"+dvId+"'");
	},
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	 },
	 eqAttachListPanel_adjust_onClick:function(row){
		var record = row.getRecord();
	    var eqAttachId=record.getValue("eq_attach_change.eq_attach_id");
	    var rtrId=record.getValue("eq_attach_change.rtr_dip_id");
		this.tabs.eqAttachId = eqAttachId;
		this.tabs.rtrId = rtrId;
		
	    var nextTabName="requestAttachTab";
	    this.tabs.findTab(nextTabName).show(true);
	    this.tabs.selectTab(nextTabName,null,false,true,false);
		}
});