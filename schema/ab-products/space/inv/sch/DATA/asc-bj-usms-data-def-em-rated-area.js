
/**
 * @author keven.xi
 */
var defineDingeJiBieController = View.createController('defineDingeJiBie', {

    abScDefDeAreaForm_onSave: function(){
		if (!this.abScDefDeAreaForm.canSave()) {
            return false;
        }
        if (this.checkBeforeSaveRec()) {
            var record = this.abScDefDeAreaForm.getRecord();
            var dataSource = View.dataSources.get("abScDefDeAreaGridDS");
            try {
                dataSource.saveRecord(record);
            } 
            catch (e) {
                var message = getMessage('errorSave');
                View.showMessage('error', message, e.message, e.data);
                return;
            }
            //refresh tree panel and edit panel
			this.refreshTreeAndEditForm(this.abScDefDeAreaForm);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            this.showInformationInForm(this, this.abScDefDeAreaForm, message);
        }else{
			 View.showMessage(getMessage("error_dingeArea"))
		}
    },
    refreshTreeAndEditForm:function(curEditPanel){
		//refresh the tree panel
        this.abScDefDeAreaGrid.refresh();
        
        //refresh the edit form panel
        var restriction = curEditPanel.getRecord().toRestriction();
        if (curEditPanel.newRecord) {
            restriction.removeClause("isNew");
            curEditPanel.newRecord = false;
            curEditPanel.record.values["isNew"] = false;
            curEditPanel.record.oldValues["isNew"] = false;
        }
        curEditPanel.refresh(curEditPanel.getPrimaryKeyRestriction());
	},
	
    checkBeforeSaveRec: function(){
        var newDE = this.abScDefDeAreaForm.getFieldValue("sc_dinge_jibie.dingejibie_id");
        var newDeArea = this.abScDefDeAreaForm.getFieldValue("sc_dinge_jibie.area");
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_dinge_jibie.dingejibie_id", newDE, "=");
        var records = View.dataSources.get("abScDefDeAreaCheckDS").getRecords(restriction);
        if (records.length != 0) {
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                var deArea = record.getValue("sc_dinge_jibie.area");
				var difArea = deArea-newDeArea;
                if ((difArea >0)||(difArea <0)) {
                    return false;
                }
            }
        }
		
        return true;
    },
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    }

})

