View.createController('abPmSlaCreateReq_Controller', {
    afterInitialDataFetch: function(){
        $("request_helpdesk_sla_request.activity_type").disabled = true;
        $("request_helpdesk_sla_request.prob_type").disabled = true;
    }
});


/**
 * Save SLA problem parameters<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#saveSLAProblemParameters(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveSLAProblemParameters</a><br />
 * Loads tab with priority levels<br />
 * Called by 'Next' button
 * @param {String} form current form
 */
function onReqParaNext(){
	var tabs = View.getControlsByType(parent, 'tabs')[0];
    var form = View.panels.get('request');
    var problemType = form.getFieldValue('helpdesk_sla_request.prob_type');
    if (!problemType) {
        View.alert("申请类型不能为空!");
        return;
    }
    
	tabs.problemType = problemType;
    var form = View.panels.get("request");
    var ds = View.dataSources.get(form.dataSourceId);
    var recordValues = form.getFieldValues();
    var record = toJSON(recordValues);
    
    var result = null;
    if (tabs.makeCopy) {
    
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAProblemParameters', recordValues, tabs.activity_type_copy, tabs.ordering_seq_copy);
    }
    else {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAProblemParameters', recordValues, null, null);
    }
    
    if (result.code == "executed") {
        var res = eval("(" + result.jsonExpression + ")");
        var isReturn = false;
        
        if (res.found == 1) {
            if (tabs.adding) {
                View.confirm(getMessage("confirmDelete"), function(button){
                    if (button == 'yes') {
                        tabs.existing = true;
                    }
                    else {
                        isReturn = true;
                    }
                });
            }
            else {
                if (res.conflict == 1) {
                    if (tabs.makeCopy) {
                        tabs.makeCopy = false;
                        View.showMessage('message', getMessage('copyConflict'), null, null, function(){
                            tabs.selectTab('select', null);
                        });
                        return;
                    }
                    else {
                        View.showMessage('message', getMessage('editConflict'), null, null, function(){
                            tabs.selectTab('select', null);
                        });
                        return;
                    }
                }
                else {
                    tabs.existing = true;
                }
            }
        }
        else 
            if (res.found == 0) {
                tabs.existing = false;
            }
        isReturn = insertDefaultPriority(res.activity_type, res.ordering_seq);
        
        if (isReturn) {
            return;
        }
        
        tabs.ordering_seq = res.ordering_seq;
        tabs.activity_type = res.activity_type;
        
        var rest = new Ab.view.Restriction();
        rest.addClause("helpdesk_sla_request.activity_type", res.activity_type, "=");
        rest.addClause("helpdesk_sla_request.ordering_seq", res.ordering_seq, "=");
        var responseTab = tabs.findTab('response');
        responseTab.loadView();
        tabs.selectTab('response', rest);
    }
    else {
        Workflow.handleError(result);
    }
}

function insertDefaultPriority(activityType, orderingSeq){
    var isFailed = false;
    var prioritiesJSON = "[{priority : 1,label:'Default'}]";
    var record = new Object();
    record['helpdesk_sla_request.activity_type'] = activityType;
    record['helpdesk_sla_request.ordering_seq'] = orderingSeq;
    
    var parameters = {
        fields: toJSON(record),
        priorities: prioritiesJSON
    };
    var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAPriorityLevels', record, prioritiesJSON);
    if (result.code != 'executed') {
        isFailed = true;
        Workflow.handleError(result);
    }
    else {
        setDefaultResponseParameter(activityType, orderingSeq);
    }
    return isFailed;
}

function setDefaultResponseParameter(activityType, orderingSeq){
    var record = new Ab.data.Record();
    record.isNew = false;
    record.setValue("helpdesk_sla_response.activity_type", activityType);
    record.setValue("helpdesk_sla_response.ordering_seq", orderingSeq);
    record.setValue("helpdesk_sla_response.priority", 1);
    
    
    record.oldValues = new Object();
    record.oldValues["helpdesk_sla_response.activity_type"] = activityType;
    record.oldValues["helpdesk_sla_response.ordering_seq"] = orderingSeq;
    record.oldValues["helpdesk_sla_response.priority"] = 1;
    View.dataSources.get("ds_ab-pm-sla-req-para_sla_res").saveRecord(record);
}

function selectActivityType(){
    View.selectValue({
        formId: 'request',
        title: "",
        fieldNames: ['helpdesk_sla_request.activity_type'],
        selectTableName: 'activitytype',
        selectFieldNames: ['activitytype.activity_type'],
        visibleFieldNames: ['activitytype.activity_type', 'activitytype.description'],
        restriction: "activitytype.instructions = 'USMS'"
    });
}
