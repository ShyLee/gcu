var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	
	ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
        var red=this.record;
    	var addEqId = red.getValue('activity_log.add_eq_id');
    	var restriction=new Ab.view.Restriction();
		    restriction.addClause("add_eq.add_eq_id",addEqId,"=");
		this.BaoZengDetialformPanel.refresh(restriction);
		
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
    
        if(valueExistsNotEmpty(addEqId)){
        	var addEqRes=new Ab.view.Restriction();
            addEqRes.addClause('eq.add_eq_id',addEqId,'=');
            this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(addEqRes);
        }
        
        var role=View.user.role;
        var panels=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabApproveForm');
    	if(role=='UNV EQ ADMIN'){
           	this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('ToDvAssign').show(true);	
	        panels.actions.get('reject').show(true);
        }else if(role=='UNV EQ HEAD'){
        	this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('ToDvAssign').show(false);
        	panels.actions.get('reject').show(true);
        }else{
        	panels.actions.get('reject').show(false);
           	this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('ToDvAssign').show(false);
        }
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
        
    },
    ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid_onReturnDvAssign: function(){
    	//将报增单号取出
    	var addEqId=this.BaoZengDetialformPanel.getFieldValue('add_eq.add_eq_id');
    	if(!valueExistsNotEmpty(addEqId)){
    		View.alert('不存在的报增单号,操作终止! ');
    		return;
    	}
    	var gridRows=this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.gridRows;
    	if(gridRows.length<=0){
    		View.alert('此报增单下无设备,请先为二级单位分配设备');
    		return;
    	}
    	//先将报增单的状态置为‘等待分配’
    	var addEqDs=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS');
    	var addEqRes=new Ab.view.Restriction();
    	addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
    	var addEqRecord=addEqDs.getRecord(addEqRes);
    	addEqRecord.setValue('add_eq.status','2');
    	View.confirm('确定要此单位重新分配这些设备?',function(button){
    		if(button=='yes'){
    			try{
    	    		addEqDs.saveRecord(addEqRecord);
    	    		//更新此报增单下的设备
    	    		var eqDs=View.dataSources.get('ascEqAssignStatusChangeDs');
    	    		var eqRes=new Ab.view.Restriction();
    	    		eqRes.addClause('eq.add_eq_id',addEqId,'=');
    	    		var eqRecords=eqDs.getRecords(eqRes);
    	    		for(var i=0;i<eqRecords.length;i++){
    	    			var eqRecord=eqRecords[i];
    	    			eqRecord.isNew=false;
    	    			eqRecord.setValue('eq.is_assign','0');
    	    			eqDs.saveRecord(eqRecord);
    	    		}
    	    		
    	    		View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid').refresh();
    	    		View.panels.get('BaoZengDetialformPanel').refresh();
    	    		View.alert('分配驳回操作完成，二级单位此时可以再次进行分配操作!');
    	    	}catch(e){
    	    		View.alert('更新报增单失败,操作终止');
    	    		return;
    	    	}
    		}
    	});
    	
    	var b=1;
    },
    /*ascBjEqDetailPanel_afterRefresh: function(){
    	var role=View.user.role;
    	if(role!='UNV EQ ADMIN'){
    		this.ascBjEqDetailPanel.actions.get('btnSave').show(false);
    	}else{
    		this.ascBjEqDetailPanel.actions.get('btnSave').show(true);
    	}
    },*/
    
    editTotalPrice:function(){   	
    	var price=this.BaoZengDetialformPanel.getFieldValue("add_eq.price");
    	var count=this.BaoZengDetialformPanel.getFieldValue("add_eq.count");
    	this.BaoZengDetialformPanel.setFieldValue("add_eq.total_price",(parseFloat(price)*parseFloat(count)).toFixed(2));
    },
    
    savePanelAndRefresh: function(){
    	View.confirm('确定要保存吗?',function(button){
    		if(button=='yes'){
    			View.panels.get('ascBjEqDetailPanel').save();
    			View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid').refresh();
    		}
    	});
    	
    },
    BaoZengDetialformPanel_afterRefresh: function(){
    	this.BaoZengDetialformPanel.actions.get('btnSave').setTitle('保存修改')
    	var role=View.user.role;
        /*if(role!='UNV EQ ADMIN'){
        	this.BaoZengDetialformPanel.actions.get('btnSave').show(false);
        }else{
        	this.BaoZengDetialformPanel.actions.get('btnSave').show(true);
        	
        }*/
        if(role=='UNV EQ HEAD'){
        	this.BaoZengDetialformPanel.showField("add_eq.eq_warehouse",true);
        	this.BaoZengDetialformPanel.showField("add_eq.is_up",true);
        	this.BaoZengDetialformPanel.showField("add_eq.is_label",true);
        	this.BaoZengDetialformPanel.showField("add_eq.type_use",true);
        	this.BaoZengDetialformPanel.showField("add_eq.units",true);
        	this.BaoZengDetialformPanel.showField("add_eq.ctry_name",true);
        	this.BaoZengDetialformPanel.showField("add_eq.danju_id",true);
        }else{
        	this.BaoZengDetialformPanel.showField("add_eq.eq_warehouse",false);
        	this.BaoZengDetialformPanel.showField("add_eq.is_up",false);
        	this.BaoZengDetialformPanel.showField("add_eq.is_label",false);
        	
        }
    },
	selectBasicFormByRequestType: function(){
        this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord(); 
    },

    
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
		var panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm1");
        var historyPanel = this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', panel.getFieldValue('activity_log.activity_log_id'));
            
            var apps = eval('(' + result.jsonExpression + ')');
            if (apps.length == 0) {
                historyPanel.show(false);
            }else {
                historyPanel.show(true);
                var restriction = new Ab.view.Restriction();
                if (apps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, app; app = apps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', app.step_log_id, "=", "OR");
                    }
                }
                historyPanel.refresh(restriction);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
    },
	
    onBack: function(){
        View.getWindow('parent').View.setTitle("设备报增-审批");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
	//审批信息
    onShowApproveWindow: function(){
    	//判断此报增单是否是已完成审核
    	var status=this.BaoZengDetialformPanel.getFieldValue('add_eq.status');
    	if(status=='1'){
    		View.confirm('设备尚未分配,请先交由二级单位分配!如果此时审批只能做驳回操作！',function(button){
    			if(button=='yes'){
    				 $("comments").value = '';
    	    	        var role=View.user.role;
    	    	        var res=ascBjUsmsProcAsgnApproveReqApproveTabController.tabs.approveTabrestriction;
    	    	        View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabApproveForm').refresh(res);
    	    	        View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabApproveForm').showInWindow({
    	    	            width: 800,
    	    	            height: 300
    	    	        });
    	    	        var panels=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabApproveForm');
    	    	        panels.actions.get('approve').enable(false);
    			}
    		});
    		
    	}
    	if(status=='2'){
    		View.alert('二级单位尚未完成分配');
    		return;
    	}
    	if(status=='4'){
    		View.alert('此报增单已审批完成');
    		return;
    	}
    	if(status=='3'){
    		 $("comments").value = '';
                //后勤处设备科科长审批前需要对设备进行分库
                var role=View.user.role;
                if(role=='UNV EQ HEAD'){
                	var warehouse=this.BaoZengDetialformPanel.getFieldValue("add_eq.eq_warehouse");
                	var is_up=this.BaoZengDetialformPanel.getFieldValue("add_eq.is_up");
                	if(warehouse==""){
                		View.showMessage("请给设备选择一个【分库类型】！");
                		return;
                	}
                	if(is_up==""){
                		View.showMessage("请给设备选择是否【报送】！");
                		return;
                	}
                }
    	        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
    	        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
    	        	x:150,
    	        	y:200,
    	            width: 800,
    	            height: 300
    	        });
    	        var panels=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabApproveForm');
    	        panels.actions.get('approve').enable(true);
    	}
       
    },
    //显示报增设备分配列表
    onShowEqAddListWindow: function(){
    	var restriction=new Ab.view.Restriction();
    	var addEqId = this.BaoZengDetialformPanel.getFieldValue('add_eq.add_eq_id');
            restriction.addClause("eq.add_eq_id",addEqId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.showInWindow({
            width: 800,
            height: 300
        });
    },
    //显示预算项详细信息
    onShowBudgetDetailsWindow: function(){
    	var restriction=new Ab.view.Restriction();
	  
    	var budgetItemId = this.BaoZengDetialformPanel.getFieldValue('add_eq.budget_item_id');
            restriction.addClause("eq_budget_item.budget_item_id",budgetItemId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.showInWindow({
        	x:150,
        	y:200,
            width: 800,
            height: 300
        });
    },
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
//        var code="executed";
        //如果审批成功，同时要更新add_eq表的数据 标记此暴增单已经完成报增
        if (result.code == 'executed') {
//        if (code == 'executed') {
			var activityID = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord().getValue('activity_log.activity_log_id');
			var actRes=new Ab.view.Restriction();
			actRes.addClause('activity_log.activity_log_id',activityID,'=');
			var status=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabFormDS').getRecord(actRes).getValue('activity_log.status');
//			var status="APPROVED";
			if(status == 'APPROVED'){
				var restriction=new Ab.view.Restriction();
    			var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue("activity_log.add_eq_id");
    			restriction.addClause("add_eq.add_eq_id",addEqId,"=");
    			
    			var addEqRecord = this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.getRecord(restriction);
    			addEqRecord.setValue("add_eq.status",'4');
    			//后勤处设备科科长审批，需要在报增表中添加 分库类型、总价（附件的价格汇总+主体设备，附件价格为0），同时更新eq设备表 的分库类型、总价(设备价格+设备附件价格)，更新eq_attach设备附件表 分库类型、附件价格为0
    			 var role=View.user.role;
                 if(role=='UNV EQ HEAD'){
                 	var warehouse=this.BaoZengDetialformPanel.getFieldValue("add_eq.eq_warehouse");
                 	var is_up=this.BaoZengDetialformPanel.getFieldValue("add_eq.is_up");
                 	var is_label=this.BaoZengDetialformPanel.getFieldValue("add_eq.is_label");
                 	
                 	var eqPrice=addEqRecord.getValue("add_eq.total_price");
                 	var attachPrice=this.getEqAttachAllPriceByAddEqId(addEqId,"");
                 	
                 	var totalPrice=parseFloat(eqPrice)+parseFloat(attachPrice);
                 	
                 	if(warehouse!=""){
                 		addEqRecord.setValue("add_eq.eq_warehouse",warehouse);
                 		addEqRecord.setValue("add_eq.is_up",is_up);
                 		addEqRecord.setValue("add_eq.is_label",is_label);
                 		addEqRecord.setValue("add_eq.total_price",totalPrice);
                 	}
                 	
                 	//eq设备表 的分库类型、总价(设备价格+设备附件价格)
                 	var account=View.dataSources.get("ascBjUsmsProcAsgnApproveReqApproveTabEqListDS");
                 	
                 	try {
                        Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-saveQuantityEqDetailInfo', warehouse,is_up,is_label,addEqId);
                        View.showMessage("操作成功");
            		} 
                    catch (e) {
                        Workflow.handleError(e);
                        View.alert('工作流失败');
                    }
                 	
                 	/*var res1=new Ab.view.Restriction();
    			    res1.addClause("eq.add_eq_id",addEqId,"=");
    			    var recordEqs=account.getRecords(res1);
    			    for(var i=0;i<recordEqs.length;i++){
    			    	var eqId=recordEqs[i].getValue("eq.eq_id");
    			    	
    			    	var eqAttachPrice=this.getEqAttachAllPriceByAddEqId(addEqId,eqId);
    			    	var eqAttachNum=this.getEqAttachNumByAddEqId(addEqId,eqId);
    			    	
    			    	var res2=new Ab.view.Restriction();
        			    res2.addClause("eq.eq_id",eqId,"=");
        			    var recordEq=account.getRecord(res2);
        			    var price=recordEq.getValue("eq.price");
        			    var allPrice=parseFloat(price)+parseFloat(eqAttachPrice);
        			    recordEq.setValue("eq.eq_warehouse",warehouse);
        			    recordEq.setValue("eq.is_up",is_up);
        			    recordEq.setValue("eq.is_label",is_label);
        			    recordEq.setValue("eq.total_price",allPrice);
        			    recordEq.setValue("eq.sch_status","1");
        			    recordEq.setValue("eq.attachments_price",eqAttachPrice);
        			    recordEq.setValue("eq.attachments_num",eqAttachNum);
        			    account.saveRecord(recordEq);
    			    }
    			    
                 	//更新eq_attach设备附件表 分库类型、附件价格为0
                 	var account1=View.dataSources.get("eq_attach_ds");
                 	var res3=new Ab.view.Restriction();
    			    res3.addClause("eq_attach.add_eq_id",addEqId,"=");
    			    var recordEqs=account1.getRecords(res3);
    			    for(var i=0;i<recordEqs.length;i++){
    			    	var eqAttachId=recordEqs[i].getValue("eq_attach.eq_attach_id");
    			    	var price=recordEqs[i].getValue("eq_attach.price");
    			    	var res4=new Ab.view.Restriction();
        			    res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
        			    var recordEqAttach=account1.getRecord(res4);
        			    recordEqAttach.setValue("eq_attach.eq_warehouse",warehouse);
        			    recordEqAttach.setValue("eq_attach.is_up",is_up);
        			    recordEqAttach.setValue("eq_attach.price",0);
        			    recordEqAttach.setValue("eq_attach.sch_status","1");
        			    recordEqAttach.setValue("eq_attach.price_old",price);
        			    account1.saveRecord(recordEqAttach);
    			    }*/
                 }
    			this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.saveRecord(addEqRecord);
			}
		} 
        this.closeApproveWindow(false);
        this.BaoZengDetialformPanel.refresh();
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh();
        View.alert('审批成功!');
    },
    getEqAttachAllPriceByAddEqId:function(addEqId,eqId){
    	var restriction="";
    	if(eqId!=""){
    		restriction="eq_attach.add_eq_id ='" + addEqId + "' and  eq_attach.eq_id='"+eqId+"'";
    	}else{
    		restriction="eq_attach.add_eq_id ='" + addEqId+ "'" ;
    	}
    	var parameters = {
    			tableName: 'eq_attach',
    			fieldNames: toJSON(['eq_attach.price']),
    			restriction: toJSON(restriction)
    	};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var allPrice=0;
		var records=result.data.records;
		if (records.length > 0) {
			for(var i=0;i<records.length;i++){
				var price = parseFloat(records[i]['eq_attach.price']);
				allPrice=allPrice+price;
			}
		}
		return allPrice;
    },
    getEqAttachNumByAddEqId:function(addEqId,eqId){
    	var restriction="";
    	if(eqId!=""){
    		restriction="eq_attach.add_eq_id ='" + addEqId + "' and  eq_attach.eq_id='"+eqId+"'";
    	}else{
    		restriction="eq_attach.add_eq_id ='" + addEqId+ "'" ;
    	}
    	var parameters = {
    			tableName: 'eq_attach',
    			fieldNames: toJSON(['eq_attach.price']),
    			restriction: toJSON(restriction)
    	};
    	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	var num=0;
    	var records=result.data.records;
    	if (records.length > 0) {
    		num=records.length;
    	}
    	return num;
    },
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
       
        if(comments.length<1){
        	View.showMessage("请输入评语-驳回原因！");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
       if (result.code == 'executed') {
    	   
			var restriction=new Ab.view.Restriction();
    		var addEqId = this.BaoZengDetialformPanel.getFieldValue("add_eq.add_eq_id");
    		restriction.addClause("add_eq.add_eq_id",addEqId,"=");
    		//把报增单的状态置为未申请
    		var addEqRecord = this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.getRecord(restriction);
    		addEqRecord.setValue("add_eq.status",'0');
    		this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.saveRecord(addEqRecord);
    		//删除该报增单下的设备，等待提交申请后重新分配设备
    		var dsEq = View.dataSources.get("ascEqAssignSubjectFundsDs");
    		var res=new Ab.view.Restriction();
    		res.addClause('eq.add_eq_id',addEqId,'=');
    		var Records=dsEq.getRecords(res);
    		if(Records.length>0){
    			for(var i=0;i<Records.length;i++){
     			   var eq_id=Records[i].values["eq.eq_id"];
     			   
     			   var record = new Ab.data.Record({
     			          'eq.eq_id': eq_id,
     			          }, false);
     			   
     			   dsEq.deleteRecord(record);
    			}
    		}   		
    		
		} 
        this.closeApproveWindow(true);
        this.onBack();
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage('请在 审批转发给 输入框后选择，要转发的目标用户。'))
            return;
        }
        
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record, comments, forwardTo);
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
        this.closeApproveWindow(false);
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
        if (isReject) {
            this.showHistoryPanel('hactivity_log');
        }
        else {
            this.showHistoryPanel('activity_log');
        }
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').enable(false);	
    },
    
    onSaveAddEqDetail: function(){
    	var saved=this.BaoZengDetialformPanel.save();
    	var AddEqId=this.BaoZengDetialformPanel.getFieldValue("add_eq.add_eq_id");
    	if(saved){
    		//根据科研经费，修改设备的科研经费值
    		var record2 = {};
    		record2['eq.units']=this.BaoZengDetialformPanel.getFieldValue("add_eq.units");
    		record2['eq.type_use']=this.BaoZengDetialformPanel.getFieldValue("add_eq.type_use"); 		
    		record2['eq.buy_type']=this.BaoZengDetialformPanel.getFieldValue("add_eq.buy_type");
    		record2['eq.csi_id']=this.BaoZengDetialformPanel.getFieldValue("add_eq.csi_id");
    		record2['eq.brand']=this.BaoZengDetialformPanel.getFieldValue("add_eq.brand");
    		record2['eq.eq_std']=this.BaoZengDetialformPanel.getFieldValue("add_eq.eq_std");
    		record2['eq.eq_type']=this.BaoZengDetialformPanel.getFieldValue("add_eq.eq_type");
    		record2['eq.vn_id']=this.BaoZengDetialformPanel.getFieldValue("add_eq.vn_id");
    		record2['eq.date_purchased']=this.BaoZengDetialformPanel.getFieldValue("add_eq.date_purchased");
    		record2['eq.date_in_service']=this.BaoZengDetialformPanel.getFieldValue("add_eq.date_in_service");
    		record2['eq.danju_id']=this.BaoZengDetialformPanel.getFieldValue("add_eq.danju_id");
    		
    		//执行修改操作
    		try {
                Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-saveQuantityEqInfo', record2,AddEqId);
                View.showMessage("操作成功");
    		} 
            catch (e) {
                Workflow.handleError(e);
                View.alert('工作流失败');
            }		
    		
    		var addEqRes=new Ab.view.Restriction();
        	addEqRes.addClause('eq.add_eq_id',AddEqId,'=');
        	this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(addEqRes);
        	//View.alert("设备列表的【使用方向】字段已根据报增单做更改!");
    		
    	}
    	this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh();
    },
    /**
     * 查看设备附件列表
     */
    ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid_onViewAttach:function(){
    	var selectIndex=this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.selectedRowIndex;
		var addEqId=this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		var eqId=this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:eqId
		});
    }
    
});

function reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var user = "";
        if (row['helpdesk_step_log.user_name']) 
            user = row['helpdesk_step_log.user_name'];
        if (row['em.name']) 
            user = row['em.name'];
        if (row['helpdesk_step_log.vn_id']) 
            user = row['helpdesk_step_log.vn_id'];
        row['helpdesk_step_log.vn_id'] = user;
        
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = '下一步>>';
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;

		if(row['afm_wf_steps.step'] == '基础'){
			if(i==0){
				row['afm_wf_steps.step'] = '申请人提交申请';
			}else{
				row['afm_wf_steps.step'] = '';
			}
		}
    }
    historyPanel.reloadGrid();
}

//生成设备并将设备分配给二级学院进行分配
function toDvAssignEqFunction(){
	var addEqPanel=View.panels.get('BaoZengDetialformPanel');
	var addEqId=addEqPanel.getFieldValue('add_eq.add_eq_id');
	var addEqStatus=addEqPanel.getFieldValue('add_eq.status');
	if(addEqStatus=='2'){
		View.alert('二级单位尚未完成分配');
		return;
	}
	if(addEqStatus=='3'){
		View.alert('已为此部门分配设备,不可重复分配!如果需要此部门重新分配设备，请点击以下【交由此单位重新分配】按钮!');
		
		return;
	}
	if(addEqStatus=='4'){
		View.alert('此部门已经分配完成，不可重复分配');
		return;
	}
	if(addEqStatus=='1'){
		View.confirm('确定要交由二级单位分配?',function(button){
			if(button=='yes'){
				try{
					 var result= Workflow.callMethod('AbAssetManagement-EquipmentHandler-equipmentAddId',addEqId);
				}catch(e){
					View.alert('报增单设备分配遇到错误,未能成功分配,请重新操作');
					return;
				}
				if(result.code='executed'){
					var addEqRes=new Ab.view.Restriction();
					addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
					View.panels.get('BaoZengDetialformPanel').refresh(addEqRes);
					//显示此报增单下已经分配的设备列表
					var EqRes=new Ab.view.Restriction();
					EqRes.addClause('eq.add_eq_id',addEqId,'=');
					View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid').refresh(EqRes);
					View.alert('设备已交由二级单位分配,请等待分配结果');
				}
			}
		});
	}
	
	
	
}

//显示设备的详细信息
function showEqDetail(value){
	 var detailGrid=View.panels.get('ascBjEqDetailPanel');
	 detailGrid.show(true);
	 detailGrid.showInWindow({
	     width: 1000,
	     height: 400
	 });
	 detailGrid.refresh(value.restriction);
}


//选择商家界面
function showSelectVnPanel(){
	var vnSelectPanel=View.panels.get('vnselectPanel');
	vnSelectPanel.showInWindow({
        width: 800,
        height: 600,
        closeButton: false
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
	View.panels.get('BaoZengDetialformPanel').setFieldValue('add_eq.vn_id',vnId);
	View.panels.get('vnselectPanel').closeWindow();
}