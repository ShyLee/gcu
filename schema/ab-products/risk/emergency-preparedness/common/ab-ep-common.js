
/**
 * Response for clicking on chart panel/cross table.
 * In general, it pops up a dialog to list all related records.
 * 
 * @param {Object} obj the obj from panel, chart panel/cross table
 */
function ABEP_showReportOnCrossTablePanel(obj, url, applyParentPanelRestriction) {
	var restriction = obj.restriction;
	
	if (valueExists(applyParentPanelRestriction) 
			&& applyParentPanelRestriction == true) {
		var consoleRestriction = View.panels.get(obj.parentPanelId).restriction;
		restriction.addClauses(consoleRestriction);
	}
	
	View.openDialog(url, restriction);
}


/**
 * show/hidden the given panel according the parameter visible.
 * 
 * @param {Object} panelId panelId
 * @param {Object} visible show panel if visible is ture, otherwise hidden it.
 */
function ABEP_showPanel(panelId, visible) {
	var panel = View.panels.get(panelId);
	panel.show(visible);
	
}



