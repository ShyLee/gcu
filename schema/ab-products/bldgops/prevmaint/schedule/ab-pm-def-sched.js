/**
 *
 */
var defPMSchedController = View.createController('defPMSched', {

    /**
     * pmp_type : 'EQ' or 'HK'
     */
    setvalue: new Object(),
    records: '',
    // when refresh is excuted ,it true for used in the afterRefresh action' guide
    tag: '',
    tagpmsrecords: '',
    tagresFromAsign: '',
    afterSave: '',
    pmsDetailsHidden: false,
    oldPmsValue: '',
    isAlertSaved: false,
    checkAll: false,
    pmpType: "",

     //localized text for 'varies', added for kb#3038652 
	variesText:"",
     //'varies' value hold in client which is consistent with server side string value, added for kb#3038652 
	variesValue:"<varies>",

    //use for decide if that is a varies value.
	regexp: /[>,<]/gi,
 
    afterInitialDataFetch: function(){
		//initial locailzed text of 'varies'	
		this.variesText = "<"+getMessage('varies')+ ">";

        var pmsrecords = View.getOpenerView().PMSrecords;
        var sqlstr = "";
        var sqltablestr = "";
        var layout = View.getLayoutManager('mainLayout');
        //for view 52 weeks
        var resFromAsign = View.getOpenerView().resFromAsign;
        setTaskPriorityOptions();
        //for assign schedule
        if (resFromAsign != undefined) {
            this.tag = 'true';
            this.tagresFromAsign = 'true';
            this.eq_procedure_select.refresh(resFromAsign);
            layout.collapseRegion('west');
        }
        else 
            if (pmsrecords != undefined) {
                //kb:3024435
                //this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
                this.eq_procedure_select.selectAll = this.selectAll;
                this.addSelectionHandler();
                this.tag = 'false';
                this.tagpmsrecords = 'true';
                this.refreshEqAndRmProcedureSelected(pmsrecords);
                var layout1 = View.getLayoutManager('nested_west');
                layout1.collapseRegion('north');
                pmsrecords = '';
                
            }//for define schedule 
            else {
                this.SelectEquipmentLocationProcedure.addEventListener('beforeTabChange', this.beforeTabChange);
                //this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
                this.eq_procedure_select.selectAll = this.selectAll;
                this.addSelectionHandler();
                this.pmpType = 'EQ';
                document.getElementById("noschedule").checked = false;
                this.pms_info.enableButton('save', false);
                //for :(pms.interval_n) is not equal to 0.
                $("dsAbPmDefSchedPms_filterConsole_pms.bl_id").value = "";
                $("dsAbPmDefSchedPms_filterConsole_pms.fl_id").value = "";
                $("dsAbPmDefSchedPms_filterConsole_pms.rm_id").value = "";
                $("dsAbPmDefSchedPms_filterConsole_eq.eq_std").value = "";
                $("dsAbPmDefSchedPms_filterConsole_pms.pmp_id").value = "";
            }
    },
    addSelectionHandler: function(){
        this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
    },
    
    //For solving the performance issue, override the reportGrid.selectAll() function.
    selectAll: function(selected){
        this.addEventListener('onMultipleSelectionChange', null);
        this.setAllRowsSelected(selected);
        defPMSchedController.addSelectionHandler();
        eq_procedure_onClick();
    },
    
    //the function is for get pms that the dialog will display
    refreshEqAndRmProcedureSelected: function(pmsrecords){
        this.dsAbPmDefSchedPms_filterConsole.show(false);
        var pmsRestr = getRetrictionFromParentView(pmsrecords);
        //kb:3024805
		var result = {};
		//This method served as a workflow rule to calculate below values from historical work request table (hwr) and
        //equipment table (eq) for equipments within given date range: file='PreventiveMaintenanceCommonHandler.java'
        try {
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-getMultiPMSRecords', pmsRestr);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        var res = eval('(' + result.jsonExpression + ')');
        var restrictionTab = new Ab.view.Restriction();
        if (result.code == "executed") {
        
            var pmsID = new Array();
            if (res.length > 0) {
            
                for (var r = 0; r < res.length; r++) {
                    pmsID[r] = res[r];
                    restrictionTab.addClause('pms.pms_id', pmsID, 'IN');
                }
                
                View.panels.get('eq_procedure_select').refresh(restrictionTab);
                if (this.checkAll) {
                    $('eq_procedure_select_checkAll').checked = true;
                }
                this.rm_procedure_select.refresh(restrictionTab);
                
            }
            else {//kb:3024526
                restrictionTab.addClause('pms.pms_id', -1, '=');
                View.panels.get('eq_procedure_select').refresh(restrictionTab);
                this.rm_procedure_select.refresh(restrictionTab);
            }
        }
    },
    
    //kb :3024161
    updateOneRowStyle: function(isEq, row){
        var rowEl = Ext.get(row.row.dom);
        if (isEq) {
            if (row['pms.interval_1'] != 0 || row['pms.interval_2'] != 0 || row['pms.interval_3'] != 0 || row['pms.interval_4'] != 0) {
                rowEl.setStyle('font-weight', 'bold');
            }
        }
        else {
            rowEl.setStyle('font-weight', 'normal');
        }
    },
    updateStyle: function(isEq, afterSave){
        //  var gridPanelID = isEq ? "eq_procedure_select" : "rm_procedure_select";
        var grid = View.panels.get(isEq);
        for (var i = 0; i < grid.rows.length; i++) {
            this.updateOneRowStyle(isEq, grid.rows[i]);
            if (this.afterSave != undefined) {
                if (this.afterSave == 'true') {
                    for (var j = 0; j < this.records.length; j++) {
                        if (grid.rows[i]['pms.pms_id'] == this.records[j]['pms.pms_id']) {
                            grid.rows[i].row.dom.firstChild.firstChild.checked = true;
                        }
                    }
                }
            }
            
        }
    },
    
    /**
     * Update the style of the rows in equipment or location grid panel after
     * the two grid panel refresh
     *
     * @param {boolean} isEq
     * @param {String} gridPanelID
     */
    eq_procedure_select_afterRefresh: function(){
        var checkAllEl = Ext.get('eq_procedure_select_checkAll');
        var pmsrecords = View.getOpenerView().PMSrecords;
        var resFromAsign = View.getOpenerView().resFromAsign;
        this.updateStyle('eq_procedure_select', this.afterSave);
        //add a listener for all check button
        
        
        if (this.tag == 'true') {
            if (valueExists(checkAllEl)) {
                var panel = this.eq_procedure_select;
                var dataRows = panel.getDataRows();
                $('eq_procedure_select_checkAll').checked = true;
                this.checkAll = true;
                panel.setAllRowsSelected(true);
                eq_procedure_onClick(pmsrecords, resFromAsign);
                //kb:3024435
                if (resFromAsign != undefined) {
                    this.setAllRowsDisabledSelected(panel);
                }
                pmsrecords = '';
                resFromAsign = '';
                checkAllEl = '';
                this.tag = 'false';
            }
        }
		//after refresh select grid, determine to enable the 'Copy' action or not
		enableCopyButton(View.panels.get("eq_procedure_select"));
    },
    
    rm_procedure_select_afterRefresh: function(){
        this.updateStyle('rm_procedure_select', '');
    },
    //disable the checked
    setAllRowsDisabledSelected: function(panel){
        // get switch value, default == true
        var dataRows = panel.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var str = "eq_procedure_select_row" + r + "_multipleSelectionColumn";
            
            document.getElementById(str).disabled = true;
        }
        document.getElementById('eq_procedure_select_checkAll').disabled = true;
    },
    pms_info_onSave: function(){
        var pmsrecords = View.getOpenerView().PMSrecords;
        //for view 52 weeks
        var resFromAsign = View.getOpenerView().resFromAsign;
        
        //the below  if and else is for eq tag and rm tag 
        if (View.panels.get("SelectEquipmentLocationProcedure").selectedTabName == "eq_procedure") {
            //get the syncronized record
            var rows = this.eq_procedure_select.getSelectedRows();
            
            var eqps = View.panels.get("eq_procedure_select");
            //to paramater of workflow
            //get the value to paramater of workflow
            var pmsValue = getMultiPmsValue();
            getvalue = '';
			var result = {};
			//Save multi-loading pms records file='PreventiveMaintenanceCommonHandler.java'
            try {
           		result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-saveMultiPMSRecords', pmsValue,this.records);
             } catch (e) {
           		Workflow.handleError(e);
       		 }
            if (result.code == 'executed') {
                var message = getMessage('formSaved');
                //set the all variable is false for drop this time'verity
            }
            else {
                Workflow.handleError(result);
            }
            
        }
        else {
            var pmsRecord = this.syncPanelPmsRecord();
            pmsRecord.setValue("pms.priority", $("taskPriority").value);
            var pmsDS = View.dataSources.get("ds_ab-pm-def-rm_sched_pms");
            try {
                pmsDS.saveRecord(pmsRecord);
            } 
            catch (e) {
                var message = getMessage('errorSave');
                View.showException(e, message);
                return;
            }
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            var rmGrid = View.panels.get('rm_procedure_select');
            rmGrid.refresh();
        }
        //after the details be saved ,refresh the tag  in below three status , from assign  ,from view 52 weeks,define pm schedule
        //1
        if (this.tagresFromAsign == 'true') {
            this.isAlertSaved = true;
            this.eq_procedure_select.refresh(resFromAsign);
            
        }//2
        else 
            if (this.tagpmsrecords == 'true') {
                //when afterSave ='true';updateStyle()could excuted the checked old records again ,or didn't excute it.
                this.afterSave = 'true';
                this.refreshEqAndRmProcedureSelected(pmsrecords);
            }//3
            else {
                this.afterSave = 'true';
                this.dsAbPmDefSchedPms_filterConsole_filter();
                
            }
        this.oldPmsValue = '';
        //records = '';
        //show text message in the form				
        this.pms_info.displayTemporaryMessage(message);
    },
	 
	/*
	* 	Copy current loaded record in PM schedule forms as a new pms recrod, then save it and load it in form. Refresh select grid and set new row as selected.
	*/
    pms_info_onCopy: function(){
		//Add new pms record
		this.	pms_info.refresh(null, true);

		var selectGrid;
		//	For equipment, copy pmp_id and eq_id from previous loaded pms record to new one
		if(this.pmpType=='EQ'){
			this.	pms_info.setFieldValue("pms.pmp_id", this.pms_eq_basic.getFieldValue("pms.pmp_id") );	
			this.	pms_info.setFieldValue("pms.eq_id",this.pms_eq_basic.getFieldValue("pms.eq_id") );	
			this.	pms_info.save();
			selectGrid = this.eq_procedure_select;
		}  
		//	For housekeeping, copy site_id, bl_id.fl_id, rm_id and pmp_id from previous loaded pms record to new one
		else {
			this.	pms_info.setFieldValue("pms.pmp_id", this.pms_rm_basic.getFieldValue("pms.pmp_id") );	
			this.	pms_info.setFieldValue("pms.site_id",this.pms_rm_basic.getFieldValue("pms.site_id") );	
			this.	pms_info.setFieldValue("pms.bl_id",this.pms_rm_basic.getFieldValue("pms.bl_id") );	
			this.	pms_info.setFieldValue("pms.fl_id",this.pms_rm_basic.getFieldValue("pms.fl_id") );	
			this.	pms_info.setFieldValue("pms.rm_id",this.pms_rm_basic.getFieldValue("pms.rm_id") );	
			this.	pms_info.save();
			selectGrid = this.rm_procedure_select;
		}
		//	Refresh select grid to show new row
		selectGrid.refresh();
		//	Get pms_id from new pms record
	   var newPmsId = this.pms_info.getFieldValue("pms.pms_id");
	   var newRowIndex=-1;
	   //loop through grid rows  to get index of  new row and unselect other rows
        selectGrid.gridRows.each(function(row) {
            var pmsId = row.getRecord().getValue('pms.pms_id');
			if(newPmsId == pmsId){
				newRowIndex = row.record.index;
				//row.dom.firstChild.firstChild.checked = true;
			}
			else {
				row.dom.firstChild.firstChild.checked = false;
			}
        });
	    // set new row selected in grid by calling proper API, thus active proper event and its handler function
		if( newRowIndex >=0 ){
			if(this.pmpType=='EQ'){
				selectGrid.selectRowChecked(newRowIndex, true);
			}
			else {
				selectGrid.selectRow(newRowIndex);
				rm_procedure_onClick();
			}
		}
	},
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
    
        var pmsrecords = View.getOpenerView().PMSrecords;
        if (pmsrecords != undefined) {
            pmsrecords = '';
            return;
        }
        else {
        
            if (newTabName == "eq_procedure") {
                var emGrid = View.panels.get('eq_procedure_select');
                
                emGrid.refresh();
            }
            if (newTabName == "rm_procedure") {
                var rmGrid = View.panels.get('rm_procedure_select');
                rmGrid.refresh();
            }
        }
        View.panels.get('pms_info').show(false);
        View.panels.get('pms_eq_basic').show(false);
        View.panels.get('pms_rm_basic').show(false);
        View.panels.get('pms_schedule').show(false);
        View.panels.get('pms_other').show(false);
        this.pmsDetailsHidden = true;
    },
    
    addRestrictionForEqProcedureSelect: function(restriction){
    
        restriction.addClause('pms.interval_1', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_2', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_3', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_4', 0, '&gt;', 'AND');
        
        this.eq_procedure_select.refresh(restriction);
    },
    
    // ----------------------- private function -----------------------------------------------------
    
    
    /**
     * syncronize records of multi panels while in same DataSource to one record.
     * @param {ab.data.record} kbItem
     */
    syncPanelPmsRecord: function(){
        var item = this.pms_info.getRecord();
        
        View.panels.each(function(panel){
            if ((panel.getRecord) && (panel.visible)) {
                panel.getRecord();
                panel.fields.each(function(field){
                    item.setValue(field.getFullName(), field.getStoredValue());
                });
            }
        });
        return item;
    },
    
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    },
    dsAbPmDefSchedPms_filterConsole_onFilter: function(){
        this.dsAbPmDefSchedPms_filterConsole_filter();
        
    },
    //kb:3024292
    dsAbPmDefSchedPms_filterConsole_filter: function(){
        var restriction = this.getRestriction();
        //3024292  . For equipment, the restriction should be combination of equal to eq_std and pmp_id; for Location, the restriction should be combination of equal to bl_id, fl_id, rm _id and pmp_id.
        var pmsBlId = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.bl_id");
        var pmsFlId = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.fl_id");
        var pmsRmId = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.rm_id");
        if (pmsBlId != '') {
            restriction.addClause('pms.bl_id', pmsBlId, '=');
        }
        if (pmsFlId != '') {
            restriction.addClause('pms.fl_id', pmsFlId, '=');
        }
        if (pmsRmId != '') {
            restriction.addClause('pms.rm_id', pmsRmId, '=');
        }
        View.panels.get('rm_procedure_select').refresh(restriction);
        
        var restriction = this.getRestriction();
        
        var pmsEqstd = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("eq.eq_std");
        
        if (pmsBlId != '') {
            restriction.addClause('eq.bl_id', pmsBlId, '=');
        }
        if (pmsFlId != '') {
            restriction.addClause('eq.fl_id', pmsFlId, '=');
        }
        if (pmsRmId != '') {
            restriction.addClause('eq.rm_id', pmsRmId, '=');
        }
        if (pmsEqstd != '') {
            restriction.addClause('eq.eq_std', pmsEqstd, '=');
        }
        View.panels.get('eq_procedure_select').refresh(restriction);
        if (this.checkAll) {
            $('eq_procedure_select_checkAll').checked = true;
        }
    },
    //clear the filter
    dsAbPmDefSchedPms_filterConsole_onClear: function(){
        this.dsAbPmDefSchedPms_filterConsole.setFieldValue("pms.bl_id", '');
        this.dsAbPmDefSchedPms_filterConsole.setFieldValue("pms.fl_id", '');
        this.dsAbPmDefSchedPms_filterConsole.setFieldValue("pms.rm_id", '');
        this.dsAbPmDefSchedPms_filterConsole.setFieldValue("eq.eq_std", '');
        this.dsAbPmDefSchedPms_filterConsole.setFieldValue("pms.pmp_id", '');
        document.getElementById("noschedule").checked = false;
    },
    getRestriction: function(){
        //var intervalFreq = (this.ds_ab-pm-def-sched_pms_console.getRecord()).getValue("pms.interval_freq");
        
        var pmsPmpId = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.pmp_id");
        var interval1 = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.interval_1");
        var interval2 = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.interval_2");
        var interval3 = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.interval_3");
        var interval4 = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("pms.interval_4");
        var restriction = new Ab.view.Restriction();
        if (document.getElementById("noschedule").checked) {
            restriction.addClause('pms.interval_1', 0, '=');
            restriction.addClause('pms.interval_2', 0, '=');
            restriction.addClause('pms.interval_3', 0, '=');
            restriction.addClause('pms.interval_4', 0, '=');
        }
        
        
        if (pmsPmpId != '') {
            restriction.addClause('pms.pmp_id', pmsPmpId, '=');
        }
        
        return restriction;
    },
    
    eq_procedure_afterSelect: function(){
    
        //  this.eq_procedure_select.refresh(restriction);
    }
});
//when on pms was choose ,action name is 'save',else 'save all records'
function saveTitle(records){

    var title = getMessage('title');
    var titleSaveAll = getMessage('titleSaveAll');
    
    var grid = View.panels.get('pms_info');
    var action = grid.actions.get('save');
    
    if (records.length == 1 || records == '') {
        action.setTitle(title);
    }
    else {
        action.setTitle(titleSaveAll);
    }
}

function isFormChanged(newPmsValue, oldPmsValue){
    var isChanged = false;
    if (!View.controllers.items[0]['pmsDetailsHidden']) {
        if (oldPmsValue != '') {
            if (oldPmsValue["pms.dv_id"] != newPmsValue["pms.dv_id"] || oldPmsValue["pms.dp_id"] != newPmsValue["pms.dp_id"] || oldPmsValue["pms.pm_group"] != newPmsValue["pms.pm_group"] || oldPmsValue["pms.date_first_todo"] != newPmsValue["pms.date_first_todo"] ||
            oldPmsValue["pms.date_next_alt_todo"] != newPmsValue["pms.date_next_alt_todo"] ||
            oldPmsValue["pms.hours_est"] != newPmsValue["pms.hours_est"] ||
            oldPmsValue["pms.interval_type"] != newPmsValue["pms.interval_type"] ||
            oldPmsValue["pms.fixed"] != newPmsValue["pms.fixed"] ||
            oldPmsValue["pms.interval_freq"] != newPmsValue["pms.interval_freq"] ||
            oldPmsValue["pms.interval_1"] != newPmsValue["pms.interval_1"] ||
            oldPmsValue["pms.interval_2"] != newPmsValue["pms.interval_2"] ||
            oldPmsValue["pms.interval_3"] != newPmsValue["pms.interval_3"] ||
            oldPmsValue["pms.interval_4"] != newPmsValue["pms.interval_4"] ||
            oldPmsValue["pms.total_unit"] != newPmsValue["pms.total_unit"] ||
            oldPmsValue["pms.units"] != newPmsValue["pms.units"] ||
            oldPmsValue["pms.comments"] != newPmsValue["pms.comments"] ||
            oldPmsValue["pms.priority"] != newPmsValue["pms.priority"]) {
                isChanged = true;
            }
        }
    }
    return isChanged;
}

function updateStyle2(grid, afterSave){
    for (var i = 0; i < grid.rows.length; i++) {
        if (View.controllers.items[0]['afterSave'] != undefined) {
            if (View.controllers.items[0]['afterSave'] == 'true') {
                for (var j = 0; j < View.controllers.items[0]['records'].length; j++) {
                    if (grid.rows[i]['pms.pms_id'] == View.controllers.items[0]['records'][j]['pms.pms_id']) {
                        grid.rows[i].row.dom.firstChild.firstChild.checked = true;
                    }
                }
            }
        }
        
    }
}

function setUnSelectAndSelectAll(grid, YesOrNo){
    for (var i = 0; i < grid.rows.length; i++) {
        grid.rows[i].row.dom.firstChild.firstChild.checked = YesOrNo;
    }
}

function eq_procedure_onClick(pmsrecords, resFromAsign){
    //kb:3024401
    var newPmsValue = getMultiPmsValue();
    var recordsChange = getMessage('recordsChange');
    if (pmsrecords == undefined || resFromAsign == undefined || pmsrecords != undefined || (resFromAsign != undefined && View.controllers.items[0]['isAlertSaved'] == false)) {
        if (newPmsValue != undefined && View.controllers.items[0]['oldPmsValue'] != undefined) {
            if (isFormChanged(newPmsValue, View.controllers.items[0]['oldPmsValue'])) {
                var truthBeTold = window.confirm(recordsChange);
                if (!truthBeTold) {
                    //kb:3024400
                    var grid = View.panels.get('eq_procedure_select');
                    if (View.controllers.items[0]['checkAll']) {
                        $('eq_procedure_select_checkAll').checked = true;
                        setUnSelectAndSelectAll(grid, true);
                    }
                    else {
                        $('eq_procedure_select_checkAll').checked = false;
                        setUnSelectAndSelectAll(grid, false);
                        //grid.setAllRowsSelected(false);
                        updateStyle2(grid, 'true');
                    }
                    
                    return;
                }
            }
        }
    }//kb:3024411
    View.controllers.items[0]['isAlertSaved'] = false;
    View.controllers.items[0]['records'] = '';
    var eqps = View.panels.get("eq_procedure_select");
    View.controllers.items[0]['records'] = getPrimaryKeysForSelectedRows(eqps);
    var rows = eqps.getSelectedRows();
    
    //kb:3024411
    
    if (View.controllers.items[0]['records'].length == 0) {
        View.panels.get('pms_info').show(false);
        View.panels.get('pms_eq_basic').show(false);
        View.panels.get('pms_rm_basic').show(false);
        View.panels.get('pms_schedule').show(false);
        View.panels.get('pms_other').show(false);
        View.controllers.items[0]['pmsDetailsHidden'] = true;
        if (View.controllers.items[0]['tagpmsrecords'] == 'true') {
            $("instructions").innerHTML = "";
        }
        return;
        
    }
    
    if (View.controllers.items[0]['records'].length == 1) {
        //get the old record for the compare ,wether the value is changed
        
        var pmsID = rows[0]['pms.pms_id'];
        updateIntervalTypeOptions(false);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pms.pms_id", pmsID, "=", true);
        refreshPmsPanel(restriction, "EQ");
        saveTitle(View.controllers.items[0]['records']);
        
        var pmsEqBasic = View.panels.get('pms_eq_basic');
        var pmsSchedule = View.panels.get('pms_schedule')
        var pmsOther = View.panels.get('pms_other');
        pmsEqBasic.showField('pms.pms_id', true);
        pmsEqBasic.showField('pms.eq_id', true);
        pmsSchedule.showField('pms.date_last_completed', true);
        pmsSchedule.showField('pms.date_next_todo', true);
        pmsSchedule.showField('pms.hours_calc', true);
        pmsOther.showField('pms.meter_last_pm', true);
        pmsOther.showField('pms.nactive', true);
        View.controllers.items[0]['pmsDetailsHidden'] = false;
    }
    else {
        //if the form be changed ,pop-up the warning
        
        updateIntervalTypeOptions(false);
       var records= View.controllers.items[0]['records']
	   var result = {};
	   //This workflow is for compare the field value ,if it show the same value that each field of
      // all records ,return the value ,or show string 'varies' Text file='PreventiveMaintenanceCommonHandler.java'
   		 try{
        		result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-loadMultiPMSRecords', records);
			}catch(e){
				Workflow.handleError(e);
			}
        
        
        if (result.code == 'executed') {
        
            var res = eval('(' + result.jsonExpression + ')');
            //set the value when load the pmstable'panel
            setMultiPmsValue('', res, rows);
            hiddenOnlyField('pms_schedule', 'pms.date_last_completed');
            
        }
        else {
            Workflow.handleError(result);
        }
        View.controllers.items[0]['pmsDetailsHidden'] = false;
    }
    if ($('eq_procedure_select_checkAll').checked) {
        View.controllers.items[0]['checkAll'] = true;
    }
    else {
        View.controllers.items[0]['checkAll'] = false;
    }
    View.controllers.items[0]['oldPmsValue'] = '';
    View.controllers.items[0]['oldPmsValue'] = getMultiPmsValue();
    //kb:3024583
    if (View.controllers.items[0]['tagpmsrecords'] == 'true') {
        $("instructions").innerHTML = getMessage("instructions1") + "<br>" + getMessage("instructions2") + "<br>&nbsp;" + getMessage("instructions21") + "<br>" + getMessage("instructions3") + "<br>&nbsp;" + getMessage("instructions31");
    }
    saveTitle(View.controllers.items[0]['records']);
	//after selection change in  select grid, determine to enable the 'Copy' action or not
	enableCopyButton(View.panels.get("eq_procedure_select"));
}

function hiddenOnlyField(panel, fieldName){
    View.panels.get('pms_schedule').fields.get('pms.interval_4').fieldDef.required = true;
    
}

function refreshPmsPanel1(restriction, pmpType, interval1, pmsid){
    if (!restriction) {
        return;
    }
    
    var pmsInfoPanel = View.panels.get('pms_info');
    var pmsEqBasicPanel = View.panels.get('pms_eq_basic');
    var pmsRmBasicPanel = View.panels.get('pms_rm_basic');
    var pmsSchedulePanel = View.panels.get('pms_schedule');
    var pmsOtherPanel = View.panels.get('pms_other');
    pmsInfoPanel.refresh(restriction);
    var record = pmsInfoPanel.getRecord();
    pmsEqBasicPanel.setRecord(record);
    pmsRmBasicPanel.setRecord(record);
    pmsSchedulePanel.setRecord(record);
    pmsOtherPanel.setRecord(record);
    
    var isEq = ("EQ" == pmpType) ? true : false;
    pmsEqBasicPanel.show(isEq);
    pmsRmBasicPanel.show(!isEq);
    pmsSchedulePanel.show(true);
    pmsOtherPanel.show(true);
    $("taskPriority").value = record.values["pms.priority"];
    var openerController = View.controllers.get("defPMSched");
    openerController.showInformationInForm(openerController, pmsInfoPanel, "");
    openerController.pmpType = pmpType;
    
}

function refreshPmScheduleDetails(restriction0, restriction1, restriction2, restriction3, restriction4){

    var pmsInfoPanel = View.panels.get('pms_info');
    var pmsEqBasicPanel = View.panels.get('pms_eq_basic');
    var pmsRmBasicPanel = View.panels.get('pms_rm_basic');
    var pmsSchedulePanel = View.panels.get('pms_schedule');
    var pmsOtherPanel = View.panels.get('pms_other');
    
    pmsInfoPanel.refresh(restriction0);
    pmsEqBasicPanel.refresh(restriction1);
    pmsRmBasicPanel.refresh(restriction2);
    pmsSchedulePanel.refresh(restriction3);
    pmsOtherPanel.refresh(restriction4);
    
    var isEq = ("EQ" == pmpType) ? true : false;
    pmsEqBasicPanel.show(isEq);
    pmsRmBasicPanel.show(!isEq);
    pmsSchedulePanel.show(true);
    pmsOtherPanel.show(true);
    
    var openerController = View.controllers.get("defPMSched");
    openerController.showInformationInForm(openerController, pmsInfoPanel, "");
    openerController.pmpType = pmpType;
}

function getPrimaryKeysForSelectedRows(grid){

    var selectedRows = new Array();
    
    var dataRows = grid.getDataRows();
    for (var r = 0; r < dataRows.length; r++) {
        var dataRow = dataRows[r];
        
        var selectionCheckbox = dataRow.firstChild.firstChild;
        if (selectionCheckbox.checked) {
            var rowKeys = grid.getPrimaryKeysForRow(grid.rows[r]);
            selectedRows.push(rowKeys);
        }
    }
    return selectedRows;
}

function rm_procedure_onClick(){

    saveTitle('');
    //1 get pms_id 
    var grid = View.panels.get('rm_procedure_select');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var pmsID = selectedRow["pms.pms_id"];
    
    updateIntervalTypeOptions(true);
    //2 refresh the form panels
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.pms_id", pmsID, "=", true);
    refreshPmsPanel(restriction, "HK");
    if (View.controllers.items[0]['tagpmsrecords'] == 'true') {
        $("instructions").innerHTML = getMessage("instructions1") + "<br>" + getMessage("instructions2") + "<br>&nbsp;&nbsp;" + getMessage("instructions21") + "<br>" + getMessage("instructions3") + "<br>&nbsp;&nbsp;" + getMessage("instructions31");
    }
}

//update the intervalTypefield of pms 
function updateIntervalTypeOptions(isLocationPms){
    var intervalType = View.panels.get("pms_schedule").getFieldElement("pms.interval_type");
    var options = intervalType.options;
    if (isLocationPms) {
        if (getIndexofValue("i", options) != -1) {
            intervalType.remove(getIndexofValue("i", options));
            intervalType.remove(getIndexofValue("h", options));
            intervalType.remove(getIndexofValue("e", options));
        }
    }
    else {
        if (getIndexofValue("i", options) == -1) {
            if (getIndexofValue("a", options) != -1) {
                intervalType.remove(getIndexofValue("a", options));
            }
            var option = new Option(getMessage("miles"), "i");
            intervalType.options.add(option);
            option = new Option(getMessage("hours"), "h");
            intervalType.options.add(option);
            option = new Option(getMessage("meter"), "e");
            intervalType.options.add(option);
            option = new Option(getMessage("manual"), "a");
            intervalType.options.add(option);
        }
    }
}

function getIndexofValue(value, options){
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == value) {
            return i;
        }
    }
    return -1;
}

function refreshPmsPanel(restriction, pmpType){
    if (!restriction) {
        return;
    }
    
    var pmsInfoPanel = View.panels.get('pms_info');
    var pmsEqBasicPanel = View.panels.get('pms_eq_basic');
    var pmsRmBasicPanel = View.panels.get('pms_rm_basic');
    var pmsSchedulePanel = View.panels.get('pms_schedule');
    var pmsOtherPanel = View.panels.get('pms_other');
    pmsInfoPanel.refresh(restriction);
    
    var record = pmsInfoPanel.getRecord();
    
    pmsEqBasicPanel.setRecord(record);
    pmsRmBasicPanel.setRecord(record);
    pmsSchedulePanel.setRecord(record);
    pmsOtherPanel.setRecord(record);
    $("taskPriority").value = record.values["pms.priority"];
    var isEq = ("EQ" == pmpType) ? true : false;
    pmsEqBasicPanel.show(isEq);
    pmsRmBasicPanel.show(!isEq);
    pmsSchedulePanel.show(true);
    pmsOtherPanel.show(true);
    
    var openerController = View.controllers.get("defPMSched");
    openerController.showInformationInForm(openerController, pmsInfoPanel, "");
    openerController.pmpType = pmpType;
}

function setMultiPmsValue(setvalue, res, rows){
    var pmsid = res.pms_id;
    
    var pmpid = res.pmp_id;
    var eqid = res.eq_id;
    var dvid = res.dv_id;
    var dpid = res.dp_id;
    
    var pmgroup = res.pm_group;
    //pms_rm_basic
    var siteid = res.site_id;
    var blid = res.bl_id;
    var flid = res.fl_id;
    var rmid = res.rm_id;
    //FormattingDate(day, month, year, format)
    var datefirsttodo = res.date_first_todo;
    //kb:3024381   ,it was caused by new build change the showfield method 
    var pmsEqBasic = View.panels.get('pms_eq_basic');
    var pmsSchedule = View.panels.get('pms_schedule')
    var pmsOther = View.panels.get('pms_other')
    pmsEqBasic.showField('pms.pms_id', false);
    pmsEqBasic.showField('pms.eq_id', false);
    pmsSchedule.showField('pms.date_last_completed', false);
    pmsSchedule.showField('pms.date_next_todo', false);
    pmsSchedule.showField('pms.hours_calc', false);
    pmsOther.showField('pms.meter_last_pm', false);
    pmsOther.showField('pms.nactive', false);
    //when pmsDetailsHidden =false ,say the detail hidden ,so didn't compare the new and old value
    pmsDetailsHidden = false;
    
    var pmsOther = View.panels.get('pms_other');
    var pmsschedule = View.panels.get('pms_schedule');
   
	var variesValue = 	  View.controllers.get("defPMSched").variesValue;
	var variesText = 	  View.controllers.get("defPMSched").variesText;

    if (datefirsttodo != variesValue && datefirsttodo != '') {
        var datefirsttodoarr = datefirsttodo.split('-');
        var day = parseInt(datefirsttodoarr[2], 10);
        var month = parseInt(datefirsttodoarr[1], 10);
        var year = parseInt(datefirsttodoarr[0], 10);
        
        //kb:3037348,by comments about date format problem.
        datefirsttodo =returnFromIsoDate(day,month,year);
        datefirsttodo.trim();
        
    }
    
    var datelastcompleted = res.date_last_completed;
    var datenexttodo = res.date_next_todo;
    var datenextalttodo = res.date_next_alt_todo;
    if (datenextalttodo != variesValue && datenextalttodo != '') {
        var datenextalttodo = datenextalttodo.split('-');
        var day = parseInt(datenextalttodo[2], 10);
        var month = parseInt(datenextalttodo[1], 10);
        var year = parseInt(datenextalttodo[0], 10);
        
        //kb:3037348,by comments about date format problem.
        datenextalttodo =returnFromIsoDate(day,month,year);
        datenextalttodo.trim();
        
    }
    var hourscalc = res.hours_calc;
    var hoursest = res.hours_est;
    var intervaltype = res.interval_type;
    var fixed = res.fixed;
    var intervalfreq = res.interval_freq;
    
    var interval1 = res.interval_1;
    var interval2 = res.interval_2;
    
    var interval3 = res.interval_3;
    var interval4 = res.interval_4;
    var meterlastpm = res.meter_last_pm;
    var nactive = res.nactive;
    var totalunit = res.total_unit;
    var units = res.units;
    var priority = res.priority;
    var comments = res.comments;
    var pmsID = rows[0]['pms.pms_id'];
    updateIntervalTypeOptions(false);
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.pms_id", pmsID, "=", true);
    refreshPmsPanel1(restriction, "EQ", interval1, pmsid);
    res = "";
    if (variesValue == dvid) {
        $("pms_eq_basic_pms.dv_id").value = variesText;
    }
    else {
        $("pms_eq_basic_pms.dv_id").value = dvid;
    }
    if (variesText == dpid) {
        $("pms_eq_basic_pms.dp_id").value = variesText;
    }
    else {
        $("pms_eq_basic_pms.dp_id").value = dpid;
    }
    if (variesValue == pmgroup) {
        $("pms_eq_basic_pms.pm_group").value = variesText;
    }
    else {
        $("pms_eq_basic_pms.pm_group").value = pmgroup;
    }
    if (variesValue == datefirsttodo) {
        $("pms_schedule_pms.date_first_todo").value = variesText;
    }
    else {
        $("pms_schedule_pms.date_first_todo").value = datefirsttodo;
    }
    if (variesValue == datenextalttodo) {
        $("pms_schedule_pms.date_next_alt_todo").value = variesText;
    }
    else {
        $("pms_schedule_pms.date_next_alt_todo").value = datenextalttodo;
    }
    if (variesValue == hoursest) {
        $("pms_schedule_pms.hours_est").value = variesText;
    }
    else {
        $("pms_schedule_pms.hours_est").value = hoursest;
    }
    
    
    if (fixed == variesValue) {
        var selectElement = document.getElementById("pms_schedule_pms.fixed");
        
        if (!isExistsVaries(selectElement)) {
            var option = new Option(variesText, variesValue);
            selectElement.options.add(option);
            selectElement.value = variesValue;
        }
        selectElement.value = variesValue;
    }
    
    // $("pms_schedule_pms.interval_freq").value = intervalfreq;
    if (intervaltype == variesValue) {
        var selectElement = document.getElementById("pms_schedule_pms.interval_type");
        if (!isExistsVaries(selectElement)) {
            var option = new Option(variesText, variesValue);
            selectElement.options.add(option);
            selectElement.value = variesValue;
        }
        selectElement.value = variesValue;
    }
    
    if (priority == variesValue) {
        var selectElement = document.getElementById("taskPriority");
        if (!isExistsVaries(selectElement)) {
            var option = new Option(variesText, variesValue);
            selectElement.options.add(option);
            selectElement.value = variesValue;
        }
        selectElement.value = variesValue;
    }
    if (intervalfreq == variesValue) {
    
        var selectElement = $("pms_schedule_pms.interval_freq");
        
        if (!isExistsVaries(selectElement)) {
            var option = new Option(variesText, variesValue);
            selectElement.options.add(option);
            selectElement.value = variesValue;
        }//give the current option value;
        selectElement.value = variesValue;
    }
    if (interval1 == variesValue) {
        $("pms_schedule_pms.interval_1").value = variesText;
    }
    else {
        $("pms_schedule_pms.interval_1").value = interval1;
    }
    if (interval2 == variesValue) {
        $("pms_schedule_pms.interval_2").value = variesText;
    }
    else {
        $("pms_schedule_pms.interval_2").value = interval2;
    }
    if (interval2 == variesValue) {
        $("pms_schedule_pms.interval_2").value = variesText;
    }
    else {
        $("pms_schedule_pms.interval_2").value = interval2;
    }
    if (interval3 == variesValue) {
        $("pms_schedule_pms.interval_3").value = variesText;
    }
    else {
        $("pms_schedule_pms.interval_3").value = interval3;
    }
    if (interval4 == variesValue) {
        $("pms_schedule_pms.interval_4").value = variesText;
    }
    else {
        $("pms_schedule_pms.interval_4").value = interval4;
    }
    if (totalunit == variesValue) {
        $("pms_other_pms.total_unit").value = variesText;
    }
    else {
        $("pms_other_pms.total_unit").value = totalunit;
    }
    if (units == variesValue) {
        $("pms_other_pms.units").value = variesText;
    }
    else {
        $("pms_other_pms.units").value = units;
    }
    if (comments == variesValue) {
        $("pms_other_pms.comments").value = variesText;
    }
    else {
        $("pms_other_pms.comments").value = comments;
    }
    
    
    setvalue["pms.dv_id"] = dvid;
    setvalue["pms.dp_id"] = dpid;
    setvalue["pms.pm_group"] = pmgroup;
    setvalue["pms.date_first_todo"] = datefirsttodo;
    setvalue["pms.date_next_alt_todo"] = datenextalttodo;
    setvalue["pms.hours_est"] = hoursest;
    setvalue["pms.interval_type"] = intervaltype;
    setvalue["pms.fixed"] = fixed;
    
    setvalue["pms.interval_freq"] = intervalfreq;
    setvalue["pms.interval_1"] = interval1;
    setvalue["pms.interval_2"] = interval2;
    setvalue["pms.interval_3"] = interval3;
    setvalue["pms.interval_4"] = interval4;
    setvalue["pms.total_unit"] = totalunit;
    
    setvalue["pms.units"] = units;
    setvalue["pms.comments"] = comments;
    if (priority == variesValue) {
        $("taskPriority").value = variesText;
    }
    else {
        $("taskPriority").value = priority;
    }
}

/**
 * Reback date format from iso date by arrDateShortPattern;
 * @param day
 * @param month
 * @param year
 * @returns {String}
 */
function returnFromIsoDate(day,month,year){
	var date="";
	for(var i=0;i<3;i++){
		var temp = arrDateShortPattern[i];
		if(temp!=null){
			if(i!=0){
				if(temp.indexOf("Y")>=0){
					date=date+"/"+year ;}
				else if(temp.indexOf("M")>=0){
					date=date+"/"+month ;}
				else if(temp.indexOf("D")>=0){
					date=date+"/"+day ;}
			}
			else{
				if(temp.indexOf("Y")>=0){
					date=year ;}
				else if(temp.indexOf("M")>=0){
					date=month ;}
				else if(temp.indexOf("D")>=0){
					date=day ;}
			}
		}
	}
	return date;
}


//use for the selectlist ,if it return true  ,proveing the selectlist has '<varies>' option
function isExistsVaries(selectElement){
    if (selectElement.length > 0) {
        if (selectElement.options[selectElement.length - 1].value ==View.controllers.get("defPMSched").variesValue) {
            return true;
        }
    }
}

//get the pmsvalue when save the selected pms records
function getMultiPmsValue(){

    var pmseqbasic = View.panels.get("pms_eq_basic");
    var dv_id = pmseqbasic.getFieldValue("pms.dv_id");
    var dp_id = pmseqbasic.getFieldValue("pms.dp_id");
    var pm_group = pmseqbasic.getFieldValue("pms.pm_group");
    var pms_id = pmseqbasic.getFieldValue("pms.pms_id");
    var pmp_id = pmseqbasic.getFieldValue("pms.pmp_id");
    var eq_id = pmseqbasic.getFieldValue("pms.eq_id");
    
    var pmsschedule = View.panels.get("pms_schedule");
    
    var date_first_todo = $("pms_schedule_pms.date_first_todo").value;
    var datefirsttodo_regexp = date_first_todo.match(defPMSchedController.regexp); 
    
    if (datefirsttodo_regexp==null) {
    
        date_first_todo = getDateWithISOFormat(date_first_todo);
    }
    
    var date_last_completed = pmsschedule.getFieldValue("pms.date_last_completed");
    var date_next_todo = pmsschedule.getFieldValue("pms.date_next_todo");
    
    var date_next_alt_todo = $("pms_schedule_pms.date_next_alt_todo").value;
    
    
    var date_next_alt_todo_regexp = date_next_alt_todo.match(defPMSchedController.regexp); 
    
    if (date_next_alt_todo_regexp ==null) {
        date_next_alt_todo = getDateWithISOFormat(date_next_alt_todo);
    }
    
    var hours_calc = pmsschedule.getFieldValue("pms.hours_calc");
    var hours_est = pmsschedule.getFieldValue("pms.hours_est");
    var interval_type = pmsschedule.getFieldValue("pms.interval_type");
    
    var fixed = pmsschedule.getFieldValue("pms.fixed");
    var interval_freq = pmsschedule.getFieldValue("pms.interval_freq");
    
    var interval_1 = pmsschedule.getFieldValue("pms.interval_1");
    var interval_2 = pmsschedule.getFieldValue("pms.interval_2");
    var interval_3 = pmsschedule.getFieldValue("pms.interval_3");
    var interval_4 = pmsschedule.getFieldValue("pms.interval_4");
    
    var pmsother = View.panels.get("pms_other");
    
    var nactive = pmsother.getFieldValue("pms.nactive");
    
    var total_unit = pmsother.getFieldValue("pms.total_unit");
    
    var units = pmsother.getFieldValue("pms.units");
    
    var comments = pmsother.getFieldValue("pms.comments");
    var priority = $("taskPriority").value;
    
    
    var fieldAndValueArray=[
	                            ['dv_id',dv_id],
	                            ['dp_id',dp_id],
	                            ['pm_group',pm_group],
	                            ['date_first_todo',date_first_todo],
	                            ['date_next_alt_todo',date_next_alt_todo],
	                            ['hours_est',hours_est],
	                            ['interval_type',interval_type],
	                            ['fixed',fixed],
	                            ['interval_freq',interval_freq],
	                            ['interval_1',interval_1],
	                            ['interval_2',interval_2],
	                            ['interval_3',interval_3],
	                            ['interval_4',interval_4],
	                            ['units',units],
	                            ['comments',comments],
	                            ['priority',priority]
                            ];
    
    return setFieldValueForGivenField(fieldAndValueArray);
    
}


/**
 * Convert paramter when field value from form is varies.
 * @param fieldAndValueArray
 * @returns {Object}
 */
function setFieldValueForGivenField(fieldAndValueArray){
	var pmsValue = new Object();
	for(var i=0;i<fieldAndValueArray.length;i++){
		
		var field=fieldAndValueArray[i][0];
		var value=fieldAndValueArray[i][1];
		
		if (value.match(defPMSchedController.regexp) !=null) {
	   	 	pmsValue["pms."+field] = View.controllers.get("defPMSched").variesValue;
	    }else{
	    	pmsValue["pms."+field] = value;
	    }
	}
	return pmsValue;
}
function isFormValuesChanged(){
    //kb:3024333 ,
    FormValuesChanged = true;
    
}

function isFormValuesChanged2(){
    FormValuesChanged = true;
    
}

function getRetrictionFromParentView(pmsrecords){
    var pmsRestr = new Object();
    pmsRestr["pmpstr.tr_id"] = pmsrecords['pmpstr.tr_id'];
    pmsRestr["pmressum.date_todo.to"] = pmsrecords['pmressum.date_todo.to'];
    
    pmsRestr["pmressum.date_todo.from"] = pmsrecords['pmressum.date_todo.from'];
    
    pmsRestr["pmsd.date_todo"] = pmsrecords['pmsd.date_todo'];
    pmsRestr["weekormonth"] = pmsrecords['weekormonth'];
    if (pmsrecords['pms.pm_group'] != "") {
        pmsRestr["pms.pm_group"] = pmsrecords['pms.pm_group'];
    }
    if (pmsrecords['pms.bl_id'] != "") {
        pmsRestr["pms.bl_id"] = pmsrecords['pms.bl_id'];
    }
    if (pmsrecords['pms.fl_id'] != "") {
        pmsRestr["pms.fl_id"] = pmsrecords['pms.fl_id'];
    }
    if (pmsrecords['pms.site_id'] != "") {
        pmsRestr["pms.site_id"] = pmsrecords['pms.site_id'];
    }
	if (pmsrecords['pmp.tr_id'] != "") {
        pmsRestr["pmp.tr_id"] = pmsrecords['pmp.tr_id'];
    }
    return pmsRestr;
    
}

/*
*  Enable 'Copy' action only when select one grid row ( pms record).
*/
function enableCopyButton(selectGrid){
	//if select grid is for equipment then judge if currently select only one row 
	if(selectGrid.id=='eq_procedure_select'){
		var selections = selectGrid.getSelectedRows().length;
		// only enable 'Copy' button when one pms record is selected and showed in form 
		if(selections==1){
				View.panels.get("pms_info").enableButton("copy",true);		
		}	else {
				View.panels.get("pms_info").enableButton("copy",false);		
		}
	} 
	// if select grid is for housekeeping then just enable 'Copy' button since this grid is singled-selected 
	else {
		View.panels.get("pms_info").enableButton("copy",true);		
	}
}

