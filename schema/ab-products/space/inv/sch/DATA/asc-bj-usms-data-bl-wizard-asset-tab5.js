var rplmBuildingBuildAssetController = View.createController('rplmBuildingAssetBuild', {
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
    //返回到首界面
    returnToIndex: function(){
    	this.openerController.navigate('home_page');
    },
   /* tsBlForm0_onReturn: function(){
    	this.openerController.navigate('backward');
    },
    
    Finish: function(){
    	//this.tsBlForm1.show(false);
    	View.showMessage("记录:" + this.itemId + "保存成功!");
    	//重新载入页面
    	//location.reload();
    	this.openerController.navigate('home_page');
    },
    */
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
            //this.tsBlForm1.refresh(null, true);//new record
            //this.rplmPropertyOwnershipForm.refresh(null, true);
        }else{
        	this.tsBlForm0.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm1.refresh({'bl.bl_id' : this.itemId}, false);
        }
     
    }
    
});