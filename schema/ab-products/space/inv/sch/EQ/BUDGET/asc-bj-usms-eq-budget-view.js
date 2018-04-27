/**
 *@author:HuangMuliang 2012-08-18
 */

var abScEqBudgetSummaryController = View.createController('abScEqBudgetSummary', {
	  year:"",
	  afterViewLoad: function(){
			
	    	this.ascBjUsmsEqBudgetSummaryGrid.buildPostFooterRows = addTotalRow2;
//	    	var role=View.user.role;
//	    	if(role=='UNV EQ ADMIN'){
//	    		this.ascBjUsmsEqBudgetSummaryGrid.columns[1].hidden=false;
//	    	}else{
//	    		this.ascBjUsmsEqBudgetSummaryGrid.columns[1].hidden=true;
//	    	}
	    	var myDate = new Date();
			var year=myDate.getFullYear();
			this.year=year;
	    	this.ascBjUsmsEqBudgetSummaryGrid.addParameter('para_year', "eq_budget.fiscal_year='"+year+"'");
	    },
	    afterInitialDataFetch: function(){
	    	this.ascBjUsmsEqBudgetSummaryGrid.setTitle("预算列表-"+this.year);
	    },
	    ascBjUsmsEqBudgetSummaryGrid_view_onClick: function(row){
	    	viewItems(row);
	    },
	    //执行筛选操作
	    consolePanel_onBtnShow: function(){
	    	
	    	var myDate = new Date();
			var year=myDate.getFullYear();
			
	    	var res=new Ab.view.Restriction();
	    	var bmmc=this.consolePanel.getFieldValue('eq_budget.dv_id');//部门名称
	    	var nf=this.consolePanel.getFieldValue('eq_budget.fiscal_year');
	    	if(valueExistsNotEmpty(bmmc)){
	    		res.addClause('eq_budget.dv_id',bmmc,'=');
	    	}
	    	if(valueExistsNotEmpty(nf)){
	    		//res.addClause('eq_budget.fiscal_year',nf,'=');
	    		this.ascBjUsmsEqBudgetSummaryGrid.addParameter('para_year', "eq_budget.fiscal_year='"+nf+"'");
	    	}else{
	    		nf=year;
	    	}
	    	this.ascBjUsmsEqBudgetSummaryGrid.refresh(res);
	    	this.ascBjUsmsEqBudgetSummaryGrid.setTitle("预算列表-"+nf);
	    },
	    //执行‘清除’操作
	    consolePanel_onBtnCancel: function(){
	    	this.consolePanel.clear();
	    	var myDate = new Date();
			var year=myDate.getFullYear();
	    	this.ascBjUsmsEqBudgetSummaryGrid.addParameter('para_year', "eq_budget.fiscal_year='"+year+"'");
	    	this.ascBjUsmsEqBudgetSummaryGrid.refresh();
	    	this.ascBjUsmsEqBudgetSummaryGrid.setTitle("预算列表-"+year);
	    },
	    //执行删除预算的操作，当设备已经开始报增的时候，禁止删除操作
	    ascBjUsmsEqBudgetSummaryGrid_delete_onClick: function(row){
	    	//通过预算编码查找报增单中有没有关于该预算的报增单，如果有，则不能删除
	    	var budgetId=row.getRecord().getValue('eq_budget.budget_id');
	    	View.confirm('确定要删除预算'+budgetId+'吗 ? ',function(button){
	    		
	    		if(button=='yes'){
	    			
	    	    	if(valueExistsNotEmpty(budgetId)){
	    	    		var addEqDs=View.dataSources.get('ascBjUsmsAddEqDs');
	    	    		var addEqRes=new Ab.view.Restriction();
	    	    		addEqRes.addClause('add_eq.budget_id',budgetId,'=');
	    	    		var addEqRecord=addEqDs.getRecord(addEqRes);
	    	    		//如果预算尚未报增，则可以删除
	    	    		if(addEqRecord.isNew){
	    	    			//先删除预算项
	    	    			var budgetItemDs=View.dataSources.get('ascBjUsmsBudgetItemDs');
	    	    			var budgetItemRes=new Ab.view.Restriction();
	    	    			budgetItemRes.addClause('eq_budget_item.budget_id',budgetId,'=');
	    	    			var budgetItemRecords=budgetItemDs.getRecords(budgetItemRes);
	    	    			for(var i=0;i<budgetItemRecords.length;i++){
	    	    				var record=budgetItemRecords[i];
	    	    				record.isNew=false;
	    	    				try{
	    	    					budgetItemDs.deleteRecord(record);
	    	    				}catch(e){
	    	    					View.alert('删除预算项时遇到错误,操作终止');
	    	    					return;
	    	    				}
	    	    				
	    	    			}
	    	    			//删除预算
	    	    			var budgetDs=View.dataSources.get('ascBjUsmsBudgetDs');
	    	    			var budgetRes=new Ab.view.Restriction();
	    	    			budgetRes.addClause('eq_budget.budget_id',budgetId,'=');
	    	    			var budgetRecord=budgetDs.getRecord(budgetRes);
	    	    			try{
	    	    				budgetDs.deleteRecord(budgetRecord);
	    	    			}catch(e){
	    	    				View.alert('删除预算时遇到错误,操作终止');
	        					return;
	    	    			}
	    	    			View.panels.get('ascBjUsmsEqBudgetSummaryGrid').refresh();
	    	    			View.alert('成功删除预算'+budgetId);
	    	    		}else{
	    	    			View.alert('此预算已报增，不可删除');
	    	    		}
	    	    	}
	    		}
	    	});
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
        width: 900,
        height: 500
    });
}

/**
* add total row if there are more lines
* @param {Object} parentElement
*/
function addTotalRow2(parentElement){
	var res=View.panels.get('ascBjUsmsEqBudgetSummaryGrid').restriction;
   var panel=View.panels.get('consolePanel');
   var dv_id=panel.getFieldValue('eq_budget.dv_id');//部门名称
   var fiscal_year=panel.getFieldValue('eq_budget.fiscal_year');
	
   var capDs=View.dataSources.get("ascBjUsmsEqBudgetSumDs");
   if(dv_id!=""){
	   capDs.addParameter('dvId', "eq_budget.dv_id='"+dv_id+"'");
   }
   if(fiscal_year!=""){
	   capDs.addParameter('year', "eq_budget.fiscal_year='"+fiscal_year+"'");
   }
   var capRecord=capDs.getRecord();
   var totalCost=capRecord.getValue("eq_budget.count_budget_cap");
   if(totalCost==""){
	   totalCost=0;
   }
   
   var expDs=View.dataSources.get("ascBjUsmsEqBudgetExpSumDs");
//   var expRecord=expDs.getRecord(res);
   if(dv_id!=""){
	   expDs.addParameter('dvId', "eq_budget.dv_id='"+dv_id+"'");
   }
   if(fiscal_year!=""){
	   expDs.addParameter('year', "eq_budget.fiscal_year='"+fiscal_year+"'");
   }
   var expRecord=expDs.getRecord();
   var totalExp=expRecord.getValue("eq_budget.count_budget_exp");
   if(totalExp==""){
	   totalExp=0;
   }
   var jieyu=parseFloat(totalCost)-parseFloat(totalExp);
	var ds = this.getDataSource();
	
   // create new grid row and cells containing statistics
   var gridRow = document.createElement('tr');
   parentElement.appendChild(gridRow);
   // column 1: 'Total' title
   addColumn(gridRow, 1, '');
   addColumn(gridRow, 1, '合计');
   addColumn(gridRow, 1, '');
   addColumn(gridRow, 1, '');
   addColumn(gridRow, 1,'' );
   addColumn(gridRow, 1,'' );
   addColumn(gridRow, 1,totalCost);
   addColumn(gridRow, 1,parseFloat(totalExp).toFixed(2));
   addColumn(gridRow, 1, jieyu.toFixed(2));
   addColumn(gridRow, 1, '');
   addColumn(gridRow, 1, '');
   addColumn(gridRow, 1, '');
}


function addTotalRow(parentElement){
	if (this.rows.length < 2) {
		return;
	}
	var totalCost_budget_cap = 0.00;
	var totalCost_budget_exp = 0.00;
	var totalBalance = 0.00;
		
	   for (var i = 0; i < this.rows.length; i++) {
	        var row = this.rows[i];
			var cost_budget_cap = row['eq_budget.cost_budget_cap'];
			if(row['eq_budget.cost_budget_cap']){
				cost_budget_cap = row['eq_budget.cost_budget_cap.raw'];
			}
			if (!isNaN(parseFloat(cost_budget_cap))) {
				totalCost_budget_cap += parseFloat(cost_budget_cap);
			}
			
			var cost_budget_exp = row['eq_budget.cost_budget_exp'];
			if(row['eq_budget.cost_budget_exp']){
				cost_budget_exp = row['eq_budget.cost_budget_exp.raw'];
			}
			if (!isNaN(parseInt(cost_budget_exp))){
				totalCost_budget_exp += parseFloat(cost_budget_exp);
			}
			
//			var balance = row['eq_budget.cost_budget_jieyu'];
//			if(row['eq_budget.cost_budget_jieyu']){
//				balance = row['eq_budget.cost_budget_jieyu.raw'];
//			}
//			if (!isNaN(parseInt(balance))){
//				totalBalance += parseFloat(balance);
//			}
	   }
		var ds = this.getDataSource();
		
	   // create new grid row and cells containing statistics
	   var gridRow = document.createElement('tr');
	   parentElement.appendChild(gridRow);
	   // column 1: 'Total' title
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '合计');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,totalCost_budget_cap.toFixed(2));
	   addColumn(gridRow, 1,totalCost_budget_exp.toFixed(2));
//	   addColumn(gridRow, 1, totalBalance.toFixed(2));
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '');
	}
