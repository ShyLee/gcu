var asgnCreateReqSelectTypeTabController = View.createController("asgnCreateSelectTypeTabController", {
    tabs: null,
    
    afterViewLoad:function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	var activityType2=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_DV;
    	var activityType1=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_RM;
    	var activityType4=ascBjUsmsConstantControl.TYPE_GYF_ROOM_REQUEST_RM;
    	var activityType3=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_CZRM;
    	var activityType5=ascBjUsmsConstantControl.TYPE_GYF_ROOM_REQUEST_CZRM;
    	var site=ascBjUsmsConstantControl.CZ_SITE_ID;
    	var emId=View.user.name;
    	var siteId=ASC_GetSiteId(emId);

    	if(siteId==site){
    		this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType3+"','"+activityType5+"')");
    		this.rejectRequestGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType3+"','"+activityType5+"')");
    	    this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType3+"','"+activityType5+"')");
        }else{
        	this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType1+"','"+activityType4+"')");
    		this.rejectRequestGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType1+"','"+activityType4+"')");
    	    this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('activityType', "activity_type in ('"+activityType2+"','"+activityType1+"','"+activityType4+"')");
        }
    },
    ascBjUsmsProcAsgnReviewReqSelectTabGrid_viewDetails_onClick: function(row){
    
        var activityLogId = row.getFieldValue('activity_log_hactivity_log.activity_log_id');
    	var restriction = "activity_log_id = " + activityLogId;
        this.tabs.restriction = restriction;
        var nextTabName = 'requestDetailsTab';
       
        this.tabs.findTab("basicInputTab").show(false);
        this.tabs.findTab(nextTabName).show(true);
        this.tabs.findTab(nextTabName).loadView();
        this.tabs.selectTab(nextTabName);
        
    },
    ascBjUsmsProcAsgnReviewReqSelectTabGrid_undo_onClick: function(row){
        var logId = row.getFieldValue('activity_log_hactivity_log.activity_log_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log_step_waiting.activity_log_id", logId, '=');
        var confirmMessage = getMessage("messageConfirmUndo").replace('{0}', logId);
        var controller = this;
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
            
                //更新activity_log表中的status值
                controller.updateActivityLogStatus(logId);
                
                //更新helpdesk_step_log表中的审批步骤记录
                controller.updateHelpdeskStepLog(logId);
                //刷新
                controller.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
                View.showMessage("撤销房屋申请单成功！");
            }
        });
        
    },
    rejectRequestGrid_edit_onClick:function(row){
    	var activityLogId = row.getRecord().getValue("activity_log_hactivity_log.activity_log_id");
    	var restriction=new Ab.view.Restriction;
    	restriction.addClause("activity_log.activity_log_id",activityLogId, "=");
		
    	this.tabs.editType="edit";
    	this.tabs.activityLogId=activityLogId;
    	
		var nextTabName = 'basicInputTab';
		this.tabs.findTab("requestDetailsTab").show(false);
	    this.tabs.findTab(nextTabName).show(true);
		this.tabs.selectTab(nextTabName,restriction,false,true,false);
    },
    ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid_select_onClick:function(row){
		var record = row.getRecord();
	    var activityTypeValue=record.getValue("activitytype.activity_type");
	    var probTypeValue=record.getValue("activitytype.prob_type");
	    
		this.tabs.probTypeValue = probTypeValue;
		this.tabs.activityTypeValue = activityTypeValue;
		this.tabs.editType="add";
		
		var nextTabName = 'basicInputTab';
	    this.tabs.findTab("requestDetailsTab").show(false);
		this.tabs.findTab(nextTabName).show(true);
	    this.tabs.findTab(nextTabName).loadView();
		this.tabs.selectTab(nextTabName,null,true,true,false);
	},
    /**
     *
     * @删除helpdesk_step_log表中的审批步骤记录
     */
    updateHelpdeskStepLog: function(logId){
        var ds = this.ascBjUsmsProcAsgnColumnReportJudgeDS;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("helpdesk_step_log.pkey_value", logId, '=');
        var stepRecords = ds.getRecords(restriction);
        try {
            for (var i = 0; i < stepRecords.length; i++) {
                var record = stepRecords[i];
                var step_log_id = record.getValue('helpdesk_step_log.step_log_id');
                var step = record.getValue('helpdesk_step_log.step');
                if ((stepRecords.length == 2 && step == '使用单位领导确认') || (stepRecords.length == 3 && step == '公房管理人员初审')) {
                    var res = new Ab.view.Restriction();
                    res.addClause("helpdesk_step_log.step_log_id", step_log_id, '=');
                    var rec = ds.getRecord(res);
                    rec.setValue('helpdesk_step_log.step_status_result', 'CANCELLED');
                    ds.saveRecord(rec);
                    continue;
                }
            }
        } 
        catch (e) {
        
            Workflow.handleError(e);
            return;
        }
    },
    
    /**
     *
     * @更新activity_log表中的status值
     */
    updateActivityLogStatus: function(logId){
    
        var ds = this.ascBjUsmsProcAsgnActivityLogJudgeDS;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log.activity_log_id", logId, '=');
        var record = ds.getRecord(restriction);
        record.setValue('activity_log.status', 'CANCELLED');
        try {
            ds.saveRecord(record);
        } 
        catch (e) {
            var message = "撤销请求失败！";
            View.showMessage('error', message, e.message, e.data);
            return;
        }
    },
    
    ascBjUsmsProcAsgnReviewReqSelectTabGrid_afterRefresh: function(){
    
        var grid = this.ascBjUsmsProcAsgnReviewReqSelectTabGrid;
        
//        for (var i = 0; i < grid.gridRows.length; i++) {
//            var ds = this.ascBjUsmsProcAsgnColumnReportJudgeDS;
//            var row = grid.gridRows.items[i];
//            var status = row.getFieldValue('activity_log_hactivity_log.status');
//            var activity_log_id = row.getFieldValue('activity_log_hactivity_log.activity_log_id');
//            var restriction = new Ab.view.Restriction();
//            restriction.addClause("helpdesk_step_log.pkey_value", activity_log_id, '=');
//            var record;
//            var step_status_result;
//            
//            var stepRecords = ds.getRecords(restriction);
//            if (stepRecords.length == 3) {
//                var restriction2 = new Ab.view.Restriction();
//                restriction2.addClause("helpdesk_step_log.pkey_value", activity_log_id, '=');
//                restriction2.addClause("helpdesk_step_log.step", "公房管理人员初审", '=');
//                record = ds.getRecords(restriction2);
//                if (record.length == 1) {
//                    step_status_result = record[0].getValue('helpdesk_step_log.step_status_result');
//                }
//                else {
//                    step_status_result = 'UnKnow status';
//                }
//            }
//            if (stepRecords.length < 3 && status == 'REQUESTED') {
//                document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row' + i + '_undo').disabled = false;
//            }
//            else 
//                if (stepRecords.length > 3) {
//                    document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row' + i + '_undo').disabled = true;
//                }
//                else 
//                    if (stepRecords.length == 3 && status == 'REQUESTED') {
//                        if (step_status_result == '') {
//                            document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row' + i + '_undo').disabled = false;
//                        }
//                        else {
//                            document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row' + i + '_undo').disabled = true;
//                        }
//                    }
//                    else {
//                        document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row' + i + '_undo').disabled = true;
//                    }
//        }
    }
});

