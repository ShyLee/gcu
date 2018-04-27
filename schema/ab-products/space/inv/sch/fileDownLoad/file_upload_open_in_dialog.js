View.createController("fileUploadController", {
    afterInitialDataFetch: function(){
    	
    },
    OpenInDialog_onUpload:function(){
    	 var controller = this;
    	var restriction={'pk':'jack','tbn':'abc'};
    	View.openDialog('asc_bj_ts_file_upload.axvw', restriction, false, {
    	    width: 630,
    	    height: 450,
    	    closeButton: false,
    	    afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('uploadFileController');
    			dialogController.onClose = controller.openerDialogonClose.createDelegate(controller);
    		}
    	});
    },
    openerDialogonClose:function(){
    	
    }
});