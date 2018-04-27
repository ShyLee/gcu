var dialogController=View.createController('dialogController',{
	
	afterInitialDataFetch:function(){
//		var addEqId=this.view.parameters["addEqId"];
		var eqId=this.view.parameters["eqId"];
		
		var restriction=new Ab.view.Restriction();
//		if(valueExistsNotEmpty(addEqId)){
//			restriction.addClause("eq_attach.add_eq_id",addEqId,"=");
//		}    	
    	restriction.addClause("eq_attach.eq_id",eqId,"=");
        this.eqAttachPanel.refresh(restriction);
        this.eqAttachPanel.setTitle("设备【"+eqId+"】的附件列表");
	}
});