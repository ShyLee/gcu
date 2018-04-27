var areaPerSeatController = View.createController('areaPerSeatController', {
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		if(dashCostAnalysisMainController.areaPerSeatController==''){
		dashCostAnalysisMainController.areaPerSeatController=this;
		this.areaPerSeatBar.show(false);
		}
		//dashCostAnalysisMainController.refreshAreaPerSeatBar(dashCostAnalysisMainController.treeRes,dashCostAnalysisMainController.groupLevel);
		this.areaPerSeatBar.addParameter('dvdpForRmParam',dashCostAnalysisMainController.dvdpForRmRes );
		this.areaPerSeatBar.addParameter('dvdpParam',dashCostAnalysisMainController.dvdpRes);
		if(dashCostAnalysisMainController.groupLevel=="bl_id is not null"){
			this.areaPerSeatBar.addParameter('groupby', "bl.bl_id");
		}else if(dashCostAnalysisMainController.groupLevel=="bl.bl_id"){
			this.areaPerSeatBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(dashCostAnalysisMainController.groupLevel=="fl.fl_id"){
			this.areaPerSeatBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.areaPerSeatBar.addParameter('groupby', dashCostAnalysisMainController.groupLevel);
		}

		if(dashCostAnalysisMainController.blId==''){
			this.areaPerSeatBar.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.siteIdRes);
		}else{
			this.areaPerSeatBar.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], dashCostAnalysisMainController.blId)+" AND "+dashCostAnalysisMainController.siteIdRes);
		}
	
	}
})
	
