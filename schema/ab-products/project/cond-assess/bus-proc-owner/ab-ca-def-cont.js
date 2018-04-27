/**
 * @author Cristina Moldovan
 * 07/15/2009
 */

/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
function afterGeneratingTreeNode(treeNode){
	
	//set restriction for level 0 nodes of the tree
    if (treeNode.level.levelIndex == 0) {
    	var record = new Ab.data.Record(treeNode.data);
    	var rawValue = record.getValue('contact.contact_type');
    	treeNode.restriction.addClause('contact.contact_type', rawValue);
    }
    
}


var defContCtrl = View.createController('defContCtrl',{
	/**
	 *  insert /update contact
	 */
	contactDetailsPanel_onSave: function(){
		var newContactType = this.contactDetailsPanel.getFieldValue("contact.contact_type");
		if (this.contactDetailsPanel.save()) {
			this.expandNode(newContactType);
		}
	},
	
	expandNode: function(newContactType){
		var expandedContactTypes = this.getExpadedContactTypes();
		this.contactsTreeLevel1_onRefresh();
		this.expandNodesByContactType(expandedContactTypes);
		var newNode = this.getNodeByContactType(newContactType);
		this.contactsTreeLevel1.expandNode(newNode);
	},
	
	getNodeByContactType: function(contactType){
		var node = null;
		for (var i=0; i<this.contactsTreeLevel1._nodes.length; i++){
			var nodeContactType = this.contactsTreeLevel1._nodes[i].data["contact.contact_type"];
			if(contactType == nodeContactType){
				node = this.contactsTreeLevel1._nodes[i];
				break;
			}
		}
		return node;
	},

	getExpadedContactTypes: function(){
		var expandedContactTypes = new Array();
		for (var i=0; i<this.contactsTreeLevel1._nodes.length; i++){
			if(this.contactsTreeLevel1._nodes[i].expanded){
				expandedContactTypes[i] = this.contactsTreeLevel1._nodes[i].data["contact.contact_type"];
			}
		}
		return expandedContactTypes;
	},
	
	expandNodesByContactType:function(expandedContactTypes){
		for (var i=0; i<expandedContactTypes.length; i++){
			var node = this.getNodeByContactType(expandedContactTypes[i]);
			if(valueExistsNotEmpty(node)){
				this.contactsTreeLevel1.expandNode(node);
			}
		}
	},
	
	contactDetailsPanel_onDelete: function() {
        var controller = this;
		var dataSource = this.dsContactDetails;
		var record = this.contactDetailsPanel.getRecord();
        var primaryFieldValue = record.getValue("contact.contact_id");
        if (!primaryFieldValue) {
            return;
        }
		var objTree = controller.contactsTreeLevel1;
		
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
					controller.contactDetailsPanel.show(false);
					controller.contactsTreeLevel1.lastNodeClicked = objTree.lastNodeClicked.parent;
					controller.contactsTreeLevel1.expandNode(objTree.lastNodeClicked);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
            }
        })
	},
	contactsTreeLevel1_onRefresh: function(){
		this.contactDetailsPanel.show(false);
        this.contactsTreeLevel1.refresh();
	}
})
