var controller = View.createController('abScHlRmByCatAndTypeController', {

    //----------------event handle--------------------
	afterInitialDataFetch: function(){
    	this.abScHlRmByDv_DrawingPanel.appendInstruction("default", "", "");
        this.abScHlRmByDv_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        var openController = View.getOpenerView().controllers.get("buildingAbstractController");
        var curNode=openController.curNode;
        var title=openController.openerTitle
        displayFloor(this.abScHlRmByDv_DrawingPanel, curNode, title);
    },
    abScHlRmByDv_DrawingPanel_onShowDwgView:function(){
		   if (this.abScHlRmByDv_DrawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abScHlRmByDv_DrawingPanel.getRecValues(0);
			  var blId = recValue["rm.bl_id"];
			  var flId = recValue["rm.fl_id"];
			  var dwgName = blId + "-"+ flId;

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

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 600,
            height: 650,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
		
		var drawingPanel = View.panels.get('abScHlRmByDv_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}


/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
	
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}
