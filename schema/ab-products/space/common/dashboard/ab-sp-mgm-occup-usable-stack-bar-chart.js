var usableStackBarController = View.createController('usableStackBarController', {
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		if(dashCostAnalysisMainController.usableStackBarController==''){
		dashCostAnalysisMainController.usableStackBarController=this;
		this.usableGrossStackedBar.show(false);
		}
		//dashCostAnalysisMainController.refreshUsableStackBar(dashCostAnalysisMainController.treeRes,dashCostAnalysisMainController.groupLevel);
    
		this.usableGrossStackedBar.addParameter('useableForAreatype', getMessage('useableForAreatype'));
		this.usableGrossStackedBar.addParameter('grossintForAreatype', getMessage('grossintForAreatype'));

		if(dashCostAnalysisMainController.blId==''){
			this.usableGrossStackedBar.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.siteIdRes);
		}else{
			this.usableGrossStackedBar.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], dashCostAnalysisMainController.blId)+" AND "+dashCostAnalysisMainController.siteIdRes);
		}


		if(dashCostAnalysisMainController.groupLevel=="bl_id is not null"){
			this.usableGrossStackedBar.addParameter('groupby', "bl.bl_id");
		}else if(dashCostAnalysisMainController.groupLevel=="bl.bl_id"){
			this.usableGrossStackedBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(dashCostAnalysisMainController.groupLevel=="fl.fl_id"){
			this.usableGrossStackedBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.usableGrossStackedBar.addParameter('groupby', dashCostAnalysisMainController.groupLevel);
		}
		
	},
	
	/**
	 * Defer refreshCustomColors method 300 minisecond.
	 */
	refreshCustomColors:function(){
		this.panelRefresh.defer(300);
	},
	
	/**
	 * Fill gross stacked bar
	 */
	panelRefresh:function(){
		var customFillColors = ['0x4BACC6', '0xF79646', '0x8064A2', '0x9BBB59', '0xC0504D', '0x4F81BD', '0x1F497D', '0x938953', '0x000000', '0x7F7F7F', '0x974806','0x205867','0x3F3151','0x4F6128','0x5E1C1B','0x244061','0x0F243E','0x1D1B10','0x0C0C0C','0x7F7F7F'];
		View.panels.get('usableGrossStackedBar').setSolidFillColors(customFillColors);
		View.panels.get('usableGrossStackedBar').show(true);
		View.panels.get('usableGrossStackedBar').refresh();
	}
	
})



