var editController = View.createController('editController',{
	diffPanel:null,
	afterViewLoad:function(){
		this.diffPanel=this.diffRecords;
	},
	//显示不匹配的代扣房租记录
	showCheckedData:function(){
		var restriction = new Ab.view.Restriction(); 
		var month=this.yearMonth.substring(4);
		restriction.addClause("sc_zzfrent_details.month",month,"=");
		this.diffPanel.refresh(restriction);
	},
	refreshPanel:function(){
		this.diffRecords.refresh();
	}
});