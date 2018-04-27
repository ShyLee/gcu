var controller=View.createController('policyForm',{
//	afterViewLoad: function(){
//		this.gridPolicyEdit_List.restriction=null;
//		this.gridPolicyEdit_List.refresh("");
//	},
	
	consolePanel_onBtnSearch: function(){
		var res=new Ab.view.Restriction();
		var po_id=this.consolePanel.getFieldValue('policy.policy_id');
		var ins_id=this.consolePanel.getFieldValue('policy.insurer_id');
		var dateStar=this.consolePanel.getFieldValue('policy.date_start');
		var dateEnd=this.consolePanel.getFieldValue('policy.date_end');
		if(valueExistsNotEmpty(po_id)){
			res.addClause('policy.policy_id',po_id,'=');
		}
		if(valueExistsNotEmpty(ins_id)){
			res.addClause('policy.insurer_id','%'+ins_id+'%','LIKE');
		}
		if(valueExistsNotEmpty(dateStar)&&!valueExistsNotEmpty(dateEnd)){
			res.addClause('policy.date_start',dateStar,'<=');
			res.addClause('policy.date_end',dateStar,'>=')
		}
		if(valueExistsNotEmpty(dateEnd)&&!valueExistsNotEmpty(dateStar)){
			res.addClause('policy.date_star',dateEnd,'<=');
			res.addClause('policy.date_end',dateSEnd,'>=');
		}
		if(valueExistsNotEmpty(dateStar)&&valueExistsNotEmpty(dateEnd)){
			res.addClause('policy.date_start',dateEnd,'<=');
			res.addClause('policy.date_end',dateStar,'>=');
		}
		this.gridPolicyEdit_List.refresh(res);
	},
	consolePanel_onBtnClear: function(){
		this.gridPolicyEdit_List.clear();
		this.gridPolicyEdit_List.restriction=null;
		this.gridPolicyEdit_List.refresh("");
	}
})