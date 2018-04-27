var controller=View.createController('returnSchForm',{
	parameters: {'rtrDipId':0},
	rtrDipId:"",
	showAttachInfo: function(autoShow){
		if(this.returnEqGrid.rows.length>0){
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=this.returnEqGrid.selectedRowIndex;
			}
			var row=this.returnEqGrid.rows[selectedIndex];
			var rtrDipId=row["return_dispose.rtr_dip_id"];
			this.rtrDipId=rtrDipId;
			var eqChangeRes=new Ab.view.Restriction();
			eqChangeRes.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.returnAttachListGrid.refresh(eqChangeRes);
		}
	},
	//打印设备退还单
	returnListGrid_onBtnPrint: function(){
		var rtrDipId=this.returnEqForm.getFieldValue('return_dispose.rtr_dip_id');
		this.parameters['rtrDipId']=rtrDipId;
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width:470, 
			height:200,
			xmlName:"wjmSheBeiTuiHuan",
			parameters:this.parameters, 
			closeButton:false
			});
	},
	/**
     * 查看设备附件列表
     */
    returnListGrid_onViewAttach:function(){
    	var selectIndex=this.returnListGrid.selectedRowIndex;
		var addEqId=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_change.add_eq_id');
		var eqId=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:eqId
		});
    },
	returnListGrid_onBtnChange: function(){
		var index=this.returnListGrid.selectedRowIndex;
		this.choseTypePanel.clear();
		var record=this.returnListGrid.gridRows.get(index).getRecord();
		var Id=record.getValue('eq_change.id');
		this.choseTypePanel.setFieldValue('eq_change.id',Id);
		this.choseTypePanel.showInWindow({
	        width: 400,
	        height: 300,
	        closeButton: false 
	    });
		this.choseTypePanel.show(true);
		$('selectTJ').checked=true;
		$('rowIndex').value="2";
	},
	returnAttachListGrid_onBtnDoneReturn: function(){
		this.addApprovePanel.showInWindow({
			x:200,
			y:100,
			width:600,
			height:200,
			closeButton:false 
		});
		var restriction=new Ab.view.Restriction();
		restriction.addClause('return_dispose.rtr_dip_id',this.rtrDipId,'=');
		this.addApprovePanel.refresh(restriction);
	},
	addApprovePanel_onBtnSave:function(){
		if(this.addApprovePanel.canSave()){
			var success=this.addApprovePanel.save();
			if(success){
				var controller=this;
				View.confirm('确定审批通过此退还单吗?',function(button){
					if(button=='yes'){
						var rtrRes=new Ab.view.Restriction();
						rtrRes.addClause('return_dispose.rtr_dip_id',controller.rtrDipId,'=');
						var rtrRcord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
						rtrRcord.setValue('return_dispose.audit_status','4');
						try{
							//1、将所有调剂的设备附件 都写到eq表中
							var eqChangeRes=new Ab.view.Restriction();
							eqChangeRes.addClause('eq_attach_change.rtr_dip_id',controller.rtrDipId,'=');		
							var eqChangeDs=View.dataSources.get('eq_attach_change_ds');
							var eqChangeRecords=eqChangeDs.getRecords(eqChangeRes);
							
							var eqDs=View.dataSources.get('eq_ds');
							for(var i=0;i<eqChangeRecords.length;i++){
								var rowRecord=eqChangeRecords[i];
								var eqAttachId=rowRecord.getValue('eq_attach_change.eq_attach_id');
								
								var eqRecord = new Ab.data.Record();
								eqRecord.isNew = true;
								eqRecord.setValue('eq.eq_id',rowRecord.getValue('eq_attach_change.eq_attach_id'));
								eqRecord.setValue('eq.eq_name',rowRecord.getValue('eq_attach_change.eq_attach_name'));
								eqRecord.setValue('eq.brand',rowRecord.getValue('eq_attach_change.brand'));
								eqRecord.setValue('eq.eq_std',rowRecord.getValue('eq_attach_change.eq_std'));
								eqRecord.setValue('eq.eq_type',rowRecord.getValue('eq_attach_change.eq_type'));
								eqRecord.setValue('eq.csi_id',rowRecord.getValue('eq_attach_change.csi_id'));
								eqRecord.setValue('eq.eq_warehouse',rowRecord.getValue('eq_attach_change.eq_warehouse'));
								eqRecord.setValue('eq.num_eq',rowRecord.getValue('eq_attach_change.num_eq'));
								eqRecord.setValue('eq.price',rowRecord.getValue('eq_attach_change.price'));
								eqRecord.setValue('eq.total_price',rowRecord.getValue('eq_attach_change.price'));
								eqRecord.setValue('eq.units',rowRecord.getValue('eq_attach_change.units'));
								eqRecord.setValue('eq.source',rowRecord.getValue('eq_attach_change.source'));
								eqRecord.setValue('eq.ctry_id',rowRecord.getValue('eq_attach_change.ctry_id'));
								eqRecord.setValue('eq.ctry_name',rowRecord.getValue('eq_attach_change.ctry_name'));
								eqRecord.setValue('eq.dv_id',rowRecord.getValue('eq_attach_change.dv_id'));
								eqRecord.setValue('eq.dp_id',rowRecord.getValue('eq_attach_change.dp_id'));
								eqRecord.setValue('eq.type_use',rowRecord.getValue('eq_attach_change.type_use'));
								eqRecord.setValue('eq.buy_type',rowRecord.getValue('eq_attach_change.buy_type'));
								eqRecord.setValue('eq.source',rowRecord.getValue('eq_attach_change.source'));
								eqRecord.setValue('eq.num_serial',rowRecord.getValue('eq_attach_change.num_serial'));
								eqRecord.setValue('eq.date_purchased',rowRecord.getValue('eq_attach_change.date_purchased'));
								eqRecord.setValue('eq.bl_id',"");
								eqRecord.setValue('eq.fl_id',"");
								eqRecord.setValue('eq.rm_id',"");
								eqRecord.setValue('eq.em_id',"");
								eqRecord.setValue('eq.em_name',"");
								eqRecord.setValue('eq.sch_status',"2");
								eqRecord.setValue('eq.vn_id',rowRecord.getValue('eq_attach_change.vn_id'));
								eqRecord.setValue('eq.subject_funds',rowRecord.getValue('eq_attach_change.subject_funds'));
								eqRecord.setValue('eq.is_up',rowRecord.getValue('eq_attach_change.is_up'));
								eqRecord.setValue('eq.add_comment',rowRecord.getValue('eq_attach_change.add_comment'));
								eqDs.saveRecord(eqRecord);
								
								//2、将相应设备附件表中数据更改状态  7=调出
								var restriction=new Ab.view.Restriction();
								restriction.addClause('eq_attach.eq_attach_id',eqAttachId,'=');	
								var account=View.dataSources.get('eq_attach_ds');
								var attachRecord=account.getRecord(restriction);
								attachRecord.setValue("eq_attach.sch_status","7");
								account.saveRecord(attachRecord);
							}
							View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRcord);
							controller.addApprovePanel.closeWindow();
							View.panels.get('returnEqGrid').refresh();
							View.panels.get('returnAttachListGrid').show(false);
							View.alert('审批结果提交成功 !');
						}catch(e){
							View.alert('退还终审程序出错,请尝试重新操作');
							return;
						}	
					}
				});
			}
		}
	},
	//驳回此退还单
	returnEqForm_onBtnReject: function(){
		//验证是否输入终审信息
		var apprOption=this.returnEqForm.getFieldValue('return_dispose.comments');
		if(!valueExistsNotEmpty(apprOption)){
			View.alert('终审意见项不能为空 !');
			return;
		}
		View.confirm('确定要驳回此退还单吗?',function(button){
			if(button=='yes'){
				var rtrDipId=View.panels.get('returnEqForm').getFieldValue('return_dispose.rtr_dip_id');
				var rtrDs=View.dataSources.get('ascBjUsmsEqReturnSch');
				
				var rtrRes=new Ab.view.Restriction();
				rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');	
				var rtrRecord=rtrDs.getRecord(rtrRes);
				rtrRecord.setValue('return_dispose.audit_status','3');
				rtrRecord.setValue('return_dispose.comments',apprOption);
				try{
					rtrDs.saveRecord(rtrRecord);
					View.panels.get('returnEqGrid').refresh();
					View.alert('退还单成功驳回 !');
					View.panels.get('returnEqForm').show(false);
					View.panels.get('returnListGrid').show(false);
					View.panels.get('returnTiaoJiPanel').show(false);
				}catch(e){
					View.alert('驳回退还单操作出现错误,程序终止,请重新尝试操作');
				}
			}
		});
	},
	
	choseTypePanel_onBtnClose: function(){
		this.choseTypePanel.closeWindow();
	},
	
	returnListGrid_afterRefresh: function(){
		var returnListGrid=View.panels.get('returnListGrid');
		var rows=this.returnListGrid.gridRows;
		for(var i=0;i<rows.length;i++){
			var record=rows.get(i).getRecord();
			var astaus=record.getValue('eq_change.audit_status');
			var checkEmId=record.getValue('eq_change.person_check');
			var checkEmName=getNameById(checkEmId);
			//rows.get(i).cells.get(10).dom.innerHTML=checkEmName;
//			if(astaus=="1"||astaus=="2"){
//				rows.get(i).cells.get(15).dom.innerHTML="已处理";
//			}
//			if(astaus=="0"){
//				rows.get(i).cells.get(15).dom.innerHTML="<b style='color:red'>未处理</b>";
//			}
			var checkStatus=record.getValue('eq_change.check_status');
			//当设备未鉴定时，不能进行处理
			if(checkStatus=='0'){
				var row=rows.get(i);
				//rows.get(i).cells.get(15).dom.innerHTML="<b style='color:red'>未处理</b>";
				//row.actions.get("btnChange").enable(false);
			}
			
		}
	},
	//查看初审详细
	ViewApprovedOption: function(){
		var selectIndex=this.returnListGrid.selectedRowIndex;
		var slectRecord=this.returnListGrid.gridRows.get(selectIndex).getRecord();
		var approvedStatus=slectRecord.getValue('eq_change.approved_status');
		if(!valueExistsNotEmpty(approvedStatus)||approvedStatus==" "){
			View.alert('测试数据，没有初审 !');
		}
		if(approvedStatus=='1'){
			this.dvAdjustDo(selectIndex);
		}
		if(approvedStatus=='2'){
			this.dvBaoFeiDo(selectIndex);
		}
	},
	//显示设备卡片
	showEqCard:function(){
		var panel = this.returnAttachListGrid;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_attach_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	}
});

function getNameById(emId){
	var emDs=View.dataSources.get('ascBjUsmsEmDs');
	var emRes=new Ab.view.Restriction();
	emRes.addClause('em.em_id',emId,'=');
	var emRecord=emDs.getRecord(emRes);
	var emName=emRecord.getValue('em.name');
	if(!valueExistsNotEmpty(emName)){
		emName="";
	}
	return emName;
}

function setViewPattern(value){

}