var controller=View.createController('returnSchForm',{
	parameters: {'rtrDipId':0},
	returnListGrid_eq_id_onClick: function(row){
		var eqId=row.getRecord().getValue('eq_change.eq_id');
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eqId,
        	closeButton: false
        });
	},
	returnListGrid_onBtnPrint: function(){
		var rtrDipId=this.returnEqForm.getFieldValue('return_dispose.rtr_dip_id');
//		this.parameters['rtrDipId']=rtrDipId;
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width:470, 
			height:200,
			xmlName:"wjmSheBeiTuiHuan",
			parameters:{'rtrDipId':rtrDipId}, 
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
		$('rowIndex').value="2"
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
		var apprOption=this.returnEqForm.getFieldValue('return_dispose.comments');
		if(!valueExistsNotEmpty(apprOption)){
			View.alert('初审意见项不能为空 !');
			return;
		}
		var rtrDipId=this.returnEqForm.getFieldValue('return_dispose.rtr_dip_id');
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		eqChangeRes.addClause('eq_change.approved_status','0','=',')AND(');
		eqChangeRes.addClause('eq_change.approved_status','','=','OR');
		var eqChangeRecord=this.ascBjUsmsEqChangeDs.getRecord(eqChangeRes);
		if(!eqChangeRecord.isNew){
			View.alert('此退还单下有未审核设备,不能提交 !');
			return;
		}else{
			View.confirm('确定要提交审批结果吗?',function(button){
				if(button=='yes'){
					var rtrRes=new Ab.view.Restriction();
					rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
					var rtrRcord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
					rtrRcord.setValue('return_dispose.audit_status','2');
					rtrRcord.setValue('return_dispose.comments',apprOption);
					View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRcord);
					View.panels.get('returnEqGrid').refresh();
					//隐藏panel
					View.panels.get('returnEqForm').show(false);
					//View.panels.get('returnListGrid').show(false);
					View.panels.get('returnTiaoJiPanel').show(false);
					View.panels.get('returnBaoFeiPanel').show(false);
					View.alert('审批结果提交成功 !');
				}
			});
		}
	},
	
//	choseTypePanel_onBtnClose: function(){
//		this.choseTypePanel.closeWindow();
//	},
	
	returnListGrid_afterRefresh: function(){
		var returnListGrid=View.panels.get('returnListGrid');
		var rows=this.returnListGrid.gridRows;
		var status=this.returnEqForm.getFieldValue("return_dispose.audit_status");
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
			if(status=="5"){
				$("returnListGrid_row"+i+"_btnTiaoJi").disabled= true;
			}else{
				$("returnListGrid_row"+i+"_btnTiaoJi").disabled= false;
			}
		}
		if(status=="5"){
			this.returnEqForm.actions.get('notice').enable(false);
			this.returnEqForm.actions.get('backReturn').enable(false);
			this.returnEqForm.actions.get('btnDoneReturn').enable(false);
//			this.returnEqForm.actions.get('btnClose').enable(false);
		}else{
			this.returnEqForm.actions.get('notice').enable(true);
			this.returnEqForm.actions.get('backReturn').enable(true);
			this.returnEqForm.actions.get('btnDoneReturn').enable(true);
//			this.returnEqForm.actions.get('btnClose').enable(true);
		}
	},
	//调剂操作
	dvAdjustDo: function(){
		this.returnBaoFeiPanel.show(false);
		this.returnTiaoJiPanel.show(true);
		var selectIndex=this.returnListGrid.selectedRowIndex;
		var slectRecord=this.returnListGrid.gridRows.get(selectIndex).getRecord();
		var eqId=slectRecord.getValue('eq_change.eq_id');
		var rtrDipId=slectRecord.getValue('eq_change.rtr_dip_id');
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq_change.eq_id',eqId,'=');
		eqRes.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
		this.returnTiaoJiPanel.refresh(eqRes);
	},
	//报废操作
	dvBaoFeiDo: function(){
		this.returnTiaoJiPanel.show(false);
		this.returnBaoFeiPanel.show(true);
		var selectIndex=this.returnListGrid.selectedRowIndex;
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
		if(this.returnTiaoJiPanel.canSave()){
			var dvId=this.returnTiaoJiPanel.getFieldValue('eq_change.dv_id');
			var dvName=this.returnTiaoJiPanel.getFieldValue('eq_change.dv_name');
			View.confirm('是否确认调剂此设备?',function(button){
				if(button=='yes'){
//					View.panels.get('returnTiaoJiPanel').setFieldValue('eq_change.type_adjust','1');
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
		}
	},
	//完成报废
	returnBaoFeiPanel_onBtnDoneBF: function(){
		View.confirm('是否确认将此设备退库?',function(button){
			if(button=='yes'){
				View.panels.get('returnBaoFeiPanel').setFieldValue('eq_change.approved_status','2');
				var BFRecord=View.panels.get('returnBaoFeiPanel').getRecord();
				try{
					View.dataSources.get('ascBjUsmsEqChangeDs').saveRecord(BFRecord);
					View.panels.get('returnListGrid').refresh();
					View.alert('设备已成功执行退库操作');
				}catch(e){
					View.alert('程序错误,退库失败!');
				}
				
			}
		});
	},
	returnEqForm_onBackReturn: function(){
		View.confirm("是否确定驳回此单?",function(button){
			if(button=='yes'){
				var rtrDipId=View.panels.get('returnEqForm').getFieldValue("return_dispose.rtr_dip_id");
				if(valueExistsNotEmpty(rtrDipId)){
					var restriction=new Ab.view.Restriction();
					restriction.addClause("return_dispose.rtr_dip_id",rtrDipId,"=");
					var record=View.dataSources.get("ascBjUsmsEqReturnSch").getRecord(restriction);
					var comments=View.panels.get('returnEqForm').getFieldValue("return_dispose.comments");
					record.setValue("return_dispose.comments",comments);
					record.setValue("return_dispose.audit_status",'3');
					View.dataSources.get("ascBjUsmsEqReturnSch").saveRecord(record);
					View.alert("成功驳回编号为"+rtrDipId+"的退还单!");
					View.panels.get('returnEqGrid').refresh();
					View.panels.get('returnEqForm').show(false);
					View.panels.get('returnListGrid').show(false);
					View.panels.get('returnTiaoJiPanel').show(false);
					View.panels.get('returnBaoFeiPanel').show(false);
					
				}else{
					View.alert("不存在此退还单，无法删除");
				}
			}
		});
	},
	/**
	 * 设备公示，让其他二级单位、采购、实验中心可以看到公示的设备
	 */
	returnEqForm_onNotice:function(){
		var rtnName=this.returnEqForm.getFieldValue("return_dispose.rtr_dip_name");
		var rtnId=this.returnEqForm.getFieldValue("return_dispose.rtr_dip_id");
		var message="是否确认将退还单【"+rtnName+"】下的设备公示?";
		var controller=this;
		View.confirm(message,function(button){
			if(button=='yes'){
				controller.returnEqForm.setFieldValue('return_dispose.audit_status','5');
				try{
					var success=controller.returnEqForm.save();
					if(success){
						View.showMessage("退还单【"+rtnName+"】下的所有设备已经公示！");
						controller.returnEqGrid.refresh();
						controller.returnListGrid_afterRefresh();
						controller.returnTiaoJiPanel.show(false);
					}
				}catch(e){
					View.showMessage(e.message);
               	 	return;
				}
				
			}
		});
	}
});

function refreshFormPanel(value){
	var returnEqForm=View.panels.get('returnEqForm');
	var returnListGrid=View.panels.get('returnListGrid');
	var returnAttachListGrid=View.panels.get('returnAttachListGrid');
	//提取报增单号
	var rtId=value.restriction['return_dispose.rtr_dip_id'];
	returnEqForm.refresh(value.restriction);
	
	var rtItemRes=new Ab.view.Restriction();
	rtItemRes.addClause('eq_change.rtr_dip_id',rtId,'=');
	rtItemRes.addClause('eq_change.type_adjust','2','=');
	returnListGrid.refresh(rtItemRes);
	
	var rtItemRes2=new Ab.view.Restriction();
	rtItemRes2.addClause('eq_attach_change.rtr_dip_id',rtId,'=');
	returnAttachListGrid.refresh(rtItemRes2);
	
	View.panels.get('returnTiaoJiPanel').show(false);
	View.panels.get('returnTiaoJiPanel').show(false);
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