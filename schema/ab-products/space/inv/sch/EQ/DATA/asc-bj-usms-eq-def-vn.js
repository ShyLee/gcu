/**
 * asc-bj-usms-eq-def-vn.axvw中的相关操作
 */
var controller=View.createController('vnForm',{
	//为console添加帅选grid的操作
	consolePanel_onBtnShow: function(){
		var vnId=this.consolePanel.getFieldValue('vn.vn_id');
		var vnType=this.consolePanel.getFieldValue('vn.vendor_type');
		var vnName=this.consolePanel.getFieldValue('vn.company');
		var restriction=new Ab.view.Restriction();
		if(valueExistsNotEmpty(vnId)){
			restriction.addClause('vn.vn_id',vnId,'=');
		}
		if(valueExistsNotEmpty(vnType)){
			restriction.addClause('vn.vendor_type',vnType,'=');
		}
		if(valueExistsNotEmpty(vnName)){
			restriction.addClause('vn.company','%'+vnName+'%','LIKE');
		}
		this.treePanel.refresh(restriction);
	},
	//将 console中的field置空
	consolePanel_onBtnCancel: function(){
		this.consolePanel.clear();
		this.treePanel.restriction=null;
		this.treePanel.refresh("");
	}
	
})