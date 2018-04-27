var tabsController = View.createController('tabsController', {
	transferOut:true,
	transferIn:false,
	compare:false,
	deleteBeforeTransferOut: true,
	deleteAfterTransferIn: false,
	performTransferController:null,
	isMergeDataDict: false,
	
	afterViewLoad: function(){
		try {
			SchemaUpdateWizardService.updateArchibusSchemaUtilities(
											{
											callback: function() {
												tabsController.afterUpdateSchema();
		    								},
		    								errorHandler: function(m, e) {
		    									View.showException(e);
		        							}
			});
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	afterUpdateSchema:function(){
		this.updProjWizTabs.tabs[2].loadView();
		var transferTypeController = this.view.controllers.items[0]; 
		transferTypeController.updProjTransferType.actions.get('next').forceDisable(false);
		transferTypeController.updProjTransferType.enableButton('next', true)
	},
	
	afterInitialDataFetch: function(){
		for(var i=1;i<this.updProjWizTabs.tabs.length;i++){
			this.updProjWizTabs.disableTab(this.updProjWizTabs.tabs[i].name);
		}
		this.updProjWizTabs.hideTab('mergeDataDictionary');
		this.updProjWizTabs.hideTab('compareDataDictionary');
	}
});