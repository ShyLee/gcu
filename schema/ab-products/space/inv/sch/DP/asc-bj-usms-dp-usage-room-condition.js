/**
 * zhaoyongli 
 */
var roomUsageByDpController = View.createController('roomUsageByDpController', {

    //Current Selected Node 
    curTreeNode: null,
    buId:null,
    dvId:null,
    //The tree panel 
    treeview: null,
    
    afterViewLoad: function(){
        this.bu_tree.addParameter('dvId', "IS NOT NULL");
        this.bu_tree.addParameter('dpId', "IS NOT NULL");
        
        this.bu_tree.createRestrictionForLevel = createRestrictionForLevel;
        this.abScSearchRmLayoutByDvGrid.buildPostFooterRows = addTotalRow;    
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('hightRoomByDv'));
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
		var controller=this;
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
            var highlightResc = "";
            if (controller.dvId) {
                highlightResc += " AND rm.dv_id = '" + controller.dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }

            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
			View.panels.get('abSpHlRmByDp_DrawingPanel').clear();
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
           
        });
		
        
    },
    afterInitialDataFetch: function(){
        this.treeview = View.panels.get('bu_tree');
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
    },
    consolePanel_onShow: function(){
        this.refreshTreeview();
    },
 
    
    refreshTreeview: function(){
        var consolePanel = this.consolePanel;
        
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
    
    onShowDpGrid: function(){
        blId = "";
        var dvRes = " IS NOT NULL";
        var blRes = " IS NOT NULL";
        if (this.dvId) {
            dvRes = " = '" + this.dvId + "'";
        }
        if (blId) {
            blRes = " = '" + blId + "'";
        }
        
        this.abSpHlRmByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlRmByDp_flGrid.refresh();
    },
	abSpHlRmByDp_DrawingPanel_onShowDwgView:function(){
		   if (this.abSpHlRmByDp_DrawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpHlRmByDp_DrawingPanel.getRecValues(0);
			  var blId = recValue["rm.bl_id"];
			  var flId = recValue["rm.fl_id"];
			  var dwgName = recValue["rm.dwgname"]; 

			  	View.openDialog('asc-bj-usms-show-fl-dwg.axvw', null, false, {
			  		maximize:true,
			  		closeButton: false,
			  		blId: blId,
			  		flId: flId,
			  		dwgName: dwgName
			  	});
			  
		   }
	},
	abSpHlRmByDp_flGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
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
	var curNode=View.panels.get("bu_tree").lastNodeClicked;
	roomUsageByDpController.curTreeNode= curNode;
	var buId=curNode.data['dv.bu_id'];
	var dvId=curNode.data['dv.dv_id'];
	
	var buName=curNode.data['bu.name'];
	var dvName=curNode.data['dv.dv_name'];
	
	roomUsageByDpController.buId=buId;
	roomUsageByDpController.dvId=dvId;
	roomUsageByDpController.onShowDpGrid();
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.dv_id", dvId, "=");
    restriction.addClause("rm.bu_id", buId, "=");
    var rmInfoPanel=View.panels.get("abScRptRmInv_SumGrid")
    rmInfoPanel.refresh(restriction);
    rmInfoPanel.setTitle(getMessage("roomInfo").replace('{0}', buName+"-"+dvName));
	
	var res = new Ab.view.Restriction();
    res.addClause("rm.dv_id", dvId, "=");

    var abScSearchRmLayoutByDvGrid=View.panels.get("abScSearchRmLayoutByDvGrid")
    abScSearchRmLayoutByDvGrid.refresh(res);
	abScSearchRmLayoutByDvGrid.setTitle(dvName);
	
	var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
    drawingPanel.clear();
	setDrawingTitle(buName,dvName);
	
}
function onClickDrawingHandler(pk, selected){
	//kevenxi edit 2011-7-13
	/*
    if (selected) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", pk[0], "=", true);
        restriction.addClause("rm.fl_id", pk[1], "=", true);
        restriction.addClause("rm.rm_id", pk[2], "=", true);
        
        var rmDetailPanel = View.panels.get('abSpHlRmByDp_RmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
    }
    setDrawingTitle();
	*/
	
	 if (selected) {
		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 500,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
		
		var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
	
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
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +deptName+ "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + deptCode + "</span> ";
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

function setDrawingTitle(buId,dvId){
    if (dvId && buId) {
		var title = String.format(getMessage('highlight').replace('{0}',buId+"-"+dvId));
        View.panels.get('abSpHlRmByDp_DrawingPanel').setTitle(title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", getMessage("hightRoomByDv"));
    }
}


function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalRoom = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['rm.area_shiyong'];
		if(row['rm.area_shiyong.raw']){
			fntstdCountValue = row['rm.area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['rm.count_rm'];	
		if(row['rm.count_rm.raw']){
			fntstdPriceValue = row['rm.count_rm.raw'];
		}
		if (!isNaN(parseInt(fntstdPriceValue))) {
			totalRoom += parseInt(fntstdPriceValue);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
//    addColumn(gridRow, 1);
    // column 2: empty	
    addColumn(gridRow, 1, getMessage('total'));
    // column 3: 'Total' title
    addColumn(gridRow, 1);
    // column 4: total room
    addColumn(gridRow, 1, ds.formatValue('rm.count_rm',totalRoom, true));
    // column 5: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rm.area_shiyong',totalAreaShiyong, true));
}