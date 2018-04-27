var controller=View.createController('disposeForm',{
	rtrDipId:"",
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
    afterInitialDataFetch:function(){
    	this.onStart();
    },	
	helpPanel_afterRefresh:function(){
		this.onStart();
	},
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.rtrDipId=this.tabs.rtrDipId;
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_attach_change.rtr_dip_id",this.rtrDipId,"=");
		this.eqAttachChangeListPanel.refresh(restriction);
	},
	eqAttachListPanel_onBack:function() {
		var tabName = 'eqAttachRequestTab';
	    this.tabs.findTab("eqAttachInfoTab").show(false);
		this.tabs.findTab(tabName).loadView();
		this.tabs.selectTab(tabName);
	},
	eqAttachChangeListPanel_btnEqAttachChgDelete_onClick:function(row){
		var selectRecord=row.getRecord();
		View.dataSources.get('eq_attach_change_ds').deleteRecord(selectRecord);
		this.eqAttachChangeListPanel.refresh();
		this.eqAttachListPanel.refresh();
	},
	//处置设备操作
	eqAttachListPanel_btnDispose_onClick: function(row){
		var rowRecord=row.getRecord();
		var eqId=rowRecord.getValue('eq_attach.eq_attach_id');
		
		var record = new Ab.data.Record();
		record.isNew = true;
		var dvId=rowRecord.getValue('eq_attach.dv_id');
		record.setValue('eq_attach_change.eq_id',rowRecord.getValue('eq_attach.eq_id'));
		record.setValue('eq_attach_change.rtr_dip_id',this.rtrDipId);
		record.setValue('eq_attach_change.eq_attach_id',rowRecord.getValue('eq_attach.eq_attach_id'));
	    record.setValue('eq_attach_change.eq_attach_name',rowRecord.getValue('eq_attach.eq_attach_name'));
	    record.setValue('eq_attach_change.brand',rowRecord.getValue('eq_attach.brand'));
	    record.setValue('eq_attach_change.eq_std',rowRecord.getValue('eq_attach.eq_std'));
	    record.setValue('eq_attach_change.eq_type',rowRecord.getValue('eq_attach.eq_type'));
	    record.setValue('eq_attach_change.csi_id',rowRecord.getValue('eq_attach.csi_id'));
	    record.setValue('eq_attach_change.eq_warehouse',rowRecord.getValue('eq_attach.eq_warehouse'));
	    record.setValue('eq_attach_change.num_eq',rowRecord.getValue('eq_attach.num_eq'));
	    record.setValue('eq_attach_change.price',rowRecord.getValue('eq_attach.price'));
	    record.setValue('eq_attach_change.units',rowRecord.getValue('eq_attach.units'));
	    record.setValue('eq_attach_change.source',rowRecord.getValue('eq_attach.source'));
	    record.setValue('eq_attach_change.ctry_id',rowRecord.getValue('eq_attach.ctry_id'));
	    record.setValue('eq_attach_change.ctry_name',rowRecord.getValue('eq_attach.ctry_name'));
	    record.setValue('eq_attach_change.dv_id_old',rowRecord.getValue('eq_attach.dv_id'));
	    
	    var dvName=ASEQ_GetDvName(dvId);
	    record.setValue('eq_attach_change.dv_name_old',dvName);
	    record.setValue('eq_attach_change.type_use_old',rowRecord.getValue('eq_attach.type_use'));
	    record.setValue('eq_attach_change.buy_type',rowRecord.getValue('eq_attach.buy_type'));
	    record.setValue('eq_attach_change.source',rowRecord.getValue('eq_attach.source'));
	    record.setValue('eq_attach_change.num_serial',rowRecord.getValue('eq_attach.num_serial'));
	    record.setValue('eq_attach_change.date_purchased',rowRecord.getValue('eq_attach.date_purchased'));
	    record.setValue('eq_attach_change.bl_id',rowRecord.getValue('eq_attach.bl_id'));
	    record.setValue('eq_attach_change.fl_id',rowRecord.getValue('eq_attach.fl_id'));
	    record.setValue('eq_attach_change.rm_id',rowRecord.getValue('eq_attach.rm_id'));
	    record.setValue('eq_attach_change.em_id',rowRecord.getValue('eq_attach.em_id'));
	    record.setValue('eq_attach_change.em_name',rowRecord.getValue('eq_attach.em_name'));
	    record.setValue('eq_attach_change.vn_id',rowRecord.getValue('eq_attach.vn_id'));
	    record.setValue('eq_attach_change.sch_status',rowRecord.getValue('eq_attach.sch_status'));
	    record.setValue('eq_attach_change.subject_funds',rowRecord.getValue('eq_attach.subject_funds'));
	    record.setValue('eq_attach_change.adjust_status','0');
//	    record.setValue('eq_attach_change.date_manufactured',rowRecord.getValue('eq_attach.date_manufactured'));
	    
	    var account=View.dataSources.get('eq_attach_change_ds');
	    account.saveRecord(record);
	    
	    this.eqAttachListPanel.refresh();
	    this.eqAttachChangeListPanel.refresh();
	},
	//删除已经添加到eq_change表中的设备
	eqChangeListPanel_btnEqChangeDelete_onClick: function(row){
		var selectRecord=row.getRecord();
		View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').deleteRecord(selectRecord);
		this.eqChangeListPanel.refresh();
		this.eqListPanel.refresh();
	},
	//上传文档和资料确定操作
	addDocFormPanel_onBtnSure: function(){
		var doc=this.addDocFormPanel.getFieldValue('eq_change.eq_change_doc');
		var changeReason=this.addDocFormPanel.getFieldValue('eq_change.change_reason');
		this.addDocFormPanel.save();
		this.addDocFormPanel.closeWindow();
		this.eqAttachChangeListPanel.refresh();
	},
	//确认提交操作
	eqAttachChangeListPanel_onBtnSubmit: function(){
		var gridRows=this.eqAttachChangeListPanel.gridRows;
		if(gridRows.length==0){
			View.showMessage("没有需要提交的数据！");
			return;
		}
		//当列表中的变更原因为空时，终止提交
		var eqChangeDs=View.dataSources.get('eq_attach_change_ds');
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_attach_change.rtr_dip_id',this.rtrDipId,'=');
		eqChangeRes.addClause('eq_attach_change.change_reason','','=');
		var eqChangeRecord=eqChangeDs.getRecord(eqChangeRes);
		if(!eqChangeRecord.isNew){
			View.alert('附件退还列表中存在设备附件未添加退还原因，请添加退还原因 !');
			return;
		}
		var controller=this;
		View.confirm('提交后将无法修改,确定要提交吗?',function(button){
			if(button=='yes'){
					var rtrRes=new Ab.view.Restriction();
					rtrRes.addClause('return_dispose.rtr_dip_id',controller.rtrDipId,'=');
					var rtrRecord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
					rtrRecord.setValue('return_dispose.audit_status','1');
					View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRecord);
					
					disableAll();
					View.alert('申请提交成功,请等待审核！');
			}
		});
	},
	//打印资产处置单的操作
	eqChangeListPanel_onBtnPrintCZD: function(){
		var rtrDipId=this.returnDisposeDetialPanel.getFieldValue('return_dispose.rtr_dip_id');
		this.parameters['rtrId']=parseInt(rtrDipId);
		if(this.parameters['rtrId']==0){
			View.alert("没有执行处置操作,请先执行处置操作");
			return;
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width:470, 
			height:200,
			xmlName:"wjmChuZhiShenBao",
			parameters:this.parameters, closeButton:false});
	},
	returnDisposeListPanel_btnDeleteRt_onClick: function(row){
		var rowRecord=row.getRecord();
		var auditStatus=rowRecord.getValue('return_dispose.audit_status');
		var rtrDipId=rowRecord.getValue('return_dispose.rtr_dip_id');
		//当状态不是未提交时，不能进行删除。否则，可以删除
		if(auditStatus!='0'){
			View.alert('请求已经提交，不可删除 ! ');
		}else{
			//确认框，是否确定要删除
			View.confirm('确定要删除这条请求吗?' ,function(button){
				if(button=='yes'){
					var rtrDs=View.dataSources.get('ascBjUsmsEqReturnSch');
					rtrDs.deleteRecord(rowRecord);
					View.alert('数据已经成功删除! ');
					var rtrPanelId=View.panels.get('returnDisposeDetialPanel').getFieldValue('return_dispose.rtr_dip_id');
					//当删除的是目前正在打开的项时，隐藏其余panel
					if(rtrDipId==rtrPanelId){
						View.panels.get('returnDisposeDetialPanel').show(false);
						View.panels.get('eqListPanel').show(false);
						View.panels.get('eqChangeListPanel').show(false);
					}
					View.panels.get('returnDisposeListPanel').refresh();
				}
			});
		}
	},
	//显示设备卡片
	showEqCard:function(){
		var panel = this.eqAttachListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_attach.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	},
	//显示设备卡片
	showEqCard2:function(){
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
//打开上传附件资料窗口
function showDocDialog(value){
	var addDocFormPanel=View.panels.get('addDocFormPanel');
	addDocFormPanel.show(true);
	addDocFormPanel.showInWindow({
		x:400,
		y:300,
        width: 550,
        height: 300
    });
	addDocFormPanel.refresh(value.restriction);
}
//置灰操作
function disableAll(){
	var eqAttachListPanel=View.panels.get('eqAttachListPanel');
	var eqAttachChangeListPanel=View.panels.get('eqAttachChangeListPanel');
	
	var gridRows=eqAttachListPanel.gridRows;
	for(var i=0;i<gridRows.length;i++){
		gridRows.get(i).actions.get('btnDispose').enable(false);
	}
	
	var eqChangeRows=eqAttachChangeListPanel.gridRows;
	for(var j=0;j<eqChangeRows.length;j++){
		eqChangeRows.get(j).actions.get('btnEqAttachChgDelete').enable(false);
		eqChangeRows.get(j).actions.get('btnAddDocumnet').enable(false);
	}
	eqAttachChangeListPanel.actions.get('btnSubmit').enable(false);
}

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