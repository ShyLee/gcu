/**
 * called by ab-ex-svg-example.axvw
 */
function loadSVG(){
	var treeView = View.panels.get("floor_tree");
	var curTreeNode = treeView.lastNodeClicked;	
	//XXX: get selected data from tree
	var bl_id = curTreeNode.data["rm.bl_id"];
	var fl_id = curTreeNode.data["rm.fl_id"];
	
	//XXX: define parameters to be used by server-side job
	var parameters = {};
	parameters.plan_type='1 - ALLOCATION';
	//parameters.highlightParameters = [{'view_file':"ab-ex-rmxdp-dwg-rpt.axvw", 'hs_ds': "ds_abExRmxdpDwgRpt_highlightData", 'label_ds':'ds_abExRmxdpDwgRpt_labelNames'}];
	parameters.pkeyValues = {'bl_id':bl_id, 'fl_id':fl_id};
	//XXX: load SVG from server and display in SVG panel's  <div id="svgDiv"> 
	Ab.svg.DrawingControl.load("svgDiv", parameters);
	
	 //XXX: enable SVG's mouse wheel zoom, and mouse pan features
	 Ab.svg.DrawingControl.zoomPan();
	 //XXX: bind event to highlighted rooms. showReport is callback
	 Ab.svg.DrawingControl.addEventHandlers([{'assetType' : 'rm', 'handler' : showReport}]);
	
	 //Testing
	 //Ab.svg.DrawingControl.dragHighLightAsset('furniture');

}
/**
 * Pops up a detailed room report when clicking any highlighted room
 * roomIDS: a string like HQ;18;155. (TODO: move to SVG control)
 * position: mouse click position to identify selected room's position like {x:200, y:200}
 */
function showReport(roomIDS, position){
	var arrayRoomIDS = roomIDS.split(";");
	var reportView = View.panels.get("room_detail_report");
	var restriction = new Ab.view.Restriction();
	restriction.addClause('rm.bl_id', arrayRoomIDS[0]);
	restriction.addClause('rm.fl_id', arrayRoomIDS[1]);
	restriction.addClause('rm.rm_id', arrayRoomIDS[2]);
	reportView.refresh(restriction);
	
	reportView.showInWindow({title:'Selected Room Detail', modal: true,collapsible: false, maximizable: false, x: position.x, y: position.y, width: 350, height: 250, autoScroll:false});
}



