/**
 * @author song
 */
var mainController = commonRptController.extend({
	
    //console restriction for three tabs
    regulationRes:" 1=1 ", 
	programRes:" 1=1 ", 
	requirementRes:" 1=1 ", 
	
    afterInitialDataFetch: function(){
    	
    	this.objPanelTitles = {"requirement": null,"events": null,"notifications": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"requirement": "abCompSelectRequirement",
					                "events": "abCompEventActivityLogGrid",
					                "notifications": "abCompNotificationGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"comprogram": 0,"requirement": 0,"events": 0,"notifications": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regprogram";
    	
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
		
    	//if there is a console exists, put current controller to the console controller array
		if (typeof controllerConsole != "undefined") {
			controllerConsole.controllers.push(mainController);
			controllerConsole.getVnRespComplevelResForRequireOrProgram = getCustomFieldsResForProgram;
	    }
    },
    
    //for pop up Compliance Program Count by:
    addParentRestrictionIfPopUp: function(){
    	var openerView = View.getOpenerView();
    	if(openerView.popUpRestriction){
    		this.abCompSelectProgram.addParameter('consoleResProgram', openerView.popUpRestriction);
    		this.abCompSelectProgram.refresh();
    	}
    },
    
	/**
	 * call by console method : 'abCompDrilldownConsole_onShow'
	 */  
	refreshFromConsole: function() {
		
		this.abCompSelectProgram = getChildView(this, "comprogram").panels.get("abCompSelectProgram");
		
		//add restriction for programRes
		this.programRes = generateProgramRestriction("programRpt");
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(mainController,null,this.programRes,null);
		
		this.abCompSelectProgram.addParameter('programRes', this.programRes);
		
		this.abCompSelectProgram.refresh();
		
		this.switchTabToFirst();
	},

	/**
	 * call by console method : 'abCompDrilldownConsole_onShow'
	 */  
	switchTabToFirst: function() {
		//after click Show in filter, switch back to first tab and disable all other tabs.
		this.sbfDetailTabs.setAllTabsEnabled(false);
		this.sbfDetailTabs.enableTab('comprogram');
		this.sbfDetailTabs.selectTab('comprogram');
	}
});        
