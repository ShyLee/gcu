var controller=View.createController('insurerForm',{
	/**
	 * 执行"筛选"相关操作
	 */
	consolePanel_onBtnSearch: function(){
		var res=new Ab.view.Restriction();
		var in_id=this.consolePanel.getFieldValue('insurer.insurer_id');
		var country=this.consolePanel.getFieldValue('insurer.country');
		var city=this.consolePanel.getFieldValue('insurer.city');
		//检测参数值是否非空且不为null
		if(valueExistsNotEmpty(in_id)){
			res.addClause('insurer.insurer_id','%'+in_id+'%','LIKE');
		}
		if(valueExistsNotEmpty(country)){
			res.addClause('insurer.country','%'+country+'%','LIKE');
		}
		if(valueExistsNotEmpty(city)){
			res.addClause('insurer.city','%'+city+'%','LIKE');
		}
		this.abInsurerEdit_treePanel.refresh(res);
	},
	/**
	 * 执行"清除"相关操作
	 */
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.abInsurerEdit_treePanel.restriction=null;
		this.abInsurerEdit_treePanel.refresh("");
	}
})