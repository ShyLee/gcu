
function USMS_getEmInfo(emId){
    var record = {};
    record.name = '';
    record.zhiwu = '';
    record.zhicheng = '';
    
    var parameters = {
        tableName: "em",
        fieldNames: toJSON(['em.name', 'em.zhiw_id', 'em.zhic_id'])
    };
    parameters.restriction = "em.em_id='" + emId + "'";
    
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            record.name = result.data.records[0]['em.name'];
            record.zhiwu = result.data.records[0]['em.zhiw_id'];
            record.zhicheng = result.data.records[0]['em.zhic_id'];
        }
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    return record;
}

function USMS_getProjectInfo(projectId){
    var record = {};
    record.projectXingzhi = '';
    record.projectLeader = '';
    
    var parameters = {
        tableName: "sc_project",
        fieldNames: toJSON(['sc_project.projectxz_id', 'sc_project.project_manager'])
    };
    parameters.restriction = "sc_project.project_id='" + projectId + "'";
    
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            record.projectXingzhi = result.data.records[0]['sc_project.projectxz_id'];
            record.projectLeader = result.data.records[0]['sc_project.project_manager'];
        }
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    return record;
}


function USMS_addUpdateLog(log){
    Workflow.callMethod('AbSpaceRoomInventoryBAR-LCHandler-addUpdateLog', log);
}

function USMS_getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

/**
 *
 * @param {Object} panel
 * @param {Object} showProject -- boolean
 */
function USMS_showBaseInfoOfUserOrProject(panel, showProject){
	var mainTableName = panel.getDataSource().mainTableName;
	
    var rmUser = panel.getFieldValue(mainTableName+'.rm_user');
    var emObject = USMS_getEmInfo(rmUser);
    var rmUser_name = emObject.name;
    var zhiwu = emObject.zhiwu;
    var zhicheng = emObject.zhicheng;
    panel.setFieldValue(mainTableName+'.rmUser_name', rmUser_name);
    panel.setFieldValue(mainTableName+'.zhiwu', zhiwu);
    panel.setFieldValue(mainTableName+'.zhicheng', zhicheng);
    
    var requestor = panel.getFieldValue(mainTableName+'.requestor');
    emObject = USMS_getEmInfo(requestor);
    panel.setFieldValue(mainTableName+'.requestor_name', emObject.name);
	
	if (showProject){
		var projectGroup = panel.getFieldValue(mainTableName+".project_gp_id");
        var projectObject = USMS_getProjectInfo(projectGroup);
        var projectXingzhi = projectObject.projectXingzhi;
        var projectLeader = projectObject.projectLeader;
        panel.setFieldValue(mainTableName+'.projectxz_id', projectXingzhi);
        panel.setFieldValue(mainTableName+'.project_manager', projectLeader);
	}
}
