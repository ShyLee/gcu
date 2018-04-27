var controller=View.createController('returnSchForm',{
	parameters: {'rtrDipId':0},
	
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
	choseTypePanel_onBtnOk: function(){
		var eqChangeDs=View.dataSources.get('ascBjUsmsEqChangeDs');
		var eqChangeRes=new Ab.view.Restriction();
		var id=this.choseTypePanel.getFieldValue('eq_change.id');
		eqChangeRes.addClause('eq_change.id',id);
		var eqChangeRecord=eqChangeDs.getRecord(eqChangeRes);
		//修改处理状态
		eqChangeRecord.setValue('eq_change.audit_status','1');
		eqChangeRecord.setValue('eq_change.okBadStatus',this.choseTypePanel.getFieldValue('eq_change.okBadStatus'));
		var statusValue="";
		if($('selectTJ').checked){
			statusValue=$('selectTJ').value; 
		}
		if($('selectBF').checked){
			statusValue=$('selectBF').value; 
		}
		eqChangeRecord.setValue('eq_change.status',statusValue);
		var aprDate=new Date();
		eqChangeRecord.setValue('eq_change.date_appraisal',aprDate);
		var aprPerson=View.user.employee.id;
		eqChangeRecord.setValue('eq_change.person_appraisal',aprPerson);
	    this.choseTypePanel.closeWindow();
		
		try{
			eqChangeDs.saveRecord(eqChangeRecord);
			this.returnListGrid.refresh(); 
		}catch(e){
			for(var p in e){
				document.write(e[p]);
			}
		}
	},
	
	returnEqForm_onBtnDoneReturn: function(){
		//检查是否对已处理完毕
		//验证是否输入终审信息
		var apprOption=this.returnEqForm.getFieldValue('return_dispose.eq_head_suggest');
		if(!valueExistsNotEmpty(apprOption)){
			View.alert('终审意见项不能为空 !');
			return;
		}
		var rtrDipId=this.returnEqForm.getFieldValue('return_dispose.rtr_dip_id');
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');		
			
		View.confirm('确定审批通过此退还单吗?',function(button){
			if(button=='yes'){
				var rtrRes=new Ab.view.Restriction();
				rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
				var rtrRcord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
				rtrRcord.setValue('return_dispose.audit_status','4');
				rtrRcord.setValue('return_dispose.eq_head_suggest',apprOption);
				try{
					
					//将此退还单下的所有的设备的状态变更
					var eqChangeDs=View.dataSources.get('ascBjUsmsEqChangeDs');
					var eqChangeRecords=eqChangeDs.getRecords(eqChangeRes);
					var eqDs=View.dataSources.get('ascBjUsmsEqDs');
					
					for(var i=0;i<eqChangeRecords.length;i++){
						var record=eqChangeRecords[i];
//						//从数据中取出类型，如果是调剂的话就执行调剂操作，如果是报废话就将状态改为待报废
						var eqId=record.getValue('eq_change.eq_id');
						var nowDvId=record.getValue('eq_change.dv_id');
						var nowDpId=record.getValue('eq_change.dp_id');
						var eqRes=new Ab.view.Restriction();
						eqRes.addClause('eq.eq_id',eqId,'=');
						var eqRecord=eqDs.getRecord(eqRes);
							eqRecord.setValue('eq.dv_id',nowDvId);
							eqRecord.setValue('eq.dp_id',nowDpId);
							eqRecord.setValue('eq.bl_id','');
							eqRecord.setValue('eq.fl_id','');
							eqRecord.setValue('eq.rm_id','');
							eqRecord.setValue('eq.em_id','');
							eqRecord.setValue('eq.em_name','');
							eqRecord.setValue('eq.sch_status','2');
							
						var account1=View.dataSources.get("eq_attach_ds");
		             	var res3=new Ab.view.Restriction();
					    res3.addClause("eq_attach.eq_id",eqId,"=");
					    res3.addClause("eq_attach.sch_status",'1',"=");
					    var recordEqs=account1.getRecords(res3);
					    for(var j=0;j<recordEqs.length;j++){
					    	var eqAttachId=recordEqs[j].getValue("eq_attach.eq_attach_id");
					    	var res4=new Ab.view.Restriction();
		    			    res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
		    			    var recordEqAttach=account1.getRecord(res4);
		    			    recordEqAttach.setValue("eq_attach.dv_id",nowDvId);
		    			    recordEqAttach.setValue("eq_attach.dp_id",nowDpId);
		    			    recordEqAttach.setValue("eq_attach.bl_id","");
		    			    recordEqAttach.setValue("eq_attach.fl_id","");
		    			    recordEqAttach.setValue("eq_attach.rm_id","");
		    			    recordEqAttach.setValue("eq_attach.em_id","");
		    			    recordEqAttach.setValue("eq_attach.em_name","");
		    			    recordEqAttach.setValue("eq_attach.sch_status","2");
		    			    account1.saveRecord(recordEqAttach);
					    }
						eqDs.saveRecord(eqRecord);
						View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRcord);
					}
					
					View.panels.get('returnEqGrid').refresh();
					View.alert('审批结果提交成功 !');
					View.panels.get('returnEqForm').show(false);
					View.panels.get('returnListGrid').show(false);
					View.panels.get('returnAttachListGrid').show(false);
					View.panels.get('returnTiaoJiPanel').show(false);
					View.panels.get('returnBaoFeiPanel').show(false);
				}catch(e){
					View.alert('退还终审程序出错,请尝试重新操作');
				}	
			}
		});

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
	//调剂操作
	dvAdjustDo: function(selectIndex){
		this.returnBaoFeiPanel.show(false);
		this.returnTiaoJiPanel.show(true);
		var slectRecord=this.returnListGrid.gridRows.get(selectIndex).getRecord();
		var eqId=slectRecord.getValue('eq_change.eq_id');
		var rtrDipId=slectRecord.getValue('eq_change.rtr_dip_id');
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq_change.eq_id',eqId,'=');
		eqRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		this.returnTiaoJiPanel.refresh(eqRes);
	},
	//报废操作
	dvBaoFeiDo: function(selectIndex){
		this.returnTiaoJiPanel.show(false);
		this.returnBaoFeiPanel.show(true);
		var slectRecord=this.returnListGrid.gridRows.get(selectIndex).getRecord();
		var eqId=slectRecord.getValue('eq_change.eq_id');
		var rtrDipId=slectRecord.getValue('eq_change.rtr_dip_id');
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq_change.eq_id',eqId,'=');
		eqRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		this.returnBaoFeiPanel.refresh(eqRes);
	},
	//完成调剂
	returnTiaoJiPanel_onBtnDoneAdjust: function(){
		var dvId=this.returnTiaoJiPanel.getFieldValue('eq_change.dv_id');
		if(!valueExistsNotEmpty(dvId)){
			View.alert('转入单位不能为空 !');
			return;
		}
		View.confirm('是否确认调剂此设备?',function(button){
			if(button=='yes'){
				View.panels.get('returnTiaoJiPanel').setFieldValue('eq_change.approved_status','1');
				var TJRecord=View.panels.get('returnTiaoJiPanel').getRecord();
				try{
					View.dataSources.get('ascBjUsmsEqChangeDs').saveRecord(TJRecord);
					View.panels.get('returnListGrid').refresh();
					View.alert('设备已成功执行调剂操作');
				}catch(e){
					View.alert('程序错误,调剂失败,请选择正确的单位名');
				}
				
				
			}
		});
		
	},
	//完成报废
	returnBaoFeiPanel_onBtnDoneBF: function(){
		View.confirm('是否确认调剂此设备?',function(button){
			if(button=='yes'){
				View.panels.get('returnBaoFeiPanel').setFieldValue('eq_change.approved_status','2');
				var BFRecord=View.panels.get('returnBaoFeiPanel').getRecord();
				try{
					View.dataSources.get('ascBjUsmsEqChangeDs').saveRecord(BFRecord);
					View.panels.get('returnListGrid').refresh();
					View.alert('设备已成功执行报废操作');
				}catch(e){
					View.alert('程序错误,调剂失败,请选择正确的单位名');
				}
				
			}
		});
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
	//显示设备详情
	showEqCard: function(){
		var selectIndex=this.returnListGrid.selectedRowIndex;
		var slectRecord=this.returnListGrid.gridRows.get(selectIndex).getRecord();
		var eqId=slectRecord.getValue('eq_change.eq_id');
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eqId
	    });
	}
});

function refreshFormPanel(value){
	var returnEqForm=View.panels.get('returnEqForm');
	var returnListGrid=View.panels.get('returnListGrid');
	var returnAttachListGrid=View.panels.get('returnAttachListGrid');
	
	//提取报增单号
	var rtId=value.restriction['return_dispose.rtr_dip_id'];
	
	var rtItemRes=new Ab.view.Restriction();
	rtItemRes.addClause('eq_change.rtr_dip_id',rtId,'=');
	rtItemRes.addClause('eq_change.type_adjust','2','=');
	returnListGrid.refresh(rtItemRes);
	
	var rtItemRes2=new Ab.view.Restriction();
	rtItemRes2.addClause('eq_attach_change.rtr_dip_id',rtId,'=');
	returnAttachListGrid.refresh(rtItemRes2);
	
	View.panels.get('returnTiaoJiPanel').show(false);
	returnEqForm.refresh(value.restriction);
}

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