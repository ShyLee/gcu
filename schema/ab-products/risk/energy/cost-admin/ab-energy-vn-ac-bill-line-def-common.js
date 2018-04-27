var ctrlAbEnergyDefBillsCommon = View.createController('ctrlAbEnergyDefBillsCommon',{
	openerController: View.getOpenerView().controllers.get("ctrlAbEnergyDefBills"),

	operDataTypes: ["VENDOR", "VENDOR ACCOUNT", "BILL", "BILL LINE"],
	
	//Operaton Data Type //'VENDOR','VENDOR ACCOUNT','BILL','BILL LINE'
    operDataType: "",
	
    // operation type: INSERT/UPDATE/DELETE
    operType: "",
    
    // prepare new bill with copied values on SaveAndAddNew bill?
    copyValuesForNewBill: false,
    
    // the values to copy from one bill to new one, on SaveAndAddNew bill
    copiedBillValues: null,
    
    afterInitialDataFetch: function(){
    	if(this.vn_AbEnergyDefBills_grid){
	    	this.vn_AbEnergyDefBills_grid.setFilterValue("vn.vendor_type", "Energ");
	    	this.vn_AbEnergyDefBills_grid.refresh();
    	}
    	if(this.vn_ac_AbEnergyDefBills_grid){
    		this.openerController.setVendorTypeParameter(this.view.getParentTab());
    		this.vn_ac_AbEnergyDefBills_grid.refresh();
    	}
    	if(this.bill_AbEnergyDefBills_grid){
    		this.openerController.setVendorTypeParameter(this.view.getParentTab());
    		this.bill_AbEnergyDefBills_grid.refresh();
    	}
    	if(this.bill_line_AbEnergyDefBills_grid){
    		this.openerController.setVendorTypeParameter(this.view.getParentTab());
    		this.bill_line_AbEnergyDefBills_grid.refresh();
    	}
    },
    
	onGridLineUserSelect: function(cmdObj){
		var userRestr = cmdObj.restriction;
		var currentTab = this.view.getParentTab();
		var tabsPanel = currentTab.parentPanel;
		var currentTabIndex = tabsPanel.tabs.length - 1;
		
		// TODO: select record in the tree

		// set restriction to the tabs after the current one
		for ( var i = 0; i < tabsPanel.tabs.length; i++) {
			var tab = tabsPanel.tabs[i];
			var restriction = new Ab.view.Restriction(userRestr);
			
			// adapt the restriction to the tab
			restriction = this.openerController.getRestrictionForTab(tab, restriction);
			
			// add the console restriction
			if(this.openerController.restriction.console){
				var consoleRestriction = this.openerController.getRestrictionForTab(tab, this.openerController.restriction.console);
				restriction.addClauses(consoleRestriction, false, true);
			}
			
			// add the tree restriction
			if(this.openerController.restriction.tree){
				var treeRestriction = this.openerController.getRestrictionForTab(tab, this.openerController.restriction.tree);
				restriction.addClauses(treeRestriction, false, true);
			}
			
			if(tab.name == currentTab.name){
				currentTabIndex = i;
				
				// for Bill and Bill Lines tabs, add vendor account to restriction
				if(currentTabIndex > 1){
					var grid = cmdObj.getParentPanel();
					var vnAcId = grid.rows[grid.selectedRowIndex]["bill.vn_ac_id"];
					userRestr["bill.vn_ac_id"] = vnAcId;
				}
				// expand the correspondent node in the tree
				this.openerController.expandTreeNodeForRestriction(this.operDataTypes[currentTabIndex], userRestr);
				
				// show the form of current tab
				var tabPanels = this.view.panels.items;
				for ( var j = 0; j < tabPanels.length; j++) {
					var panel = tabPanels[j];
					if(panel.type == "form"){
						panel.refresh(restriction, false);
						
						break;
					}
				}
			}
			
			if(i > currentTabIndex){
				// set restriction to the tab
				tabsPanel.setTabRestriction(tab.name, restriction);
				
				// hide the form of the tab
				if(tab.getContentFrame().View){
					var tabPanels = tab.getContentFrame().View.panels.items;
					for ( var j = 0; j < tabPanels.length; j++) {
						var panel = tabPanels[j];
						if(panel.type == "form"){
							panel.show(false);
						}
					}
				}
			}
		}
	},
	
	vn_AbEnergyDefBills_onSave: function(){
		this.operDataType = 'VENDOR';
		return this.commonSave('vn_AbEnergyDefBills_ds','vn_AbEnergyDefBills','vn_AbEnergyDefBills_grid');
	},
	vn_ac_AbEnergyDefBills_onSave: function(){
		this.operDataType = 'VENDOR ACCOUNT';
		var vn_ac = $('vn_ac_AbEnergyDefBills_vn_ac.vn_ac_id').value;
		$('vn_ac_AbEnergyDefBills_vn_ac.vn_ac_id').value = vn_ac.toUpperCase();
		return this.commonSave('vn_ac_AbEnergyDefBills_ds','vn_ac_AbEnergyDefBills','vn_ac_AbEnergyDefBills_grid');
	},
	bill_AbEnergyDefBills_onSave: function(){
		var checkServiceGap = this.checkServiceGap();
		if(checkServiceGap){
			this.operDataType = 'BILL';
			var saved = this.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills','bill_AbEnergyDefBills_grid');
			//onClickTreeNode();
			if(saved){
				this.setNewBillWithCopiedValues();
			}
		}
	},
	bill_line_AbEnergyDefBills_onSave: function(){	
		this.operDataType = 'BILL LINE';
		var saved = this.commonSave('bill_line_AbEnergyDefBills_ds','bill_line_AbEnergyDefBills','bill_line_AbEnergyDefBills_grid');
		if(saved){
			var billId = $('bill_line_AbEnergyDefBills_bill_line.bill_id').value;
			var billLineId = $('bill_line_AbEnergyDefBills_bill_line.bill_line_id').value;
			var vnId = $('bill_line_AbEnergyDefBills_bill_line.vn_id').value;
			this.rollUp(billId, vnId, billLineId);
			
			var billRestriction = new Ab.view.Restriction();
			billRestriction.addClause('bill_line.bill_id', billId, '=');
			billRestriction.addClause('bill_line.bill_line_id', billLineId, '=');
			billRestriction.addClause('bill_line.vn_id', vnId, '=');
			
			this.bill_line_AbEnergyDefBills.refresh(billRestriction); 
			//refresh the tab
			//var tabs = View.panels.get('tabs_AbEnergyDefBills');
			//tabs.refreshTab("tab_bill_line_AbEnergyDefBills");			
		}
		return saved;
	},

	commonSave: function(dataSource, panel, gridPanel){
		var formPanel = View.panels.get(panel);
		if (!formPanel.newRecord) {
		    this.operType = "UPDATE";
		}
		else {
		    this.operType = "INSERT";
		}

		if (formPanel.save()) {
			// refresh the grid panel
			View.panels.get(gridPanel).refresh();
			/*
		    //refresh tree panel and edit panel
		    this.onRefreshPanelsAfterSave(formPanel);
		    //get message from view file			 
		    var message = getMessage('formSaved');
		    //show text message in the form	
				
		    formPanel.displayTemporaryMessage(message);
		    */
		    return true;
		}
		return false;
	},

	rollUp: function(billId, vnId, billLineId){
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-addNewBillLineItem', billId, vnId, billLineId);
		if (result.code != 'executed') {
			View.showMessage(getMessage("msg_error_bill_update").replace('{0}', billId));
		}
	},

	checkServiceGap: function(){
		var controller = this;
		var billId = $('bill_AbEnergyDefBills_bill.bill_id').value;
		var vnId = $('bill_AbEnergyDefBills_bill.vn_id').value;
		var vnAcId = $('bill_AbEnergyDefBills_bill.vn_ac_id').value;
		var date_service_start = $('bill_AbEnergyDefBills_bill.date_service_start').value;
		var dateArr=[];
		if(date_service_start.split('/').length>1){
			dateArr=date_service_start.split('/');
			date_service_start=this.getFormatDate(dateArr,'/');
		}
		if(date_service_start.split('-').length>1){
			dateArr=date_service_start.split('-');
			date_service_start=this.getFormatDate(dateArr,'-');
		}
	
		var start_time_period = $('bill_AbEnergyDefBills_bill.time_period').value;
		
		if(billId == '' || vnId == '' || vnAcId  == '' || date_service_start == '' ||  start_time_period == ''){
			return true;
		}
	
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-checkServiceGap', billId, vnId, vnAcId, date_service_start, start_time_period);
		if (result.code == 'executed') {
			if(result.value == false){
				var msg = getMessage('msg_service_gap');
				View.confirm(msg, function(button) {
					if (button == 'yes') {
						controller.operDataType = 'BILL';
						var saved = controller.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills','bill_AbEnergyDefBills_grid');
						//onClickTreeNode();
						if(saved){
							controller.setNewBillWithCopiedValues();
						}
					}
				});
			}else{
				return true;
			}
		}
	},
	
	getFormatDate:function(dateArr,tag){
		if(tag=='/'){
			return 0 + dateArr[0]+"/"+dateArr[1]+"/"+dateArr[2];
		}else{
			if(dateArr[1]<10){
				dateArr[1]=0+dateArr[1];
			}
			if(dateArr[2]<10){
				dateArr[2]=0+dateArr[2];
			}
			return dateArr[0]+"/"+dateArr[1]+"/"+dateArr[2];
		}
		
	},
	
	vn_ac_AbEnergyDefBills_afterRefresh: function(){
		var form = this.vn_ac_AbEnergyDefBills;
		var vnId = form.getFieldValue("vn_ac.vn_id");
		
		if(form.newRecord){
			if(valueExistsNotEmpty(vnId)){
				var ds = this.vn_ac_AbEnergyDefBills_ds_vn;
				var restriction = new Ab.view.Restriction();
				restriction.addClause("vn.vn_id", vnId, "=");
				var records = ds.getRecords(restriction);
				if (records.length > 0){
					var record = records[0];
					if(!valueExistsNotEmpty(form.getFieldValue("vn_ac.remit_address1"))){
						form.setFieldValue('vn_ac.remit_address1', record.getValue("vn.address1"));
					}
					if(!valueExistsNotEmpty(form.getFieldValue("vn_ac.remit_address2"))){
						form.setFieldValue('vn_ac.remit_address2', record.getValue("vn.address2"));
					}
				}
			}
		}
	},

	bill_AbEnergyDefBills_afterRefresh: function(){
		//KB3035528 - disable "Send for Approval" until the bill has at least one line entered
		if(!this.bill_AbEnergyDefBills.newRecord){
			var billId = $('bill_AbEnergyDefBills_bill.bill_id').value;
			var vnId = $('bill_AbEnergyDefBills_bill.vn_id').value;	
			var billCount;
			var controller = this;
			var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-getBillLineCount', billId, vnId);
			if(result.code == 'executed') {
				billCount = result.value;
			}		
			if(billCount < 1){
				this.bill_AbEnergyDefBills.enableButton("sendForApproval", false);	
			}
		} else {
			// new record, initialize some values
			var form = this.bill_AbEnergyDefBills;
			var grid = this.bill_AbEnergyDefBills_grid;
			if(grid.restriction){
				var vnClause = grid.restriction.findClause("bill.vn_id");
				if(vnClause){
					form.setFieldValue('bill.vn_id', vnClause.value);
				}
				var vnAcClause = grid.restriction.findClause("bill.vn_ac_id");
				if(vnAcClause){
					form.setFieldValue('bill.vn_ac_id', vnAcClause.value);
				}
			}
			var vnId = form.getFieldValue("bill.vn_id");
			var vnAcId = form.getFieldValue("bill.vn_ac_id");
			if(valueExistsNotEmpty(vnAcId)){
				var myRestriction = new Ab.view.Restriction();
				myRestriction.addClause("vn_ac.vn_id", vnId, "=");
				myRestriction.addClause("vn_ac.vn_ac_id", vnAcId, "=");
				var record = this.openerController.tree_vn_ac_AbEnergyDefBills_ds.getRecord(myRestriction);
				var bill_type = record.getValue('vn_ac.bill_type_id');
				var site_id = record.getValue('vn_ac.site_id');
				var bl_id = record.getValue('vn_ac.bl_id');
				if(!valueExistsNotEmpty(form.getFieldValue("bill.bill_type_id"))){
					form.setFieldValue('bill.bill_type_id', bill_type);
				}
				if(!valueExistsNotEmpty(form.getFieldValue("bill.site_id"))){
					form.setFieldValue('bill.site_id', site_id);
				}
				if(!valueExistsNotEmpty(form.getFieldValue("bill.bl_id"))){
					form.setFieldValue('bill.bl_id', bl_id);
				}
			}
		}
	},
	
	bill_line_AbEnergyDefBills_afterRefresh: function(){
		var form = this.bill_line_AbEnergyDefBills;
		form.enableField('bill_line.bill_type_id', true);

		if(this.bill_line_AbEnergyDefBills.newRecord){
			// new record, initialize some values
			var grid = this.bill_line_AbEnergyDefBills_grid;
			if(grid.restriction){
				var vnId = form.getFieldValue("bill_line.vn_id");
				var vnAcClause = grid.restriction.findClause("bill.vn_ac_id");
				if(vnAcClause){
					var vnAcId = vnAcClause.value;
					if(valueExistsNotEmpty(vnAcId)){
						var myRestriction = new Ab.view.Restriction();
						myRestriction.addClause("vn_ac.vn_id", vnId, "=");
						myRestriction.addClause("vn_ac.vn_ac_id", vnAcId, "=");
						var record = this.openerController.tree_vn_ac_AbEnergyDefBills_ds.getRecord(myRestriction);
						var bill_type = record.getValue('vn_ac.bill_type_id');
						if(!valueExistsNotEmpty(form.getFieldValue("bill_line.bill_type_id"))){
							form.setFieldValue('bill_line.bill_type_id', bill_type);
						}
						form.enableField('bill_line.bill_type_id', false);
					}
				}
			}
			// set bill type of parent bill
			var billId = form.getFieldValue("bill_line.bill_id");
			if(valueExistsNotEmpty(billId)){
				var restriction = new Ab.view.Restriction();
				restriction.addClause('bill.bill_id', billId, '=');
			    var parameters = {
			            tableName: 'bill',
			            fieldNames: toJSON(['bill.bill_id', 'bill.bill_type_id']),
			            restriction: toJSON(restriction)
			        };
				try{
					var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
					if(result.code == "executed" && result.data.records.length > 0){
						form.setFieldValue('bill_line.bill_type_id', result.data.records[0]['bill.bill_type_id']);
						form.enableField('bill_line.bill_type_id', false);
					}
				}catch (e){
					Workflow.handleError(e);
				}
				// set max value + 1 from database to bill_line_id field
				form.setFieldValue("bill_line.bill_line_id", this.getNewBillLineId(billId));
			}
		}
	},

	vn_AbEnergyDefBills_onDelete: function(){
		this.operDataType = 'VENDOR';
		this.commonDelete('vn_AbEnergyDefBills_ds','vn_AbEnergyDefBills','vn_AbEnergyDefBills_grid','vn.vn_id');
		
	},
	vn_ac_AbEnergyDefBills_onDelete: function(){
		this.operDataType = 'VENDOR ACCOUNT';
		this.commonDelete('vn_ac_AbEnergyDefBills_ds','vn_ac_AbEnergyDefBills','vn_ac_AbEnergyDefBills_grid','vn_ac.vn_ac_id');
		
	},
	bill_AbEnergyDefBills_onDelete: function(){
		this.operDataType = 'BILL';
		this.commonDelete('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills','bill_AbEnergyDefBills_grid','bill.bill_id');
		
	},
	bill_line_AbEnergyDefBills_onDelete: function(){
		this.operDataType = 'BILL LINE';
		this.commonDelete('bill_line_AbEnergyDefBills_ds','bill_line_AbEnergyDefBills','bill_line_AbEnergyDefBills_grid','bill_line.bill_line_id');
	},
    /**
     * common delete function for detail tabs
     * parameters associated to selected details panel
     * @param {Object} dataSourceId
     * @param {Object} formPanelId
     * @param {Object} primaryFieldFullName
     */
    commonDelete: function(dataSourceId, formPanelId, gridPanelId, primaryFieldFullName){
        this.operType = "DELETE";
        var dataSource = View.dataSources.get(dataSourceId);
        var formPanel = View.panels.get(formPanelId);
        var gridPanel = View.panels.get(gridPanelId);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }

    	var billId = "";
    	var billLineId = "";
    	var vnId = "";    	
        if(primaryFieldFullName == 'bill_line.bill_line_id'){
        	billId = $('bill_line_AbEnergyDefBills_bill_line.bill_id').value;
        	billLineId = $('bill_line_AbEnergyDefBills_bill_line.bill_line_id').value;
        	vnId = $('bill_line_AbEnergyDefBills_bill_line.vn_id').value;    	
        	record.removeValue("bill.vn_ac_id"); // avoid the error on delete
        }
        
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    if(primaryFieldFullName == 'bill_line.bill_line_id'){
                    	controller.rollUp(billId, vnId, billLineId);
                    }
                } 
                catch (e) {
                //errorDelete IS NOT DEFINED IN THE AXVW.
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }             
                //controller.refreshTreePanelAfterUpdate(formPanel);
                gridPanel.refresh();
                formPanel.show(false);
            }
        })
    },
	
	bill_AbEnergyDefBills_onSendForApproval: function(billId, vnId, billLineId){
		var billId = $('bill_AbEnergyDefBills_bill.bill_id').value;
		var vnId = $('bill_AbEnergyDefBills_bill.vn_id').value;	
		var billCount;
		var controller = this;
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-getBillLineCount', billId, vnId);
		if(result.code == 'executed') {
			billCount = result.value;
		}		
		if(billCount < 1){
			View.showMessage(getMessage("msg_error_no_line"));
		}else{
			var msg = getMessage("msg_confirm_approval");
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					$('bill_AbEnergyDefBills_bill.status').value = "Pending Approval";	
					controller.operDataType = 'BILL';
					controller.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills','bill_AbEnergyDefBills_grid');
					controller.rollUp(billId, vnId, "-1");
					controller.bill_AbEnergyDefBills_grid.refresh();
					controller.bill_AbEnergyDefBills.show(false, false);
				}
			});			
		}		
	},
	
	bill_AbEnergyDefBills_grid_onSendForApprovalMulti: function(){
		var selectedRows = this.bill_AbEnergyDefBills_grid.getSelectedRecords();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msg_items_selected'));
			return false;
		}
		
		var controller = this;
		var msg = getMessage("msg_confirm_approval_multi");
		View.confirm(msg, function(button) {
			if (button == 'yes') {
				var recordsChanged = false;
				for ( var i = 0; i < selectedRows.length; i++) {
					var selectedRow = selectedRows[i];
					var billId = selectedRow.getValue("bill.bill_id");
					var vnId = selectedRow.getValue("bill.vn_id");
					var billCount = 0;
					
					var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-getBillLineCount', billId, vnId);
					if(result.code == 'executed') {
						billCount = result.value;
					}		
					if(billCount > 0){
						selectedRow.setValue("bill.status", "Pending Approval");
						controller.bill_AbEnergyDefBills_ds.saveRecord(selectedRow);
						controller.rollUp(billId, vnId, "-1");
						recordsChanged = true;
					}
				}
				
				if(recordsChanged){
					controller.bill_AbEnergyDefBills_grid.refresh();
					controller.bill_AbEnergyDefBills.show(false, false);
				}
			}
		});			
	},
	
	vn_ac_AbEnergyDefBills_onSaveAndAddNew: function(){
		var form = this.vn_ac_AbEnergyDefBills;
		
		// copy current values
		var copiedValues = this.copyFormFields(form);
		
		//save the form
		var saved = this.vn_ac_AbEnergyDefBills_onSave();
		if(saved){
			form.refresh(null, true);
			
			// set the copied values
			this.setCopiedValues(form, copiedValues);
			
			// clear vn_ac_id field
			form.fields.get("vn_ac.vn_ac_id").clear();
		}
	},
	
	bill_AbEnergyDefBills_onSaveAndAddNew: function(){
		var form = this.bill_AbEnergyDefBills;
		
		// copy current values
		this.copiedBillValues = this.copyFormFields(form);
		this.copyValuesForNewBill = true;
		
		//save the form
		this.bill_AbEnergyDefBills_onSave();
	},
	
	setNewBillWithCopiedValues: function(){
		if(!this.copyValuesForNewBill){
			return;
		}
		
		var form = this.bill_AbEnergyDefBills;
		
		form.refresh(null, true);
		
		// set the copied values
		this.setCopiedValues(form, this.copiedBillValues);
		
		// clear vn_ac_id field
		form.fields.get("bill.bill_id").clear();
		
		this.copyValuesForNewBill = false;
	},
	
	bill_line_AbEnergyDefBills_onSaveAndAddNew: function(){
		var form = this.bill_line_AbEnergyDefBills;
		var billId = form.getFieldValue("bill_line.bill_id");
		
		// copy current values
		var copiedValues = this.copyFormFields(form);
		
		//save the form
		var saved = this.bill_line_AbEnergyDefBills_onSave();
		if(saved){
			form.refresh(null, true);
			
			// set the copied values
			this.setCopiedValues(form, copiedValues);
			
			// set max value + 1 from database to bill_line_id field
			form.setFieldValue("bill_line.bill_line_id", this.getNewBillLineId(billId));
			
			// clear some fields
			form.fields.get("bill_line.qty").clear();
			form.fields.get("bill_line.amount_expense").clear();
			form.fields.get("bill_line.amount_income").clear();
		}
	},

	copyFormFields: function(form){
		var values = {}
		form.fields.each(function(field){
			var fieldDef = field.fieldDef;
			if(!fieldDef.isDocument && valueExistsNotEmpty(form.getFieldValue(fieldDef.id))){
				values[fieldDef.id] = form.getFieldValue(fieldDef.id);
			}
		});
		return values;
	},
	
	setCopiedValues: function(form, copiedValues){
		form.fields.each(function(field){
			var fieldDef = field.fieldDef;
			if(!fieldDef.isDocument && valueExistsNotEmpty(copiedValues[fieldDef.id])){
				form.setFieldValue(fieldDef.id, copiedValues[fieldDef.id]);
			}
		});
	},
	
	getNewBillLineId: function(billId){
		var maxValue = "1";
		var ds = this.bill_line_AbEnergyDefBills_ds_max;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bill_line.bill_id", billId, "=");
		var records = ds.getRecords(restriction);
		if (records.length > 0){
			var parsedValue = new Number(ds.parseValue("bill_line.vf_max", records[0].getValue("bill_line.vf_max"), false));
			parsedValue += 1;
			maxValue = ds.formatValue("bill_line.vf_max", parsedValue);
		}
		return maxValue;
	},
	
	selectValueTimePeriod: function(){
		var startDate = this.bill_AbEnergyDefBills.getFieldValue("bill.date_service_start");
		var startMonth = "";
		if(valueExistsNotEmpty(startDate)){
			startMonth = startDate.slice(0,7);
		}
		
		var endDate = this.bill_AbEnergyDefBills.getFieldValue("bill.date_service_end");
		var endMonth = "";
		if(valueExistsNotEmpty(endDate)){
			var date = new Date(parseInt(endDate.slice(0,4),10), parseInt(endDate.slice(5,7),10)-1, parseInt(endDate.slice(8,10),10));
			date = DateMath.add(date, DateMath.MONTH, 3);
			endMonth = FormattingDate(date.getDate(),date.getMonth()+1,date.getFullYear(),"YYYY-MM");
		} else {
			endDate = new Date();
			endMonth = FormattingDate(endDate.getDate(),endDate.getMonth()+1,endDate.getFullYear(),"YYYY-MM");
		}
		
		var timePeriod = "time_period <= '" + endMonth + "'";
		if(valueExistsNotEmpty(startMonth)){
			timePeriod += " AND time_period >= '" + startMonth + "'";
		}
		this.bill_AbEnergyDefBills_grid_time.addParameter("timePeriod", timePeriod);
		this.bill_AbEnergyDefBills_grid_time.showInWindow({
		    width: 200,
		    height: 500,
		    closeButton: true
		});
		this.bill_AbEnergyDefBills_grid_time.refresh();
	},
	
	onSelectTimePeriod: function(cmdObj){
		this.bill_AbEnergyDefBills.setFieldValue("bill.time_period", cmdObj.restriction["energy_time_period.time_period"]);
		this.bill_AbEnergyDefBills_grid_time.closeWindow();
	},
	
	bill_AbEnergyDefBills_grid_time_onSeeAll: function(){
		this.bill_AbEnergyDefBills_grid_time.addParameter("timePeriod", "1=1");
		this.bill_AbEnergyDefBills_grid_time.refresh();
	},
	
	vn_AbEnergyDefBills_grid_afterRefresh: function(){
		/* if the user changed the vendor type in the filter miniconsole,
		 * we must refresh the view
		 */
		var elem = $(this.vn_AbEnergyDefBills_grid.getFilterInputId("vn.vendor_type"));
		if (null != elem) {
			if(this.openerController.restriction.vendorType != elem.value){
				this.openerController.restriction.vendorType = elem.value;
				this.openerController.restriction.tree = null;
				this.openerController.filterConsole_onShow();
			}
		}
	}

    /**
     * refresh tree panel and edit panel after save
     * @param {Object} curEditPanel
     *
    onRefreshPanelsAfterSave: function(curEditPanel){
        //refresh the tree panel
        this.refreshTreePanelAfterUpdate(curEditPanel);
        
		if(this.crtTreeNode == null){
			this.refreshTree();
		} 
	
        //refresh the edit form panel
        var restriction = curEditPanel.getPrimaryKeyRestriction();
  //    var restriction = curEditPanel.getFieldRestriction(true);
        
        if (curEditPanel.newRecord) {
            restriction.removeClause("isNew");
            curEditPanel.newRecord = false;
            curEditPanel.record.values["isNew"] = false;
            curEditPanel.record.oldValues["isNew"] = false;
        }
   
        if(this.operDataType != 'BILL'){
			curEditPanel.refresh(restriction);
		}
    }*/
});

function selectBillUnit() {
	var restriction;
	var bill_type_id = View.panels.get('bill_line_AbEnergyDefBills').getFieldValue('bill_line.bill_type_id');
	if(bill_type_id){
		restriction = "bill_unit.bill_type_id='" + bill_type_id + "'";
	} else {
		restriction = "bill_unit.bill_type_id IN (SELECT bill_type_id FROM bill_type WHERE activity_id IS NULL)";
	}
	View.selectValue({
		formId: 'bill_line_AbEnergyDefBills',
		title: getMessage('msg_bill_units'),
		fieldNames: ['bill_line.bill_type_id','bill_line.bill_unit_id'],
		selectTableName: 'bill_unit',
		selectFieldNames: ['bill_unit.bill_type_id','bill_unit.bill_unit_id'],
		visibleFieldNames: ['bill_unit.bill_type_id','bill_unit.bill_unit_id'],
		restriction: restriction
	});
}
