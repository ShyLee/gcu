/**
 * @author song
 */
var mainController = commonRptController.extend({
	
    afterInitialDataFetch: function(){

    	this.objPanelTitles = {"events": null,"notifications": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"events": "abCompEventActivityLogGrid",
					                "notifications": "abCompNotificationGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"requirement": 0,"events": 0,"notifications": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regrequirement";
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
    	
    	 //if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
    		controllerConsole.controllers.push(mainController);
			controllerConsole.getVnRespComplevelResForRequireOrProgram = getCustomFieldsResForRequirement;
    	}
    },
    
    /**
     * private method
     * parent find child.
     */
    getSubTabController: function(selectedTabName){
		var tab = this.sbfDetailTabs.findTab(selectedTabName);
		var iframe = tab.getContentFrame();                                  
        var childView = iframe.View;
        return childView.controllers.get(0);
    },
    

	/**
	 * call by console method : 'abCompDrilldownConsole_onShow'
	 */  
	refreshFromConsole: function(){

		var abReportRequirementController = this.getSubTabController('requirement');
		this.abCompSelectRequirement = abReportRequirementController.abCompSelectRequirement;
		//add restriction for requirementRes
		this.requirementRes = generateRequirementRestriction();
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(mainController,null,null,this.requirementRes);
		
		this.abCompSelectRequirement.addParameter('requirementRes', this.requirementRes);
		
		this.abCompSelectRequirement.refresh();
		
		//kb 3036320 after click Show in filter, supposed to switch back to first tab and disable all other tabs.  This is not implemented.
		this.sbfDetailTabs.setAllTabsEnabled(false);
		this.sbfDetailTabs.enableTab('requirement');
		this.sbfDetailTabs.selectTab('requirement');
		
		if (typeof permitController != "undefined") {
			if(permitController.isPermit){
				//set grid color by compare with field 'date_expire' for View 'Permits and Licenses'
				abReportRequirementController.setGridColor();
			}
		}
	},
	
	/**
	 * not use, those fields handle in common console leave this method with fields custom sql generate.
	 * Vendor Code, Responsible Person,  in both regrequirement and regprogram.  
	 * A match is made (if the Vendor Code in regrequirement matches) OR (if the Vendor Code 
	 * in regprogram matches and Vendor Code in regrequirement is NULL).  Same logic applies to 
	 * Responsible Person
	 */
	getCostomFieldsRes: function(){
		
		var vn_ids = this.abCompDrilldownConsole.getFieldValue("regrequirement.vn_id");
		var em_ids = this.abCompDrilldownConsole.getFieldValue("regrequirement.em_id");
		
		var restriction ="1=1 ";
		var dataRes="";
		
		if(vn_ids!=""){
			dataRes+=" and ( regrequirement.vn_id in (" + this.changeStringFormat(vn_ids) + ") or (regrequirement.vn_id is null and regprogram.vn_id in (" + this.changeStringFormat(vn_ids) + ")))";
		}
		if(em_ids!=""){
			dataRes+=" and ( regrequirement.em_id in (" + this.changeStringFormat(em_ids) + ") or (regrequirement.em_id is null and regprogram.em_id in (" + this.changeStringFormat(em_ids) + ")))";
		}
		return restriction + dataRes;
	},
	
	/**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
    /**
     * private method
     * change String e.g. :  abc#bbb to 'abc','bbb'
     */
    changeStringFormat: function(string){
    	var character  = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
    	if(string.indexOf(character)!=-1){
    		var array = string.split(character);
    		return this.changeFormatForSqlIn(array);
    	}else{
    		return "'"+string+"'";
    	}
    }
});        
