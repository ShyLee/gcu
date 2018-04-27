var blId = "";
var flId = "";

View.createController('abSpVwDpByFl_Control', {

    afterInitialDataFetch: function(){
        if (this.abSpVwDpByFl_flGrid.rows.length > 0) {
            this.abSpVwDpByFl_flGrid.selectedRowIndex = 0;
            refreshReport();
        }
    }
});

function refreshReport(){
    var floorGrid = View.panels.get("abSpVwDpByFl_flGrid");
    var selectedRowIndex = floorGrid.selectedRowIndex;
    if (selectedRowIndex != -1) {
        blId = floorGrid.rows[selectedRowIndex]['fl.bl_id'];
        flId = floorGrid.rows[selectedRowIndex]['fl.fl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("gp.bl_id", blId, "=");
        restrictionID.addClause("gp.fl_id", flId, "=");
        var summaryPanel = View.panels.get("abSpVwDpByFl_dpCrossTable");
        summaryPanel.refresh(restrictionID);
        summaryPanel.setTitle(getMessage("summaryGridTitle") + " " + blId + "-" + flId);
    }
}

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abSpVwDpByFl_mixRmGpGrid');
    detailGrid.addParameter('blId', blId);
    detailGrid.addParameter('flId', flId);
     //change to fix KB3028722
	var buDvDp = getValueFromRestrction(obj.restriction,'gp.bu_dv_dp');
    if (buDvDp) {
        if (buDvDp == 'N/A') {
            detailGrid.addParameter('buDvDp', "bu_dv_dp IS NULL AND ");
        }
        else {
            detailGrid.addParameter('buDvDp', "bu_dv_dp ='" + buDvDp + "' AND ");
        }
    }
    else {
        detailGrid.addParameter('buDvDp', "");
    }
    detailGrid.refresh();
    detailGrid.show(true);
    detailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
