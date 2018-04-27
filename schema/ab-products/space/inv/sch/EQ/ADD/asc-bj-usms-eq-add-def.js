var controller=View.createController('addDefForm',{
	afterViewLoad: function(){
		
	},
	formPanel_afterRefresh: function(){
		this.formPanel.enableField('add_eq.csi_id');
		this.formPanel.enableField('add_eq.eq_name');
	},
	formPanel_beforeSave: function(){
		var canSave=true;
		//求和计算
		getCount();
		try {
			//判断主键是否超出范围
			if (this.formPanel.newRecord) {
				var primaryKey = createPrimaryKey("add_eq", "add_eq_id","");
				this.formPanel.setFieldValue("add_eq.add_eq_id", primaryKey);
			}
		} catch (e) {
			canSave=false;
			View.alert("主键生成失败，请重新操作");
		}
		return canSave;
	},
	consolePanel_onBtnShow: function(){
		var res=new Ab.view.Restriction();
		var eqId=this.consolePanel.getFieldValue('add_eq.add_eq_id');
		var eqName=this.consolePanel.getFieldValue('add_eq.eq_name');
		var itemId=this.consolePanel.getFieldValue('add_eq.budget_item_id');
		var id=this.consolePanel.getFieldValue('add_eq.budget_id');
		var brand=this.consolePanel.getFieldValue('add_eq.brand');
		if(valueExistsNotEmpty(eqName)){
			res.addClause('add_eq.eq_name','%'+eqName+'%','LIKE');
		}
		if(valueExistsNotEmpty(eqId)){
			res.addClause('add_eq.add_eq_id',eqId,'=');
		}
		if(valueExistsNotEmpty(itemId)){
			res.addClause('add_eq.budget_item_id',itemId,'=');
		}
		if(valueExistsNotEmpty(id)){
			res.addClause('add_eq.budget_id',id,'=');
		}
		if(valueExistsNotEmpty(brand)){
			res.addClause('add_eq.brand','%'+brand+'%','LIKE');
		}
		this.gridPanel.refresh(res);
	}
});
//刷新gridPanel
function refreshGridPanel(){
	var gridForm=View.panels.get('gridPanel');
	gridForm.restriction=null;
	gridForm.refresh("");
}

//当挑选事项编码后，从而从budget_item中挑选出已经存在的值并添加到相应的控件中
function afterSelectItemId(fieldName, selectedValue,priviewValue){
	//因为前面的selectValue中传来的field为两个，所以此方法就会执行两次，所以需要进行条件判断
	if(fieldName=='add_eq.budget_item_id'){
		var res=new Ab.view.Restriction();
		res.addClause('eq_budget_item.budget_item_id',selectedValue,'=');
		var dataSource=View.dataSources.get('ds-BudgetItem');
		var record=dataSource.getRecord(res);
		//获取record中的值
		var csiId=record.getValue('eq_budget_item.csi_id');
		var eqName=record.getValue('eq_budget_item.eq_name');
		var brand=record.getValue('eq_budget_item.brand');
		var std=record.getValue('eq_budget_item.eq_std');
		var use=record.getValue('eq_budget_item.use');
		//将取出的值给form中相应的元素赋值
		var form=View.panels.get('formPanel');
		form.setFieldValue('add_eq.csi_id',csiId);
		form.setFieldValue('add_eq.eq_name',eqName);
		form.setFieldValue('add_eq.brand',brand);
		form.setFieldValue('add_eq.eq_std',std);
		form.setFieldValue('add_eq.use',use);
	}
}

//根据count 和 price自动计算总价
function getCount(){
	var form=View.panels.get('formPanel');
	var count=form.getFieldValue('add_eq.count');
	var price=form.getFieldValue('add_eq.price');
	if(!valueExistsNotEmpty(count)){
		count=0;
	}
	if(!valueExistsNotEmpty(price)){
		price=0;
	}
	var countP=parseInt(count);
	var priceP=parseInt(price);
	var sum=countP*priceP;
	form.setFieldValue('add_eq.total_price',sum);
}