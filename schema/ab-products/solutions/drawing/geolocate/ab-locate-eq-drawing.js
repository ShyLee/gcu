View.createController('exLocateEquipmentDrawing', {
	
	/**
	 * Highlight all selected equipment.
	 */
	locateEquipment_equipments_onShowSelected: function() {

		// clear previous drawings
		this.locateEquipment_cadPanel.clear();

		try {
			this.locateEquipment_cadPanel.highlightAssets(null, this.locateEquipment_equipments.getSelectedRows());
		} catch (e) {
			// handle the error
			Workflow.handleError(e);
		}
	}
});




