var abOndReqCreateController = View.createController("abOndReqCreateController",{
	basicRestriction: null,
	
	afterInitialDataFetch: function() {
		var passedRestriction  = View.getOpenerView().dialogRestriction;
		if (passedRestriction != null && passedRestriction != undefined) {
			top.window.location.parameters["condAssessmentRestrication"] = passedRestriction;
		}
		/*
		 * Ioan - add callback method to perform additional work on created service request
		 * Clean Building.
		 */
		
		//Fix KB3031774 - if this view is not opened as pup-up it will cause error, so add a check for 
		//View.getOpenerView().dialogConfig(Guo 2011/06/21)
		if(valueExists(View.getOpenerView().dialogConfig)){
			var callbackMethod = View.getOpenerView().dialogConfig.callback;
			if(valueExists(callbackMethod) && typeof(callbackMethod) == "function"){
				top.window.location.parameters["callbackMethod"] = callbackMethod;
			}
		} 
	}
});