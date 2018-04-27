var controller=View.createController('disposeForm',{
	parameters: {'rtrId':0},
	rtrDipId:"",
	auditStatus:"",
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
    afterInitialDataFetch:function(){
    	this.showOtherWindow(true);
    },
	//当点击新增后，加载初始化信息，如清查时间，操作人等
	addInitialInfo: function(){
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
		}else{
			this.returnDisposeDetialPanel.showField("dp.dp_name",false);
		}
		//data_type=0 是设备退还
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.data_type','0');
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.audit_status','0');
		
		this.returnDisposeDetialPanel.showInWindow({
			x:300,
			y:150,
			width:600,
			hight:250
		});
	},
	//清除按钮，清除输入的信息
	clearRdDetialForm: function(){
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.rtr_dip_name','');
		this.returnDisposeDetialPanel.setFieldValue('return_dispose.description','');
	},
	/**
     * 查看设备附件列表
     */
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
	showOtherWindow: function(autoShow){
		if(this.returnDisposeListPanel.rows.length>0){
			var selectRowIndex=-1;
			if(autoShow){
				selectRowIndex=0;
			}else{
				selectRowIndex=this.returnDisposeListPanel.selectedRowIndex;
			}
			var selectRecord=this.returnDisposeListPanel.gridRows.get(selectRowIndex).getRecord();
			var rtrDipId=selectRecord.getValue('return_dispose.rtr_dip_id');
			var rtrStatus=selectRecord.getValue('return_dispose.audit_status');
			
			this.rtrDipId=rtrDipId;
			this.auditStatus=rtrStatus;
			var eqChangeRes=new Ab.view.Restriction();
			eqChangeRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
			this.eqChangeListPanel.refresh(eqChangeRes);
			
			var res2=new Ab.view.Restriction();
			res2.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.eqAttachChangeListPanel.refresh(res2);
			//当处置单的状态为已提交或审核已通过时，所有按钮置灰，不可编辑
			if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4' || rtrStatus=='5'){
				//置灰操作
				disableAll();
				View.alert('此项已提交或审核已通过,不可编辑');
			}
		}
	},
	eqChangeListPanel_afterRefresh: function(){
		var rtrStatus=this.returnDisposeDetialPanel.getRecord().getValue('return_dispose.audit_status'); 
		var eqChangeRows=this.eqChangeListPanel.gridRows;
		if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4'){			
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(false);
			}
		}else{
			for(var j=0;j<eqChangeRows.length;j++){
				eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(true);
			}
		}
	},
	returnDisposeListPanel_btnDeleteRt_onClick: function(row){
		var rowRecord=row.getRecord();
		var auditStatus=rowRecord.getValue('return_dispose.audit_status');
		var rtrDipId=rowRecord.getValue('return_dispose.rtr_dip_id');
		
		this.rtrDipId=rtrDipId;
		this.auditStatus=auditStatus;
		//当状态不是未提交时，不能进行删除。否则，可以删除
		if(auditStatus!='0'){
			View.alert('请求已经提交，不可删除 ! ');
		}else{
			//确认框，是否确定要删除
			var controller=this;
			View.confirm('确定要删除这条请求吗?' ,function(button){
				if(button=='yes'){
					var rtrDs=View.dataSources.get('ascBjUsmsEqReturnSch');
					rtrDs.deleteRecord(rowRecord);
					View.panels.get('returnDisposeListPanel').refresh();
					controller.showOtherWindow(true);
					View.alert('数据已经成功删除! ');
				}
			});
		}
		
	},
	returnDisposeListPanel_onNext:function(row){
		var rowRecord=row.getRecord();
		var rtr_dip_id=rowRecord.getValue('return_dispose.rtr_dip_id');
		var auditStatus=rowRecord.getValue('return_dispose.audit_status');
		
		this.rtrDipId=rtr_dip_id;
		this.auditStatus=auditStatus;
		//当状态不是未提交时，不能进行附件调剂。否则，可以
		if(auditStatus!='0'){
			View.alert('请求已经提交，不可操作 ! ');
			
		}else{
			this.tabs.rtrDipId=rtr_dip_id;
			this.tabs.auditStatus=auditStatus;
			var nextTabName="eqRequestInfoTab";
			this.tabs.findTab("eqRequestTab").enable(false);
			this.tabs.findTab(nextTabName).show(true);
			this.tabs.selectTab(nextTabName,null,false,true,false);
		}
	},
	eqChangeListPanel_onNext:function(){
		var rtrDipId=this.rtrDipId;
		var auditStatus=this.auditStatus;
		//当状态不是未提交时，不能进行附件调剂。否则，可以
		if(auditStatus!='0'){
			View.alert('请求已经提交，不可操作 ! ');
			
		}else{
			this.tabs.rtrDipId=rtrDipId;
			this.tabs.auditStatus=auditStatus;
			var nextTabName="eqRequestInfoTab";
			this.tabs.findTab("eqRequestTab").enable(false);
			this.tabs.findTab(nextTabName).show(true);
			this.tabs.selectTab(nextTabName,null,false,true,false);
		}
	},
	returnDisposeDetialPanel_onBtnSave:function(){
		var success=this.returnDisposeDetialPanel.save();
		if(success){
			var rtrDipId=this.returnDisposeDetialPanel.getFieldValue("return_dispose.rtr_dip_id");
			this.returnDisposeListPanel.refresh();
			var restriction=new Ab.view.Restriction();
			restriction.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
			this.eqChangeListPanel.refresh(restriction);
			
			var restriction2=new Ab.view.Restriction();
			restriction2.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.eqAttachChangeListPanel.refresh(restriction2);
		}
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
	}
});

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
	var returnDisposeDetialPanel=View.panels.get('returnDisposeDetialPanel');
	var eqChangeListPanel=View.panels.get('eqChangeListPanel');
	
	returnDisposeDetialPanel.enableField('return_dispose.rtr_doc',false);
	
	
	var eqChangeRows=eqChangeListPanel.gridRows;
	for(var j=0;j<eqChangeRows.length;j++){
		eqChangeRows.get(j).actions.get('btnEqChangeDelete').enable(false);
//		eqChangeRows.get(j).actions.get('btnAddDocumnet').enable(false);
	}
	
//	eqChangeListPanel.actions.get('btnSubmit').enable(false);
	
}

function showEqlistOfCz(){
	var rtrDipId=View.panels.get('returnDisposeDetialPanel').getFieldValue('return_dispose.rtr_dip_id');
	var res=new Ab.view.Restriction();
	res.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
	View.panels.get('eqChangeListPanel').refresh(res);
}

