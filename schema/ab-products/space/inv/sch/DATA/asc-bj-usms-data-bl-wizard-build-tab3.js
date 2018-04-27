var rplmBuildingBuildController = View.createController('rplmBuildingBuild', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
	firstSave: true,
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
    },
   /* tsBlForm_onReturn: function(){
    	
    	this.openerController.navigate('backward');
    },*/
  //返回到首界面
    returnToIndex: function(){
    	this.openerController.navigate('home_page');
    },
   /* openNextTab: function(){
        if (this.contentDisabled) {
            return;
        }
        this.itemId = this.tsBlForm.getFieldValue('bl.bl_id');
       
        this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;  
//        this.rplmBuildingForm.enableButton('cancel', false);
//        this.rplmBuildingForm.enableButton('finish', true);
        this.openerPanel.wizard.setAction(this.action);
        this.openerPanel.wizard.setActionType(this.actionType);
        this.openerPanel.wizard.setItemId(this.itemId);
        this.openerPanel.wizard.setItemType(this.itemType);
        this.openerPanel.wizard.setItemIsOwned(this.itemIsOwned);
        this.openerPanel.wizard.setLeaseId(this.leaseId);
        this.openerPanel.wizard.setLeaseType(this.leaseType);
        this.openerController.navigate('forward');
    },*/
    
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    restoreSettings: function(){
        if (this.action == 'ADD' && this.itemId == null) {
            //this.tsBlForm.refresh(null, true);//new record
            //this.rplmPropertyOwnershipForm.refresh(null, true);
        }else{
        	
        	this.tsBlForm.refresh({'bl.bl_id' : this.itemId}, false);
        }
     
    }
    
});
