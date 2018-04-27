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
		this.EqAddDisposePanel.setFieldValue('return_dispose.data_type','4');
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
			this.EqEditDisposePanel.actions.get('btnSave').enable(false);
			this.EqEditDisposePanel.actions.get('btnClear').enable(false);
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
			this.EqEditDisposePanel.actions.get('btnSave').enable(true);
			this.EqEditDisposePanel.actions.get('btnClear').enable(true);
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
	requestPanel_onSubmit:function(){
		var dsReturn = View.dataSources.get("ascBjUsmsEqReturnSch");
	    var res=new Ab.view.Restriction();
		res.addClause('return_dispose.rtr_dip_id',this.rtr_dip_id,'=');
	    var Record=dsReturn.getRecord(res);
	    Record.setValue("return_dispose.audit_status", "1");
	    dsReturn.saveRecord(Record);
	    
	    this.eqAttachPanel.show(false);
	    this.requestPanel.show(false);
	    this.AddDisposeListPanel.refresh();
	    View.showMessage("申请提交成功,请等待审核");
	},
	 /**
	   * 提交审核.
	   */
	eqAttachPanel_onSubmit:function(){
			
		var selectedRecord = this.eqAttachPanel.getSelectedRecords();
		  if(selectedRecord.length<1){
			  View.showMessage("请选择需要报减的设备");
			   return;
		  }	 	 
		    var num=[];
		    for (var i = 0; i < selectedRecord.length; i++) {
		      var row = selectedRecord[i];
		      var eq_attach_id = row.values["eq_attach.eq_attach_id"];
		      
		      num.push(parseInt(eq_attach_id));  	 
		    }
		    
		    var dsEqChange = View.dataSources.get("eq_attach_change_ds");
		 		  	
		     var message="确定要提交";
				var controller=this;
				View.confirm(message,function(button){
					if(button=="yes"){
						try {
					  		for (var i = 0; i < selectedRecord.length; i++) {
					  			var row = selectedRecord[i];
					  			var eq_attach_id = row.values["eq_attach.eq_attach_id"];
					  			var add_eq_id = row.values["eq_attach.add_eq_id"];
					  			var eq_id = row.values["eq_attach.eq_id"];
					  			var bl_id = row.values["eq_attach.bl_id"];
					  			var fl_id = row.values["eq_attach.fl_id"];
					  			var rm_id = row.values["eq_attach.rm_id"];
					  			var em_id = row.values["eq_attach.em_id"];
					  			var brand = row.values["eq_attach.brand"];
					  			var date_purchased = row.values["eq_attach.date_purchased"];
					  			var source = row.values["eq_attach.source"];
					  			var em_name = row.values["eq_attach.em_name"];
					  			var eq_warehouse = row.values["eq_attach.eq_warehouse"];
					  			var dv_id = row.values["eq_attach.dv_id"];
					  			var units = row.values["eq_attach.units"];
					  			var num_serial = row.values["eq_attach.num_serial"];
					  			var csi_id = row.values["eq_attach.csi_id"];
					  			var eq_attach_name = row.values["eq_attach.eq_attach_name"];
					  			var eq_std = row.values["eq_attach.eq_std"];
					  			var dp_id = row.values["eq_attach.dp_id"];
					  			var vn_id = row.values["eq_attach.vn_id"];
					  			var eq_type = row.values["eq_attach.eq_type"];
					  			var buy_type = row.values["eq_attach.buy_type"];
					  			var price = row.values["eq_attach.price"];
					  			var type_use = row.values["eq_attach.type_use"];
					  			var rtr_dip_id_new = controller.rtr_dip_id;
					  			//插入eq_attach_change里面一条记录
					  			var rec = new Ab.data.Record();
					  			rec.isNew = true;
					  			rec.setValue("eq_attach_change.rtr_dip_id", rtr_dip_id_new);
					  			rec.setValue("eq_attach_change.eq_id", eq_id);
					  			rec.setValue("eq_attach_change.eq_attach_id", eq_attach_id);
					  			rec.setValue("eq_attach_change.add_eq_id", add_eq_id);
					  			rec.setValue("eq_attach_change.eq_attach_name", eq_attach_name);
					  			rec.setValue("eq_attach_change.bl_id", bl_id);
					  			rec.setValue("eq_attach_change.fl_id", fl_id);
					  			rec.setValue("eq_attach_change.rm_id", rm_id);
					  			rec.setValue("eq_attach_change.em_id", em_id);
					  			rec.setValue("eq_attach_change.brand", brand);
					  			rec.setValue("eq_attach_change.vn_id", vn_id);
					  			rec.setValue("eq_attach_change.units", units);
					  			rec.setValue("eq_attach_change.num_serial", num_serial);
					  			rec.setValue("eq_attach_change.dp_id", dp_id);
					  			rec.setValue("eq_attach_change.date_purchased", date_purchased);
					  			rec.setValue("eq_attach_change.source", source);
					  			rec.setValue("eq_attach_change.eq_warehouse", eq_warehouse);
					  			rec.setValue("eq_attach_change.em_name", em_name);
					  			rec.setValue("eq_attach_change.dv_id", dv_id);
					  			rec.setValue("eq_attach_change.csi_id", csi_id);
					  			rec.setValue("eq_attach_change.eq_std", eq_std);
					  			rec.setValue("eq_attach_change.buy_type", buy_type);
					  			rec.setValue("eq_attach_change.eq_type", eq_type);
					  			rec.setValue("eq_attach_change.price", price);
					  			rec.setValue("eq_attach_change.type_use", type_use);
					  			dsEqChange.saveRecord(rec);	  	
					  			var dsReturn = View.dataSources.get("ascBjUsmsEqReturnSch");
							    var res=new Ab.view.Restriction();
								res.addClause('return_dispose.rtr_dip_id',controller.rtr_dip_id,'=');
							    var Record=dsReturn.getRecord(res);
							    Record.setValue("return_dispose.audit_status", "1");
							    dsReturn.saveRecord(Record);			
					  		}					  					    
						    controller.eqAttachPanel.show(false);
						    controller.requestPanel.show(false);
						    controller.AddDisposeListPanel.refresh();
						    View.showMessage("申请提交成功,请等待审核");
					  	} catch (e) {
					  		View.closeProgressBar();
					  		Workflow.handleError(e);
					  		return;
					  	}		   					
					    
					}else{
						
					}
				});
		     
		  	
	},
	
	showOtherWindow: function(){
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
			this.requestPanel.show(false);
			this.eqAttachPanel.show(false);
			
		}else{
			this.requestPanel.show(false);
			this.eqAttachPanel.refresh();
		}
	},
	//显示追加单的设备
	showEqAndAttach:function(){
		var panel = this.AddDisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var rtrDipId = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];
		var audit_status = panel.rows[selectedIndex]["return_dispose.audit_status"];
		var restriction=new Ab.view.Restriction();
	    restriction.addClause('eq_attach_change.rtr_dip_id',rtrDipId,'=');
	    this.requestPanel.refresh(restriction);
	    this.requestPanel.show(true);
	    this.eqAttachPanel.show(false);
	    this.rtr_dip_id=rtrDipId;
	    
	    var length = this.requestPanel.rows.length;
	    if(length>0){
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
		var eq_id = panel.rows[selectedIndex]["eq_attach_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	},
	showEqCardValue:function(){
		var panel = this.eqAttachPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_attach.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
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
			}else{
				
			}
		});
		this.requestPanel.show(false);
		this.eqAttachPanel.show(false);
	}
});


function disableField(){
	var requestPanel=View.panels.get('requestPanel');
	requestPanel.actions.get('submit').enable(false);
}
//置灰操作
/*function disableAll(){
	var AddDisposeListPanel=View.panels.get('AddDisposeListPanel');
	var EqAddDisposePanel=View.panels.get('EqAddDisposePanel');
	
	EqAddDisposePanel.actions.get('btnSave').enable(false);
	EqAddDisposePanel.actions.get('btnClear').enable(false);
	EqAddDisposePanel.enableField('return_dispose.rtr_doc',false);
	
	var gridRows=gridPanel.gridRows;
	for(var i=0;i<gridRows.length;i++){
		gridRows.get(i).actions.get('btnDispose').enable(false);
		//gridRows.get(i).actions.get('btnDispose').show(false);
	}
	
}*/