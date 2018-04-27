var occupAndCapController = View.createController('occupAndCapController', {
	
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		if(dashCostAnalysisMainController.occupAndCapController==''){
			dashCostAnalysisMainController.occupAndCapController=this;
			this.occupancyAndCapicityStackedBar.show(false);
		//dashCostAnalysisMainController.refreshOccupancyAndCapicityStackedBar(dashCostAnalysisMainController.treeRes,dashCostAnalysisMainController.groupLevel);
		}
		
		if(dashCostAnalysisMainController.blId==''){
			this.occupancyAndCapicityStackedBar.addParameter('blId',dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.siteIdRes);
		}else{
			this.occupancyAndCapicityStackedBar.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], dashCostAnalysisMainController.blId)+" AND "+dashCostAnalysisMainController.siteIdRes);
		}
		
		this.occupancyAndCapicityStackedBar.addParameter('dvdpParam',dashCostAnalysisMainController.dvdpRes );
		this.occupancyAndCapicityStackedBar.addParameter('dvdpForRmParam',dashCostAnalysisMainController.dvdpForRmRes );
		if(dashCostAnalysisMainController.groupLevel=="bl_id is not null"){
			this.occupancyAndCapicityStackedBar.addParameter('groupby', "bl.bl_id");

		}else if(dashCostAnalysisMainController.groupLevel=="bl.bl_id"){
			this.occupancyAndCapicityStackedBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(dashCostAnalysisMainController.groupLevel=="fl.fl_id"){
			this.occupancyAndCapicityStackedBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.occupancyAndCapicityStackedBar.addParameter('groupby', dashCostAnalysisMainController.groupLevel);
		}

		this.occupancyAndCapicityStackedBar.addParameter('occupForAreatype', getMessage('occupForAreatype'));
		this.occupancyAndCapicityStackedBar.addParameter('maxOccupForAreatype', getMessage('maxOccupForAreatype'));
    },

	refreshCustomColors:function(){
		this.panelRefresh.defer(400);
	},
	panelRefresh:function(){
		var customFillColors = ['0x4BACC6', '0xF79646', '0x8064A2', '0x9BBB59', '0xC0504D', '0x4F81BD', '0x1F497D', '0x938953', '0x000000', '0x7F7F7F', '0x974806','0x205867','0x3F3151','0x4F6128','0x5E1C1B','0x244061','0x0F243E','0x1D1B10','0x0C0C0C','0x7F7F7F'];
		View.panels.get('occupancyAndCapicityStackedBar').setSolidFillColors(customFillColors);
		View.panels.get('occupancyAndCapicityStackedBar').show(true);
		View.panels.get('occupancyAndCapicityStackedBar').refresh();
	}
})
	
