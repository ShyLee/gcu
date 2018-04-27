var abCbRptHlFlController = View.createController('abCbRptHlFlCtrl',{
	blId: null,
	filterController: null,
	
	selectedFloors: new Array(),
	
    afterViewLoad: function(){
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "proj";
		
		// set message parameter for abCbRptHlFl_gridFloor panel
		this.abCbRptHlFl_gridFloor.addParameter('noDrawing',getMessage('noDrawing'));

		this.abCbRptHlFl_gridFloor.addEventListener('onMultipleSelectionChange', 'abCbRptHlFl_showRep');

		// highlight in the displayed drawing, a room selected from a grid
		var controller = this;
		this.abCbRptHlFl_gridRep.addEventListener('onMultipleSelectionChange', function(row) {
			var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
			var items = [row.row];
			// red if the row is selected or if there is another selected item for this item's room
			var color = ((row.row.isSelected() || existsSelectedItemInSameRoom(controller.abCbRptHlFl_gridRep, row.row)) ? 0xFF0000 : null);
			setDwgHighlightMultipleDrawings(dwgPanel, items, color);
	    });
    },
    
    abCbRptHlFl_gridFloor_afterRefresh: function(){
		this.abCbRptHlFl_gridFloor.enableSelectAll(false);
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHlFl_gridFloor.addParameter('consoleRestriction', restriction);
        this.abCbRptHlFl_gridFloor.refresh();
        this.showPanels(false, false);
	},

	/**
	 * show/ hide panels
	 * @param {boolean} showDrawing
	 * @param {boolean} showRep
	 */
    showPanels: function(showDrawing, showRep){
		if (valueExists(FABridge.abDrawing)) {
        	showDwgToolbar(showDrawing, this.abCbRptHlFl_drawingPanel);
        	if (!showDrawing)
        		this.abCbRptHlFl_drawingPanel.clear();
       	}
        this.abCbRptHlFl_gridRep.show(showRep);
    }
});

/**
 *  show rooms and drawing for selected floor
 * @param {Object} row Selected floor
 */
function abCbRptHlFl_showRep(row){
	var controller = View.controllers.get('abCbRptHlFlCtrl');
    var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
    var gridRep = View.panels.get('abCbRptHlFl_gridRep');
    
    controller.selectedFloors = View.panels.get('abCbRptHlFl_gridFloor').getSelectedRecords();
	
	if(controller.selectedFloors.length == 0){
	    controller.showPanels(false, false);
	    return;
	}
	
	var floorsRestriction = "";
    for (var i = 0; i < controller.selectedFloors.length; i++) {
        var blId = controller.selectedFloors[i].getValue('rm.bl_id');
        var flId = controller.selectedFloors[i].getValue('rm.fl_id');

        floorsRestriction += (i == 0) ? "(" : " OR ";
        floorsRestriction += " (activity_log.bl_id = '" + blId + "' AND activity_log.fl_id = '" + flId + "')";
        
        if(i == (controller.selectedFloors.length - 1))
        	floorsRestriction += ")";
    }
    
	controller.showPanels(true, true);
	
    controller.abCbRptHlFl_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlFl_gridRep.refresh(floorsRestriction);

	var dwgName = row.row.getFieldValue("rm.raw_dwgname");
    if (valueExistsNotEmpty(dwgName)){
        dwgPanel.addDrawing(row, null);
    	var recsToHighlight = gridRep.gridRows.items;
    	setDwgHighlightMultipleDrawings.defer(200, this, [dwgPanel, recsToHighlight, null, controller.selectedFloors]);
    }

}

/**
 * highlight selected items on dwg
 * @param {Object} panel - Drawing panel
 * @param {Object} items - selected items
 * @param {Object} color The color of the highlight
 */
function setDwgHighlightMultipleDrawings(dwgPanel, items, color){
	dwgPanel.setSelectColor((color ? color : 0xFFFF00));	// yellow by default

	for (var j = 0; j < abCbRptHlFlController.selectedFloors.length; j++) {
		var floor = abCbRptHlFlController.selectedFloors[j];
		var dwgName = floor.getValue("rm.raw_dwgname");
		if (valueExistsNotEmpty(dwgName)) {
			var opts = new DwgOpts();
			opts.rawDwgName = dwgName;
		    for (var i = 0; i < items.length; i++) {
		    	var vals = items[i].record;
		    	
		    	if(vals['activity_log.bl_id'] == floor.getValue("rm.bl_id")
		    			&& vals['activity_log.fl_id'] == floor.getValue("rm.fl_id")){
			    	var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];
			    	opts.appendRec(id);
		    	}
		    }
			
			if(j == 0){
				showDwgToolbar(true,dwgPanel);
			}
			
		    dwgPanel.highlightAssets(opts);
		}
	}

	items = null;
}