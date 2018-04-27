function onCalculateInventoryUsage(){
    var grid = View.panels.get('abBldgopsReportUnderstockedPtLevel1Grid');
    Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsage');
    grid.refresh();
}