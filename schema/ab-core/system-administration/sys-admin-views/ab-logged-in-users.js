var loggedInUsersController = View.createController('loggedInUsers', {

    afterInitialDataFetch : function() {
		this.loggedInUsersGrid_onRefresh();
		this.loggedInUsersGrid.removeSorting();
    },  

    loggedInUsersGrid_onRefresh : function() {
        var controller = this;
        AdminService.getAllUserSessions({
            callback: function(result) {
        		controller.displayUsers(result);
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    },
    
    displayUsers : function(result) {
		for (var i = 0; i < result.length; i++) {
			this.displayUser(result[i]);
		}
    	this.loggedInUsersGrid.update();
        this.loggedInUsersGrid.appendTitle(this.loggedInUsersGrid.gridRows.length);
    },
    
    displayUser : function(user) {
    	var user_name = user.name;
    	var role_name = user.role;
    	var roleName=getEmRoleName(role_name);
    	
    	
    	var email = user.email;
    	var blId=user.employee.space.buildingId ;
    	var blName=getBlName(blId);
    	var location = blName + '-' + user.employee.space.roomId + '-' + user.employee.space.floorId;
    	
    	var division = user.employee.organization.divisionId;
    	var dvName=getDvName(division);
    	
    	var department = user.employee.organization.departmentId;
    	var dpName=getDpName(department);
    	
    	var employee_number = user.employee.id;
    	var emName=getEmName(employee_number);
    	
    	
    	var record = new Ab.data.Record({
    	    'afm_users.user_name': user_name,
    	    'afm_users.role_name': roleName,
    	    'afm_users.email': email,
    	    'afm_users.location': location,
    	    'afm_users.division': dvName,
    	    'afm_users.department': dpName,
    	    'afm_users.employee_number': emName});
    	this.loggedInUsersGrid.addGridRow(record);
    }
});
/**
 * 获取登录人姓名
 * @param emId
 * @returns {String}
 */
function getEmName(emId){
	var parameters = {
 			tableName: 'em',
 			fieldNames: toJSON(['em.name']),
 			restriction: "em.em_id ='" + emId + "'"
 		};
		var emName=emId;
 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
 		if (result.data.records.length > 0) {
 			emName = result.data.records[0]['em.name'];
 		}
 		return emName;
}
/**
 * 获取角色名称
 * @param roleName
 * @returns {String}
 */
function getEmRoleName(roleName){
	var parameters = {
			tableName: 'afm_roles',
			fieldNames: toJSON(['afm_roles.role_title']),
			restriction: "afm_roles.role_name ='" + roleName + "'"
	};
	var emRoleName=roleName;
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.data.records.length > 0) {
		emRoleName = result.data.records[0]['afm_roles.role_title'];
	}
	return emRoleName;
}
/**
 * 获取登录人单位
 * @param emId
 * @returns {String}
 */
function getDvName(dvId){
	var parameters = {
			tableName: 'dv',
			fieldNames: toJSON(['dv.dv_name']),
			restriction: "dv.dv_id ='" + dvId + "'"
	};
	var dvName=dvId;
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.data.records.length > 0) {
		dvName = result.data.records[0]['dv.dv_name'];
	}
	return dvName;
}
/**
 * 获取登录人部门科室
 * @param emId
 * @returns {String}
 */
function getDpName(dpId){
	var parameters = {
			tableName: 'dp',
			fieldNames: toJSON(['dp.dp_name']),
			restriction: "dp.dp_id ='" + dpId + "'"
	};
	var dpName=dpId;
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.data.records.length > 0) {
		dpName = result.data.records[0]['dp.dp_name'];
	}
	return dpName;
}
/**
 * 获取建筑物名称
 * @param blId
 * @returns {String}
 */
function getBlName(blId){
	var parameters = {
			tableName: 'bl',
			fieldNames: toJSON(['bl.name']),
			restriction: "bl.bl_id ='" + blId + "'"
	};
	var blName=blId;
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if (result.data.records.length > 0) {
		blName = result.data.records[0]['bl.name'];
	}
	return blName;
}