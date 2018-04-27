
/**
 * get input data record object from the edit form panel
 * @panel
 */
function AUSC_getDataRecord(panel){
    var dataSourceId = panel.dataSourceId;
    var recordValues = AUSC_getDataRecordValues(dataSourceId);
    return recordValues;
}

function AUSC_getDataRecordValues(dataSourceId){

    var dataSource = View.dataSources.get(dataSourceId);
    var formattedValues = {};
    
    for (var i = 0; i < dataSource.fieldDefs.items.length; i++) {
    
        var fieldId = dataSource.fieldDefs.items[i].id;
        if (AUSC_containField(fieldId) == true) {
            formattedValues[fieldId] = AUSC_getFieldValue(fieldId);
        }
    }
    
    return formattedValues;
}

function AUSC_containField(fieldId){
    for (var i = 0; i < View.panels.items.length; i++) {
        var panel = View.panels.items[i];
        
        if (panel.type != 'form') 
            continue;
        
        if (panel.containsField(fieldId)) {
            return true;
        }
    }
    return false;
}

function AUSC_getFieldValue(fieldId){
    var value = '';
    for (var i = 0; i < View.panels.items.length; i++) {
        var panel = View.panels.items[i];
        
        View.log(panel.id, "info");
        if (panel.type != 'form') 
            continue;
        
        if (panel.containsField(fieldId)) {
            // convert to string
            value = panel.getFieldValue(fieldId) + '';
            break;
        }
    }
    return value;
}

function AUSC_getEmployeeDivisionIdByEmId(employeeId){

    if (!valueExists(employeeId)) {
        View.showMessage("登陆账号没有关联对应教职工，请检查！");
        return;
    }
    var parameters = {
        tableName: 'em',
        fieldNames: toJSON(['em.dv_id', 'em.bl_id', 'em.fl_id', 'em.rm_id', 'em.dp_id', 'em.name']),
        restriction: toJSON({
            'em.em_id': employeeId
        })
    };
    
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
        var record = result.data.records[0];
        if (!valueExists(record)) {
            View.showMessage("登陆账号没有关联对应教职工，请检查！");
            return;
        }
        var dvId = record['em.dv_id'];
        var bl_id = record['em.bl_id'];
        var fl_id = record['em.fl_id'];
        var rm_id = record['em.rm_id'];
        
        var dp_id = record['em.dp_id'];
        employee = new Object();
        employee.organization = new Object();
        employee.space = new Object();
        employee.organization.divisionId = dvId;
        employee.organization.departmentId = dp_id;
        employee.space.buildingId = bl_id;
        employee.space.floorId = fl_id;
        employee.space.roomId = rm_id;
        employee.id = employeeId;
        employee.name = record['em.name'];
        
        var buId = AUSC_getBuIdByDvId(dvId);
        employee.organization.dvType = buId;
        
        return employee;
        
    }
    else {
        Ab.workflow.Workflow.handleError(result);
        return null;
    }
    
}

/**
 *AUSC_getEmployeeDivisionIdByEmail
 *
 */
function AUSC_getEmployeeDivisionIdByEmail(email){

    if (!valueExists(email)) {
        View.showMessage("登陆账号没有关联对应教职工，请检查！");
        return;
    }
	
    /*var parameters = {
        tableName: 'em',
        fieldNames: toJSON(['em.em_id', 'em.dv_id', 'em.bl_id', 'em.fl_id', 'em.rm_id', 'em.dp_id', 'em.name']),
        restriction: toJSON({
            'em.email': email
        })
    };*/
     var parameters = {
        tableName: 'em',
        fieldNames: toJSON(['em.em_id', 'em.dv_id', 'em.bl_id', 'em.fl_id', 'em.rm_id', 'em.dp_id', 'em.name']),
        restriction: "em.email = '"+email+"'"
    };
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
        var record = result.data.records[0];
        if (!valueExists(record)) {
            View.showMessage("登陆账号没有关联对应教职工，请检查！");
            return;
        }
        var dvId = record['em.dv_id'];
        var bl_id = record['em.bl_id'];
        var fl_id = record['em.fl_id'];
        var rm_id = record['em.rm_id'];
        var em_id = record['em.em_id']
        
        var dp_id = record['em.dp_id'];
        employee = new Object();
        employee.organization = new Object();
        employee.space = new Object();
        employee.organization.divisionId = dvId;
        employee.organization.departmentId = dp_id;
        employee.space.buildingId = bl_id;
        employee.space.floorId = fl_id;
        employee.space.roomId = rm_id;
        employee.id = em_id;
        employee.name = record['em.name'];
        
        var buId = AUSC_getBuIdByDvId(dvId);
        employee.organization.dvType = buId;
        
        return employee;
        
    }
    else {
        Ab.workflow.Workflow.handleError(result);
        return null;
    }
    
}


/**
 *
 * @param {Object} dvId
 */
function AUSC_getBuIdByDvId(dvId){
    var parameters = {
        tableName: 'dv',
        fieldNames: toJSON(['dv.bu_id', 'dv.dv_id']),
        restriction: toJSON("dv.dv_id='" + dvId + "'")
    };
    
    var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
        var record = result.data.records[0];
        if (!valueExists(record)) {
            View.showMessage("登陆账号没有关联的教职工没有部门，请检查！");
            return null;
        }
        var dvId = record['dv.dv_id'];
        var buId = record['dv.bu_id'];
        
        return buId;
        
    }
    else {
        Workflow.handleError(result);
        return null;
    }
}

/**
 * Refresh panel by the restriction that from parent ,field2 by field1
 * @param {Object} panel1 parent grid
 * @param {Object} panel2 son grid will be refresh
 * @param {Object} field1  parent panel row field value
 * @param {Object} field2  will be restriction field
 */
function showInformationBySelectedRow(panel1, panel2, field1, field2){
    var grid = View.panels.get(panel1);
    var grid2 = View.panels.get(panel2);
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var fieldValue = selectedRow[field1];
    var restriction = new Ab.view.Restriction();
    if (fieldValue) {
        restriction.addClause(field2, fieldValue, '=');
    }
    grid2.refresh(restriction);
}

/**
 *
 */
function AUSC_commonDelete(dataSourceID, formPanelID, primaryFieldFullName, panelTree, parentNode){

    var dataSource = View.dataSources.get(dataSourceID);
    var formPanel = View.panels.get(formPanelID);
    var record = formPanel.getRecord();
    var primaryFieldValue = record.getValue(primaryFieldFullName);
    if (!primaryFieldValue) {
        return;
    }
    var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
    View.confirm(confirmMessage, function(button){
        if (button == 'yes') {
            try {
                dataSource.deleteRecord(record);
            } 
            catch (e) {
                var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                View.showMessage('error', errMessage, e.message, e.data);
                return;
            }
            commonRefresh(formPanel, panelTree, parentNode);
            formPanel.show(false);
        }
    })
}

/**
 * @param {Object} formPanel
 * @param {Object} refreshTree
 * @param {Object} parentNode
 */
function commonRefresh(formPanel, refreshTree, parentNode){
    if (parentNode) {
        if (parentNode.isRoot()) {
            View.panels.get(refreshTree).refresh();
            parentNode.expand();
        }
        else {
            View.panels.get(refreshTree).refreshNode(parentNode);
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            parentNode.expand();
        }
    }
    else {
        View.panels.get(refreshTree).refresh();
    }
}

/**
 * @param {Object} tree
 * @param {Object} message
 * @param {Object} operDataType
 * @param {Object} controller
 */
function getParentNode(tree, message, operDataType, controller){
    var rootNode = View.panels.get(tree).treeView.getRoot();
    var levelIndex = -1;
    if (controller.curTreeNode) {
        levelIndex = controller.curTreeNode.level.levelIndex;
    }
    if ("POST" == operDataType) {
        return rootNode;
    }
    else 
        if ("POSTLEVEL" == operDataType) {
            switch (levelIndex) {
                case 0:
                    return controller.curTreeNode;
                    break;
                case 1:
                    return controller.curTreeNode.parent;
                    break;
                case 2:
                    return controller.curTreeNode.parent.parent;
                    break;
                case 3:
                    return controller.curTreeNode.parent.parent.parent;
                    break;
                default:
                    return controller.rootNode;
                    break;
            }
        }
        else 
            if ("POSTION" == operDataType) {
                switch (levelIndex) {
                    case 1:
                        return controller.curTreeNode;
                        break;
                    case 2:
                        return controller.curTreeNode.parent;
                        break;
                    case 3:
                        return controller.curTreeNode.parent.parent;
                        break;
                    default:
                        View.showMessage(message);
                        break;
                }
            }
            else {
                switch (levelIndex) {
                    case 2:
                        return controller.curTreeNode;
                        break;
                    case 3:
                        return controller.curTreeNode.parent;
                        break;
                    default:
                        View.showMessage(message);
                        break;
                }
            }
    
}

/**
 * @param {Object} panel
 * @param {Object} status
 * @param {Object} field
 */
function translateFieldValue(panel, status, field){

    for (var i = 0; i < panel.gridRows.length; i++) {
        var row = panel.gridRows.get(i);
        setStyle(row.cells.items[row.cells.indexOfKey(field)], row.getFieldValue(status));
    }
}

function setStyle(cell, value){
    switch (value) {
        case '正常':{
            cell.dom.bgColor = '#228B22';
            break;
        }
        case '完成未退房':{
            cell.dom.bgColor = '#FF1493';
            break;
        }
    }
}

function updateStaticFieldAboutEmOrRm(){
    var result;
    try {
        result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateArea');
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    if (result.code == 'executed') {
        View.showMessage(getMessage("okMessage"));
    }
    else {
        Workflow.handleError(result);
    }
}

function commonSetTitle(panel1, panel2, selectId, message){
    var selectedRow = View.panels.get(panel1).rows[View.panels.get(panel1).selectedRowIndex];
    var Id = selectedRow[selectId];
    View.panels.get(panel2).setTitle(getMessage(message) + Id);
}

function addPercentageTag(panel, fieldName, columnIndex){
    for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var fieldValue = row[fieldName];
        
        if (parseFloat(fieldValue)) {
            fieldValue = fieldValue * 100;
            var rowEl = Ext.get(row.row.dom).dom;
            rowEl.cells[columnIndex].innerHTML = fieldValue.toFixed(2) + '%';
        }
    }
}

/**
 * Enable given field in the step dialog
 * @param {String} field field name
 */
function enableField(field){
    if ($(field)) {
        $(field).style.readOnly = false;
        $(field).disabled = false;
    }
}


/**
 * Enable given field in the step dialog
 * @param {String} field field name
 */
function disEnableField(field){
    if ($(field)) {
        $(field).style.readOnly = true;
        $(field).disabled = true;
    }
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}

/**
 * keven added for set count field value
 * @param {Object} panel
 */
function AUSC_countEmpAndStudent(panel){
    var empCount = 0;
    var studentCount = 0;
    var needUpdateCountEm = true;
    var needUpdateCountStudent = true;
    if (panel) {
        var count_teacher = panel.getFieldValue('dv.count_teacher');
        if (!isNaN(parseInt(count_teacher))) {
            empCount += parseInt(count_teacher)
        }
        else {
            needUpdateCountEm = false;
        }
        var count_gongren = panel.getFieldValue('dv.count_gongren');
        if (!isNaN(parseInt(count_gongren))) {
            empCount += parseInt(count_gongren)
        }
        var count_ganbu = panel.getFieldValue('dv.count_ganbu');
        if (!isNaN(parseInt(count_ganbu))) {
            empCount += parseInt(count_ganbu)
        }
        var count_waipin = panel.getFieldValue('dv.count_waipin');
        if (!isNaN(parseInt(count_waipin))) {
            empCount += parseInt(count_waipin)
        }
        /////////////////////////////////////////////
        var count_benk = panel.getFieldValue('dv.count_benk');
        if (!isNaN(parseInt(count_benk))) {
            studentCount += parseInt(count_benk)
        }
        else {
            needUpdateCountStudent = false;
        }
        var count_shuos = panel.getFieldValue('dv.count_shuos');
        if (!isNaN(parseInt(count_shuos))) {
            studentCount += parseInt(count_shuos)
        }
        var count_bos = panel.getFieldValue('dv.count_bos');
        if (!isNaN(parseInt(count_bos))) {
            studentCount += parseInt(count_bos)
        }
        var count_liuxues = panel.getFieldValue('dv.count_liuxues');
        if (!isNaN(parseInt(count_liuxues))) {
            studentCount += parseInt(count_liuxues)
        }
    }
    if (needUpdateCountEm) {
        panel.setFieldValue("dv.count_em", empCount);
    }
    if (needUpdateCountStudent) {
        panel.setFieldValue("dv.count_student", studentCount);
    }
    
}

/**
 * check the groups if includes the specialGroup
 * @param {Object} user -- user
 * @param {Object} group -- 'UNIV SPACE ASSISTANT'
 * @return true or false
 */
function AUSC_isMemberOfGroup(user, group){
    var result = false;
    if (group === '') {
        result = true;
    }
    else 
        for (var i = 0; i < user.groups.length; i++) {
            if (user.groups[i] === group) {
                result = true;
                break;
            }
        }
    return result;
}
