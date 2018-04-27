var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("eq_budget.status",'0',"!=");	
		var user = this.view.user;
		if(user.role == "UNV DV ADMIN" || user.role == "UNV DIVISION HEAD")
		{
			var dv = user.employee.organization.divisionId;
			restriction.addClause("eq_budget.dv_id",dv,"=");
		}
		this.eq_budget_grid.refresh(restriction);
		this.view_setTitle();
	},	
	eq_budget_grid_budget_id_onClick: function(row){
		var restriction=new Ab.view.Restriction();
		var budget_id = row.getFieldValue("eq_budget.budget_id");
		restriction.addClause("eq_budget_item.budget_id",budget_id,"=");
		this.eq_budget_item_grid.refresh(restriction);
		this.view_setTitle(budget_id);
	},
	eq_budget_item_grid_budget_item_id_onClick: function(row){
		var restriction=new Ab.view.Restriction();
		var budget_id = row.getFieldValue("eq_budget_item.budget_id");
		var budget_item_id = row.getFieldValue("eq_budget_item.budget_item_id");
		restriction.addClause("eq_budget_item.budget_item_id",budget_item_id,"=");
//		this.eq_budget_item_info.refresh(restriction);
		var res=new Ab.view.Restriction();
		res.addClause("add_eq.budget_item_id",budget_item_id,"=");
		this.add_eq_grid.refresh(res);
		this.view_setTitle(budget_id,budget_item_id);
	},
	eq_budget_grid_onList:function(){
		var user = this.view.user;
		var dv_id = user.employee.organization.divisionId;
		var dp_id = user.employee.organization.departmentId;
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_budget_change_log.dv_id_new" , dv_id, "=","or");
	    restriction.addClause("eq_budget_change_log.dv_id_old" , dv_id, "=","or");
	    /*if(valueExistsNotEmpty(dp_id)){
	    	restriction.addClause("eq_budget_change_log.dp_id_new" , dp_id, "=",")and(");
		    restriction.addClause("eq_budget_change_log.dp_id_old" , dp_id, "=","or");
	    }else{
	    	restriction.addClause("eq_budget_change_log.dp_id_new" , "","is null");
		    restriction.addClause("eq_budget_change_log.dp_id_old" , "","is null","or");
	    }*/
		this.budgetChangePanel.refresh(restriction);
		this.budgetChangePanel.setTitle("本单位预算调拨记录");
	    this.budgetChangePanel.showInWindow({
	      x:300,
	      y:300,
	      width: 800,
	      height: 500
	    });
	},
	view_setTitle: function(budget_id,budget_item_id){

		this.view.setTitle("本单位预算情况");
		this.eq_budget_grid.setTitle("本单位预算列表");
		if(valueExistsNotEmpty(budget_id)){
			this.eq_budget_item_grid.setTitle(budget_id+"预算项列表");
		}else{
			this.eq_budget_item_grid.setTitle("本单位预算项列表");

		}
		if(valueExistsNotEmpty(budget_item_id)){
//			this.eq_budget_item_info.setTitle(budget_item_id+"预算项详细");
			this.add_eq_grid.setTitle(budget_item_id+"预算项报增信息");
		}else{
//			this.eq_budget_item_info.setTitle("本单位预算项详细");
			this.add_eq_grid.setTitle("预算项报增信息");
		}
		
	}
});