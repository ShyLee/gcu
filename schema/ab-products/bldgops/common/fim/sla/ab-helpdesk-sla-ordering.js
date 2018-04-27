/**
 * @fileoverview Javascript functions for <a href='../../../../viewdoc/overview-summary.html#ab-helpdesk-sla-create-ordering.axvw' target='main'>ab-helpdesk-sla-create-ordering.axvw</a>
 */
var lastMoveDir;

/**
 * Move workflow rule (change ordering sequence)<br />
 * Called by clicking an arrow in the selection list<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#moveRule(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpdesk-moveRule</a>
 * After execution of the workflow rule, calls <a href='#checkForConflicts' target='main'>checkForConflicts</a>
 * @param {String} rowPKs Primary keys from selected rows
 * @param {String} dir 'up' or 'down' direction to move rule in
 */
View.createController('abHelpDeskSlaOrdering_Controller', {
    sla_report_afterRefresh: function(){
        this.sla_report.removeSorting();
    }
});


function moveRule(pkRecord, dir, force){
    if (force == undefined) 
        force = false;
    lastMoveDir = dir;
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-moveRule', pkRecord, dir, force);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
			Workflow.handleError(e);
		}
		return;
	}
    
    if (result.code == 'executed') {
        var report = View.panels.get('sla_report');
        report.refresh();
        
        var res = eval('(' + result.jsonExpression + ')');
        
        if (res.conflict) {
            View.confirm(getMessage("moveSLA"), function(button){
                if (button != 'yes') {
                    if (lastMoveDir == "up") {
                        //undo last move
                        moveRule(createRowRecord(res.ordering_seq, res.activity_type), "down", true);
                    }
                    else {
                        moveRule(createRowRecord(res.ordering_seq, res.activity_type), "up", true);
                    }
                }
            });
        }
    }
    else {
        Workflow.handleError(result);
    }
}

function onchangeActivityType(fieldName, newValue, oldValue){
    if (newValue != oldValue) {
        View.panels.get('sla_console').setFieldValue(fieldName, newValue);
    }
    setRestriction();
}

/**
 * Creates custom restriction besed on the selected activity_id and step_type
 * and applies it to report tabs.
 */
function setRestriction(){
    // get reference to the console form
    var console = View.panels.get('sla_console');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    // refresh the grid report tab page
    var report = View.panels.get('sla_report');
    report.refresh(restriction);
}

function moveUp(){
    var grid = View.panels.get('sla_report');
    var selecteRow = grid.rows[grid.selectedRowIndex];
    var activityType = selecteRow['helpdesk_sla_request.activity_type'];
    var ordringSeq = selecteRow['helpdesk_sla_request.ordering_seq'];
    
    //var xml = createRowXml(ordringSeq, activityType);
	var record = createRowRecord(ordringSeq, activityType);
    moveRule(record, "up");
}

function moveDown(){
    var grid = View.panels.get('sla_report');
    var selecteRow = grid.rows[grid.selectedRowIndex];
    var activityType = selecteRow['helpdesk_sla_request.activity_type'];
    var ordringSeq = selecteRow['helpdesk_sla_request.ordering_seq'];
	
    //var xml = createRowXml(ordringSeq, activityType);
	var record = createRowRecord(ordringSeq, activityType);
    moveRule(record, "down");
}

function createRowXml(ordering_seq, activity_type){
    return "<record helpdesk_sla_request.ordering_seq=\"" + ordering_seq +
    "\" helpdesk_sla_request.activity_type=\"" +
    activity_type +
    "\">" +
    "<keys helpdesk_sla_request.ordering_seq=\"" +
    ordering_seq +
    "\" helpdesk_sla_request.activity_type=\"" +
    activity_type +
    "\"/></record>";
}

function createRowRecord(ordering_seq, activity_type){
    var record = {};
	record['helpdesk_sla_request.activity_type'] = activity_type;
	record['helpdesk_sla_request.ordering_seq'] = ordering_seq;
	return record;
}