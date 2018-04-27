var controller=View.createController('abEqReturnController',{
	auditStatus:"",
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
		var auditStatus=this.tabs.auditStatus;
		var rtrDipId=this.tabs.rtrDipId;
		this.auditStatus=auditStatus;
		this.rtrDipId=rtrDipId;
		
		var userName=View.user.name;//为测试数据，防止出错而添加的判断
		var emId=View.user.employee.id;
		var dvId=ASEQ_getUserDvId(emId);
		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_change.rtr_dip_id",rtrDipId,"=");
		this.eqChangeListPanel.refresh(res1);
		
		var res2=new Ab.view.Restriction();
		res2.addClause("eq_attach_change.rtr_dip_id",rtrDipId,"=");
		this.eqAttachChangeListPanel.refresh(res2);
	},
	eqListPanel_onBack:function() {
		var tabName = 'eqRequestTab';
	    this.tabs.findTab("eqRequestInfoTab").show(false);
		this.tabs.findTab(tabName).loadView();
		this.tabs.selectTab(tabName);
	},
	/**
     * 查看设备附件列表
     */
	showView1:function(){
		
		var selectIndex=this.eqListPanel.selectedRowIndex;
		var addEqId=this.eqListPanel.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		var eqId=this.eqListPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:eqId
		});
	},
	showView2:function(){
		var selectIndex=this.eqChangeListPanel.selectedRowIndex;
		var eqId=this.eqChangeListPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			eqId:eqId
		});
	},
	//处置设备操作
	eqListPanel_btnDispose_onClick: function(row){
		var rowRecord=row.getRecord();
		var eqId=rowRecord.getValue('eq.eq_id');
		
		var record = new Ab.data.Record();
		record.isNew = true;
		var dvId=rowRecord.getValue('eq.dv_id');
	    record.setValue('eq_change.eq_id',rowRecord.getValue('eq.eq_id'));
	    record.setValue('eq_change.eq_id_old',rowRecord.getValue('eq.eq_id_old'));
	    record.setValue('eq_change.rtr_dip_id',this.rtrDipId);
	    record.setValue('eq_change.eq_name',rowRecord.getValue('eq.eq_name'));
	    record.setValue('eq_change.brand',rowRecord.getValue('eq.brand'));
	    record.setValue('eq_change.eq_std',rowRecord.getValue('eq.eq_std'));
	    record.setValue('eq_change.eq_type',rowRecord.getValue('eq.eq_type'));
	    record.setValue('eq_change.csi_id',rowRecord.getValue('eq.csi_id'));
	    record.setValue('eq_change.eq_warehouse',rowRecord.getValue('eq.eq_warehouse'));
	    record.setValue('eq_change.num_eq',rowRecord.getValue('eq.num_eq'));
	    record.setValue('eq_change.units',rowRecord.getValue('eq.units'));
	    record.setValue('eq_change.price',rowRecord.getValue('eq.price'));
	    record.setValue('eq_change.total_price',rowRecord.getValue('eq.total_price'));
	    record.setValue('eq_change.attachments_num',rowRecord.getValue('eq.attachments_num'));
	    record.setValue('eq_change.attachments_price',rowRecord.getValue('eq.attachments_price'));
	    record.setValue('eq_change.date_in_service',rowRecord.getValue('eq.date_in_service'));
	    record.setValue('eq_change.date_purchased',rowRecord.getValue('eq.date_purchased'));
	    record.setValue('eq_change.em_id_old',rowRecord.getValue('eq.em_id'));
	    record.setValue('eq_change.em_name_old',rowRecord.getValue('eq.em_name'));
	    record.setValue('eq_change.bl_id_old',rowRecord.getValue('eq.bl_id'));
	    record.setValue('eq_change.bl_name_old',rowRecord.getValue('bl.name'));
	    record.setValue('eq_change.fl_id_old',rowRecord.getValue('eq.fl_id'));
	    record.setValue('eq_change.rm_id_old',rowRecord.getValue('eq.rm_id'));
	    record.setValue('eq_change.type_use_old',rowRecord.getValue('eq.type_use'));
	    record.setValue('eq_change.dv_id_old',dvId);
	    record.setValue('eq_change.dv_name_old',rowRecord.getValue('dv.dv_name'));
	    record.setValue('eq_change.dp_id_old',rowRecord.getValue('eq.dp_id'));
	    record.setValue('eq_change.dp_name_old',rowRecord.getValue('dp.dp_name'));
	    record.setValue('eq_change.buy_type',rowRecord.getValue('eq.buy_type'));
	    record.setValue('eq_change.source',rowRecord.getValue('eq.source'));
	    record.setValue('eq_change.ctry_id',rowRecord.getValue('eq.ctry_id'));
	    record.setValue('eq_change.ctry_name',rowRecord.getValue('eq.ctry_name'));
	    record.setValue('eq_change.num_serial',rowRecord.getValue('eq.num_serial'));
	    record.setValue('eq_change.vn_id',rowRecord.getValue('eq.vn_id'));
	    record.setValue('eq_change.is_up',rowRecord.getValue('eq.is_up'));
	    record.setValue('eq_change.sch_status',rowRecord.getValue('eq.sch_status'));
	    record.setValue('eq_change.add_comment',rowRecord.getValue('eq.add_comment'));
	    
	    var operatorEm=View.user.employee.id;
	    record.setValue('eq_change.operator',operatorEm);
	    record.setValue('eq_change.change_reason','');
	    record.setValue('eq_change.cost_old',rowRecord.getValue('eq.price'));
//	    record.setValue('eq_change.comments',rowRecord.getValue('eq.comments'));
	    record.setValue('eq_change.check_status','0');
	    record.setValue('eq_change.type_adjust',2);
	    record.setValue('eq_change.audit_status',0);
	    
//	    var dvName=ASEQ_GetDvName(dvId);
//	    record.setValue('eq_change.dv_name_old',dvName);
	    
	    View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').saveRecord(record);
	    var numEq=rowRecord.getValue('eq.num_eq');
	    if(numEq>0){
	    	//主体设备退还时，该主体设备下的附件也要一次退还，把这个些设备附件信息写到eq_attach_change表中
	    	try {
	    		Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-insertIntoEqAttachChange', eqId, this.rtrDipId);
	    	} 
	    	catch (e) {
	    		Workflow.handleError(e);
	    		View.alert('工作流失败');
	    	}
	    }
	    this.eqChangeListPanel.refresh();
	    this.eqAttachChangeListPanel.refresh();
	    this.eqListPanel.refresh();
	},
	//删除已经添加到eq_change表中的设备
	eqChangeListPanel_btnEqChangeDelete_onClick: function(row){
		//1、删除eq_change表中的数据
		var selectRecord=row.getRecord();
		View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').deleteRecord(selectRecord);
		
		var rtr_dip_id=selectRecord.getValue("eq_change.rtr_dip_id");
		var eq_id=selectRecord.getValue("eq_change.eq_id");
		//2、删除eq_attach_change表中的数据
        var restriction=new Ab.view.Restriction();
	    var account = View.dataSources.get("eq_attach_change_ds");
	    restriction.addClause("eq_attach_change.rtr_dip_id",rtr_dip_id,"=");
	    restriction.addClause("eq_attach_change.eq_id",eq_id,"=");
	   
		var records=account.getRecords(restriction);
		for(var i=0;i<records.length;i++){
			var record=records[i];
			account.deleteRecord(record);
		}
		
		this.eqChangeListPanel.refresh();
		this.eqAttachChangeListPanel.refresh();
		this.eqListPanel.refresh();
	},
	//上传文档和资料确定操作
	addDocFormPanel_onBtnSure: function(){
		var doc=this.addDocFormPanel.getFieldValue('eq_change.eq_change_doc');
		var changeReason=this.addDocFormPanel.getFieldValue('eq_change.change_reason');
		View.panels.get('addDocFormPanel').save();
		View.panels.get('addDocFormPanel').closeWindow();
		View.panels.get('eqChangeListPanel').refresh();
	},
	//确认提交操作
	eqChangeListPanel_onBtnSubmit: function(){
		var rtrDipId=this.rtrDipId;
		var gridRows=this.eqChangeListPanel.gridRows;
		if(gridRows.length==0){
			View.alert('列表中没有待处置设备，请选择设备进行处置 ');
			return;
		}
		//当列表中的变更原因为空时，终止提交
		var eqChangeDs=View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust');
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		eqChangeRes.addClause('eq_change.change_reason','','=');
		var eqChangeRecord=eqChangeDs.getRecord(eqChangeRes);
		if(!eqChangeRecord.isNew){
			View.alert('退还列表中存在设备未添加变更原因，请添加退还原因 !');
			return;
		}
		
		View.confirm('提交后将无法修改,确定要提交吗?',function(button){
			if(button=='yes'){
					var rtrRes=new Ab.view.Restriction();
					rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
					var rtrRecord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
					rtrRecord.setValue('return_dispose.audit_status','1');
					View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRecord);
					
					disableAll();
					View.alert('申请提交成功,请等待审核');
			}
		});
	},
	eqChangeListPanel_afterRefresh: function(){
		var rtrStatus=this.auditStatus;
		var eqChangeRows=this.eqChangeListPanel.gridRows;
		if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4'){			
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(false);
				eqChangeRows.get(j).actions.get('btnAddDocumnet').enable(false);
			}
			this.eqChangeListPanel.actions.get('btnSubmit').enable(false);
		}else{
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(true);
				eqChangeRows.get(j).actions.get('btnAddDocumnet').enable(true);
			}
			this.eqChangeListPanel.actions.get('btnSubmit').enable(true);
			
		}
	},
	//打印资产处置单的操作
	eqChangeListPanel_onBtnPrintCZD: function(){
//		var rtrDipId=this.returnDisposeDetialPanel.getFieldValue('return_dispose.rtr_dip_id');
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
	}
});

//打开上传附件资料窗口
function showDocDialog(value){
	var addDocFormPanel=View.panels.get('addDocFormPanel');
	var eqChangeId=value.restriction['eq_change.id'];
	addDocFormPanel.show(true);
	addDocFormPanel.showInWindow({
		x:400,
		y:300,
        width: 550,
        height: 300
    });
	addDocFormPanel.refresh(value.restriction);
}

//显示设备卡片
function showEqCard(value){
	var eq_id = value.restriction['eq.eq_id'];
	View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
    	width: 600,
    	height: 400,
    	eq_id: eq_id
    });
}
function showEqCard2(value){
	var eqChangeListPanel=View.panels.get('eqChangeListPanel');
	var selectIndex=eqChangeListPanel.selectedRowIndex;
	var eqId=eqChangeListPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
	View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
    	width: 600,
    	height: 400,
    	eq_id: eqId
    });
}
//置灰操作
function disableAll(){
	var returnDisposeListPanel=View.panels.get('returnDisposeListPanel');
//	var returnDisposeDetialPanel=View.panels.get('returnDisposeDetialPanel');
	var eqListPanel=View.panels.get('eqListPanel');
	var eqChangeListPanel=View.panels.get('eqChangeListPanel');
	
//	returnDisposeDetialPanel.actions.get('btnSave').enable(false);
//	returnDisposeDetialPanel.actions.get('btnClear').enable(false);
//	returnDisposeDetialPanel.enableField('return_dispose.rtr_doc',false);
	
	var gridRows=eqListPanel.gridRows;
	for(var i=0;i<gridRows.length;i++){
		gridRows.get(i).actions.get('btnDispose').enable(false);
		//gridRows.get(i).actions.get('btnDispose').show(false);
	}
	
	var eqChangeRows=eqChangeListPanel.gridRows;
	for(var j=0;j<eqChangeRows.length;j++){
		eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(false);
		eqChangeRows.get(j).actions.get('btnAddDocumnet').enable(false);
	}
	
	eqChangeListPanel.actions.get('btnSubmit').enable(false);
}

function showEqlistOfCz(){
//	var rtrDipId=View.panels.get('returnDisposeDetialPanel').getFieldValue('return_dispose.rtr_dip_id');
	var res=new Ab.view.Restriction();
	res.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
	View.panels.get('eqChangeListPanel').refresh(res);
	View.panels.get('eqListPanel').refresh();
}

