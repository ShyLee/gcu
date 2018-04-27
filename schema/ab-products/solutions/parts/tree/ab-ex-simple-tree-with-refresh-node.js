/**
* This is an example to show how to refresh the root node in Tree Control
*
*/

function refreshNode(){

	// get the tree control from root panel
	var treeControl = AFM.view.View.getControl('', 'exSimpleTreeWithRefreshNode_dvTree');

	// get the last node clicked
	var node = treeControl.lastNodeClicked;
	
	//refresh the node
	treeControl.refreshNode(node);
	
	//expend the node
	node.expand();

}
