/**
 * 
 */
var abScDefPostController = View.createController('abScDefPost', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUSINESSUNIT', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    businessUnitChanged: false,
	
	
	
	abScDefPostLevelForm_onSave: function(){
		this.operDataType = "POST";
        var panel = View.panels.get('abScDefPostLevelForm');
		panel.save();
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefPostTree',parentNode);
    },
	abScDefPostLevelForm_onDelete: function(){
        this.operDataType = "POST";
		var formPanel = View.panels.get('abScDefPostLevelForm');
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefPostLevelDs", "abScDefPostLevelForm", "sc_gangweijibie.gangweijibie_id","abScDefPostTree",parentNode);
    },
	abScDefPostionForm_onSave: function(){
		this.operDataType = "POSTLEVEL";
        var panel = View.panels.get('abScDefPostionForm');
       
		panel.save();
		
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefPostTree',parentNode);
    },
	abScDefPostionForm_onDelete: function(){
        this.operDataType = "POSTLEVEL";
		var formPanel = View.panels.get('abScDefPostionForm');
		var parentNode = getParentNode('abScDefPostTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefPostionDs", "abScDefPostionForm", "sc_zhiwu.zhiw_id","abScDefPostTree",parentNode);
        this.AUSC_commonDelete("abScDefPostionDs", "abScDefPostionForm", "sc_zhiwu.zhiw_id");
    },

	afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('abScDefPostTree');
    },
	
	showMenu: function(e, item){
        var menuItems = [];
       
		var menutitle_newPostion = getMessage("Postion");
        var menutitle_newPostLevel = getMessage("PostLevel");
       
        menuItems.push({
            text: menutitle_newPostLevel,
            handler: this.onAddNewButtonPush.createDelegate(this, ['POSTLEVEL'])
        });
		menuItems.push({
            text: menutitle_newPostion,
            handler: this.onAddNewButtonPush.createDelegate(this, ['POSTION'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },

	onAddNewButtonPush: function(menuItemId){
        var gangweijibie_id = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    gangweijibie_id = this.curTreeNode.data["sc_gangweijibie.gangweijibie_id"];
                    break;
                case 1:
                    gangweijibie_id = this.curTreeNode.data["sc_zhiwu.gangweijibie_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "POSTLEVEL":
                this.postDetailTabs.selectTab("postLevelTab", null, true, false, false);
                break;
			case "POSTION":
				 if (nodeLevelIndex == -1) {
	                    View.showMessage('请选择职级');
	                    return;
	                }
                restriction.addClause("sc_gangweijibie.gangweijibie_id", gangweijibie_id, '=');
                this.postDetailTabs.selectTab("postionTab", restriction, true, false, false);
                this.abScDefPostionForm.setFieldValue("sc_zhiwu.gangweijibie_id", gangweijibie_id);
                break;
        }
    }
    
    //----------------event handle--------------------
   
})


/*
 * set the global variable 'curTreeNode' in controller 'defDvDp'
 */


function onTreeviewClick(){
    View.controllers.get('abScDefPost').curTreeNode = View.panels.get("abScDefPostTree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDefPostTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
         var sc_gangweijibieName = treeNode.data['sc_gangweijibie.description'];
       	 var sc_gangweijibieCode = treeNode.data['sc_gangweijibie.gangweijibie_id'];
       	 var sc_gangweijibieName = treeNode.data['sc_gangweijibie.gangweijibie_name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + sc_gangweijibieCode+" "+sc_gangweijibieName + "</span> ";
        treeNode.setUpLabel(labelText1);
        
    }
    
    if (treeNode.level.levelIndex == 1) {
        var sc_zhiwuName = treeNode.data['sc_zhiwu.description'];
        var sc_zhiwuCode = treeNode.data['sc_zhiwu.zhiw_id'];
        var sc_zhiwuName = treeNode.data['sc_zhiwu.zhiw_name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + sc_zhiwuCode+" "+sc_zhiwuName+ "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}