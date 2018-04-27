/**
 * @author Cristina Moldovan
 * 07/15/2009
 * 08/04/2009 - Ioan Draghici  changed to use hier tree 
 * TO DO :
 *  - fix automatic expand after save - when will be fixed from web core
 */

var defClassCtrl = View.createController('defClassCtrl',{
	/**
	 *  insert /update  csi 
	 */
	classificationDetailsPanel_onSave: function(){
		if(!this.canChange()){
			return;
		}
		var isNew = this.classificationDetailsPanel.newRecord;
		var parentNode = this.getParent(this.classificationsTreePanel, this.classificationDetailsPanel, isNew);
		this.setHierId(this.classificationDetailsPanel, parentNode, "csi.csi_id", "csi.hierarchy_ids");
		this.classificationDetailsPanel.save();
		this.refreshTreeAfterSave(parentNode);
	},
	
	canChange: function(){
		if(trim(this.classificationDetailsPanel.getOldFieldValues()[("csi.csi_id")]) == "0"){
			View.showMessage(getMessage("error_top_level"));
			return false;
		}else{
			return true;
		}
	},
	/**
	 * set new value for hier field
	 * @param {Object} panel
	 * @param {Object} parentNode
	 * @param {Object} field
	 * @param {Object} hierField
	 */
	setHierId: function(panel, parentNode, field, hierField){
		var newId = panel.getFieldValue(field);
		if(parentNode.isRoot()){
			panel.setFieldValue(hierField, '0|'+newId+'|');
		}else{
			panel.setFieldValue(hierField, parentNode.data[hierField]+newId+'|');
		}
	},
	/**
	 * get parent for curent selection
	 * @param {Object} panel
	 * @param {Object} isNew
	 */
	getParent: function(panel, editForm, isNew){
		if(panel.lastNodeClicked == null){
			return panel.treeView.getNodeByIndex(1);
		}else{
			if (isNew) {
				return panel.lastNodeClicked;
			}
			else {
				var pkFieldValue = editForm.record.oldValues["csi.csi_id"];
				var node = panel.lastNodeClicked;
		        for (var i = 0; i < panel.lastNodeClicked.children.length; i++) {
		            var tmp_node = panel.lastNodeClicked.children[i];
		            if (tmp_node.data["csi.csi_id"] == pkFieldValue) {
		                node =  tmp_node;
						break;
		            }
		        }
				return node.parent;
			}
		}
	},
	/**
	 * test for zhe oracle relation postgreSql
	 * 
	 */
	searchconsolepanel_onBtnDo:function(){
		try {
	         var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-datatransferIO-test');
	        } 
	        catch (e) {
	        	View.alert('工作流失败，请联系管理员');
	            return;
	        } 
	},
	searchconsolepanel_onBtnStart:function(){
		try {
	         var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-DataTransferStu-start');
	        } 
	        catch (e) {
	        	View.alert('工作流失败，请联系管理员');
	            return;
	        } 
	},
	/**
	 * refresh tree after save 
	 * @param {Object} parentNode
	 */
	refreshTreeAfterSave: function(parentNode){
		var treeView = this.classificationsTreePanel;
		if(parentNode.isRoot()){
			treeView.refresh();
		}else{
			treeView.expandNode(parentNode);
		}
	},
	/**
	 * delete csi
	 */
	classificationDetailsPanel_onDelete: function() {
		if(!this.canChange()){
			return;
		}
        var controller = this;
		var dataSource = this.dsClassificationDetails;
		var record = this.classificationDetailsPanel.getRecord();
        var primaryFieldValue = record.getValue("csi.csi_id");
		var parentNode = this.getParent(this.classificationsTreePanel, this.classificationDetailsPanel, false);
		var objTree = this.classificationsTreePanel;
        if (!primaryFieldValue) {
            return;
        }
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
					/*
					 * 06/14/2010 IOAN KB 3027940
					 */
                    dataSource.deleteRecord(record);
					if(objTree.lastNodeClicked != null && primaryFieldValue ===  objTree.lastNodeClicked.data["csi.csi_id"]){
						objTree.lastNodeClicked = null;
                } 
					controller.classificationDetailsPanel.show(false);
                	controller.refreshTreeAfterSave(parentNode);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
            }
        })
	},
	//执行"筛选"操作
	searchconsolepanel_onBtnsearch: function(){
		var consoleForm=View.panels.get('searchconsolepanel');
		var csiId=consoleForm.getFieldValue('csi.csi_id');
		var desc=consoleForm.getFieldValue('csi.description');
		var grid=View.panels.get('formDetail');
		
		if(csiId==""&&desc==""){
			grid.restriction=null;
			grid.refresh("");
		}
		var res=new Ab.view.Restriction();
		if(csiId!=""&&csiId!=null){
			res.addClause("csi.csi_id",csiId,"=");
		}
		if(desc!=""&&desc!=null){
			res.addClause("csi.description","%"+desc+"%","LIKE");
		}
       grid.refresh(res);
	},
	
	formDetail_btnClick_onClick: function(row,action){
		var treeForm=View.panels.get('classificationsTreePanel');
		//获取点击一行row的hierarchy的值
		var hierarchy=row.record['csi.hierarchy_ids'];
		var hierArray=new Array();
		//将hierarchy通过|分隔后存入数组
		hierArray=hierarchy.split('|');
		//获取当前系统已经展开的nodes
		var nodes=treeForm._nodes;
		//按照hierarychy分隔后的值由前往后进行遍历
		for(var i=0;i<hierArray.length-2;i++){
			var thisnode=getNode('csi.csi_id', hierArray[i],nodes);
			//展开此节点
			treeForm.expandNode(thisnode);
			//获取当前节点后立即加载该节点下的数据
			this.classificationsTreePanel._loadNodeData(thisnode);
			//将操作点转移到下一个节点上面
			nodes=thisnode.children;
		}
	},
	searchconsolepanel_onBtnClear: function(){
		this.searchconsolepanel.clear();
		this.dsClassificationDetails.show(false);
	}

})
/**
 * remove hierarchy_ids from node label
 * @param {Object} treeNode
 */
function afterGeneratingTreeNode(treeNode){
	var hierIds = treeNode.data["csi.hierarchy_ids"];
	var labelText = treeNode.label.replace(hierIds, '');
	treeNode.label = labelText;
}

function getNode(property, value,nodes) {
	var treePanel=View.panels.get('classificationsTreePanel');
	if(nodes!=null){
		for (var i =0;i<nodes.length;i++) {
			var n = nodes[i];
			var sh=n.data[property];
			if(sh==value){
				return n;
			}else{
				return null;
			}
		}
	}
}
//自动生成数据库中所有的层级树
function createTreeLevel(action){
	action.setText("生成中.....");
	action.disable();
	try{
		var result=Workflow.callMethod('AbAssetManagement-EquipmentHandler-createAllTreeLevel');
	}catch(e){
		Workflow.handleError(e); 
		action.setText("生成中遇到错误，未完成!");
	}
	if(result.code='executed'){
		action.setText("生成完成!");
		var treeForm=View.panels.get('classificationsTreePanel');
		treeForm.restriction=null;
		treeForm.refresh("");
	}
	
}
