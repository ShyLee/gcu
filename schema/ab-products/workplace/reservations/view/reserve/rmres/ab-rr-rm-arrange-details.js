/**
 * @author Guo
 * changed 2009-05-12 for KB3022990
 */
var controller = View.createController('abRrRmArrangeDetails_Controller', {
    blId: null,
    flId: null,
    rmId: null,
	dwgname:null,
    
    //----------------event handle--------------------
    
    afterInitialDataFetch: function(){
        this.abRrRmArrangeDetails_DrawingPanel.appendInstruction("default", "", "");
        this.abRrRmArrangeDetails_DrawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
       	var openController = View.getOpenerView().controllers.get("addRoomReservContentController");
	    var infoRestriction =  openController.roomTimeline.infoRestriction;
        this.abRrRmArrangeDetails_RmArrange_Form.show(true);
        this.abRrRmArrangeDetails_RmArrange_Form.refresh(infoRestriction);
        this.abRrRmArrangeDetails_FixResources_Grid.show(true);
        this.abRrRmArrangeDetails_FixResources_Grid.refresh(infoRestriction);
    },
    
    onDwgLoaded: function(){
        var dwgCtrl = View.panels.get('abRrRmArrangeDetails_DrawingPanel');
		dwgCtrl.setTitle(controller.blId + '-' + controller.flId + '-' + controller.rmId);
    },
    
    abRrRmArrangeDetails_RmArrange_Form_afterRefresh: function(){
        this.blId = this.abRrRmArrangeDetails_RmArrange_Form.getFieldValue('rm_arrange.bl_id');
        this.flId = this.abRrRmArrangeDetails_RmArrange_Form.getFieldValue('rm_arrange.fl_id');
        this.rmId = this.abRrRmArrangeDetails_RmArrange_Form.getFieldValue('rm_arrange.rm_id');
		this.dwgname = this.abRrRmArrangeDetails_RmArrange_Form.getFieldValue('rm.dwgname');
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, this.rmId, this.dwgname);
        this.abRrRmArrangeDetails_DrawingPanel.addDrawing(dcl);
    },
    
    abRrRmArrangeDetails_RmArrange_Form_onClose: function(){
        View.getOpenerView().closeDialog();
    }
});
