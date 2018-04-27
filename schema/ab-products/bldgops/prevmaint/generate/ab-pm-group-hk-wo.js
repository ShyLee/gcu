var hkTabController = View.createController('hktabcontrol', {
    afterInitialDataFetch: function(){
    
    },
    rm_wo_group_onGenerate: function(){
        this.generateWorkOrders();
    },
    rm_wo_group_onBack: function(){
        View.parentTab.parentPanel.selectTab(View.parentTab.parentPanel.tabs[0].name, null, false, false, true);
    },
    generateWorkOrders: function(){
        var groupBy = null;
        var useGroupCode = false;
        var generateNewDate = false;
        var radio_grouping = document.getElementsByName("grouping");
        var check_grouping = document.getElementsByName("other");
        
        for (var i = 0; i < radio_grouping.length; i++) 
            if (radio_grouping[i].checked == 1) {
                groupBy = radio_grouping[i].value;
                break;
            }
        
        generateNewDate = check_grouping[0].checked;
        useGroupCode = check_grouping[1].checked;
        
        gen_date_from = View.parentTab.parentPanel.tabs[0].getContentFrame().View.panels.get('date_range_filter').getFieldValue('pms.date_next_alt_todo');
        gen_date_to = View.parentTab.parentPanel.tabs[0].getContentFrame().View.panels.get('date_range_filter').getFieldValue('pms.date_first_todo');
        var tabs = View.parentTab.parentPanel;
        var pmsidRestriction = getSchedDatesRestriction(tabs.siteId, tabs.blId, tabs.flId, tabs.pmGroup, tabs.trId, 'HK');
		//This method serve as a WFR to call a long running job generating work orders and work requests
        //for specified date range and other options,file='PreventiveMaintenanceCommonHandler.java'
        try {
            var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-PmWorkOrderGenerator', gen_date_from,
			                                                                              		 gen_date_to,
																								 "HSPM",
																								 groupBy,
																								 generateNewDate,
																								 useGroupCode,
																								 pmsidRestriction
          																						  );

            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
				var url = 'ab-pm-wo-gen-job.axvw?jobId=' + this.jobId;
				window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
});
