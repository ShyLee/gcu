
View.createController('changeRmInfo', {

    username: '',
	oldPassword: '',
	newPassword: '',
    
    afterInitialDataFetch: function() {
        var record = this.changeRmNamePanel.getRecord();
        this.username = record.getValue('afm_users.user_name');
        this.oldPassword = record.getValue('afm_users.user_pwd');
		
        // map the ENTER key for the window to the change password event handler
        new Ext.KeyMap(document, {
            key: 13, // or Ext.EventObject.ENTER
            fn: this.changeRmNamePanel_onChange,
            scope: this
        });
    },
    
    changeRmNamePanel_onCancel: function(){
        View.closeThisDialog();
    },
    
    changeRmNamePanel_onChange: function(){
		var record = this.changeRmNamePanel.getRecord();
        this.newPassword = record.getValue('afm_users.user_pwd');
        this.savePassword();
    }
});
