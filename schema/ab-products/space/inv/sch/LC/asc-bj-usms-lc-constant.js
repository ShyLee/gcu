var ascBjUsmsConstantControl = View.createController('ascBjUsmsConstantControl', {
	
//	asc-bj-usms-lc-constant.js
//	ascBjUsmsConstantControl.PB_EQ_REQUEST 设备管理
//	ascBjUsmsConstantControl.TYPE_EQ_ADD SD -设备报增
	/**校区名称代号**/
	CZ_SITE_ID: "030",//---常州校区名称代号---
	
	/**问题类型**/
	PB_ROOM_REQUEST: "公房申请",
	
	PB_EQ_REQUEST: "设备管理",
	
	/**问题类型**/
	TYPE_ROOM_REQUEST_RM: "SD -新增公房申请",
	TYPE_ROOM_REQUEST_DV: "SD -单位内部申请",
	TYPE_ROOM_REQUEST_CZRM: "SD -新增公房申请（常州）",
	TYPE_GYF_ROOM_REQUEST_RM: "SD -公寓房申请",
	TYPE_GYF_ROOM_REQUEST_CZRM: "SD -公寓房申请（常州）",
	
	TYPE_EQ_ADD:"SD -设备报增",

	
	/**流程步骤**/
	STEP_ROOM_REQUEST_DV_HEAD:"院领导审批",
	STEP_ROOM_REQUEST_ZCC_MANAGE:"资产处领导审批",
	STEP_ROOM_REQUEST_ZCC_ADMIN:"资产处管理员审批",
	STEP_ROOM_REQUEST_CZ_ZCC_MANAGE:"常州校区领导审批",
	STEP_ROOM_REQUEST_CZ_ZCC_ADMIN:"常州资产管理员审批",

	/**流程角色**/
	ROLE_DV_HEAD: "院级领导",
	ROLE_ZCC_ADMIN: "资产处管理员",
	ROLE_ZZC_MANAGE: "资产处处长",
	ROLE_CZ_ZCC_ADMIN: "常州校区资产管理员",
	ROLE_CZ_ZZC_MANAGE: "常州校区领导",
	
	
	AUSC_DvIsJXKY: function(buId){
        var parameters = {
            tableName: 'bu',
            fieldNames: toJSON(['bu.bu_class']),
            restriction: "bu.bu_id ='" + buId + "'"
        };
        
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var bu_class = result.data.records[0]['bu.bu_class.raw'];
            if ((bu_class == this.BU_CLASS_JXKY)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
});
/**
 * 获取登陆人的姓名
 * @param emId
 * @returns
 */
function ASC_GetEmName(emId){
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
 * 获取登录人的Id
 * @param emId
 * @returns
 */


function ASC_GetSiteId(emId){
	var parameters = {
 			tableName: 'dv',
 			fieldNames: toJSON(['dv.site_id']),
 			restriction: "dv.dv_id=(select em.dv_id from em where em.em_id='"+emId+"') "
 		};
		var siteId="";
 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
 		if (result.data.records.length > 0) {
 			siteId = result.data.records[0]['dv.site_id'];
 		}
 		return siteId;
}


function ASC_GetDvName(dvId){
	var parameters = {
			tableName: 'dv',
			fieldNames: toJSON(['dv.dv_name']),
			restriction: "dv.dv_id ='" + dvId + "'"
	};

		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var dvName=dvId;
		if (result.data.records.length > 0) {
			dvName = result.data.records[0]['dv.dv_name'];
		}
		return dvName;
}