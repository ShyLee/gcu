var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
	record: null,
	
	ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
//        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        var red=this.record;
    	var addEqId = red.getValue('activity_log.add_eq_id');
    	var restriction=new Ab.view.Restriction();
		    restriction.addClause("add_eq.add_eq_id",addEqId,"=");
		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.refresh(restriction);
		
//        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
       // this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
    
        if(valueExistsNotEmpty(addEqId)){
        	var addEqRes=new Ab.view.Restriction();
            addEqRes.addClause('eq.add_eq_id',addEqId,'=');
            this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(addEqRes);
        }
        var role=View.user.role;
    	
    	if(role=='UNV EQ ADMIN'){
    		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.actions.get('donePrint').show(true);
    	}else{
    		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.actions.get('donePrint').show(false);
    	}
        
    	
    	var role=View.user.role;
    	
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
    },
   
    checkAddEqNumById: function(addEqId){
    	var eqDs=View.dataSources.get('ascBjUsmsAddEqCheckNumDs');
    	var res=new Ab.view.Restriction();
    	res.addClause('eq.add_eq_id',addEqId,'=');
    	var eqRecords=eqDs.getRecords(res);
    	return eqRecords.length;
    	
    },
    //打印报增单
    printAddEq: function(){
    	var addEqId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
    	var status=this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue('activity_log.status');
    	//var addEqId="BZ20130004";
    	var csiId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.csi_id');
    	var csiDes="";	
    	if(status!="APPROVED"){
    		View.alert('此报增单未审批完成，无法打印');
    		return;
    	}
    	if(valueExistsNotEmpty(csiId)){
    		var csi=csiId.substring(0,2);
    		var csiDs=View.dataSources.get('csiDs');
    		var csiValue=csi+'000000';
    		var csiRes=new Ab.view.Restriction();
    		csiRes.addClause('csi.csi_id',csiValue,'=');
    		var csiRecord=csiDs.getRecord(csiRes);
    		csiDes=csiRecord.getValue('csi.description');
    		
    	}
    	var eqRecrdLength=this.checkAddEqNumById(addEqId);
    	
    	if(!valueExistsNotEmpty(addEqId)){
    		View.alert('此报增单不存在,无法打印');
    		return;
    	}else{
    		window.open("/archibus/schema/ab-products/htmlreport/addeqprintreport.jsp?xmlName=gcuBaoZeng&aE="+addEqId+"&DaLei="+csiDes);
//    		if(eqRecrdLength>1){
//    			//View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmBaoZengSingle",parameters:{'aE':addEqId,'DaLei':csiDes}, closeButton:false});
//    			window.open("/archibus/schema/ab-products/htmlreport/addeqprintreport.jsp?xmlName=wjmBaoZengSingle&aE="+addEqId+"&DaLei="+csiDes);
//    			
//    		}else{
//    			//View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmBaoZengMulti",parameters:{'aE':addEqId,'DaLei':csiDes}, closeButton:false});
//    			window.open("/archibus/schema/ab-products/htmlreport/addeqprintreport.jsp?xmlName=wjmBaoZengMulti&aE="+addEqId+"&DaLei="+csiDes);
//    		}
    		
    	}
    },
    //打印报增单附表
    printAddEqAtt: function(){
    	var addEqId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
    	var csiId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.csi_id');
    	var csiDes="";
    	if(valueExistsNotEmpty(csiId)){
    		var csi=csiId.substring(0,2);
    		var csiDs=View.dataSources.get('csiDs');
    		var csiValue=csi+'000000';
    		var csiRes=new Ab.view.Restriction();
    		csiRes.addClause('csi.csi_id',csiValue,'=');
    		var csiRecord=csiDs.getRecord(csiRes);
    		csiDes=csiRecord.getValue('csi.description');
    		
    	}
    	var checkNum=this.checkAddEqNumById(addEqId);
    	if(checkNum=0){
    		View.alert('此报增单没有附单');
    	}
    	if(!valueExistsNotEmpty(addEqId)){
    		View.alert('此报增单不存在,无法打印');
    		return;
    	}else{
    		//View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmBaoZengAtta",parameters:{'aE':addEqId,'DaLei':csiDes}, closeButton:false});
    		window.open("/archibus/schema/ab-products/htmlreport/addeqprintreport.jsp?xmlName=wjmBaoZengAtta&aE="+addEqId+"&DaLei="+csiDes);
    	}
    },
    savePanelAndRefresh: function(){
    	View.confirm('确定要保存吗?',function(button){
    		if(button=='yes'){
    			View.panels.get('ascBjEqDetailPanel').save();
    			View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid').refresh();
    		}
    	});
    	
    },
   
	selectBasicFormByRequestType: function(){
		//this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
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
            }
            else {
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
	
    //显示报增设备分配列表
    onShowEqAddListWindow: function(){
    	var restriction=new Ab.view.Restriction();
    	var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
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
	  
    	var budgetItemId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.budget_item_id');
            restriction.addClause("eq_budget_item.budget_item_id",budgetItemId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.showInWindow({
        	x:150,
        	y:200,
            width: 800,
            height: 300
        });
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
        }
       if (result.code == 'executed') {
    	   
			var restriction=new Ab.view.Restriction();
    		var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue("add_eq.add_eq_id");
    		restriction.addClause("add_eq.add_eq_id",addEqId,"=");
    			
    		var addEqRecord = this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.getRecord(restriction);
    		addEqRecord.setValue("add_eq.status",'3');
    		this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.saveRecord(addEqRecord);

		} 
        this.closeApproveWindow(true);
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
        
    },
    //打印过以后通过传递报增单，将此报增单的状态转换为：已打印
    changePrintStatus: function(){
    	var role=View.user.role;
    	var addEqId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
    	var status=this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue('activity_log.status');
    	if(status!="APPROVED"){
    		View.alert('此报增单未打印,无法更改');
    		return;
    	}
    	//只有当用户角色为"资产处管理员"时，才改变报增单的状态
    	if(role=='UNV EQ ADMIN'){
    		//更改报增单的打印状态
    		var addEqDs=View.dataSources.get('ascBjUsmsAddEqDs');
    		var addEqRes=new Ab.view.Restriction();
    		addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
    		var addEqRecord=addEqDs.getRecord(addEqRes);
    		addEqRecord.setValue('add_eq.isDonePrint','1');
    		addEqDs.saveRecord(addEqRecord);
    		
    		//更改activity_log表中的打印状态  		
    		var activityDs=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabFormDS');
    		var res=new Ab.view.Restriction();
    		res.addClause('activity_log.add_eq_id',addEqId,'=');
    		res.addClause('activity_log.status','APPROVED','=');
    		res.addClause('activity_log.activity_type','SD -设备报增','=');
    		var activityRecord=activityDs.getRecord(res);
    		activityRecord.setValue('activity_log.isDonePrint','1');
    		activityDs.saveRecord(activityRecord);
    		View.alert('此报增单打印状态更改成功!');
    	}
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


//显示设备的详细信息
function showEqDetail(value){
	 var detailGrid=View.panels.get('ascBjEqDetailPanel');
	 detailGrid.show(true);
	 detailGrid.showInWindow({
	     width: 800,
	     height: 400
	 });
	 detailGrid.refresh(value.restriction);
}
