var controller = View.createController('controller',{
	budgetItemId:"",
	total_cost:"",
	budgetId:"",
	budget_add_cost:0,
	afterInitialDataFetch: function(){
		this.onStart();
	},
	onStart:function(){
		//界面打开后 自动加载第一条数据
		if(this.budgetGrid.rows.length>0){
			this.budgetId = this.budgetGrid.rows[0]["eq_budget.budget_id"];
			var resBudgetId = new Ab.view.Restriction();
			resBudgetId.addClause("eq_budget_item.budget_id",this.budgetId);
			this.budgetItemGrid.refresh(resBudgetId);
			View.panels.get('budgetItemGrid').setTitle("【"+this.budgetId+"】预算项列表")
		}
	},
	
	budgetGrid_budget_id_onClick:function(row){
		this.budgetId = row.getFieldValue("eq_budget.budget_id");
		var res = new Ab.view.Restriction();
		res.addClause("eq_budget_item.budget_id",this.budgetId);
		this.budgetItemGrid.refresh(res);
		View.panels.get('budgetItemGrid').setTitle("【"+this.budgetId+"】预算项列表");
		this.budgetAddForm.show(false);
		this.budgetAddGrid.show(false);
		
	},
	
	budgetItemGrid_afterRefresh:function(){
		View.panels.get('budgetItemGrid').setTitle("【"+this.budgetId+"】预算项列表");
	},
	
	budgetAddGrid_afterRefresh:function(){
		View.panels.get('budgetItemGrid').setTitle("【"+this.budgetId+"】预算项列表");
	},
	
	
	//显示追加panel
	budgetItemGrid_budget_item_id_onClick:function(row){
		var today = new Date();
		this.budgetId = row.getFieldValue("eq_budget_item.budget_id");
		this.budgetItemId = row.getFieldValue("eq_budget_item.budget_item_id");
		var budgetItemName = row.getFieldValue("eq_budget_item.budget_item_name");
		this.total_cost = row.getFieldValue("eq_budget_item.total_cost");
		
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_item_id",this.budgetItemId);
		this.budgetAddForm.setFieldValue("eq_budget_item.budget_item_name",budgetItemName);
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_total_cost",this.total_cost);
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_add_cost","0");
		this.budgetAddForm.setFieldValue("eq_budget_add.date_budget_add",today);
		this.budgetAddForm.setFieldValue("eq_budget_add.comments","");
		this.budgetAddForm.getFieldElement('eq_budget_add.budget_item_id').disabled = true;
		var res = new Ab.view.Restriction();
		res.addClause("eq_budget_add.budget_item_id",this.budgetItemId);
		this.budgetAddForm.show(true);
		this.budgetAddGrid.refresh(res);
		View.panels.get('budgetAddForm').setTitle("【"+this.budgetItemId+"】追加预算");
		View.panels.get('budgetAddGrid').setTitle("【"+this.budgetItemId+"】追加预算列表");
		
	},
	//保存追加信息
	budgetAddForm_onSave:function(){
		
		var totalAddCostF =  this.budgetAddForm.getFieldValue("eq_budget_add.budget_add_cost");
		var totalCostF =  this.budgetAddForm.getFieldValue("eq_budget_add.budget_total_cost");
		var date_budget_add =  this.budgetAddForm.getFieldValue("eq_budget_add.date_budget_add");
		var comments =  this.budgetAddForm.getFieldValue("eq_budget_add.comments");
		
		var recordAdd = new Ab.data.Record();
		recordAdd.isNew=true;
		recordAdd.setValue("eq_budget_add.budget_add_cost",totalAddCostF);
		recordAdd.setValue("eq_budget_add.budget_item_id",this.budgetItemId);
		recordAdd.setValue("eq_budget_add.date_budget_add",date_budget_add);
		recordAdd.setValue("eq_budget_add.comments",comments);
		recordAdd.setValue("eq_budget_add.budget_total_cost",totalCostF);
		View.dataSources.get("eqBudgetAddDs").saveRecord(recordAdd);
		this.total_cost=totalCostF;
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_add_cost","0");
		var today = new Date();
		this.budgetAddForm.setFieldValue("eq_budget_add.date_budget_add",today);
		this.budgetAddForm.setFieldValue("eq_budget_add.comments","");
		if(this.budgetAddForm.canSave()){
			View.alert("追加成功");
			
			
			//更新预算项总金额
			var res = new Ab.view.Restriction();
			res.addClause("eq_budget_item.budget_item_id",this.budgetItemId);
			res.addClause("eq_budget_item.budget_id",this.budgetId);
			
			var records = this.eqBudgetItemDs.getRecord(res);
			if(records!=""){
				records.setValue("eq_budget_item.total_cost",this.total_cost);
				this.eqBudgetItemDs.saveRecord(records);
			}
			//更新预算总金额
			var resTo = new Ab.view.Restriction();
			resTo.addClause("eq_budget.budget_id",this.budgetId);
			
			var recordTo = this.eqBudgetDs.getRecord(resTo);
			var totCost = recordTo.getValue("eq_budget.cost_budget_cap");
			
			var totalBudgetCost = Number(totCost)+Number(this.budget_add_cost);
			totalBudgetCost = totalBudgetCost.toFixed(2);
			
			recordTo.setValue("eq_budget.cost_budget_cap",totalBudgetCost);
			this.eqBudgetDs.saveRecord(recordTo);
			
			var resRefresh = new Ab.view.Restriction();
			resRefresh.addClause("eq_budget_item.budget_id",this.budgetId);
			
			this.budgetItemGrid.refresh(resRefresh);
			this.budgetGrid.refresh();
			this.budgetAddGrid.refresh();
		}
	},
	//增加追加金额时，更新预算总金额
	onChangeTotalCost:function(){
		
//		var totalCast = this.budgetAddForm.getFieldValue("eq_budget_add.budget_total_cost");
		var budget_add_cost2 = this.budgetAddForm.getFieldValue("eq_budget_add.budget_add_cost");
		if(isNaN(budget_add_cost2)){
			View.alert("输入的字段不是数字，请为 【追加金额(元)】 输入数字");
			this.budgetAddForm.setFieldValue("eq_budget_add.budget_add_cost","0");
			return;
		}
		var budget_add_cost1 = Number(budget_add_cost2).toFixed(2);
		this.budget_add_cost=budget_add_cost1;
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_add_cost",this.budget_add_cost);
		var totCostFianl = Number(this.total_cost)+Number(this.budget_add_cost);
		
		totCostFianl = totCostFianl.toFixed(2);
		
		this.budgetAddForm.setFieldValue("eq_budget_add.budget_total_cost",totCostFianl);
	}
	
});













