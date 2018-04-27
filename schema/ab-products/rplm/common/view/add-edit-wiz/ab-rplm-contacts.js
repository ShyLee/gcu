var rplmContactsController = View.createController('rplmContacts', {
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
    tree: null,
    restriction: '',
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        if (View.getOpenerView().controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
			this.panelContactAction.show(false, true);
            this.openerController = View.getOpenerView().controllers.get('tabsLeaseAdminMngByLocation');
            this.openerPanel = View.getOpenerView().panels.get('tabsLeaseAdminMngByLocation');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
		this.createRestriction();
    },
    formContactDetails_onCopy: function(){
        /*
         * not used, will be implemented soon
         * contact cannot be assigned to multiple buildings - database issue
         */
        var itemId = this.itemId;
        var leaseId = this.leaseId;
        var itemType = this.actionType;
        var restriction = null;
        switch (itemType) {
            case 'BUILDING':{
                restriction = new Ab.view.Restriction();
                restriction.addClause('contact.bl_id', itemId, '&lt;&gt;');
                restriction.addClause('contact.bl_id', '', 'IS NULL', 'OR', false);
                break;
            }
            case 'LAND':{
                restriction = new Ab.view.Restriction();
                restriction.addClause('contact.pr_id', itemId, '&lt;&gt;');
                restriction.addClause('contact.pr_id', '', 'IS NULL', 'OR', false);
                break;
            }
            case 'STRUCTURE':{
                restriction = new Ab.view.Restriction();
                restriction.addClause('contact.pr_id', itemId, '&lt;&gt;');
                restriction.addClause('contact.pr_id', '', 'IS NULL', 'OR', false);
                break;
            }
            case 'LEASE':{
                restriction = new Ab.view.Restriction();
                restriction.addClause('contact.ls_id', itemId, '&lt;&gt;');
                restriction.addClause('contact.ls_id', '', 'IS NULL', 'OR', false);
                break;
            }
        }
        View.openDialog('ab-rplm-contacts-list.axvw', null, true, {
            width: 800,
            height: 400,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('gridContacts');
                dialogController.itemId = itemId;
                dialogController.itemType = itemType;
                dialogController.leaseId = leaseId;
                dialogController.refreshPanels = new Array('formContactDetails');
                dialogController.refreshTree = true;//(contactId == null); 
                dialogController.gridContacts.refresh(restriction);
            }
        });
    },
    formContactDetails_onEdit: function(){
        var record = this.formContactDetails.getRecord();
        if (record.getValue('contact.contact_id') == '') {
            View.showMessage(getMessage('error_no_contact_selected'));
            return;
        }
        this.addEditContact(record.getValue('contact.contact_id'), getMessage('edit'));
    },
    formContactDetails_onDelete: function(){
        var dataSource = this.dsContactDetails;
        var record = this.formContactDetails.getRecord();
        if (record.getValue('contact.contact_id') == '') {
            View.showMessage(getMessage('error_no_contact_selected'));
            return;
        }
        var controller = this;
        View.confirm(getMessage('confirm_delete_contact'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    controller.buildTree();
                    controller.formContactDetails.refresh('contact.contact_id = null');
					if (controller.dsTreeContacts.getRecords(controller.restriction).length == 0) {
                        controller.formContactDetails.enableButton('edit', false);
                        controller.formContactDetails.enableButton('delete', false);
                    }
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
				if (controller.actionType != 'LEASE' || this.type=='PORTFOLIO') {
					controller.panelContactAction.actions.items[rplmContactsController.panelContactAction.actions.indexOfKey('continue')].show(false);
				}
            }
        })
    },
    formContactDetails_onNew: function(){
        this.addEditContact(null, getMessage('add_new'));
    },
    panelContactAction_onCancel: function(){
        var tabsController = this.openerController;
        View.confirm(getMessage('message_cancelconfirm'), function(button){
            if (button == 'yes') {
                tabsController.afterInitialDataFetch();
                tabsController.navigate('backward');
            }
        })
    },
    panelContactAction_onBack: function(){
        this.openerController.navigate('backward');
    },
    panelContactAction_onContinue: function(){
        this.openerController.navigate('forward');
    },
    panelContactAction_onFinish: function(){
        this.openerController.afterInitialDataFetch();
		this.openerPanel.tabs[0].loadView();
        this.openerController.navigateToTab(0);
    },
    buildTree: function(){
        this.createRestriction();
        this.tree = new YAHOO.widget.TreeView("contactTree");
        
        var typeRecords = this.dsTreeContactsType.getRecords(this.restriction);
		var typeValues = this.dsTreeContactsType.fieldDefs.items[this.dsTreeContactsType.fieldDefs.indexOfKey('contact.contact_type')].enumValues;
        for (var i = 0; i < typeRecords.length; i++) {
            var crtType = typeRecords[i].getValue('contact.contact_type');
			var crtLabel = typeValues[typeRecords[i].getValue('contact.contact_type')];
            var typeNode = new YAHOO.widget.TextNode({
				'id': crtType,
				'label': "<span style='color:#000080;font-family:arial,geneva,helvetica,sans-serif;font-size:11px;text-decoration:none'>" + crtLabel + "</span>"
			}, this.tree.getRoot(), true);
            var crtRestriction = new Ab.view.Restriction(this.restriction);
            crtRestriction.addClause('contact.contact_type', crtType, '=');
            var contactsRecords = this.dsTreeContacts.getRecords(crtRestriction);
            for (var j = 0; j < contactsRecords.length; j++) {
                var crtContact = contactsRecords[j].getValue('contact.contact_id');
				var company = contactsRecords[j].getValue('contact.company');
                var contactNode = new YAHOO.widget.TextNode({
					'id': crtContact,
					'label': "<span style='color:#000080;font-family:arial,geneva,helvetica,sans-serif;font-size:11px;text-decoration:none'>" + crtContact + " " + getMessage('msg_from') + " " + company + "</span>"
				}, typeNode, true);
            }
        }
        this.tree.subscribe("labelClick", function(node){
            onLabelClick(node);
        });
        this.tree.draw();
    },
    createRestriction: function(){
        switch (this.actionType) {
            case 'BUILDING':{
				if (this.itemId != null) {
					this.restriction = {
						'contact.bl_id': this.itemId
					};
				}else{
					this.restriction = 'contact.contact_id IS NULL';
				}
                break;
            }
            case 'LAND':{
				if (this.itemId != null) {
					this.restriction = {
						'contact.pr_id': this.itemId
					};
				}else{
					this.restriction = 'contact.contact_id IS NULL';
				}
                break;
            }
            case 'STRUCTURE':{
				if (this.itemId != null) {
					this.restriction = {
						'contact.pr_id': this.itemId
					};
				}else{
					this.restriction = 'contact.contact_id IS NULL';
				}
                break;
            }
            case 'LEASE':{
				if (this.leaseId != null) {
					this.restriction = {
						'contact.ls_id': this.leaseId
					};
				}else{
					this.restriction = 'contact.contact_id IS NULL';
				}
                break;
            }
        }
    },
    addEditContact: function(contactId, title){
        var itemId = this.itemId;
        var itemType = this.actionType;
        var leaseId = this.leaseId;
        View.openDialog('ab-rplm-add-edit-contact.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('addEditContact');
                dialogController.itemId = itemId;
                dialogController.itemType = itemType;
                dialogController.leaseId = leaseId;
                dialogController.contactId = contactId;
                dialogController.formAddEditContact.newRecord = (contactId == null);
                dialogController.formAddEditContact.setTitle(title);
                dialogController.refreshPanels = new Array('formContactDetails');
                dialogController.refreshTree = true;//(contactId == null); 
                if (contactId == null) {
                    dialogController.formAddEditContact.setTitle(getMessage('add_new'));
					dialogController.formAddEditContact.refresh(null, true);
                }
                else {
                    var restriction = new Ab.view.Restriction();
                    restriction.addClause('contact.contact_id', contactId);
                    dialogController.formAddEditContact.enableField('contact.contact_id', false);
                    dialogController.formAddEditContact.setTitle(getMessage('edit'));
                    dialogController.formAddEditContact.refresh(restriction);
                }
            }
        });
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
        this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    restoreSettings: function(){
		if (View.getOpenerView().controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
			this.panelContactAction.show(false, true);
		}
        this.buildTree();
        this.restriction = ('contact.contact_id = null');
        this.formContactDetails.refresh(this.restriction);
        /*
         * hide continue button if is portfolio administration
         */
        if (this.actionType != 'LEASE' || this.type=='PORTFOLIO') {
            this.panelContactAction.actions.items[this.panelContactAction.actions.indexOfKey('continue')].show(false);
        }
        if (this.formContactDetails.getRecord().getValue('contact.contact_id').length == 0) {
            this.formContactDetails.enableButton('edit', false);
            this.formContactDetails.enableButton('delete', false);
        }
    }
})

function onLabelClick(node){
    if (node.depth == 1) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('contact.contact_id', node.data['id']);
        rplmContactsController.restriction = restriction;
        rplmContactsController.formContactDetails.refresh(rplmContactsController.restriction);
		if (rplmContactsController.actionType != 'LEASE' || this.type=='PORTFOLIO') {
            rplmContactsController.panelContactAction.actions.items[rplmContactsController.panelContactAction.actions.indexOfKey('continue')].show(false);
        }
    }
    
}
