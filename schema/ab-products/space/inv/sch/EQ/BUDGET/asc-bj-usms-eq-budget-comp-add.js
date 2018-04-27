var controller=View.createController('ascBjUsmsEqBudgetCompAddForm',{
	afterInitialDataFetch: function(){
		var myDate = new Date();
		var year=myDate.getFullYear();
		
		this.gridPanel.addParameter('para_year', " a.fiscal_year='"+year+"'");
		this.gridPanel.refresh();
		this.gridPanel.setTitle("预算列表-"+year);
	},
	//筛选操作
	consolePanel_onBtnShow: function(){
		var res=new Ab.view.Restriction();
		var budgetId=this.consolePanel.getFieldValue('eq_budget.budget_id');
		var dvId=this.consolePanel.getFieldValue('eq_budget.dv_id');
		var year=this.consolePanel.getFieldValue('eq_budget.fiscal_year');
		if(valueExistsNotEmpty(budgetId)){
			res.addClause('eq_budget.budget_id',budgetId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			res.addClause('eq_budget.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(year)){
			this.gridPanel.addParameter('para_year', " a.fiscal_year='"+year+"'");
		}
		this.gridPanel.refresh(res);
		if(valueExistsNotEmpty(year)){
			 this.gridPanel.setTitle('预算列表-'+year);
		}
		
		this.columnReportPanel.show(false);
		this.bugetItemGridPanel.show(false);
	},
	//清除操作
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
	//当grid加载时，在field中填入递增项
	bugetItemGridPanel_afterRefresh: function(){
		var rows=this.bugetItemGridPanel.rows;
		for(var i=0;i<rows.length;i++){
			var row=rows[i];
			row.row.cells.items[1].dom.innerHTML=i+1;
		}
	    
	}
});

//根据所选的行，弹出对应的dialog
function showDetailDialog(row){
	var gridForm=View.panels.get('bugetItemGridPanel');
	var budgetItemId=row.restriction["eq_budget_item.budget_item_id"];
	var res=new Ab.view.Restriction();
	res.addClause('add_eq.budget_item_id',budgetItemId,'=');
	
	View.openDialog('asc-bj-usms-eq-budget-comp-add-dialog.axvw',res,false,null);
}