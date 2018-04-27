var controller=View.createController('eqAssignForm',{
	AddEqId_glob : "",
	eq_id:"",
	saveType:"edit",
//	filterConsole: function(){
//		var addEqId=this.consoleForm.getFieldValue('add_eq.add_eq_id');
//		var eqName=this.consoleForm.getFieldValue('add_eq.eq_name');
//		var brand=this.consoleForm.getFieldValue('add_eq.brand');
//		
//		var res=new Ab.view.Restriction();
//		if(valueExistsNotEmpty(addEqId)){
//			res.addClause('add_eq.add_eq_id',addEqId,'=');
//		}
//		if(valueExistsNotEmpty(eqName)){
//			res.addClause('add_eq.eq_name','%'+eqName+'%','LIKE');
//		}
//		if(valueExistsNotEmpty(brand)){
//			res.addClause('add_eq.brand','%'+brand+'%','LIKE');
//		}
//		this.addEqListPanel.refresh(res);
//	},
//	clearConsole: function(){
//		this.consoleForm.clear();
//		this.addEqListPanel.restriction=null;
//		this.addEqListPanel.refresh("");
//	},
	showEqAssignInfo: function(){
		
		this.showEqAndAttach();
	},
	showEqAndAttach:function(){
		this.eqAttachForm.show(false);
		
		var selectIndex=this.addEqListListPanel.selectedRowIndex;
		var selectEqId=this.addEqListListPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
		var is_assign=this.addEqListListPanel.gridRows.get(selectIndex).getRecord().getValue('eq.is_assign');
		this.eq_id=selectEqId;
		
		var user = this.view.user;
		if(user.role == "UNV DV EQ MOWN ADMIN" || user.role == "UNV DV EQ OWN ADMIN" || user.role=="UNV DV EQ STU ADMIN"){
			//this.assignEqInfoPanel.getFieldElement('dp.dp_name').disabled = false;
			this.assignEqInfoPanel.showField('dp.dp_name', true);
		}else{
			//this.assignEqInfoPanel.getFieldElement('dp.dp_name').disabled = true;
			this.assignEqInfoPanel.showField('dp.dp_name', false);
		}		
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.eq_id',selectEqId,'=');
		this.assignEqInfoPanel.refresh(eqRes);
		
		var userId=View.user.employee.id;
		this.assignEqInfoPanel.setFieldValue('eq.handling_em',userId);
		var user=this.assignEqInfoPanel.getFieldValue('eq.handling_em');
		
		//刷新设备的设备附件
		if(is_assign=="0"){
			disablePanel();
		}
		this.eqAttachGrid.applyVpaRestrictions=false;
		var restriction=new Ab.view.Restriction();
		restriction.addClause('eq_attach.eq_id',selectEqId,'=');
		this.eqAttachGrid.refresh(restriction);
		this.eqAttachGrid.setTitle("设备【"+selectEqId+"】的附件列表");
	},
	doneAssign: function(){
		var eqDs=View.dataSources.get('ascBjUsmsEqDs');
		var eqId=this.assignEqInfoPanel.getFieldValue('eq.eq_id');
		var eqName=this.assignEqInfoPanel.getFieldValue('eq.eq_name');
		var eqPhoto=this.assignEqInfoPanel.getFieldValue('eq.eq_photo');
		var eqblId=this.assignEqInfoPanel.getFieldValue('eq.bl_id');
		var eqRmId=this.assignEqInfoPanel.getFieldValue('eq.rm_id');
		var numSeries=this.assignEqInfoPanel.getFieldValue('eq.num_serial');
//		var dpComments=this.assignEqInfoPanel.getFieldValue('eq.dp_commnets');
		var emId=this.assignEqInfoPanel.getFieldValue('eq.em_id');
		var emName=this.assignEqInfoPanel.getFieldValue('eq.em_name');
		/*if(!valueExistsNotEmpty(eqblId)){
			View.alert('建筑物名称为必填字段');
			return;
		}*/
//		if(!valueExistsNotEmpty(numSeries)){
//			View.alert('S/N 为必填项');
//			return;
//		}
		if(!valueExistsNotEmpty(emId)){
			View.alert('教职工编号为必填项');
			return;
		}
		
		if(!valueExistsNotEmpty(emName)){
			View.alert('领用人名称为必填项');
			return;
		}
		
		if(!valueExistsNotEmpty(eqId)){
			View.alert('此设备没有设备编号,不可分配此设备');
			return;
		}else{
			//if(!valueExistsNotEmpty(dpComments)){
//				this.assignEqInfoPanel.setFieldValue('eq.dp_id','');
//				this.assignEqInfoPanel.setFieldValue('eq.dl_id','');
			//}
			View.panels.get('assignEqInfoPanel').save();
			var eqRes=new Ab.view.Restriction();
			eqRes.addClause('eq.eq_id',eqId,'=');
			var eqRecord=eqDs.getRecord(eqRes);
			eqRecord.setValue('eq.is_assign','1');
			eqRecord.setValue('eq.sch_status','2');
			eqDs.saveRecord(eqRecord);
			View.panels.get('addEqListListPanel').refresh();
			View.alert('编号为【'+eqId+'】,名称为【'+eqName+'】的设备分配成功');
		}
	},
	//批量分配
	AssignManyEq:function(){
		var selectedRecord = this.addEqListListPanel.getSelectedRecords();
		this.addEqListListPanel.applyVpaRestrictions=false;
		if(selectedRecord.length>0){
			this.assignManyEqPanel.refresh();
			this.assignManyEqPanel.setFieldValue("eq.bl_id","");
			this.assignManyEqPanel.setFieldValue("eq.fl_id","");
			this.assignManyEqPanel.setFieldValue("eq.rm_id","");
			this.assignManyEqPanel.setFieldValue("eq.em_id","");
			this.assignManyEqPanel.setFieldValue("eq.em_name","");
			this.assignManyEqPanel.setFieldValue("bl.name","");
			this.assignManyEqPanel.setTitle("批量分配");
			var user = this.view.user;
			if(user.role == "UNV DV EQ MOWN ADMIN" || user.role == "UNV DV EQ OWN ADMIN" || user.role=="UNV DV EQ STU ADMIN"){
				//this.assignManyEqPanel.getFieldElement('dp.dp_name').disabled = false;
				this.assignManyEqPanel.showField('dp.dp_name', true);
			}else{
				//this.assignManyEqPanel.getFieldElement('dp.dp_name').disabled = true;
				this.assignManyEqPanel.showField('dp.dp_name', false);
			}	
			this.assignManyEqPanel.showInWindow({
				 x:300,
				 y:200,
				 width: 630,
				 height: 450
			});
				
		}else{
			View.showMessage("请选择需要分配的设备");
			return;
		}	
	},
	assignManyEqPanel_onBtnEqAssign:function(){
		var type_use=this.assignManyEqPanel.getFieldValue("eq.type_use");
		var dv_id=this.assignManyEqPanel.getFieldValue("eq.dv_id");
		var bl_id=this.assignManyEqPanel.getFieldValue("eq.bl_id");
		/*if(!valueExistsNotEmpty(bl_id)){
			View.showMessage("建筑物编码不能为空");
			return;
		}*/
		var fl_id=this.assignManyEqPanel.getFieldValue("eq.fl_id");
		var rm_id=this.assignManyEqPanel.getFieldValue("eq.rm_id");
		var em_id=this.assignManyEqPanel.getFieldValue("eq.em_id");
		if(!valueExistsNotEmpty(em_id)){
			View.showMessage("领用人工号不能为空");
			return;
		}
		var em_name=this.assignManyEqPanel.getFieldValue("eq.em_name");
		var dp_id=this.assignManyEqPanel.getFieldValue("eq.dp_id");
		var num_serial=this.assignManyEqPanel.getFieldValue("eq.num_serial");
		var add_comment=this.assignManyEqPanel.getFieldValue("eq.add_comment");
		var comments=this.assignManyEqPanel.getFieldValue("eq.comments");
		
		var selectedRecord = this.addEqListListPanel.getSelectedRecords();
		
		var message="确定要保存数据吗";
		var thisController=this;
		View.confirm(message, function(button, text){
			if(button=="yes"){
				for(var i=0;i<selectedRecord.length;i++){				    		    	
					//更新eq表中分配信息
					var dsEq = View.dataSources.get("ascBjUsmsEqDs");
					var restriction = new Ab.view.Restriction();
					var eq_id = selectedRecord[i].values["eq.eq_id"];
					restriction.addClause("rm.eq_id", eq_id, "=");			       		
					var eqRecord=dsEq.getRecord(restriction);
					eqRecord.setValue("eq.type_use", type_use);    	
					eqRecord.setValue("eq.dv_id", dv_id);    	
					eqRecord.setValue("eq.bl_id", bl_id);    	
					eqRecord.setValue("eq.fl_id", fl_id);    	
					eqRecord.setValue("eq.rm_id", rm_id);    	
					eqRecord.setValue("eq.em_id", em_id);    	
					eqRecord.setValue("eq.em_name", em_name);    	
					eqRecord.setValue("eq.dp_id", dp_id);    	
					eqRecord.setValue("eq.num_serial", num_serial);    	
					eqRecord.setValue("eq.add_comment", add_comment);    	 	
					eqRecord.setValue("eq.comments", comments);    	 	
					eqRecord.setValue("eq.is_assign", "1");    	 	
					dsEq.saveRecord(eqRecord);   
				}		
				thisController.addEqListListPanel.refresh();
				thisController.assignEqInfoPanel.show(false);
				thisController.assignManyEqPanel.closeWindow();
				View.alert('设备批量分配成功');
			}
		});
	},
	//点击暴增单号，显示此暴增单下设备
	showAddEqListInfo: function(){
		var selectIndex=this.addEqListPanel.selectedRowIndex;
		var selectAddEqId=this.addEqListPanel.gridRows.get(selectIndex).getRecord().getValue('add_eq.add_eq_id');
		this.AddEqId_glob=selectAddEqId;
		this.addEqListListPanel.applyVpaRestrictions=false;
		var addEqRes=new Ab.view.Restriction();
		addEqRes.addClause('eq.add_eq_id',selectAddEqId,'=');
		this.addEqListListPanel.refresh(addEqRes);
		
		//刷新设备的设备附件
		if(this.addEqListListPanel.gridRows.length>0){
			var selectEqId=this.addEqListListPanel.gridRows.get(0).getRecord().getValue('eq.eq_id');
			this.eq_id=selectEqId;
			this.eqAttachGrid.applyVpaRestrictions=false;
			var restriction=new Ab.view.Restriction();
			restriction.addClause('eq_attach.eq_id',selectEqId,'=');
			this.eqAttachGrid.refresh(restriction);
			this.eqAttachGrid.setTitle("设备【"+selectEqId+"】的附件列表");
		}
	},
	//完成分配，将设备状态更新为已分配
	fcCloseAssign: function(){
		//检查此报增单下的设备是否有未分配完成的，如果有则不能关闭
		var eqDs=View.dataSources.get('ascBjUsmsEqDs');
		var addEqDs=View.dataSources.get('ascBjAddEqDs');
		var addEqId=this.AddEqId_glob;
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.add_eq_id',addEqId,'=');
		eqRes.addClause('eq.is_assign','0','=');
		var eqRecord=eqDs.getRecord(eqRes);
		if(!eqRecord.isNew){
			View.alert('此报增单下存在未分配设备,不可提交 ');
			return;
		}else{
			var addEqRes=new Ab.view.Restriction();
			addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
			var addEqRecord=addEqDs.getRecord(addEqRes);
			addEqRecord.setValue('add_eq.status','3');
			addEqDs.saveRecord(addEqRecord);
			View.alert('分配操作提交成功 ');
		}
		this.addEqListPanel.refresh();
		this.addEqListListPanel.show(false);
		this.assignEqInfoPanel.show(false);
		this.eqAttachGrid.show(false);
		this.eqAttachForm.show(false);
	},
	//显示选择科室的面板
	showDpPanel: function(){
		this.dpTreePanel.show(true);
		this.dpTreePanel.showInWindow({
		        width: 500,
		        height: 600
		    });
		this.dpTreePanel.setTitle('选择设备使用科室');
		this.dpTreePanel.refresh();
	},
	onClickDpNode: function(){
		var curTreeNode=View.panels.get('dpTreePanel').lastNodeClicked;
		var dpId=curTreeNode.data['dp_top.dp_id'];
		var parentForm=View.getWindow('parent');
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dp_id',dpId);
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dl_id','');
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dp_commnets',dpId);
		this.dpTreePanel.closeWindow();
	},
	onClickDlNode: function(){
		var curTreeNode=View.panels.get('dpTreePanel').lastNodeClicked;
		var dpId=curTreeNode.data['dp_level.dp_id'];
		var dlId=curTreeNode.data['dp_level.dl_id'];
		var dp_dl=dpId+'|'+dlId;
		var parentForm=View.getWindow('parent');
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dp_id',dpId);
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dl_id',dlId);
		View.panels.get('assignEqInfoPanel').setFieldValue('eq.dp_commnets',dp_dl);
		this.dpTreePanel.closeWindow();
	},
	showAddAttach:function(){
		this.assignEqInfoPanel.show(false);
		
		var selectIndex=this.eqAttachGrid.selectedRowIndex;
		var eqAttachId=this.eqAttachGrid.gridRows.get(selectIndex).getRecord().getValue('eq_attach.eq_attach_id');
		var eqId=this.eqAttachGrid.gridRows.get(selectIndex).getRecord().getValue('eq_attach.eq_id');
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_attach_id',eqAttachId,'=');
		this.eqAttachForm.refresh(res,false);
		this.eqAttachForm.setTitle("编辑设备【"+eqId+"】的附件信息");
		this.saveType="edit";
	},
	/**
	 * 给设备添加 设备附件
	 */
	eqAttachGrid_onAddAttach:function(){
		var addEqId = this.AddEqId_glob;
	    var dsEq = View.dataSources.get("ascBjUsmsEqDs");
	    var restriction=new Ab.view.Restriction();
		restriction.addClause('eq.eq_id',this.eq_id,'=');
	    var Record=dsEq.getRecord(restriction);
	    var buy_type = Record.getValue("eq.buy_type");
	    var dv_id = Record.getValue("eq.dv_id");
	    var dp_id = Record.getValue("eq.dp_id");
	    var bl_id = Record.getValue("eq.bl_id");
	    var fl_id = Record.getValue("eq.fl_id");
	    var rm_id = Record.getValue("eq.rm_id");
	    var em_id = Record.getValue("eq.em_id");
	    var em_name = Record.getValue("eq.em_name");
	    var add_comment = Record.getValue("eq.add_comment");
		
		this.assignEqInfoPanel.show(false);
		this.eqAttachForm.refresh([],true);
		
		this.eqAttachForm.setFieldValue("eq_attach.add_eq_id",addEqId);
		this.eqAttachForm.setFieldValue("eq_attach.eq_id",this.eq_id);
		this.eqAttachForm.setFieldValue("eq_attach.buy_type",buy_type);
		this.eqAttachForm.setFieldValue("eq_attach.dv_id",dv_id);
		this.eqAttachForm.setFieldValue("eq_attach.dp_id",dp_id);
		this.eqAttachForm.setFieldValue("eq_attach.bl_id",bl_id);
		this.eqAttachForm.setFieldValue("eq_attach.fl_id",fl_id);
		this.eqAttachForm.setFieldValue("eq_attach.rm_id",rm_id);
		this.eqAttachForm.setFieldValue("eq_attach.em_id",em_id);
		this.eqAttachForm.setFieldValue("eq_attach.em_name",em_name);
		this.eqAttachForm.setFieldValue("eq_attach.add_comment",add_comment);
		
		this.eqAttachForm.setTitle("编辑设备【"+this.eq_id+"】的附件信息");
		this.saveType="save";
	},
	/**
	 * 保存设备附件
	 */
	eqAttachForm_onSave:function(){
		var eq_id = this.eqAttachForm.getFieldValue("eq_attach.eq_id");
		if(this.saveType=="save"){
			var id="";
			 try {
		         var result = Workflow.callMethod('AbAssetManagement-EquipmentHandler-getEqPKValue',eq_id);
		         if (result.code == 'executed') {
					id=result.message;
		         }
		        } 
		        catch (e) {
		            Workflow.handleError(e);
		        }         
		    this.eqAttachForm.setFieldValue('eq_attach.eq_attach_id',id);
		    if(this.eqAttachForm.canSave()){			
				var success=this.eqAttachForm.save();
				if(success){
					this.eqAttachForm.closeWindow();
					var restriction=new Ab.view.Restriction();
					restriction.addClause('eq_attach.eq_id',eq_id,'=');
					this.eqAttachGrid.refresh(restriction);
				}
			}
		}else if(this.saveType=="edit"){
			if(this.eqAttachForm.canSave()){				
				var success=this.eqAttachForm.save();
				if(success){
					this.eqAttachForm.closeWindow();
					var restriction=new Ab.view.Restriction();
					restriction.addClause('eq_attach.eq_id',eq_id,'=');
					this.eqAttachGrid.refresh(restriction);
				}
			}
		}	
		
	},
	eqAttachGrid_afterRefresh:function(){
		this.eqAttachGrid.setTitle("设备【"+this.eq_id+"】的附件列表");
	}
	
});

function disablePanel(){
	var eqAttachGrid=View.panels.get('eqAttachGrid');
	eqAttachGrid.actions.get('addAttach').enable(false);
}