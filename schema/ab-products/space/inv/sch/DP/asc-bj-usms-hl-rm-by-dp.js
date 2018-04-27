/**
 * @author kevenxi
 */
var controller = View.createController('aschlRmByDpController', {
	
    //----------------event handle--------------------
    afterViewLoad: function(){
		dvId = this.view.parameters['dvId'];
		var titleForDv = String.format(getMessage('drawingPanelTitle1'),dvId );
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", titleForDv);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
		
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
            var highlightResc = "";
            if (dvId) {
                highlightResc += " AND rm.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }
            
            
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
        });
		
		
    },
    
    afterInitialDataFetch: function(){
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
		this.onShowDpGrid();
    },
    
    onShowDpGrid: function(){
        blId = "";
        var dvRes = " IS NOT NULL";
        var blRes = " IS NOT NULL";
        if (dvId) {
            dvRes = " = '" + dvId + "'";
        }
        if (blId) {
            blRes = " = '" + blId + "'";
        }
        
        //this.abSpHlRmByDp_DrawingPanel.clear();
        //setDrawingTitle();
        
        this.abSpHlRmByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlRmByDp_flGrid.refresh();
    }
});

var dvId;
var blId;


/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
	//kevenxi edit 2011-7-13
	/*
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", pk[0], "=", true);
        restriction.addClause("rm.fl_id", pk[1], "=", true);
        restriction.addClause("rm.rm_id", pk[2], "=", true);
        
        var rmDetailPanel = View.panels.get('abSpHlRmByDp_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
    }
    setDrawingTitle();
	*/
	
	 if (selected) {
		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 500,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
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
		var title = String.format(getMessage('drawingPanelTitle1'),dvId );
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}
