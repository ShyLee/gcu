/**
 *@author:HuangMuliang 2012-08-18
 */

var abScEqBudgetSummaryController = View.createController('abScEqBudgetSummary', {
	
	    ascBjUsmsEqBudgetSummaryGrid_view_onClick: function(row){
	    	viewItems(row);
	    },
	    afterInitialDataFetch: function(){
	    	var myDate = new Date();
			var year=myDate.getFullYear();
			var res=new Ab.view.Restriction();
			res.addClause('eq_budget.fiscal_year',year,'=');
			this.ascBjUsmsEqBudgetSummaryGrid.refresh(res);
			this.ascBjUsmsEqBudgetSummaryGrid.setTitle('预算列表-'+year);
	    },
	    consoleForm_onBtnShow: function(){
	    	var myDate = new Date();
			var yearTime=myDate.getFullYear();
			
	    	var year=this.consoleForm.getFieldValue('eq_budget.fiscal_year');
	    	var res=new Ab.view.Restriction();
	    	if(valueExistsNotEmpty(year)){
	    		res.addClause('eq_budget.fiscal_year',year,'=');
	    	}else{
	    		year=yearTime;
	    		res.addClause('eq_budget.fiscal_year',year,'=');
	    	}
			
			this.ascBjUsmsEqBudgetSummaryGrid.refresh(res);
			this.ascBjUsmsEqBudgetSummaryGrid.setTitle('预算列表-'+year);
	    	
	    },
	    consoleForm_onBtnClear: function(){
	    	this.consoleForm.clear();
	    }
});

function viewItems(row){
    var budgetId = row.record['eq_budget.budget_id'];
    var restriction = new Ab.view.Restriction();
    
    restriction.addClause('eq_budget_item.budget_id', budgetId, '=');
    
    var itemsPanel = View.panels.get('budgetItemPanel');
    itemsPanel.refresh(restriction);
    itemsPanel.show(true);
    itemsPanel.showInWindow({
    	x:150,
    	y:200,
        width: 900,
        height: 500
    });
}


