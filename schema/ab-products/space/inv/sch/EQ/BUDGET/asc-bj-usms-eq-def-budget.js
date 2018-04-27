/**
 *
 */

var abScDefBudgetController = View.createController('abScDefBudget', {
    
	 afterInitialDataFetch: function() {
		  //this.budetItemDetailsPanel.getFieldElement('eq_budget_item.csi_id').disable=true;
	 },
	 //在保存时执行主键生成策略
	 detailsPanel_beforeSave: function(){
		 var canSave=true;
		 if(this.detailsPanel.newRecord){
			 var primaryKey=createPrimaryKey("eq_budget","budget_id","");
			 this.detailsPanel.setFieldValue("eq_budget.budget_id",primaryKey);
		 }
		 var fiscalYear=this.detailsPanel.getFieldValue('eq_budget.fiscal_year');
	    	var nowYear=parseInt(new Date().format('Y'));
	    	var nextYear=parseInt(nowYear)+1;
	    	var beforeYear=parseInt(nowYear)-1;
	    	//验证财政年是否为4位数字
	    	var re=new RegExp();
	    	re = /^[0-9]{4}$/i;
	    	var isNum = re.test(fiscalYear);
	    	if(isNum==false){
	    		View.alert('财政年必须为4位数字，如2013');
	    		canSave=false;
	    		return;
	    	}
	    	var fyNum=parseInt(fiscalYear);
	    	if(fyNum!=beforeYear&&fyNum!=nowYear&&fyNum!=nextYear){
	    		View.alert('财政年只能填去年、今年、明年年份之一');
	    		canSave=false;
	    	}
		 
		 return canSave;
	 },
	 budetItemDetailsPanel_afterRefresh: function() {
		 this.budetItemDetailsPanel.getFieldElement('eq_budget_item.csi_id').disabled=false;
		 var schCap=this.budetItemDetailsPanel.getFieldValue('eq_budget_item.type'); 
		 changeEnable(schCap);
	 }, 
	 //保存之前进行验证操作，验证成功则提交保存
	 budetItemDetailsPanel_beforeSave: function(){
		 var canSave=true;
		 //生成budget_item的主键
		 if(this.budetItemDetailsPanel.newRecord){
			 var primaryTabKey=this.budetItemDetailsPanel.getFieldValue("eq_budget_item.budget_id");
			 var primaryKey=createPrimaryKey("eq_budget_item","budget_item_id",primaryTabKey);
			 this.budetItemDetailsPanel.setFieldValue("eq_budget_item.budget_item_id",primaryKey);
		 }
		 var sumPanel=View.panels.get('budetItemDetailsPanel');
		 var type=this.budetItemDetailsPanel.getFieldValue('eq_budget_item.type'); 
		 var sumCountS=this.budetItemDetailsPanel.getFieldValue('eq_budget_item.total_cost');
		 var sumCountInt=0;
		 if(!valueExistsNotEmpty(sumCountS)) {
			 sumCountInt=0;
		 }
		 var dvCap=sumPanel.getFieldValue('eq_budget_item.dv_capital');//部门发展资金
		 var otherCap=sumPanel.getFieldValue('eq_budget_item.other_capital');//其他资金
		 var schCap=sumPanel.getFieldValue('eq_budget_item.sch_capital');//校拨资金
		 
		 var jxNum=sumPanel.getFieldValue('eq_budget_item.admin_num');//行政金额
		 var xzNum=sumPanel.getFieldValue('eq_budget_item.teach_num');//教学金额
		 //对上述取值进行转换
		 if(!valueExistsNotEmpty(dvCap)){
			 dvCap=0;
		 }
		 if(!valueExistsNotEmpty(otherCap)){
			 otherCap=0;
		 }
		 if(!valueExistsNotEmpty(schCap)){
			 schCap=0;
		 }
		 if(!valueExistsNotEmpty(jxNum)){
			 jxNum=0;
		 }
		 if(!valueExistsNotEmpty(xzNum)){
			 xzNum=0;
		 }
		 var dvCapP=parseInt(dvCap);
		 var otherCapP=parseInt(otherCap);
		 var schCapP=parseInt(schCap);
		 
		 var jxNumP=parseInt(jxNum);
		 var xzNumP=parseInt(xzNum);
		 var sumCountInt=parseInt(sumCountS);
		 //验证三项资金数值是否可以转换成整数形式
		 if(isNaN(dvCapP)||isNaN(otherCapP)||isNaN(schCapP)||isNaN(sumCountInt)||isNaN(jxNumP)||isNaN(xzNumP)){
			 canSave=false;
			 View.alert('所有金额项必须为数字格式 !');
			 return canSave;
		 }
		 if(sumCountInt<0){
			 canSave=false;
			 View.alert("预算总额必须大于0");
			 return canSave;
		 }
//		 if(dvCapP<=0&&otherCapP<=0&&schCapP<=0){
//			 canSave=false;
//			 View.alert("部门发展基金、其他资金、校拨资金中应该至少有一个大于0");
//			 return canSave;
//		 }
//		 var sumZongE=dvCapP+otherCapP+schCapP;//三项相加金额
//		 var sumJXZE=jxNumP+xzNumP;
//		 if(sumJXZE!=sumCountInt){
//			 canSave=false;
//			 View.alert("行政金额和教学金额之和必须等于预算总额");
//			 return canSave;
//		 }
//		 if(sumZongE!=sumCountInt){
//			 canSave=false;
//			 View.alert("部门发展基金、其他资金、校拨资金之和必须等于预算总额");
//			 return canSave;
//		 }
		 return canSave;
	 },
    
    treePanel_onAddNew: function(){
        this.detailsPanel.refresh('', true);
        this.budgetItemPanel.show(false);
        this.budetItemDetailsPanel.show(false);
        //财政年度显示为当前年的下一年
        var date=new Date();
        var year=date.format('Y')
        var yearNext=(year).toString();
        this.detailsPanel.setFieldValue('eq_budget.fiscal_year',yearNext);
    },
    
    treePanel_onImport: function(){
    	 View.openDialog("asc-bj-usms-eq-budget-import.axvw", null, false, {
            width: 750,
            height: 320
        });
        this.treePanel.refresh();
    },
    treePanel_onDownload: function(){
		var src=View.project.projectGraphicsFolder + '/model/BudgetInfo.xls';
		window.open(src);
	},
    budgetItemPanel_onAddNewItem: function(){
       var budgetForm = View.panels.get('detailsPanel');
       var budgetItemForm = View.panels.get('budetItemDetailsPanel');
       var budgetItemGrid = View.panels.get('budgetItemPanel');
       budgetItemForm.refresh('', true);
           // 	if (form.newRecord) {
       var budgetId = budgetForm.getFieldValue('eq_budget.budget_id');
       var dv_id = budgetForm.getFieldValue('eq_budget.dv_id');
       var dp_id = budgetForm.getFieldValue('eq_budget.dp_id');
       budgetItemForm.setFieldValue('eq_budget_item.budget_id', budgetId);
       budgetItemForm.setFieldValue('eq_budget_item.dv_id', dv_id);
       budgetItemForm.setFieldValue('eq_budget_item.dp_id', dp_id);
       
    },
    /**
     * 用户选择预算进行批量发布操作
     */
    treePanel_onBtnReport: function(){
    	if(this.treePanel.getSelectedRows().length>0){
    		View.confirm('确定要发布吗?',function(button){
        		if(button=='yes'){
        			var isSuccess=true;//发布是否成功的状态
        	    	var fbNum=0;//成功发布
        	    	var selectNum=0;
        	    	var ysLang="";//未成功的发布的预算的列表
        	    	var rows=View.panels.get('treePanel').gridRows.items;
        	    	for(var i=0;i<rows.length;i++){
        	    		var row=rows[i];
        	    		var isSelect=row.isSelected();
        	    		//当用户选择发布时，将预算状态进行改变
        	    		if(isSelect==true){
        	    			selectNum++;
        	    			var budgetId=row.getRecord().getValue('eq_budget.budget_id');
        	    			var budgetRes=new Ab.view.Restriction();
        	    			budgetRes.addClause('eq_budget.budget_id',budgetId,'=');
        	    			var budgetRecord=View.dataSources.get('dsAscBjUsmsEqDataDefBudgetDs').getRecord(budgetRes);
        	    			var FbCount=budgetRecord.getValue('eq_budget.cost_budget_cap');
        	    			var budgetType=budgetRecord.getValue('eq_budget.type');
        	    			if(FbCount=='0.00'){
        	    				isSuccess=false;
        	    				ysLang=ysLang+" "+budgetId
        	    				continue;
        	    			}
        	    			budgetRecord.setValue('eq_budget.status','1');
        	    			try{
        	    				View.dataSources.get('dsAscBjUsmsEqDataDefBudgetDs').saveRecord(budgetRecord);
        	    				fbNum++;
        	    			}catch(e){
        	    				View.alert("发布"+budgetId+"时遇到错误，程序退出！请重新保存！");
        	    				isSuccess=false;
        	    				View.panels.get('treePanel').refresh();
        	    				return;
        	    			}	
        	    		}
        	    	}
        	    	if(isSuccess==true){
        	    		View.alert("已成功发布"+fbNum+"条预算!");
        	    	}else{
        	    		var notSuccessNum=selectNum-fbNum;
        	    		View.alert("已成功发布"+fbNum+"条预算!请为未成功发布的预算添加预算项 !");
        	    	}
        	    	View.panels.get('treePanel').refresh();
        	    	View.panels.get('detailsPanel').show(false);
        	    	View.panels.get('budgetItemPanel').show(false);
        	    	View.panels.get('budetItemDetailsPanel').show(false);
        		}
        	});
    	}else{
    		View.showMessage("请选择要发布的预算！");
    		return;
    	}
    	
    }
     
});
//数量=教学数量+行政数量
function sumCount(){
	var sumPanel=View.panels.get('budetItemDetailsPanel');
	var techNum=sumPanel.getFieldValue('eq_budget_item.teach_num');//教学数量
	var adminNum=sumPanel.getFieldValue('eq_budget_item.admin_num');//行政数量
	if(!valueExistsNotEmpty(techNum)){
		techNum=0;
	}
	if(!valueExistsNotEmpty(adminNum)){
		adminNum=0;
	}
	//将"教学数量"和"行政数量"的值转换为数字
	var parseTeachNum=parseInt(techNum);
	var parseAdminNum=parseInt(adminNum);
	//验证上述两者的值是否正确进行转换了
	if(isNaN(parseTeachNum)||isNaN(parseAdminNum)){
		return;
	}
	var sumThem=parseTeachNum+parseAdminNum;
	sumPanel.setFieldValue('eq_budget_item.count',sumThem);
}

//总投资=预算单价*数量
function sumTouzi(){
	var sumPanel=View.panels.get('budetItemDetailsPanel');
	var num=sumPanel.getFieldValue('eq_budget_item.count');
	var price=sumPanel.getFieldValue('eq_budget_item.price');
	if(!valueExistsNotEmpty(num)){
		num=0;
	}
	if(!valueExistsNotEmpty(price)){
		price=0;
	}
	//将数量和单价转换成整形
	var numP=parseInt(num);
	var priceP=parseInt(price);
	
	//验证是否转换成功，失败则跳出
	if(isNaN(numP)||isNaN(priceP)){
		return;
	}
	var sumTouzi=numP*priceP;
	sumPanel.setFieldValue('eq_budget_item.total_cost',sumTouzi);
}

function changeEnable(field){
	
	var sumPanel=View.panels.get('budetItemDetailsPanel');
	if(field=="1"){
		sumPanel.showField('eq_budget_item.date_buy_old_eq', true);
	}
	if(field=="2"){
		sumPanel.showField('eq_budget_item.date_buy_old_eq', false);
	}
}
//保存预算项
function toSaveForm(){
	var budgetItemDetailForm=View.panels.get("budetItemDetailsPanel");
	var canSave=budgetItemDetailForm.save();
	if(canSave){
		//当保存成功以后，刷新eq_budget表中的预算总数	
		var dsBudgetItem=View.dataSources.get("dsAscBjUsmsEqDataDefBudgetShowCount");
		var budgetId=budgetItemDetailForm.getFieldValue('eq_budget_item.budget_id');
			
		var res=new Ab.view.Restriction();
		res.addClause("eq_budget_item.budget_id",budgetId,'=');
		var record=dsBudgetItem.getRecord(res);
		if(valueExistsNotEmpty(record)){
			var sumCount=record.getValue("eq_budget_item.Count");//提取此预算下预算项总额
			var budgetForm=View.panels.get("detailsPanel");
			budgetForm.setFieldValue("eq_budget.cost_budget_cap",sumCount);
			budgetForm.save();
		}
		
		View.panels.get('treePanel').refresh();
	}
}

function addDvRes(a,b,c){
	var detailsPanel=View.panels.get('detailsPanel');
	var d=1;
}
//执行删除一条预算项操作，使预算总额随删除而改变

function deleteRecord(){
	//当保存成功以后，刷新eq_budget表中的预算总数	
	var dsBudgetItem=View.dataSources.get("dsAscBjUsmsEqDataDefBudgetShowCount");
	var budgetId=View.panels.get("budetItemDetailsPanel").getFieldValue('eq_budget_item.budget_id');
		
	var res=new Ab.view.Restriction();
	res.addClause("eq_budget_item.budget_id",budgetId,'=');
	var record=dsBudgetItem.getRecord(res);
	if(!record.isNew){
		var sumCount=record.getValue("eq_budget_item.Count");//提取此预算下预算项总额
		var budgetForm=View.panels.get("detailsPanel");
		budgetForm.setFieldValue("eq_budget.cost_budget_cap",sumCount);
		budgetForm.save();
	}else{
		var sumCount=record.getValue("eq_budget_item.Count");//提取此预算下预算项总额
		var budgetForm=View.panels.get("detailsPanel");
		budgetForm.setFieldValue("eq_budget.cost_budget_cap",0);
		budgetForm.save();
	}
	
	View.panels.get('treePanel').refresh();
}