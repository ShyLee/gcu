var showBlsOnSiteDwgController = View.createController('showBlsOnSiteDwgCtrl',{
	dwg_name: null,

	// selected grid rows
	selectedRows: null,

	abDpVal_bottomPanel_onRefresh: function(){
		if(this.dwg_name != null){
			this.abDpVal_bottomPanel.addParameter('drawingName', "='" + this.dwg_name + "'");
			this.abDpVal_bottomPanel.refresh();
		}
	},
	

	/**
	 * Highlight all selected equipment.
	 */
	abDpVal_bottomPanel_onShowSelected: function() {

		this.abDpVal_cadPanel.clear();
		
		try {
			// highlight it
			this.abDpVal_cadPanel.highlightAssets(null, this.abDpVal_bottomPanel.getSelectedRows());
		} catch (e) {
			// handle the error
			Workflow.handleError(e);
		}
	}
})

function loadBlsAndDrawing(row){
		showBlsOnSiteDwgController.dwg_name = row['bl.dwgname'];
		showBlsOnSiteDwgController.abDpVal_bottomPanel_onRefresh();
}