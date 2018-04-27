/**
 * controller definition
 */
var abApJkPlansController = View.createController('abApJkPlansCtrl',{
	/**
	 * generate paginated report for user selection
	 */
	panel_abApJkPlans_console_onPaginatedReport: function(){
		var site_id = this.panel_abApJkPlans_console.getFieldValue("bl.site_id");
		var bl_id = this.panel_abApJkPlans_console.getFieldValue("bl.bl_id");
		var parameters = null;
		var consoleRestrictionForJk = "";

		if (valueExistsNotEmpty(site_id)) {
			consoleRestrictionForJk += "(jk.bl_id IN (SELECT DISTINCT bl_id FROM bl WHERE site_id='" + site_id + "'))";
		}
		
		if (valueExistsNotEmpty(bl_id)) {
			consoleRestrictionForJk += (consoleRestrictionForJk != "" ? " AND " : "");
			consoleRestrictionForJk += "jk.bl_id = '" + bl_id + "'";
			
		}
		
		if (consoleRestrictionForJk != "") {
			consoleRestrictionForJk = "(" + consoleRestrictionForJk + ")";
			parameters = {
				'consoleRestrictionForJk': consoleRestrictionForJk
			};
		}
		
		View.openPaginatedReportDialog('ab-ap-jk-plans-pgrp.axvw', null, parameters);
	}
});

/**
 * clicking on floor event
 * @param {Object} node Node selected
 */
function abApJkPlans_showJacks(node){
	
	var currentNode = View.panels.get('panel_abApJkPlans_blTree').lastNodeClicked;
	
	//get selected building and floor
    var selectedBl = currentNode.parent.data['bl.bl_id'];
    var selectedFl = currentNode.data['bl.state_id'];
	var selectedFlName  = currentNode.data['bl.name'];
	var selectedDwgName = currentNode.data['bl.dwgname'];

	//draw the floor map
    var drawingPanel = View.panels.get('panel_abApJkPlans_drawing');
    var dcl = new Ab.drawing.DwgCtrlLoc(selectedBl, selectedFl, null, selectedDwgName);
    drawingPanel.addDrawing(dcl);
	var dwgTitle = getMessage("title_dwg");
	dwgTitle += " " + selectedBl + " " + selectedFl + " " + selectedFlName;
	drawingPanel.appendInstruction("ondwgload", "", dwgTitle);
	drawingPanel.setIdealLabelTextSize(12);
	drawingPanel.setShrinkLabelTextToFit(false);
	
	// show jacks list panel
    var restriction = new Ab.view.Restriction();
    restriction.addClause('jk.bl_id', selectedBl);
    restriction.addClause('jk.fl_id', selectedFl);
	View.panels.get('panel_abApJkPlans_jkDetails').refresh(restriction);
}
