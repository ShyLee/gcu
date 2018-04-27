 View.createController('exTreeTable', {
 	
 	// attaching onClickNode event listener 
 	bridgedTree_dv_tree_onClickNode: function(panel, node) {
 		alert('onClickNode \n' + panel.panelId + '\n' + toJSON(node.data));
 	},
	
 	// attaching event listener to 'Edit' button 
 	bridgedTree_rm_tree_onEdit: function(button, panel, node) {
 		alert('onEdit \n' + panel.panelId + '\n' + toJSON(node.data));
 	}	
});