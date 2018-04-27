/**
 * @author Guo Jiangtao
 * @revised Eric Maxfield
 */
var abRiskMsdsDefLocsController = View.createController('abRiskMsdsDefLocsController', {
	
	selectedMSDSLocationRows : [],
	
	checkAllBoxSelected: false,

	/**
	 * This event handler is called by show button in
	 * abRiskMsdsDefLocsMsdsConsole.
	 */
	abRiskMsdsDefLocsMsdsConsole_onShow : function() {

		// get restrition from the console
		var restriction = this.abRiskMsdsDefLocsMsdsConsole.getFieldRestriction();

		// refresh the msds list
		this.abRiskMsdsDefLocsMsdsList.refresh(restriction);
		this.abRiskMsdsDefLocsMsdsConsole.closeWindow();
	},

	/**
	 * This event handler is called by Assign to Selected Locations button in
	 * abRiskMsdsDefLocsMsdsList.
	 */
	abRiskMsdsDefLocsMsdsList_onAssign : function() {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		var msdsRows = this.abRiskMsdsDefLocsMsdsList.getSelectedRows();
		var locationRows = this.abRiskMsdsDefLocsLocationList.getSelectedRows();
		if (msdsRows.length > 0 && locationRows.length > 0) {
			
			var msdsRestriction = 'msds_location.msds_id IN (';
			
			// loop through all selected msds records and assign each to selected locations
			for (var r = 0; r < msdsRows.length; r++) {
				
				// get selected msds
				var msds = msdsRows[r]['msds_data.msds_id'];
				if (msdsRows[r]['msds_data.msds_id.raw']) {
					msds = msdsRows[r]['msds_data.msds_id.raw'];
				}
	
				if (r > 0) {
					msdsRestriction += ", "; 
				}
				msdsRestriction += msds;
				
				var locRestriction = '';
	
				// loop all selected locations and add records to msds_location
				for ( var i = 0; i < locationRows.length; i++) {
	
					if(locationRows[i]['rm.bl_id'] !='') {
						locRestriction += "OR (msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";
						if(locationRows[i]['rm.eq_id'] !=''){
							locRestriction += " AND msds_location.eq_id='" + locationRows[i]['rm.eq_id'] + "'";
						}
						else {
							locRestriction += " AND msds_location.eq_id IS NULL";
						}
						if(locationRows[i]['rm.fl_id'] !='') {
							locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
							if(locationRows[i]['rm.rm_id'] !='') {
								locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
							}
						}
						locRestriction += ")";
					}					
	
					if (!this.recordExists(locationRows[i], msds)) {
						var rec = new Ab.data.Record();
						rec.isNew = true;
						rec.setValue("msds_location.msds_id", msds);
						rec.setValue("msds_location.site_id", locationRows[i]['rm.site_id']);
						rec.setValue("msds_location.bl_id", locationRows[i]['rm.bl_id']);
						rec.setValue("msds_location.fl_id", locationRows[i]['rm.fl_id']);
						rec.setValue("msds_location.rm_id", locationRows[i]['rm.rm_id']);
						rec.setValue("msds_location.eq_id", locationRows[i]['rm.eq_id']);
						try {
							ds.saveRecord(rec);
						} catch (e) {
						}
					}
				}
			}
			msdsRestriction += ')';
			// refresh the assignment panels restricted by the selected
			// locations and msds
			var restriction = msdsRestriction + " AND (" + locRestriction.substring(2) + ")"
			this.abRiskMsdsDefLocsAssignmentList.refresh(restriction);
		}
	},
	
	/**
	 * This event handler is called by the filter icon action button in
	 * abRiskMsdsDefLocsMsdsList.
	 */
	abRiskMsdsDefLocsMsdsList_onFilter : function() {
		//this.abRiskMsdsDefLocsMsdsConsole.newRecord = true;
		this.abRiskMsdsDefLocsMsdsConsole.show();
		this.abRiskMsdsDefLocsMsdsConsole.showInWindow({ width: 800, height: 300, closeButton: true });  
	},
	
	/**
	 * This event handler is called by the filter icon action button in
	 * abRiskMsdsDefLocationList.
	 */
	abRiskMsdsDefLocsLocationList_onFilter : function() {
		//this.abRiskMsdsDefLocsLocationConsole.newRecord = true;
		this.abRiskMsdsDefLocsLocationConsole.show();
		this.abRiskMsdsDefLocsLocationConsole.showInWindow({ width: 800, height: 300, closeButton: true });  
	}, 

	/**
	 * This event handler is called by Unassign Selected button in
	 * abRiskMsdsDefLocsAssignmentList.
	 */
	abRiskMsdsDefLocsAssignmentList_onUnassign : function() {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		var assignmentRows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
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
			this.abRiskMsdsDefLocsAssignmentList.refresh(this.abRiskMsdsDefLocsAssignmentList.restriction);
			this.abRiskMsdsDefLocsAssignmentForm.show(false);
		}
	},

	/**
	 * This event handler is called by Show Assignments at Selected Locations button in
	 * abRiskMsdsDefLocsLocationList.
	 */
	abRiskMsdsDefLocsLocationList_onAssignmentshow : function() {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		var msdsRows = this.abRiskMsdsDefLocsMsdsList.getSelectedRows();
		var locationRows = this.abRiskMsdsDefLocsLocationList.getSelectedRows();

		var msdsRestriction = '';
		if (msdsRows.length > 0) {			
			// loop through all selected msds items and add records to msds restriction
			var msds = '';
			for (var j = 0; j < msdsRows.length; j++) {
				if(msdsRows[j]['msds_data.msds_id'] !='') {
					msds = msdsRows[j]['msds_data.msds_id'];
					if (msdsRows[j]['msds_data.msds_id.raw']) {
						msds = msdsRows[j]['msds_data.msds_id.raw'];
					}
					msdsRestriction += ", '" + msds + "'";
				}
			}
			msdsRestriction = 'msds_location.msds_id IN (' + msdsRestriction.substring(2) + ") "  
		}
		
		var locRestriction = '';
		if (locationRows.length > 0) {			
			// loop all selected locations and add records to msds_location restriction
			for (var i = 0; i < locationRows.length; i++) {
				if(locationRows[i]['rm.eq_id'] !='') {
					locRestriction += "OR (msds_location.eq_id='" + locationRows[i]['rm.eq_id'] + "'";
					if(locationRows[i]['rm.bl_id'] !='') {
						locRestriction += " AND msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";					
						if(locationRows[i]['rm.fl_id'] !='') {
							locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
							if(locationRows[i]['rm.rm_id'] !='') {
								locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
							}
							else {
								locRestriction += " AND msds_location.rm_id IS NULL";
							}
						}
						else {
							locRestriction += " AND msds_location.fl_id IS NULL";
						}						
					}
					locRestriction += ")";
				}
				else if(locationRows[i]['rm.bl_id'] !='') {
					locRestriction += "OR (msds_location.eq_id IS NULL";
					locRestriction += " AND msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";					
					if(locationRows[i]['rm.fl_id'] !='') {
						locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
						if(locationRows[i]['rm.rm_id'] !='') {
							locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
						}
						else {
							locRestriction += " AND msds_location.rm_id IS NULL";
						}
					}
					else {
						locRestriction += " AND msds_location.fl_id IS NULL";
					}
					locRestriction += ")";
				}

			}
		}

			// refresh the assignment panels restricted by the selected
			// locations and msds
			var restriction = '';
			if (msdsRestriction != '' && locRestriction != '') {
				restriction += msdsRestriction + " AND (" + locRestriction.substring(2) + ")";
			}
			else if (locRestriction != '') {
				restriction += locRestriction.substring(2);
			}
			else if (msdsRestriction != '') {
				restriction += msdsRestriction;
			}

			this.abRiskMsdsDefLocsAssignmentList.refresh(restriction);
	},	
		
	/**
	 * judge whether the assignment is existed abRiskMsdsDefLocsAssignmentList.
	 */
	recordExists : function(location, msds) {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		
		var restriction = 'msds_location.msds_id=' + msds + " AND (msds_location.bl_id"; 
		if(location['rm.bl_id']){
			restriction += "='" + location['rm.bl_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}
		restriction += " AND msds_location.fl_id" 
		if(location['rm.fl_id']){
			restriction += "='" + location['rm.fl_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}
		restriction += " AND msds_location.rm_id"
		if(location['rm.rm_id']){
			restriction += "='" + location['rm.rm_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}		
		if(location['rm.eq_id']){
			restriction +=  " AND msds_location.eq_id='" + location['rm.eq_id'] + "')";
		}
		else {
			restriction +=  " AND msds_location.eq_id IS NULL)";
		}
		
		var records = ds.getRecords(restriction);
		if (records.length > 0) {
			return true;
		} else {
			return false;
		}
	}, 
	
	/**
	 * close the location filter console window 
	 */
	closeAbRiskMsdsDefLocsLocationConsoleWindow : function() {
		this.abRiskMsdsDefLocsLocationConsole.closeWindow();
	}, 
	
	/**
	 * close the MSDS filter console window 
	 */
	closeAbRiskMsdsDefLocsMsdsConsoleWindow : function() {
		this.abRiskMsdsDefLocsMsdsConsole.closeWindow();
	},
	
	/**
	 * This event handler for grid abRiskMsdsDefLocsAssignmentList after refreshed
	 */
	abRiskMsdsDefLocsAssignmentList_afterRefresh : function() {
		var grid = this.abRiskMsdsDefLocsAssignmentList;
		var selectedRows = this.selectedMSDSLocationRows;
		for(var i=0;i<selectedRows.length; i++) {
			var index = selectedRows[i].row.getIndex();
			grid.selectRowChecked(index, true);
		}
		
		if(this.checkAllBoxSelected){
			var checkAllEl = Ext.get('abRiskMsdsDefLocsAssignmentList_checkAll');
			checkAllEl.dom.checked = true;
		}
		
		this.selectedMSDSLocationRows = [];
		this.checkAllBoxSelected = false;
	},
	
	/**
	 * This event handler is called by show button in
	 * abRiskMsdsDefLocsAssignmentList to open the location details edit form
	 */
	abRiskMsdsDefLocsAssignmentList_onEditselected : function() {
		var rows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
		
		if(rows.length > 0) {
			var keysString = '';
			var msdsId = '';
			var nonMatch = false;
			for(var i=0; i<rows.length; i++){
				var rowKey = rows[i]['msds_location.auto_number.key'];
				//check for non-unique MSDS products in the selection set
				if(i>0 && (rows[i]['msds_location.msds_id'] != rows[i-1]['msds_location.msds_id'])) {
					nonMatch = true;
					continue;
				}
				else {
					keysString += ", '" + rowKey + "'";
				}				
			}
			var restriction = 'msds_location.auto_number IN (' + keysString.substring(2) + ')';
			this.abRiskMsdsDefLocsAssignmentForm.refresh(restriction);
			if(nonMatch == false) {
				document.getElementById('abRiskMsdsDefLocsAssignmentForm_instructions').style.display = 'none';				
			}
			this.abRiskMsdsDefLocsAssignmentForm.showInWindow({ width: 900, height: 500, closeButton: true });			
		}
	},
	
	/**
	 * This event handler for abRiskMsdsDefLocsAssignmentForm processes data source values from multiple records and replaces
	 * initial form field entries for any visible field having non-distinct read-only text field values with a message string ("Various").  
	 */
	abRiskMsdsDefLocsAssignmentForm_afterRefresh : function() {
		this.abRiskMsdsDefLocsAssignmentForm.hidden=false;
		var rows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
		var columns = this.abRiskMsdsDefLocsAssignmentForm.fields;		
		var comparisonValues = new Array();
		var variesMessageStr = getMessage('valuesVary');
		
		for(var i=0;i<rows.length; i++) {
			for(var j=0;j<columns.length; j++) {							
				if(i>0 && comparisonValues[j] != variesMessageStr && (comparisonValues[j] != rows[i][columns.keys[j]])) {
					if(i>0) {	
						comparisonValues[j] = variesMessageStr;
						if(columns.items[j].config.hidden == "false" && columns.items[j].config.readOnly == "true") {
							this.abRiskMsdsDefLocsAssignmentForm.setFieldValue(columns.keys[j],variesMessageStr);
						}
					}
				}
				else {
					comparisonValues[j] = rows[i][columns.keys[j]];
				}				
			}
		}		
	}

});

/**
 * function to be invoked by callFunction in order to close the location filter console window
 */
function closeAbRiskMsdsDefLocsLocationConsoleWindow() {
	var controller = View.controllers.get('abRiskMsdsDefLocsController');
	controller.closeAbRiskMsdsDefLocsLocationConsoleWindow();
}

/**
 * function to be invoked by callFunction in order to close the MSDS filter console window
 */
function closeAbRiskMsdsDefLocsMsdsConsoleWindow() {
	var controller = View.controllers.get('abRiskMsdsDefLocsController');
	controller.closeAbRiskMsdsDefLocsMsdsConsoleWindow();
}

/**
 * function to be invoked by callFunction in order to save details to all selected assignments
 */
function applyToSelectedAssignments() {
	var form = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentForm;
	var rows = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
	abRiskMsdsDefLocsController.selectedMSDSLocationRows = rows;
	var checkAllEl = Ext.get('abRiskMsdsDefLocsAssignmentList_checkAll');
	abRiskMsdsDefLocsController.checkAllBoxSelected = checkAllEl.dom.checked;
	
	if(form.canSave()){
		var rowKeys = [];
		
		//Get the list of selected locations
		for(var i=0; i<rows.length; i++){
			rowKeys.push(rows[i]['msds_location.auto_number.key']);
		}

		//(KB3035357) Save gridRows -1 records using dataSource.saveRecord to disable result message
		for(var i=0; i < (rowKeys.length - 1); i++){
			var ds = View.dataSources.get('abRiskMsdsDefLocsAssignmentDS');
			
			form.setFieldValue('msds_location.auto_number',rowKeys[i]);
			var record = form.getRecord();
			
			//avoid updating the old record
			record.oldValues['msds_location.auto_number'] = rowKeys[i];
			
			ds.saveRecord(record); 
		}
		
		//(KB3035357) Save the last record with form.save to display just one result message
		var i = rowKeys.length - 1;
		form.setFieldValue('msds_location.auto_number',rowKeys[i]);
		var ds = View.dataSources.get('abRiskMsdsDefLocsAssignmentDS');
		var record = ds.getRecord('msds_location.auto_number='+rowKeys[i]);
		form.record = record;
		form.save();
	}
}
