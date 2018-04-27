var controller=View.createController('eqForm',{
	
	
	afterInitialDataFetch:function(){
		this.consolePanel.getFieldElement('eq.dp_id').disabled = true; 
	},
	consolePanel_onShow: function(){
		this.setCsi();
		//var restriction = this.consolePanel.getFieldRestriction();
		
		var dv_id=this.consolePanel.getFieldValue('eq.option1');
		var dp_id=this.consolePanel.getFieldValue('eq.option2');
		var em_name=this.consolePanel.getFieldValue('eq.em_name');
		var eq_id=this.consolePanel.getFieldValue('eq.eq_id');
		var eq_name=this.consolePanel.getFieldValue('eq.eq_name');
		var bl_id=this.consolePanel.getFieldValue('eq.bl_id');
		var fl_id=this.consolePanel.getFieldValue('eq.fl_id');
		var rm_id=this.consolePanel.getFieldValue('eq.rm_id');
		var csi_id=this.consolePanel.getFieldValue('eq.csi_id');
		
		
		var restriction=new Ab.view.Restriction();
		if(valueExistsNotEmpty(dv_id)){
			restriction.addClause('eq.dv_id',dv_id,'=');
		}
		var array=[];
		if(valueExistsNotEmpty(dp_id)){
			array = dp_id.split(',');
			restriction.addClause('eq.dp_id',array,'in');
		}
		if(valueExistsNotEmpty(eq_id)){
			restriction.addClause('eq.eq_id','%'+eq_id+'%','like');
		}
		if(valueExistsNotEmpty(em_name)){
			restriction.addClause('eq.em_name','%'+em_name+'%','like');
		}
		if(valueExistsNotEmpty(eq_name)){
			restriction.addClause('eq.eq_name','%'+eq_name+'%','like');
		}
		if(valueExistsNotEmpty(bl_id)){
			restriction.addClause('eq.bl_id',bl_id,'=');
		}
		if(valueExistsNotEmpty(fl_id)){
			restriction.addClause('eq.fl_id',fl_id,'=');
		}
		if(valueExistsNotEmpty(rm_id)){
			restriction.addClause('eq.rm_id',rm_id,'=');
		}
		if(valueExistsNotEmpty(csi_id)){
			restriction.addClause('eq.csi_id','%'+csi_id+'%','like');
		}		
	     
	     
		this.eqTabs.show(true);
		this.gridPanel.refresh(restriction);
		this.eqTabs.show(true);
	},
	formPanel_onSave: function(){
		this.formPanel.save();
		//this.consolePanel_onShow();
	},
	consolePanel_onShowDvIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.dv_id",'','IS NULL');
		this.eqTabs.show(true);
		this.gridPanel.refresh(restriction);
	},
	consolePanel_onShowEmIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.em_id",'','IS NULL');
		this.eqTabs.show(true);
		this.gridPanel.refresh(restriction);
	},
	consolePanel_onSelectDp:function(){
    	var dvId=this.consolePanel.getFieldValue("eq.option1");
    	if(valueExistsNotEmpty(dvId)){
    		var restriction = new Ab.view.Restriction();
        	restriction.addClause("dv.dv_id" , dvId, "=");
        	this.dpPanel.refresh(restriction);
        	
        	this.dpPanel.showInWindow({
        		x:250,
        		y:200,
                width: 600,
                height: 400
            });
		}else{
			View.showMessage("请输入使用单位");
			return;
		}	
    },
    consolePanel_onClearDp:function(){
    	this.consolePanel.setFieldValue("eq.dp_id","");
    	this.consolePanel.setFieldValue("eq.option2","");
    },
    dpPanel_onSure:function(){
    	var rows = this.dpPanel.getSelectedRows();
		if(rows.length == 0){
			View.showMessage("请选择部门科室！");
			return;
		}
		var temp=this.consolePanel.getFieldValue("eq.dp_id");
		var option2=this.consolePanel.getFieldValue("eq.option2");
		
		for(var i = 0; i < rows.length; i++){
			//dv_name的集合
			var dpName=rows[i]['dp.dp_name'];
			if(temp==""){
				temp=dpName;
			}else{
				temp=temp+","+dpName;
			}
		   //dp_id的集合
		   var dpId=rows[i]['dp.dp_id'];
			if(option2==""){
				option2=dpId;
			}else{
				option2=option2+","+dpId;
			}
		}
		this.consolePanel.setFieldValue("eq.option2",option2);
		this.consolePanel.setFieldValue("eq.dp_id",temp);
		this.dpPanel.closeWindow();
    },
	//批量修改
	editMore:function(){
    	var selectedRecord = this.gridPanel.getSelectedRecords();
		if(selectedRecord.length>0){
			
			this.editPanel.refresh();
			this.editPanel.setFieldValue("eq.em_id","");
			this.editPanel.setFieldValue("eq.em_name","");
			this.editPanel.setFieldValue("eq.add_comment","");
			this.editPanel.setTitle("批量修改");
			this.editPanel.showInWindow({
				 x:300,
				 y:200,
				 width: 530,
				 height: 450
			});
				
		}else{
			View.showMessage("请选择需要编辑的设备");
			return;
		}
    },
    editMoreInfo:function(){
    	if(this.editPanel.canSave()){
    		var record1 = {};
    		var selectedPrimaryKeys = this.gridPanel.getSelectedRecords();
    		for (var i = 0; i < selectedPrimaryKeys.length; i++) {
    			var row = selectedPrimaryKeys[i];   
    			record1['eq.id'+i] = row.values["eq.eq_id"];
    		}
    		
    		var record2 = {};
    		var a=0;
    		if(document.getElementById("btn1").checked){
    			record2['eq.em_id']=this.editPanel.getFieldValue('eq.em_id');
        		record2['eq.em_name']=this.editPanel.getFieldValue('eq.em_name');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn2").checked){
    			record2['eq.is_up']=this.editPanel.getFieldValue('eq.is_up');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn3").checked){
    			record2['eq.is_label']=this.editPanel.getFieldValue('eq.is_label');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn4").checked){
    			record2['eq.eq_warehouse']=this.editPanel.getFieldValue('eq.eq_warehouse');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn5").checked){
    			record2['eq.type_use']=this.editPanel.getFieldValue('eq.type_use'); 
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn6").checked){
    			record2['eq.add_comment']=this.editPanel.getFieldValue('eq.add_comment');
    		}else{
    			a=a+1;
    		}	
    		if(a==6){
    			View.showMessage("请勾选需要修改的字段");
    			return;
    		}
    		
    		try {
                Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-EditEqMoreValue', record1, record2);
                View.showMessage("操作成功");
    		} 
            catch (e) {
                Workflow.handleError(e);
                View.alert('工作流失败');
            }
            var eqId =  record1['eq.id0'];
            var res=new Ab.view.Restriction();
			res.addClause('eq.eq_id',eqId,'=');
            this.formPanel.refresh(res);
			this.eqAttachPanel.show(true);
			this.editPanel.closeWindow();
			
    	} 	
    },
	show:function(){
		var panel = this.gridPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
		var addEqId = panel.rows[selectedIndex]["eq.add_eq_id"];
		
		var res1= new Ab.view.Restriction();
		res1.addClause("eq.eq_id",eq_id,"=");
		this.formPanel.show();
		this.formPanel.refresh(res1,false);
		
		var res2= new Ab.view.Restriction();
		if(valueExistsNotEmpty(addEqId)){
			res2.addClause("eq_attach.add_eq_id",addEqId,"=");
		}    	
    	res2.addClause("eq_attach.eq_id",eq_id,"=");
    	this.eqAttachPanel.show();
    	this.editAttachPanel.show(false);
        this.eqAttachPanel.refresh(res2);
        this.eqAttachPanel.setTitle("设备【"+eq_id+"】的附件列表");
	},
	formPanel_onDelete:function(){		
		var eq_id=this.formPanel.getFieldValue("eq.eq_id");
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
		    if(button=="yes"){
		    	try {
			        result = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-updateSchStatus','1',eq_id);
			    }
			    catch (e) {
			        Workflow.handleError(e);
			        View.showMessage("操作失败，请联系管理员");
			    }
			    if(result.code == 'executed'){
			    	controller.formPanel.show(false);
			    	controller.editAttachPanel.show(false);
			    	controller.eqAttachPanel.show(false);
			    	View.showMessage("删除成功");
			    }
		    	
		    }else{
		     
		    }
		});
		
	},
	editAttachPanel_onDelete:function(){		
		var eq_attach_id=this.editAttachPanel.getFieldValue("eq_attach.eq_attach_id");
    	var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
		    if(button=="yes"){
		    	try {
			        result = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-updateSchStatus','2',eq_attach_id);
			    }
			    catch (e) {
			        Workflow.handleError(e);
			        View.showMessage("操作失败，请联系管理员");
			    }
			    if(result.code == 'executed'){
			    	controller.formPanel.show(false);
			    	controller.editAttachPanel.show(false);
			    	controller.eqAttachPanel.show(false);
			    	View.showMessage("删除成功");
			    }		    	
		    }else{
		     
		    }
		});
	},
	showAttach:function(){
		var panel = this.attachPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_attach_id = panel.rows[selectedIndex]["eq_attach.eq_attach_id"];
		
		var res1= new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_attach_id",eq_attach_id,"=");
		this.formPanel.show(false);
		this.eqAttachPanel.show(false);
		this.editAttachPanel.show();
		this.editAttachPanel.refresh(res1,false);
		this.editAttachPanel.setTitle("设备附件详细信息");
	},
	editAttachPanel_onSave: function(){
		this.editAttachPanel.save();
		//this.consolePanel_onShow();
		//this.attachPanel.refresh();
	},
	refreshPanel:function(){
		this.attachPanel.refresh();
	},
	attachPanel_onEdit:function(){
		var selectedRecord = this.attachPanel.getSelectedRecords();
		if(selectedRecord.length>0){
			
			this.editAttachMorePanel.refresh();
			this.editAttachMorePanel.setFieldValue("eq_attach.em_id","");
			this.editAttachMorePanel.setFieldValue("eq_attach.em_name","");
			this.editAttachMorePanel.setFieldValue("eq_attach.add_comment","");
			this.editAttachMorePanel.setTitle("批量修改");
			this.editAttachMorePanel.showInWindow({
				 x:300,
				 y:200,
				 width: 530,
				 height: 450
			});
				
		}else{
			View.showMessage("请选择需要编辑的设备附件");
			return;
		}
	},
	editAttachMorePanel_onBtnSave:function(){
		if(this.editAttachMorePanel.canSave()){
    		var record1 = {};
    		var selectedPrimaryKeys = this.attachPanel.getSelectedRecords();
    		for (var i = 0; i < selectedPrimaryKeys.length; i++) {
    			var row = selectedPrimaryKeys[i];   
    			record1['eq_attach.id'+i] = row.values["eq_attach.eq_attach_id"];
    		}
    		
    		var record2 = {};
    		var a=0;
    		if(document.getElementById("btn7").checked){
    			record2['eq_attach.em_id']=this.editAttachMorePanel.getFieldValue('eq_attach.em_id');
        		record2['eq_attach.em_name']=this.editAttachMorePanel.getFieldValue('eq_attachq.em_name');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn8").checked){
    			record2['eq_attach.is_up']=this.editAttachMorePanel.getFieldValue('eq_attach.is_up');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn9").checked){
    			record2['eq_attach.is_label']=this.editAttachMorePanel.getFieldValue('eq_attach.is_label');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn10").checked){
    			record2['eq_attach.eq_warehouse']=this.editAttachMorePanel.getFieldValue('eq_attach.eq_warehouse');
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn11").checked){
    			record2['eq_attach.type_use']=this.editAttachMorePanel.getFieldValue('eq_attach.type_use'); 	
    		}else{
    			a=a+1;
    		}
    		if(document.getElementById("btn12").checked){
    			record2['eq_attach.add_comment']=this.editAttachMorePanel.getFieldValue('eq_attach.add_comment');
    		}else{
    			a=a+1;
    		}	
    		if(a==6){
    			View.showMessage("请勾选需要修改的字段");
    			return;
    		}    		
    		
    		try {
                Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-EditEqAttachMoreValue', record1, record2);
                View.showMessage("操作成功");
    		} 
            catch (e) {
                Workflow.handleError(e);
                View.alert('工作流失败');
            }
			
			//this.gridPanel.refresh();
			//this.attachPanel.refresh();
			this.formPanel.show(false);
			this.eqAttachPanel.show(false);
			this.editAttachPanel.show(false);
			this.editAttachMorePanel.closeWindow();
			
    	}
	},
	consolePanel_onShowRmIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.rm_id",'','IS NULL');
		this.eqTabs.show(true);
		this.gridPanel.refresh(restriction);
	},
	setCsi: function(){
		var csi= this.consolePanel.getFieldValue("eq.csi_id");	
		for(var i=0;i<5;i++){
			csi = csi.replace(/(00)\b/gi,"");
		}
		this.consolePanel.setFieldValue("eq.csi_id",csi);
	}
})