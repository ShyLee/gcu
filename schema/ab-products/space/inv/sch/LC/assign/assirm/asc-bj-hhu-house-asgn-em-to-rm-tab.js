var controller = View.createController('abSpAsgnEmToRm_Controller', {
	emId:"",
	emName:"",
	activityLogId:"",
    afterViewLoad: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
        // Specify instructions for the Drawing Control
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectEm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_emSelect", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_drawingPanel", "onclick", getMessage('selectAnotherEm'));
        this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
        
        
        this.abSpAsgnEmToRm_emSelect.addEventListener('onMultipleSelectionChange', onEmSelectionChange);
        
        this.emId=this.tabs.emId;
        this.emName=this.tabs.emName;
        this.activityLogId=this.tabs.activityLogId;
        this.abSpAsgnEmToRm_emSelect.addParameter('emId', " em.em_id= '" + this.emId + "'");
    },
    
    afterInitialDataFetch: function(){
        this.abSpAsgnEmToRm_emSelect.enableSelectAll(false);
    },
    updateActivityLog:function(){
    	 //更新 activity_log表中的verified_by=‘yes’
    	var restriction=new Ab.view.Restriction();
		var account = View.dataSources.get("activity_log_ds");
		restriction.addClause("activity_log.activity_log_id",this.activityLogId,"=");
		
		var record=account.getRecord(restriction);
        record.setValue("activity_log.verified_by","yes");
        account.saveRecord(record);
    },
    abSpAsgnEmToRm_blTree_onBack:function(){
    	var tabName = 'selectLcTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
    }
});

var emAssigns = [];

/**
 * event handler when click row of grid 'abSpAsgnEmToRm_emSelect'.
 */
function onEmSelectionChange(rowbbb){

    emAssigns = [];
    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    if (cp.isLoadedDrawing) {
        var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
        var rows = grid.getSelectedRows();
        if (rows.length < 1) {
            cp.clearAssignCache(true);
            cp.processInstruction("ondwgload", "");
            return;
        }
        
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            cp.processInstruction('abSpAsgnEmToRm_emSelect', 'onclick');
            
            var emAssign = new Ab.data.Record();
            emAssign.setValue("em.em_id", row['em.em_id']);
			emAssign.setValue("em.name", row['em.name']);
            emAssign.setValue("em.bl_id_current", row['em.bl_id']);
            emAssign.setValue("em.fl_id_current", row['em.fl_id']);
            emAssign.setValue("em.rm_id_current", row['em.rm_id']);
            emAssigns.push(emAssign);
        }
        
        cp.setToAssign("em.em_id", emAssigns[0].getValue('em.em_id'));
    }
}

/**
 * event handler when click floor node of the tree 'abSpAsgnEmToRm_blTree'.
 * @param {Object} ob
 */
function onTreeClick(ob){
    var cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['rm.fl_id'];
    var dwgName = currentNode.data['rm.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    cp.addDrawing(dcl);
    setSelectability(ob.restriction);
    cp.isLoadedDrawing = true;
    cp.clearAssignCache(true);
    emAssigns = []
    View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
}

/**
 * event handler when click room of the drawing panel 'abSpAsgnEmToRm_drawingPanel'.
 * @param {Object} ob
 */
function onDwgPanelClicked(pk, selected, color){
    var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
    var rows = grid.getSelectedRows();
    if (rows.length > 0) {
        addAssignmentRows(pk);
    }
    
    if (selected) {
        View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 500,
            height: 350,
			blId: pk[0],
            flId: pk[1],
            rmId: pk[2],
            closeButton: false
        });
    }
    View.getControl('', 'abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
}


/**
 * check is the room is full.
 * @param {Object} pk
 * @return {boolean} isFull
 */
function checkCount(pk){
    var isFull = false;
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    
    var availableCount = getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - getRoomCountVal(blId, flId, rmId, 'rm.count_em');
    var newAssignedCount = 0;
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    grid.show(true);
    var rows = grid.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row['em.bl_id'] == blId && row['em.fl_id'] == flId && row['em.rm_id'] == rmId && !isSelectedEm(row['em.em_id'])) {
            newAssignedCount++;
        }
    }
    if ((availableCount - newAssignedCount - emAssigns.length) < 0) {
        isFull = true;
    }
    return isFull;
}

function isSelectedEm(emId){
    var isSelected = false;
    for (var i = 0; i < emAssigns.length; i++) {
        if (emId == emAssigns[i].getValue('em.em_id')) {
            isSelected = true;
            break;
        }
    }
    return isSelected;
}

function submitChanges(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    if (grid.rows.length < 1) {
        View.showMessage(getMessage('noEmSelected'));
        return;
    }
    View.openProgressBar(getMessage('saving'));
    doSubmitChanges.defer(500);
    //更新 activity_log表中的verified_by=‘yes’
    controller.updateActivityLog();
}

/**
 * save the assignment.
 */
function doSubmitChanges(){
    var dsEmp = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_em");
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    
    try {
    
        for (var i = 0; i < grid.gridRows.length; i++) {
            var row = grid.gridRows.items[i];
            
            var emId = row.getFieldValue("em.em_id");
            var buildingId = row.getFieldValue("em.bl_id");
            var floorId = row.getFieldValue("em.fl_id");
            var roomId = row.getFieldValue("em.rm_id");
            var buildingIdCurrent = row.getFieldValue("em.bl_id_current");
            var floorIdCurrent = row.getFieldValue("em.fl_id_current");
            var roomIdCurrent = row.getFieldValue("em.rm_id_current");
            
            // First set the new room for the employee
            var rec = new Ab.data.Record();
            rec.isNew = false;
            rec.setValue("em.em_id", emId);
            rec.setValue("em.bl_id", buildingId);
            rec.setValue("em.fl_id", floorId);
            rec.setValue("em.rm_id", roomId);
            
            rec.oldValues = new Object();
            rec.oldValues["em.em_id"] = emId;
            rec.oldValues["em.bl_id"] = buildingIdCurrent;
            rec.oldValues["em.fl_id"] = floorIdCurrent;
            rec.oldValues["em.rm_id"] = roomIdCurrent;
            
            dsEmp.saveRecord(rec);
            
            // Update the rm.count_em value
            setRoomEmpCnt(buildingId, floorId, roomId, 1);
            if (buildingIdCurrent && floorIdCurrent && roomIdCurrent) {
                setRoomEmpCnt(buildingIdCurrent, floorIdCurrent, roomIdCurrent, -1);
            }
        }
        
        grid.removeRows(0);
        grid.update();
        View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
        var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.clearAssignCache(true);
        View.closeProgressBar();
    } 
    catch (e) {
        View.closeProgressBar();
        Workflow.handleError(e);
    }
}

/**
 * change the room employee count in database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {int} cnt
 */
function setRoomEmpCnt(buildingId, floorId, roomId, cnt){
    var rec = new Ab.data.Record();
    
    var cntOld = getRoomCountVal(buildingId, floorId, roomId, 'rm.count_em');
    cnt = cntOld + cnt;
    if (cnt < 0) 
        cnt = 0;
    
    rec.isNew = false;
    rec.setValue("rm.bl_id", buildingId);
    rec.setValue("rm.fl_id", floorId);
    rec.setValue("rm.rm_id", roomId);
    rec.setValue("rm.count_em", cnt);
    
    rec.oldValues = new Object();
    rec.oldValues["rm.bl_id"] = buildingId;
    rec.oldValues["rm.fl_id"] = floorId;
    rec.oldValues["rm.rm_id"] = roomId;
    rec.oldValues["rm.count_em"] = cntOld;
	var result;
    try {
        View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt").saveRecord(rec);
		
		//调用workFlow更改 有变动房间号的（em表）的人均面积
		result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateEmArea', buildingId, floorId, roomId);
    } 
    catch (e) {
        View.showException(e);
    }
    
}


/**
 * get the room employee count or employee capacity from database.
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName rm.count_em or rm.cap_em
 * @return {int} cnt
 */
function getRoomCountVal(buildingId, floorId, roomId, fieldName){
    var cnt = 0;
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        var recs = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt").getRecords(restriction);
        if (recs != null) 
            cnt = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showException(e);
    }
    
    return parseInt(cnt, 10);
}


/**
 * remove selected  employee assignment from the grid 'abSpAsgnEmToRm_emAssigned'.
 */
function removeEmpFromList(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var row = grid.rows[grid.selectedRowIndex];
    View.panels.get('abSpAsgnEmToRm_drawingPanel').unassign('em.em_id', row['em.em_id']);
    grid.removeGridRow(row.row.getIndex());
    grid.update();
}

/**
 * unassign the selected employee.
 */
function unAssign(){
    var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
    var rows = grid.getSelectedRows();
    if (rows.length < 1) {
        View.showMessage(getMessage('noEmSelected'));
        return;
    }
    
    var message = getMessage('confirmMessage');
    
    View.confirm(message, function(button){
        if (button == 'yes') {
            try {
                View.openProgressBar(getMessage('saving'));
                completeEmpUnassign.defer(500, this, [rows]);
            } 
            catch (e) {
                View.closeProgressBar();
                View.showMessage('error', '', e.message, e.data);
            }
        }
    });
}

/**
 * clear location info of the selected employee and changed the rm.count_em.
 * @param {Object} row
 */
function completeEmpUnassign(rows){
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!row['em.rm_id']) 
            continue;
        
        var rec = row.row.getRecord(['em.em_id', 'em.bl_id', 'em.fl_id', 'em.rm_id']);
        rec.setValue('em.bl_id', '');
        rec.setValue('em.fl_id', '');
        rec.setValue('em.rm_id', '');
        
        View.dataSources.get("ds_ab-sp-asgn-em-to-rm_grid_em").saveRecord(rec);
        
        var buildingId = row['em.bl_id'];
        var floorId = row['em.fl_id'];
        var roomId = row['em.rm_id'];
        setRoomEmpCnt(buildingId, floorId, roomId, -1);
    }
    
    View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    if (cp.isLoadedDrawing) {
        cp.clearAssignCache(true);
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.processInstruction("ondwgload", "");
    }
    clearChanges();
    View.closeProgressBar();
}

/**
 * clear all employee assignments and clear the highlight.
 */
function clearChanges(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    grid.removeRows(0);
    grid.update();
}


/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction){
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel')
    var rmRecords = View.dataSources.get('ds_ab-sp-asgn-em-to-rm_drawing_availRm').getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var occupiable = record.getValue('rmcat.occupiable');
        if (occupiable == '0') {
            var blId = record.getValue('rm.bl_id');
            var flId = record.getValue('rm.fl_id');
            var rmId = record.getValue('rm.rm_id');
            var opts_selectable = new DwgOpts();
            opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }
    }
}

/**
 * add an assignment row.
 * @param {Array} restriction
 */
function addAssignmentRows(pk){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        var bFound = false;
        for (var j = 0; j < grid.rows.length && !bFound; j++) {
            var row = grid.rows[j];
            if (row["em.em_id"] == emAssign.getValue('em.em_id')) {
                grid.removeGridRow(j);
                bFound = true;
            }
        }
        
        emAssign.setValue("em.bl_id", pk[0]);
        emAssign.setValue("em.fl_id", pk[1]);
        emAssign.setValue("em.rm_id", pk[2]);
        grid.addGridRow(emAssign);
    }
    
    View.panels.get('abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
    grid.sortEnabled = false;
    grid.update();
}
