var controller=View.createController('disposeForm',{
	parameters: {'rtrId':0},
	afterViewLoad: function(){
    	this.eqChangeListPanel.buildPostFooterRows = addTotalRow;
	},
	//当点击新增后，加载初始化信息，如清查时间，操作人等
	addInitialInfo: function(){
		var requestDate=new Date();
		var requestEm=View.user.employee.id;
		var requestDv=View.user.employee.organization.divisionId;
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.date_request',requestDate);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.request_by',requestEm);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.dv_id',requestDv);
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.data_type','1');
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.audit_status','0');
	},
	//清除按钮，清除输入的信息
	clearRdDetialForm: function(){
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.rtr_dip_name','');
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.description','');
	},
	showOtherWindow: function(){
		this.eqListPanel.show(true);
		var selectRowIndex=this.returnDisposeListPanel.selectedRowIndex;
		var selectRecord=this.returnDisposeListPanel.gridRows.get(selectRowIndex).getRecord();
		var rtrDipId=selectRecord.getValue('return_dispose.rtr_dip_id');
		var rtrStatus=selectRecord.getValue('return_dispose.audit_status');
		
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		this.eqChangeListPanel.refresh(eqChangeRes);
		//当处置单的状态为已提交或审核已通过时，所有按钮置灰，不可编辑
		if(rtrStatus=='1'||rtrStatus=='2' ||rtrStatus=='4'){
			//置灰操作
			disableAll();
			View.alert('此项已提交或审核已通过,不可编辑');
			this.eqListPanel.refresh();
			
		}else{
			this.eqListPanel.refresh();
		}
	},
	//处置设备操作
	eqListPanel_btnDispose_onClick: function(row){
		var rowRecord=row.getRecord();
		/*row.actions.get('btnDispose').setTitle('已报减');
		row.actions.get('btnDispose').enable(false);*/
		var eqId=rowRecord.getValue('eq.eq_id');
		var rtrDipId=this.returnDisposeDetialPanel.getFieldValue('return_dispose.rtr_dip_id');
		/*//查询该退还单下是否有此设备
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		eqRes.addClause('eq_change.eq_id',eqId,'=');
		var eqRecord=View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').getRecord(eqRes);
		if(!eqRecord.isNew){
			View.alert('此设备已在列表中已经添加到列表,不可重复添加');
			return;
		}*/
		//查询eq_change表中是否有已提交未审核的此项设备
//		var eqChangeRes=new Ab.view.Restriction();
//		eqChangeRes.addClause('eq_change.eq_id',eqId,'=');
//		eqChangeRes.addClause('eq_change.audit_status','0','=');
//		var eqChangeReocrd=View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').getRecord(eqChangeRes);
//		if(!eqChangeReocrd.isNew){
//			View.alert('目前此设备正在执行其他操作,暂时处于被锁定状态,不可执行此操作');
//			return;
//		}
		
		var record = new Ab.data.Record();
		record.isNew = true;
	    record.setValue('eq_change.eq_id',rowRecord.getValue('eq.eq_id'));
	    record.setValue('eq_change.rtr_dip_id',rtrDipId);
	    record.setValue('eq_change.eq_name',rowRecord.getValue('eq.eq_name'));
	    record.setValue('eq_change.eq_type',rowRecord.getValue('eq.eq_type'));
	    record.setValue('eq_change.eq_std',rowRecord.getValue('eq.eq_std'));
	    record.setValue('eq_change.em_id_old',rowRecord.getValue('eq.em_id'));
	    record.setValue('eq_change.bl_id_old',rowRecord.getValue('eq.bl_id'));
	    record.setValue('eq_change.fl_id_old',rowRecord.getValue('eq.fl_id'));
	    record.setValue('eq_change.rm_id_old',rowRecord.getValue('eq.rm_id'));
	    record.setValue('eq_change.type_use_old',rowRecord.getValue('eq.type_use'));
	    record.setValue('eq_change.dv_id_old',rowRecord.getValue('eq.dv_id'));
	    record.setValue('eq_change.dp_id_old',rowRecord.getValue('eq.dp_id'));
	    record.setValue('eq_change.dl_id_old',rowRecord.getValue('eq.dl_id'));
	    var operatorEm=View.user.employee.id;
	    record.setValue('eq_change.operator',operatorEm);
	    record.setValue('eq_change.change_reason','');
	    record.setValue('eq_change.cost_old',rowRecord.getValue('eq.price'));
	    record.setValue('eq_change.comments',rowRecord.getValue('eq.comments'));
	    record.setValue('eq_change.check_status','0');
	    record.setValue('eq_change.type_adjust',3);
	    record.setValue('eq_change.audit_status',0);
	    
	    View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').saveRecord(record);
	    this.eqChangeListPanel.refresh();
	    this.eqListPanel.refresh();
	},
	//删除已经添加到eq_change表中的设备
	eqChangeListPanel_btnEqChangeDelete_onClick: function(row){
		var selectRecord=row.getRecord();
		View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust').deleteRecord(selectRecord);
		this.eqChangeListPanel.refresh();
		this.eqListPanel.refresh();
	},
	
	//显示设备卡片
	showEqCard:function(){
		var panel = this.eqListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_attach.eq_id",eq_id,"=");
		this.eqAttachListPanel.show();
		this.eqAttachListPanel.refresh(restriction);
		this.eqAttachListPanel.setTitle("设备【"+eq_id+"】附件列表");
		
		this.attachDisposeListPanel.show();
	},
	//上传文档和资料确定操作
	addDocFormPanel_onBtnSure: function(){
		var doc=this.addDocFormPanel.getFieldValue('eq_change.eq_change_doc');
		var changeReason=this.addDocFormPanel.getFieldValue('eq_change.change_reason');
		View.panels.get('addDocFormPanel').save();
		View.panels.get('addDocFormPanel').closeWindow();
		View.panels.get('eqChangeListPanel').refresh();
	},
	//附件转化为主体设备
	eqAttachListPanel_onChange: function(){
		
	},
	//确认提交操作
	eqChangeListPanel_onBtnSubmit: function(){
		var rtrDipId=this.returnDisposeDetialPanel.getFieldValue('return_dispose.rtr_dip_id');
		var auditStatus=this.returnDisposeDetialPanel.getFieldValue('return_dispose.audit_status');
		var gridRows=this.eqChangeListPanel.gridRows;
		if(gridRows.length==0){
			View.alert('列表中没有待处置设备，请选择设备进行处置 ');
			return;
		}
		
		View.confirm('提交后将无法修改,确定要提交吗?',function(button){
			if(button=='yes'){
				var isDone=true;
				if(auditStatus!='3'){
					var record=getActivityLogRecord(rtrDipId);
					isDone=submitRequest(record);
				}else{
					isDone=true;
				}
				
				if(isDone==false){
					View.alert('提交失败,请重新提交');
					return;
				}else{
					var rtrRes=new Ab.view.Restriction();
					rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
					var rtrRecord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
					rtrRecord.setValue('return_dispose.audit_status','1');
					View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRecord);
					
					View.panels.get('returnDisposeListPanel').refresh();
					var rtrDipRes=new Ab.view.Restriction();
					rtrDipRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
					View.panels.get('returnDisposeDetialPanel').refresh(rtrDipRes);
					disableAll();
					View.alert('申请提交成功,请等待审核');
				}
			}
		});
	},
	eqListPanel_afterRefresh: function(){
		var rtrStatus=this.returnDisposeDetialPanel.getRecord().getValue('return_dispose.audit_status');
		var gridRows=this.eqListPanel.gridRows;
		if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4'){
			for(var i=0;i<gridRows.length;i++){
				gridRows.get(i).actions.get('btnDispose').enable(false);
				//gridRows.get(i).actions.get('btnDispose').show(false);
			}
		}else{
			for(var i=0;i<gridRows.length;i++){
				gridRows.get(i).actions.get('btnDispose').enable(true);
				//gridRows.get(i).actions.get('btnDispose').show(false);
			}
		}
		
		//将已经报减的设备的行设置为“已报减”
		/*var eq_gridRows=this.eqListPanel.gridRows;
		for(var i=0;i<eq_gridRows.length;i++){
			eq_id=eq_gridRows.get(i).getRecord().getValue('eq.eq_id');
			var bjGridRows=this.eqChangeListPanel.gridRows;
			for(var j=0;j<bjGridRows.length;j++){
				var bj_eqId=bjGridRows.get(j).getRecord().getValue('eq_change.eq_id');
				if(eq_id==bj_eqId){
					eq_gridRows.get(i).actions.get('btnDispose').setTitle('已报减');
					eq_gridRows.get(i).actions.get('btnDispose').enable(false);
				}
			}
		}*/
		
	},
	eqChangeListPanel_afterRefresh: function(){
		var rtrStatus=this.returnDisposeDetialPanel.getRecord().getValue('return_dispose.audit_status'); 
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
		this.eqChangeListPanel.buildPostFooterRows = addTotalRow;	
	},
	//删除未发布的请求
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
		
	}
	//打印资产处置单的操作
//	eqChangeListPanel_onBtnPrintCZD: function(){
//		var rtrDipId=this.returnDisposeDetialPanel.getFieldValue('return_dispose.rtr_dip_id');
//		this.parameters['rtrId']=parseInt(rtrDipId);
//		if(this.parameters['rtrId']==0){
//			View.alert("没有执行处置操作,请先执行处置操作");
//			return;
//		}
//		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBao",parameters:this.parameters, closeButton:false});
//	}
});

//打开上传附件资料窗口
function showDocDialog(value){
	var addDocFormPanel=View.panels.get('addDocFormPanel');
	var eqChangeId=value.restriction['eq_change.id'];
	addDocFormPanel.show(true);
	addDocFormPanel.showInWindow({
        width: 450,
        height: 300
    });
	addDocFormPanel.refresh(value.restriction);
}

function getActivityLogRecord(rtrDipId){

	var requestor=View.user.employee.id;
	var dv_id=View.user.employee.organization.divisionId
	
	var record = {};
		
	record['activity_log.activity_log_id'] = '0';
	record['activity_log.activity_type'] = 'SD -设备处置';
	record['activity_log.prob_type'] = '设备管理';
	record['activity_log.requestor'] = requestor;
	//record['activity_log.date_required'] = check_date;
	record['activity_log.dv_id'] = dv_id;
	record['activity_log.rtr_dip_id'] = rtrDipId;
	return record;
}

function submitRequest(record){
	try {
		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
		return true;
	}catch (e) {
        Workflow.handleError(e);
        return false;
    }
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
	var returnDisposeDetialPanel=View.panels.get('returnDisposeDetialPanel');
	var eqListPanel=View.panels.get('eqListPanel');
	var eqChangeListPanel=View.panels.get('eqChangeListPanel');
	
	returnDisposeDetialPanel.actions.get('btnSave').enable(false);
	returnDisposeDetialPanel.actions.get('btnClear').enable(false);
	returnDisposeDetialPanel.enableField('return_dispose.rtr_doc',false);
	
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
	var rtrDipId=View.panels.get('returnDisposeDetialPanel').getFieldValue('return_dispose.rtr_dip_id');
	var res=new Ab.view.Restriction();
	res.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
	View.panels.get('eqChangeListPanel').refresh(res);
	View.panels.get('eqListPanel').refresh();
}


function addTotalRow(parentElement){
//	   if (this.rows.length < 2) {
//	       return;
//	   }
		var eqPrice=0.00;
		var totalPrice= 0.00;
		
		var rtrDipId=View.panels.get("returnDisposeDetialPanel").getFieldValue("return_dispose.rtr_dip_id");
		View.dataSources.get("ascReturnSumPriceDs").addParameter("rtrDipId",rtrDipId);
		var record=View.dataSources.get("ascReturnSumPriceDs").getRecord();
		var sumPrice=record.getValue("eq_change.sumPrice");
	   // create new grid row and cells containing statistics
	   var gridRow = document.createElement('tr');
	   parentElement.appendChild(gridRow);
	   // column 1: 'Total' title
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '合计');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1, '');
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   //addColumn(gridRow, 1,totalPrice.toFixed(2));
	   addColumn(gridRow, 1,sumPrice);
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   addColumn(gridRow, 1,'' );
	   
	}