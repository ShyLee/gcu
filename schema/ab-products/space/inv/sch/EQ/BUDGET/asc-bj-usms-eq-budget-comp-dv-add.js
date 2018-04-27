var controller=View.createController('ascBjUsmsEqBudgetCompAddForm',{
	//筛选操作
	consolePanel_onBtnShow: function(){
		var res=new Ab.view.Restriction();
		var budgetId=this.consolePanel.getFieldValue('eq_budget.budget_id');
		var dvId=this.consolePanel.getFieldValue('eq_budget.dv_id');
		if(valueExistsNotEmpty(budgetId)){
			res.addClause('eq_budget.budget_id',budgetId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			res.addClause('eq_budget.dv_id','%'+dvId+'%','LIKE');
		}
		this.gridPanel.refresh(res);
	},
	//清除操作
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
//	//当grid加载时，在field中填入递增项
//	bugetItemGridPanel_afterRefresh: function(){
//		var rows=this.bugetItemGridPanel.rows;
//		for(var i=0;i<rows.length;i++){
//			var row=rows[i];
//			row.row.cells.items[1].dom.innerHTML=i+1;
//		}
//	    
//	}
});

//根据所选的行，弹出对应的dialog
function showDetailDialog(row){
	var gridForm=View.panels.get('bugetItemGridPanel');
	var budgetItemId=row.restriction["eq_budget_item.budget_item_id"];
	var res=new Ab.view.Restriction();
	res.addClause('add_eq.budget_item_id',budgetItemId,'=');
	
	View.openDialog('asc-bj-usms-eq-budget-comp-add-dialog.axvw',res,false,null);
}