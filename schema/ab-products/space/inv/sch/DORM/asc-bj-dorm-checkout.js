var controller = View.createController('abSelectScControllers1', {
	stuinYear:"",
	stuNo:"",
	stuName: "",
	blName :"",
	
	ConsoleForm_onShow:function(){
		var stuinYear = this.ConsoleForm.getFieldValue('sc_student.stu_in_year');
		var stuNo = this.ConsoleForm.getFieldValue('sc_student.stu_no');
		var stuName = this.ConsoleForm.getFieldValue('sc_student.stu_name');
		var blName = this.ConsoleForm.getFieldValue('bl.name');
		var dvname = this.ConsoleForm.getFieldValue('dv.dv_name');
		var restriction = new Ab.view.Restriction();
		if(stuinYear != "")
			restriction.addClause('sc_student.stu_in_year' , stuinYear , '=');	
		if(stuNo != "")
			restriction.addClause('sc_student.stu_no' , stuNo , '=');
		if(stuName != "")
			restriction.addClause('sc_student.stu_name' , stuName , '=');
		if(blName)
			restriction.addClause('bl.name' , blName , '=');	
    	if(dvname!=""){
    		restriction.addClause('dv.dv_name',dvname, '=');
    	}
		this.GridForm.refresh(restriction);
	},
	ConsoleForm_onClear:function(){
    	this.ConsoleForm.clear();
		var rec = new Ab.view.Restriction();
    	this.GridForm.refresh(rec);
	},
	ondilog: function (){
		
		var role = View.user.role;
		if(role!="UNV STU ADMIN"){
			var sumPanel=View.panels.get('tuisuxinxi');
			sumPanel.showField('sc_stu_log.is_key', false);
			
		}
		
		var selects=this.GridForm.getSelectedRows();
		if(selects.length>0){
			this.tuisuxinxi.showInWindow({
	            x: 325,
	            y: 195,
	            width: 600,
	            height: 350,
	            closeButton: false
	        });
			this.tuisuxinxi.refresh([],true);
			//获取当前日期
			var currentDate = ASDM_getCurrentDate_Client();
			this.tuisuxinxi.setFieldValue("sc_stu_log.date_checkout",currentDate);
		}else{
			View.showMessage(getMessage('message1'));
			return;
		}
	},
	tuisuxinxi_onSave: function(){
		this.checkoutCause=this.tuisuxinxi.getFieldValue("sc_stu_log.checkout_cause");
		this.isKey=this.tuisuxinxi.getFieldValue("sc_stu_log.is_key");
		this.dateCheckout=this.tuisuxinxi.getFieldValue("sc_stu_log.date_checkout");
		this.comments=this.tuisuxinxi.getFieldValue("sc_stu_log.comments");
		if(this.dateCheckout==""){
			View.showMessage(getMessage('message'));
			return;
		}
		if(this.checkoutCause==""){
			View.showMessage(getMessage('message2'));
			return;
		}
		submitChanges();
    }, 
});
function submitChanges(){
	var message = getMessage("确定要添加退房记录吗？");
	var dsEmp = View.dataSources.get("ds_stuAssign");
    var grid = View.panels.get("GridForm");
    var dsRm = View.dataSources.get("ds_ab-sp-dorm");
    var dsStu = View.dataSources.get("ds_asc_bj_dorm_assign2");
	var selects=controller.GridForm.getSelectedRows();
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
//-------------log日志添加退房信息-----------
    	var checkoutCause=controller.checkoutCause;
    	var dateCheckout=controller.dateCheckout;
    	var is_key=controller.isKey;
    	var comments=controller.comments;
    	var mark="退宿";
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
        rec.setValue("sc_stu_log.is_key",is_key);
        rec.oldValues = new Object();
        rec.oldValues["sc_stu_log.stu_no"] = stuNo;
        dsEmp.saveRecord(rec);
        
        //更新rm表
        
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", buildingId, "=");
		restriction.addClause("rm.fl_id", floorId, "=");
		restriction.addClause("rm.rm_id", roomId, "=");	       		
		var rmRecord=dsRm.getRecord(restriction);
		var current_key=rmRecord.getValue("rm.count_key");
		var current_unget_key=rmRecord.getValue("rm.count_unget_key");
		var current_untrn_key=rmRecord.getValue("rm.count_unrtn_key");
//		0;未领取;1;领取;2;未退还;3;退还
//		if(is_key=="1"){
//			var count_key=parseFloat(current_key)+1;
//			rmRecord.setValue("rm.count_key", count_key);
//		}else 
		if(is_key=="3"){
			var count_key=parseFloat(current_key)-1;
			rmRecord.setValue("rm.count_key", count_key);
		}
//		else if(is_key=="0"){
//			var count_unget_key=parseFloat(current_unget_key)+1;
//			rmRecord.setValue("rm.count_unget_key", count_unget_key);							
//		}else if(is_key=="2"){
//			var count_unrtn_key=parseFloat(current_untrn_key)+1;
//			rmRecord.setValue("rm.count_unrtn_key", count_unrtn_key);	
//		}			
		dsRm.saveRecord(rmRecord);
        
        
        //更新sc_student的内容
		var rec2 = new Ab.view.Restriction();
		rec2.addClause("sc_student.stu_no", stuNo, "=");	       		
		var stuRecord=dsStu.getRecord(rec2);
		stuRecord.setValue("sc_student.is_key", is_key);
		stuRecord.setValue("sc_student.bl_id", "");
		stuRecord.setValue("sc_student.fl_id", "");
		stuRecord.setValue("sc_student.rm_id", "");
		dsStu.saveRecord(stuRecord);
			
	  }
	   controller.GridForm.refresh();
	   View.panels.get("GridForm").refresh();
	   View.showMessage("退宿成功");
	}
  });
}