var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
	record: null,
	step:"",
	listBl:[],//用来储存已经选择的建筑物编码,保存建筑物到sc_activity_log_rm表
	blIds:"",//用来储存已经选择的建筑物编码,对再次选择建筑物进行过滤
	activityType:"",
	approveType:"",
    afterInitialDataFetch: function(){
		this.onStart();
    },

	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.step=this.tabs.step;
		this.activityType=this.tabs.activityType;
       
		this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
		this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        
        if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_MANAGE || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZZC_MANAGE){
        	this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.actions.get('save').show(true);
        }else{
        	this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.actions.get('save').show(false);
        }
        Ext.get("ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_activity_log.location").dom.readOnly=true;
	},
	
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh: function(){
    	var form=this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm;
    	if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_ADMIN){
    		form.showField('activity_log.notes',true);
    		form.showField('activity_log.location',true);
    	}else if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_MANAGE || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_MANAGE){
    		form.showField('activity_log.notes',true);
    		form.enableField('activity_log.notes',false);
    		form.showField('activity_log.notes2',true);
    	}else{
    		form.showField('activity_log.notes',false);
    		form.showField('activity_log.notes2',false);
    		form.showField('activity_log.location',false);
    	}
    },
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
		var panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm2");
        }
		
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
        View.getWindow('parent').View.setTitle("房屋分配-审批");
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
    onShowApproveWindow: function(){
    	if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_MANAGE || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZZC_MANAGE){
    		var isSvae=this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.actions.get('save').enabled;
    		if(isSvae){
    			View.showMessage("请先点击【保存】按钮,保存信息之后，再点击【审批】按钮，进行审批!");
    			return ;
    		}
    	}
        $("comments").value = '';
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
        	x: 200,
            y: 100,
        	width: 700,
            height: 300
        });
        this.approveType="approve";
    },
    onShowRejectWindow:function(){
    	$("comments").value = '';
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
        	x: 200,
            y: 100,
        	width: 700,
            height: 300
        });
        this.approveType="reject";
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
    	var record = this.getRecord();
    	var comments = $("comments").value;
    	if(this.approveType=="reject"){
            if(comments.length<1){
            	View.showMessage("请输入评语-驳回原因！");
            	return ;
            }
            try {
                var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-backtoRequest', record, comments);
                this.closeApproveWindow(true);
                var father=this;
                View.showMessage('message', "驳回成功！", '', '',
                		function() {
                	father.onBack();
                	}
                ); 
            } 
            catch (e) {
                Workflow.handleError(e);
                return;
            }
    	}else{
    		if(comments.length<1){
    			View.showMessage("请输入审核批语!");
    			return ;
    		}
    		try {
    			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
    			this.closeApproveWindow(false);
    			var father=this;
    			View.showMessage('message', "审批通过！", '', '',
    					function() {
    				father.onBack();
    				}
    			); 
    		} 
    		catch (e) {
    			Workflow.handleError(e);
    			return;
    		}
    	}
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
       
        if(comments.length<1){
        	View.showMessage("请输入评语-驳回原因！");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-backtoRequest', record, comments);
            this.closeApproveWindow(true);
            var father=this;
            View.showMessage('message', "驳回成功！", '', '',
            		function() {
            	father.onBack();
            }
            ); 
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        record['activity_log.activity_type'] = this.activityType;
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
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_onClearBl:function(){
    	this.blIds="";
    	this.listBl.length=0;
    	this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setFieldValue("activity_log.location","");
    },
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_onSelectBl:function(){
    	this.selectBlPanel.showInWindow({
            width: 700,
            height: 600
        });
    	if(this.blIds!=""){
    		this.selectBlPanel.addParameter('blIds',"bl_id not in ('"+this.blIds+"')");
    		this.selectBlPanel.refresh();
    	}else{
    		this.selectBlPanel.addParameter('blIds',"1=1");
    		this.selectBlPanel.refresh();
    	}
    },
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_onSave:function(){
        if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_ADMIN || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_ADMIN){
    		var notes = this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue('activity_log.notes');
    		var location = this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue('activity_log.location');
    		if(location==""){
    			View.showMessage("请选择建筑物！!"); 
    			return;
    		}
    		if(notes==""){
    			View.showMessage("请输入资产处管理员意见!"); 
    			return;
    		}
    	}else if(this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_ZCC_MANAGE || this.step==ascBjUsmsConstantControl.STEP_ROOM_REQUEST_CZ_ZCC_MANAGE){
    		var notes2 = this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue('activity_log.notes2');
    		if(notes2==""){
    			View.showMessage("请输入资产处领导意见!"); 
    			return;
    		}
    	}
    	var activityLogId=this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue("activity_log.activity_log_id");
    	var controller = this;
    	View.confirm("确定保存信息吗?", function(button){
    		if (button == 'yes') {
    			try {
    				for(var i = 0; i < controller.listBl.length; i++){
    					var record = new Ab.data.Record({
    						'sc_activity_log_rm.activity_log_id': activityLogId,
    						'sc_activity_log_rm.bl_id': controller.listBl[i]
    					}, true); 
    					controller.sc_activity_log_rm_ds.saveRecord(record);
    				}
    				controller.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.save();
    				controller.selectBlPanel.closeWindow();
    				controller.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.actions.get('save').enable(false);
    				controller.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.fields.get("activity_log.location").actions.get('selectBl').enable(false);
    				controller.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.fields.get("activity_log.location").actions.get('clearBl').enable(false);
    			}catch(e){
    				Ab.workflow.Workflow.handleError(e);
    			}
    		}
    	});
    },
    selectBlPanel_onSure:function(){
    	var rows = this.selectBlPanel.getSelectedRows();
		if(rows.length == 0){
			alert("请选择建筑物！");
			return;
		}
		var blNameList=this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue("activity_log.location");;
		for(var i = 0; i < rows.length; i++){
			var blName=rows[i]['bl.name'];
			if(blNameList==""){
				blNameList=blName;
			}else{
				blNameList=blNameList+","+blName;
			}
		   var blId=rows[i]['bl.bl_id'];
			if(this.blIds==""){
				this.blIds=blId;
			}else{
				this.blIds=this.blIds+"','"+blId;
			}
		   this.listBl.push(blId);
		}
		this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setFieldValue("activity_log.location",blNameList);
		this.selectBlPanel.closeWindow();
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
