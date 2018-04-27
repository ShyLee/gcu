
var ascBjUsmsProcAsgnReviewReqSelectTabController = View.createController("ascBjUsmsProcAsgnReviewReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
        this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
		this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
		this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.show(true);
		this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.refresh();
    },
    
    ascBjUsmsProcAsgnReviewReqSelectTabConsole_onFilter: function(){
    	var type=this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.getFieldValue("activity_log.activity_type");
		 var state=this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.getFieldValue("activity_log.status");
		 var dateStart=this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.getFieldValue("activity_log.date_requested.from");
		 var dateEnd=this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.getFieldValue("activity_log.date_requested.to");
		 
		 var consoleRestriction = new Ab.view.Restriction();
		 if (type != "") {
				consoleRestriction.addClause("activity_log.activity_type", type, "like");
			}
			if (state != "") {
				consoleRestriction.addClause("activity_log.status", state, "=");
			}
			if (dateStart != "") {
				consoleRestriction.addClause("activity_log.date_required", dateStart, "&gt;=");
			}
			if (dateEnd != "") {
				consoleRestriction.addClause("activity_log.date_required",  dateEnd , "&lt;=");
			}
			if(dateStart != "" &&  dateEnd != ""){
				if(dateStart>dateEnd){
					 View.showMessage("【申请起始日期】不可以大于【申请截止日期】，请重新选择！");
					 return;
				}
			}
			if(dateStart == "" && dateEnd!= ""){
				View.showMessage("请填写【申请起始日期】！");
				 return;
			}
			if(dateEnd == ""&& dateStart!= ""){
				View.showMessage("请填写【申请截止日期】！");
				 return;
			}
			this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh(consoleRestriction);
			if (this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.rows.length == 0) {
		    	 View.showMessage("没有符合条件的用房协议信息！");
				 this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.show(false);
				 return;
			}
		this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.show(true);	
			
    },
    
    ascBjUsmsProcAsgnReviewReqSelectTabConsole_onRefresh: function(){
    	this.ascBjUsmsProcAsgnReviewReqSelectTabConsole.refresh();
    },
    
    selectNextTab: function(restriction){    	 
   	 this.tabs = View.getControlsByType(parent, 'tabs')[0];	 
        this.tabs.restriction = restriction;
        var nextTabName = 'requestDetailsTab';    		
        this.tabs.findTab(nextTabName);
     	 this.tabs.selectTab(nextTabName);
   },
    
    //查看
   ascBjUsmsProcAsgnReviewReqSelectTabGrid_show_onClick: function(row){
        var record = row.getRecord();        
     	var activityTypeValue="SERVICE DESK - 房屋用途变更";
   	    var probTypeValue="房屋用途变更";
   		this. tabs.probTypeValue = probTypeValue;
   		this. tabs.requestType = activityTypeValue;
     	var activityLogId=record.getValue("activity_log.activity_log_id");   	  
        this.selectNextTab(activityLogId);
    
     	
    }
});

//function selectNextTab(activityLogId){
//
//    var restriction = "activity_log_id = " + activityLogId;
//    
//    //set the globle request type to tabs object
//    var tabs = ascBjUsmsProcAsgnReviewReqSelectTabController.tabs;
//    tabs.restriction = restriction;
//    
//    //select next tab and reload the tab view
//    var nextTabName = 'requestDetailsTab';
//    var nextTab = tabs.findTab(nextTabName);
//    nextTab.loadView();
//    tabs.selectTab(nextTabName);
//}

function selectNextTab(){
	//当点击select按钮时候  获得当前选择的
    var grid = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
//    var isEm = record.getValue('sc_zzfcard.is_em');
//    var card = record.getValue('sc_zzfcard.card_id');
    var requestType = record.getValue('activity_log.prob_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    
//    View.getWindow('parent').View.setTitle(requestType + "-" + stepType.substring(stepType.length - 2));
    
    View.getWindow('parent').View.setTitle("房屋用途变更详情");
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    //set the globle request type to tabs object
    //var tabs = ascBjUsmsProcAsgnApproveReqSelectTabController.tabs;
    var tabs = View.getControl('', 'reviewRequestTabs');
    /*下一个页面要根据是否是本校老师显示不同 panel*/
  //  tabs.em=isEm;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabGrid').restriction;
    var consolePanel = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabConsole');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    //select next tab and reload the tab view
    var nextTabName = 'requestDetailsTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}

