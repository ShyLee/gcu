/**
 * @author: kevenxi
 */
var abScDefRmcatRmtypeController = View.createController('abScDefRmcatRmtype', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'RMUSE', 'RMCAT','RMTYPE'
    operDataType: "",
    
    afterViewLoad: function(){
        this.rmuse_tree.addParameter('rmcat', "IS NOT NULL");
        this.rmuse_tree.addParameter('rmtype', "IS NOT NULL");
        this.rmuse_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
	sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.abScDefRmuseForm.show(false);
        this.abScDefRmcatRmuseForm.show(false);
        this.abScDefRmcatRmtypeForm.show(false);
        this.abScDefRmcatTsRmuse4FormDsForm.show(false);
    },
	
    abScDefRmuseForm_onSave: function(){
        this.operDataType = "POST";
        var panel = View.panels.get('abScDefRmuseForm');
        panel.save();
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'rmuse_tree', parentNode);
    },
    abScDefRmuseForm_onDelete: function(){
		if (abScDefRmuseForm.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POST";
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefRmuseFormDs", "abScDefRmuseForm", "rmuse.rm_use", "rmuse_tree", parentNode);
    },
    
    abScDefRmcatRmuseForm_onSave: function(){
        this.operDataType = "POSTLEVEL";
        var panel = View.panels.get('abScDefRmcatRmuseForm');
        if(!panel.canSave()){
        	return;
        }
        panel.save();
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'rmuse_tree', parentNode);
    },
    
    abScDefRmcatRmuseForm_onDelete: function(){
		if (abScDefRmcatRmuseForm.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POSTLEVEL";
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefRmcatRmuseFormDs", "abScDefRmcatRmuseForm", "rmcat.rm_cat", "rmuse_tree", parentNode);
    },
    
    abScDefRmcatRmtypeForm_onSave: function(){
        this.operDataType = "POSTION";
        var panel = View.panels.get('abScDefRmcatRmtypeForm');
        panel.save();
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'rmuse_tree', parentNode);
    },
    abScDefRmcatRmtypeForm_onDelete: function(){
		if (abScDefRmcatRmtypeForm.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POSTION";
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefRmcatRmtypeFormDs", "abScDefRmcatRmtypeForm", "rmtype.rm_type", "rmuse_tree", parentNode);
    },
    abScDefRmcatTsRmuse4FormDsForm_onSave:function(){
       this.operDataType = "LEVEL4";
       var panel = View.panels.get('abScDefRmcatTsRmuse4FormDsForm');
       panel.save();
       var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
       commonRefresh(panel, 'rmuse_tree', parentNode);
    },
    abScDefRmcatTsRmuse4FormDsForm_onDelete:function(){
		if (abScDefRmcatTsRmuse4FormDsForm.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
    	this.operDataType = "LEVEL4";
        var parentNode = getParentNode('rmuse_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefRmcatRmtypeFormDs", "abScDefRmcatTsRmuse4FormDsForm", "ts_rmuse4.rm_type", "rmuse_tree", parentNode);
     },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('rmuse_tree');
    },
    
    showMenu: function(e, item){
        var menuItems = []; 
        var menutitle_newRmUse = getMessage("roomUse");
        var menutitle_newRmCat = getMessage("roomCategory");
        var menutitle_newRmType = getMessage("roomType");
        menuItems.push({
            text: menutitle_newRmUse,
            handler: this.onAddNewButtonPush.createDelegate(this, ['RMUSE'])
        });
        menuItems.push({
            text: menutitle_newRmCat,
            handler: this.onAddNewButtonPush.createDelegate(this, ['RMCAT'])
        });
        menuItems.push({
            text: menutitle_newRmType,
            handler: this.onAddNewButtonPush.createDelegate(this, ['RMTYPE'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var rm_use = "";
        var rm_cat = "";
        var rm_type = "";
        var name = "";
        var name="";
 //       var rm_use4 = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    rm_use = this.curTreeNode.data["rmuse.rm_use"];
                    name=this.curTreeNode.data["rmuse.rmuse_name"];
                    break;
                case 1:
                    rm_use = this.curTreeNode.data["rmcat.rm_use"];
                    rm_cat = this.curTreeNode.data["rmcat.rm_cat"];
                    name=this.curTreeNode.data["rmcat.rmcat_name"];
                    break;
                case 2:
                    rm_cat = this.curTreeNode.data["rmtype.rm_cat"];
                    rm_type = this.curTreeNode.data["rmtype.rm_type"];
                    break;
                    
//                case 3:
//                	rm_cat= this.curTreeNode.data["ts_rmuse4.rm_cat"];
//                 	rm_type= this.curTreeNode.data["ts_rmuse4.rm_type"];
//                	break;
            }
        }
                              
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "RMUSE":
            	
            	this.abScDefRmcatRmtypeTabs.selectTab("rmuseTab", null, true, false, false);
                break;
            case "RMCAT":
                restriction.addClause("rmcat.rm_use", rm_use, '=');
                restriction.addClause("rmuse.rmuse_name", name, '=');
                this.abScDefRmcatRmtypeTabs.selectTab("cateTab", restriction, true, false, false);
                break;
            case "RMTYPE":
            	if (nodeLevelIndex == 0){
            		View.showMessage('请选择房屋类别节点!');
                    return;
            	}
                restriction.addClause("rmtype.rm_cat", rm_cat, '=');
                restriction.addClause("rmcat.rmcat_name",name,'=');
                this.abScDefRmcatRmtypeTabs.selectTab("typeTab", restriction, true, false, false);
                break;
            case "TS_RMUSE4" :
            	if (nodeLevelIndex == 0 || nodeLevelIndex == 1){
            		View.showMessage('请选择房屋类型节点!');
                    return;
            	}
            	restriction.addClause("ts_rmuse4.rm_cat", rm_cat, '=');
            	restriction.addClause("ts_rmuse4.rm_type" ,rm_type , '=');
            	this.abScDefRmcatRmtypeTabs.selectTab("use4tab", restriction, true, false, false);
            	break;
        }
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var rmuse = consolePanel.getFieldValue('rmuse.rm_use');
        if (rmuse) {
            this.rmuse_tree.addParameter('rmuse', " ="+ "'" + rmuse + "'");
        }
        else {
            this.rmuse_tree.addParameter('rmuse', " IS NOT NULL ");
        }
        
        
        var rmcat = consolePanel.getFieldValue('rmcat.rm_cat');
        if (rmcat) {
            this.rmuse_tree.addParameter('rmcat', " = "+"'" + rmcat + "'");
        }
        else {
            this.rmuse_tree.addParameter('rmcat', "IS NOT NULL");
        }
        
        var rmtype = consolePanel.getFieldValue('rmtype.rm_type');
        if (rmtype) {
            this.rmuse_tree.addParameter('rmtype', " = "+"'" + rmtype + "'");
        }
        else {
            this.rmuse_tree.addParameter('rmtype', "IS NOT NULL");
        }
        
        if(rmuse == "" && rmcat == "" && rmtype == ""){
        	this.rmuse_tree.addParameter('orand' , " OR ");
        }else{
        	this.rmuse_tree.addParameter('orand' , " AND ");
        	
        }
        
        this.rmuse_tree.refresh();
        this.curTreeNode = null;
    }
})
function onClickRmuseTreeNode(){
    var curTreeNode = View.panels.get("rmuse_tree").lastNodeClicked;
    var rm_use = curTreeNode.data['rmuse.rm_use'];
    View.controllers.get('abScDefRmcatRmtype').curTreeNode = curTreeNode;
    if (!rm_use) {
        View.panels.get("abScDefRmcatRmuseForm").show(false);
        View.panels.get("abScDefRmcatRmtypeForm").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rmuse.rm_use", rm_use, '=');
        View.panels.get('abScDefRmcatRmtypeTabs').selectTab("rmuseTab", restriction, false, false, false);
    }
}

function onClickTreeNode(){
    View.controllers.get('abScDefRmcatRmtype').curTreeNode = View.panels.get("rmuse_tree").lastNodeClicked;
}
function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'rmuse_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var rmuseName = treeNode.data['rmuse.rm_use'];
        
        if (!rmuseName) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noBusinessUnit") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var rmcatName = treeNode.data['rmcat.rmcat_name'];
        var rmcatCode = treeNode.data['rmcat.rm_cat'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + rmcatCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + rmcatName + "</span> ";
        treeNode.setUpLabel(labelText1);
        
    }
    if (treeNode.level.levelIndex == 2) {
        var rmtypeName = treeNode.data['rmtype.rmtype_name'];
        var rmtypeCode = treeNode.data['rmtype.rm_type'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + rmtypeCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + rmtypeName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var siteId = parentNode.data['rmuse.rm_use'];
            if (!siteId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('rmcat.rm_use', '', 'IS NULL', 'AND', true);
            }
            else {
                restriction = new Ab.view.Restriction();
                restriction.addClause('rmcat.rm_use', siteId, '=', 'AND', true);
            }
        }
        
    }
    return restriction;
}

function setPattern(){
    View.hpatternPanel = View.panels.get('abScDefRmcatRmuseForm');
    View.hpatternField = 'rmcat.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmcat.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}
function selectPattern(){
    View.hpatternPanel = View.panels.get('abScDefRmcatRmtypeForm');
    View.hpatternField = 'rmtype.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmtype.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

