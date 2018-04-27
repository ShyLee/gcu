/**
 * 获取登陆人的姓名、电话
 * @param emId
 * @returns {String}
 */
function ASEQ_getEmName(emId) {
	var parameters = {
		tableName : 'em',
		fieldNames : toJSON([ 'em.name','em.phone' ]),
		restriction : "em.em_id ='" + emId + "'"
	};

	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var dataList = [];
	if (result.data.records.length > 0) {
		var emName = result.data.records[0]['em.name'];
		var emPhone = result.data.records[0]['em.phone'];
		dataList.push(emName);
		dataList.push(emPhone);
		return dataList;
	} else {
		return null;
	}
}
/**
 * 获取单位名称
 * @param dvId
 * @returns {String}
 */
function ASEQ_getDvName(dvId) {
	var parameters = {
			tableName : 'dv',
			fieldNames : toJSON([ 'dv.dv_name' ]),
			restriction : "dv.dv_id ='" + dvId + "'"
	};
	
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var dvName = dvId;
	if (result.data.records.length > 0) {
		dvName = result.data.records[0]['dv.dv_name'];
	} 
	return dvName;
}
/**
 * 获取单位名称
 * @param dvId
 * @returns {String}
 */
function ASEQ_getDpName(dpId) {
	var parameters = {
			tableName : 'dp',
			fieldNames : toJSON([ 'dp.dp_name' ]),
			restriction : "dp.dp_id ='" + dpId + "'"
	};
	
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var dpName = dpId;
	if (result.data.records.length > 0) {
		dpName = result.data.records[0]['dp.dp_name'];
	} 
	return dpName;
}
/**
 * 获取当前日期
 * @returns {String}
 */
function ASEQ_getCurrentDate_Client(){
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
 * 获取单位名称
 * @param emId
 * @returns {String}
 */
function ASEQ_getUserDvId(emId) {
	var parameters = {
			tableName : 'afm_users',
			fieldNames : toJSON([ 'afm_users.vpa_option3' ]),
			restriction : "afm_users.user_name ='" + emId + "'"
	};
	
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var dvId = "";
	if (result.data.records.length > 0) {
		var dvId_old = result.data.records[0]['afm_users.vpa_option3'];
		dvId=dvId_old.split(',')[0];
	} 
	return dvId;
}
/**
 * 获取科室名称
 * @param emId
 * @returns {String}
 */
function ASEQ_getUserDpId(emId) {
	var parameters = {
			tableName : 'afm_users',
			fieldNames : toJSON([ 'afm_users.vpa_option1' ]),
			restriction : "afm_users.user_name ='" + emId + "'"
	};
	
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	var dpId = "";
	if (result.data.records.length > 0) {
		dpId = result.data.records[0]['afm_users.vpa_option1'];
	} 
	return dpId;
}