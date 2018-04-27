var tabsController = View.createController('tabsController', {
	performTransferController:null,
	executeOnDb: true,
	fileName: '', 
	isRecreateTable: true, 
	isRecreateFK: true, 
	isChar: false,
	isValidated: false,
	tableSpaceName:'',

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
		var isOracle = this.isOracleDb();
		this.updSchWizTabs.tabs[1].loadView();
		if(isOracle == 1){
			var specifyUpdateController = View.controllers.items[1];
			specifyUpdateController.showOptionForOracle();
			specifyUpdateController.isOracle = true;
		}

		this.updSchWizTabs.tabs[2].loadView();
		var updateOptionsController = this.view.controllers.items[0]; 
		updateOptionsController.updSchSpecUpdPref.actions.get('next').forceDisable(false);
		updateOptionsController.updSchSpecUpdPref.enableButton('next', true)
	},
	
	isOracleDb:function(){
		if(valueExistsNotEmpty(this.dsIsOracle.getRecord().records)){
			// older DB
			return this.dsIsOracle.getRecord().records[0].values['afm_tbls.table_name']
		}else{
			// newer DB
			return this.dsIsOracle.getRecord().getValue("afm_tbls.table_name");
		}
	},

	afterInitialDataFetch: function(){
		for(var i=1;i<this.updSchWizTabs.tabs.length;i++){
			this.updSchWizTabs.disableTab(this.updSchWizTabs.tabs[i].name);
		}
	}
});