/**
 * @author kevenxi
 */
/*************************常量定义*****************************/
var ascBjUsmsConstantControl = View.createController('ascBjUsmsConstantControl', {

    /**单位类型**/
    
    BU_CLASS_JXKY: "JXKY",//教学科研类
    BU_CLASS_DZGL: "DZGL",//党政管理类
    BU_CLASS_GGZY: "GGZY",//公共资源类
    BU_CLASS_QT: "QT",//其他类
    
    //公房
	STEP_RM_REQUEST_CS: "使用单位领导确认",
	STEP_RM_REQUEST_FS: "公房管理人员初审",
	STEP_RM_REQUEST_ZS: "房管处领导终审",
	STEP_RM_REQUEST_JWFS:"教务处领导复审",
	STEP_RM_REQUEST_SZS:"主管校领导审批",

   /**房屋类型**/
    RM_TYPE_NO_SAL: "未售住房",
    RM_TYPE_SAL: "已售住房",
    RM_CAT_JGZZ: "教工住宅",
	
	/**流程类型**/
	LX_REPAIR_RM_MIANTAIN: "SD -住房修缮",
	LX_REPAIR_RM_MAINT_JS: "SD -修缮结算",
	
	
	LX_LEASE_RM_CHECK_IN: "SD -房屋租赁",
	LX_LEASE_RM_CHECK_OUT:"SD -租赁退房",
	
	/**申请类型**/
	PB_REPAIR_RM_MAINT_JS: "修缮结算",
	
	PB_LEASE_RM_CHECN_IN: "房屋租赁",
	PB_LEASE_RM_CHECN_OUT: "租赁退房",
	
	/**流程步骤**/
	STEP_REPAIR_BASIC: "基础",

    
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
		}else{
			return false;
		}
	}
    
})
