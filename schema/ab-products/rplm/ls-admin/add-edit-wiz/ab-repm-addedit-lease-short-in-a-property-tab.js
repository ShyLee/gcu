var selectedProperty = "";
/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
function afterGeneratingTreeNode(treeNode){
	
	if (treeNode.level.levelIndex == 3) {
        var label = treeNode.data['ls.ls_parent_id'];
		treeNode.restriction.addClause('ls.ls_parent_id', treeNode.data['ls.ls_parent_id']);
		treeNode.setUpLabel(label);
    }
    
}

var abRepmAddEditLeaseInAProperty_ctrl = View.createController('abRepmAddEditLeaseInAProperty_ctrl' , {
	
	leaseId:null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addEdit');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		// set user country to console field
		this.abRepmAddEditLeaseInAPropertyConsole.setFieldValue("property.ctry_id", this.view.user.country);
	},
	
	showMenu: function(e, item){
        
        var menuItem = null;
        var menuItems = [];
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addNew_lease')),
            handler: this.addNew_lease.createDelegate(this)
        });
        menuItems.push(menuItem);
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addEdit_prop')),
            handler: this.open_addEditProperties.createDelegate(this)
        });
        menuItems.push(menuItem);
		menuItem = new Ext.menu.Item({
            text: getMessage('addEdit_geographical'),
            handler: this.open_addEditGeographicalLocations.createDelegate(this)
        });
        menuItems.push(menuItem);
		
		
		var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.show(this.menuParent, 'tl-bl?');
	},
	
	
	
	/**
	 * open 'Define Geographical Locations' view
	 */
    open_addEditGeographicalLocations:function(){
		
		var editMode = false;
		var country = "";
		var state = "";
		var city = "";
		
		
		if(this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.visible){
			editMode = true;
			var treeSelection = this.getTreeSelection();
			country = treeSelection['country'];
			region = treeSelection['region'];
			state = treeSelection['state'];
			city = treeSelection['city'];
			site = treeSelection['site'];
		}
				
		View.openDialog('ab-def-geo-loc.axvw', null, true, {
				width: 1200,
				height: 600,
				closeButton: false,
				afterInitialDataFetch: function(dialogView){
					if(editMode){
						var dialogController = dialogView.controllers.get('ctrlAbDefGeoLoc');
						var consolePanel = dialogController.console_AbDefGeoLoc;
						consolePanel.setFieldValue('site.ctry_id', country);
						consolePanel.setFieldValue('site.regn_id', region);
						consolePanel.setFieldValue('site.state_id', state);
						consolePanel.setFieldValue('site.city_id', city);
						consolePanel.setFieldValue('site.site_id', site);
						dialogController.refreshTree.createDelegate(dialogController)();
						var treePanel = dialogController.tree_geo_AbDefGeoLoc;
						
						
						// This is an anonymous function which will expand all the tree nodes
                        (function(treeNode){
                           
							if (!treeNode.isRoot()) {
								treePanel.refreshNode(treeNode);
								treeNode.expand();
							}
                            if(treeNode.hasChildren()){
                                for(i=0; i<treeNode.children.length; i++){
                                    var node = treeNode.children[i];
                                    arguments.callee(node);
                                }
                            }
                        })(dialogController.tree_geo_AbDefGeoLoc.treeView.getRoot());
					}
				}
			});
		
	},
	
	/**
	 * return in a JSON object the country , state , city and property selected from the tree
	 */
	
	getTreeSelection:function(){
		
		var lastNodeClicked = this.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked;
		var treeSelection = {};
		if(lastNodeClicked.level.levelIndex == 3){
			treeSelection = {
				'property':lastNodeClicked.parent.data['property.pr_id'],
				'city':lastNodeClicked.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.data['ctry.ctry_id']
			};
		}else if (lastNodeClicked.level.levelIndex == 4){
			treeSelection = {
				'property':lastNodeClicked.parent.parent.data['property.pr_id'],
				'city':lastNodeClicked.parent.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.parent.data['ctry.ctry_id']
			};
		}
		treeSelection['region'] = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('property.regn_id');
		treeSelection['site'] = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('property.site_id');
		return treeSelection;
	},
	
	/**
	 * open 'Define Locations' view
	 */
	open_addEditProperties:function(){
		
		var editMode = false;
		var property = "";
		
		
        
        if (this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.visible) {
            editMode = true;
            var treeSelection = this.getTreeSelection();
            property = treeSelection['property'];
        }
        
        View.openDialog('ab-rplm-properties-define.axvw', null, true, {
            width: 1200,
            height: 600,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                if (editMode) {
					var restriction = new Ab.view.Restriction();
					restriction.addClause("property.pr_id", property);
					dialogView.panels.get('grid_abPropertiesDefine').refresh(restriction);
				}
            }
        });
	},
	
	addNew_lease: function(){
		var lastNodeClicked = this.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked;
		if ((lastNodeClicked ==null) || ((lastNodeClicked.level.levelIndex != 2) && (lastNodeClicked.level.levelIndex != 3))){
			View.showMessage(getMessage('err_selection'));
			return;
		}
		//if a property is selected
		else if(lastNodeClicked.level.levelIndex == 2){
			this.abRepmAddEditLeaseInAPropertyAddLease_form.clear();
			this.abRepmAddEditLeaseInAPropertyAddLease_form.newRecord = true;
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.pr_id' ,lastNodeClicked.data['property.pr_id'] );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.lease_sublease' ,'LEASE' );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.lease_sublease' ,false );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.ls_parent_id' ,false );	
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.landlord_tenant' ,true );		
		}
		//if a lease is selected
		else if(lastNodeClicked.level.levelIndex == 3){
			var landlord_tenant = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('ls.landlord_tenant');
			if(landlord_tenant == 'LANDLORD'){
				View.showMessage(getMessage('err_ls_landlord'));
				return;
			}
			this.abRepmAddEditLeaseInAPropertyAddLease_form.clear();
			this.abRepmAddEditLeaseInAPropertyAddLease_form.newRecord = true;
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.pr_id' ,lastNodeClicked.parent.data['property.pr_id'] );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.lease_sublease' ,'SUBLEASE' );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.lease_sublease' ,false );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.landlord_tenant' ,'LANDLORD' );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.landlord_tenant' ,false );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.ls_parent_id' ,lastNodeClicked.data['ls.ls_parent_id'] );
			this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.ls_parent_id' ,false );

		}
		
		hidePanels();
		this.abRepmAddEditLeaseInAPropertyAddLease_form.show(true);
		setLandlordTenant(this.abRepmAddEditLeaseInAPropertyAddLease_form.fields.items[5]);
	},
	
	
	//'Delete' actions
	abRepmAddEditLeaseInAPropertyDocs_grid_onDelete: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInAPropertyDocs_ds,row.getRecord(),this.abRepmAddEditLeaseInAPropertyDocs_grid);        
    },
	
	abRepmAddEditLeaseInAPropertyBaseRents_grid_onDelete: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInAPropertyBaseRents_ds,row.getRecord(["cost_tran_recur.cost_tran_recur_id"]),this.abRepmAddEditLeaseInAPropertyBaseRents_grid);        
    },
	
	deleteRecord: function(dataSource , record, reportPanel){
		View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
	},
	
	abRepmAddEditLeaseInAPropertyLeaseInfo_form_onDelete: function(row){
		var leasePanel = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form;
		var treePanel = this.abRepmAddEditLeaseInAPropertyCtryTree;
		View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
					leasePanel.deleteRecord();
                    hidePanels();
					refreshTreePanelAfterUpdate(treePanel.lastNodeClicked.parent);
					treePanel.lastNodeClicked = null;
					treePanel.setTitle(getMessage('tree_panel_title'));
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })        
    },
	
	//'View Document' actions
    abRepmAddEditLeaseInAPropertyDocs_grid_onView: function(row){
		View.showDocument({'doc_id':row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    },
	
	//event handler for 'Use Template' action
    abRepmAddEditLeaseInAPropertyAddLease_form_onUseTemplate: function(){
    
        //check if 'ls.ls_id' field is empty
        if (!valueExistsNotEmpty(this.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_id'))) {
            View.showMessage(getMessage('err_no_lease'));
            return;
        }
        
        // if 'ls.ls_id' field is not empty then show 'abRepmAddEditLeaseInABuildingLsTmp_grid' panel in a Open Dialog
        this.abRepmAddEditLeaseInAPropertyLsTmp_grid.showInWindow({
            applyParentRestriction: false,
            newRecord: true,
            width: 600,
            height: 600
        });
        this.abRepmAddEditLeaseInAPropertyLsTmp_grid.refresh();
    }
});

/**
 * refersh tree panel after save or delete
 * @param {Object} treeNode
 */
function refreshTreePanelAfterUpdate(treeNode){

    abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree.refreshNode(treeNode);
    treeNode.expand();
}

//refresh lease associated panels
function refreshPanels(ls_id){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.ls_id" , ls_id);
	
	var controller = abRepmAddEditLeaseInAProperty_ctrl;
	
	controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.refresh(restriction);
	controller.leaseId = ls_id;
	
	if(controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked.level.levelIndex == 3){
		controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.enableField('ls.landlord_tenant', true);
	}else{
		controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.enableField('ls.landlord_tenant', false);
	}
	
	controller.abRepmAddEditLeaseInAPropertyDocs_grid.refresh(restriction);
	controller.abRepmAddEditLeaseInAPropertyBaseRents_grid.refresh(restriction);
	
}


//hide lease associated panels
function hidePanels(){
	var controller = abRepmAddEditLeaseInAProperty_ctrl;	
	controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.show(false);
	controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
	controller.abRepmAddEditLeaseInAPropertyDocs_grid.show(false);
	controller.abRepmAddEditLeaseInAPropertyBaseRents_grid.show(false);
	
}

//show lease associated panels
function showDetails(row){
	abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
	
	var ls_id = row.restriction.clauses[0].value;
	
	refreshPanels(ls_id);
}

function setCustomPeriodForBaseRentsEditPanel(panel){
	if(panel.getFieldValue('cost_tran_recur.period')=='CUSTOM'){
		panel.enableField('cost_tran_recur.period_custom' ,true);
	}else {
		panel.enableField('cost_tran_recur.period_custom' ,false);
	}
}

function filter(){
	var controller = abRepmAddEditLeaseInAProperty_ctrl;
	var consolePanel = controller.abRepmAddEditLeaseInAPropertyConsole;
	var restriction = '';
	if(consolePanel.getFieldValue('property.ctry_id')){
		restriction += " property.ctry_id = '"+consolePanel.getFieldValue('property.ctry_id')+"'";
	}
	if(consolePanel.getFieldValue('property.city_id')){
		restriction += (restriction != '')?' and ':'';
		restriction += " property.city_id = '"+consolePanel.getFieldValue('property.city_id')+"'";
	}
	if(consolePanel.getFieldValue('property.pr_id')){
		restriction += (restriction != '')?' and ':'';
		restriction += " property.pr_id = '"+consolePanel.getFieldValue('property.pr_id')+"'";
	}
	
	if(restriction){
		controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('console' , restriction);
	}else{
		controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('console' , ' 1=1 ');
	}
	hidePanels();
	controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
	controller.abRepmAddEditLeaseInAPropertyCtryTree.refresh();
	
	controller.abRepmAddEditLeaseInAPropertyCtryTree.setTitle(getMessage('tree_panel_title'));
    controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked = null;
}


//create new lease using a lease template
function createNewLease(row){
	
	var controller = abRepmAddEditLeaseInAProperty_ctrl;
    var newLsId = controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_id');
   	var lsParentId = controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_parent_id');
    var propertyId = (selectedProperty != "")?selectedProperty:controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.pr_id');
	var lease_sublease = controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.lease_sublease');
	
	try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, row['ls.ls_id'], '0', 'property' , propertyId,'LANDLORD_TENANT',lsParentId,lease_sublease);
		controller.abRepmAddEditLeaseInAPropertyLsTmp_grid.closeWindow();
		controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
        refreshPanels(newLsId);
		refreshTreePanelAfterUpdate(controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked);
		selectNewAddedTreeNode(controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked, newLsId);
    } 
    catch (e) {
        if (e.message == "Another record already exists with the same identifying value as this record -- the primary key for this record is not unique within the [{0}] table.") {
				View.showMessage(getMessage('err_lsId'));
			}
			else {
				Workflow.handleError(e);
			}
    }	
}

function setSelectedProperty(node){
	selectedProperty = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked.data['property.pr_id'];
}

/**
 * Select the new added tree node 
 * @param {Object} parentNode
 * @param {Object} lsId
 * 
 */

function selectNewAddedTreeNode(parentNode, lsId){
	
	var newAddedTreeNode = null;
	var childrenNodes = parentNode.children;
	var childDataIndex = (parentNode.level.levelIndex == 2)?'ls.ls_parent_id':'ls.ls_id';
	
	// find the node
	for(i = 0; i<childrenNodes.length; i++){
		if(childrenNodes[i].data[childDataIndex] == lsId){
			newAddedTreeNode = childrenNodes[i];
			break;
		}
	}
	
	//select the node
	parentNode.onLabelClick(newAddedTreeNode);
}

/**
 * afterRefresh event for  'abRepmAddEditLeaseInAPropertyLeaseInfo_form' panel
 * @param {Object} panel
 **/
function abRepmAddEditLeaseInAPropertyLeaseInfo_form_afterRefresh(panel){
	
	setLandlordTenant(panel.fields.items[5]);
}

/**
 * Remove from 'landlord_tenant' combobox , 'N\A' and 'BOTH' values 
 * @param {Object} field
 **/
function setLandlordTenant(field){
	
	if (field.dom.options.length > 2) {
		field.dom.remove(0);
		field.dom.remove(2);
	}
}


/**
 * 'Save' action when adding or editing a Lease
 * @param {Object} form
 * @param {Object} isNewLease
 **/

function saveLease(form , isNewLease){
	
	if(!datesValidated(form ,'ls.date_start', 'ls.date_end', getMessage('error_date_end_before_date_start'))){
		return;
	}		
	
	if (form.save() && isNewLease){
		var treePanel = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree;
		
		refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
		selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
		showDetails(treePanel.lastNodeClicked);
		treePanel.setTitle(getMessage('tree_panel_title')+' '+form.getFieldValue('ls.ls_id'));
	}
	
}
/**
 * if dateEnd < dateStart it shows an error message
 * @param {Object} form
 * @param {Object} startDateField
 * @param {Object} endDateField
 * @param {Object} errMessage
 **/

function datesValidated(form ,startDateField, endDateField, errMessage){
	// get the string value from field start date
	var date_start = form.getFieldValue(startDateField).split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue(endDateField).split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);
	
	if (dateEnd < dateStart) {
			View.showMessage(errMessage);
			return false;
	}
	return true;	
}

/**
 * 'Save' action when adding or editing: assigned documents , base rents
 * @param {Object} editFormPanel
 * @param {Object} detailsGridPanel
 * @param {Object} datesJSON
 * @param {Object} closeWindowIfIsNewRec
 **/

function saveRecord(editFormPanel, detailsGridPanel, datesJSON , closeWindowIfIsNewRec){
	
	if (datesJSON) {
	
		for (i = 0; i < datesJSON.dates.length; i++) {
		
			var startDateField = datesJSON.dates[i].startDateField;
			var endDateField = datesJSON.dates[i].endDateField;
			var errMessage = datesJSON.dates[i].errMessage;
			
			if (!datesValidated(editFormPanel, startDateField, endDateField, errMessage)) {
				return;
			}
		}
	}
	
	var isNewRecord = editFormPanel.newRecord;
	
    editFormPanel.save(); 
    detailsGridPanel.refresh();
    
	if ((closeWindowIfIsNewRec && isNewRecord) || !isNewRecord) {
		editFormPanel.closeWindow();
	}
}

/**
 * Add new base rent
 * @param ctx
 */
function addBaseRent(){
	var title = getMessage("add_base_rent");
	var controller = View.controllers.get("abRepmAddEditLeaseInAProperty_ctrl");
	var leaseId = controller.leaseId;
	addEditBaseRent(null, leaseId, title, "abRepmAddEditLeaseInAPropertyBaseRents_grid");
}

/**
 * Function edit base rent
 * @param ctx
 */
function editBaseRent(ctx){
	var gridRow = ctx.row;
	var leaseId = gridRow.getFieldValue("cost_tran_recur.ls_id");
	var costTranRecurId = gridRow.getFieldValue("cost_tran_recur.cost_tran_recur_id");
	var title = getMessage("edit_base_rent");
	addEditBaseRent(costTranRecurId, leaseId, title, "abRepmAddEditLeaseInAPropertyBaseRents_grid");
}

function addEditBaseRent(costTranRecurId, leaseId, title, panelId){
	// runtime parameters that are passed to pop-up view
	var runtimeParameters = {
			cost_tran_recur_id: costTranRecurId,
			leaseId: leaseId,
			refreshPanels: new Array(panelId),
			title: title
	}
	View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
		width:800,
		height:700, 
		closeButton:true,
		runtimeParameters: runtimeParameters
	});

}
