var controller = View.createController('abSpAsgnEmToRm_Controller', {
	datecheckin:"",
    afterViewLoad: function(){
		 this.abSpAsgnEmToRm_blTree.addParameter('rmCatRestriction', "rm.rm_cat like '%学生宿舍%'");
		 this.abSpAsgnEmToRm_emSelect.addParameter('gangWei', dormConstantControl.EM_GANGWEI_ID);
        // 指定绘图控制指令
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectEm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_emSelect", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_drawingPanel", "onclick", getMessage('selectAnotherEm'));
        this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
        var ruleset = new DwgHighlightRuleSet();
        //KB3037147 - 变化突出显示颜色
        //Non-Occupiable
        ruleset.appendRule("rm.legend_level", "1", "ADADAD", "==");
        //Vacant
        ruleset.appendRule("rm.legend_level", "2", "33FF00", "==");
        //Available
        ruleset.appendRule("rm.legend_level", "3", "0000FF", "==");
        //At Capacity
        ruleset.appendRule("rm.legend_level", "4", "E7CB0A", "==");
        //Exceeds Capacity
        ruleset.appendRule("rm.legend_level", "5", "FF0000", "==");
        this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm", ruleset);
        this.abSpAsgnEmToRm_legendGrid.afterCreateCellContent = ASDM_setLegendLabel;
        this.abSpAsgnEmToRm_emSelect.addEventListener('onMultipleSelectionChange', onEmSelectionChange);
    },
//------------------------全屏显示CAD图纸滴-------------------------   
    abSpAsgnEmToRm_drawingPanel_onShowDwgView:function(){
    	if (this.abSpAsgnEmToRm_drawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpAsgnEmToRm_drawingPanel.getRecValues(0);
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
//------------------------弹出Panel滴-------------------------  	
	ondilog: function (){
		this.ruzhushijian.showInWindow({
            x: 150,
            y: 120,
            width: 350,
            height: 150,
            closeButton: false
        });
		this.ruzhushijian.refresh();
	},
	ruzhushijian_onSave: function(){
		this.isKey=this.ruzhushijian.getFieldValue("sc_stu_log.is_key");
		this.datecheckin=this.ruzhushijian.getFieldValue("sc_stu_log.date_checkin");
		if(this.datecheckin==""){
			View.showMessage(getMessage('message2'));
		}else{
			submitChanges();
		}
    }, 
    afterInitialDataFetch:function(){
        this.onStart();
      }, 
    helpPanel_afterRefresh:function(){
        this.onStart();
    },
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0]; //定义一个tabs，可以在各个tab之间进行传值，parent参数是指当前所在js是tab
//	    this.dvId=this.tabs.dvId; //获取tabs中的值
//	    this.dvName=this.tabs.dvName;
		var blName=this.tabs.blName;
        var emId=this.tabs.emId;
        var emName=this.tabs.emName;
    	var res = new Ab.view.Restriction();
    	if(emName!="" && emName!=undefined){
    		res.addClause('em.name',emName, '=');
    	}
    	if(emId!="" && emId!=undefined){
    		res.addClause('em.em_id',emId, '=');
    	}
    	this.abSpAsgnEmToRm_emSelect.refresh(res);
	    if(blName!="" && blName!=undefined){
	    	this.abSpAsgnEmToRm_blTree.addParameter('blName',"bl.name='"+blName+"'");
	    	this.abSpAsgnEmToRm_blTree.refresh();
	    }else{
	    	this.abSpAsgnEmToRm_blTree.addParameter('blName',"1=1");
	    	this.abSpAsgnEmToRm_blTree.refresh();
	    }
	},
    verifySelectedStudent: function(){
		if(this.abSpAsgnEmToRm_emSelect.getSelectedGridRows().length>0){
			return true;
		}else{
			return false;
		}
	}
});
//==============================================Function==============================================//
var emAssigns = [];
/**
 * 从axvw中获取值付给字段并set进去滴
 */
function onEmSelectionChange(rowbbb){
	var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
	if (drawingPanel.isLoadedDrawing) {
    emAssigns = [];
    var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    if (cp.isLoadedDrawing) {
        var grid = View.panels.get("abSpAsgnEmToRm_emSelect");
        var rows = grid.getSelectedRows();
        if (rows.length < 1) {
            cp.clearAssignCache(true);
            cp.processInstruction("ondwgload", "");
            return;
        }
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            cp.processInstruction('abSpAsgnEmToRm_emSelect', 'onclick');
            var emAssign = new Ab.data.Record();
            emAssign.setValue("sc_stu_log.em_id", row['em.em_id']);
            emAssign.setValue("sc_stu_log.stu_name", row['em.name']);
            emAssign.setValue("sc_stu_log.dv_id", row['em.dv_id']);
            emAssign.setValue("sc_stu_log.stu_sex", row['em.sex']);
            emAssign.setValue("sc_stu_log.bl_id_current", row['em.bl_id']);
            emAssign.setValue("sc_stu_log.fl_id_current", row['em.fl_id']);
            emAssign.setValue("sc_stu_log.rm_id_current", row['em.rm_id']);
            emAssigns.push(emAssign);
        }
        cp.setToAssign("sc_stu_log.em_id", emAssigns[0].getValue('sc_stu_log.em_id'));
    }
	}else{
		View.showMessage(getMessage('message'));
		View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
	}
}
/**
 * 点击onTreeClick出发abSpAsgnEmToRm_blTree
 */
function onTreeClick(ob){
	controller.onclickedFlObj=ob;
    var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnEmToRm_emAssigned');
    ASDM_setSelectability(ob.restriction,'abSpAsgnEmToRm_drawingPanel','ds_ab-sp-rm_occupiable');
    ASDM_flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}
//------------------------点击CAD图纸滴-------------------------  
function onDwgPanelClicked(pk, selected, color){
	if(controller.verifySelectedStudent()){
		if (ASDM_checkCount(pk,"abSpAsgnEmToRm_emAssigned")) {
			View.confirm(getMessage('countOver'), function(button){
				if (button == 'yes') {
					addAssignmentRows1(pk,"ds_ab-sp-asgn-em-to-rm_rmCnt","abSpAsgnEmToRm_emAssigned",'abSpAsgnEmToRm_drawingPanel');
					View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
				}
			});
		}
		else {
			addAssignmentRows1(pk,"ds_ab-sp-asgn-em-to-rm_rmCnt","abSpAsgnEmToRm_emAssigned",'abSpAsgnEmToRm_drawingPanel');
			View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
		}
		View.getControl('', 'abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
	}else{
		View.showMessage("请选择辅导员！");
		return;
	}
}
function addAssignmentRows1(pk,ds,panel,panel2){
    var grid = View.panels.get(panel);
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        var bFound = false;
        for (var j = 0; j < grid.rows.length && !bFound; j++) {
            var row = grid.rows[j];
            if (row["sc_stu_log.em_id"] == emAssign.getValue('sc_stu_log.em_id')) {
                grid.removeGridRow(j);
                bFound = true;
            }
        }
        var blId=pk[0];
        var blName=ASDM_GetBlName(pk[0]);
        emAssign.setValue("sc_stu_log.bl_name", blName);
        emAssign.setValue("sc_stu_log.bl_id", pk[0]);
        emAssign.setValue("sc_stu_log.fl_id", pk[1]);
        emAssign.setValue("sc_stu_log.rm_id", pk[2]);
        var cap_em=ASDM_getRmCapacity(pk[0],pk[1],pk[2]);
        emAssign.setValue("sc_stu_log.cap_em", cap_em);
        var kongxian=ASDM_kongXian(pk,ds)-i;
        emAssign.setValue("sc_stu_log.kongxian", kongxian);
    	if(kongxian<0){
    		View.showMessage(getMessage('message3'));
			return;
    		controller.abSpAsgnEmToRm_emAssigned.close();
    		return;
    	}
        grid.addGridRow(emAssign);
    }
    View.panels.get(panel2).processInstruction(panel2, 'onclick');
    grid.sortEnabled = false;
    grid.update();
}
function submitChanges(){
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
	if (grid.rows.length < 1) {
		View.showMessage(getMessage('noEmSelected'));
		return;
	}
	View.openProgressBar(getMessage('saving'));
	doSubmitChanges.defer(500);
	doSubmitChanges();
}
/**
 * 保存配置.
 */
function doSubmitChanges(){
	var dsEmp = View.dataSources.get("ds_stuAssign");
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var dsStu = View.dataSources.get("sc_fdy_ds");
    var dsRm = View.dataSources.get("ds_ab-sp-rm_occupiable");
	try {
		for (var i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];
			var emId = row.getFieldValue("sc_stu_log.em_id");
			var buildingId = row.getFieldValue("sc_stu_log.bl_id");
			var floorId = row.getFieldValue("sc_stu_log.fl_id");
			var roomId = row.getFieldValue("sc_stu_log.rm_id");
			var emName = row.getFieldValue("sc_stu_log.stu_name");
			var dvId = row.getFieldValue("sc_stu_log.dv_id");
			var buildingIdCurrent = row.getFieldValue("sc_stu_log.bl_id_current");
			var floorIdCurrent = row.getFieldValue("sc_stu_log.fl_id_current");
			var roomIdCurrent = row.getFieldValue("sc_stu_log.rm_id_current");
			var emSex = "fe";
			var emGangwei = "辅导员岗";
			var capEm = row.getFieldValue("sc_stu_log.cap_em");
			var dateCheckin = controller.datecheckin;
			var is_key=controller.isKey;
			var mark="入住";
			//往sc_stu_log里面插入一条数据
			var rec = new Ab.data.Record();
			rec.isNew = true;
			rec.setValue("sc_stu_log.em_id", emId);
			rec.setValue("sc_stu_log.bl_id", buildingId);
			rec.setValue("sc_stu_log.fl_id", floorId);
			rec.setValue("sc_stu_log.dv_id", dvId);
			rec.setValue("sc_stu_log.stu_name", emName);
			rec.setValue("sc_stu_log.rm_id", roomId);
			rec.setValue("sc_stu_log.stu_sex", emSex);
			rec.setValue("sc_stu_log.cap_em", capEm);
			rec.setValue("sc_stu_log.is_key", is_key);
			rec.setValue("sc_stu_log.mark", mark);
			rec.setValue("sc_stu_log.date_checkin", dateCheckin);
			rec.oldValues = new Object();
			rec.oldValues["sc_stu_log.em_id"] = emId;
			dsEmp.saveRecord(rec);
			//更新em表里面的内容		
			var rec2 = new Ab.data.Record();
			rec2.isNew = true;
			rec2.setValue("sc_em.em_id", emId);
			rec2.setValue("sc_em.bl_id", buildingId);
			rec2.setValue("sc_em.fl_id", floorId);
			rec2.setValue("sc_em.dv_id", dvId);
			rec2.setValue("sc_em.name", emName);
			rec2.setValue("sc_em.rm_id", roomId);
			rec2.setValue("sc_em.sex", emSex);
			rec2.setValue("sc_em.gangwei_id", emGangwei);
			rec2.setValue("sc_em.is_key", is_key);
			rec2.oldValues = new Object();
			rec2.oldValues["sc_em.em_id"] = emId;
			dsStu.saveRecord(rec2);
			//更新rm表里面的内容
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rm.bl_id", buildingId, "=");
			restriction.addClause("rm.fl_id", floorId, "=");
			restriction.addClause("rm.rm_id", roomId, "=");	       		
			var rmRecord=dsRm.getRecord(restriction);
			var current_key=rmRecord.getValue("rm.count_key");
			var current_unget_key=rmRecord.getValue("rm.count_unget_key");
			var current_untrn_key=rmRecord.getValue("rm.count_unrtn_key");
			if(is_key=="1"){
				var count_key=parseFloat(current_key)+1;
				rmRecord.setValue("rm.count_key", count_key);
			}else if(is_key=="3"){
				var count_key=parseFloat(current_key)-1;
				rmRecord.setValue("rm.count_key", count_key);
			}else if(is_key=="0"){
				var count_unget_key=parseFloat(current_unget_key)+1;
				rmRecord.setValue("rm.count_unget_key", count_unget_key);							
			}else if(is_key=="2"){
				var count_unrtn_key=parseFloat(current_untrn_key)+1;
				rmRecord.setValue("rm.count_unrtn_key", count_unrtn_key);	
			}			
			dsRm.saveRecord(rmRecord);
			ASDM_setRoomEmpCnt(buildingId, floorId, roomId, 1,"ds_ab-sp-asgn-em-to-rm_rmCnt");
			if (buildingIdCurrent && floorIdCurrent && roomIdCurrent) {
				ASDM_setRoomEmpCnt(buildingIdCurrent, floorIdCurrent, roomIdCurrent, -1,"ds_ab-sp-asgn-em-to-rm_rmCnt");
			}
		}
		grid.removeRows(0);
		grid.update();
		grid.show(false);
		View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
		var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
		cp.applyDS('labels');
		cp.applyDS('highlight');
		cp.clearAssignCache(true);
		View.closeProgressBar();
	} 
	catch (e) {
		View.closeProgressBar();
		Workflow.handleError(e);
		return;
	}
	View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
	ASDM_resetAssignment(drawingPanel, grid);
}
/**
 * 从abspasgnemtorm_emassigned删除选定的员工分配。
 */
function removeEmpFromList(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var row = grid.rows[grid.selectedRowIndex];
    View.panels.get('abSpAsgnEmToRm_drawingPanel').unassign('sc_stu_log.em_id', row['sc_stu_log.em_id']);
    grid.removeGridRow(row.row.getIndex());
    grid.update();
}
