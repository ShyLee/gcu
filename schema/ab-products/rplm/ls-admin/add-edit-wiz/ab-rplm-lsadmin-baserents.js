var rplmBaseRentsController = View.createController('rplmBaseRents',{
	openerPanel:null,
	openerController:null,
	action:null,
	actionType:null,
	itemId:null,
	itemType:null,
	itemIsOwned:null,
	leaseId:null,
	leaseType:null,
	wizard:null,
	contentDisabled:null,
	afterInitialDataFetch: function(){
		if(View.getOpenerView().controllers.get('portfAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
		}
		if(View.getOpenerView().controllers.get('leaseAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
		}
		if(View.controllers.get('tabsLeaseAdminMngByLocation') != undefined){
			this.buttonsPanelBaseRents.actions.items[this.buttonsPanelBaseRents.actions.indexOfKey('back')].show(false);
			this.buttonsPanelBaseRents.actions.items[this.buttonsPanelBaseRents.actions.indexOfKey('continue')].show(false);
			this.buttonsPanelBaseRents.actions.items[this.buttonsPanelBaseRents.actions.indexOfKey('finish')].show(false);
			this.openerController = View.controllers.get('tabsLeaseAdminMngByLocation');
			this.openerPanel = View.panels.get('tabsLeaseAdminMngByLocation');
		}
		if(this.openerPanel.wizard.getAction() == null){
			// clean wizard object
			this.openerPanel.wizard.reset()
		}
		this.initVariables(this.openerPanel, this.openerController);
		this.restoreSettings();
	},
	gridBaseRents_onEdit: function(row){
		this.add_edit_item(row, getMessage('edit_base_rent'));
	},
	
	gridBaseRents_onDelete: function(row){
		var dataSource = this.dsBaseRents;
		var record = row.getRecord(["cost_tran_recur.cost_tran_recur_id"]);
		var reportPanel = this.gridBaseRents;
		View.confirm(getMessage('message_baserent_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
					dataSource.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
				
			}
		})
	},
	
	gridBaseRents_onNew: function(){
		this.add_edit_item(null, getMessage('add_base_rent'));
	},
	
	buttonsPanelBaseRents_onBack: function(){
		this.openerController.navigate('backward');
		var contactsController = this.openerController.leaseAdminTabs.tabs[7].getContentFrame().View.controllers.get('rplmContacts')
		contactsController.createRestriction();
        if (contactsController.dsTreeContacts.getRecords(contactsController.restriction).length == 0) {
            contactsController.formContactDetails.enableButton('edit', false);
            contactsController.formContactDetails.enableButton('delete', false);
        }
	},
	buttonsPanelBaseRents_onContinue: function(){
		this.openerController.navigate('forward');
	},
	buttonsPanelBaseRents_onFinish: function(){
		this.openerPanel.tabs[0].loadView();
		this.openerController.afterInitialDataFetch();
		this.openerController.navigateToTab(0);
	},
	initVariables: function(openerPanel, openerController){
		this.openerController = openerController;
		this.openerPanel = openerPanel;
		this.wizard = this.openerPanel.wizard;
		this.action = this.wizard.getAction();
		this.actionType = this.wizard.getActionType();
		this.itemId = this.wizard.getItemId();
		this.itemType = this.wizard.getItemType();
		this.itemIsOwned = this.wizard.getItemIsOwned();
		this.leaseId = this.wizard.getLeaseId();
		this.leaseType = this.wizard.getLeaseType();
		this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
	},
	restoreSettings: function(){
		if (this.leaseId == null) {
			this.gridBaseRents.refresh('cost_tran_recur.cost_tran_recur_id = null');
		}
		else {
			this.gridBaseRents.refresh({'cost_tran_recur.ls_id': this.leaseId});
		}	
	},
	
	add_edit_item: function(row , title){
		var cost_tran_recur_id = (row != null?row.getFieldValue('cost_tran_recur.cost_tran_recur_id'):null);
		var leaseId = this.leaseId;
		var itemId = this.itemId;
		var itemType = this.itemType;
		var openerController = this;
		// runtime parameters that are passed to pop-up view
		var runtimeParameters = {
				cost_tran_recur_id: cost_tran_recur_id,
				leaseId: leaseId,
				refreshPanels: new Array('gridBaseRents'),
				title: title
		}
		
		/*
		 * 03/30/2010 IOAN 
		 * kb 3026730 increase height of pop-up
		 */
		View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
			runtimeParameters: runtimeParameters
		});
	}
})
