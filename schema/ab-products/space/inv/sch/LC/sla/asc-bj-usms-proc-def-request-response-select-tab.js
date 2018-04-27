var createSlaSelectTabController = View.createController('createSlaSelectTabController', {

    afterInitialDataFetch: function(){
        var tabs = View.getControlsByType(parent, 'tabs')[0];
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.disableTab('request');
        tabs.disableTab('response');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activitytype.instructions", "USMS", "=");
        this.rule_report.refresh(restriction);
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.getControlsByType(parent, 'tabs')[0];
        if (newTabName == 'select') {
            var restriction = new Ab.view.Restriction();
            restriction.addClause("activitytype.instructions", "USMS", "=");
            this.rule_report.refresh(restriction);
            tabs.activity_type_copy = null;
            tabs.ordering_seq_copy = null;
            tabs.makeCopy = null;
            tabs.adding = null;
            tabs.existing = null;
            tabs.ordering_seq = null;
            tabs.activity_type = null;
        }
        tabs.disableTab('request');
        tabs.disableTab('response');
        tabs.enableTab(newTabName);
    }
});


/**
 * Delete selected rules after user confirmation<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#deleteRules(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-deleteRules</a><br />
 */
function deleteRule(){
    var grid = View.panels.get('rule_report');
    var records = grid.getPrimaryKeysForSelectedRows();
    if (records.length > 0) {
        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
            
                var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-deleteRules', records);
                if (result.code == 'executed') {
                    grid.refresh();
                }
                else {
                    Workflow.handleError(result);
                }
            }
        });
    }
}


/**
 * Copy SLA rule<br />
 * Set global parameter (in top.window) makeCopy true<br />
 */
function copyRule(){
    var grid = View.panels.get('rule_report');
    var records = grid.getPrimaryKeysForSelectedRows();
    if (records.length == 0) {
        View.showMessage(getMessage("noSLAtoCopy"));
    }
    else {
        if (records.length == 1) {
            var json = eval('(' + toJSON(records) + ')');
            var tabs = View.getControlsByType(parent, 'tabs')[0];
            tabs.activity_type_copy = json[0]['helpdesk_sla_request.activity_type'];
            tabs.ordering_seq_copy = json[0]['helpdesk_sla_request.ordering_seq'];
            tabs.makeCopy = true;
            
            var rest = new Ab.view.Restriction();
            rest.addClause("helpdesk_sla_request.activity_type", tabs.activity_type_copy, "=");
            rest.addClause("helpdesk_sla_request.ordering_seq", tabs.ordering_seq_copy, "=");
            tabs.selectTab("request", rest);
        }
        else {
            View.showMessage(getMessage("select1SLAtoCopy"));
        }
    }
}
