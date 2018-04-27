var controller=View.createController('adjustSelectController',{
	rtr_dip_id:"",
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
	//当点击新增后，加载初始化信息，如清查时间，操作人等
	addInitialInfo: function(){
		//this.EqAddDisposePanel.refresh();
		this.EqAddDisposePanel.showInWindow({
		      x:300,
		      y:100,
		      width: 650,
		      height: 800
		     });
		var requestDate=new Date();
		var requestEm=View.user.employee.id;
		var requestDv=View.user.employee.organization.divisionId;
		this.EqAddDisposePanel.setFieldValue('return_dispose.date_request',requestDate);
		this.EqAddDisposePanel.setFieldValue('return_dispose.request_by',requestEm);
		this.EqAddDisposePanel.setFieldValue('return_dispose.dv_id',requestDv);
		this.EqAddDisposePanel.setFieldValue('return_dispose.data_type','1');
		this.EqAddDisposePanel.setFieldValue('return_dispose.audit_status','0');
	},
	addAttach:function(){
		this.requestPanel.show(false);
		this.eqAttachPanel.show(false);
		var panel = this.AddDisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var rtrStatus = panel.rows[selectedIndex]["return_dispose.audit_status"];		
		var rtr_dip_id = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];
		
	    
		 //当处置单的状态为已提交或审核已通过时，不可编辑
		if(rtrStatus=='已提交'||rtrStatus=='审核已通过'||rtrStatus=='处理完成' || rtrStatus=='已公示'){	
			var restriction=new Ab.view.Restriction();
			restriction.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
			this.EqEditDisposePanel.refresh(restriction);
			//置灰操作
			this.EqEditDisposePanel.enableField('return_dispose.rtr_doc',false);
			this.EqEditDisposePanel.enableField('return_dispose.description',false);
			this.EqEditDisposePanel.enableField('return_dispose.rtr_dip_name',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dispose',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dv_manage',false);
			this.EqEditDisposePanel.enableField('return_dispose.check_member',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_check',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_lab',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_asset',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_finance',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dv_head',false);
			this.EqEditDisposePanel.enableField('return_dispose.cause_logistics',false);
			this.EqEditDisposePanel.showInWindow({
			      x:300,
			      y:100,
			      width: 650,
			      height: 800
			     });
		}else{
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
			this.EqEditDisposePanel.refresh(restriction);
			//置灰操作
			this.EqEditDisposePanel.enableField('return_dispose.rtr_doc',true);
			this.EqEditDisposePanel.enableField('return_dispose.description',true);
			this.EqEditDisposePanel.enableField('return_dispose.rtr_dip_name',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dispose',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dv_manage',true);
			this.EqEditDisposePanel.enableField('return_dispose.check_member',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_check',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_lab',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_asset',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_finance',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_dv_head',true);
			this.EqEditDisposePanel.enableField('return_dispose.cause_logistics',true);
			this.EqEditDisposePanel.showInWindow({
			      x:300,
			      y:100,
			      width: 650,
			      height: 800
			});
		}
		
	},
	//清除按钮，清除输入的信息
	clearRdDetialForm: function(){
		this.EqAddDisposePanel.setFieldValue('return_dispose.rtr_dip_name','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.description','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_dispose','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_dv_manage','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.check_member','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_check','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_lab','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_asset','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_finance','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_dv_head','');
		this.EqAddDisposePanel.setFieldValue('return_dispose.cause_logistics','');
	},
	//清除按钮，清除输入的信息
	clearEditDetialForm: function(){
		this.EqEditDisposePanel.setFieldValue('return_dispose.rtr_dip_name','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.description','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_dispose','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_dv_manage','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.check_member','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_check','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_lab','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_asset','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_finance','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_dv_head','');
		this.EqEditDisposePanel.setFieldValue('return_dispose.cause_logistics','');
	},
	EqAddDisposePanel_onBtnSave:function(){
		this.eqAttachPanel.show(false);
		var success=this.EqAddDisposePanel.canSave();
		if(success){
			this.EqAddDisposePanel.save();
			View.panels.get("EqAddDisposePanel").closeWindow();
			this.AddDisposeListPanel.refresh();
		}
	},
	EqEditDisposePanel_onBtnSave:function(){
		this.eqAttachPanel.show(false);
		var success=this.EqEditDisposePanel.canSave();
		if(success){
			this.EqEditDisposePanel.save();
			View.panels.get("EqEditDisposePanel").closeWindow();
			this.AddDisposeListPanel.refresh();
		}		
	},
	 /**
	   * 下一步.
	   */
	gridPanel_onSubmit:function(){
		this.eqAttachPanel.show(false);
		var dsEqChange = View.dataSources.get("eq_change_ds");
		var selectedRecord = this.gridPanel.getSelectedRecords();
		  if(selectedRecord.length<1){
			  View.showMessage("请选择需要报减的设备");
			   return;
		  }	 	 
		    var num=[];
		    for (var i = 0; i < selectedRecord.length; i++) {
		      var row = selectedRecord[i];
		      var eq_id = row.values["eq.eq_id"];
		      
		      num.push(parseInt(eq_id));  	 
		    }
		    var restriction=new Ab.view.Restriction();
		   restriction.addClause('eq_change.rtr_dip_id',this.rtr_dip_id,'=');
		   restriction.addClause('eq_change.eq_id',num,'in');
		   var Records=dsEqChange.getRecords(restriction);
		   
		     if(Records.length>0){
		      View.showMessage("当前选中的设备中已在该任务下");
		      return;
		     }
		 		  	
		  	try {
		  		for (var i = 0; i < selectedRecord.length; i++) {
		  			var row = selectedRecord[i];
		  			var eq_id = row.values["eq.eq_id"];
		  			var eq_id_old = row.values["eq.eq_id_old"];
		  			var bl_id = row.values["eq.bl_id"];
		  			var fl_id = row.values["eq.fl_id"];
		  			var rm_id = row.values["eq.rm_id"];
		  			var em_id = row.values["eq.em_id"];
		  			var em_name = row.values["eq.em_name"];
		  			var dv_id = row.values["eq.dv_id"];
		  			var dp_id = row.values["eq.dp_id"];
		  			var csi_id = row.values["eq.csi_id"];
		  			var eq_name = row.values["eq.eq_name"];
		  			var eq_std = row.values["eq.eq_std"];
		  			var eq_type = row.values["eq.eq_type"];
		  			var price = row.values["eq.price"];
		  			var type_use = row.values["eq.type_use"];
		  			var brand = row.values["eq.brand"];
		  			var eq_warehouse = row.values["eq.eq_warehouse"];
		  			var num_eq = row.values["eq.num_eq"];
		  			var units = row.values["eq.units"];
		  			var buy_type = row.values["eq.buy_type"];
		  			var source = row.values["eq.source"];
		  			var is_up = row.values["eq.is_up"];
		  			var sch_status = row.values["eq.sch_status"];
		  			var add_comment = row.values["eq.add_comment"];
		  			var rtr_dip_id_new = this.rtr_dip_id;
		  			//插入eq_change里面一条记录
		  			var rec = new Ab.data.Record();
		  			rec.isNew = true;
		  			rec.setValue("eq_change.rtr_dip_id", rtr_dip_id_new);
		  			rec.setValue("eq_change.eq_id", eq_id);
		  			rec.setValue("eq_change.eq_id_old", eq_id_old);
		  			rec.setValue("eq_change.eq_name", eq_name);
		  			rec.setValue("eq_change.bl_id", bl_id);
		  			rec.setValue("eq_change.fl_id", fl_id);
		  			rec.setValue("eq_change.rm_id", rm_id);
		  			rec.setValue("eq_change.em_id", em_id);
		  			rec.setValue("eq_change.em_name", em_name);
		  			rec.setValue("eq_change.dv_id", dv_id);
		  			rec.setValue("eq_change.dp_id", dp_id);
		  			rec.setValue("eq_change.csi_id", csi_id);
		  			rec.setValue("eq_change.eq_std", eq_std);
		  			rec.setValue("eq_change.eq_type", eq_type);
		  			rec.setValue("eq_change.price", price);
		  			rec.setValue("eq_change.type_use", type_use);
		  			rec.setValue("eq_change.brand", brand);
		  			rec.setValue("eq_change.eq_warehouse", eq_warehouse);
		  			rec.setValue("eq_change.num_eq", num_eq);
		  			rec.setValue("eq_change.units", units);
		  			rec.setValue("eq_change.buy_type", buy_type);
		  			rec.setValue("eq_change.source", source);
		  			rec.setValue("eq_change.is_up", is_up);
		  			rec.setValue("eq_change.sch_status", sch_status);
		  			rec.setValue("eq_change.add_comment", add_comment);
		  			dsEqChange.saveRecord(rec);	  				  				  			
		  		}
		  		this.tabs.rtrDipId=this.rtr_dip_id;
		  		var nextTabName="requestTab";
		 	    this.tabs.findTab(nextTabName).show(true);
		 	    this.tabs.findTab("selectTab").enable(false);
		 	    this.tabs.selectTab(nextTabName,null,false,true,false);
		  	} catch (e) {
		  		View.closeProgressBar();
		  		Workflow.handleError(e);
		  		return;
		  	}		   
	},
	
	showOtherWindow: function(){
		this.gridPanel.show();
		var selectRowIndex=this.AddDisposeListPanel.selectedRowIndex;
		var selectRecord=this.AddDisposeListPanel.gridRows.get(selectRowIndex).getRecord();
		var rtrDipId=selectRecord.getValue('return_dispose.rtr_dip_id');
		var rtrStatus=selectRecord.getValue('return_dispose.audit_status');
		
		this.rtr_dip_id=rtrDipId;
		//当处置单的状态为已提交或审核已通过时，所有按钮置灰，不可编辑
		if(rtrStatus=='1'||rtrStatus=='2'||rtrStatus=='4' || rtrStatus=='5'){
			//置灰操作
			//disableAll();
			View.alert('此项已提交或审核已通过,不可编辑');
			this.gridPanel.show(false);
			this.requestPanel.show(false);
			this.eqAttachPanel.show(false);
			
		}else{
			this.gridPanel.refresh();
			this.requestPanel.show(false);
			this.eqAttachPanel.show(false);
		}
	},
	requestPanel_onBtnNext:function(){
		this.tabs.rtrDipId=this.rtr_dip_id;
  		var nextTabName="requestTab";
 	    this.tabs.findTab(nextTabName).show(true);
 	    this.tabs.selectTab(nextTabName,null,false,true,false);
	},
	//显示报减单的设备
	showEqAndAttach:function(){
		var panel = this.AddDisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var rtrDipId = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];
		var audit_status = panel.rows[selectedIndex]["return_dispose.audit_status"];
		var restriction=new Ab.view.Restriction();
	    restriction.addClause('eq_change.rtr_dip_id',rtrDipId,'=');
	    this.requestPanel.refresh(restriction);
	    this.requestPanel.show(true);
	    this.eqAttachPanel.show(false);
	    this.rtr_dip_id=rtrDipId;
	    this.gridPanel.show(false);
	    var length = this.requestPanel.rows.length;
	    if(length>0){
	    	this.showAttachList(true);
	    	if(audit_status=='已提交' || audit_status=='审核已通过' || audit_status=='处理完成' || audit_status=='已公示'){
		    	disableField();
		    }
	    }else{
	    	disableField();
	    }
	},
	//显示设备卡片
	showEqCard:function(){
		var panel = this.requestPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	},
	//显示设备下的报减附件
	showAttachList:function(autoShow){
		var panel = this.requestPanel;
	      var selectedIndex="-1";
	      if(autoShow){
	       selectedIndex="0";
	      }else{
	       selectedIndex=panel.selectedRowIndex;
	      }
	    var eqId = panel.rows[selectedIndex]["eq_change.eq_id"];
		/*var selectIndex=this.requestPanel.selectedRowIndex;
		var eqId=this.requestPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');*/
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.sch_status','6','=');
		this.eqAttachPanel.refresh(res,false);
		this.eqAttachPanel.setTitle("设备【"+eqId+"】的附件列表");
		this.gridPanel.show(false);
	},
	AddDisposeListPanel_btnDelete_onClick:function(row){
		 var panel = this.AddDisposeListPanel;
		 var selectedIndex = panel.selectedRowIndex;
		 var rtrStatus = panel.rows[selectedIndex]["return_dispose.audit_status"];
		//当处置单的状态为已提交或审核已通过时，不可删除
		 if(rtrStatus=='已提交'||rtrStatus=='审核已通过'||rtrStatus=='处理完成' || rtrStatus=='已公示'){
			//置灰操作
			//disableAll();
			View.alert('此项已提交或审核已通过,不可编辑');
			this.gridPanel.show(false);
			this.requestPanel.show(false);
			this.eqAttachPanel.show(false);
			return;
		}
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var selectRecord=row.getRecord();
				View.dataSources.get('ascBjUsmsEqReturnSch').deleteRecord(selectRecord);
				controller.AddDisposeListPanel.refresh();	
				controller.gridPanel.show(false);
			}else{
				
			}
		});
		this.requestPanel.show(false);
		this.eqAttachPanel.show(false);
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

function disableField(){
	var requestPanel=View.panels.get('requestPanel');
	requestPanel.actions.get('btnNext').enable(false);
}

//置灰操作
/*function disableAll(){
	var AddDisposeListPanel=View.panels.get('AddDisposeListPanel');
	var EqAddDisposePanel=View.panels.get('EqAddDisposePanel');
	var gridPanel=View.panels.get('gridPanel');
	
	EqAddDisposePanel.actions.get('btnSave').enable(false);
	EqAddDisposePanel.actions.get('btnClear').enable(false);
	EqAddDisposePanel.enableField('return_dispose.rtr_doc',false);
	
	var gridRows=gridPanel.gridRows;
	for(var i=0;i<gridRows.length;i++){
		gridRows.get(i).actions.get('btnDispose').enable(false);
		//gridRows.get(i).actions.get('btnDispose').show(false);
	}
	
}*/