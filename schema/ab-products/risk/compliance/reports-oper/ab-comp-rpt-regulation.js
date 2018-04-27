/**
 * @author song
 */
var mainController = commonRptController.extend({
	
    afterInitialDataFetch: function(){
    	
    	this.objPanelTitles = {"comprogram": null,"requirement": null,"events": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"comprogram": "abCompSelectProgram",
					                "requirement": "abCompSelectRequirement",
					                "events": "abCompEventActivityLogGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"regulation": 0,"comprogram": 0,"requirement": 0,"events": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regulation";
    	
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
		
    	this.addParentRestrictionIfPopUp();
    },
    
    //for pop up from Location and Regulation Rank and Regulation Rank and Category
    addParentRestrictionIfPopUp: function(){
    	var openerView = View.getOpenerView();
    	if(openerView.popUpRestriction){
    		this.abCompSelectRegulation.addParameter('consoleResRegulation', openerView.popUpRestriction);
    		this.abCompSelectRegulation.refresh();
    	}
    },

    /**
     * show button on console clicked.[overwrite original method in console.]
     */
	abCompSelectRegulationConsole_onShow: function(){
	  
		var restriction = abCompRptConsoleController.getConsoleRestriction();
		this.abCompSelectRegulation.refresh(restriction);
		
		this.sbfDetailTabs.selectTab("regulation");
	}
	
    
});        
