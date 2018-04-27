var vontroller=View.createController('warrantyForm',{
	/**
	 * 添加“筛选”相关操作
	 */
	consolePanel_onBtnShow: function(){
		var res=new Ab.view.Restriction();
		var w_id=this.consolePanel.getFieldValue('warranty.warranty_id');
		var w_name=this.consolePanel.getFieldValue('warranty.warranty_name');
		var w_vendor=this.consolePanel.getFieldValue('warranty.war_vendor');
		//判断相应检索字段是否为空，如果不为null并且不为空，则添加为检索条件
		if(valueExistsNotEmpty(w_id)){
			res.addClause('warranty.warranty_id',w_id,'=');
		}
		if(valueExistsNotEmpty(w_name)){
			res.addClause('warranty.warranty_name','%'+w_name+'%','LIKE');
		}
		if(valueExistsNotEmpty(w_vendor)){
			res.addClause('warranty.war_vendor','%'+w_vendor+'%','LIKE');
		}
		this.treePanel.refresh(res);
	},
	/**
	 * 添加“清除”相关操作
	 */
	consolePanel_onBtnClear: function(){
		//清空console panel中的数据
		this.consolePanel.clear();
		//将grid置为检索之前的状态
		this.treePanel.restriction=null;
		this.treePanel.refresh("");
	}
	
})