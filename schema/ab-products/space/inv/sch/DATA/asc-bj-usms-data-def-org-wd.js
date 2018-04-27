/**
 * keven.xi
 */
var abScDefUnitController = View.createController('abScDefUnit', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUSINESSUNIT', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    afterViewLoad: function(){
        this.bu_tree.addParameter('dvId', "IS NOT NULL");
//        this.bu_tree.addParameter('dpId', "IS NOT NULL");
        this.bu_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.bu_detail.show(false);
        this.dv_detail.show(false);
        this.dp_detail.show(false);
    },
    
    bu_detail_onSave: function(){
        this.operDataType = "POST";
        var panel = View.panels.get('bu_detail');
        panel.save();
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'bu_tree', parentNode);
    },
    bu_detail_onDelete: function(){
		if (bu_detail.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POST";
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefUnitFormDs", "bu_detail", "bu.bu_id", "bu_tree", parentNode);
    },
    dv_detail_onSave: function(){
    	this.operDataType = "POSTLEVEL" ;
    	var panel = View.panels.get('dv_detail');
        panel.save();
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'bu_tree', parentNode);
    },
    dv_detail_onDelete: function(){
		if (dv_detail.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POSTLEVEL";
        var formPanel = View.panels.get('dv_detail');
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefDivisionFormDs", "dv_detail", "dv.dv_id", "bu_tree", parentNode);
    },
    dp_detail_onSave: function(){
        this.operDataType = "POSTION";
        var panel = View.panels.get('dp_detail');
        panel.save();
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        commonRefresh(panel, 'bu_tree', parentNode);
    },
    dp_detail_onDelete: function(){
		if (dp_detail.newRecord) {
			View.showMessage("没有保存!");
			return;
		} 
        this.operDataType = "POSTION";
        var formPanel = View.panels.get('dp_detail');
        var parentNode = getParentNode('bu_tree', getMessage("selectTreeNode"), this.operDataType, this);
        AUSC_commonDelete("abScDefDepartmentFormDs", "dp_detail", "dp.dp_id", "bu_tree", parentNode);
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('bu_tree');
    },
    
    dv_detail_onUpdate: function(){
        updateStaticFieldAboutEmOrRm();
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newUnit = getMessage("Unit");
        var menutitle_newDivision = getMessage("Division");
        var menutitle_newDepartment = getMessage("Department");
        
        menuItems.push({
            text: menutitle_newUnit,
            handler: this.onAddNewButtonPush.createDelegate(this, ['UNIT'])
        });
        menuItems.push({
            text: menutitle_newDivision,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DIVISION'])
        });
        menuItems.push({
            text: menutitle_newDepartment,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DEPARTMENT'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    onAddNewButtonPush: function(menuItemId){
        var bu_id = "";
        var bu_name = "";
        var dv_id = "";
        var dv_name = "";
        var nodeLevelIndex = -1;
        if (valueExists(this.curTreeNode)) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    bu_id = this.curTreeNode.data["bu.bu_id"];
                    bu_name = this.curTreeNode.data["bu.name"];
                    break;
                case 1:
                    bu_id = this.curTreeNode.data["dv.bu_id"];
                    bu_name = this.curTreeNode.data["bu.name"];
                    dv_id = this.curTreeNode.data["dv.dv_id"];
                    dv_name = this.curTreeNode.data["dv.dv_name"];
                    break;
                case 2:
                    dv_id = this.curTreeNode.data["dv.dv_id"];
                    dv_name = this.curTreeNode.data["dv.dv_name"];
                    break;
            }
        }
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "UNIT":
                this.unitDetailTabs.selectTab("buTab", null, true, false, false);
                break;
            case "DIVISION":
				if (nodeLevelIndex == -1) {
                    View.showMessage('请选择单位分类');
                    return;
                }
                this.unitDetailTabs.selectTab("dvTab", null, true, false, false);
                this.dv_detail.setFieldValue("dv.bu_id",bu_id);
                this.dv_detail.setFieldValue("bu.name",bu_name);
                break;
            case "DEPARTMENT":
			    if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage('请选择使用单位');
                    return;
                }
                this.unitDetailTabs.selectTab("dpTab", null, true, false, false);
                this.dp_detail.setFieldValue("dp.dv_id",dv_id);
                this.dp_detail.setFieldValue("dv.dv_name",dv_name);
                break;
        }
    },
    
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var buId = consolePanel.getFieldValue('dv.bu_id');
        if (buId) {
            this.bu_tree.addParameter('buId', "='" + buId + "'");
        }
        else {
            this.bu_tree.addParameter('buId', "IS NOT NULL ");
        }
        var dvId = consolePanel.getFieldValue('dv.dv_id');
        if (dvId) {
            this.bu_tree.addParameter('dvId', " = '" + dvId + "'");
        }
        else {
            this.bu_tree.addParameter('dvId', "IS NOT NULL");
        }
        
        var dpId = consolePanel.getFieldValue('dp.dp_id');
        if (dpId) {
            this.bu_tree.addParameter('dpId', " = '" + dpId + "'");
        }
        else {
            this.bu_tree.addParameter('dpId', "IS NOT NULL");
        }
        if(buId == "" && dvId == "" && dpId == ""){
        	this.bu_tree.addParameter('orand' , " OR ");
        }else{
        	this.bu_tree.addParameter('orand' , " AND ");
        }
        
        this.bu_tree.refresh();
        this.curTreeNode = null;
    },
    
	/**
	 * kevin added  2011-9-19
	 */
	calculationEmpAndStudentCount:function(){
		var result;
		try {
			result=Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateDvEmAndStudentCount');
		}catch (e) {
		 	Workflow.handleError(e);
 	 	}
		
     	if (result.code != 'executed') {
			Workflow.handleError(result);
	 	} 
		
	},
	bu_tree_onTest:function(){
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler2-test');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	}
    
    
});


/*
 *
 */
function onBusinessUnitClick(){
    var curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
    var bu_id = curTreeNode.data['bu.bu_id'];
    View.controllers.get('abScDefUnit').curTreeNode = curTreeNode;
    if (!bu_id) {
        View.panels.get("bu_detail").show(false);
        View.panels.get("dv_detail").show(false);
        View.panels.get("dp_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bu.bu_id", bu_id, '=');
        View.panels.get('unitDetailTabs').selectTab("buTab", restriction, false, false, false);
    }
}

function onTreeviewClick(){
    View.controllers.get('abScDefUnit').curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'bu_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var buName = treeNode.data['bu.name'];
        var buCode = treeNode.data['bu.bu_id'];
        
        if (!buCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noBusinessUnit") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var dvName = treeNode.data['dv.dv_name'];
        var dvId = treeNode.data['dv.dv_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + dvId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + dvName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var deptName = treeNode.data['dp.dp_name'];
        var deptCode = treeNode.data['dp.dp_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + deptCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + deptName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var buId = parentNode.data['bu.bu_id'];
            if (!buId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('dv.bu_id', '', 'IS NULL', 'AND', true);
            }
            else {
                restriction = new Ab.view.Restriction();
                restriction.addClause('dv.bu_id', buId, '=', 'AND', true);
            }
        }
        
    }
    return restriction;
}

function setPattern(){
    View.hpatternPanel = View.panels.get('dv_detail');
    View.hpatternField = 'dv.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('dv.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

function selectValue(sId, value){
    var s = document.getElementById(sId);
    var ops = s.options;
    for (var i = 0; i < ops.length; i++) {
        var tempValue = ops[i].value;
        if (tempValue == value) {
            ops.selectedIndex = i;
        }
    }
}
