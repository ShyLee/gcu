var abCbRptHazBlMapDrilldownController = View.createController('abCbRptHazBlMapDrilldown', {
	blId: null,
	dwgnames: [],
	floors: [],
	pagRepRestriction: null,
	printableRestriction: null,
	defaultPagRepRestriction: "(EXISTS(SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND rm.dwgname IS NOT NULL)"
			+ " OR activity_log.dwgname IS NOT NULL)"
			+ " AND activity_log.project_id IS NOT NULL"
			+ " AND EXISTS(SELECT 1 FROM project WHERE project.project_id = activity_log.project_id AND project.project_type='ASSESSMENT - HAZMAT' AND project.is_template = 0)",
	
	openerController: View.getOpenerView().controllers.get('abCbRptHazBlMapCtrl'),
	
	afterViewLoad: function() {
		this.abCbRptHazBlMapDrilldown_itemsDetails.addEventListener('onMultipleSelectionChange', function(row) {
			var dwgPanel = View.panels.get('abCbRptHazBlMapDrilldown_cadPanel');
			var controller = View.controllers.get("abCbRptHazBlMapDrilldown");
			
			// setSelectColor() generates error if the drawing is not loaded
			if(!dwgPanel.dwgLoaded && row.row.isSelected()){
				dwgPanel.highlightAssets(null, row);
			}
			
			// red if the row is selected or if there is another selected item for this item's room
			if(row.row.isSelected()) {
				dwgPanel.setSelectColor(0xFF0000);	// red
				if (!dwgPanel.highlightAssets(null, row))
					row.row.unselect();
			} else if(!existsSelectedItemInSameRoom(controller.abCbRptHazBlMapDrilldown_itemsDetails, row.row)){
				dwgPanel.highlightAssets(null, row);
			}
			
		});
	},
	
	afterInitialDataFetch: function() {
		var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";
		this.printableRestriction = null;
		
		var buildingPrintableRestriction=[];
		this.blId = this.openerController.blId;
		if (this.blId){
			restriction += " AND activity_log.bl_id = '" + this.blId + "'";
			buildingPrintableRestriction.push({'title': getMessage("buildings"), 'value': this.blId});
			this.printableRestriction = this.openerController.filterController.printableRestriction.concat(buildingPrintableRestriction);
		}else{
			this.printableRestriction = this.openerController.filterController.printableRestriction;
		}
		
		
		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;
		
		this.abCbRptHazBlMapDrilldown_floorsGrid.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
	},
	
	abCbRptHazBlMapDrilldown_floorsGrid_onShowFloors: function(row, action) {
		var record = row.getRecord();
		var bl_id = record.getValue('activity_log.bl_id');
		var fl_id = record.getValue('activity_log.fl_id');
		var dwgname = record.getValue('rm.dwgname');
		var drawing = new Ab.drawing.DwgCtrlLoc(bl_id, fl_id, null, dwgname);
		this.abCbRptHazBlMapDrilldown_cadPanel.addDrawing(drawing, null);
		
    	this.dwgnames.push(dwgname);
    	this.floors.push(fl_id);
    	
    	var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";
		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;
		var dwgRestr = " AND (CASE WHEN rm.dwgname IS NULL THEN activity_log.dwgname ELSE rm.dwgname END) IN ('" + this.dwgnames.join("','") + "')";
		restriction += dwgRestr;
		this.pagRepRestriction += dwgRestr.replace(/rm\.dwgname/g,
									"(SELECT rm.dwgname FROM rm"
									+ " WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id"
									+ ")");
		
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
	},
	
	abCbRptHazBlMapDrilldown_floorsGrid_onClearDrawings: function() {		
		var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";

		this.blId = this.openerController.blId;
		if (this.blId)
			restriction += " AND activity_log.bl_id = '" + this.blId + "'";

		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;;

		
		this.abCbRptHazBlMapDrilldown_floorsGrid.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.setAllRowsSelected(false);
		
		this.dwgnames.length = 0;
		this.floors.length = 0;
		
		this.abCbRptHazBlMapDrilldown_cadPanel.clear();
		this.abCbRptHazBlMapDrilldown_legendGrid.clear();
	},
	
	abCbRptHazBlMapDrilldown_itemsDetails_afterRefresh: function(){
		this.abCbRptHazBlMapDrilldown_itemsDetails.enableSelectAll(false);
	}
	
});

function onExportDocxReport(panel, pagRepName){
	var controller = View.controllers.get("abCbRptHazBlMapDrilldown");
	var floorsRestriction = [];
	
	if(controller.floors.length > 0){
		floorsRestriction.push({'title': getMessage("floors"), 'value': controller.floors.join(", ")});
	}
	
	var parameters = {
	        'consoleRestriction': controller.pagRepRestriction,
	        'printRestriction': true, 
	        'printableRestriction': controller.printableRestriction.concat(floorsRestriction)
	};
	
	View.openPaginatedReportDialog('ab-cb-assess-list-pgrpt.axvw', null, parameters);
}