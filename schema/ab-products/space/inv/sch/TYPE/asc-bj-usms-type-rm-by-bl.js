/**
 * @author kevenxi
 */
var controller = View.createController('aschlRmByDpController', {
	blId: "",
	rm_cat:"",
	blName:"",
    //----------------event handle--------------------
    afterViewLoad: function(){
		this.blId = this.view.parameters['blId'];
		this.rm_cat = this.view.parameters['rmcat'];
		this.blName = this.view.parameters['blName'];
		
		var titleForDv = String.format(getMessage('drawingPanelTitle1'),this.blId );
		this.abSpHlRmByDp_flGrid.addParameter("blRes","rm.bl_id='"+this.blId+"' and rm.rm_cat='"+this.rm_cat+"'");
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", titleForDv);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
		
		var control = this;
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
            var highlightResc = "rm.rm_cat='"+control.rm_cat+"'";

            var highlightResc = "";
            if (control.rm_cat!="") {
                highlightResc += " rm.rm_cat='"+control.rm_cat+"'";
            }
            else {
                highlightResc += " rm.rm_cat IS NOT NULL";
            }
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmcat', highlightResc);
			View.panels.get('abSpHlRmByDp_DrawingPanel').clear();
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
            
        });
		
		
    },

    abSpHlRmByDp_flGrid_afterRefresh: function(){
    	 this.abSpHlRmByDp_flGrid.enableSelectAll(false);
	},
    abSpHlRmByDp_flGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},

    abSpHlRmByDp_DrawingPanel_onShowDwgView:function(){
    	if (this.abSpHlRmByDp_DrawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpHlRmByDp_DrawingPanel.getRecValues(0);
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

var dvId;
var blId=controller.blId;


/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
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
    if (blId) {
		var title = String.format(getMessage('drawingPanelTitle1'),blId );
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}
