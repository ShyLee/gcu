View.createController('loadMultiAssetsCadPanel', {
	
	/**
	 * Highlight all selected equipment.
	 */
	afterViewLoad: function() {
		this.loadMultiAssets_cadPanel.addEventListener('onclick', onClickHandler);
	}
});

function onClickHandler(pk, selected)
{
	View.showMessage("You just clicked [" + pk + "]");
}

function onFloorSelect()
{
	var grid = View.panels.get('loadMultiAssets_floorsList');
	var row = View.panels.get('loadMultiAssets_floorsList').rows[grid.selectedRowIndex];

	var dcl = new Ab.drawing.DwgCtrlLoc(row['rm.bl_id'], row['rm.fl_id'], null,  row['rm.dwgname']);
	View.getControl('', 'loadMultiAssets_cadPanel').addDrawing(dcl);
}