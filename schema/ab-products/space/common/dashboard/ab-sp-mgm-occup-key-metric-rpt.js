var keyMetricController = View.createController('keyMetricController', {
	afterInitialDataFetch: function(){
		if(this.keyTotalMetricForm.actions.get('keyTotalMetricForm_showAsDialog')){
			this.keyTotalMetricForm.actions.get('keyTotalMetricForm_showAsDialog').show(false);
		}
	},
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		var dashCostAnalysisMainController=View.controllers.get('dashCostAnalysisMainController');
		if(dashCostAnalysisMainController.keyTotalMetricController==''){
		dashCostAnalysisMainController.keyTotalMetricController=this;
		this.keyTotalMetricForm.showOnLoad=false;
		}else{
			this.keyTotalMetricForm.showOnLoad=true;
		}
    },
    
    /**
     * More button
     */
    keyTotalMetricForm_onMore:function(){
    	var dashCostAnalysisMainController=View.controllers.get('dashCostAnalysisMainController');
    	dashCostAnalysisMainController.onMore();
    }
})
	
