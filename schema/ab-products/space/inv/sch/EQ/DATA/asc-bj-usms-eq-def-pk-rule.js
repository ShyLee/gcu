var controller=View.createController('pkRuleForm',{
	afterInitialDataFetch: function(){
		this.formPanel.getFieldElement('pk_rule.table_name').disabled = true;
		this.formPanel.getFieldElement('pk_rule.field_name').disabled = true;
    },
	formPanel_afterRefresh: function(){
		this.formPanel.showField("pk_rule.pk_char",true);
		this.formPanel.showField("pk_rule.pk_num",true);
		//this.formPanel.showField("pk_rule.pk_date_char",true);
		if(!this.formPanel.newRecord){
			var value=this.formPanel.getFieldValue("pk_rule.pk_rule");
			//主表主键+4位尾数
			if(value=="2"){
				this.formPanel.showField("pk_rule.pk_char",false);
			}
			//报增单号+尾数
			if(value=="3"){
				this.formPanel.showField("pk_rule.pk_char",false);
				this.formPanel.showField("pk_rule.pk_num",false);
				//this.formPanel.showField("pk_rule.pk_date_char",false);
			}
		}
	},
	/**
	 * 执行自动生成主键值的操作
	 */
	formPanel_onBtnCreatePriaryKey: function(){
		var record=this.formPanel.getOutboundRecord();
		//
		var tableName=record.getValue('pk_rule.table_name');
		var fieldName=record.getValue('pk_rule.field_name');
		var pkChar=record.getValue('pk_rule.pk_char');
		var pkNum=record.getValue('pk_rule.pk_num');
		//var pkDataChar=record.getValue('pk_rule.pk_date_char');
		if(checkIsNull(tableName)||checkIsNull(fieldName)||checkIsNull(pkNum)){
			View.alert("除'备注'之外的所有项都不可为空！！");
			return;
		}
		try{
			var result=Workflow.callMethod('AbAssetManagement-EquipmentHandler-getPrimaryKey',record,"");
		}catch(e){
			Workflow.handleError(e); 
		}
		if(result.code='executed'){
			View.alert(result.message);
		}else{
			View.alert("对不起，工作流执行失败!");
		}
	},
	/**
	 * 筛选操作
	 */
	consolePanel_onBtnShowFilter: function(){
		var res=new Ab.view.Restriction();
		var tableName=this.consolePanel.getFieldValue('pk_rule.table_name');
		var fieldName=this.consolePanel.getFieldValue('pk_rule.field_name');
		if(valueExistsNotEmpty(tableName)){
			res.addClause('pk_rule.table_name','%'+tableName+'%','LIKE');
		}
		if(valueExistsNotEmpty(fieldName)){
			res.addClause('pk_rule.field_name','%'+fieldName+'%');
		}
		this.gridPanel.refresh(res);
	},
	/**
	 * 清除操作
	 */
	consolePanel_onBtnClearConsole: function(){
		this.consolePanel.clear();
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
	gridPanel_onBtnRresh: function(){
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	}
	
});

function checkIsNull(param){
	var isEmptyOrNull=true;
	if(!valueExistsNotEmpty(param)){
		isEmptyOrNull=true;
	}else{
		isEmptyOrNull=false;
	}
	return isEmptyOrNull;
}
/**
 * 选出数据库表afm_flds_lang中关于此字段的中文翻译
 * 如果此字段中没有此记录，则查询afm_flds中的
 */
function selectFieldChineseName(fieldName,selectedValue,previousValue){
	//根据表单中的表名和字段名查找afm_flds_lang中的翻译
	var fieldChineseName="";
	if(fieldName=="pk_rule.field_name"){
		var formPanel=View.panels.get("formPanel");
		var tableName=formPanel.getFieldValue("pk_rule.table_name");
		var fieldName=selectedValue;
		var fieldDataSource=this.View.dataSources.get('DsTranslateFieldsLang');
		var res=new Ab.view.Restriction();
		res.addClause("afm_flds_lang.table_name",tableName,"=");
		res.addClause("afm_flds_lang.field_name",fieldName,"=");
		var record=fieldDataSource.getRecord(res);
		var nullValue=record.getValue("afm_flds_lang.ml_heading_ch");
		if(nullValue!=""&&nullValue!=null){
			fieldChineseName=nullValue;
		}
		else{
			var afmFldsDataSource=this.View.dataSources.get("DsTranslateField");
			var restriction=new Ab.view.Restriction();
			restriction.addClause("afm_flds.table_name",tableName,"=");
			restriction.addClause("afm_flds.field_name",fieldName,"=");
			var recordFlds=afmFldsDataSource.getRecord(restriction);
			nullValue=recordFlds.getValue("afm_flds.ml_heading");
			if(nullValue!=""&&nullValue!=null){
				fieldChineseName=nullValue;
			}else{
				fieldChineseName=fieldName;
			}
		}
		formPanel.setFieldValue("pk_rule.flds_title_ch",fieldChineseName);	
	}
}

/**
 * 选出数据库表afm_tbls中关于此字段的中文翻译
 * 如果此字段中没有此记录，则填入字段英文名称
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function selectTableChineseName(fieldName,selectedValue,previousValue){
	
	if(fieldName=="pk_rule.table_name"){
		var chineseName="";//表名对应的中文名称
		var tableName="";//表名
		var formPanel=View.panels.get("formPanel");
		tableName=selectedValue;
		var tableDataSource=this.View.dataSources.get("DsTranslateTableName");
		var res =new Ab.view.Restriction();
		res.addClause("afm_tbls.table_name",tableName,"=");
		var record=tableDataSource.getRecord(res);
		var nullValue=record.getValue("afm_tbls.title_ch");
		if(nullValue!=""&& nullValue!=null){
			chineseName=record.getValue("afm_tbls.title_ch");
		}
		else{
			chineseName=tableName;
		}
		formPanel.setFieldValue("pk_rule.tbls_title_ch",chineseName);
	}
}

function hideField(value){
	var formPanel=View.panels.get("formPanel");
	formPanel.showField("pk_rule.pk_char",true);
	formPanel.showField("pk_rule.pk_num",true);
	//formPanel.showField("pk_rule.pk_date_char",true);
	//主键字符串+年份+4位尾数
	if(value=="0"){
		formPanel.setFieldValue("pk_rule.pk_num",4);
	}
	//主键字符串+日期+4位尾数
	if(value=="1"){
		formPanel.setFieldValue("pk_rule.pk_num",4);
	}
	//主表主键+4位尾数
	if(value=="2"){
		formPanel.showField("pk_rule.pk_char",false);
		formPanel.setFieldValue("pk_rule.pk_num",4);
	}
	//报增单号+尾数
	if(value=="3"){
		formPanel.showField("pk_rule.pk_char",false);
		formPanel.showField("pk_rule.pk_num",false);
		//formPanel.showField("pk_rule.pk_date_char",false);
	}
	if(value="4"){
		formPanel.showField("pk_rule.pk_char",false);
		formPanel.setFieldValue("pk_rule.pk_num",4);
	}
}
