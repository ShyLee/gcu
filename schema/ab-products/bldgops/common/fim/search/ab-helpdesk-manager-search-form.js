
function filterWorkRequests() {
	var console = View.panels.get('searchConsolePanel');
    var restriction = console.getFieldRestriction();
    
    if(document.getElementById("escalated_response").checked){
    	restriction.addClause('activity_log.escalated_response','1','=');
    }
    if(document.getElementById('escalated_completion').checked){
    	restriction.addClause('activity_log.escalated_completion','1','=');
    }
    if(document.getElementById('not_closed').checked){
    	restriction.addClause('not_closed','1','=');
    }
    if(document.getElementById('open_steps').checked){
    	restriction.addClause('open_steps','1','=');
    }
    
    //remove existing clauses for date_requested 
    while(restriction.findClauseIndex('wr.date_requested') >= 0){
    	restriction.removeClause('wr.date_requested');
    }
    
    var dateRequestedFrom = console.getFieldValue('date_requested.from');
    if (dateRequestedFrom != '') {
        restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
    }
    var dateRequestedTo = console.getFieldValue('date_requested.to');
    if (dateRequestedTo != '') {
        restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
    }
    
    while(restriction.findClauseIndex('activity_log.date_escalation_response') >= 0){
    	restriction.removeClause('activity_log.date_escalation_response');
    }
    var dateEscalationResponseFrom = console.getFieldValue('date_escalation_response.from');
    if (dateEscalationResponseFrom != '') {
        restriction.addClause('activity_log.date_escalation_response', dateEscalationResponseFrom, '&gt;=');
    }
    var dateEscalationResponseTo = console.getFieldValue('date_escalation_response.to');
    if (dateEscalationResponseTo != '') {
        restriction.addClause('activity_log.date_escalation_response', dateEscalationResponseTo, '&lt;=');
    }
    
    while(restriction.findClauseIndex('activity_log.date_escalation_completion') >= 0){
    	restriction.removeClause('activity_log.date_escalation_completion');
    }
    var dateEscalationCompletionFrom = console.getFieldValue('date_escalation_completion.from');
    if (dateEscalationCompletionFrom != '') {
        restriction.addClause('activity_log.date_escalation_completion', dateEscalationCompletionFrom, '&gt;=');
    }
    var dateEscalationCompletionTo = console.getFieldValue('date_escalation_completion.to');
    if (dateEscalationCompletionTo != '') {
        restriction.addClause('activity_log.date_escalation_completion', dateEscalationCompletionTo, '&lt;=');
    }
    
    // apply restriction to the tabbed view and select the second page
    var tabPanel = View.getView('parent').panels.get('tabs');
    var tab =  tabPanel.findTab('results'); 
    tab.loadView();
    
    tabPanel.selectTab('results', restriction);     
}

function clearFilter() {
	var console = View.panels.get('searchConsolePanel');
	console.clear(); //clear 'normal' fields

	//clear checkboxes
	document.getElementById("escalated_response").checked = 0;
	document.getElementById('escalated_completion').checked = 0;
    document.getElementById("open_steps").checked = 0;
    document.getElementById("not_closed").checked = 0;
}