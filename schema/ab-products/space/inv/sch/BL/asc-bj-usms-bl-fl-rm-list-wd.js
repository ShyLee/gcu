/**
 * @author Keven.xi
 */
var abScRptRmInvByFl =  View.createController('abScRptRmInvByFlController', {
	blId:"",
	flId:"",
	blName:"",
	
	afterViewLoad: function(){
		    this.abScRptRmInv_SiteTree.addParameter('sitetIdSql', "");
	        this.abScRptRmInv_SiteTree.addParameter('blId', "IS NOT NULL");
	        this.abScRptRmInv_SiteTree.createRestrictionForLevel = createRestrictionForLevel;
	},
	abScRptRmInv_SumGrid_afterRefresh:function(){
		var title = this.blName + "-" + this.flId;
	    this.abScRptRmInv_SumGrid.setTitle(title);
		//this.editRowsEmUseColumn();
	},
	
	editRowsEmUseColumn:function(){
		var rows = this.abScRptRmInv_SumGrid.rows;
		var ds = View.dataSources.get('ds_ab-sc-rpt-rm-inv-by-fl_grid_em');
		var restriction = new Ab.view.Restriction(); 
		var records; 
		var empName;
		var rowEl;
		
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			restriction.clauses.length = 0;
			restriction.addClause('rm.bl_id',row['rm.bl_id'],'=');
			restriction.addClause('rm.fl_id',row['rm.fl_id'],'=');
			restriction.addClause('rm.rm_id',row['rm.rm_id'],'=');
			records = ds.getRecords(restriction);
			
			if (records.length <= 1){
				empName = "";
				if (records.length == 1){
					empName = records[0].getValue('em.name');
				}
				rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[11].innerHTML = empName;
			}else {
				empName==""
				for(var j = 0; j < records.length; j++){
					var name=records[j].getValue('em.name');
					if(empName==""){
						empName=name;
					}else{
						empName=empName+","+name;
					}
				}
				rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[11].innerHTML = empName;
				//show button in cell
				/*rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[11].className ="button";
		        rowEl.cells[11].innerHTML ='<input id="' + i+ '" type="button" class="perRowButton" value="'+getMessage("btnShow")+'"  onclick="onShowAction(this);"/> ';
		        var a;*/
			}
		}
	},
	showEmInfo:function(){
		var panel = this.abScRptRmInv_SumGrid;
		var selectedIndex = panel.selectedRowIndex;
		var em_name = panel.rows[selectedIndex]["rm.em_use"];
		var array=[];
		var res= new Ab.view.Restriction();
		array = em_name.split(',');
		if(!valueExistsNotEmpty(em_name)){
			View.showMessage("该房间无使用人");
	        return;
		}
		if(valueExistsNotEmpty(array)){
			res.addClause('em.name',array,'in');
		}
		this.emInfoPanel.refresh(res);
		this.emInfoPanel.setTitle("房间使用人信息");
		this.emInfoPanel.showInWindow({
		      x:200,
		      y:200,
		      width: 650,
		      height: 500
		     });
	},
	sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.abScRptRmInv_SumGrid.show(false);
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var treePanel = View.panels.get("abScRptRmInv_SiteTree");
        var siteId = consolePanel.getFieldValue('property.site_id');
        if (siteId) {
            treePanel.addParameter('siteId', " site.site_id like'" + siteId + "%'");
			treePanel.addParameter('siteOfNullPr', " site.site_id like'" + siteId + "%'");
            treePanel.addParameter('siteOfNullBl', " site.site_id like'" + siteId + "%'");
        }
        else {
            treePanel.addParameter('siteId', " 1=1 ");
			treePanel.addParameter('siteOfNullPr', " 1=1 ");
            treePanel.addParameter('siteOfNullBl', " 1=1 ");
        }
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            treePanel.addParameter('prId', " like'" + propertyId + "%'");
            treePanel.addParameter('prOfNullBl', " property.pr_id like'" + propertyId + "%'");
            treePanel.addParameter('siteOfNullPr', " 1=0 ");
        }
        else {
            treePanel.addParameter('prId', " IS NOT NULL ");
            treePanel.addParameter('prOfNullBl', " 1=1 ");
        }
		
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            treePanel.addParameter('blId', " like '" + buildingId + "%'");
			treePanel.addParameter('siteOfNullPr', " 1=0 ");
            treePanel.addParameter('prOfNullBl', "1=0");
        }
        else {
            treePanel.addParameter('blId', "IS NOT NULL");
        }
        var bl_use = consolePanel.getFieldValue('bl.use1');
		if (bl_use) {
			treePanel.addParameter('blUseFor',
					"bl.use1 = '" + bl_use + "'");
			treePanel.addParameter('siteOfNullPr', " 1=0 ");
			treePanel.addParameter('prOfNullBl', "1=0");
			
		} else {
			treePanel.addParameter('blUseFor', "1=1");
		}
        treePanel.refresh();
        this.curTreeNode = null;
    }
    
});
/**
	 * show the employees in the selected room 
	 * @param {Object} rowEl
	 */
function  onShowAction(rowEl){
	    var panel = View.panels.get('abScRptRmInv_SumGrid');
	    var row = panel.rows[rowEl.id];
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", row['rm.bl_id'], "=", true);
        restriction.addClause("rm.fl_id", row['rm.fl_id'], "=", true);
        restriction.addClause("rm.rm_id", row['rm.rm_id'], "=", true);
        
        var empDetailPanel = View.panels.get('abScRptRmInv_EmpGrid');
        empDetailPanel.refresh(restriction);
        empDetailPanel.show(true);
        empDetailPanel.showInWindow({
            width: 300,
            height: 250
        });
		
		var title = String.format(getMessage('empDetailsTitle'), row['rm.bl_id'] + "-" + row['rm.fl_id']+"-"+row['rm.rm_id']);
        empDetailPanel.setTitle(title);
     
		
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScRptRmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	
	
    var blId = currentNode.data['fl.bl_id'];
    var blName = currentNode.data['bl.name'];
    var flId = currentNode.data['fl.fl_id'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    
	abScRptRmInvByFl.blId = blId;
	abScRptRmInvByFl.blName = blName;
	abScRptRmInvByFl.flId = flId;
    var facultySumGrid = View.panels.get('abScRptRmInv_SumGrid');
    facultySumGrid.addParameter('res', "'1'='1'");
    facultySumGrid.refresh(restriction);
    facultySumGrid.setTitle("房间列表 :"+blName+"—"+flId);
}

/**
 * show room list of building 
 */
function onBlTreeClick(){
	var currentNode = View.panels.get('abScRptRmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	
	
    var blId = currentNode.data['bl.bl_id'];
    var blName= currentNode.data['bl.name'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    
	abScRptRmInvByFl.blId = blId;
	abScRptRmInvByFl.flId = "";
    var facultySumGrid = View.panels.get('abScRptRmInv_SumGrid');
    facultySumGrid.addParameter('res', "'1'='1'");
    facultySumGrid.refresh(restriction);
    facultySumGrid.setTitle("房间列表 :"+blName);
}

function onPrTreeClick(){
	var currentNode = View.panels.get('abScRptRmInv_SiteTree').lastNodeClicked;
	var prId=currentNode.data['property.pr_id'];
	var title = String.format(getMessage('treeTitle'), prId);
	setPanelTitle('abScRptRmInv_SiteTree', title);
	
    var facultySumGrid = View.panels.get('abScRptRmInv_SumGrid');
    
    facultySumGrid.addParameter('res', " rm.bl_id in (select bl_id from bl where pr_id ='"+prId+"')");
    var restriction = new Ab.view.Restriction();
    facultySumGrid.refresh(restriction);
    facultySumGrid.setTitle("房间列表 :"+prId);
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScRptRmInv_SiteTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var prId = treeNode.data['property.pr_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + prId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
		var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 3) {
        var floorId = treeNode.data['fl.fl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
        if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
        }
		var prId = parentNode.data['property.pr_id'];
		if (level == 2) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.pr_id', prId, '=', 'AND', true);
        }
    }
    return restriction;
}
