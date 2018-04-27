/**
 * @author caodongshuai
 */
var controller = View.createController('controller', {
	afterViewLoad: function(){
		this.GridForm.addParameter('gangWei', dormConstantControl.EM_GANGWEI_ID);
	},
	ConsoleForm_onShow:function(){
		var emId = this.ConsoleForm.getFieldValue('em.em_id');
		var emName = this.ConsoleForm.getFieldValue('em.name');
		var blName = this.ConsoleForm.getFieldValue('em.bl_name');
		var restriction = new Ab.view.Restriction();
		if(emId != "")
			restriction.addClause('em.em_id' , emId , '=');
		if(emName != "")
			restriction.addClause('em.name' , emName , '=');
		if(blName != "")
			restriction.addClause('em.bl_name' , blName , '=');	
		this.GridForm.refresh(restriction);
	},
	ConsoleForm_onClear:function(){
//		var emId = this.ConsoleForm.setFieldValue('em.em_id',"");
//		var emName = this.ConsoleForm.setFieldValue('em.name',"");
//		var blId = this.ConsoleForm.setFieldValue('em.bl_id',"");
    	var res = new Ab.view.Restriction();
//    	if(emName!="" && emName!=undefined){
//    		res.addClause('em.name',emName, '=');
//    	}
//    	if(emId!="" && emId!=undefined){
//    		res.addClause('em.em_id',emId, '=');
//    	}
//		if(blId != ""  && emId!=undefined)
//			res.addClause('em.bl_id' , blId , '=');	
    	this.ConsoleForm.clear();
    	this.GridForm.refresh(res);
	},
	GridForm_onSubmitChanges:function(){
		var message = getMessage("确定要添加退宿记录吗？");
		var dsEmp = View.dataSources.get("ds_stuAssign");
		var selects=controller.GridForm.getSelectedRows();
		if(selects.length>0){
		View.confirm(message, function(button){
		if (button == 'yes') {
		for(var i=0;i<selects.length;i++){
			var emId=selects[i]["sc_em.em_id"];
	        var buildingId = selects[i]["sc_em.bl_id"];
	        var floorId = selects[i]["sc_em.fl_id"];
	        var roomId = selects[i]["sc_em.rm_id"];
	        var emName = selects[i]["sc_em.name"];
	        var dvId = selects[i]["sc_em.dv_id"];
	        var emSex = selects[i]["sc_em.sex"];
	        var capEm = selects[i]["sc_em.cap_em"];
			var restriction = new Ab.view.Restriction();
			var account=controller.ds_asc_bj_dorm_assign4;
			restriction.addClause('sc_em.em_id' , emId , '=');
			var record=account.getRecord(restriction);
			account.deleteRecord(record);
			
//			var account=controller.ds_asc_bj_dorm_assign2;
//			var record=account.getRecord(restriction);
//			record.setValue("em.bl_id","");
//			record.setValue("em.fl_id","");
//			record.setValue("em.rm_id","");
//			account.saveRecord(record);
	//-------------log日志添加退房信息-----------
	    	var checkoutCause="";
	    	var dateCheckout=ASDM_getCurrentDate_Client();
	    	var comments="";
	    	var mark="退宿";
			var checkout_cause="删除";
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
	        rec.setValue("sc_stu_log.checkout_cause",checkoutCause);
	        rec.setValue("sc_stu_log.date_checkout",dateCheckout);
	        rec.setValue("sc_stu_log.comments",comments);
	        rec.setValue("sc_stu_log.mark",mark);
			rec.setValue("sc_stu_log.checkout_cause",checkout_cause);
	        rec.oldValues = new Object();
	        rec.oldValues["sc_stu_log.em_id"] = emId;
	        dsEmp.saveRecord(rec);
					}
					controller.GridForm.refresh();
					controller.onSave(this);
				}
			});
		}else{
			View.showMessage(getMessage('message6'));
		}
	},
	ConsoleForm_onSelectEm:function(){
        var restriction = "sc_em.gangweijibie_id='辅导员'";
        View.selectValue({
            formId: 'ConsoleForm',
            selectTableName: 'sc_em',
            title: "辅导员",
            fieldNames: ['sc_m.em_id', 'sc_em.name'],
            selectFieldNames: ['sc_em.em_id', 'sc_em.name'],
            visibleFieldNames: ['sc_em.em_id', 'sc_em.name','sc_em.sex'],
            sortFieldNames: ['sc_em.em_id'],
            restriction: restriction,
            selectValueType: 'grid'
        });
	},
	ConsoleForm_onSelectEmName:function(){
		this.ConsoleForm_onSelectEm();
	}
});