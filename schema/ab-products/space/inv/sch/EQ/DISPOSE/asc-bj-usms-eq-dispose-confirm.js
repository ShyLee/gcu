var controller = View.createController('controller', {
	parameters: {'rtrId':0,'dvId':''},
	eqChangeGridPanel_eq_name_onClick: function(row){
		var eq_id = row.getFieldValue("eq_change.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
	},
	consoleDisposePanel_onShow: function(){
		var res = this.consoleDisposePanel.getFieldRestriction();
		this.returnDisposePanel.refresh(res);
	},
	
	returnDisposePanel_disposeEqs_onClick: function(row){
		this.returnDisposePanel_rtr_dip_name_onClick(row);
		var res = new Ab.view.Restriction();
		var rtr_dip_id = row.getFieldValue("return_dispose.rtr_dip_id");
		res.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
		this.disposeFormPanel.refresh(res);
		this.disposeFormPanel.showInWindow({
        	width: 800,
        	height: 400
        });
	},
	//打印处置单
	disposeFormPanel_onReport: function(){
		//固定报表
		var rtr_dip_id = this.disposeFormPanel.getFieldValue("return_dispose.rtr_dip_id");
		var dvId=this.disposeFormPanel.getFieldValue("return_dispose.dv_id");
		if(!valueExistsNotEmpty(rtr_dip_id)){
			View.alert('没有退还单号,不能打印 !');
			return;
		}
		if(rtr_dip_id==0){
			View.alert('退还单号没有成功传入,不能打印!');
			return;
		}
		var eqCountDs=View.dataSources.get("eqChangeCountDs");
		var eqCountRes=new Ab.view.Restriction();
		eqCountRes.addClause("eq_change.rtr_dip_id",rtr_dip_id,'=');
		
		var count=parseInt(eqCountDs.getRecord(eqCountRes).getValue("eq_change.countEq"));
		this.parameters['rtrId']=parseInt(rtr_dip_id);
		this.parameters['dvId']=dvId;
		if(count<5){
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBao",parameters:this.parameters, closeButton:false});
			
		}else{
			View.alert("此处置单下有其余设备，请打印处置单附件!");
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBaoMulti",parameters:this.parameters, closeButton:false});
		}
		
		//window.open("/archibus/schema/ab-products/htmlreport/printreport.jsp?xmlName=wjmChuZhiShenBao&rtrId="+parseInt(rtr_dip_id)+"&dvId="+dvId);
	},
	//打印处置单附件
	disposeFormPanel_onReportAttr: function(){
		var rtr_dip_id = this.disposeFormPanel.getFieldValue("return_dispose.rtr_dip_id");
		var dvId=this.disposeFormPanel.getFieldValue("return_dispose.dv_id");
		if(!valueExistsNotEmpty(rtr_dip_id)){
			View.alert('没有处置单号,不能打印 !');
			return;
		}
		if(rtr_dip_id==0){
			View.alert('处置单号没有成功传入,不能打印!');
			return;
		}
		var eqCountDs=View.dataSources.get("eqChangeCountDs");
		var eqCountRes=new Ab.view.Restriction();
		eqCountRes.addClause("eq_change.rtr_dip_id",rtr_dip_id,'=');
		
		var count=parseInt(eqCountDs.getRecord(eqCountRes).getValue("eq_change.countEq"));
		this.parameters['rtrId']=parseInt(rtr_dip_id);
		this.parameters['dvId']=dvId;
		if(count<5){
			View.alert("此处置单无附件!");
			return;
		}else{
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBaoMultiAttr",parameters:this.parameters, closeButton:false});
		}
	},
	disposeFormPanel_onSave: function(){
		this.disposeFormPanel.save();
		this.disposeFormPanel.closeWindow();
		this.returnDisposePanel.refresh();
		this.eqChangeGridPanel.refresh();
	},
	
	disposeFormPanel_onDisposeFinish: function(){
		//
		var doDispose = confirm("确认执行处置操作!")
		if(!doDispose){
			this.returnDisposePanel.refresh();
			this.eqChangeGridPanel.refresh();
			return;
		}
		
		//调用WFR处置该rtr_dip_id下的一批设备。
		var rtr_dip_id = this.disposeFormPanel.getFieldValue("return_dispose.rtr_dip_id");
//		try{
//			Workflow.callMethod('AbAssetManagement-EquipmentHandler-equipmentDispose',rtr_dip_id);
//			
//			this.disposeFormPanel.setFieldValue("return_dispose.audit_status",'4');
//			this.disposeFormPanel.save();
//			this.disposeFormPanel.closeWindow();
//			View.showMessage("处置完成。");	
//		}
//		catch(e){
//		//处置失败
//			this.disposeFormPanel.closeWindow();
//			View.showMessage("处置失败。");	
//		}
		//首先将这个处置单的状态改为4：终审通过
		var rtrDipRes=new Ab.view.Restriction();
		rtrDipRes.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
		var rtrDs=View.dataSources.get('return_dispose_DS');
		var rtrRecord=rtrDs.getRecord(rtrDipRes);
		rtrRecord.setValue('return_dispose.audit_status','4');
		rtrDs.saveRecord(rtrRecord);
		this.disposeFormPanel.closeWindow();
		this.returnDisposePanel.refresh();
		this.eqChangeGridPanel.refresh();
		this.eqChangeGridPanel.show(false);
		View.alert('处置成功');
		
	},
	
	returnDisposePanel_rtr_dip_name_onClick: function(row){
		var res = new Ab.view.Restriction();
		var rtr_dip_id = row.getFieldValue("return_dispose.rtr_dip_id");
		res.addClause('eq_change.rtr_dip_id',rtr_dip_id,'=');
		this.eqChangeGridPanel.refresh(res);
	},
	eqChangeGridPanel_dispose_onClick: function(row){
		var res = new Ab.view.Restriction();
		var eq_id = row.getFieldValue("eq_change.eq_id");
		res.addClause('eq_change.eq_id',eq_id,'=');
		
		this.eqChangeFormPanel.showInWindow({
        	width: 800,
        	height: 400
        });
		this.eqChangeFormPanel.refresh(res);
	},
	eqChangeFormPanel_onDispose: function(){
	/*
		var eq_id = this.eqChangeFormPanel.getFieldValue("eq_change.eq_id");
		var sch_status = this.eqChangeFormPanel.getFieldValue("eq_change.status");
		
		var res = new Ab.view.Restriction();
		res.addClause('eq.eq_id',eq_id,'=');
		var record = this.eq_DS.getRecord(res);
		record.setValue("eq.sch_status",sch_status);
						
		var doDispose = confirm("确认执行处置操作!")
		
		if(doDispose){
			this.eq_DS.saveRecord(record);
		}
		
		*/
		var isSave=this.eqChangeFormPanel.save();
		var isSave=true;
		//更新eq表相应的信息
		//将这条处置单下的设备价格、规格、使用方向等字段拷贝到设备表中
		if(isSave){
			var eqId=this.eqChangeFormPanel.getFieldValue('eq_change.eq_id');
			var price=this.eqChangeFormPanel.getFieldValue('eq_change.cost');
			var status=this.eqChangeFormPanel.getFieldValue('eq_change.status');
			var eqType=this.eqChangeFormPanel.getFieldValue('eq_change.eq_type');
			var eqStd=this.eqChangeFormPanel.getFieldValue('eq_change.eq_std');
			var typeUse=this.eqChangeFormPanel.getFieldValue('eq_change.type_use');
			var eqName=this.eqChangeFormPanel.getFieldValue('eq_change.eq_name');

			var eqDs=View.dataSources.get('eq_DS');
			var eqRes=new Ab.view.Restriction();
			eqRes.addClause('eq.eq_id',eqId,'=');
			var eqRecord=eqDs.getRecord(eqRes);
			eqRecord.setValue('eq.sch_status',status);
			eqRecord.setValue('eq.eq_type',eqType);
			eqRecord.setValue('eq.eq_std',eqStd);
			eqRecord.setValue('eq.eq_name',eqName);
			if(valueExistsNotEmpty(price)){
				eqRecord.setValue('eq.price',price);
			}	
			eqDs.saveRecord(eqRecord);
		}
		
		this.eqChangeFormPanel.closeWindow();
		this.eqChangeGridPanel.refresh();
	},
	EnableFiledByStatus: function(value){
		if(value=='5'||value=='6'||value=='7'||value=='C'||value=='D'){
			this.eqChangeFormPanel.setFieldValue("eq_change.cost","");
			this.eqChangeFormPanel.enableField("eq_change.cost",false);
		}else{
			this.eqChangeFormPanel.enableField("eq_change.cost",true);
		}
	}
}); 