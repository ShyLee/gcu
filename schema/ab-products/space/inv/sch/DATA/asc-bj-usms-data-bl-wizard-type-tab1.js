var rplmTypeController = View.createController('rplmType', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemName: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
    
    bl_id_temp: null,//临时的bl_id
	afterViewLoad: function(){
		this.buildLabels();
		//this.rplmTypeForm.actions.get("continue").enable(false);
	},
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        /*if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }*/
        if (this.openerPanel.wizard.getAction() == null) {
            // clean wizard object
            this.openerPanel.wizard.reset()
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
		setAction();
        setItems();
    },
    
    
  rplmTypeForm_onContinue: function(){
        if (this.action == null || this.actionType == null) {
            View.showMessage(getMessage('error_noitemselected'));
            return;
        }
        if (this.actionType != this.wizard.getActionType() ||
        (this.actionType == 'this.actionType' && this.itemType != this.wizard.getItemType())) {
            this.wizard.reset();
            for (var i = 1; i < this.openerPanel.tabs.length; i++) {
                this.openerPanel.tabsStatus[this.openerPanel.tabs[i].name] = false;
                //this.openerController.setTab(this.openerPanel.tabs[i].name, true, true);
            }
        }
        if (this.action == 'ADD' && this.itemId == null) {
            	View.showMessage(getMessage('error_add_noblid'));
                return;   
        }
        if (this.action == 'EDIT' && this.actionType == 'BUILDING' && this.itemId == null) {
                View.showMessage(getMessage('error_edit_nobldgselected'));
                return;
        }
        if (this.action == 'DELETE' && this.actionType == 'BUILDING' && this.itemId == null) {
                View.showMessage(getMessage('error_edit_nobldgselected'));
                return;
        }
       
        this.wizard.setAction(this.action);
        this.wizard.setActionType(this.actionType);
        this.wizard.setItemId(this.itemId);
        this.wizard.setItemName(this.itemName);
        this.wizard.setItemType(this.itemType);
        this.wizard.setItemIsOwned(this.itemIsOwned);
        this.wizard.setLeaseId(this.leaseId);
        this.wizard.setLeaseType(this.leaseType);
        this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
        this.openerController.checkTabs();
      
        if (this.actionType == 'BUILDING' && this.action == 'EDIT') {
        	this.openerController.navigate('forward');
        	this.openerController.hideIndex();
        }else if (this.actionType == 'BUILDING' && this.action == 'ADD')  {
        	
            if(this.itemId != null){
            	/*var panel = this.tsBlForm;
            	panel.setFieldValue('bl.bl_id',this.bl_id_temp);
    	    	panel.setFieldValue('bl.use1',"默认值");
    	    	panel.save();
    	    	panel.show(false);
    	    	//因为有大小写问题，所以，我们把panel刷新一下，重新从数据库中把值读取出来
    	    	this.bl_id_temp = panel.getFieldValue('bl.bl_id');*/
            	//新增数据成功后，选择继续按钮，进入到编辑状态
    	    	this.action = 'EDIT';
    		    //this.itemId = this.bl_id_temp;
    		    this.wizard.setAction(this.action);
    		    this.wizard.setItemId(this.itemId);
    		    this.wizard.setItemName(this.itemName);
    		    this.openerController.navigate('forward');
    		    this.openerController.hideIndex();
            }
    	 
        }else if(this.actionType == 'BUILDING' && this.action == 'DELETE'){
        	var bl_id = this.itemId;
        	var ds = this.tsBl;
        	var record = new Ab.data.Record({ 
        	    'bl.bl_id': bl_id
        	    	}); 
        	View.confirm(getMessage("confirm_delete_label") + ": " + bl_id, function(button) { 
        	    if (button == 'yes') { 
        	    	ds.deleteRecord(record);
        	    	View.showMessage("记录:" + bl_id + "删除成功!");
        	    	//location.reload();
        	    } 
        	});
        }
        
        
    },

    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemName = this.wizard.getItemName();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    
    buildLabels: function(){
        $('radioActionLabel').innerHTML = getMessage('radio_action_label');
        $('radioItemLabel').innerHTML = getMessage('radio_item_label');
		$('actions').options[0].innerHTML = getMessage('actions_opt0_label');
		$('actions').options[1].innerHTML = getMessage('actions_opt1_label');
		//$('actions').options[2].innerHTML = getMessage('actions_opt2_label');
		$('items').options[0].innerHTML = getMessage('items_opt0_label');
    },
    
    restoreSettings: function(){
        /*
         * initialize view and
         * restore saved data in case that user change something without save
         */
        this.removeButtons();
        
        var itemsObj = document.getElementsByName("items");
        var currActionValue = $('currActionValue');
        var currActionItemValue = $('currActionItemValue');
        var currActionItemSelectValue = $('currActionItemSelectValue');
        var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
        var selectValueActionLabel = $('selectValueActionLabel');
        
        var btnObject = document.getElementById("btnItem" + itemsObj[0].selectedIndex);
        
        if (this.action == 'ADD') {
            if (this.actionType == 'BUILDING') {
               // currActionItemValue.innerHTML = getMessage('continue_label');
            }
            else 
                if (this.actionType == 'LEASE') {
                    currActionItemValue.innerHTML = '&#160;';
                }
            selectValueActionLabel.innerHTML = '&#160;';
            currActionItemSelectValue.innerHTML = '&#160;';
            currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
        }
        
        if (btnObject != undefined) {
            if (this.action == 'EDIT' && this.actionType == 'BUILDING' && btnObject.id == 'btnItem0') {
                selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                btnObject.style.display = '';
                btnObject.value = getMessage('title_building') + '...';
                currActionItemSelectValue.innerHTML = '&#160;';
                currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                
                $('AddNewBlIdLabel').innerHTML = '&#160;';
                $('newBlContinueLabel').innerHTML = '&#160;';
                $('blIdText').style.display = 'none';

                
            }else if(this.action == 'DELETE' && this.actionType == 'BUILDING' && btnObject.id == 'btnItem0'){
            	 selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                 btnObject.style.display = '';
                 btnObject.value = getMessage('title_building') + '...';
                 currActionItemSelectValue.innerHTML = '&#160;';
                 currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                 
                 $('AddNewBlIdLabel').innerHTML = '&#160;';
                 $('newBlContinueLabel').innerHTML = '&#160;';
                 
            }
            else{
	                    //btnObject.style.display = 'none';
	            	 $('AddNewBlIdLabel').innerHTML = getMessage('add_new_bl_id_label');
	            	 $('blIdText').style.display = 'table-cell';
	            	 
                }
            
        }
        this.showSelection();
    },
    showSelection: function(){
        var currActionItemSelectValue = $('currActionItemSelectValue');
        var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
        if ((this.itemId != undefined && this.itemId != null) && (this.itemType != undefined && this.itemType != null)) {
            if (this.itemType == 'BUILDING' && this.action == 'EDIT') {
            	//this.rplmTypeForm.actions.get("continue").enable(true);
                currActionItemSelectValue.innerHTML = getMessage('title_building_selected') + ': ' + this.itemId;
                currActionItemSelectValueContinueLabel.innerHTML = getMessage('continue_label');
                
            }else if(this.itemType == 'BUILDING' && this.action == 'DELETE'){
            	//this.rplmTypeForm.actions.get("continue").enable(true);
            	currActionItemSelectValue.innerHTML = getMessage('title_building_selected') + ': ' + this.itemId;
                currActionItemSelectValueContinueLabel.innerHTML = getMessage('continue_delete_label');
               
            }
        }
        this.openerController.showSelection({
            'action': this.action,
            'type': this.actionType,
            'item': this.itemName,
            'itemType': this.itemType,
            'lease': this.leaseId
        });
    },
   // hide buttons
    removeButtons: function(){
        document.getElementById("btnItem0").style.display = 'none';
    },
    // 保存临时的bl_id值
    saveBlId: function(){
       var bl_id = $('blIdText').value;
       $('blIdText').value = "";
       if(bl_id == ""){
    	   View.showMessage(getMessage('error_add_noblid'));
    	   return;
       }
       this.bl_id_temp = bl_id;
       this.openerController.showSelection({
           'action': this.action,
           'type': this.actionType,
           'item': this.itemName,
           'itemType': this.itemType,
           'lease': this.leaseId
       });
       this.tsBlForm.show(true);
       this.tsBlForm.setFieldValue('bl.bl_id',this.bl_id_temp);
       this.tsBlForm.showInWindow({
	   		width: 800,
	   		height: 500
	   	});
    },
    clearTsBlForm: function(){
       //this.tsBlForm.setFieldValue('bl.bl_id',this.bl_id_temp);
    	this.tsBlForm.setFieldValue('bl.site_id',"");
    	this.tsBlForm.setFieldValue('bl.pr_id',"");
    	this.tsBlForm.setFieldValue('bl.name',"");
    	this.tsBlForm.setFieldValue('bl.use1',"");
    	this.tsBlForm.setFieldValue('bl.area_building_manual',"");
    },
    saveTsBlForm: function(){
    	if(this.tsBlForm.canSave()){
    		var a = this.tsBlForm.save();
    		if(a == false){//证明数据库中已存在此条数据，可能已下帐
    			this.tsBlForm.closeWindow();
    			return ;
    		}
    		this.tsBlForm.closeWindow();
    		this.bl_id_temp = this.tsBlForm.getFieldValue('bl.bl_id');
    		var bl_name = this.tsBlForm.getFieldValue('bl.name');
    		this.itemId = this.bl_id_temp;
    		this.itemName = bl_name;
    		$('newBlContinueLabel').innerHTML = getMessage('add_new_bl_id_label_continue1')  + this.bl_id_temp + "; "
    	    + getMessage('add_new_bl_id_label_continue2');
    		$('blIdText').value = this.itemId;
    		this.openerController.showSelection({
                'action': this.action,
                'type': this.actionType,
                'item': this.itemName,
                'itemType': this.itemType,
                'lease': this.leaseId
            });
    	}
    }
        
    
});

//event listener for clicking on selection buttons
function setItemValue(pTypeL, index, pActionTypeL, restrictByLease){
    var selectedId = rplmTypeController.itemId;
    var action = rplmTypeController.action;
	
    View.openDialog('asc-bj-usms-data-bl-wizard-type-tab1-dialog.axvw', null, true, {
        width: 800,
        height: 600,
        closeButton: false,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('abRplmBldgPropList');
            dialogController.selectedType = pTypeL;
            dialogController.selectedId = selectedId;
            dialogController.openerController = rplmTypeController;
            if (pTypeL == 'BUILDING') {
                dialogController.gridBuildingList.show(true, false);
                if(restrictByLease && action == 'EDIT'){
					dialogController.gridBuildingList.addParameter('restricByLease', ' bl.bl_id in (select distinct ls.bl_id from ls)');
				}
				dialogController.gridBuildingList.refresh();
                dialogController.gridBuildingList.setTitle(getMessage('title_building'));
            }
            dialogController.restoreSelection();
        }
    });
}

function setItem(pTypeL, value){
    var selected = value;
    switch (pTypeL) {
        case 'ACTION':{
        
            var currActionItemValue = $('currActionItemValue');
            var currActionItemSelectValue = $('currActionItemSelectValue');
            var selectValueActionLabel = $('selectValueActionLabel');
            var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
            currActionItemValue.innerHTML = '&#160;';
            currActionItemSelectValue.innerHTML = '&#160;';
            selectValueActionLabel.innerHTML = '&#160;';
            currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
            rplmTypeController.action = selected;
            rplmTypeController.itemId = null;
            rplmTypeController.itemName = null;
            rplmTypeController.itemIsOwned = null;
            rplmTypeController.leaseId = null;
            rplmTypeController.leaseType = null;
			break;
        }
        
        case 'ITEM':{
            if (rplmTypeController.actionType != selected) {
                rplmTypeController.actionType = selected;
                rplmTypeController.itemType = selected;
                rplmTypeController.itemId = null;
                rplmTypeController.itemName = null;
                rplmTypeController.itemIsOwned = null;
                rplmTypeController.leaseId = null;
                rplmTypeController.leaseType = null;
            }
            break;
        }
        /*
        case 'LEASE':{
            rplmTypeController.actionType = 'LEASE';
            if ((selected == 'BUILDING' && rplmTypeController.itemType != 'BUILDING') ||
            (selected == 'PROPERTY' && rplmTypeController.itemType != 'PROPERTY')) {
                rplmTypeController.itemType = selected;
                rplmTypeController.itemId = null;
                rplmTypeController.itemIsOwned = null;
                rplmTypeController.leaseId = null;
                rplmTypeController.leaseType = null;
            }
            break;
        }
        */
    }
    rplmTypeController.restoreSettings();
}

//event listener for selecting an option from "Actions"	combo box
function setAction(){
    if (document.getElementsByName("action")[0].selectedIndex == 0) {
        setItem('ACTION', 'ADD');
    }
    else if(document.getElementsByName("action")[0].selectedIndex == 1) {
        setItem('ACTION', 'EDIT');
    }else{
    	setItem('ACTION', 'DELETE');
    }
}
//event listener for selecting an option from "Items"	combo box
function setItems(){

    if (document.getElementsByName("items")[0].selectedIndex == 0) {
        setItem('ITEM', 'BUILDING');
    }
    
}


