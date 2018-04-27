/**
 * @author Guo Jiangtao
 */
var abRiskMsdsDefLocDwgController = View.createController('abRiskMsdsDefLocDwgController', {

	/**
	 * selected floors
	 */
	selectedFloors : [],
	
	/**
	 * selected rows in msds grid
	 */
	selectedMSDSRows : [],
	
	/**
	 * selected room primary key
	 */
	selecteRoomPK: null,

	afterViewLoad : function() {
		// Specify instructions for the Drawing Control
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("ondwgload", "", getMessage('selectMsds'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("abRiskMsdsDefLocDwgGridMsds", "onclick", getMessage('selectRoom'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("abRiskMsdsDefLocDwgDrawingPanel", "onclick", getMessage('selectMsds'));

		// onclick event of the drawing panel
		this.abRiskMsdsDefLocDwgDrawingPanel.addEventListener('onclick', onRoomClicked);
		// ondwgload event of the drawing panel
		this.abRiskMsdsDefLocDwgDrawingPanel.addEventListener('ondwgload', onDwgLoaded);

		// set the all tree level as multi-selected
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(0);
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(1);
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(2);
		
    	this.abRiskMsdsDefLocDwgGridMsds.addEventListener('onMultipleSelectionChange', function(row) {
    		var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
    		var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
    		var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
    		var rows = grid.getSelectedRows();
    		abRiskMsdsDefLocDwgController.selectedMSDSRows = rows;
    		if (rows.length > 0) {
    			if(drawingPanel.dwgLoaded){
    				var msdsRes = "";
    				for(var i=0;i<rows.length;i++){
    					var msdsRow = rows[i];
    					var msds = msdsRow['msds_data.msds_id'];
    					if (msdsRow['msds_data.msds_id.raw']) {
    						msds = msdsRow['msds_data.msds_id.raw'];
    					}
    					msdsRes+="OR (msds_location.msds_id=" + msds + ")"
    				}
    				
    				msdsRes = "("+msdsRes.substring(2)+")";
    				ds.addParameter('msdsRes',msdsRes);
    				drawingPanel.applyDS('labels');
    				drawingPanel.applyDS('highlight');
    				drawingPanel.processInstruction('abRiskMsdsDefLocDwgGridMsds', 'onclick');
    				drawingPanel.setToAssign("msds_data.msds_id", '0');
    			}
    		}else{
    			if(drawingPanel.dwgLoaded){
    				ds.addParameter('msdsRes','1=1');
    				drawingPanel.applyDS('labels');
    				drawingPanel.applyDS('highlight');
    			}
    		}
    		
    		abRiskMsdsDefLocDwgController.showLocationGrid();
	    });
	},
	
	abRiskMsdsDefLocDwgGridMsds_afterRefresh: function() {
        var checkAllEl = Ext.get('abRiskMsdsDefLocDwgGridMsds_checkAll');
        if (valueExists(checkAllEl)) {
            var currentController = this;
            checkAllEl.on('click', function(event, el) {
            	currentController.selectAllMSDS(el.checked);
            });
        }
	},

	/**
	 * on click event handler of button 'Unassign'
	 */
	abRiskMsdsDefLocDwgAssignment_onUnAssign : function() {
		var ds = this.abRiskMsdsDefLocDwgMsdsLocDS;
		var assignmentRows = this.abRiskMsdsDefLocDwgAssignment.getSelectedRows();
		if (assignmentRows.length > 0) {
			// loop all selected assignment and delete them
			for ( var i = 0; i < assignmentRows.length; i++) {
				var autoNumber = assignmentRows[i]['msds_location.auto_number'];
				if (assignmentRows[i]['msds_location.auto_number.raw']) {
					autoNumber = assignmentRows[i]['msds_location.auto_number.raw'];
				}
				var rec = new Ab.data.Record();
				rec.isNew = false;
				rec.setValue("msds_location.auto_number", autoNumber);
				try {
					ds.deleteRecord(rec);
				} catch (e) {
				}
			}

			// refresh the assignment list and hide the edit form
			this.abRiskMsdsDefLocDwgAssignment.refresh(this.abRiskMsdsDefLocDwgAssignment.restriction);
			var drawingPanel = this.abRiskMsdsDefLocDwgDrawingPanel;
			drawingPanel.applyDS('labels');
			drawingPanel.applyDS('highlight');
		}
	},

	abRiskMsdsDefLocDwgTreeBl_onShowSeletedFloorPlan : function() {
		if (this.checkSelection()) {
			// get all selected floor plans
			this.selectedFloorPlans = [];
			this.selectedFloors = [];
			var flNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(2);
			for ( var i = 0; i < flNodes.length; i++) {
				var floorPlan = {};
				floorPlan['bl_id'] = flNodes[i].parent.data['bl.bl_id'];
				floorPlan['fl_id'] = flNodes[i].data["fl.fl_id"]
				floorPlan['dwgname'] = flNodes[i].data["fl.dwgname"]
				this.selectedFloorPlans.push(floorPlan);
				this.selectedFloors.push(floorPlan);
			}
			// clear the drawing panel before loading
			this.abRiskMsdsDefLocDwgDrawingPanel.clear();
			// load first drawing, the other floor plans in array
			// selectedFloorPlans will be loaded in ondwgload method to avoid
			// loading exception
			this.addFirstDrawing();
			
			//show msds locaiton list
			this.showLocationGrid();
		}
	},
	
	abRiskMsdsDefLocDwgDrawingPanel_onClearMSDS : function() {
		var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
		var rows = grid.getSelectedRows();
		if (rows.length > 0) {
			var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
			ds.addParameter('msdsRes','1=1');
			var drawingPanel = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel;
			drawingPanel.applyDS('labels');
			drawingPanel.applyDS('highlight');
			drawingPanel.processInstruction('abRiskMsdsDefLocDwgDrawingPanel', 'onclick');
			
			this.selectAllMSDS(false);
		}
	},
	
	/**
	 * unselect all msds rows
	 */
	selectAllMSDS : function(selected, disableListener) {
		var dataRows = this.abRiskMsdsDefLocDwgGridMsds.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            var selectionCheckbox = dataRow.firstChild.firstChild;
            selectionCheckbox.checked = selected;
        }
        
        // clear the Check All checkbox
        var checkAllEl = Ext.get('abRiskMsdsDefLocDwgGridMsds_checkAll');
        if (valueExists(checkAllEl)) {
            checkAllEl.dom.checked = selected;
        }
        
        if(disableListener){
        	return;
        }
        
        var listener = this.abRiskMsdsDefLocDwgGridMsds.getEventListener('onMultipleSelectionChange');
        if (listener) {
            listener();
        }
	},

	/**
	 * check the tree selection
	 */
	checkSelection : function() {
		// get all selected sites nodes
		var siteNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(0);
		for ( var i = 0; i < siteNodes.length; i++) {
			// if site node not expand, refresh it to load children
			if (siteNodes[i].children.length == 0) {
				this.abRiskMsdsDefLocDwgTreeBl.refreshNode(siteNodes[i]);
			}

			// make all building nodes in this site selected
			var blNodes = siteNodes[i].children;
			for ( var j = 0; j < blNodes.length; j++) {
				if (!blNodes[j].isSelected) {
					blNodes[j].setSelected(true);
				}
			}
		}

		// get all selected building nodes
		var blNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(1);
		for ( var i = 0; i < blNodes.length; i++) {
			// if building node not expand, refresh it to load children
			if (blNodes[i].children.length == 0) {
				this.abRiskMsdsDefLocDwgTreeBl.refreshNode(blNodes[i]);
			}

			// make all floor nodes in this building selected
			var flNodes = blNodes[i].children;
			for ( var m = 0; m < flNodes.length; m++) {
				if (!flNodes[m].isSelected) {
					flNodes[m].setSelected(true);
				}
			}
		}

		// get all floor nodes, if no one selected, give a warning
		if (this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(2).length == 0) {
			View.showMessage(getMessage('error_noselection'));
			return false;
		}
		return true;
	},

	/**
	 * add first drawing to the drawing panel
	 */
	addFirstDrawing : function() {
		if (this.selectedFloorPlans.length > 0) {
			// load the first drawing, the other drawings in the list will be
			// loaded in listener onDwgLoaded
			// which can avoid bug when loading multiple drawing at the same
			// time
			this.floorPlan = this.selectedFloorPlans[0];
			var dcl = new Ab.drawing.DwgCtrlLoc(this.floorPlan['bl_id'], this.floorPlan['fl_id'], '', this.floorPlan['dwgname']);
			this.abRiskMsdsDefLocDwgDrawingPanel.addDrawing(dcl, null);

			// remove the first drawing name and related building and floor in
			// the array,
			// so the next one became the first one in the array
			this.selectedFloorPlans.shift();
		}
	},
	
	/**
	 * show location grid
	 */
	showLocationGrid: function() {
		var restriction = " 1=1 ";
		if (this.selecteRoomPK) {
			restriction += " and (msds_location.bl_id='" + this.selecteRoomPK[0] + "'" 
				+ " AND msds_location.fl_id='" + this.selecteRoomPK[1] + "'"
			    + " AND msds_location.rm_id='" + this.selecteRoomPK[2] + "')"; 
		}else if (this.selectedFloors.length > 0) {
		    var floorRes = "";
			for(var i=0;i<this.selectedFloors.length;i++){
				var floor = this.selectedFloors[i];
				floorRes+="OR (msds_location.bl_id='" + floor['bl_id'] + "'" 
				+ " AND msds_location.fl_id='" + floor['fl_id'] + "')"; 
			}
			
			restriction += " and ("+ floorRes.substring(2)+")";
		}
		
		if(this.selectedMSDSRows.length>0){
			var msdsRes = "";
			for(var i=0;i<this.selectedMSDSRows.length;i++){
				var msdsRow = this.selectedMSDSRows[i];
				var msds = msdsRow['msds_data.msds_id'];
				if (msdsRow['msds_data.msds_id.raw']) {
					msds = msdsRow['msds_data.msds_id.raw'];
				}
				msdsRes+="OR (msds_location.msds_id=" + msds + ")"
			}
			
			restriction += " and ("+ msdsRes.substring(2)+")";
		}
		
		this.abRiskMsdsDefLocDwgAssignment.refresh(restriction)
	}
});

/**
 * on click event handler when click tree node
 */
function onTreeClick(ob) {
	var treePanel = View.panels.get('abRiskMsdsDefLocDwgTreeBl')
	var currentNode = treePanel.lastNodeClicked;
	abRiskMsdsDefLocDwgController.selectedFloorPlans = [];
	abRiskMsdsDefLocDwgController.selectedFloors = [];
	abRiskMsdsDefLocDwgController.selecteRoomPK = null;
	var floorPlan = {};
	floorPlan['bl_id'] = currentNode.parent.data['bl.bl_id'];
	floorPlan['fl_id'] = currentNode.data["fl.fl_id"]
	floorPlan['dwgname'] = currentNode.data["fl.dwgname"]
	abRiskMsdsDefLocDwgController.selectedFloorPlans.push(floorPlan);
	abRiskMsdsDefLocDwgController.selectedFloors.push(floorPlan);
	// clear the drawing panel before loading
	abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel.clear();
	abRiskMsdsDefLocDwgController.addFirstDrawing();
	abRiskMsdsDefLocDwgController.showLocationGrid();
}

/**
 * on click event handler when click row of MSDSs grid
 */
function selectMSDS(row) {
	var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
	var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
	var msds = row['msds_data.msds_id'];
	var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
	
	abRiskMsdsDefLocDwgController.selectAllMSDS(false,true);
	grid.selectRowChecked(row.index, true);
}

/**
 * on click event handler when click row of MSDS assignment grid
 */
function selectMSDSLocation(row) {
	var autoNumber = row['msds_location.auto_number'];
	if (row['msds_location.auto_number.raw']) {
		autoNumber = row['msds_location.auto_number.raw'];
	}

	var detailsPanel = View.panels.get('abRiskMsdsDefLocDwgAssignmentForm');
	detailsPanel.refresh('msds_location.auto_number=' + autoNumber);
	detailsPanel.showInWindow({
		width : 800,
		height : 400
	});
}

/**
 * on click event handler when click drawing room
 */
function onRoomClicked(pk, selected) {
	if(selected){
		var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgMsdsLocDS;
		var locRestriction = "msds_location.bl_id='" + pk[0] + "' AND " + "msds_location.fl_id='" + pk[1] + "' AND " + "msds_location.rm_id='" + pk[2] + "' ";
		var selectedRows = abRiskMsdsDefLocDwgController.selectedMSDSRows;
		if (selectedRows.length > 0) {
			// loop all selected msds and add records to msds_location
			for ( var i = 0; i < selectedRows.length; i++) {
				var msds = selectedRows[i]['msds_data.msds_id'];
				if (selectedRows[i]['msds_data.msds_id.raw']) {
					msds = selectedRows[i]['msds_data.msds_id.raw'];
				}

				if (!recordExists(pk, msds)) {
					var rec = new Ab.data.Record();
					rec.isNew = true;
					rec.setValue("msds_location.msds_id", msds);
					rec.setValue("msds_location.bl_id", pk[0]);
					rec.setValue("msds_location.fl_id", pk[1]);
					rec.setValue("msds_location.rm_id", pk[2]);
					rec.setValue("msds_location.site_id", getSiteCode(pk[0]));
					try {
						ds.saveRecord(rec);
					} catch (e) {
					}
				}

			}

			var drawingPanel = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel;
			drawingPanel.applyDS('labels');
			drawingPanel.applyDS('highlight');
			drawingPanel.processInstruction('abRiskMsdsDefLocDwgGridMsds', 'onclick');
		}else{
			abRiskMsdsDefLocDwgController.selecteRoomPK = pk;
		}
		
	}else{
		abRiskMsdsDefLocDwgController.selecteRoomPK = null;
	}
	
	
	// refresh the assignment panels restricted by the selected
	// locations
	abRiskMsdsDefLocDwgController.showLocationGrid();
	abRiskMsdsDefLocDwgController.selecteRoomPK = null;

}

/**
 * listener of the drawing onload event
 */
function onDwgLoaded() {
	// add next drawing in the drawing name array until all drawings are loaded
	abRiskMsdsDefLocDwgController.addFirstDrawing();
	var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
	drawingPanel.processInstruction('abRiskMsdsDefLocDwgDrawingPanel', 'onclick');
	drawingPanel.setToAssign("msds_data.msds_id", '0');
}

/**
 * on click event handler of button 'Unassign' in panel
 * abRiskMsdsDefLocDwgAssignment
 */
function unAssign() {
	abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgAssignment_onUnAssign();
}

/**
 * judge whether the assignment is existed.
 */
function recordExists(location, msds) {
	var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgMsdsLocDS;
	var restriction = 'msds_location.msds_id=' + msds + " AND (msds_location.bl_id='" + location[0] + "'" + " AND msds_location.fl_id='" + location[1] + "'" + " AND msds_location.rm_id='"
		+ location[2] + "')";
	var records = ds.getRecords(restriction);
	if (records.length > 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * get site code base on building code
 */
function getSiteCode(blId) {
	var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgTreeSiteDS;
	var restriction = "exists(select 1 from bl where bl.site_id = site.site_id and bl.bl_id='" + blId + "')";
	var records = ds.getRecords(restriction);
	if (records.length > 0) {
		return records[0].getValue('site.site_id');
	} else {
		return '';
	}
}