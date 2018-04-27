var abEqAttachReturnController=View.createController('abEqAttachReturnController',{
	sheetStatus:"",
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.showAttachInfo(true);
	 },
	returnDisposeListPanel_onBtnAddNew:function(){
		this.returnDisposeDetialPanel.showInWindow({
			x:300,
			y:100,
			width:600,
			height:350,
			closeButton:false 
		});
		//当点击新增后，加载初始化信息，如清查时间，操作人等
		this.returnDisposeDetialPanel.refresh([],true);
		var requestDate=new Date();
		var requestEm=View.user.employee.id;
		var requestDv=ASEQ_getUserDvId(requestEm);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.date_request',requestDate);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.request_by',requestEm);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.dv_id',requestDv);
		var dvName = ASEQ_getDvName(requestDv);
		this.returnDisposeDetialPanel.setFieldValue('dv.dv_name',dvName);
		
		var roleName=View.user.role;
		if(roleName=="UNV DV EQ OWN ADMIN" || roleName=="UNV DV EQ MOWN ADMIN" || roleName=="UNV DV EQ STU ADMIN"){
			var requestDp=ASEQ_getUserDpId(requestEm);
			if(requestDp.length==2){
				var dpName = ASEQ_getDpName(requestDp);
				this.returnDisposeDetialPanel.setFieldValue('return_dispose.dp_id',requestDp);
				this.returnDisposeDetialPanel.setFieldValue('dp.dp_name',dpName);
			}
		}
		//data_type=3 是附件退还
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.data_type','3');
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.audit_status','0');
	},
	returnDisposeDetialPanel_onBtnSave:function(){
		var success=this.returnDisposeDetialPanel.save();
		if(success){
			var rtrDipId=this.returnDisposeDetialPanel.getFieldValue("return_dispose.rtr_dip_id");
			this.returnDisposeListPanel.refresh();
			var restriction=new Ab.view.Restriction();
			restriction.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.eqAttachChangeListPanel.refresh(restriction);
			
			this.eqAttachChangeListPanel.refresh();
		}
	},
	returnDisposeListPanel_onNext:function(row){
		var rowRecord=row.getRecord();
		var rtr_dip_id=rowRecord.getValue('return_dispose.rtr_dip_id');
		var auditStatus=rowRecord.getValue('return_dispose.audit_status');
		
		//当状态不是未提交时，不能进行附件调剂。否则，可以
		if(auditStatus!='0'){
			this.showAttachInfo(false);
			View.alert('请求已经提交，不可操作 ! ');
			
		}else{
			this.tabs.rtrDipId=rtr_dip_id;
			var nextTabName="eqAttachInfoTab";
			this.tabs.findTab("eqAttachRequestTab").enable(false);
			this.tabs.findTab(nextTabName).show(true);
			this.tabs.selectTab(nextTabName,null,false,true,false);
		}
	},
	showAttachInfo: function(autoShow){
		if(this.returnDisposeListPanel.rows.length>0){
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=this.returnDisposeListPanel.selectedRowIndex;
			}
			var row=this.returnDisposeListPanel.rows[selectedIndex];
			var rtrDipId=row["return_dispose.rtr_dip_id"];
			var rtrStatus=row["return_dispose.audit_status.raw"];
			this.sheetStatus=rtrStatus;
			
			var eqChangeRes=new Ab.view.Restriction();
			eqChangeRes.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.eqAttachChangeListPanel.refresh(eqChangeRes);
//			//当处置单的状态为已提交或审核已通过时，所有按钮置灰，不可编辑
//			if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4' || rtrStatus=='5'){
//				//置灰操作
//				this.returnDisposeListPanel.gridRows.get(selectedIndex).actions.get('next').enable(false);
//				this.returnDisposeListPanel.gridRows.get(selectedIndex).actions.get('btnDeleteRt').enable(false);
//				View.alert('此项已提交或审核已通过,不可编辑');
//			}
		}
	},
	//删除已经添加到eq_attach_change表中的设备
	eqChangeListPanel_btnEqChangeDelete_onClick: function(row){
		var selectRecord=row.getRecord();
		var rtr_dip_id=rowRecord.getValue('return_dispose.rtr_dip_id');
		
		//1、首先删除eq_attach_change表中的记录 1个附件退还单包含多个附件设备
		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
    	var delDatas=this.eq_attach_change_ds.getRecords(restriction);
    	 for (var i = 0; i < delDatas.length; i++) {
			  var delData = delDatas[i];
			  var record = new Ab.data.Record({
				  'eq_attach_change.eq_attach_change': delData.getValue('eq_attach_change.id')
			  }, false);
			  this.eq_attach_change_ds.deleteRecord(record);
		  }
    	
		//2、然后删除return_dispose表中的记录
    	this.ascBjUsmsEqReturnSch.deleteRecord(selectRecord);
    	
		this.eqChangeListPanel.refresh();
		this.eqListPanel.refresh();
	},
	eqAttachChangeListPanel_btnEqAttachChgDelete_onClick:function(row){
		var selectRecord=row.getRecord();
		View.dataSources.get('eq_attach_change_ds').deleteRecord(selectRecord);
		this.eqAttachChangeListPanel.refresh();
	},
	eqAttachChangeListPanel_afterRefresh: function(){
		var rtrStatus=this.sheetStatus;
		var eqChangeRows=this.eqAttachChangeListPanel.gridRows;
		if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4'){			
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqAttachChgDelete').enable(false);
			}
		}else{
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqAttachChgDelete').enable(true);
			}
		}
	},
	returnDisposeListPanel_btnDeleteRt_onClick: function(row){
		var rowRecord=row.getRecord();
		var auditStatus=rowRecord.getValue('return_dispose.audit_status');
		var rtrDipId=rowRecord.getValue('return_dispose.rtr_dip_id');
		//当状态不是未提交时，不能进行删除。否则，可以删除
		if(auditStatus!='0'){
			this.showAttachInfo(false);
			View.alert('请求已经提交，不可删除 ! ');
		}else{
			//确认框，是否确定要删除
			var controller=this;
			View.confirm('确定要删除这条请求吗?' ,function(button){
				if(button=='yes'){
					//1、首先删除eq_attach_change表中的记录 1个附件退还单包含多个附件设备
					var restriction = new Ab.view.Restriction();
					restriction.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			    	var delDatas=controller.eq_attach_change_ds.getRecords(restriction);
			    	for (var i = 0; i < delDatas.length; i++) {
						var delData = delDatas[i];
						var record = new Ab.data.Record({
							'eq_attach_change.id': delData.getValue('eq_attach_change.id')
						}, false);
						controller.eq_attach_change_ds.deleteRecord(record);
					}
			    	
					//2、然后删除return_dispose表中的记录
			    	controller.ascBjUsmsEqReturnSch.deleteRecord(rowRecord);
			    	View.alert('数据已经成功删除! ');
			    	
			    	controller.returnDisposeListPanel.refresh();
			    	controller.eqAttachChangeListPanel.refresh();
				}
			});
		}
	},
	//显示设备卡片
	showEqCard:function(){
		var panel = this.eqAttachChangeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_attach_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	}
});
function ASEQ_GetDvName(dvId){
	var parameters = {
			tableName: 'dv',
			fieldNames: toJSON(['dv.dv_name']),
			restriction: "dv.dv_id ='" + dvId + "'"
	};

		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var dvName=dvId;
		if (result.data.records.length > 0) {
			dvName = result.data.records[0]['dv.dv_name'];
		}
		return dvName;
}