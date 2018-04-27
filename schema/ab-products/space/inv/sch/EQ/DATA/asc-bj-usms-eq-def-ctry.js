var controller=View.createController('ctryForm',{
	/**
	 * 执行“筛选”操作
	 */
	consolePanel_onBtnSearch: function(){
		var res=new Ab.view.Restriction();
		var ctry_id=this.consolePanel.getFieldValue('ctry.ctry_id');
		var ctry_name=this.consolePanel.getFieldValue('ctry.name');
		if(valueExistsNotEmpty(ctry_id)){
			res.addClause('ctry.ctry_id',ctry_id,'=');
		}
		if(valueExistsNotEmpty(ctry_name)){
			res.addClause('ctry.name','%'+ctry_name+'%','LIKE');
		}
		this.gridCtryEdit_List.refresh(res);
	},
	/**
	 * 执行“清除”操作
	 */
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.gridCtryEdit_List.restriction=null;
		this.gridCtryEdit_List.refresh("");
	}
})