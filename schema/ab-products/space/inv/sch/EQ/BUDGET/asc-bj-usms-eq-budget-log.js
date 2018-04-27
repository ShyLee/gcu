var controller=View.createController('controller',{
	afterInitialDataFetch:function(){
	      this.showChangeLog(true);
	},
	showChangeLog:function(autoShow){
		  var panel = this.addEqListPanel;
		  var selectedIndex="-1";
	      if(autoShow){
	       selectedIndex="0";
	      }else{
	       selectedIndex=panel.selectedRowIndex;
	      }
		  var budget_item_id = panel.rows[selectedIndex]["eq_budget_item.budget_item_id"];
		 
		  var res= new Ab.view.Restriction();
		  res.addClause("eq_budget_change_log.budget_itemid_old",budget_item_id,"=");
		  this.budgetChangePanel.refresh(res,false);
		  this.budgetChangePanel.setTitle("预算项【"+budget_item_id+"】的调拨记录");
	},
	addEqListPanel_afterRefresh: function(){
		  this.addEqListPanel.enableSelectAll(false);
		  this.selectedRow = null;
	},
	addEqListPanel_multipleSelectionColumn_onClick: function(row){
		  if(this.selectedRow != null){
		   this.selectedRow.select(false);
		  }
		  if(row.isSelected()){
		   this.selectedRow = row;
		  }else{
		   this.selectedRow = null;
		  }
	},
	editBudgerLogPanel_beforeSave:function(){
		var panel=View.panels.get('editBudgerLogPanel');
		var budgetIdOld=panel.getFieldValue('eq_budget_change_log.budget_id_new');
		var budgetItemIdOld=panel.getFieldValue('eq_budget_change_log.budget_itemid_old');
		var budgetItemIdNew=panel.getFieldValue('eq_budget_change_log.budget_itemid_new');
		var price=panel.getFieldValue('eq_budget_change_log.price');
		var total_price=panel.getFieldValue('eq_budget_change_log.total_price');
		
		if(budgetItemIdOld==budgetItemIdNew){
			View.showMessage("原预算项与调拨预算项一致，不可调拨");
			return;
		}
		/*if(price>total_price){
			View.showMessage("调拨金额大于原预算项总金额,不可调拨");
			return;
		}*/
	},
	
	editBudgerLogPanel_onSave:function(){
		
		var success=this.editBudgerLogPanel.canSave();
		var add_eq_id=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.add_eq_id');
		var budget_id_old=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.budget_id_old');
		var budget_id_new=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.budget_id_new');
		var budget_item_old=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.budget_itemid_old');
		var budget_item_new=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.budget_itemid_new');
		var price=this.editBudgerLogPanel.getFieldValue('eq_budget_change_log.price');
		  if(success){
			  var message="原预算["+budget_item_old+"]将增加金额["+price+"]元，调拨预算["+budget_item_new+"]将减少金额["+price+"]元,确定调拨";
			   var controller=this;
			   View.confirm(message,function(button){
			    if(button=="yes"){
			    	   var dsEqBudget = View.dataSources.get("eq_budget_item_ds");
			    	   var dsEqBudgetAll = View.dataSources.get("eq_budget_ds");
			    	   controller.editBudgerLogPanel.save();
					   //1.报增单位的预算细项增加相应调拨金额
					   var res1=new Ab.view.Restriction();
					   res1.addClause('eq_budget_item.budget_item_id',budget_item_old,'=');
					   var record1=dsEqBudget.getRecord(res1);
					   var total_cost1=record1.getValue("eq_budget_item.total_cost");
					   record1.setValue("eq_budget_item.total_cost",parseFloat(total_cost1)+parseFloat(price));
					   dsEqBudget.saveRecord(record1);
					   
					   //2.报增单位的预算总项增加相应调拨金额
					   var res2=new Ab.view.Restriction();
					   res2.addClause('eq_budget.budget_id',budget_id_old,'=');
					   var record2=dsEqBudgetAll.getRecord(res2);
					   var total_cost2=record2.getValue("eq_budget.cost_budget_cap");
					   record2.setValue("eq_budget.cost_budget_cap",parseFloat(total_cost2)+parseFloat(price));
					   dsEqBudgetAll.saveRecord(record2);
					   
					   //2.调拨单位的预算细项减去相应调拨金额
					   var res3=new Ab.view.Restriction();
					   res3.addClause('eq_budget_item.budget_item_id',budget_item_new,'=');
					   var record3=dsEqBudget.getRecord(res3);
					   var total_cost3=record3.getValue("eq_budget_item.total_cost");
					   record3.setValue("eq_budget_item.total_cost",parseFloat(total_cost3)-parseFloat(price));
					   dsEqBudget.saveRecord(record3);	
					   
					   //4.调拨单位的预算总项减去相应调拨金额
					   var res4=new Ab.view.Restriction();
					   res4.addClause('eq_budget.budget_id',budget_id_new,'=');
					   var record4=dsEqBudgetAll.getRecord(res4);
					   var total_cost4=record4.getValue("eq_budget.cost_budget_cap");
					   record4.setValue("eq_budget.cost_budget_cap",parseFloat(total_cost4)-parseFloat(price));
					   dsEqBudgetAll.saveRecord(record4);
					   
					   controller.addEqListPanel.refresh();
					   var res3= new Ab.view.Restriction();
					   res3.addClause("eq_budget_change_log.budget_itemid_old",budget_item_old,"=");
					   controller.budgetChangePanel.refresh(res3,false);
					   controller.budgetChangePanel.setTitle("预算项【"+budget_item_old+"】的调拨记录");					   
					   controller.editBudgerLogPanel.closeWindow();
					   View.showMessage("调拨成功");
			    }else{
			     
			    }
			   });
		   
		}
	},
	editBudgerLogPanel_onClear:function(){
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_id_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_name_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_itemid_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_item_name_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dv_id_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dp_id_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dv_name_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dp_name_new","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.price","");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.reason","");
	},
	addEqListPanel_onList:function(){
		var res=new Ab.view.Restriction();
		this.budgetChangePanel.refresh(res);
		this.budgetChangePanel.setTitle("预算项调拨历史记录");
	},
	addEqListPanel_onAdd:function(){
		var rows = this.addEqListPanel.getSelectedRows();
		if(rows.length == 0){
			View.showMessage("请选择需要调拨的预算项");
			return;
		}
		this.editBudgerLogPanel.showInWindow({
			x:200,
			y:200,
	        width: 800,
	        height: 400
	    });
		this.editBudgerLogPanel.refresh([],true);
		var user = this.view.user;
		var id = user.employee.id;
		var dsEm = View.dataSources.get("em_ds");
		var res=new Ab.view.Restriction();
		res.addClause('em.em_id',id,'=');
		var emRecord=dsEm.getRecord(res);
		var name = emRecord.getValue("em.name");
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.opra_name",name);
		
		var selectedRecord = this.addEqListPanel.getSelectedRecords();
		var row = selectedRecord[0];   
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.total_price",row.values["eq_budget_item.total_cost"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_id_old",row.values["eq_budget_item.budget_id"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_name_old",row.values["eq_budget.name"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_itemid_old",row.values["eq_budget_item.budget_item_id"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.budget_item_name_old",row.values["eq_budget_item.budget_item_name"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dv_id_old",row.values["eq_budget_item.dv_id"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dv_name_old",row.values["dv.dv_name"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dp_id_old",row.values["eq_budget_item.dp_id"]);
		this.editBudgerLogPanel.setFieldValue("eq_budget_change_log.dp_name_old",row.values["dp.dp_name"]);
		
		this.editBudgerLogPanel.setTitle("添加预算项【"+row.values["eq_budget_item.budget_item_id"]+"】的调拨记录");
		
		
	}
});

function getBudgetItem(){
	var panel=View.panels.get('editBudgerLogPanel');
	var budgetId=panel.getFieldValue('eq_budget_change_log.budget_id_new');
	var res="1=1";
	if(valueExistsNotEmpty(budgetId)){
		res="eq_budget_item.budget_id='"+budgetId+"'";
	}
    View.selectValue({
        formId: 'editBudgerLogPanel',
        title: '从预算项表选择预算',
        fieldNames: ['eq_budget_change_log.budget_id_new', 'eq_budget_change_log.budget_name_new','eq_budget_change_log.budget_itemid_new','eq_budget_change_log.budget_item_name_new','eq_budget_change_log.dv_id_new','eq_budget_change_log.dv_name_new','eq_budget_change_log.dp_id_new','eq_budget_change_log.dp_name_new'],
        selectTableName: 'eq_budget_item',
        selectFieldNames: ['eq_budget.budget_id','eq_budget.name','eq_budget_item.budget_item_id','eq_budget_item.budget_item_name','eq_budget_item.dv_id','dv.dv_name','eq_budget_item.dp_id','dp.dp_name'],
        visibleFieldNames: ['eq_budget.budget_id','eq_budget.name','eq_budget_item.budget_item_id','eq_budget_item.budget_item_name','eq_budget_item.dv_id','dv.dv_name','eq_budget_item.dp_id','dp.dp_name'],
        restriction:res,
        width: 750,
        height: 500
    });
}

function selectBudget(){
	var dsBudget = View.dataSources.get("eq_budget_item_ds");
	var panel=View.panels.get('editBudgerLogPanel');
	var dv_id=panel.getFieldValue('eq_budget_change_log.dv_id_new');
	var dp_id=panel.getFieldValue('eq_budget_change_log.dp_id_new');
	var res=new Ab.view.Restriction();
	if(valueExistsNotEmpty(dv_id)){
		if(valueExistsNotEmpty(dp_id)){
			res.addClause('eq_budget_item.dv_id',dv_id,'=');
			res.addClause('eq_budget_item.dp_id',dp_id,'=');
		}else{
			res.addClause('eq_budget_item.dv_id',dv_id,'=');
			res.addClause('eq_budget_item.dp_id',"NULL",'=');
		}
		var Record=dsBudget.getRecord(res);
		var budgetIdNew=Record.getValue("eq_budget_item.budget_id");
		if(valueExistsNotEmpty(budgetIdNew)){
			panel.setFieldValue("eq_budget_change_log.budget_id_new",budgetIdNew);
		}else{
			panel.setFieldValue("eq_budget_change_log.budget_id_new","");
		}
		
	}		
}