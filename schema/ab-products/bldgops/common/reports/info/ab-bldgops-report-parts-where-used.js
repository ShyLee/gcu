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
    View.panels.get('abBldgopsReportPartsWhereUsedPartGrid').refresh();
	View.alert(getMessage('calculateAlertMessage'));
}

/**
 * Call workflow calcEqPtUsePerYr for calculate part equipment use per year
 */
function calcEqPtUsePerYr(){
    try {
        Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalcEqPtUsePerYr');
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    View.panels.get('abBldgopsReportPartsWhereUsedPartGrid').refresh();
	View.alert(getMessage('calculateAlertMessage'));
}
