var controller=View.createController('addEqListForm',{
	//筛选操作
	showAddEqList: function(){
		var addEqId=this.consoleForm.getFieldValue('add_eq.add_eq_id');
		var eqName=this.consoleForm.getFieldValue('add_eq.eq_name');
		var status=this.consoleForm.getFieldValue('add_eq.status');
		var addEqRes=new Ab.view.Restriction();
		
		if(valueExistsNotEmpty(addEqId)){
			addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
		}
		if(valueExistsNotEmpty(eqName)){
			addEqRes.addClause('add_eq.eq_name','%'+eqName+'%','LIKE');
		}
		if(valueExistsNotEmpty(status)){
			addEqRes.addClause('add_eq.status',status,'=');
		}
		
		this.gridForm.refresh(addEqRes);
	},
	//清除筛选
	consoleForm_onBtnCancel: function(){
		this.consoleForm.clear();
		this.gridForm.restriction=null;
		this.gridForm.refresh("");
	},

	//查看此报增单下设备列表
	gridForm_btnViewEqList_onClick: function(){
		var selectIndex=this.gridForm.selectedRowIndex;
		var addEqId=this.gridForm.gridRows.get(selectIndex).getRecord().getValue('add_eq.add_eq_id');
		var addEqStatus=this.gridForm.gridRows.get(selectIndex).getRecord().getValue('add_eq.status');
		/*var dvId=this.gridForm.gridRows.get(selectIndex).getRecord().getValue('add_eq.dv_id');
		var dvName=this.gridForm.gridRows.get(selectIndex).getRecord().getValue('dv.dv_name');*/
		if(addEqStatus=='3'||addEqStatus=='4'){
			View.openDialog("asc-bj-usms-eq-add-view.axvw",null,false,{
				x:150,
				y:200,
				width:900,
				height:500,
				addEqId:addEqId
			});
		}else{
			View.alert('此报增单尚未分配,无法查看设备信息 !');
		}
		
	}
	 
});