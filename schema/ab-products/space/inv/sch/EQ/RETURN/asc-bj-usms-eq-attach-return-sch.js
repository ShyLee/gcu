var controller=View.createController('returnSchForm',{
	parameters: {'rtrDipId':0},
	rtrDipId:"",
	rtnName:"",
	rtnStatus:"",
	showAttachInfo: function(autoShow){
		if(this.returnEqGrid.rows.length>0){
			this.returnAttachListGrid.actions.get('notice').enable(true);
			this.returnAttachListGrid.actions.get('btnDoneReturn').enable(true);
			
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=this.returnEqGrid.selectedRowIndex;
			}
			var row=this.returnEqGrid.rows[selectedIndex];
			var rtrDipId=row["return_dispose.rtr_dip_id"];
			var rtnName=row["return_dispose.rtr_dip_name"];
			var rtnStatus=row["return_dispose.audit_status.raw"];
			this.rtrDipId=rtrDipId;
			this.rtnName=rtnName;
			this.rtnStatus=rtnStatus;
			var eqChangeRes=new Ab.view.Restriction();
			eqChangeRes.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
			this.returnAttachListGrid.refresh(eqChangeRes);
	
		}
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
	
	returnAttachListGrid_onBtnDoneReturn: function(){
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_attach_change.rtr_dip_id',this.rtrDipId,'=');
		eqChangeRes.addClause('eq_attach_change.approved_status','0','=',')AND(');
		eqChangeRes.addClause('eq_attach_change.approved_status','','=','OR');
		var eqChangeRecord=this.eq_attach_change_ds.getRecord(eqChangeRes);
		if(!eqChangeRecord.isNew){
			View.alert('此退还单下有未审核设备,不能提交 !');
			return;
		}else{
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
		}
	},
	addApprovePanel_onBtnSave:function(){
		if(this.addApprovePanel.canSave()){
			var success=this.addApprovePanel.save();
			if(success){
				var controller=this;
				View.confirm('确定要提交审批结果吗?',function(button){
					if(button=='yes'){
						var rtrRes=new Ab.view.Restriction();
						rtrRes.addClause('return_dispose.rtr_dip_id',controller.rtrDipId,'=');
						
						var rtrRcord=View.dataSources.get('ascBjUsmsEqReturnSch').getRecord(rtrRes);
						rtrRcord.setValue('return_dispose.audit_status','2');
						View.dataSources.get('ascBjUsmsEqReturnSch').saveRecord(rtrRcord);
						controller.addApprovePanel.closeWindow();
						View.panels.get('returnEqGrid').refresh();
						View.panels.get('returnAttachListGrid').show(false);
						View.alert('审批结果提交成功 !');
					}
				});
			}
		}
	},
	choseTypePanel_onBtnClose: function(){
		this.choseTypePanel.closeWindow();
	},
	//调剂操作
	dvAdjustDo: function(){
		this.returnTiaoJiPanel.showInWindow({
			x:300,
			y:100,
			width:800,
			height:400,
			closeButton:false 
		});
		var selectIndex=this.returnAttachListGrid.selectedRowIndex;
		var slectRecord=this.returnAttachListGrid.gridRows.get(selectIndex).getRecord();
		var id=slectRecord.getValue('eq_attach_change.id');
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq_attach_change.id',id,'=');
		this.returnTiaoJiPanel.refresh(eqRes);
	},
	//完成调剂
	returnTiaoJiPanel_onBtnDoneAdjust: function(){
		if(this.returnTiaoJiPanel.canSave()){
			var dvId=this.returnTiaoJiPanel.getFieldValue('eq_attach_change.dv_id');
			var dvName=this.returnTiaoJiPanel.getFieldValue('eq_attach_change.dv_name');
			var controller=this;
			View.confirm('是否确认调剂此设备?',function(button){
				if(button=='yes'){
					controller.returnTiaoJiPanel.setFieldValue('eq_attach_change.approved_status','1');
					try{
						var success=controller.returnTiaoJiPanel.save();
						if(success){
							View.panels.get('returnAttachListGrid').refresh();
						}
						View.alert('设备已成功执行调剂操作');
					}catch(e){
						View.alert('程序错误,调剂失败,请选择正确的单位名');
					}	
				}
			});
		}
	},
	/**
	 * 设备公示，让其他二级单位、采购、实验中心可以看到公示的设备
	 */
	returnAttachListGrid_onNotice:function(){
		var message="是否确认将退还单【"+this.rtnName+"】下的设备公示?";
		var controller=this;
		View.confirm(message,function(button){
			if(button=='yes'){
				try{
					var restriction=new Ab.view.Restriction();
					restriction.addClause("return_dispose.rtr_dip_id",controller.rtrDipId,"=");
					var account=View.dataSources.get("ascBjUsmsEqReturnSch");
					var record=account.getRecord(restriction);
					record.setValue('return_dispose.audit_status','5');
					account.saveRecord(record);
					
					View.showMessage("退还单【"+controller.rtnName+"】下的所有设备已经公示！");
					controller.returnEqGrid.refresh();
					controller.returnAttachListGrid_afterRefresh();
				}catch(e){
					View.showMessage(e.message);
               	 	return;
				}
				
			}
		});
	},
	returnAttachListGrid_afterRefresh: function(){
		var status=this.rtnStatus;
		var rows=this.returnAttachListGrid.gridRows;
		for(var i=0;i<rows.length;i++){
			if(status=="5"){
				$("returnAttachListGrid_row"+i+"_btnTiaoJi").disabled= true;
			}else{
				$("returnAttachListGrid_row"+i+"_btnTiaoJi").disabled= false;
			}
		}
		if(status=="5"){
			this.returnAttachListGrid.actions.get('notice').enable(false);
			this.returnAttachListGrid.actions.get('btnDoneReturn').enable(false);
		}else{
			this.returnAttachListGrid.actions.get('notice').enable(true);
			this.returnAttachListGrid.actions.get('btnDoneReturn').enable(true);
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
