/**
 * @author kevenxi
 */
var controller = View.createController('ascHlFlRmByDvController', {
    blId: "",
    flId: "",
	dwgName:"",
    dvId: "", //if this parameter has value, only highlight the rooms of this division on the floor;
	          // otherwise, highlight all rooms on the floor by the division 
    //----------------event handle--------------------
    afterViewLoad: function(){
        var res = this.view.restriction;
		if (this.view.parameters){
        	this.blId = this.view.parameters['blId'];
			this.flId = this.view.parameters['flId'];
			this.dwgName = this.view.parameters['dwgName'];
			this.dvId = this.view.parameters['dvId'];
		}
           
        var titleForDv = String.format(getMessage('drawingPanelTitle1'), this.dvId);
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", titleForDv);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
        
		var highlightResc = "";
		
		
            if (valueExistsNotEmpty(this.dvId)) {
                highlightResc += " AND rm.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('dvRes', highlightResc);

		displayFloor('abSpHlRmByDp_DrawingPanel', this.blId,this.flId,this.dwgName);
    }
    
});

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){

    if (selected) {
    	//----asc-bj-usms-bl-rm-em-eq-info.axvw----
        View.openDialog('asc-bj-dprm-view-assets-information.axvw', null, false, {
            width: 930,
            height: 600,
            closeButton: false,
            blId: pk[0],
            flId: pk[1],
            rmId: pk[2]
        });
        
        var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
    
}

/**
 * set drawing panel title
 */
function setDrawingTitle(){
    if (dvId) {
        var title = String.format(getMessage('drawingPanelTitle1'), dvId);
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanelId, blId,flId,dwgName){
	
    var drawingPanel = View.panels.get(drawingPanelId);
	var title = blId + "-" + flId;
	
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
