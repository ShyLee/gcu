var syncUserEmIdsController = View.createController('syncUserEmIds', {
	 afterViewLoad: function(){
    	var roleName=View.user.role;
    	if(roleName=="UNV EQ ADMIN"){
    	   this.syncUserEmIds_grid.addParameter("roleNames","afm_users.role_name in ('UNV DV EQ ADMIN','UNV EQ HEAD','UNV EQ ADMIN')");
    	}else if(roleName=="UNV STU ADMIN"){
    		this.syncUserEmIds_grid.addParameter("roleNames","afm_users.role_name in ('UNV DV STU ADMIN','UNV STU ADMIN')");
    	}
	  },
	syncUserEmIds_grid_onShowAll : function() {
		this.syncUserEmIds_grid.refresh("1=1");
	},
	
	syncUserEmIds_grid_onShowUsersWithUpdates : function() {
		var restriction = "afm_users.vpa_option5 IS NOT NULL";
		this.syncUserEmIds_grid.refresh(restriction);
	},
	syncUserEmIds_grid_onShowDifferent : function() {
		var restriction = "afm_users.em_email != afm_users.email";
		this.syncUserEmIds_grid.refresh(restriction);
	},
	
	syncUserEmIds_grid_onPropagateSelected : function() {
		var records = this.syncUserEmIds_grid.getSelectedRecords();
		if (records.length == 0) {
    		View.showMessage(getMessage('noRecordsSelected'));
    		return;
    	}
		var controller = this;
		var duplicated = false;
		View.confirm(getMessage('propagateSelected'), function(button) {
	        if (button == 'yes') {
	           	for (var i = 0; i < records.length; i++) {
	           		if (!controller.syncAllEmails(records[i])){
	           			duplicated = true;
	           		}
	           	}
	           	if (!duplicated) {
	           		View.showMessage(getMessage('propagationComplete'));
	           		controller.syncUserEmIds_grid.refresh();
	           	}
	        } 
	    });
	},
	
	syncUserEmIds_form_onUpdate : function() {
		if (this.syncUserEmIds_form.getFieldValue('afm_users.vpa_option5') == ''){
			View.showMessage("请输入新的邮箱！");
			return;
		}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_users.user_name', this.syncUserEmIds_form.getFieldValue('afm_users.user_name'));
		var record = this.afm_users_ds.getRecord(restriction);
		record.setValue('afm_users.vpa_option5', this.syncUserEmIds_form.getFieldValue('afm_users.vpa_option5'));
		
		var emailUpdate = record.getValue('afm_users.vpa_option5');
		var currentEmail = record.getValue('afm_users.email');
		if (emailUpdate == currentEmail) {
			return true; 
		}
		if (this.syncEmails(record)) {
			this.syncUserEmIds_form.refresh();
			//这个方法不可用,也没有必要
			//this.syncUserEmIds_form.save();
			this.syncUserEmIds_grid.refresh();
		}
	},
	
	syncAllEmails : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.em_email');
		
		if (this.checkForDuplicateEmails1(userRecord)) return false;
		
		var userName=userRecord.getValue("afm_users.user_name");
		var res = new Ab.view.Restriction();
		res.addClause('afm_users.user_name', userName);
		var	record=this.afm_users_ds.getRecord(res);
		
		record.setValue('afm_users.vpa_option5', emailUpdate);
		record.setValue('afm_users.email', emailUpdate);
		this.afm_users_ds.saveRecord(record);
		
		var em_id = userRecord.getValue('afm_users.user_name');
		if (em_id) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('em.em_id', em_id);
			var emRecord = this.syncUserEmIds_emDs.getRecord(restriction);
			emRecord.setValue('em.email', emailUpdate);
			this.syncUserEmIds_emDs.saveRecord(emRecord);
		}
		return true;
	},
	syncEmails : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.vpa_option5');
		var currentEmail = userRecord.getValue('afm_users.email');

		if (this.checkForDuplicateEmails(userRecord)) return false;
		
		userRecord.setValue('afm_users.email', emailUpdate);
		this.afm_users_ds.saveRecord(userRecord);
		
		var em_id = userRecord.getValue('afm_users.user_name');
		if (em_id) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('em.em_id', em_id);
			var emRecord = this.syncUserEmIds_emDs.getRecord(restriction);
			emRecord.setValue('em.email', emailUpdate);
			this.syncUserEmIds_emDs.saveRecord(emRecord);
		}
		this.syncUserEmIds_grid.refresh();
		return true;
	},
	
	checkForDuplicateEmails1 : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.em_email');
		var user_name = userRecord.getValue('afm_users.user_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_users.email', emailUpdate);
		var records = this.afm_users_ds.getRecords(restriction);
		if (records && records.length > 0) {
			var message = String.format(getMessage('duplicateEmail'), emailUpdate, user_name);
			alert(message);
			return true;
		}
		else return false;
	},
	checkForDuplicateEmails : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.vpa_option5');
		if(emailUpdate==""){
			emailUpdate = userRecord.getValue('afm_users.em_email');
			
		}
		var user_name = userRecord.getValue('afm_users.user_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('em.email', emailUpdate);
		var records = this.syncUserEmIds_emDs.getRecords(restriction);
		if (records && records.length > 0) {
			var message = String.format(getMessage('duplicateEmail'), emailUpdate, user_name);
			alert(message);
			return true;
		}
		else return false;
	}
});