var controller=View.createController('eqAssignForm',{
	afterInitialDataFetch: function(){
		this.dpTreePanel.show(false);
		this.showAttachInfo(true);
	},
	formPanel_afterRefresh: function(){
		this.formPanel.setFieldValue('eq.bl_id','');
		this.formPanel.setFieldValue('eq.fl_id','');
		this.formPanel.setFieldValue('eq.rm_id','');
		this.formPanel.setFieldValue('eq.em_id','');
		this.formPanel.setFieldValue('eq.em_name','');
		this.formPanel.setFieldValue('eq.dp_id','');
		this.formPanel.setFieldValue('eq.type_use','1');
		this.formPanel.setFieldValue('eq.sch_status','1');
	},
	showAttachInfo: function(autoShow){
		var length = this.gridPanel.rows.length;
		if(length>0){
			var panel = this.gridPanel;
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=panel.selectedRowIndex;
			}
			var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
			var rest2=new Ab.view.Restriction();
			rest2.addClause("eq_attach.eq_id",eq_id,"=");
			this.eqAttachPanel.refresh(rest2);
		}
	},
	formPanel_onBtnAssign: function(){
		var canSave=true;
		var eqId=this.formPanel.getFieldValue('eq.eq_id');
		var blId=this.formPanel.getFieldValue('eq.bl_id');
		var flId=this.formPanel.getFieldValue('eq.fl_id');
		var rmId=this.formPanel.getFieldValue('eq.rm_id');
		var emId=this.formPanel.getFieldValue('eq.em_id');
		var emName=this.formPanel.getFieldValue('eq.em_name');
		var dvId=this.formPanel.getFieldValue('eq.dv_id');
		var dpId=this.formPanel.getFieldValue('eq.dp_id');
		var add_comment=this.formPanel.getFieldValue('eq.add_comment');
		if(!valueExistsNotEmpty(emId)){
			canSave=false;
		}
		if(!canSave){
			View.alert('带*号标记的字段不能为空');
		}else{
			var eqRecord=this.formPanel.getRecord();
			var eqDs=View.dataSources.get('ascBjUsmsEqDs');
			try{
				//1、保存eq表中信息建筑物、楼层、房间 、领用人
				eqDs.saveRecord(eqRecord);
				
				//2、同时更新补充设备附件eq_attach表中的建筑物、楼层、房间、领用人、单位、部门
				var account1=View.dataSources.get("eq_attach_ds");
             	var res3=new Ab.view.Restriction();
			    res3.addClause("eq_attach.eq_id",eqId,"=");
			    res3.addClause("eq_attach.sch_status",'2',"=");
			    var recordEqs=account1.getRecords(res3);
			    for(var i=0;i<recordEqs.length;i++){
			    	var eqAttachId=recordEqs[i].getValue("eq_attach.eq_attach_id");
			    	var res4=new Ab.view.Restriction();
    			    res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
    			    var recordEqAttach=account1.getRecord(res4);
    			    recordEqAttach.setValue("eq_attach.dv_id",dvId);
    			    recordEqAttach.setValue("eq_attach.dp_id",dpId);
    			    recordEqAttach.setValue("eq_attach.bl_id",blId);
    			    recordEqAttach.setValue("eq_attach.fl_id",flId);
    			    recordEqAttach.setValue("eq_attach.rm_id",rmId);
    			    recordEqAttach.setValue("eq_attach.em_id",emId);
    			    recordEqAttach.setValue("eq_attach.em_name",emName);
    			    recordEqAttach.setValue("eq_attach.add_comment",add_comment);
    			    recordEqAttach.setValue("eq_attach.sch_status","1");
    			    account1.saveRecord(recordEqAttach);
			    }
				
				//3、由于是从其他单位调剂过来的，所以补充完审批调剂记录 建筑物、楼层、房间、领用人工号、领用人
				var restriction = new Ab.view.Restriction();
				var account = View.dataSources.get("eq_change_ds");
				restriction.addClause("eq_change.eq_id", eqId, "=");
				restriction.addClause("eq_change.approved_status", "1", "=");
				restriction.addClause('eq_change.em_id', '', 'IS NULL', 'AND', true);

				var record = account.getRecord(restriction);
				record.setValue("eq_change.em_id",emId);
				record.setValue("eq_change.em_name",emName);
				record.setValue("eq_change.bl_id",blId);
				record.setValue("eq_change.fl_id",flId);
				record.setValue("eq_change.rm_id",rmId);
				account.saveRecord(record);
				
				View.alert("设备分配成功");
			}catch(e){
				View.alert("设备分配未成功，请重新分配");
			}
			View.panels.get('formPanel').show(false);
			View.panels.get('eqAttachPanel').show(false);
			View.panels.get('gridPanel').refresh();
		}
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
		View.panels.get('formPanel').setFieldValue('eq.dp_id',dpId);
		View.panels.get('formPanel').setFieldValue('eq.dl_id','');
		View.panels.get('formPanel').setFieldValue('eq.dp_commnets',dpId);
		this.dpTreePanel.closeWindow();
	},
	onClickDlNode: function(){
		var curTreeNode=View.panels.get('dpTreePanel').lastNodeClicked;
		var dpId=curTreeNode.data['dp_level.dp_id'];
		var dlId=curTreeNode.data['dp_level.dl_id'];
		var dp_dl=dpId+'|'+dlId;
		View.panels.get('formPanel').setFieldValue('eq.dp_id',dpId);
		View.panels.get('formPanel').setFieldValue('eq.dl_id',dlId);
		View.panels.get('formPanel').setFieldValue('eq.dp_commnets',dp_dl);
		this.dpTreePanel.closeWindow();
	}
});