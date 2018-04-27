var scStuOtherController = View.createController('scStuOtherController', {
	afterViewLoad: function(){
	    this.scOtherDrawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
	    this.scOtherDrawingPanel.appendInstruction("ondwgload", "", getMessage('selectEm'));
//	    this.scOtherDrawingPanel.appendInstruction("scOtherGridPanel", "onclick", getMessage('selectRm'));
//	    this.scOtherDrawingPanel.appendInstruction("scOtherDrawingPanel", "onclick", getMessage('selectAnotherEm'));
	    this.scOtherDrawingPanel.addEventListener('onclick', onDwgPanelClicked);
	    var ruleset = new DwgHighlightRuleSet();
	    ruleset.appendRule("rm.legend_level", "1", "ADADAD", "==");
	    ruleset.appendRule("rm.legend_level", "2", "33FF00", "==");
	    ruleset.appendRule("rm.legend_level", "3", "0000FF", "==");
	    ruleset.appendRule("rm.legend_level", "4", "FF0000", "==");
	    this.scOtherDrawingPanel.appendRuleSet("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmHighlight", ruleset);
	    this.scOtherLegendGridPanel.afterCreateCellContent = ASDM_setLegendLabel;
	    this.scOtherGridPanel.addEventListener('onMultipleSelectionChange', onOtherSelectionChange);
	},
	consolePanel_onShow: function(){
		var blId = this.consolePanel.getFieldValue("bl.bl_id");
		var identiCode = this.consolePanel.getFieldValue("sc_stu_other.identi_code");
		var proName = this.consolePanel.getFieldValue("sc_stu_other.pro_name");
		var resBl = new Ab.view.Restriction();
		var resOther = new Ab.view.Restriction();
		resBl.addClause(' 1=1');
		resOther.addClause(' 1=1');
		if(blId!=""){
			resBl.addClause('bl.bl_id',blId,'=');
		}
		if(identiCode!=""){
			resOther.addClause('sc_stu_other.identi_code',identiCode,'=');
		}
		if(proName!=""){
			resOther.addClause('sc_stu_other.pro_name',proName,'=');
		}
		this.scOtherBlTreePanel.refresh(resBl);
		this.scOtherGridPanel.refresh(resOther);
    },
    consolePanel_onClear:function(){
    	this.consolePanel.setFieldValue("sc_stu_other.identi_code","");
    	this.consolePanel.setFieldValue("bl.name","");
    	this.consolePanel.setFieldValue("bl.bl_id","");
    	this.consolePanel.setFieldValue("sc_stu_other.pro_name","");
	},
	scOtherGridPanel_onAdd:function(){
		
		this.scOtherFormPanel.showInWindow({
            x: 170,
            y: 150,
            width: 600,
            height: 400,
        });
		this.scOtherFormPanel.refresh([],true);
		//获取当前日期
		var currentDate = ASDM_getCurrentDate_Client();
		this.scOtherFormPanel.setFieldValue("sc_stu_other.date_checkin",currentDate);

	},
	onCloseDialog:function(){
		this.scOtherFormPanel.closeWindow();
	},
	editOtherForm:function(){
		this.scOtherFormPanel.showInWindow({
            x: 170,
            y: 150,
            width: 600,
            height: 400,
        });
		
		var  selectedIndex = this.scOtherGridPanel.selectedRowIndex;
		var id = this.scOtherGridPanel.rows[selectedIndex]["sc_stu_other.id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_stu_other.id" , id , "=");
		this.scOtherFormPanel.refresh(restriction,false);
		
	},
	consolePanel_onAllocated:function(){
		View.openDialog('asc-bj-dorm-others-assign.axvw', null, false, {
	          width: 900,
	          height: 600,
	  		  closeButton: false

   	    });
	},
	scOtherDormAssignPanel_onSave:function(){
		this.ruzhushijian.showInWindow({
            x: 170,
            y: 150,
            width: 350,
            height: 150,
            closeButton: false
        });
		this.ruzhushijian.refresh();
//		this.scOtherDateCheckinPanel.refresh();
	},
	ruzhushijian_onSave: function(){
		this.isKey=this.ruzhushijian.getFieldValue("sc_stu_other_log.is_key");
		submitChanges();
    },
	scOtherDrawingPanel_onShowDwg:function(){
		this.scOtherLegendGridPanel.show(false);
		this.scOtherDormAssignPanel.show(false);
	},
    verifySelectedOther: function(){
		if(this.scOtherGridPanel.getSelectedGridRows().length>0){
			return true;
		}else{
			return false;
		}
	}
});
function submitChanges(){
    var grid = View.panels.get("scOtherDormAssignPanel");
    if (grid.rows.length < 1) {
        View.showMessage(getMessage('noEmSelected'));
        return;
    }
    View.openProgressBar(getMessage('saving'));
    doSubmitChanges.defer(500);
    doSubmitChanges();
}
function doSubmitChanges(){
	var dsRm = View.dataSources.get("sc_other_rm_ds");
    var otherAssignDs = View.dataSources.get("sc_other_assign_ds");
    var gridAssign = View.panels.get("scOtherDormAssignPanel");
    var scOtherDs = View.dataSources.get("sc_other_save_ds");
    var gridOther = View.panels.get("scOtherGridPanel");
    try {
        for (var i = 0; i < gridAssign.gridRows.length; i++) {
            var row = gridAssign.gridRows.items[i];
            var id = row.record["sc_stu_other_log.other_id"];
            var identiCode = row.record["sc_stu_other_log.identi_code"];
            var stuName = row.record["sc_stu_other_log.pro_name"];
            var blId = row.record["sc_stu_other_log.bl_id"];
            var flId = row.record["sc_stu_other_log.fl_id"];
            var rmId = row.record["sc_stu_other_log.rm_id"];
            var capEm = row.record["sc_stu_other_log.cap_em"];
            var dateCheckin = row.record["sc_stu_other_log.date_checkin"];
            var dateCheckout = row.record["sc_stu_other_log.date_checkout"];
            var is_key=scStuOtherController.isKey;
            var mark="入住";          
            ////往sc_stu_other_log里面插入一条数据
            var rec = new Ab.data.Record();
            rec.isNew = true;
            rec.setValue("sc_stu_other_log.other_id", id);
            rec.setValue("sc_stu_other_log.identi_code", identiCode);
            rec.setValue("sc_stu_other_log.pro_name", stuName);
            rec.setValue("sc_stu_other_log.bl_id", blId);
            rec.setValue("sc_stu_other_log.fl_id", flId);
            rec.setValue("sc_stu_other_log.rm_id", rmId);
            rec.setValue("sc_stu_other_log.cap_em",capEm);
            rec.setValue("sc_stu_other_log.is_key", is_key);
            rec.setValue("sc_stu_other_log.date_checkin",dateCheckin);
            rec.setValue("sc_stu_other_log.date_checkout",dateCheckout);
            rec.setValue("sc_stu_other_log.mark", mark);
            otherAssignDs.saveRecord(rec);
            //更新sc_stu_other表里面的内容	
            var restriction1 = new Ab.view.Restriction();
			restriction1.addClause("sc_stu_other.id", id, "=");	       		
			var rec2=scOtherDs.getRecord(restriction1);
			rec2.setValue("sc_stu_other.identi_code", identiCode);
			rec2.setValue("sc_stu_other.bl_id", blId);
			rec2.setValue("sc_stu_other.fl_id", flId);
			rec2.setValue("sc_stu_other.rm_id", rmId);
			rec2.setValue("sc_stu_other.is_key", is_key);
			scOtherDs.saveRecord(rec2);
            //更新rm表里面的内容
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rm.bl_id", blId, "=");
			restriction.addClause("rm.fl_id", flId, "=");
			restriction.addClause("rm.rm_id", rmId, "=");	       		
			var rmRecord=dsRm.getRecord(restriction);
			var current_key=rmRecord.getValue("rm.count_key");
			if(is_key=="1"){
				var count_key=parseFloat(current_key)+1;
				rmRecord.setValue("rm.count_key", count_key);
			}else if(is_key=="3"){
				var count_key=parseFloat(current_key)-1;;
				rmRecord.setValue("rm.count_key", count_key);
			}else{
				rmRecord.setValue("rm.count_key", current_key);				
			}			
			dsRm.saveRecord(rmRecord);
        }
        gridAssign.removeRows(0);
        gridAssign.update();
        gridAssign.show(false);
        var cp = View.panels.get('scOtherDrawingPanel');
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.clearAssignCache(true);
        View.closeProgressBar();
        gridOther.refresh();
    } catch (e) {
        View.closeProgressBar();
        Workflow.handleError(e);
        return;
    }
}
function onFlTreeClick(ob){
	scStuOtherController.onclickedFlObj=ob;
    var currentNode = View.panels.get('scOtherBlTreePanel').lastNodeClicked;
    var drawingPanel = View.panels.get('scOtherDrawingPanel');
    drawingPanel.show(true);
    var form = View.panels.get('scOtherFormPanel');
    var grid = View.panels.get('scOtherDormAssignPanel');
    var legend = View.panels.get('scOtherLegendGridPanel');
    form.show(false);
	legend.show(true);
	ASDM_setSelectability(ob.restriction,'scOtherDrawingPanel','sc_other_rm_ds');
//	drawingPanel.refresh();
    ASDM_flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}
/**
 * event handler when click room of the drawing panel 'scOtherDrawingPanel'.
 * 点击cid图纸操作
 * @param {Object} ob
 */
function onDwgPanelClicked(pk, selected, color){
	if(scStuOtherController.verifySelectedOther()){
		addAssignmentRows(pk);
		var drawingPanel = View.panels.get('scOtherDrawingPanel');
//		drawingPanel.setTitle("请选择另一个外来人员");
		View.getControl('', 'scOtherDrawingPanel').processInstruction('scOtherDrawingPanel', 'onclick');
	}else{
		View.showMessage("请选择 外来人员！");
		return;
	}
}
var otherAssigns = [];
/**
 * 选中负责人列时的操作
 * 
 */
function onOtherSelectionChange(a){
    otherAssigns = [];
    var cp = View.panels.get('scOtherDrawingPanel');
    if (cp.isLoadedDrawing) {
        var grid = View.panels.get("scOtherGridPanel");
        var rows = grid.getSelectedRows();
        if (rows.length < 1) {
            cp.clearAssignCache(true);
            cp.processInstruction("ondwgload", "");
            return;
        }
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            cp.processInstruction('scOtherGridPanel', 'onclick');
            var otherAssign = new Ab.data.Record();
            otherAssign.setValue("sc_stu_other_log.other_id", row['sc_stu_other.id']);
            otherAssign.setValue("sc_stu_other_log.identi_code", row['sc_stu_other.identi_code']);
            otherAssign.setValue("sc_stu_other_log.pro_name", row['sc_stu_other.pro_name']);
            otherAssign.setValue("sc_stu_other_log.date_checkin", row['sc_stu_other.date_checkin']);
            otherAssign.setValue("sc_stu_other_log.date_checkout", row['sc_stu_other.date_checkout']);
            otherAssigns.push(otherAssign);
        }
        cp.setToAssign("sc_stu_other_log.other_id", otherAssigns[0].getValue('sc_stu_other_log.other_id'));
    }else{
    	View.showMessage("请选择房间！");
		View.panels.get("scOtherGridPanel").setAllRowsSelected(false);
    }
}
/**
 * add an assignment row.
 * 添加分配负责人
 * @param {Array} restriction
 */
function addAssignmentRows(pk){
    var grid = View.panels.get("scOtherDormAssignPanel");
    for (var i = 0; i < otherAssigns.length; i++) {
        var otherAssign = otherAssigns[i];
        var bFound = false;
        for (var j = 0; j < grid.rows.length && !bFound; j++) {
            var row = grid.rows[j];
            var blId = row["sc_stu_other_log.bl_id"];
            var flId = row["sc_stu_other_log.fl_id"];
            var rmId = row["sc_stu_other_log.rm_id"];
            if (row["sc_stu_other_log.other_id"] == otherAssign.getValue('sc_stu_other_log.other_id')&&blId==pk[0]&&flId==pk[1]&&rmId==pk[2]) {
                grid.removeGridRow(j);
                bFound = true;
            }
        }
        otherAssign.setValue("sc_stu_other_log.bl_id", pk[0]);
        otherAssign.setValue("sc_stu_other_log.fl_id", pk[1]);
        otherAssign.setValue("sc_stu_other_log.rm_id", pk[2]);
        var cap_em=ASDM_getRmCapacity(pk[0],pk[1],pk[2]);
        otherAssign.setValue("sc_stu_other_log.cap_em", cap_em);
        
        grid.addGridRow(otherAssign);
        
    }
    View.panels.get('scOtherDrawingPanel').processInstruction('scOtherDrawingPanel', 'onclick');
    grid.sortEnabled = false;
    grid.update();
}
function removeAssignFromList(){
    var grid = View.panels.get("scOtherDormAssignPanel");
    var row = grid.rows[grid.selectedRowIndex];
    View.panels.get('scOtherDrawingPanel').unassign('sc_stu_other_log.other_id', row['sc_stu_other_log.other_id']);
    grid.removeGridRow(row.row.getIndex());
    grid.update();
}

function removeAllAssign(){
	var grid = View.panels.get("scOtherDormAssignPanel");
	if(grid.rows.length>0){
		var drawingPanel = View.panels.get("scOtherDrawingPanel");
		ASDM_resetAssignment(drawingPanel, grid);
		drawingPanel.processInstruction("ondwgload", '');
	}
}

