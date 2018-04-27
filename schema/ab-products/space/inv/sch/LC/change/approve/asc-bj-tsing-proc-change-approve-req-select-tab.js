var TsingApproveSelectTabController = View.createController("TsingApproveSelectTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    afterInitialDataFetch: function()
    {
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.activity_log_grid.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
        this.activity_log_hactivity_log_grid.addParameter('actyType', "SERVICE DESK - 房屋用途变更");
        if(this.tabs.selectTabConsoleRestriction)
        {
            this.activity_log_grid.refresh(this.tabs.selectTabConsoleRestriction);
            var selectTabConsoleRecord = this.tabs.selectTabConsoleRecord;
            this.activity_log_console.setFieldValue('activity_log.prob_type', selectTabConsoleRecord['activity_log.prob_type']);
            this.activity_log_console.setFieldValue('activity_log.date_requested.from', selectTabConsoleRecord['activity_log.date_requested.from']);
            this.activity_log_console.setFieldValue('activity_log.date_requested.to', selectTabConsoleRecord['activity_log.date_requested.to']);
        }
        else {
            this.activity_log_grid.refresh();
            this.activity_log_hactivity_log_grid.refresh();
        }
    },
    activity_log_console_onShow:function()
    {
      var grid = View.panels.get('activity_log_hactivity_log_grid');
      var console = View.panels.get('activity_log_console');
      var from_date = console.getFieldValue('activity_log.date_requested.from');
      var to_date = console.getFieldValue('activity_log.date_requested.to');
      var restriction = new Ab.view.Restriction();
      if (valueExistsNotEmpty(to_date)) {
          restriction.addClause('activity_log_hactivity_log.date_requested', to_date, '&lt;=');
      }
      if (valueExistsNotEmpty(from_date)) {
          restriction.addClause('activity_log_hactivity_log.date_requested', from_date, '&gt;=');
      }
      grid.refresh(restriction);
    }
});
function selectNextTab(){
	//当点击select按钮时候  获得当前选择的
    var grid = View.panels.get('activity_log_grid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
//    var isEm = record.getValue('sc_zzfcard.is_em');
//    var card = record.getValue('sc_zzfcard.card_id');
    var requestType = record.getValue('activity_log.prob_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    
    View.getWindow('parent').View.setTitle(requestType + "-" + stepType.substring(stepType.length - 2));
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    //set the globle request type to tabs object
    //var tabs = ascBjUsmsProcAsgnApproveReqSelectTabController.tabs;
    var tabs = View.getControl('', 'approveTabs');
    /*下一个页面要根据是否是本校老师显示不同 panel*/
  //  tabs.em=isEm;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('activity_log_grid').restriction;
    var consolePanel = View.panels.get('activity_log_console');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
