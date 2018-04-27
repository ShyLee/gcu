/**
 * @author song
 */
var abCompDefineProgramController = View.createController('abCompDefineProgramController', {

	keyValue: "regprogram.regulation",
	
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){
    		this.sbfDetailTabs = this.mainController.sbfDetailTabs;
    	}
    	
   		this.abCompDefineProgram.refresh(View.parentTab.restriction, this.mainController.newRecord);
    },
    /**
     * first tab panel save button click 
     * After save record, Refresh grid in Tab 1.  
     * Show new record in Tab 2 form.  Disable all tabs after Tab 2. 
     *  Set View Title to 'Add New Program'.
     */
    abCompDefineProgram_onSaveAndAddNew: function(){
		
    	this.abCompDefineProgram_onSave();

    	if(this.sbfDetailTabs&&this.sbfDetailTabs.findTab('define')){
    		this.mainController.view.setTitle(getMessage("addNewProgram"));
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab('define');
    		this.sbfDetailTabs.enableTab('select');
    	}
    		     	
    	this.abCompDefineProgram.newRecord= true;   	
    	this.abCompDefineProgram.refresh();
    },
    
    /**
     * Event handle when 'save' button click.
     */
    abCompDefineProgram_onSave: function(){
    			
    	var result = this.abCompDefineProgram.save();
    	// If this was a new record and still marked new, then save failed, nothing more to do
    	if (this.abCompDefineProgram.newRecord || !result) {
    	  return;
    	}

    	if(this.mainController.regulationTree){
    		this.mainController.abCompDefineProgram_onSave(this.abCompDefineProgram);
    	}else{
			var regulation = this.abCompDefineProgram.getFieldValue(this.keyValue);
			var reg_program = this.abCompDefineProgram.getFieldValue("regprogram.reg_program");
			this.mainController.regulation = regulation;
			this.mainController.regprogram = reg_program;
			this.mainController.project_id = this.abCompDefineProgram.getFieldValue("regprogram.project_id");
			
			//KB#3036243: added for using in Notify Template tab. 
			this.sbfDetailTabs.regprogram = reg_program;
			this.sbfDetailTabs.regulation = regulation;

			var viewTitle = getMessage("manageCompProgram")+": "+reg_program;
			this.mainController.view.setTitle(viewTitle);
			this.sbfDetailTabs.setAllTabsEnabled(true);
				
			this.mainController.setOthersTabRefreshObj("define", 1);
    	}
    	
    	//3036507 add variable row to 'mainController' fixed checkDupulate issue in 'Location' tab.
        var dataSource = View.dataSources.get("abCompDefineProgramDS");
        var wfrRecord = dataSource.processOutboundRecord(this.abCompDefineProgram.getRecord());
    },
    /**
     * when add delete button click.
     */
    abCompDefineProgram_onDelete: function(){
        var confirmMessage = getMessage("messageConfirmDelete");
        var objThis = this;
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
            	//kb 3036023 according spec30, call wfr 'deleteComplianceCleanup' before delete.
            	var regulation = objThis.abCompDefineProgram.getFieldValue('regprogram.regulation');
            	var reg_program = objThis.abCompDefineProgram.getFieldValue('regprogram.reg_program');
        		if(reg_program!=""){
        			try{
        				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteComplianceCleanup',
        						regulation, reg_program, '');
        			}catch(e){
        				Workflow.handleError(e);
        				return false;
        			}
        		}
            	objThis.abCompDefineProgram.deleteRecord();
            	objThis.abCompDefineProgram.show(false);
            	if(objThis.mainController.regulationTree){
            		objThis.mainController.abCompDefineProgram_onDelete(objThis.abCompDefineProgram);
            	}else{
            		objThis.sbfDetailTabs.setAllTabsEnabled(false);
            		objThis.sbfDetailTabs.enableTab("select");

            		objThis.mainController.setTabRefreshObj("select", 1);
            		
            		objThis.sbfDetailTabs.selectTab("select");
            		objThis.mainController.view.setTitle(getMessage("selectCompToManage"));
            	}
            }
        });    
    },
    /**
     * tab 4 , copy as new button click.
     */
    abCompDefineProgram_onCopyAsNew: function(){
    	this.commonCopyAsNew(this.abCompDefineProgram, "regprogram.reg_program", this.abCompDefineProgramDS);
		if(this.mainController.regulationTree){
		}else{
			this.mainController.view.setTitle(getMessage("addNewProgram"));
			this.sbfDetailTabs.setAllTabsEnabled(false);
			this.sbfDetailTabs.enableTab('define');
			this.sbfDetailTabs.enableTab('select');
		}
    },
    /**
     * when cancel button click.
     */
    abCompDefineProgram_onCancel: function(){
    	if(this.mainController.regulationTree){
    		this.abCompDefineProgram.show(false);
    	}else{
    		this.abCompDefineProgram.show(false);
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab("select");
    		this.sbfDetailTabs.selectTab("select");
//    		this.sbfDetailTabs.findTab("select").loadView();
    		this.mainController.view.setTitle(getMessage("selectCompToManage"));
    	}
    },
    /**
     * common method.
     */
    commonCopyAsNew: function(form, id, ds){
		var comm_id=form.getFieldValue(id);
		var restriction = new Ab.view.Restriction();
		restriction.addClause(id ,comm_id);
		var records=ds.getRecords(restriction);
		var record=records[0];
		form.newRecord = true;
		form.setRecord(record);
		form.setFieldValue(id,'');
    }
});    

