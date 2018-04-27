var controller=View.createController('addEqListForm',{
	//筛选操作
	showAddEqList: function(){
		var addEqId=this.consoleForm.getFieldValue('add_eq.add_eq_id');
		var dvId=this.consoleForm.getFieldValue('add_eq.dv_id');
		var status=this.consoleForm.getFieldValue('add_eq.status');
		var dateFrom=this.consoleForm.getFieldValue('add_eq.datePurchasedFrom');
		var dateTo=this.consoleForm.getFieldValue('add_eq.datePurchasedTo');
		var addEqRes=new Ab.view.Restriction();
		
		if(valueExistsNotEmpty(addEqId)){
			addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			addEqRes.addClause('add_eq.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(status)){
			addEqRes.addClause('add_eq.status',status,'=');
		}
		if(valueExistsNotEmpty(dateFrom)){
			addEqRes.addClause('add_eq.date_in_service',dateFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateTo)){
			addEqRes.addClause('add_eq.date_in_service',dateTo,'&lt;=');
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