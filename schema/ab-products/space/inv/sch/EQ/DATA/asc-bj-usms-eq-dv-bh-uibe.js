var controller=View.createController('ControllerForm',{
	curTreeNode: null,
	afterInitialDataFetch: function(){
		this.dvPanel.addParameter('sqlRes'," dv.dv_id!='未分配' and dv.dv_id != '学校' and dv.dv_id !='校领导' and dv.dv_id!='其他'");
		this.dvPanel.refresh();
	},
	//点击dv表节点时触发的事件
	onClickDvNode: function(){
		this.curTreeNode=View.panels.get('dvPanel').lastNodeClicked;
		var dvId=this.curTreeNode.data['dv.dv_id'];
		var tabs=View.panels.get('tabs');
		var res=new Ab.view.Restriction();
		res.addClause("dv.dv_id",dvId,'=');
		tabs.setTabsRestriction(res,'dvTab');
		tabs.selectTab("dvTab");

	},
	//点击dp_top表节点时触发的事件
	onClickDpNode: function(){
		this.curTreeNode=View.panels.get('dvPanel').lastNodeClicked;
		var dpId=this.curTreeNode.data['dp_top.dp_id'];
		var tabs=View.panels.get('tabs');
		var res=new Ab.view.Restriction();
		res.addClause("dp_top.dp_id",dpId,'=');
		tabs.setTabsRestriction(res, 'dpTopTab');
		tabs.selectTab("dpTopTab");
	},
	//点击dp_level表节点时触发的事件
	onClickDlNode: function(){
		this.curTreeNode=View.panels.get('dvPanel').lastNodeClicked;
		var dlId=this.curTreeNode.data['dp_level.dl_id'];
		var tabs=View.panels.get('tabs');
		var res=new Ab.view.Restriction();
		res.addClause("dp_level.dl_id",dlId,'=');
		tabs.setTabsRestriction(res, 'dpLevelTab');
		tabs.selectTab("dpLevelTab");
	},
	//保存dv表
	dvPanelForm_onBtnSaveDv: function(){
		var isSaved=this.dvPanelForm.save();
		if(isSaved){
//			var curTreeNode = this.curTreeNode;
//			curTreeNode.refresh();
			this.dvPanel.refresh();
		}else{
			View.alert("保存失败,请检查输入!");
		}
		
	},
	//保存dp_top表
	dpTopPanel_onBtnSaveDv: function(){
		var isSaved=this.dpTopPanel.save();
		if(isSaved){
			var curTreeNode = this.curTreeNode;
			var level=curTreeNode.level.levelIndex;
			controller.expandTree(curTreeNode);
		}else{
			View.alert("保存失败,请检查输入!");
		}
	},
	//保存dp_level表
	dpLevelPanel_onBtnSaveDv: function(){
		var isSaved=this.dpLevelPanel.save();
		if(isSaved){
			var curTreeNode = this.curTreeNode;
			var level=curTreeNode.level.levelIndex;
			controller.expandTree(curTreeNode);
		}else{
			View.alert("保存失败,请检查输入!");
		}
	},
	
	//展开树形结构
	expandTree: function(TreeNode){
		var levelIndex=TreeNode.level.levelIndex;
		if(levelIndex==0){
			View.panels.get('dvPanel').refreshNode(TreeNode);
			//TreeNode.expand();
		}else{
			var parent=TreeNode.parent;
			View.panels.get('dvPanel').refreshNode(parent);
			parent.expand();
			//controller.expandTree(parent);
		}		
	}
});