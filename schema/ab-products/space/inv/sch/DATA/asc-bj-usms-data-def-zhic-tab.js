/**
 * by kevenxi
 */
var abScDefStdZhicController = View.createController('abScDefStdZhic', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    businessUnitChanged: false,
	
	abScDefStdZhicBz_onSave: function(){
		this.operDataType="POST";
        var panel = View.panels.get('abScDefStdZhicBz');
		panel.save();
		var parentNode = getParentNode('abScDefStdZhicBzTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefStdZhicBzTree',parentNode);
    },
	abScDefStdZhicBz_onDelete: function(){
        this.operDataType="POST";
		var formPanel = View.panels.get('abScDefStdZhicBz');
		var parentNode = getParentNode('abScDefStdZhicBzTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefStdZhicBzDs", "abScDefStdZhicBz", "sc_zhic_bz.zhic_bz_id","abScDefStdZhicBzTree",parentNode);
    },
	
	abScDefStdZhic_onSave: function(){
		this.operDataType="POSTLEVEL";
        var panel = View.panels.get('abScDefStdZhic');
		panel.save();
		var parentNode = getParentNode('abScDefStdZhicBzTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'abScDefStdZhicBzTree',parentNode);
    },
	abScDefStdZhic_onDelete: function(){
        this.operDataType="POSTLEVEL";
		var formPanel = View.panels.get('abScDefStdZhic');
		var parentNode = getParentNode('abScDefStdZhicBzTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("abScDefStdZhicDs", "abScDefStdZhic", "sc_zhic.zhic_id","abScDefStdZhicBzTree",parentNode);
    },
	
	afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('abScDefStdZhicBzTree');
    },
	
	showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newBiaoZhunZhiCheng = getMessage("biaoZhunZhiCheng");
        var menutitle_newZhiCheng = getMessage("zhiCheng");
        
        menuItems.push({
            text: menutitle_newBiaoZhunZhiCheng,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BIAOZHUNZHICHENG'])
        });
        menuItems.push({
            text: menutitle_newZhiCheng,
            handler: this.onAddNewButtonPush.createDelegate(this, ['ZHICHENG'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },

	onAddNewButtonPush: function(menuItemId){
        var zhic_bz_id = "";
        var zhic_id = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    zhic_bz_id = this.curTreeNode.data["sc_zhic_bz.zhic_bz_id"];
                    break;
                case 1:
                    zhic_bz_id = this.curTreeNode.data["sc_zhic.zhic_bz_id"];
                    zhic_id = this.curTreeNode.data["sc_zhic.zhic_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "BIAOZHUNZHICHENG":
                this.zhicDetailTabs.selectTab("biaoZhunZhiChengTab", null, true, false, false);
                break;
            case "ZHICHENG":
            	if (nodeLevelIndex == -1) {
                    View.showMessage('请选择职称标准');
                    return;
                }
                restriction.addClause("sc_zhic_bz.zhic_bz_id", zhic_bz_id, '=');
                this.zhicDetailTabs.selectTab("zhiChengTab", restriction, true, false, false);
                this.abScDefStdZhic.setFieldValue("sc_zhic.zhic_bz_id", zhic_bz_id);
                break;
        }
    }
})


/*
 * set the global variable 'curTreeNode' in controller 'defDvDp'
 */

function onBusinessUnitClick(){
    var curTreeNode = View.panels.get("abScDefStdZhicBzTree").lastNodeClicked;
    var zhic_bz_id = curTreeNode.data['sc_zhic_bz.zhic_bz_id'];
    View.controllers.get('abScDefStdZhic').curTreeNode = curTreeNode;
    if (!zhic_bz_id) {
        View.panels.get("abScDefStdZhicBz").show(false);
        View.panels.get("abScDefStdZhic").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zhic_bz.zhic_bz_id", zhic_bz_id, '=');
        View.panels.get('zhicDetailTabs').selectTab("biaoZhunZhiChengTab", restriction, false, false, false);
    }
}

function onTreeviewClick(){
    View.controllers.get('abScDefStdZhic').curTreeNode = View.panels.get("abScDefStdZhicBzTree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){ 
    if (treeNode.tree.id != 'abScDefStdZhicBzTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
    	var sczhicbzCode = treeNode.data['sc_zhic_bz.zhic_bz_id'];
        var sczhicbzName = treeNode.data['sc_zhic_bz.zhic_bz_name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + sczhicbzCode+" "+sczhicbzName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 1) {
        var sczhicCode = treeNode.data['sc_zhic.zhic_id'];
        var sczhicName = treeNode.data['sc_zhic.zhic_name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + sczhicCode+" "+sczhicName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}
