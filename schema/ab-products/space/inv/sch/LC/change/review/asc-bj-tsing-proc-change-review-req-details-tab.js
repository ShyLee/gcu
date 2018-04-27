var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    restriction: null,
	role:null,
	em:null,
    afterInitialDataFetch: function(){
		this.onStart(); 
   },
   onStart:function(){	  
		this.role=View.user.role;
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.restriction=this.tabs.approveTabrestriction;
		this.selectBasicFormByEmployType();
	},
	selectBasicFormByEmployType: function(){
		
		this.activity_log_ds_form.show(true);
	    this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.show(true);
        this.activity_log_ds_form.refresh(this.restriction);       
        this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.restriction);
        
        var activitylogId=this.activity_log_ds_form.getFieldValue('activity_log.activity_log_id');
        this.ts_rm_tu_change_log_grid.show(true);        
        var restrictionRm = new Ab.view.Restriction();
        restrictionRm.addClause('ts_rm_tu_change_log.activity_log_id', activitylogId, '=');
        this.ts_rm_tu_change_log_grid.refresh(restrictionRm);
//        this.showHistoryPanel('activity_log');
//        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
//        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh();
    },
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh: function(){
    	var role=View.user.role;
    	var form=this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm;
    	if(role=='UNV ASSET HEAD' || role=='UNV ASSET ADMIN' ){
    		form.enableField("activity_log.area", true);
    		form.enableField("activity_log.count_rm", true);
    	  }else{
    		  form.enableField("activity_log.area", false);
    		  form.enableField("activity_log.count_rm", false);
    	  }
    	
    	if(role=='UNV DV ADMIN' || role=='UNV DIVISION HEAD' ){
    		form.showField('activity_log.area',false);
    		form.showField('activity_log.count_rm',false);
    		
    	  }else{
    		  form.showField('activity_log.area',true);
      		  form.showField('activity_log.count_rm',true);
    	  }
    },
   
    
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
        var historyPanel = this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', this.restriction.findClause('activity_log.activity_log_id').value);
            
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
        View.getWindow('parent').View.setTitle("查看申请");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
	
    onShowApproveWindow: function(){
    	this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 800,
            height: 300})
    },
    /*
     * 确认审批通过按钮
     */
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        //var comments=document.getElementById('comments').value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        try {
        	
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest',record, comments);
            /*
             * 判断当前角色如果是 国资处副处 就要更新sc_zzfcard的信息
             */
            this.closeApproveWindow(false);
            if (result.code == 'executed') {
            	var father=this;
        			View.showMessage('message', "审批通过！", '', '',
        				    function() {
        				father.onBack();
        				    }
        				); 
    		 }
         
        } 
        catch (e) {
            Workflow.handleError(e);
        }
       
       
      
    },
    saveSC_ZZFCARD:function(){
    	var panel =null;
    	if(this.tabs.em=='1'){
    		panel= View.panels.get("ascBjUsmsProcCheckinApproveReqApproveTeacherForm");
    	}
    	if(this.tabs.em=='0'){
    		panel= View.panels.get("ascBjUsmsProcCheckinApproveReqApproveNTeacherForm");
    	}
    	
    	var card=panel.getFieldValue('sc_zzfcard.card_id');
    	/*
    	 * 根据restriction获得当前的记录
    	 */
    	var res=new Ab.view.Restriction();
		res.addClause('sc_zzfcard.card_id',card,'=');
		var record=this.sc_zzfcardDataSource.getRecord(res);
		record.setValue('sc_zzfcard.card_status','1');
		var dataSource = View.dataSources.get('sc_zzfcardDataSource');
		dataSource.saveRecord(record);
		
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
        this.closeApproveWindow(true);
        if (result.code == 'executed' && View.user.role=='UNV DIVISION HEAD') {
    		//如果是二级院系领导审批完后则，给个提示
        	var father=this;
    			View.showMessage('message', "驳回成功！", '', '',
    				    function() {
    				father.onBack();
    				    }
    				); 
		 }
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage("请在 [审批转发给] 输入框后选择要转发的目标用户。"))
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
        if (result.code == 'executed' && View.user.role=='UNV DIVISION HEAD') {
    		//如果是二级院系领导审批完后则，给个提示
        	var father=this;
    			View.showMessage('message', "审批转发成功！", '', '',
    				    function() {
    				father.onBack();
    				    }
    				); 
		 }
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.em;
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
    initBLName:function(){
    		var blDs=View.dataSources.get('blDataSource');
    		var RoomInfoPanel=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm');
	    	var blId=RoomInfoPanel.getFieldValue('sc_zzfcard.bl_id');
    		var res=new Ab.view.Restriction();
	    	res.addClause('bl.bl_id',blId,'=');
	    	var record=blDs.getRecord(res);
	    	var name=record.getValue('bl.name');
	    	RoomInfoPanel.setFieldValue('blName',name);
    }
    ,
    updateRoomInfo:function(currRate,areaLease,totalMoney){
    	var panel =null;
    	if(this.tabs.em=='1'){
    		panel= View.panels.get("ascBjUsmsProcCheckinApproveReqApproveTeacherForm");
    	}
    	if(this.tabs.em=='0'){
    		panel= View.panels.get("ascBjUsmsProcCheckinApproveReqApproveNTeacherForm");
    	}
    	
    	var card=panel.getFieldValue('sc_zzfcard.card_id');
    	var roomInfoPanel=View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm");
    	var blId = roomInfoPanel.getFieldValue('sc_zzfcard.bl_id');
        var flId = roomInfoPanel.getFieldValue('sc_zzfcard.fl_id');
        var rmId = roomInfoPanel.getFieldValue('sc_zzfcard.rm_id');
        var areaLease = areaLease;
        var currRentRate=currRate;
    	var despositPayoff=totalMoney;
    	/*
    	 * 根据restriction获得当前的记录
    	 */
    	var res=new Ab.view.Restriction();
		res.addClause('sc_zzfcard.card_id',card,'=');
		var record=this.sc_zzfcardDataSource.getRecord(res);
		record.setValue('sc_zzfcard.bl_id',blId);
		record.setValue('sc_zzfcard.fl_id',flId);
		record.setValue('sc_zzfcard.rm_id',rmId);
		record.setValue('sc_zzfcard.area_lease',areaLease);
		record.setValue('sc_zzfcard.curr_rent_rate',currRentRate);
		record.setValue('sc_zzfcard.desposit_payoff',despositPayoff);
		var dataSource = View.dataSources.get('sc_zzfcardDataSource');
		dataSource.saveRecord(record);
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


function roomChange(fieldName,newValue,oldValue){
	var blDs=View.dataSources.get('blDataSource');
	var RoomInfoPanel=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm');
	var areaLease = RoomInfoPanel.getFieldValue('sc_zzfcard.area_lease');
    var currRate=RoomInfoPanel.getFieldValue('sc_zzfcard.curr_rent_rate');
	if(fieldName=='sc_zzfcard.bl_id'){
	    	var res=new Ab.view.Restriction();
	    	res.addClause('bl.bl_id',newValue,'=');
	    	var record=blDs.getRecord(res);
	    	var name=record.getValue('bl.name');
	    	RoomInfoPanel.setFieldValue('blName',name);
	 }
//	if(fieldName!='sc_zzfcard.area_lease'){
//		return;
//	}
	
    if(fieldName=='sc_zzfcard.area_lease'){
    	areaLease=newValue;
    }
    if(currRate=='' || areaLease==''){
   	 return 
    }
	v1=parseFloat(areaLease);
   	v2=parseFloat(currRate);
    var total=v1.mul(v2);
    RoomInfoPanel.setFieldValue('sc_zzfcard.desposit_payoff',total);
    ascBjUsmsProcAsgnApproveReqApproveTabController.updateRoomInfo(currRate,areaLease,total);
}

function rentChange(fieldName,newValue,oldValue){
	if(fieldName!='sc_zzfcard.curr_rent_rate'){
		return;
	}
	var RoomInfoPanel=View.panels.get('ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm');
	var areaLease = RoomInfoPanel.getFieldValue('sc_zzfcard.area_lease');
    var currRate=RoomInfoPanel.getFieldValue('sc_zzfcard.curr_rent_rate');
    if(fieldName=='sc_zzfcard.curr_rent_rate'){
    	currRate=newValue;
    }
    if(currRate=='' || areaLease==''){
   	 return 
    }
   	 v1=parseFloat(areaLease);
   	 v2=parseFloat(currRate);
    var total=v1.mul(v2);
    RoomInfoPanel.setFieldValue('sc_zzfcard.desposit_payoff',total);
    ascBjUsmsProcAsgnApproveReqApproveTabController.updateRoomInfo(currRate,areaLease,total);
}


