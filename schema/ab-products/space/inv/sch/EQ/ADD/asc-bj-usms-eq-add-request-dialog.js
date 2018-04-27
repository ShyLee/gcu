var controller=View.createController('csiForm',{
	//添加"过滤"操作事件
	consolePanel_onBtnShow: function(){
		var res=new Ab.view.Restriction();
		var csiId=this.consolePanel.getFieldValue('csi.csi_id');
		var description=this.consolePanel.getFieldValue('csi.description');
		if(valueExistsNotEmpty(csiId)){
			res.addClause('csi.csi_id',csiId,'=');
		}
		if(valueExistsNotEmpty(description)){
			res.addClause('csi.description','%'+description+'%','LIKE');
		}
		this.csiGridPanel.refresh(res);
	},
	
	//添加"清除"操作事件
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.csiGridPanel.restriction=null;
		this.csiGridPanel.refresh("");
	},
	
	csiGridPanel_btnClick_onClick: function(row,action){
		var record=row.getRecord();
		var csiId=record.getValue('csi.csi_id');
		var eqName=record.getValue('csi.description');
		var parentForm=View.getWindow('parent');
		var parentFormPanel=parentForm.View.panels.get('BaoZengDetialformPanel');
		parentFormPanel.setFieldValue('add_eq.csi_id',csiId);
		parentFormPanel.setFieldValue('add_eq.eq_name',eqName);
		View.closeThisDialog();
	}
});