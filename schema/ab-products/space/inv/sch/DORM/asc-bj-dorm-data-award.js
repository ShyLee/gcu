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

	afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('dispMainTree');
    },
	
	showMenu: function(e, item){
        var menuItems = [];
       
		var menutitle_newMain = getMessage("Main");
        var menutitle_newDetail = getMessage("Detail");
       
        menuItems.push({
        	text: menutitle_newMain,
        	handler: this.onAddNewButtonPush.createDelegate(this, ['POSTLEVEL'])
        });
        menuItems.push({
            text: menutitle_newDetail,
            handler: this.onAddNewButtonPush.createDelegate(this, ['POSTION'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },

	onAddNewButtonPush: function(menuItemId){
        var dispMain = "";
        var dispName = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                	dispMain = this.curTreeNode.data["sc_stu_disp_main.disp_main"];
                	dispName = this.curTreeNode.data["sc_stu_disp_main.disp_name"];
                    break;
                case 1:
                    dispMain = this.curTreeNode.data["sc_stu_disp_detail.disp_main"];
                    dispName = this.curTreeNode.data["sc_stu_disp_main.disp_name"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction1 = new Ab.view.Restriction();
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "POSTLEVEL":
            	restriction1.addClause("sc_stu_disp_main.mark", '2', '=');
                this.disciplineTabs.selectTab("mainTab", null, true, false, false);
                break;
			case "POSTION":
				 if (nodeLevelIndex == -1) {
	                    View.showMessage('请选择违纪奖励类型！');
	                    return;
	                }
                restriction.addClause("sc_stu_disp_detail.disp_main", dispMain, '=');
                restriction.addClause("sc_stu_disp_main.disp_name", dispName, '=');
                restriction.addClause("sc_stu_disp_detail.mark", '2', '=');
                this.disciplineTabs.selectTab("detailTab", restriction, true, false, false);
                break;
        }
    },
	
	
    disMainForm_onSave: function(){
		this.operDataType = "POST";
        var panel = View.panels.get('disMainForm');
		panel.save();
		var parentNode = getParentNode('dispMainTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'dispMainTree',parentNode);
    },
    
    disMainForm_onDelete: function(){
        this.operDataType = "POST";
		var formPanel = View.panels.get('disMainForm');
		var parentNode = getParentNode('dispMainTree',getMessage("selectTreeNode"),this.operDataType,this);
        AUSC_commonDelete("sc_stu_disp_main_ds", "disMainForm", "sc_stu_disp_main.disp_main","dispMainTree",parentNode);
    },
    disDetailForm_onSave: function(){
		this.operDataType = "POSTLEVEL";
	    var panel = View.panels.get('disDetailForm');
	   
		panel.save();
		
		var parentNode = getParentNode('dispMainTree',getMessage("selectTreeNode"),this.operDataType,this);
		commonRefresh(panel,'dispMainTree',parentNode);
	},
	disDetailForm_onDelete: function(){
	    this.operDataType = "POSTLEVEL";
		var formPanel = View.panels.get('disDetailForm');
		var parentNode = getParentNode('dispMainTree',getMessage("selectTreeNode"),this.operDataType,this);
	    AUSC_commonDelete("sc_stu_disp_detail_ds", "disDetailForm", "sc_stu_disp_detail.disp_main","dispMainTree",parentNode);
	    this.AUSC_commonDelete("sc_stu_disp_detail_ds", "disDetailForm", "sc_stu_disp_detail.disp_main");
	}
   
})

/*
 * set the global variable 'curTreeNode' in controller 'defDvDp'
 */

function onTreeviewClick(){
    View.controllers.get('abScDefPost').curTreeNode = View.panels.get("dispMainTree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'dispMainTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
         var dispName = treeNode.data['sc_stu_disp_main.disp_name'];
       	 var dispMain = treeNode.data['sc_stu_disp_main.disp_main'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + dispName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    
    if (treeNode.level.levelIndex == 1) {
        var dispDetail = treeNode.data['sc_stu_disp_detail.disp_detail'];
        var dispComments = treeNode.data['sc_stu_disp_detail.comments'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + dispDetail + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}