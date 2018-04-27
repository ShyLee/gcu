var controller = View.createController('abSpAsgnRmCatRmTypeToRm_Control', {

    afterViewLoad: function(){
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectType'));
		
        // set event handler for clicking room on the drawing 
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        hpRecords = View.dataSources.get('ds_ab-sp-asgn-rmcat-rmtype-to-rm_rmtype').getRecords();
    },
	
    afterInitialDataFetch:function(){
    	var employeeDivision=AUSC_getEmployeeDivisionIdByEmId(View.user.name);
    	
    	if(employeeDivision!=undefined){
    		var bu_id= AUSC_getEmployeeDivisionIdByEmId(View.user.name).organization.dvType;
    		 if (ascBjUsmsConstantControl.AUSC_DvIsJXKY(bu_id)){
    			 this.abSpAsgnRmcatRmTypeToRm_rmcatTree.addParameter("buparam"," rmtype_bu in ('JX','JXJG')");
    		 }else{
    			 this.abSpAsgnRmcatRmTypeToRm_rmcatTree.addParameter("buparam"," rmtype_bu in ('JG','JXJG')");
    		 }
    		 
    		 this.abSpAsgnRmcatRmTypeToRm_rmcatTree.refresh();
    	}
    	
	},
	
    abSpAsgnRmcatRmTypeToRm_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpAsgnRmcatRmTypeToRm_filterConsole.getFieldValue('rm.bl_id');
        var filterRmCat = this.abSpAsgnRmcatRmTypeToRm_filterConsole.getFieldValue('rm.rm_cat');
        var blTreeRes = new Ab.view.Restriction();
        var rmCatTreeRes = new Ab.view.Restriction();
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        
        if (filterRmCat) {
            rmCatTreeRes.addClause("rmcat.rm_cat", filterRmCat, "=");
        }
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.clear();
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.removeRows(0);
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.update();
        
        this.abSpAsgnRmcatRmTypeToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnRmcatRmTypeToRm_rmcatTree.refresh(rmCatTreeRes);
    },
    
    abSpAsgnRmcatRmTypeToRm_drawingPanel_onShowDwgView:function(){
    	if (this.abSpAsgnRmcatRmTypeToRm_drawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpAsgnRmcatRmTypeToRm_drawingPanel.getRecValues(0);
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

var rmTypeId = "";
var rmCatId = "";
var rmUseId;

var rmOldTypeId;
var rmOldCatId;
var rmOldTypeName;
var rmOldCatName;

var hpRecords;
var rmCatName;
var rmTypeName;

function getSelectRmMessage(){
	var title = String.format(getMessage('selectRm'), "["+rmCatName + "-" + rmTypeName+"]");
	return title;
}
/**
 * event handler when click tree node of room type level for the tree abSpAsgnRmcatRmTypeToRm_rmcatTree.
 * @param {Object} ob
 */
function onRmTypeTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmcatTree').lastNodeClicked;
    rmTypeId = currentNode.data['rmtype.rm_type'];
    rmTypeName = currentNode.data['rmtype.rmtype_name'];
    rmCatId = currentNode.parent.data['rmcat.rm_cat'];
    rmCatName = currentNode.parent.data['rmcat.rmcat_name'];
    rmUseId = currentNode.parent.data['rmcat.rm_use'];
    var rmUseName= currentNode.parent.data['rmuse.rmuse_name'];
	
    resetAssgnColor('rmtype.hpattern_acad', hpRecords, 'rmtype.rm_cat', rmCatId, 'rmtype.rm_type', rmTypeId);
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("rmtype.rm_type", rmTypeId);
		drawingPanel.appendInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", "", getSelectRmMessage(),true);
        drawingPanel.processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", "");
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
}

/**
 * event handler when click tree node of floor level for the tree abSpAsgnRmcatRmTypeToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid');
    //flTreeClickHandler(currentNode, drawingPanel, grid);
	ABSC_rmFlTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
	getCurrRmcatRmtype(pk[0],pk[1],pk[2]);
	
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    drawingRoomClickHandler2(pk, selected, grid, 'rm.option1',rmOldCatName,'rm.option2',rmOldTypeName,'rm.rm_use', rmUseId,'rm.rm_cat', rmCatId, 'rm.rm_type', rmTypeId,'rm.cat_name', rmCatName, 'rm.type_name', rmTypeName);
	var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel')
    //drawingPanel.processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", '');
	
//	if (selected) {
        View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 900,
            height: 500,
			blId: pk[0],
            flId: pk[1],
            rmId: pk[2],
            closeButton: false
        });
//    }
	drawingPanel.processInstruction("ondwgload", "");
}

function getCurrRmcatRmtype(blId,flId,rmId){
	var rmDs = View.dataSources.get('ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmLabel');
	var res = new Ab.view.Restriction();
	res.addClause('rm.bl_id',blId,'=');
	res.addClause('rm.fl_id',flId,'=');
	res.addClause('rm.rm_id',rmId,'=');
	var rec = rmDs.getRecord(res);
	
    rmOldCatId  = rec.getValue('rm.rm_cat');
    rmOldCatName  = rec.getValue('rmcat.rmcat_name');
    rmOldCatId  = rec.getValue('rm.rm_cat');
	rmOldTypeName = rec.getValue('rmtype.rmtype_name');
    
}
/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    resetAssignment(drawingPanel, grid);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
    var dsChanges = View.dataSources.get("ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmLabel");
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    var message = getMessage("确定要变更房屋用途吗？");
	var controller = this;
    View.confirm(message, function(button){
   	 if (button == 'yes') {
        try { 
        	saveChange(drawingPanel, grid, dsChanges, ['rm.rm_use','rm.rm_cat', 'rm.rm_type'], true);
        	drawingPanel.processInstruction("ondwgload", '');
        	grid.show(false);
        	View.showMessage("保存成功！");
        	return;
        }catch (e) {
          	 Ab.workflow.Workflow.handleError(e);
          	 return;
       }
     }
  });
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
	addLegendToTreeNode('abSpAsgnRmcatRmTypeToRm_rmcatTree', treeNode, 1, 'rmtype','rmtype.rmtype_name');
}

