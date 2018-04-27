var controller = View.createController('abSpAsgnRmDpToRm_Control', {
	onclickedFlObj:'',
	dvId:"",
	dvName:"",
	emName:"",
	address:"",
	activityLogId:"",
	listLocation:[],
    afterViewLoad: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectDp'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("abSpAsgnDvDpToRm_dvTree", "onclick", getMessage('selectRm'), true);
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("abSpAsgnDvDpToRm_dpTree", "onclick", getMessage('selectRm'), true);
        // set event handler for clicking room on the drawing 
        this.abSpAsgnDvDpToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        hpRecords = View.dataSources.get('ds_ab-sp-asgn-dv-dp-to-rm_dp').getRecords();
        
        this.dvId=this.tabs.dvId;
        this.emName=this.tabs.emName;
        this.address=this.tabs.address;
        this.activityLogId=this.tabs.activityLogId;
        this.dvName=this.tabs.dvName;
        this.abSpAsgnDvDpToRm_blTree.addParameter('activityLogId',"bl.bl_id in (select bl_id from sc_activity_log_rm where activity_log_id="+this.activityLogId+")");
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dvRes', " = '" + this.dvId + "'");
        
    },
    abSpAsgnDvDpToRm_dpAssignGrid_onDeal:function(){
    	this.getLocationList();
    	var thisController = this;
	    var dialog=View.openDialog("asc-bj-hhu-house-edit-rmxy-office-add-dialog.axvw",null,false,{
		    	width: 1200,
		        height: 600,
		        closeButton: false,
		        aActivityLogId:thisController.activityLogId,
		    	aDvId:thisController.dvId,
		    	aDvName:thisController.dvName,
		    	aAddress:thisController.address,
		    	aEmName:thisController.emName,
		    	aListLocation:thisController.listLocation,
	    	afterViewLoad: function(dialogView) {
                var dialogController = dialogView.controllers.get('abCreateDealDialogController');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
	    });
    },
  //关闭对话框后执行的操作
	dialog_onClose: function() {
		this.abSpAsgnDvDpToRm_dpAssignGrid.actions.get('deal').enable(false);
	},
    getLocationList:function(){
    	this.listLocation.length=0;
    	var grid=this.abSpAsgnDvDpToRm_dpAssignGrid;
    	 for (i = 0; i < grid.gridRows.length; i++) {
    	        var row = grid.gridRows.items[i];
    	        var fullLoc = row.getFieldValue("composite.loc");
    	        var ar = fullLoc.split('|');
    	        if (ar.length < 3) 
    	            continue;
    	        var blId = ar[0];
    	        var flId = ar[1];
    	        var rmId = ar[2];
    	        var location=blId+"|"+flId+"|"+rmId;
				this.listLocation.push(location);
    	 }
    },
    abSpAsgnDvDpToRm_blTree_onBack:function(){
    	 var tabName = 'selectLcTab';
         var tab = this.tabs.findTab(tabName);
         tab.loadView();
         this.tabs.selectTab(tabName);
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
function onDvTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_dvTree').lastNodeClicked;
    dvId = currentNode.data['dv.dv_id'];
    dvName =currentNode.data['dv.dv_name'];
    
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
    if(dpId!=""){
    	drawingRoomClickHandler2(pk, selected, grid,'dv.dv_name', dvName, 'dp.dp_name', dpName, 'rm.dv_id', dvId, 'rm.dp_id', dpId);
    	View.panels.get('abSpAsgnDvDpToRm_drawingPanel').processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvName + "-" + dpName);
    }else{
    	drawingRoomDvClickHandler2(pk, selected, grid,'dv.dv_name', dvName,  'rm.dv_id', dvId);
    	View.panels.get('abSpAsgnDvDpToRm_drawingPanel').processInstruction("abSpAsgnDvDpToRm_dvTree", 'onclick', dvName);
    }
    controller.abSpAsgnDvDpToRm_dpAssignGrid.actions.get('deal').enable(false);

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
    
    controller.abSpAsgnDvDpToRm_dpAssignGrid.actions.get('deal').forcedDisabled=false;
    controller.abSpAsgnDvDpToRm_dpAssignGrid.actions.get('deal').enable(true);
    controller.abSpAsgnDvDpToRm_dpAssignGrid.actions.get('save').enable(false);
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
