var dormConstantControl = View.createController('dormConstantControl', {
	EM_GANGWEI_ID:"辅导员岗",
});
function ASDM_getMaxStuInYear(){
	var restriction="stu_in_year in (select max(stu_in_year) from sc_student)";
  	var parameters = {
 			tableName: 'sc_student',
 			fieldNames: toJSON(['sc_student.stu_in_year']),
 			restriction: toJSON(restriction)
 		};
  	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var value="";
	if (result.data.records.length > 0) {
		var value = result.data.records[0]['sc_student.stu_in_year'];
		return value;
	}else{
		return "2015";
	}
}
/**
 * 获取当前客户端年月日 
 * @returns {String} yyyy-MM-dd
 */
function ASDM_getCurrentDate_Client(currentDate){
    var returnedDate = "";
    var curDate = new Date();
    var temp_month = curDate.getMonth() + 1;
    var month = temp_month < 10 ? "0" + temp_month : temp_month;
    var temp_day = "" + curDate.getDate();
    var day = temp_day < 10 ? "0" + temp_day : temp_day;
    var year = "" + curDate.getFullYear();
    returnedDate = year + "-" + month+"-"+day;
    return returnedDate;
}
/**
 *格式化日期，转化成6位字串，yyyyMM
 *@param {String} dateString --从页面getFieldValue()获取的日期字符串
 */
function ASDM_getYearMonthOfDate(dateString){
    var yearMonth = "";
    if (valueExists(dateString)) {
        var year = dateString.split("-")[0];//获取年
        var month = dateString.split("-")[1];//获取月
        yearMonth = year + month;
    }
    return yearMonth;
}
/**
 * onclick handler for floor level node.
 * 学生宿舍管理 给学院分配宿舍中 不能选择问题 去掉drawingPanel.clearAssignCache(false);
 * 给学生分配宿舍也应用该界面
 * @param {Object} ob
 * @param {Object} drawingPanel
 * @param {Object} grid
 */
function ASDM_flTreeClickHandler(currentNode, drawingPanel, grid){
    var blId = ASDM_getValueFromTreeNode(currentNode, 'bl.bl_id');
    var flId = ASDM_getValueFromTreeNode(currentNode, 'fl.fl_id');
    var dwgName = ASDM_getValueFromTreeNode(currentNode, 'fl.dwgname');
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    if (grid.rows.length > 0) {
        var message = getMessage('confirmMessage');
        View.confirm(message, function(button){
            if (button == 'yes') {
                try {
                    grid.removeRows(0);
                    grid.update();
//                    drawingPanel.clearAssignCache(false);
                    drawingPanel.addDrawing(dcl);
                } 
                catch (e) {
                    View.showMessage('error', '', e.message, e.data);
                    return;
                }
            }
        });
    }
    else {
        drawingPanel.clearAssignCache(true);
        drawingPanel.addDrawing(dcl);
    }
}
/**
 * get value from tree node
 * @param {Object} treeNode
 * @param {String} fieldName
 */
function ASDM_getValueFromTreeNode(treeNode, fieldName){
    var value = null;
    if (treeNode.data[fieldName]) {
        value = treeNode.data[fieldName];
        return value;
    }
    if (treeNode.parent.data[fieldName]) {
        value = treeNode.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.data[fieldName];
        return value;
    }
    if (treeNode.parent.parent.parent.data[fieldName]) {
        value = treeNode.parent.parent.parent.data[fieldName];
        return value;
    }
    return value;
}
/**
 * 给学院分配宿舍 点击cad图纸所做的操作
 * @param pk
 * @param selected
 * @param grid
 * @param field1
 * @param value1
 * @param field2
 * @param value2
 */
function ASDM_drawingRoomClickHandler(pk, selected, grid, field1, value1, field2, value2, field3, value3){
    var rec = new Ab.data.Record();
    var name = pk[0] + "|" + pk[1] + "|" + pk[2];
    	rec.setValue("composite.loc", name);
    	rec.setValue(field1, value1);
    
		rec.setValue('rm.bl_id', pk[0]);
		rec.setValue('rm.fl_id', pk[1]);
        rec.setValue('rm.rm_id', pk[2]);
        
        rec.setValue('rm.dv_id', value2);
        rec.setValue('rm.stu_in_year', value3);
        
        var cap_em=ASDM_getRmCapacity(pk[0],pk[1],pk[2]);
        rec.setValue('rm.cap_em',cap_em);
        
        var feormale=ASDM_getRmFeormale(pk[0],pk[1],pk[2]);
        rec.setValue('rm.feormale',feormale);
        
	
    // Find the existing grid row and remove it, if it exists
    var bFound = false;
    for (var i = 0; i < grid.gridRows.length && !bFound; i++) {
        var row = grid.gridRows.items[i];
        if (row.getFieldValue("composite.loc") == name) {
            grid.removeGridRow(row.getIndex());
            bFound = true;
        }
    }
    if (selected) 
        grid.addGridRow(rec);
    grid.sortEnabled = false;
    grid.update();
}
/**
 * save change from the drawing assignment.
 * 在学生宿舍分配时需要把那些宿舍是那个年纪的写到rm表中
 * @param {Object} drawingPanel
 * @param {Object} grid
 * @param {Object} ds
 * @param {Object} fieldNames
 * @param {boolean} isUpdateCount
 */
function ASDM_saveChange1(drawingPanel, grid, ds, fieldNames, isUpdateCount,stuInYear){
	var updatedRecords = [];
	for (i = 0; i < grid.gridRows.length; i++) {
		var row = grid.gridRows.items[i];
		var fullLoc = row.getFieldValue("composite.loc");
		var ar = fullLoc.split('|');
		
		if (ar.length < 3) 
			continue;
		
		var buildingId = ar[0];
		var floorId = ar[1];
		var roomId = ar[2];
		// First set the new room for the employee
		var rec = new Ab.data.Record();
		rec.isNew = false;
		rec.setValue("rm.bl_id", buildingId);
		rec.setValue("rm.fl_id", floorId);
		rec.setValue("rm.rm_id", roomId);
		
		rec.setValue("rm.stu_in_year", stuInYear);
		
		rec.oldValues = new Object();
		rec.oldValues["rm.bl_id"] = buildingId;
		rec.oldValues["rm.fl_id"] = floorId;
		rec.oldValues["rm.rm_id"] = roomId;
		
		for (var j = 0; j < fieldNames.length; j++) {
			var fieldName = fieldNames[j];
			var val = row.getFieldValue(fieldName);
			if(val==undefined){
				val="";
			}
			var existingVal = ASDM_getDbRoomVal(ds, buildingId, floorId, roomId, fieldName);
			
			rec.setValue(fieldName, val);
			rec.oldValues[fieldName] = existingVal;
		}
		
		ds.saveRecord(rec);
		
		if (isUpdateCount) {
			updatedRecords.push(rec);
		}
	}
	
	if (isUpdateCount) {
//        updateDbCounts(fieldNames, updatedRecords);
	}
	
	ASDM_resetAssignment(drawingPanel, grid);
}
/**
 * save change from the drawing assignment.
 * @param {Object} drawingPanel
 * @param {Object} grid
 * @param {Object} ds
 * @param {Object} fieldNames
 * @param {boolean} isUpdateCount
 */
function ASDM_saveChange(drawingPanel, grid, ds, fieldNames, isUpdateCount){
    var updatedRecords = [];
    for (i = 0; i < grid.gridRows.length; i++) {
        var row = grid.gridRows.items[i];
        var fullLoc = row.getFieldValue("composite.loc");
        var ar = fullLoc.split('|');
        
        if (ar.length < 3) 
            continue;
        
        var buildingId = ar[0];
        var floorId = ar[1];
        var roomId = ar[2];
        // First set the new room for the employee
        var rec = new Ab.data.Record();
        rec.isNew = false;
        rec.setValue("rm.bl_id", buildingId);
        rec.setValue("rm.fl_id", floorId);
        rec.setValue("rm.rm_id", roomId);
        
        rec.oldValues = new Object();
        rec.oldValues["rm.bl_id"] = buildingId;
        rec.oldValues["rm.fl_id"] = floorId;
        rec.oldValues["rm.rm_id"] = roomId;
        
        for (var j = 0; j < fieldNames.length; j++) {
            var fieldName = fieldNames[j];
            var val = row.getFieldValue(fieldName);
            if(val==undefined){
            	val="";
            }
            var existingVal = ASDM_getDbRoomVal(ds, buildingId, floorId, roomId, fieldName);
            
            rec.setValue(fieldName, val);
            rec.oldValues[fieldName] = existingVal;
        }
        
        ds.saveRecord(rec);
        
        if (isUpdateCount) {
            updatedRecords.push(rec);
        }
    }
    
    if (isUpdateCount) {
//        updateDbCounts(fieldNames, updatedRecords);
    }
    
    ASDM_resetAssignment(drawingPanel, grid);
}

/**
 * get room info from database.
 * @param {Object} ds
 * @param {String} buildingId
 * @param {String} floorId
 * @param {String} roomId
 * @param {String} fieldName
 */
function ASDM_getDbRoomVal(ds, buildingId, floorId, roomId, fieldName){
    var val = '';
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        
        var recs = ds.getRecords(restriction);
        if (recs != null) 
            val = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showMessage('error', '', e.message, e.data);
    }
    
    return val;
}
/**
 * 学院宿舍分配 去掉drawingPanel.clearAssignCache(false);
 * 分配报保存完成之后 grid 自动隐藏
 * @param drawingPanel
 * @param grid
 */
function ASDM_resetAssignment(drawingPanel, grid){
	grid.removeRows(0);
//	drawingPanel.clearAssignCache(false);
	drawingPanel.refresh();
	grid.update();
}
/**
 * 获取房间的标准床位数
 * @param blId
 * @param flId
 * @param rmId
 * @returns {String}
 */
function ASDM_getRmCapacity(blId,flId,rmId){
	var parameters = {
 			tableName: 'rm',
 			fieldNames: toJSON(['rm.cap_em',]),
 			restriction: "rm.bl_id ='" + blId + "' and fl_id='"+flId+"' and rm_id='"+rmId+"'"
 		};
		var cap_em="";
 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
 		if (result.data.records.length > 0) {
 			cap_em = result.data.records[0]['rm.cap_em'];
 		}
 		return cap_em;
}
/**
 * 获取房间的男/女字段属性
 * @param blId
 * @param flId
 * @param rmId
 * @returns {String}
 */
function ASDM_getRmFeormale(blId,flId,rmId){
	var parameters = {
			tableName: 'rm',
			fieldNames: toJSON(['rm.feormale',]),
			restriction: "rm.bl_id ='" + blId + "' and fl_id='"+flId+"' and rm_id='"+rmId+"'"
	};
	var feormale="";
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.data.records.length > 0) {
		feormale = result.data.records[0]['rm.feormale'];
	}
	return feormale;
}
function ASDM_kongXian(pk,ds){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("sc_stu_log.bl_id", pk[0], "=");
	restriction.addClause("sc_stu_log.fl_id", pk[1], "=");
	restriction.addClause("sc_stu_log.rm_id", pk[2], "=");
	var record=View.dataSources.get(ds).getRecords(restriction);
	var cap_em=record[0].getValue('rm.cap_em');
	var countEm=record[0].getValue('rm.countEm');
	var kongxian=cap_em-countEm-1;
	return kongxian;
}
function ASDM_GetBlName(blId){
	var parameters = {
			tableName: 'bl',
			fieldNames: toJSON(['bl.name']),
			restriction: "bl.bl_id ='" + blId + "'"
	};

		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var blName=blId;
		if (result.data.records.length > 0) {
			blName = result.data.records[0]['bl.name'];
		}
		return blName;
}
function ASDM_addAssignmentRows(pk,ds,panel,panel2){
    var grid = View.panels.get(panel);
    for (var i = 0; i < emAssigns.length; i++) {
        var emAssign = emAssigns[i];
        var bFound = false;
        for (var j = 0; j < grid.rows.length && !bFound; j++) {
            var row = grid.rows[j];
            if (row["sc_stu_log.stu_no"] == emAssign.getValue('sc_stu_log.stu_no')) {
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
    		controller.abSpAsgnEmToRm_emAssigned.close();
    		return;
    	}
        grid.addGridRow(emAssign);
    }
    View.panels.get(panel2).processInstruction(panel2, 'onclick');
    grid.sortEnabled = false;
    grid.update();
}
function ASDM_setLegendLabel(row, column, cellElement){
    var value = row[column.id];
    if (column.id == 'legend.value' && value != '') {
        var text = '';
        switch (value) {
            case '1':
                text = getMessage('legendLevel1');
                break;
            case '2':
                text = getMessage('legendLevel2');
                break;
            case '3':
                text = getMessage('legendLevel3');
                break;
            case '4':
                text = getMessage('legendLevel4');
                break;
            case '5':
                text = getMessage('legendLevel5');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        contentElement.nodeValue = text;
    }
}
function clearChanges(grid2){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var cp = View.panels.get(grid2);
    grid.removeRows(0);
    grid.update();
}
function ASDM_isSelectedEm(emId){
    var isSelected = false;
    for (var i = 0; i < emAssigns.length; i++) {
        if (emId == emAssigns[i].getValue('em.em_id')) {
            isSelected = true;
            break;
        }
    }
    return isSelected;
}
function ASDM_setRoomEmpCnt(buildingId, floorId, roomId, cnt,ds){
    var rec = new Ab.data.Record();
    var cntOld = ASDM_getRoomCountVal(buildingId, floorId, roomId, 'rm.countEm');
    cnt = cntOld + cnt;
    if (cnt < 0) 
        cnt = 0;
    rec.isNew = false;
    rec.setValue("rm.bl_id", buildingId);
    rec.setValue("rm.fl_id", floorId);
    rec.setValue("rm.rm_id", roomId);
    rec.setValue("rm.count_em", cnt);
    rec.oldValues = new Object();
    rec.oldValues["rm.bl_id"] = buildingId;
    rec.oldValues["rm.fl_id"] = floorId;
    rec.oldValues["rm.rm_id"] = roomId;
    rec.oldValues["rm.count_em"] = cntOld;
    try {
        View.dataSources.get(ds).saveRecord(rec);
    } 
    catch (e) {
        View.showException(e);
    }
}
/**
 * 得到房间的员工数或员工属性.
 */
function ASDM_getRoomCountVal(buildingId, floorId, roomId, fieldName){
    var cnt = 0;
    try {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", buildingId, "=", true);
        restriction.addClause("rm.fl_id", floorId, "=", true);
        restriction.addClause("rm.rm_id", roomId, "=", true);
        var recs = View.dataSources.get("ds_ab-sp-asgn-em-to-rm_rmCnt").getRecords(restriction);
        if (recs != null) 
            cnt = recs[0].getValue(fieldName);
    } 
    catch (e) {
        View.showException(e);
    }
    return parseInt(cnt, 10);
}
function ASDM_checkCount(pk,grid){
    var isFull = false;
    var blId = pk[0];
    var flId = pk[1];
    var rmId = pk[2];
    
    var availableCount = ASDM_getRoomCountVal(blId, flId, rmId, 'rm.cap_em') - ASDM_getRoomCountVal(blId, flId, rmId, 'rm.countEm');
    var newAssignedCount = 0;
    var grid = View.panels.get(grid);
    grid.show(true);
    var rows = grid.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row['em.bl_id'] == blId && row['em.fl_id'] == flId && row['em.rm_id'] == rmId && !ASDM_isSelectedEm(row['em.em_id'])) {
            newAssignedCount++;
        }
    }
    if ((availableCount - newAssignedCount - emAssigns.length) < 0) {
        isFull = true;
    }
    return isFull;
}
function ASDM_setSelectability(restriction,grid,ds){
	var drawingPanel = View.panels.get(grid)
	var rmRecords = View.dataSources.get(ds).getRecords(restriction);
	for (var i = 0; i < rmRecords.length; i++) {
		var record = rmRecords[i];
		var supercat = record.getValue('rmcat.supercat');
		var blId = record.getValue('rm.bl_id');
		var flId = record.getValue('rm.fl_id');
		var rmId = record.getValue('rm.rm_id');
		var opts_selectable = new DwgOpts();
		opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
		if (supercat == 'VERT') {
			drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
		}else{
			drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
		}
	}
}
/**
 * 从axvw中获取值付给字段并set进去滴
 */
function  ASDM_onEmSelectionChange(rowbbb){
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
				emAssign.setValue("sc_stu_log.stu_no", row['sc_student.stu_no']);
				emAssign.setValue("sc_stu_log.stu_name", row['sc_student.stu_name']);
				emAssign.setValue("sc_stu_log.dv_id", row['sc_student.dv_id']);
				emAssign.setValue("sc_stu_log.pro_id", row['sc_student.pro_id']);
				emAssign.setValue("sc_stu_log.stu_in_year", row['sc_student.stu_in_year']);
				emAssign.setValue("sc_stu_log.stu_sex", row['sc_student.stu_sex']);
				emAssign.setValue("sc_stu_log.bl_id_current", row['sc_student.bl_id']);
				emAssign.setValue("sc_stu_log.fl_id_current", row['sc_student.fl_id']);
				emAssign.setValue("sc_stu_log.rm_id_current", row['sc_student.rm_id']);
				emAssigns.push(emAssign);
			}
			cp.setToAssign("sc_stu_log.stu_no", emAssigns[0].getValue('sc_stu_log.stu_no'));
		}
	}else{
		View.showMessage(getMessage('message'));
		View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
	}
}
