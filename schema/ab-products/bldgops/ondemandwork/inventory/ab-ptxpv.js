/**
 * Call workflow CalculateInventoryUsage for calculate part inventory
 */
function calculateInventoryUsage(){
    try {
        Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsage');
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    View.panels.get('detailsPanel').refresh();
	View.alert(getMessage('calculateAlertMessage'));
}
