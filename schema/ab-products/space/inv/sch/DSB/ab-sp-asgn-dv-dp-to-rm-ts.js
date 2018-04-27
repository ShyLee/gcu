var controller = View.createController('abSpAsgnRmDpToRm_Control', {
	onclickedFlObj:'',
    afterViewLoad: function(){
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectDp'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("abSpAsgnDvDpToRm_dvTree", "onclick", getMessage('selectRm'), true);
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("abSpAsgnDvDpToRm_dpTree", "onclick", getMessage('selectRm'), true);
        // set event handler for clicking room on the drawing 
        this.abSpAsgnDvDpToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        hpRecords = View.dataSources.get('ds_ab-sp-asgn-dv-dp-to-rm_dp').getRecords();
    },
    
    abSpAsgnDvDpToRm_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.bl_id');
        var filterDvId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.dv_id');
        var filterDpId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.dp_id');
        var blTreeRes = new Ab.view.Restriction();
        var dvRes = " IS NOT NULL";
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        if (filterDvId) {
            dvRes = " = '" + filterDvId + "'";
        }
        if (filterDpId) {
            dpRes = " = '" + filterDpId + "'";
        }
        
        this.abSpAsgnDvDpToRm_drawingPanel.clear();
        this.abSpAsgnDvDpToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnDvDpToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnDvDpToRm_dpAssignGrid.removeRows(0);
        this.abSpAsgnDvDpToRm_dpAssignGrid.update();
        
        this.abSpAsgnDvDpToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dvRes', dvRes);
        this.abSpAsgnDvDpToRm_dvTree.refresh();
    },
    
    abSpAsgnDvDpToRm_drawingPanel_onShowDwgView:function(){
    	if (this.abSpAsgnDvDpToRm_drawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpAsgnDvDpToRm_drawingPanel.getRecValues(0);
			  var blId = recValue["rm.bl_id"];
			  var flId = recValue["rm.fl_id"];
		   	  var dwgName = recValue["rm.dwgname"];
			  	View.openDialog('asc-bj-usms-show-fl-dwg.axvw', null, false, {
			  		maximize:true,
			  		closeButton: false,
			  		blId: blId,
			  		flId: flId,
			  		dwgName: dwgName
			  	});
			  
		   }
	}
    
});

var dvId="";
var dvName="";
var dpId="";
var dpName="";
var hpRecords;

/**
 * event handler when click tree node of dp level for the tree abSpAsgnDvDpToRm_dvTree.
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_dvTree').lastNodeClicked;
    dpId = currentNode.data['dp.dp_id'];
    dpName = currentNode.data['dp.dp_name'];
    dvId = currentNode.parent.data['dv.dv_id'];
    dvName = currentNode.parent.data['dv.dv_name'];
    
    resetAssgnColor('dp.hpattern_acad', hpRecords, 'dp.dv_id', dvId, 'dp.dp_id', dpId)
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("dp.dp_id", dpId);
        drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvName +"--"+dpName);
    }
    else {
        View.showMessage(getMessage('selectFloor'));
        return;
    }
    setSelectability(controller.onclickedFlObj.restriction);
}
function onDvTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_dvTree').lastNodeClicked;
    dvId = currentNode.data['dv.dv_id'];
    dvName =currentNode.data['dv.dv_name'];
    dpId = "";
    dpName = "";
    
    resetAssgnDvColor('dp.hpattern_acad', hpRecords, 'dv.dv_id', dvId)
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("dv.dv_id", dvId);
        drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvName);
    }
    else {
        View.showMessage(getMessage('selectFloor'));
        return;
    }
    setSelectability(controller.onclickedFlObj.restriction);
}


/**
 * event handler when click tree node of floor level for the tree abSpAsgnDvDpToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	controller.onclickedFlObj=ob;
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnDvDpToRm_dpAssignGrid');
    setSelectability(ob.restriction);
    flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
    drawingRoomClickHandler2(pk, selected, grid,'dv.dv_name', dvName, 'dp.dp_name', dpName, 'rm.dv_id', dvId, 'rm.dp_id', dpId);

    View.panels.get('abSpAsgnDvDpToRm_drawingPanel').processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvName + "-" + dpName);
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
    resetAssignment(drawingPanel, grid);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
    var dsChanges = View.dataSources.get("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmLabel");
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
    saveChange(drawingPanel, grid, dsChanges, ['rm.dv_id', 'rm.dp_id'], false);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
    addLegendToTreeNode('abSpAsgnDvDpToRm_dpTree', treeNode, 1, 'dp', 'dp.dp_id');
}

/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel')
    var rmRecords = View.dataSources.get('ds_ab-sp-rm_occupiable').getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var supercat = record.getValue('rmcat.supercat');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        
        //kb:3030349,by comments (JIANBING 2012-08-09 11:16)1. In view ab-sp-asgn-dv-dp-to-rm.axvw, 
        //I am not able to assign dv-dp to service area. User should be able to assign dv-dp to sevice area. 
        
        if (supercat == 'VERT') {
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }else{
        	drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
        }
    }
}
