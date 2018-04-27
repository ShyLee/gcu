var controller=View.createController('ChangeInDvForm',{
	isHidden: "",
	afterViewLoad:function(){
		var emId=View.user.name;
		var dvId=ASEQ_getUserDvId(emId);
		this.eqAdjustInfoPanel.addParameter("dvId","eq_change.dv_id='"+dvId+"'");
	},
	afterInitialDataFetch: function(){
		this.showAdjustInfo(true);
	},
	//点击“筛选”按钮的时候，执行相应的操作
	consolePanel_onBtnFilter: function(){
		var eqId=this.consolePanel.getFieldValue('eq.eq_id');
		var eqName=this.consolePanel.getFieldValue('eq.eq_name');
		var blId=this.consolePanel.getFieldValue('eq.bl_id');
		var rmId=this.consolePanel.getFieldValue('eq.rm_id');
		var eq_type=this.consolePanel.getFieldValue('eq.eq_type');
		var emId=this.consolePanel.getFieldValue('eq.em_id');
		
		var res=new Ab.view.Restriction();
		if(valueExistsNotEmpty(eqId)){
			res.addClause('eq.eq_id','%'+eqId+'%','LIKE');
		}
		if(valueExistsNotEmpty(eqName)){
			res.addClause('eq.eq_name','%'+eqName+'%','LIKE');
		}
		if(valueExistsNotEmpty(blId)){
			res.addClause('eq.bl_id',blId,'=');
		}
		if(valueExistsNotEmpty(rmId)){
			res.addClause('eq.rm_id',rmId,'=');
		}
		if(valueExistsNotEmpty(eq_type)){
			res.addClause('eq.eq_type','%'+eq_type+'%','LIKE');
		}
		if(valueExistsNotEmpty(emId)){
			res.addClause('eq.em_id','%'+emId+'%','LIKE');
		}
		this.eqInfoPanel.refresh(res);
		this.eqAdjustPanel.show(false);
		this.showAdjustInfo(true);
	},
	/**
     * 查看设备附件列表
     */
    eqInfoPanel_onViewAttach:function(){
    	var selectIndex=this.eqInfoPanel.selectedRowIndex;
//		var addEqId=this.eqInfoPanel.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		var eqId=this.eqInfoPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			eqId:eqId
		});
    },
    showAdjustInfo:function(autoShow){
    	var length = this.eqInfoPanel.rows.length;
		if(length>0){
			var panel = this.eqInfoPanel;
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=panel.selectedRowIndex;
			}
			var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
			var restriction=new Ab.view.Restriction();
			restriction.addClause("eq_change.eq_id" , eq_id , "=");
			this.eqAdjustInfoPanel.refresh(restriction);
			this.eqAdjustInfoPanel.setTitle('设备'+eq_id+'调剂记录');
		}
    },
    //批量调剂
    eqInfoPanel_onAdjMore:function(){
    	var selectedRecord = this.eqInfoPanel.getSelectedRecords();
		if(selectedRecord.length>0){
			var dv_id = selectedRecord[0].values["eq.dv_id"];
			var dv_name = selectedRecord[0].values["dv.dv_name"];			
			
			this.djustMorePanel.refresh();
			this.djustMorePanel.setFieldValue("eq_change.bl_id","");
			this.djustMorePanel.setFieldValue("eq_change.bl_name","");
			this.djustMorePanel.setFieldValue("eq_change.fl_id","");
			this.djustMorePanel.setFieldValue("eq_change.rm_id","");
			this.djustMorePanel.setFieldValue("eq_change.em_id","");
			this.djustMorePanel.setFieldValue("eq_change.em_name","");
			this.djustMorePanel.setFieldValue("eq_change.dv_id",dv_id);
			this.djustMorePanel.setFieldValue("eq_change.dv_name",dv_name);			
			this.djustMorePanel.setTitle("批量调剂");
			
			var user = this.view.user;
			this.djustMorePanel.applyVpaRestrictions=false;
			if(user.role == "UNV DV EQ MOWN ADMIN"){
				//this.djustMorePanel.getFieldElement('eq_change.dp_id').disabled = false;
				this.djustMorePanel.showField("eq_change.dp_id",true);
				this.djustMorePanel.showField("eq_change.dp_name",true);
				this.isHidden="1";
			}else{
				//this.djustMorePanel.getFieldElement('eq_change.dp_id').disabled = true;
				this.djustMorePanel.showField("eq_change.dp_id",false);
				this.djustMorePanel.showField("eq_change.dp_name",false);
				this.isHidden="2";
			}
			
			this.djustMorePanel.showInWindow({
				 x:300,
				 y:200,
				 width: 630,
				 height: 450
			});
				
		}else{
			View.showMessage("请选择需要调剂的设备");
			return;
		}
    },
    adjustMoreInfo:function(){
    	if(this.djustMorePanel.canSave()){
    		var record1 = {};
    		var record3 = {};
    		var selectedPrimaryKeys = this.eqInfoPanel.getSelectedRecords();
    		for (var i = 0; i < selectedPrimaryKeys.length; i++) {
    			var row = selectedPrimaryKeys[i];   
    			record1['eq.id'+i] = row.values["eq.eq_id"];
    			record3['bl.name'+i] = row.values["bl.name"];
    		}
    		
    		
    		var record2 = {};
    		record2['eq_change.em_id']=this.djustMorePanel.getFieldValue('eq_change.em_id');
    		record2['eq_change.em_name']=this.djustMorePanel.getFieldValue('eq_change.em_name');
    		record2['eq_change.type_use']=this.djustMorePanel.getFieldValue('eq_change.type_use');
    		record2['eq_change.bl_id']=this.djustMorePanel.getFieldValue('eq_change.bl_id');
    		record2['eq_change.bl_name']=this.djustMorePanel.getFieldValue('eq_change.bl_name');
    		record2['eq_change.fl_id']=this.djustMorePanel.getFieldValue('eq_change.fl_id');
    		record2['eq_change.rm_id']=this.djustMorePanel.getFieldValue('eq_change.rm_id');
    		record2['eq_change.add_comment']=this.djustMorePanel.getFieldValue('eq_change.add_comment');
    		record2['eq_change.comments']=this.djustMorePanel.getFieldValue('eq_change.comments');
    		record2['eq_change.dv_id']=this.djustMorePanel.getFieldValue('eq_change.dv_id');
    		record2['eq_change.dv_name']=this.djustMorePanel.getFieldValue('eq_change.dv_name');
    		record2['eq_change.dp_id']=this.djustMorePanel.getFieldValue('eq_change.dp_id');
    		record2['eq_change.dp_name']=this.djustMorePanel.getFieldValue('eq_change.dp_name');
    		
    		try {
                Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-AdjustMoreValue', record1, record2,record3,this.isHidden);
                View.showMessage("操作成功");
    		} 
            catch (e) {
                Workflow.handleError(e);
                View.alert('工作流失败');
            }
            var eqId =  record1['eq.id0'];
            var res=new Ab.view.Restriction();
			res.addClause('eq_change.eq_id',eqId,'=');
            this.eqAdjustInfoPanel.refresh(res);
            this.eqAdjustInfoPanel.setTitle('设备'+eqId+'调剂记录');
			
			this.eqInfoPanel.refresh();
			this.djustMorePanel.closeWindow();
			
    		//this.eqAdjustPanel.save();
    	}
    	
    	
    },
	eqAdjustPanel_onBtnSave: function(){
		if(this.eqAdjustPanel.canSave()){
			
			var emIdOld=this.eqAdjustPanel.getFieldValue('eq_change.em_id_old');
			var emId=this.eqAdjustPanel.getFieldValue('eq_change.em_id');
			
			var isSaved=this.eqAdjustPanel.save();
			//当保存成功以后，更新eq表中目前的信息
			if(isSaved){
				var eqDs=View.dataSources.get('dsAscBjUsmsEqAdjustChangeInDvEq');
				var eqId=this.eqAdjustPanel.getFieldValue('eq_change.eq_id');
				
				var eqRes=new Ab.view.Restriction();
				eqRes.addClause('eq.eq_id',eqId,'=');
				var eqRecord=eqDs.getRecord(eqRes);
				
				if(!eqRecord.isNew){
					//1、更新eq表中的 领用人信息
					var emNameOld=this.eqAdjustPanel.getFieldValue('eq_change.em_name_old');
					var emName=this.eqAdjustPanel.getFieldValue('eq_change.em_name');
					var typeUseOld=this.eqAdjustPanel.getFieldValue('eq_change.type_use_old');
					var typeUse=this.eqAdjustPanel.getFieldValue('eq_change.type_use');
					var blIdOld=this.eqAdjustPanel.getFieldValue('eq_change.bl_id_old');
					var blId=this.eqAdjustPanel.getFieldValue('eq_change.bl_id');
					var flIdOld=this.eqAdjustPanel.getFieldValue('eq_change.fl_id_old');
					var flId=this.eqAdjustPanel.getFieldValue('eq_change.fl_id');
					var rmIdOld=this.eqAdjustPanel.getFieldValue('eq_change.rm_id_old');
					var rmId=this.eqAdjustPanel.getFieldValue('eq_change.rm_id');
					var dpId=this.eqAdjustPanel.getFieldValue('eq_change.dp_id');
					var dpIdOld=this.eqAdjustPanel.getFieldValue('eq_change.dp_id_old');
					var dpName=this.eqAdjustPanel.getFieldValue('eq_change.dp_name');
					var dpNameOld=this.eqAdjustPanel.getFieldValue('eq_change.dp_name_old');
					var add_comment=this.eqAdjustPanel.getFieldValue('eq_change.add_comment');
					var comments=this.eqAdjustPanel.getFieldValue('eq_change.comments');
					
					var isChanged=true;
					if(emIdOld!=emId){
						eqRecord.setValue('eq.em_id',emId);
						eqRecord.setValue('eq.em_name',emName);
						isChanged=false;
					}
					if(dpNameOld!=dpName){
						eqRecord.setValue('eq.dp_id',dpId);
						eqRecord.setValue('eq.dp_name',dpName);
						isChanged=false;
					}
					if(typeUseOld!=typeUse){
						eqRecord.setValue('eq.type_use',typeUse);
						isChanged=false;
					}
					if(blIdOld!=blId){
						eqRecord.setValue('eq.bl_id',blId);
						isChanged=false;
					}
					if(flIdOld!=flId){
						eqRecord.setValue('eq.fl_id',flId);
						isChanged=false;
					}
					if(rmIdOld!=rmId){
						eqRecord.setValue('eq.rm_id',rmId);
						isChanged=false;
					}
					if(valueExistsNotEmpty(add_comment)){
						eqRecord.setValue('eq.add_comment',add_comment);
						isChanged=false;
					}
					if(valueExistsNotEmpty(comments)){
						eqRecord.setValue('eq.comments',comments);
						isChanged=false;
					}
					eqDs.saveRecord(eqRecord);
					
					//2、更新eq相对应的eq_attach表中的领用人信息
					var account1=View.dataSources.get("eq_attach_ds");
	             	var res3=new Ab.view.Restriction();
				    res3.addClause("eq_attach.eq_id",eqId,"=");
				    res3.addClause("eq_attach.sch_status",'1',"=");
				    var recordEqs=account1.getRecords(res3);
				    for(var i=0;i<recordEqs.length;i++){
				    	var eqAttachId=recordEqs[i].getValue("eq_attach.eq_attach_id");
				    	var res4=new Ab.view.Restriction();
	    			    res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
	    			    var recordEqAttach=account1.getRecord(res4);
	    			    recordEqAttach.setValue("eq_attach.bl_id",blId);
	    			    recordEqAttach.setValue("eq_attach.fl_id",flId);
	    			    recordEqAttach.setValue("eq_attach.rm_id",rmId);
	    			    recordEqAttach.setValue("eq_attach.em_id",emId);
	    			    recordEqAttach.setValue("eq_attach.em_name",emName);
	    			    recordEqAttach.setValue("eq_attach.dp_id",dpId);
	    			    recordEqAttach.setValue("eq_attach.dp_name",dpName);
	    			    recordEqAttach.setValue("eq_attach.type_use",typeUse);
	    			    account1.saveRecord(recordEqAttach);
				    }
				}
			}
			var res=new Ab.view.Restriction();
			res.addClause('eq_change.eq_id',eqId,'=');
			this.eqAdjustInfoPanel.refresh(res);
			
			this.eqInfoPanel.refresh();
			this.eqAdjustPanel.closeWindow();
			
		}
	}
});
function showSelectInfo(row){
	//显示设备的详细信息
	var eqAdjustDS=View.dataSources.get('dsAscBjUsmsEqAdjustChangeInDvEq');
	var inDvEqDs=View.dataSources.get('dsAscBjUsmsEqAdjustChangeInDv');
	
	var eqAdjustPanel=View.panels.get('eqAdjustPanel');
	var eqAdjustInfoPanel=View.panels.get('eqAdjustInfoPanel');
	
	var eqId=row.restriction['eq.eq_id'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("eq_change.eq_id" , eqId , "=");
	eqAdjustInfoPanel.refresh(restriction);
	View.panels.get('eqAdjustInfoPanel').setTitle('设备'+eqId+'调剂记录');
	
	eqAdjustPanel.refresh([],true);
	var res=new Ab.view.Restriction();
	res.addClause('eq.eq_id',eqId);
	//显示设备变动信息
	var record=eqAdjustDS.getRecord(res);
	var eqId=record.getValue('eq.eq_id');
	var eqName=record.getValue('eq.eq_name');
	var emId=record.getValue('eq.em_id');
	var emName=record.getValue('eq.em_name');
	var typeUse=record.getValue('eq.type_use');
	var blId=record.getValue('eq.bl_id');
	var blName=record.getValue('bl.name');
	var flId=record.getValue('eq.fl_id');
	var rmId=record.getValue('eq.rm_id');
	var dvId=record.getValue('eq.dv_id');
	var dvName=record.getValue('dv.dv_name');
	var dpId=record.getValue('eq.dp_id');
	var dpName=record.getValue('dp.dp_name');

	eqAdjustPanel.setFieldValue('eq_change.em_id_old',emId);
	eqAdjustPanel.setFieldValue('eq_change.em_name_old',emName);
	eqAdjustPanel.setFieldValue('eq_change.type_use_old',typeUse);
	eqAdjustPanel.setFieldValue('eq_change.bl_id_old',blId);
	eqAdjustPanel.setFieldValue('eq_change.bl_name_old',blName);
	eqAdjustPanel.setFieldValue('eq_change.dv_id_old',dvId);
	eqAdjustPanel.setFieldValue('eq_change.dv_name_old',dvName);
	eqAdjustPanel.setFieldValue('eq_change.dp_id_old',dpId);
	eqAdjustPanel.setFieldValue('eq_change.dp_name_old',dpName);
	eqAdjustPanel.setFieldValue('eq_change.fl_id_old',flId);
	eqAdjustPanel.setFieldValue('eq_change.rm_id_old',rmId);
	
	eqAdjustPanel.setFieldValue('eq_change.dv_id',dvId);
	eqAdjustPanel.setFieldValue('eq_change.dv_name',dvName);
	eqAdjustPanel.setFieldValue('eq_change.dp_id',dpId);
	eqAdjustPanel.setFieldValue('eq_change.dp_name',dpName);
		
	eqAdjustPanel.setFieldValue('eq_change.eq_id',eqId);
	eqAdjustPanel.setFieldValue('eq_change.eq_name',eqName);
	
	View.panels.get('eqAdjustPanel').setTitle('设备'+eqId+'使用变更');
	
	var user = controller.view.user;
	controller.eqAdjustPanel.applyVpaRestrictions=false;
	if(user.role == "UNV DV EQ MOWN ADMIN"){
		//controller.eqAdjustPanel.getFieldElement('eq_change.dp_id').disabled = false;
		controller.eqAdjustPanel.showField("eq_change.dp_id",true);
		controller.eqAdjustPanel.showField("eq_change.dp_id_old",true);
		controller.eqAdjustPanel.showField("eq_change.dp_name",true);
		controller.eqAdjustPanel.showField("eq_change.dp_name_old",true);
	}else{
		//controller.eqAdjustPanel.getFieldElement('eq_change.dp_id').disabled = true;
		controller.eqAdjustPanel.showField("eq_change.dp_id",false);
		controller.eqAdjustPanel.showField("eq_change.dp_id_old",false);
		controller.eqAdjustPanel.showField("eq_change.dp_name",false);
		controller.eqAdjustPanel.showField("eq_change.dp_name_old",false);
	}		
	eqAdjustPanel.showInWindow({
		x:300,
		y:200,
		width: 800,
	    height: 500
	});
}

