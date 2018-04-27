var areaByBlUsecController = View.createController('areaByBlUsecController', {
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		if(dashCostAnalysisMainController.areaByBlUsecController==''){
		dashCostAnalysisMainController.areaByBlUsecController=this;
		this.areaByBlUsePie.show(false);
		}
		this.areaByBlUsePie.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.blIdRes+" AND "+dashCostAnalysisMainController.siteIdRes);
    }
})
