
var myReservCommentsController = View.createController("myReservCommentsController", {

    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.onStart();
    },
	
    onStart: function(){
		var opener = View.getOpenerView().controllers.get(0);
        this.addCommentPanel.setFieldValue("reserve.comments", opener.mainTabs.comments);
    },
	addCommentPanel_onClose:function(){
		View.closeThisDialog();
	}

})
