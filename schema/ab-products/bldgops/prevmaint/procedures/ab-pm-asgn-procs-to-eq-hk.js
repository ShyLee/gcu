/**
 * @author keven.xi
 */
var assignPMController = View.createController('assignPM', {


    /**
     *searchRestriction:
     */
    searchRestriction: null,
    /*
     *the datasource for show and edit pms
     */
    dataSourcePms: null,    
    /*
     * pmp_type
     */
    pmpType: "EQ",//{'EQ','HK'}
    curTab: "EQTab", // "EQTab","HKTab"
    //const var
    EQPms: "EQ",
    LocationPms: "HK",
    
	selectedEQs: null,

    afterViewLoad: function(){
        this.searchRestriction = new Ab.view.Restriction();
        this.dataSourcePms = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_set_pms");
        this.dataSourceGroupPms = View.dataSources.get("ds_ab-pm-asgn-procs-to-eq-hk_group_pms");
        this.Select_Equipment_Location.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
		//Added for PM Release 2
        this.eq_select.selectAll = this.selectAll;
        this.addSelectionHandler();
    },
    
    addSelectionHandler: function(){
       this.eq_select.addEventListener('onMultipleSelectionChange', this.onSelectMultipleEquipments.createDelegate(this) );
    },
    
    //For solving the performance issue, override the reportGrid.selectAll() function.
    selectAll: function(selected) {
    	this.addEventListener('onMultipleSelectionChange', null );
    	this.setAllRowsSelected(selected);  
        assignPMController.addSelectionHandler();        
		assignPMController.onSelectMultipleEquipments();
    },    

	//Added for PM Release 2
	onSelectMultipleEquipments:function(row){
			//Guo adden 2009-08-28 to fix bug(the two panels in the right can not show when select the checkbox in the left) caused by buid change
			this.pmp_select.show(true);
			var records = this.eq_select.getSelectedRecords();
			if(records && records.length>0){
				this.pmpType = this.EQPms;
				try {
					//	ZY added on 2010-12-06 for kb3024888, construct equipment codes and equipment standards string
					var eqIds = "",eqStds="";
					for(var i=0; i<records.length;i++){
						eqIds +=records[i].values['eq.eq_id']+";"
						eqStds +=records[i].values['eq.eq_std']+";"
					}
					// This method serve as a WFR to retrieve attached PM Schedules for multiple equipments,file='PreventiveMaintenanceCommonHandler.java'
					var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-selectPMSRecordsForMultiEq', eqIds);
					this.pmp_select.clear();
					this.pmp_select.setRecords(result.dataSet.records, result.dataSet.hasMoreRecords);
					//	ZY changed on 2010-12-06 for kb3024888, don't manually call WFR, but refresh the grid and implicitly execute refresh WFR method
					this.pmp_list.refresh(eqIds+"&;plus&;"+eqStds);
					//Set title of Assigned Procedures panel
					if(records.length>1){
						var title = getMessage("assignedProceduresMulti");
						setPanelTitle('pmp_select', title);
					}
					else{
						var title = getMessage("assignedProcedures")+records[0].getValue("eq.eq_id");
						setPanelTitle('pmp_select', title);
					}
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
			else{	
 					this.pmp_select.clear();
 					this.pmp_list.clear();
			        //hide two panels on the right when no eq selected
					this.pmp_select.show(false);
					this.pmp_list.show(false);
			}
			//kb3026576: disable sort for custom records set.
	        this.pmp_select.removeSorting();
	},

	pmp_list_afterRefresh: function(row){
        var assignedGrid = View.panels.get('pmp_select');
        var availGrid = View.panels.get('pmp_list');
        var restriction = new Ab.view.Restriction();
        var selEqRows = this.eq_select.getPrimaryKeysForSelectedRows();
		
               var eqid = new Array();
                  for (var j = 0; j < selEqRows.length; j++) {
				  	
				  	  eqid.push( selEqRows[j]["eq.eq_id"]);
				  }
				  if (eqid.length != 0) {
				  	restriction.addClause('pms.eq_id', eqid, 'in');
				  }else{
					restriction.addClause('pms.pmp_id', "", 'IS NULL');  
				  }
				  
				  //KB3033679 - use one database query to improve the performance
				  var recs = this.dataSourceGroupPms.getRecords(restriction);
				  var pmpList = new Ext.util.MixedCollection();
				  for(var i = 0; i < recs.length; i++){
					  pmpList.add(recs[i].getValue('pms.pmp_id'),recs[i].getValue('pms.pmp_id'));
				  }
				  
            for (var i = 0; i < availGrid.rows.length; i++) {
                var row = availGrid.rows[i];
                var pmpId = row["pmp.pmp_id"];
                var rowEl = Ext.get(row.row.dom);
				//when recs is null return;
				if (valueExists(pmpList.get(pmpId))) {
					if (recs.length > 0) {
						if(this.curTab== "EQTab"){
						rowEl.setStyle('font-weight', 'bold');
						}else{
						rowEl.setStyle('font-weight', 'normal');
						}
					
					}
				}
            }
		//kb3026576: disable sort for custom records set.
       // this.pmp_list.removeSorting();
	},
    // ----------------------- event handlers -----------------------------------------------------
    
    filterEqOrRmPanel_onShow: function(){
        var console = View.panels.get('filterEqOrRmPanel');
		var report = null;  
        // generate and apply restriction to the report
        if (this.curTab == "EQTab") {
            report = View.panels.get('eq_select');
			restriction = this.genRestrictionFromFilter(true,console);
        }
        else {
            report = View.panels.get('rm_select');
			restriction = this.genRestrictionFromFilter(false,console);
        }
        report.refresh(restriction);
        
        // show the report
        report.show(true);
        
        //update panel title and refresh two grid panel
        this.updateTitleAndRefreshPmpPanel();
    },

    filterEqOrRmPanel_onClear: function(){
        var console = View.panels.get('filterEqOrRmPanel');
		console.clear();
		document.getElementById('no_proc').checked=false;
	},


    genRestrictionFromFilter:function(isEq, console){
		var restriction = " 1=1 ";
		var proRes = null;
		if(document.getElementById('no_proc').checked){
			if (isEq) {
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.eq_id = eq.eq_id) ";
			}
			else{
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id = rm.rm_id AND  pms.bl_id = rm.bl_id AND  pms.fl_id = rm.fl_id ) ";
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id IS NULL AND  pms.bl_id = rm.bl_id AND  pms.fl_id = rm.fl_id AND rm.rm_id IS NULL) ";
				restriction +=" AND NOT EXISTS (SELECT 1 FROM pms WHERE pms.rm_id IS NULL AND  pms.bl_id = rm.bl_id AND  pms.fl_id IS NULL AND rm.rm_id IS NULL AND rm.fl_id IS NULL ) ";
			}
		}

		var bl_id = console.getFieldValue('eq.bl_id');
		if (bl_id) {
			if (isEq) {
				restriction += " AND eq.bl_id='" +	bl_id +"' ";
			}
			else{
				restriction += " AND rm.bl_id='" +	bl_id +"' ";
			}
		}

        var fl_id = console.getFieldValue('eq.fl_id');
		if (fl_id) {
			if (isEq) {
				restriction += " AND eq.fl_id='" +	fl_id +"' ";
			}
			else{
				restriction += " AND rm.fl_id='" +	fl_id +"' ";
			}
		}

        var rm_id = console.getFieldValue('eq.rm_id');
		if (rm_id) {
			if (isEq) {
				restriction += " AND eq.rm_id='" +	rm_id +"' ";
			}
			else{
				restriction += " AND rm.rm_id='" +	rm_id +"' ";
			}
		}

		var eq_std = console.getFieldValue('eq.eq_std');
		if (eq_std) {
			if (isEq) {
				restriction += " AND eq.eq_std='" +	eq_std +"' ";
			}
		}
		return restriction;
	},
 
    eq_select_afterRefresh: function(){
        this.afterEquipmentAndLocationLoad(true);
    },
    
    rm_select_afterRefresh: function(){
        this.afterEquipmentAndLocationLoad(false);
    },
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        if (newTabName == "rm_tab") {
            this.curTab = "HKTab";
        }
        else {
            this.curTab = "EQTab";
        }
        this.filterEqOrRmPanel_onShow();
    },
    /**
     *Delete Selected Click Event
     */
    pmp_select_onDeleteRecord: function(){
        var pmsGrid = View.panels.get('pmp_select');
        var rows = pmsGrid.getSelectedRows();
        if (rows.length > 0) {
			if(this.pmpType == this.LocationPms){
				this.delePmScheduleReocrdsForLoc(rows);
				this.rm_select_afterRefresh();
			}
			else if(this.pmpType == this.EQPms){
				this.delePmScheduleReocrdsForEqs();
				this.eq_select_afterRefresh();
				
			}
        }
        else {
            alert(getMessage("errorSelectPMS"));
        }
    },

	delePmScheduleReocrdsForEqs:function(){
		var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
		var pmpRecs =this.pmp_select.getSelectedRecords();

        var pmpIds = new Array();
        for (var i = 0; i < pmpRecs.length; i++) {
	        var pmpRow = new Object();
            pmpRow["pmp.pmp_id"] = pmpRecs[i].getValue("pmp.pmp_id");
			pmpIds.push(pmpRow);
		}

		if(eqIds &&  eqIds.length)
			var result = {};
		// This method serve as a WFR to delete PM Schedules for multiple equipments and procedures, file='PreventiveMaintenanceCommonHandler.java'
			try {
				result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-delePMSForMultiEq', eqIds, pmpIds);
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		this.onSelectMultipleEquipments(null);
		this.updateGridRowStyle(true);
	},

	delePmScheduleReocrdsForLoc:function(rows){
		var pmsCode = "";
		try {
			for (var i = 0; i < rows.length; i++) {
				pmsCode = rows[i]["pms.pms_id"];
				var record = new Ab.data.Record({
					'pms.pms_id': pmsCode
				}, false);
				
				//Delete any selected records.				
				this.dataSourcePms.deleteRecord(record);
			}
		} 
		catch (e) {
			var errMessage = getMessage("errorDelete").replace('{0}', pmsCode);
			View.showMessage('error', errMessage, e.message, e.data);
			return;
		}
		//Refresh the Available Procedures panel.
		this.pmp_list_for_rm.refresh(this.pmp_list_for_rm.restriction);
		//Refresh Assigned PM Procedures panel.
		this.pmp_select.refresh(this.pmp_select.restriction);
		//Refresh the Equipment or Location tab.
		this.updateGridRowStyle(false,this.rm_select.rows[this.rm_select.selectedRowIndex]);
		//update the number of pm schedules
		
	},


    
    /**
     * Add Selected Click Event
     */
    pmp_list_onAddNew: function(){
    
        var pmpGrid = View.panels.get('pmp_list');
        var rows = pmpGrid.getSelectedRows();
        //Associate selected procedures to selected equipment  in pms table.
        if (rows.length > 0) {

            if (this.pmpType == this.EQPms){
				this.addPmScheduleReocrdsForEqs();
			}	
			else{
				this.addPmScheduleReocrdsForLoc(rows);
				this.rm_select_afterRefresh();
            }
        }
        else {
            alert(getMessage("errorSelectPMP"));
        }
    },
	
	/**
     * Add Selected Click Event
     */
    pmp_list_for_rm_onAddNew: function(){
    
        var pmpGrid = View.panels.get('pmp_list_for_rm');
        var rows = pmpGrid.getSelectedRows();
        //Associate selected procedures to  location in pms table.
        if (rows.length > 0) {

            if (this.pmpType == this.EQPms){
				this.addPmScheduleReocrdsForEqs();
			}	
			else{
				this.addPmScheduleReocrdsForLoc(rows);
				this.rm_select_afterRefresh();
            }
        }
        else {
            alert(getMessage("errorSelectPMP"));
        }
    },

	addPmScheduleReocrdsForEqs:function(){
		var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
		var pmpRecs =this.pmp_list.getSelectedRecords();

        var pmpIds = new Array();
        for (var i = 0; i < pmpRecs.length; i++) {
	        var pmpRow = new Object();
            pmpRow["pmp.pmp_id"] = pmpRecs[i].getValue("pmp.pmp_id");
			pmpIds.push(pmpRow);
		}

		if(eqIds &&  eqIds.length)
			var result = {};
		//This method serve as a WFR to add PM Schedules for multiple equipments and procedures,file='PreventiveMaintenanceCommonHandler.java'
			try {
				 result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-addPMSForMultiEq',eqIds, pmpIds);
			} 
			catch (e) {
				 Workflow.handleError(e);
			}
		this.onSelectMultipleEquipments(null);
		this.updateGridRowStyle(true);
	},

	addPmScheduleReocrdsForLoc:function(rows){
                var rmGrid = View.panels.get('rm_select');
                var selectedRow = rmGrid.rows[rmGrid.selectedRowIndex];
                var siteID = selectedRow["bl.site_id"];
                var buildingID = selectedRow["rm.bl_id"];
                var floorID = selectedRow["rm.fl_id"];
                var roomID = selectedRow["rm.rm_id"];
	            var record = null;
		        for (var i = 0; i < rows.length; i++) {
					var pmpID = rows[i]["pmp.pmp_id"];
					record = new Ab.data.Record({
							'pms.pmp_id': pmpID,
							'pms.site_id': siteID,
							'pms.bl_id': buildingID,
							'pms.fl_id': floorID,
							'pms.rm_id': roomID
						}, true);
					try {//problem
						//This action will insert a new record into the pms table.				
						this.dataSourcePms.saveRecord(record);
					} 
					catch (e) {
						var message = getMessage('errorSave');
						View.showMessage('error', message, e.message, e.data);
						return;
					}
                }              
				//Refresh Assigned PM Procedures panel.
				this.pmp_select.refresh(this.pmp_select.restriction);
				//Refresh the Available Procedures panel to filter out the record that was just added.
				this.pmp_list_for_rm.refresh(this.pmp_list_for_rm.restriction);
				//Refresh the Equipment or Location tab.
				this.updateGridRowStyle(false,selectedRow);
				//update the number of pm schedules
	},

    //Need to modify current functiuon to load 18.2 Define PM Schedule View
    pmp_select_schedule_onClick: function(row, action){
        var record = row.getRecord();
		if (this.pmpType == this.EQPms){
			var eqIds = this.eq_select.getPrimaryKeysForSelectedRows();
			var pmpID = record.getValue("pmp.pmp_id");
			var resFromAsign = "";
			resFromAsign = " pms.pmp_id='"+pmpID+"'";
			var resFromAsign = new Ab.view.Restriction();
			for (var i = 0; i < eqIds.length; i++) {
				resFromAsign.addClause('pms.eq_id', eqIds[i]["eq.eq_id"], '=', 'or');
			}              
            resFromAsign.addClause('pms.pmp_id', pmpID, '=', ')AND(');
			View.resFromAsign = resFromAsign;
			View.openDialog('ab-pm-def-sched.axvw');
		}	
		else{
			var pmsID = record.getValue("pms.pms_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause("pms.pms_id", pmsID, "=");
			View.openDialog('ab-pm-ed-sched.axvw', restriction, false, {
				width: 700,
				height: 760
			});
		}
    },
    /**
     * show procedure and step which is in the pmp_list panel
     * @param {Object} row
     */
    pmp_select_details_onClick: function(row){
		this.openPmpInfoDialog(row);
    },

    /**
     * show procedure and step which is in the pmp_list panel
     * @param {Object} row
     */
    pmp_list_details_onClick: function(row){
		this.openPmpInfoDialog(row);
	},
	
	/**
     * show procedure and step which is in the pmp_list_for_rm panel
     * @param {Object} row
     */
	pmp_list_for_rm_details_onClick: function(row){
		this.openPmpInfoDialog(row);
	},
	
    openPmpInfoDialog: function(row){
        var record = row.getRecord();
        var pmpCode = record.getValue('pmp.pmp_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('pmp.pmp_id', pmpCode, '=');
        View.openDialog('ab-pm-pmp-info.axvw', restriction, false);
	},
  updateGridRowStyle: function(isEq, row){
        this.afterEquipmentAndLocationLoad(isEq);
    },
    
    /**
     * the selected equipment or room is existed in pms table
     *
     * @param {boolean} isEq
     * @param {string} row
     * @param {Array} pmsrecord
     */
    updateOneRowStyle: function(isEq, row, pmsrecord){
        var rowEl = Ext.get(row.row.dom);
        if (isEq) {
            var eqID = row["eq.eq_id"];
            for (var m = 0; m < pmsrecord.length; m++) {
                if (pmsrecord[m] != "") {
                    //judging eq or rm list in or not in the returned result
                    if (pmsrecord[m]["eq.eq_id"] == eqID) {
                        rowEl.setStyle('font-weight', 'bold');
                        break;
                        //10.1qian 
                    }
                    else {
                        rowEl.setStyle('font-weight', 'normal');
                    }
                }
            }
        }
        else {
            var rmID = row["rm.rm_id"];
			var flID = row["rm.fl_id"];
			var blID = row["rm.bl_id"];
             for (var m = 0; m < pmsrecord.length; m++) {
                if (pmsrecord[m] != "") {
                    //judging eq or rm list in or not in the returned result
                    
                    if ((pmsrecord[m]["rm.rm_id"] == rmID && pmsrecord[m]["rm.fl_id"] == flID && pmsrecord[m]["rm.bl_id"] == blID)) {
                        rowEl.setStyle('font-weight', 'bold');
                        break;
                        //10.1qian 
                    }
                    else 
                        if (pmsrecord[m]["rm.bl_id"] == blID && pmsrecord[m]["rm.fl_id"] == flID && pmsrecord[m]["rm.rm_id"] == undefined && rmID == '') {
                            rowEl.setStyle('font-weight', 'bold');
                            break;
                        }
                        else 
                            if (pmsrecord[m]["rm.bl_id"] == blID && pmsrecord[m]["rm.fl_id"] == undefined && pmsrecord[m]["rm.fl_id"]==undefined&&flID == ''&&rmID=='' ) {	
							    rowEl.setStyle('font-weight', 'bold');
								 break;
                            }
                            else {
                                rowEl.setStyle('font-weight', 'normal');
                            }
                }
            }
        }
    },
	   /**
     * the selected equipment or room is existed in pms table
     *
     * @param {boolean} isEq
     * @param {string} row
     * 
     */
    updateOneRowStyle2: function(isEq, row){
        var rowEl = Ext.get(row.row.dom);
        if (isEq) {
           var eqID = row["eq.eq_id"];
           rowEl.setStyle('font-weight', 'normal');
        }
        else {
            var rmID = row["rm.rm_id"];
            rowEl.setStyle('font-weight', 'normal');   
        }
    },
    /**
     * Update the style of the rows in equipment or location grid panel after
     * the two grid panel refresh
     *
     * @param {boolean} isEq
     * @param {String} gridPanelID
     */
    afterEquipmentAndLocationLoad: function(isEq){
        var gridPanelID = isEq ? "eq_select" : "rm_select";
        var grid = View.panels.get(gridPanelID);
		if(grid!=undefined){
        var res = this.getPmsRecordByDistinctEqOrRm(isEq, grid.rows);
        if (res != undefined) {
            if (res.length > 0) {
                for (var i = 0; i < grid.rows.length; i++) {
                    this.updateOneRowStyle(isEq, grid.rows[i], res);
                    continue;
                }
            }else{
				 for (var i = 0; i < grid.rows.length; i++) {
                    this.updateOneRowStyle2(isEq, grid.rows[i]);
                    continue;
                }
			}
        } }
        
        /** for (var i = 0; i < grid.rows.length; i++) {
         this.updateOneRowStyle(isEq, grid.rows[i], dataSourcePms);
         continue;
         }*/
    },
    getPmsRecordByDistinctEqOrRm: function(isEq, gridrows){
        var eqArr = new Array();
        for (var i = 0; i < gridrows.length; i++) {
            if (isEq) {
                eqArr[i] = gridrows[i]["eq.eq_id"];
            }
            else {
                eqArr[i] = gridrows[i]["rm.rm_id"];
            }
        }
        //workflow result for decide if eq and rm  exists in  table pms by judging eq or rm list in or not in the returned result 
		var result = {};
		try {
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-getPmsRecordByDistinctEqOrRm', eqArr, toJSON(isEq));
		}
		catch(e){
		 Workflow.handleError(e);	
		}
        var res = eval('(' + result.jsonExpression + ')');
        if (result.code == "executed") {
            return res;
        }
    },
    
    /**
     * call user click show and tab change
     * update pmp_select panel title
     * refresh pmp_select and pmp_list
     */
    updateTitleAndRefreshPmpPanel: function(){
        //refresh pmp_select
        this.pmp_select.clear();
        
        //remove all rows in pmp list grid panel
        this.pmp_list.clear();
        
        //hide two panels on the right
		View.panels.get('pmp_select').show(false);
		View.panels.get('pmp_list').show(false);
		View.panels.get('pmp_list_for_rm').show(false);
    }
});
/**
 * call when user select location in rm_select grid panel
 */
function location_onClick(){
    //1 set the title of pmp_select panel
    var grid = View.panels.get('rm_select');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var siteID = selectedRow["bl.site_id"];
    var buildingID = selectedRow["rm.bl_id"];
    var floorID = selectedRow["rm.fl_id"];
    var roomID = selectedRow["rm.rm_id"];
    var title = getMessage("assignedProcedures") + " ";
    title += getPMScgedulePanelTitle(siteID, buildingID, floorID, roomID);
    setPanelTitle('pmp_select', title);
    
    //2 refresh the pmp_select panel
    var restriction = getSubLocationQuery(siteID, buildingID, floorID, roomID);
    var pmsReport = View.panels.get('pmp_select');
    pmsReport.refresh(restriction);
    
    //3 refresh the pmp_list panel
    var subQueryWhere = restriction;
    var pmplistGrid = View.panels.get('pmp_list_for_rm');
    pmplistGrid.addParameter('paramPmpType', assignPMController.LocationPms);
    pmplistGrid.addParameter('subQueryWhere', subQueryWhere);
    pmplistGrid.addParameter('addWhereEqStd', "");
    pmplistGrid.refresh();
	assignPMController.pmpType = assignPMController.LocationPms;
}

function getPMScgedulePanelTitle(site, building, floor, room){
    var result = "";
    if (site) 
        result = site;
    if (building) 
        result += "-" + building;
    if (floor) 
        result += "-" + floor;
    if (room) 
        result += "-" + room;
    return result;
}

function getSubLocationQuery(site, building, floor, room){
    var result = "pmp.pmp_type='" + assignPMController.LocationPms + "'";
    if (site) {
        result += " AND pms.site_id='" + site + "'";
    }
    else {
        result += " AND pms.site_id IS NULL "
    }
    if (building) {
        result += " AND pms.bl_id='" + building + "'";
    }
    else {
        result += " AND pms.bl_id IS NULL "
    }
    if (floor) {
        result += " AND pms.fl_id='" + floor + "'";
    }
    else {
        result += " AND pms.fl_id IS NULL "
    }
    if (room) {
        result += " AND pms.rm_id='" + room + "'";
    }
    else {
        result += " AND pms.rm_id IS NULL "
    }
    
    return result;
}

