/**
 * @author caodongshuai
 */
var controller = View.createController('controller', {
	stuinYear:"",
	stuNo:"",
	stuName: "",
	blName :"",
	
	ConsoleForm_onShow:function(){
		var stuinYear = this.ConsoleForm.getFieldValue('sc_student.stu_in_year');
		var stuNo = this.ConsoleForm.getFieldValue('sc_student.stu_no');
		var stuName = this.ConsoleForm.getFieldValue('sc_student.stu_name');
		var blName = this.ConsoleForm.getFieldValue('bl.name');
		var restriction = new Ab.view.Restriction();
		if(stuinYear != "")
			restriction.addClause('sc_student.stu_in_year' , stuinYear , '=');	
		if(stuNo != "")
			restriction.addClause('sc_student.stu_no' , stuNo , '=');
		if(stuName != "")
			restriction.addClause('sc_student.stu_name' , stuName , '=');
		if(blName != "")
			restriction.addClause('bl.name' , blName , '=');	
		this.GridForm.refresh(restriction);
	},
	ConsoleForm_onClear:function(){
		var stuinYear=this.ConsoleForm.setFieldValue("sc_student.stu_in_year","");
		var stuNo = this.ConsoleForm.setFieldValue('sc_student.stu_no',"");
		var stuName = this.ConsoleForm.setFieldValue('sc_student.stu_name',"");
		var blName = this.ConsoleForm.setFieldValue('bl.name',"");
    	var res = new Ab.view.Restriction();
    	if(stuName!="" && stuName!=undefined){
    		res.addClause('sc_student.stu_name',stuName, '=');
    	}
    	if(stuinYear!="" && stuinYear!=undefined){
    		res.addClause('sc_student.stu_in_year',stuinYear, '=');
    	}
    	if(stuNo!="" && stuNo!=undefined){
    		res.addClause('sc_student.stu_no',stuNo, '=');
    	}
    	this.ConsoleForm.clear();
    	this.GridForm.refresh(res);
	},
	GridForm_onSubmitChanges:function(){
		var message = getMessage("确定要添加退宿记录吗？");
		var dsEmp = View.dataSources.get("ds_stuAssign");
	    var grid = View.panels.get("GridForm");
		var selects=controller.GridForm.getSelectedRows();
		if(selects.length>0){
			View.confirm(message, function(button){
				if (button == 'yes') {
					for(var i=0;i<selects.length;i++){
						var stuNo=selects[i]["sc_student.stu_no"];
						var buildingId = selects[i]["sc_student.bl_id"];
						var floorId = selects[i]["sc_student.fl_id"];
						var roomId = selects[i]["sc_student.rm_id"];
						var stuName = selects[i]["sc_student.stu_name"];
						var dvId = selects[i]["sc_student.dv_id"];
						var proId = selects[i]["sc_student.pro_id"];
						var stuinYear =selects[i]["sc_student.stu_in_year"];
						var stuSex = selects[i]["sc_student.stu_sex"];
						var capEm = selects[i]["rm.cap_em"];
						var restriction = new Ab.view.Restriction();
						restriction.addClause('sc_student.stu_no' , stuNo , '=');
						var account=controller.ds_asc_bj_dorm_assign2;
						var record=account.getRecord(restriction);
						record.setValue("sc_student.bl_id","");
						record.setValue("sc_student.fl_id","");
						record.setValue("sc_student.rm_id","");
						account.saveRecord(record);
	//-------------log日志添加退房信息-----------
						var checkoutCause="";
						var dateCheckout=ASDM_getCurrentDate_Client();
						var comments="";
						var mark="退宿";
						var checkout_cause="删除";
						var rec = new Ab.data.Record();
						rec.isNew = true;
						rec.setValue("sc_stu_log.stu_no", stuNo);
						rec.setValue("sc_stu_log.bl_id", buildingId);
						rec.setValue("sc_stu_log.fl_id", floorId);
						rec.setValue("sc_stu_log.dv_id", dvId);
						rec.setValue("sc_stu_log.pro_id", proId);
						rec.setValue("sc_stu_log.stu_name", stuName);
						rec.setValue("sc_stu_log.rm_id", roomId);
						rec.setValue("sc_stu_log.stu_in_year", stuinYear);
						rec.setValue("sc_stu_log.stu_sex", stuSex);
						rec.setValue("sc_stu_log.cap_em", capEm);
						rec.setValue("sc_stu_log.checkout_cause",checkoutCause);
						rec.setValue("sc_stu_log.date_checkout",dateCheckout);
						rec.setValue("sc_stu_log.comments",comments);
						rec.setValue("sc_stu_log.mark",mark);
						rec.setValue("sc_stu_log.checkout_cause",checkout_cause);
						rec.oldValues = new Object();
						rec.oldValues["sc_stu_log.stu_no"] = stuNo;
						dsEmp.saveRecord(rec);
					}
					controller.GridForm.refresh();
					controller.onSave(this);
				}
			});
		}else{
			View.showMessage(getMessage('message6'));
		}
	}
});