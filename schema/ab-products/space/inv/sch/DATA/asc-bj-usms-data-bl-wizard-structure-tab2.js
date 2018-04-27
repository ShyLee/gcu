var rplmBuildingStructureController = View.createController('rplmBuildingStructure', {
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
        /*if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }*/
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
    },
    //返回到首界面
    returnToIndex: function(){
    	this.openerController.navigate('home_page');
    },
   /* afterTsBlForm0Save: function(){
    	this.tsBlForm0.enableField('bl.bl_id', false);
    	this.itemId = this.tsBlForm0.getFieldValue('bl.bl_id');
		if(this.openerController.view.title == '*Action: *Add New *Building; *Building Code:  '){
			this.openerController.view.setTitle(this.openerController.view.title+' '+this.tsBlForm0.getFieldValue('bl.bl_id'));
		}  
    	this.openerController.showSelection({
            'action': this.action,
            'type': this.actionType,
            'item': this.itemId,
            'itemType': this.itemType,
            'lease': this.leaseId
        });
    	this.itemId = this.tsBlForm0.getFieldValue('bl.bl_id');
    	this.tsBlForm0.refresh({'bl.bl_id' : this.itemId}, false);
    	this.tsBlForm0.enableField('bl.bl_id', false);
    	this.tsBlForm1.refresh({'bl.bl_id' : this.itemId}, false);
    	this.tsBlForm1.enableField('bl.bl_id', false);
    	this.tsBlForm2.refresh({'bl.bl_id' : this.itemId}, false);
    	this.tsBlForm2.enableField('bl.bl_id', false);
    	this.tsBlForm3.refresh({'bl.bl_id' : this.itemId}, false);
    	this.tsBlForm3.enableField('bl.bl_id', false);
    	this.action == 'EDIT';
    },*/
    openNextTab: function(){
        if (this.contentDisabled) {
            return;
        }
        
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
    },
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
           /*
            * 新增时，在首页提供bl_id，后来变为编辑状态进行其他数据的编写
            * */ 	
        }else if(this.action == 'EDIT' &&  this.itemId != null){
        	this.tsBlForm0.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm0.enableField('bl.bl_id', false);
        	this.tsBlForm1.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm1.enableField('bl.bl_id', false);
        	this.tsBlForm2.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm2.enableField('bl.bl_id', false);
        	this.tsBlForm3.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm3.enableField('bl.bl_id', false);
        	//this.tsBlForm0.enableButton('return', false);
        }
        if (this.openerPanel.tabsStatus[this.openerPanel.selectedTabName]) {
            this.tsBlForm1.enableButton('cancel', false);
            this.tsBlForm1.enableButton('finish', true);
        }
        else {
            this.tsBlForm1.enableButton('finish', false);
        }
    }
});
