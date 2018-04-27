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
		this.editRowsEmUseColumn();
	},
	abScRptRmInv_SumGrid_onUpdateRoomWidth:function(){
		var grid =this.abScRptRmInv_SumGrid;
		var selectedRecordList=grid.getSelectedRecords();
		if(selectedRecordList.length==0){
			View.alert('请选择要操作的数据');
			return;
		}
		   View.prompt('更改房屋长宽', '输入长宽,点击确定', function(button, text) {
			   if(button!='cancel' && text==''){
				   View.alert('请输入长宽');
					return; 
			   }
	            if (button == 'ok') {
					for(var i=0;i<selectedRecordList.length;i++){
						var record=selectedRecordList[i];
						var blId=record.getValue('rm.bl_id');
						var flId=record.getValue('rm.fl_id');
						var rmId=record.getValue('rm.rm_id');
						abScRptRmInvByFl.updateRoomWidthHeight(blId, flId, rmId, text);
					}
	            }
	           grid.refresh();
	        });
		
		
	},
	updateRoomWidthHeight:function(blId,flId,rmId,textValue){
		var ds= View.dataSources.get("dsRm")
	
		var restriction={"rm.bl_id":blId,"rm.fl_id":flId,"rm.rm_id":rmId};
		var record=ds.getRecord(restriction);
		try{
			record.setValue("rm.option1",textValue);
			ds.saveRecord(record);
		}catch(e){}

		
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
				rowEl.cells[14].innerHTML = empName;
			}else {
				//show button in cell
				rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[14].className ="button";
		        rowEl.cells[14].innerHTML ='<input id="' + i+ '" type="button" class="perRowButton" value="'+getMessage("btnShow")+'"  onclick="onShowAction(this);"/> ';
			}
		}
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
	setPanelTitle('abScRptRmInv_SiteTree', title);
	
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
    facultySumGrid.refresh(restriction);
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
