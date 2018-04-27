/**
 * @author song
 */
var abCompDefineRegulationController = View.createController('abCompDefineRegulationController', {

	
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){
    		this.sbfDetailTabs = this.mainController.sbfDetailTabs;
//    		If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
    		if(this.mainController.isEgressOrHAZMAT&&this.mainController.isEgressOrHAZMAT==true){
    			this.abCompDefineRegulation.enableField("regulation.regulation", false);
    			this.abCompDefineRegulation.actions.get("delete").show(false);
    		}else{
    			this.abCompDefineRegulation.enableField("regulation.regulation", true);
    			this.abCompDefineRegulation.actions.get("delete").show(true);
    		}
    	}
    	
   		this.abCompDefineRegulation.refresh(View.parentTab.restriction, this.mainController.newRecord);  		   
   		

    },
    
    /**
     *  call after form refresh.
     */
    abCompDefineRegulation_afterRefresh: function(){
    	$('hierarchyId').value = this.abCompDefineRegulation.getFieldValue('regulation.hierarchy_ids');
    },
    
    /**
     * first tab panel save button click 
     * After save record, Refresh grid in Tab 1.  
     * Show new record in Tab 2 form.  Disable all tabs after Tab 2. 
     *  Set View Title to 'Add New Regulation'.
     */
    abCompDefineRegulation_onSaveAndAddNew: function(){
    	this.abCompDefineRegulation_onSave();
    	if(this.sbfDetailTabs&&this.sbfDetailTabs.findTab('define')){
    		this.mainController.view.setTitle(getMessage("addNewRegulation"));
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab('define');
    		this.sbfDetailTabs.enableTab('select');
    	}
    	this.abCompDefineRegulation.newRecord= true;
    	this.abCompDefineRegulation.refresh();
    },
    abCompDefineRegulation_onCopyAsNew: function(){
		this.commonCopyAsNew(this.abCompDefineRegulation, 'regulation.regulation', this.abCompDefineRegulationDS);
    	if(this.mainController.regulationTree){
    		this.mainController.abCompDefineRegulation_onSaveAndAddNew(this.abCompDefineRegulation);
    	}else{
    		this.mainController.view.setTitle(getMessage("addNewRegulation"));
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab('define');
    		this.sbfDetailTabs.enableTab('select');
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
    },
    
    /**
     * Event handle when 'save' button click.
     */
    abCompDefineRegulation_onSave: function(){
    	
    	var theForm = this.abCompDefineRegulation;
    	
    	// if field 'hierarchyId' is empty, then given a default value regulation+"|".
    	if(!$('hierarchyId').value){
    		var regulation = theForm.getFieldValue('regulation.regulation');
    		if (valueExistsNotEmpty(regulation)) {
       	  theForm.setFieldValue('regulation.hierarchy_ids', regulation+"|");
       	  $('hierarchyId').value = regulation+"|";
       	}
      }
        
    	var result = theForm.save();
    	
    	// If this was a new record and still marked new, then save failed, nothing more to do
    	if (theForm.newRecord || !result) {
    	  return;
    	}
    	  
    	if(this.mainController.regulationTree){
    		//call mainController method refresh Tree.
    		this.mainController.abCompDefineRegulation_onSave(theForm);
    	}else {
    		var regulation = theForm.getFieldValue('regulation.regulation');
    		this.mainController.regulation = regulation;
            var viewTitle = getMessage("manageRegulation")+": "+regulation;
            this.mainController.view.setTitle(viewTitle);
        	this.sbfDetailTabs.setAllTabsEnabled(true);

        	this.mainController.setOthersTabRefreshObj("define", 1);
    	}
    	
    	//3036507 add variable row to 'mainController' fixed checkDupulate issue in 'Location' tab.
        var dataSource = View.dataSources.get("abCompDefineRegulationDS");
        var wfrRecord = dataSource.processOutboundRecord(theForm.getRecord());
        
    },
    /**
     * when add delete button click.
     */
    abCompDefineRegulation_onDelete: function(){
        var confirmMessage = getMessage("messageConfirmDelete");
        var objThis = this;
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
            	//kb 3036023 according spec30, call wfr 'deleteComplianceCleanup' before delete.
            	var regulation = objThis.abCompDefineRegulation.getFieldValue('regulation.regulation');
        		if(regulation!=""){
        			try{
        				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteComplianceCleanup',
        						regulation, '', '');
        			}catch(e){
        				Workflow.handleError(e);
        				return false;
        			}
        		}
            	objThis.abCompDefineRegulation.deleteRecord();
            	objThis.abCompDefineRegulation.show(false);

            	if(objThis.mainController.regulationTree){
            		objThis.mainController.abCompDefineRegulation_onDelete(objThis.abCompDefineRegulation);
            	}else{
                    var viewTitle = getMessage("selectRegToManage");
            		objThis.mainController.view.setTitle(getMessage("selectRegToManage"));
            		objThis.sbfDetailTabs.setAllTabsEnabled(false);
            		objThis.sbfDetailTabs.enableTab("select");

            		objThis.mainController.setTabRefreshObj("select", 1);
            		objThis.sbfDetailTabs.selectTab("select");

            	}
            } 
        });
    },
    /**
     * when add cancel button click.
     */
    abCompDefineRegulation_onCancel: function(){
    	if(this.mainController.regulationTree){
    		this.abCompDefineRegulation.show(false);
    	}else{
    		this.abCompDefineRegulation.show(false);
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab("select");
    		this.sbfDetailTabs.selectTab("select");
    		this.mainController.view.setTitle(getMessage("selectRegToManage"));
    	}
    }
});    

