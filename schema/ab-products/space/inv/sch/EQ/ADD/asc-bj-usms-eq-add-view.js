var dialogController=View.createController('dialogController',{
	//var addEqId;
	afterInitialDataFetch:function(){
		var addEqId=this.view.parameters["addEqId"];
		var res=new Ab.view.Restriction();
		res.addClause('eq.add_eq_id',addEqId,'=');
		this.eqListOfAddEqPanel.show();
		this.eqListOfAddEqPanel.refresh(res);
		this.eqAttachPanel.show();	
		this.refreshPanel(true);		
	},
	refreshPanel:function(row){		
		if(this.eqListOfAddEqPanel.rows.length>0){
			var panel = this.eqListOfAddEqPanel;
			var selectedIndex=-1;
			if(row){
				selectedIndex=0;
			}else{
				selectedIndex=panel.selectedRowIndex;
			}
			var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("eq_attach.eq_id",eq_id,"=");
			this.eqAttachPanel.refresh(restriction);
			this.eqAttachPanel.setTitle("设备【"+eq_id+"】的附件列表");
		}
	}
});