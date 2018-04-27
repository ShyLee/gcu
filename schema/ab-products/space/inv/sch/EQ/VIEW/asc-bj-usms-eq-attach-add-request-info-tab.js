var controller=View.createController('adjustSelectController',{
	tabs: null,
	rtrId:"",
	saveType:"edit",
	eqid_new:"",
	eqIds:[],
	isBatch:false,
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
	afterInitialDataFetch: function(){
		this.onStart(true);
	},
	helpPanel_afterRefresh:function(){
		this.onStart(true);
	},
	addAttach:function(){		
		var panel = this.eqAttachPanel2;
		var selectedIndex = panel.selectedRowIndex;
		var eq_attach_id = panel.rows[selectedIndex]["eq_attach.eq_attach_id"];
	    var restriction=new Ab.view.Restriction();
		restriction.addClause('eq_attach.eq_attach_id',eq_attach_id,'=');
		this.eqAttachForm.refresh(restriction);
		this.eqAttachForm.showInWindow({
		      x:300,
		      y:100,
		      width: 700,
		      height: 500
		     });
		this.saveType="edit";
	},
	onStart:function(autoShow){
		
		this.tabs=View.getControlsByType(parent, 'tabs')[0];
		this.rtrId=this.tabs.rtrDipId;
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_change.rtr_dip_id",this.rtrId,"=");
		this.requestPanel.refresh(restriction);
		
		this.helpPanel.show(false);
		
		var panel = this.requestPanel;
	    var selectedIndex="-1";
	    if(autoShow){
	       selectedIndex="0";
	    }else{
	       selectedIndex=panel.selectedRowIndex;
	    }
	    var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_id",eq_id,"=");
		res1.addClause("eq_attach.type","1","=");
		res1.addClause("eq_attach.sch_status","7","=");
		res1.addClause('eq_attach.rtr_dip_id',this.rtrId,'=');
		this.eqAttachPanel2.refresh(res1);
		if(eq_id==null){
			this.eqAttachPanel2.setTitle("资产追加列表");
		}else{
			this.eqAttachPanel2.setTitle("设备【"+eq_id+"】的资产追加列表");
		}
	},
	//删除已经添加到eq_change表中的设备,并删除该设备资产追加的附件
	requestPanel_delete_onClick: function(row){
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var selectRecord=row.getRecord();
				//拿到当前行的设备下的追加资产
				var eq_id = selectRecord.values["eq_change.eq_id"];
				try {
			          Workflow.callMethod('AbSpaceRoomInventoryBAR-HousePKValueHander-deleteEqAddValue',eq_id,controller.rtrId);
			          
			        } 
			        catch (e) {
			            //Workflow.handleError(e);
			        	View.alert('工作流失败');
			        } 
				controller.requestPanel.refresh();
				controller.eqAttachPanel2.refresh();		
				controller.eqAttachPanel2.setTitle("资产追加列表");		
			}else{
				
			}
		});
		controller.requestPanel.refresh();
		controller.eqAttachPanel2.refresh();
	},
	/**
	 * 给设备添加 设备附件
	 */
	requestPanel_onAdd:function(){
		var length = this.eqAttachPanel2.rows.length;
//		if(length<1){
			this.eqAttachForm.showInWindow({
			      x:300,
			      y:100,
			      width: 700,
			      height: 500
			     });
			var panel = this.requestPanel;
			var selectedIndex = panel.selectedRowIndex;
			var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];
		    var dsEq = View.dataSources.get("eq_ds");
		    var restriction=new Ab.view.Restriction();
			restriction.addClause('eq.eq_id',eq_id,'=');
		    var Record=dsEq.getRecord(restriction);
		    var buy_type = Record.getValue("eq.buy_type");
		    var add_eq_id = Record.getValue("eq.add_eq_id");
		    var dv_id = Record.getValue("eq.dv_id");
		    var dp_id = Record.getValue("eq.dp_id");
		    var bl_id = Record.getValue("eq.bl_id");
		    var fl_id = Record.getValue("eq.fl_id");
		    var rm_id = Record.getValue("eq.rm_id");
		    var em_id = Record.getValue("eq.em_id");
		    var em_name = Record.getValue("eq.em_name");
		    var add_comment = Record.getValue("eq.add_comment");
		    var eq_warehouse = Record.getValue("eq.eq_warehouse");
			
			this.eqAttachForm.refresh([],true);
			
			this.eqAttachForm.setTitle("为设备【"+eq_id+"】追加附件");
			this.eqAttachForm.setFieldValue("eq_attach.add_eq_id",add_eq_id);
			this.eqAttachForm.setFieldValue("eq_attach.eq_id",eq_id);
			this.eqAttachForm.setFieldValue("eq_attach.buy_type",buy_type);
			this.eqAttachForm.setFieldValue("eq_attach.type","1");
			this.eqAttachForm.setFieldValue("eq_attach.rtr_dip_id",this.rtrId);
			this.eqAttachForm.setFieldValue("eq_attach.dv_id",dv_id);
			this.eqAttachForm.setFieldValue("eq_attach.dp_id",dp_id);
			this.eqAttachForm.setFieldValue("eq_attach.sch_status","7");
			this.eqAttachForm.setFieldValue("eq_attach.bl_id",bl_id);
			this.eqAttachForm.setFieldValue("eq_attach.fl_id",fl_id);
			this.eqAttachForm.setFieldValue("eq_attach.rm_id",rm_id);
			this.eqAttachForm.setFieldValue("eq_attach.em_id",em_id);
			this.eqAttachForm.setFieldValue("eq_attach.em_name",em_name);
			this.eqAttachForm.setFieldValue("eq_attach.add_comment",add_comment);
			this.eqAttachForm.setFieldValue("eq_attach.eq_warehouse",eq_warehouse);
			
			this.eqAttachPanel2.setTitle("设备【"+eq_id+"】追加的资产信息");
			this.saveType="save";
			this.isBatch=false;
			this.batchEqAttachForm.closeWindow();
//		}else{
//			this.eqAttachForm.show(false);
//			View.showMessage("一次只能追加一个设备附件");
//		    return;
//		}
			
	},
	
	eqAttachForm_onSave:function(){
		var eq_id = this.eqAttachForm.getFieldValue("eq_attach.eq_id");
		var eq_attach_id = this.eqAttachForm.getFieldValue("eq_attach.eq_attach_id");
		var price = this.eqAttachForm.getFieldValue("eq_attach.price");
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
		    this.eqAttachForm.setFieldValue('eq_attach.price_old',price);
		    if(this.eqAttachForm.canSave()){			
		    	this.addAttachChange(id,"a");
				var success=this.eqAttachForm.save();
				if(success){
					this.eqAttachForm.closeWindow();
					var restriction=new Ab.view.Restriction();
					restriction.addClause('eq_attach.eq_id',eq_id,'=');
					restriction.addClause('eq_attach.type','1','=');
					this.eqAttachPanel2.refresh(restriction);
					this.eqAttachPanel2.setTitle("设备【"+eq_id+"】的资产追加列表");
				}
			}
		}else if(this.saveType=="edit"){
			if(this.eqAttachForm.canSave()){	
				this.addAttachChange(eq_attach_id,"b");
				var success=this.eqAttachForm.save();
				if(success){
					this.eqAttachForm.closeWindow();
					var restriction=new Ab.view.Restriction();
					restriction.addClause('eq_attach.eq_id',eq_id,'=');
					restriction.addClause('eq_attach.type','1','=');
					this.eqAttachPanel2.refresh(restriction);
					this.eqAttachPanel2.setTitle("设备【"+eq_id+"】的资产追加列表");
				}
			}
		}	
		
	},
	addAttachChange:function(id,field){
		var dsEqAttachChange = View.dataSources.get("eq_attach_change_ds");
		
		var eq_id = this.eqAttachForm.getFieldValue("eq_attach.eq_id");
		var csi_id = this.eqAttachForm.getFieldValue("eq_attach.csi_id");
		var eq_attach_name = this.eqAttachForm.getFieldValue("eq_attach.eq_attach_name");
		var brand = this.eqAttachForm.getFieldValue("eq_attach.brand");
		var eq_std = this.eqAttachForm.getFieldValue("eq_attach.eq_std");
		var eq_type = this.eqAttachForm.getFieldValue("eq_attach.eq_type");
		var price = this.eqAttachForm.getFieldValue("eq_attach.price");
		var buy_type = this.eqAttachForm.getFieldValue("eq_attach.buy_type");
		var units = this.eqAttachForm.getFieldValue("eq_attach.units");
		var source = this.eqAttachForm.getFieldValue("eq_attach.source");
		var type_use = this.eqAttachForm.getFieldValue("eq_attach.type_use");
		var subject_funds = this.eqAttachForm.getFieldValue("eq_attach.subject_funds");
		var ctry_id = this.eqAttachForm.getFieldValue("eq_attach.ctry_id");
		var ctry_name = this.eqAttachForm.getFieldValue("eq_attach.ctry_name");
		var dv_id = this.eqAttachForm.getFieldValue("eq_attach.dv_id");
		var dp_id = this.eqAttachForm.getFieldValue("eq_attach.dp_id");
		var date_in_service = this.eqAttachForm.getFieldValue("eq_attach.date_in_service");
		var date_purchased = this.eqAttachForm.getFieldValue("eq_attach.date_purchased");
		var vn_id = this.eqAttachForm.getFieldValue("eq_attach.vn_id");
		var num_serial = this.eqAttachForm.getFieldValue("eq_attach.num_serial");
		var comments = this.eqAttachForm.getFieldValue("eq_attach.comments");
		var handling_em = this.eqAttachForm.getFieldValue("eq_attach.handling_em");
		var handling_em_name = this.eqAttachForm.getFieldValue("eq_attach.handling_em_name");
		var sch_status = this.eqAttachForm.getFieldValue("eq_attach.sch_status");
		var bl_id = this.eqAttachForm.getFieldValue("eq_attach.bl_id");
		var fl_id = this.eqAttachForm.getFieldValue("eq_attach.fl_id");
		var rm_id = this.eqAttachForm.getFieldValue("eq_attach.rm_id");
		var em_id = this.eqAttachForm.getFieldValue("eq_attach.em_id");
		var em_name = this.eqAttachForm.getFieldValue("eq_attach.em_name");
		var rtr_dip_id = this.eqAttachForm.getFieldValue("eq_attach.rtr_dip_id");
		var eq_warehouse = this.eqAttachForm.getFieldValue("eq_attach.eq_warehouse");
		var is_up = this.eqAttachForm.getFieldValue("eq_attach.is_up");
		var is_label = this.eqAttachForm.getFieldValue("eq_attach.is_label");
		if(field=="a"){
			var rec = new Ab.data.Record();
	         rec.isNew = true;
	         rec.setValue("eq_attach_change.eq_id", eq_id);
	         rec.setValue("eq_attach_change.eq_attach_id", id);
	         rec.setValue("eq_attach_change.csi_id", csi_id);
	         rec.setValue("eq_attach_change.eq_attach_name", eq_attach_name);
	         rec.setValue("eq_attach_change.brand", brand);
	         rec.setValue("eq_attach_change.eq_std", eq_std);
	         rec.setValue("eq_attach_change.eq_type", eq_type);
	         rec.setValue("eq_attach_change.price", price);
	         rec.setValue("eq_attach_change.buy_type", buy_type);
	         rec.setValue("eq_attach_change.units", units);
	         rec.setValue("eq_attach_change.source", source);
	         rec.setValue("eq_attach_change.type_use",type_use);
	         rec.setValue("eq_attach_change.subject_funds",subject_funds);
	         rec.setValue("eq_attach_change.ctry_id",ctry_id);
	         rec.setValue("eq_attach_change.ctry_name",ctry_name);
	         rec.setValue("eq_attach_change.dv_id",dv_id);
	         rec.setValue("eq_attach_change.dp_id",dp_id);
	         rec.setValue("eq_attach_change.date_in_service",date_in_service);
	         rec.setValue("eq_attach_change.date_purchased",date_purchased);
	         rec.setValue("eq_attach_change.vn_id",vn_id);
	         rec.setValue("eq_attach_change.num_serial",num_serial);
	         rec.setValue("eq_attach_change.comments",comments);
	         rec.setValue("eq_attach_change.handling_em",handling_em);
	         rec.setValue("eq_attach_change.handling_em_name",handling_em_name);
	         rec.setValue("eq_attach_change.sch_status",sch_status);
	         rec.setValue("eq_attach_change.bl_id",bl_id);
	         rec.setValue("eq_attach_change.fl_id",fl_id);
	         rec.setValue("eq_attach_change.rm_id",rm_id);
	         rec.setValue("eq_attach_change.em_id",em_id);
	         rec.setValue("eq_attach_change.em_name",em_name);
	         rec.setValue("eq_attach_change.rtr_dip_id",rtr_dip_id);
	         rec.setValue("eq_attach_change.eq_warehouse",eq_warehouse);
	         rec.setValue("eq_attach_change.is_up",is_up);
	         rec.setValue("eq_attach_change.is_label",is_label);
	         /*rec.setValue("eq_attach_change.adjust_status","3");*/
	         dsEqAttachChange.saveRecord(rec);
		}else if(field=="b"){
			 var res=new Ab.view.Restriction();
			 res.addClause('eq_attach_change.eq_attach_id',id,'=');
			 res.addClause('eq_attach_change.rtr_dip_id',rtr_dip_id,'=');
			 /*res.addClause('eq_attach_change.adjust_status','3','=');*/
			 var record=dsEqAttachChange.getRecord(res);


			 record.setValue("eq_attach_change.csi_id", csi_id);
			 record.setValue("eq_attach_change.eq_attach_name", eq_attach_name);
			 record.setValue("eq_attach_change.brand", brand);
			 record.setValue("eq_attach_change.eq_std", eq_std);
			 record.setValue("eq_attach_change.eq_type", eq_type);
			 record.setValue("eq_attach_change.price", price);
			 record.setValue("eq_attach_change.buy_type", buy_type);
			 record.setValue("eq_attach_change.units", units);
			 record.setValue("eq_attach_change.source", source);
			 record.setValue("eq_attach_change.type_use", type_use);
			 record.setValue("eq_attach_change.subject_funds", subject_funds);
			 record.setValue("eq_attach_change.ctry_id", ctry_id);
			 record.setValue("eq_attach_change.ctry_name", ctry_name);
			 record.setValue("eq_attach_change.date_in_service", date_in_service);
			 record.setValue("eq_attach_change.date_purchased", date_purchased);
			 record.setValue("eq_attach_change.vn_id", vn_id);
			 record.setValue("eq_attach_change.num_serial", num_serial);
			 record.setValue("eq_attach_change.comments", comments);
			 record.setValue("eq_attach_change.is_up",is_up);
			 record.setValue("eq_attach_change.is_label",is_label);
			 dsEqAttachChange.saveRecord(record);
		}
		 
	},
	showAddAttach:function(){
		
		var selectIndex=this.requestPanel.selectedRowIndex;
		var eqId=this.requestPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.type','1','=');
		res.addClause('eq_attach.rtr_dip_id',this.rtrId,'=');
		this.eqAttachPanel2.refresh(res,false);
		this.eqAttachPanel2.setTitle("设备【"+eqId+"】的资产追加列表");
		this.eqid_new=eqId;
	},
	//返回上一个tab
	goBack: function(){
		var nextTabName ='selectTab';
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    this.tabs.selectTab(nextTabName);
	},
	//提交审核
	requestPanel_onSubmit:function(){
		var rows = this.requestPanel.rows;
		var dsEqChange = View.dataSources.get("eq_attach_ds2");
		
		for(var i=0;i<rows.length;i++){
			var eqId = rows[i]['eq_change.eq_id'];
			var restraction=new Ab.view.Restriction();
			restraction.addClause('eq_attach.rtr_dip_id',this.rtrId,'=');
			restraction.addClause('eq_attach.eq_id',eqId,'=');
			
			var records=dsEqChange.getRecords(restraction);
			if(records.length<1){
				View.showMessage("设备【"+eqId+"】追加的资产信息为空，无法追加");
				return;
			}
		}
		
	    
		var message="确定要提交";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var dsReturn = View.dataSources.get("ascBjUsmsEqReturnSch");
			    var res=new Ab.view.Restriction();
				res.addClause('return_dispose.rtr_dip_id',controller.rtrId,'=');
			    var Record=dsReturn.getRecord(res);
			    Record.setValue("return_dispose.audit_status", "1");
			    dsReturn.saveRecord(Record);
			    View.showMessage("申请提交成功,请等待审核");
			    var nextTabName ='selectTab';
			    var nextTab = controller.tabs.findTab(nextTabName);
			    nextTab.loadView();
			    controller.tabs.selectTab(nextTabName);
			}
		});		
	},
	//删除追加附件
	eqAttachPanel2_btnEqAttachDel_onClick:function(row){
		var dsEqAttachChange = View.dataSources.get("eq_attach_change_ds");
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var selectRecord=row.getRecord();
				var eq_id = selectRecord.values["eq_attach.eq_id"];
				var eq_attach_id = selectRecord.values["eq_attach.eq_attach_id"];
				var rtr_dip_id = selectRecord.values["eq_attach.rtr_dip_id"];
				//删除eq_attach_change表的记录
				var res=new Ab.view.Restriction();
				 res.addClause('eq_attach_change.eq_attach_id',eq_attach_id,'=');
				 res.addClause('eq_attach_change.rtr_dip_id',rtr_dip_id,'=');
				 var record=dsEqAttachChange.getRecord(res);
				 dsEqAttachChange.deleteRecord(record);
				 //删除eq_attach表的记录
				View.dataSources.get('eq_attach_ds2').deleteRecord(selectRecord);
				controller.eqAttachPanel2.refresh();	
			}else{
				
			}
		});
		View.panels.get('requestPanel').refresh();
		View.panels.get('eqAttachPanel2').refresh();
		View.panels.get('eqAttachPanel2').setTitle("设备【"+eq_id+"】的资产追加列表");
	},
	requestPanel_onBatchAdd: function(){
		var selected=this.requestPanel.getSelectedRows();
		if (selected.length<1) {
			View.alert('请选择要追加的设备');
			return;
		}
		this.batchEqAttachForm.showInWindow({
		      x:300,
		      y:100,
		      width: 700,
		      height: 500
	    });
		this.batchEqAttachForm.refresh(null,true);
		this.batchEqAttachForm.setFieldValue("eq_attach.rtr_dip_id",this.rtrId);
		this.eqIds=[];
		for ( var i = 0; i < selected.length; i++) {
			this.eqIds.push(selected[i]['eq_change.eq_id']);
		}
		this.eqAttachForm.closeWindow();
		this.isBatch=true;
	},
	batchEqAttachForm_onSave: function(){
		var eqAttachRecord=this.batchEqAttachForm.getOutboundRecord();
		try {
			var result = Workflow.callMethod('AbAssetManagement-EquipmentHandler-batchAddAttach',JSON.stringify(this.eqIds),eqAttachRecord);
			if (result.code == 'executed') {
				View.alert('批量追加完成！');
			}
		} catch (e) {
			Workflow.handleError(e);
			return;
		}         
	},
	selectCsiId: function(){
		View.openDialog("asc-bj-usms-eq-add-dv-assign-dialog.axvw",null,false,{
		    isBatch:this.isBatch
		});
	}
	
});


//选择商家界面
function showSelectVnPanel(){
	var vnSelectPanel=View.panels.get('vnselectPanel');
	vnSelectPanel.showInWindow({
        width: 800,
        height: 600,
        closeButton: false,
        isBatch:false
    });
	vnSelectPanel.refresh();
}

//新增商家界面
function afterSaveVn(){
	View.panels.get('vnselectPanel').refresh();
	View.panels.get('detailsPanel').closeWindow();
}

//选择商家后填入相应的字段
function selectVnAsValue(value){
	var vnId=value.restriction['vn.vn_id'];
	if (controller.isBatch) {
		View.panels.get('batchEqAttachForm').setFieldValue('eq_attach.vn_id',vnId);
	}else {
		View.panels.get('eqAttachForm').setFieldValue('eq_attach.vn_id',vnId);
	}
	View.panels.get('vnselectPanel').closeWindow();
}

