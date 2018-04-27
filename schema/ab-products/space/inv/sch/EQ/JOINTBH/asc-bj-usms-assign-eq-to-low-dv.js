var controller=View.createController('AssinEqForm',{
	dpId: '',
	dlId: '',
	displayEqDetail: function(){
		var selectedIndex=this.UnAssignedEqListPanel.selectedRowIndex;
		var eqId=this.UnAssignedEqListPanel.gridRows.get(selectedIndex).getRecord().getValue("eq.eq_id");
		var res=new Ab.view.Restriction();
		res.addClause("eq.eq_id",eqId,'=');
		this.UnAssignedEqDetailPanel.refresh(res);
	},
	
	toAssignEqToDv: function(){
		var selectedIndex=this.UnAssignedEqListPanel.selectedRowIndex;
		var eqId=this.UnAssignedEqListPanel.gridRows.get(selectedIndex).getRecord().getValue("eq.eq_id");
		var res=new Ab.view.Restriction();
		res.addClause("eq.eq_id",eqId,'=');
		this.ToAssignEqToDvPanel.show(true);
		this.ToAssignEqToDvPanel.showInWindow({
	        width: 500,
	        height: 400,
	        closeButton: false
	    });
		this.ToAssignEqToDvPanel.refresh(res);
		this.ToAssignEqToDvPanel.setFieldValue('eq.dp_commnets','');
	},
	
	ToAssignEqToDvPanel_onBtnSave: function(){
		View.confirm('是否确认分配操作，分配完成后列表中则无此设备!',function(button){
			if(button=='yes'){
				var isSaved=View.panels.get('ToAssignEqToDvPanel').save();
				if(isSaved){
					View.panels.get('ToAssignEqToDvPanel').closeWindow();
					View.panels.get("UnAssignedEqListPanel").restriction=null;
					View.panels.get("UnAssignedEqListPanel").refresh("");
					View.panels.get("UnAssignedEqDetailPanel").show(false);
				}
			}
		});
	}
});

function afterSelectDpId(fieldName,selectValue,oldValue){
	if(fieldName=='eq.dp_id'){
		View.panels.get('ToAssignEqToDvPanel').setFieldValue('eq.dl_id','');
		View.panels.get('ToAssignEqToDvPanel').setFieldValue('eq.dp_commnets',selectValue);
		
	}
}
function afterSelectDlId(fieldName,selectValue,oldValue){
	if(fieldName=='eq.dp_id'){
		controller.dpId=selectValue;
		var dpComments=controller.dpId+'|'+controller.dlId;
		View.panels.get('ToAssignEqToDvPanel').setFieldValue('eq.dp_commnets',dpComments);
	}
	if(fieldName=='eq.dl_id'){
		controller.dlId=selectValue;
		var dpComments=controller.dpId+'|'+controller.dlId;
		View.panels.get('ToAssignEqToDvPanel').setFieldValue('eq.dp_commnets',dpComments);
	}
}