var abReletDetailRoomController = View.createController("abReletDetailRoomController", {
	cardId:"",
	curr_rent:"",
	type:"",
	afterInitialDataFetch: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.curr_rent=this.teacherForm.getFieldValue("sc_zzfcard.curr_rent_rate");
		this.cardId=this.tabs.cardId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_zzfcard.card_id",this.cardId);
		this.teacherForm.refresh(restriction);
		this.editForm.refresh(restriction);
	},
	teacherForm_afterRefresh:function(){
		var ZZFCardStu = View.dataSources.get("sc_zzfcard_ds");
		var res=new Ab.view.Restriction();
		res.addClause('sc_zzfcard.card_id',this.cardId,'=');
		if(this.cardId!=""){
			var record=ZZFCardStu.getRecord(res);			
			
			var date_checkin_old=record.getValue("sc_zzfcard.date_checkin");
			var date_check_ought_old=record.getValue("sc_zzfcard.date_checkout_ought");
			
			this.teacherForm.setFieldValue("sc_zzfcard.date_checkin_old",date_checkin_old.format0());
			this.teacherForm.setFieldValue("sc_zzfcard.date_check_ought_old",date_check_ought_old.format0());
			this.teacherForm.setFieldValue("sc_zzfcard.date_checkin","");
			this.teacherForm.setFieldValue("sc_zzfcard.date_checkout_ought","");			
			var today = ASBT_getCurrentDate_Client();
			this.teacherForm.setFieldValue('sc_zzfcard.date_relet', today);
		}
	},
    onBack: function(){
        var tabName = "selectTab";
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        tab.show(true);
        this.tabs.selectTab(tabName);
    },
    afterSelectType:function(){
    	var rent_type=this.type;
    	var area_lease=this.teacherForm.getFieldValue('sc_zzfcard.area_lease');
    	var curr_rent_rate=this.teacherForm.getFieldValue('sc_zzfcard.curr_rent_rate');
    	if(rent_type=="0"){
    		this.teacherForm.setFieldValue('sc_zzfcard.desposit_payoff', (parseFloat(area_lease)*(curr_rent_rate)).toFixed(2));
    		this.teacherForm.setFieldValue('sc_zzfcard.rent_type', "0");
    	}else{
    		this.teacherForm.setFieldValue('sc_zzfcard.desposit_payoff', parseFloat(curr_rent_rate));
    		this.teacherForm.setFieldValue('sc_zzfcard.rent_type', "1");
    	}
    	
    },
    changeIsNotChangZu:function(){
    	var is_day_first = this.teacherForm.getFieldValue("sc_zzfcard.is_day_first");
    	if(is_day_first=='1'){
    		this.teacherForm.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = false;
    		this.teacherForm.getFieldElement('sc_zzfcard.payment_to').disabled = true;
    		this.changeCheckin();
    	}else{
    		this.teacherForm.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
    		this.teacherForm.getFieldElement('sc_zzfcard.payment_to').disabled = false;
    		this.changeCheckin();
    	}
    	
    },
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.teacherForm.getFieldValue('sc_zzfcard.date_checkin');
        
        var startDay = monthStartStr(dateCheckin);
        this.teacherForm.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        this.teacherForm.setFieldValue('sc_zzfcard.date_payrent_last', startDay);
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.teacherForm.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
            this.teacherForm.setFieldValue('sc_zzfcard.htqx', inputYear+"年");
        }
        else {
            this.teacherForm.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    changePaymentTo: function(){
        var payment = this.teacherForm.getFieldValue('sc_zzfcard.payment_to');
        if (payment == 'finance') {
            this.teacherForm.setFieldValue('sc_zzfcard.rent_period', 'Month');
            this.teacherForm.setFieldValue('sc_zzfcard.is_day_first', '2');
            this.teacherForm.getFieldElement('sc_zzfcard.rent_period').disabled = true;
            this.teacherForm.getFieldElement('sc_zzfcard.is_day_first').disabled = true;
        }
        else {
        	this.teacherForm.getFieldElement('sc_zzfcard.rent_period').disabled = false;
            this.teacherForm.getFieldElement('sc_zzfcard.is_day_first').disabled = false;
        }
    },
    onSave:function(){
    	var ZZFCardStu = View.dataSources.get("sc_zzfcard_ds");
    	//旧合同
		var res=new Ab.view.Restriction();
		res.addClause('sc_zzfcard.card_id',this.cardId,'=');
		var record=ZZFCardStu.getRecord(res);
		
		try {
	 		result = Workflow.callMethod('AbMyExtension01-UpdateOfficeService-getLeaseId');
	 	}
	 	catch (e) {
	 		Workflow.handleError(e);
	 		View.showMessage("获取合同编号出错，请联系管理员");
	 		return;
	 	}
		
		var success=this.teacherForm.canSave();
    	if(success){
    		var message="确定房租已缴完并续租";
        	var controller=this;
        	View.confirm(message,function(button){
        	    if(button=="yes"){
        	    	 var success=controller.teacherForm.canSave();
        	    	 if(success){
        	    		var recordRenew = new Ab.data.Record();
     					recordRenew.isNew=true;
     					//变化的数据从页面中拿
     					recordRenew.setValue("sc_zzfcard.htqx",controller.teacherForm.getFieldValue("sc_zzfcard.htqx"));
     					recordRenew.setValue("sc_zzfcard.date_checkin",controller.teacherForm.getFieldValue("sc_zzfcard.date_checkin"));
     					recordRenew.setValue("sc_zzfcard.date_checkout_ought",controller.teacherForm.getFieldValue("sc_zzfcard.date_checkout_ought"));
     					recordRenew.setValue("sc_zzfcard.payment_to",controller.teacherForm.getFieldValue("sc_zzfcard.payment_to"));
     					recordRenew.setValue("sc_zzfcard.is_day_first",controller.teacherForm.getFieldValue("sc_zzfcard.is_day_first"));
     					recordRenew.setValue("sc_zzfcard.rent_type",controller.teacherForm.getFieldValue("sc_zzfcard.rent_type"));
     					recordRenew.setValue("sc_zzfcard.rent_level",controller.teacherForm.getFieldValue("sc_zzfcard.rent_level"));
     					recordRenew.setValue("sc_zzfcard.curr_rent_rate",controller.teacherForm.getFieldValue("sc_zzfcard.curr_rent_rate"));
     					recordRenew.setValue("sc_zzfcard.area_lease",controller.teacherForm.getFieldValue("sc_zzfcard.area_lease"));
     					recordRenew.setValue("sc_zzfcard.desposit_payoff",controller.teacherForm.getFieldValue("sc_zzfcard.desposit_payoff"));
     					recordRenew.setValue("sc_zzfcard.rent_pay_id",controller.teacherForm.getFieldValue("sc_zzfcard.rent_pay_id"));
     					recordRenew.setValue("sc_zzfcard.rent_pay_people",controller.teacherForm.getFieldValue("sc_zzfcard.rent_pay_people"));
     					recordRenew.setValue("sc_zzfcard.cash_deposit",controller.teacherForm.getFieldValue("sc_zzfcard.cash_deposit"));
     					recordRenew.setValue("sc_zzfcard.cash_clean",controller.teacherForm.getFieldValue("sc_zzfcard.cash_clean"));
     					recordRenew.setValue("sc_zzfcard.sponsor",controller.teacherForm.getFieldValue("sc_zzfcard.sponsor"));
     					recordRenew.setValue("sc_zzfcard.sponsor_name",controller.teacherForm.getFieldValue("sc_zzfcard.sponsor_name"));
     					recordRenew.setValue("sc_zzfcard.doc2",controller.teacherForm.getFieldValue("sc_zzfcard.doc2"));
     					recordRenew.setValue("sc_zzfcard.doc_relet",controller.teacherForm.getFieldValue("sc_zzfcard.doc_relet"));
     					recordRenew.setValue("sc_zzfcard.date_first_pay",controller.teacherForm.getFieldValue("sc_zzfcard.date_first_pay"));
     					recordRenew.setValue("sc_zzfcard.date_payrent_last",controller.teacherForm.getFieldValue("sc_zzfcard.date_payrent_last"));
     					recordRenew.setValue("sc_zzfcard.new_card_id",controller.teacherForm.getFieldValue("sc_zzfcard.card_id"));
     					recordRenew.setValue("sc_zzfcard.date_relet",controller.teacherForm.getFieldValue("sc_zzfcard.date_relet"));
     					//不变化的数据从数据库中拿
     					recordRenew.setValue("sc_zzfcard.card_type",record.getValue("sc_zzfcard.card_type"));
     					recordRenew.setValue("sc_zzfcard.em_id",record.getValue("sc_zzfcard.em_id"));
     					recordRenew.setValue("sc_zzfcard.em_name",record.getValue("sc_zzfcard.em_name"));
     					recordRenew.setValue("sc_zzfcard.sex",record.getValue("sc_zzfcard.sex"));
     					recordRenew.setValue("sc_zzfcard.identi_code",record.getValue("sc_zzfcard.identi_code"));
     					recordRenew.setValue("sc_zzfcard.dv_id",record.getValue("sc_zzfcard.dv_id"));
     					recordRenew.setValue("sc_zzfcard.dv_name",record.getValue("sc_zzfcard.dv_name"));
     					recordRenew.setValue("sc_zzfcard.zhiw_id",record.getValue("sc_zzfcard.zhiw_id"));
     					recordRenew.setValue("sc_zzfcard.date_work_begin",record.getValue("sc_zzfcard.date_work_begin"));
     					recordRenew.setValue("sc_zzfcard.phone",record.getValue("sc_zzfcard.phone"));
     					recordRenew.setValue("sc_zzfcard.zhic_id",record.getValue("sc_zzfcard.zhic_id"));
     					recordRenew.setValue("sc_zzfcard.xueli",record.getValue("sc_zzfcard.xueli"));
     					recordRenew.setValue("sc_zzfcard.email",record.getValue("sc_zzfcard.email"));
     					recordRenew.setValue("sc_zzfcard.marriage_stat",record.getValue("sc_zzfcard.marriage_stat"));
     					recordRenew.setValue("sc_zzfcard.is_working_parents",record.getValue("sc_zzfcard.is_working_parents"));
     					recordRenew.setValue("sc_zzfcard.po_em_id",record.getValue("sc_zzfcard.po_em_id"));
     					recordRenew.setValue("sc_zzfcard.po_name",record.getValue("sc_zzfcard.po_name"));
     					recordRenew.setValue("sc_zzfcard.po_dv_id",record.getValue("sc_zzfcard.po_dv_id"));
     					recordRenew.setValue("sc_zzfcard.po_identi_code",record.getValue("sc_zzfcard.po_identi_code"));
     					recordRenew.setValue("sc_zzfcard.curr_addr",record.getValue("sc_zzfcard.curr_addr"));
     					recordRenew.setValue("sc_zzfcard.apply_beizhu",record.getValue("sc_zzfcard.apply_beizhu"));
     					recordRenew.setValue("sc_zzfcard.bl_id",record.getValue("sc_zzfcard.bl_id"));
     					recordRenew.setValue("sc_zzfcard.fl_id",record.getValue("sc_zzfcard.fl_id"));
     					recordRenew.setValue("sc_zzfcard.rm_id",record.getValue("sc_zzfcard.rm_id"));
     					recordRenew.setValue("sc_zzfcard.unit_code",record.getValue("sc_zzfcard.unit_code"));
     					recordRenew.setValue("sc_zzfcard.rm_cat",record.getValue("sc_zzfcard.rm_cat"));
     					recordRenew.setValue("sc_zzfcard.rmcat_name",record.getValue("sc_zzfcard.rmcat_name"));
     					recordRenew.setValue("sc_zzfcard.rm_type",record.getValue("sc_zzfcard.rm_type"));
     					recordRenew.setValue("sc_zzfcard.rmtype_name",record.getValue("sc_zzfcard.rmtype_name"));
     					recordRenew.setValue("sc_zzfcard.is_left",record.getValue("sc_zzfcard.is_left"));
     					recordRenew.setValue("sc_zzfcard.is_low_high",record.getValue("sc_zzfcard.is_low_high"));
     					recordRenew.setValue("sc_zzfcard.huxing",record.getValue("sc_zzfcard.huxing"));
     					recordRenew.setValue("sc_zzfcard.chaoxiang",record.getValue("sc_zzfcard.chaoxiang"));
     					recordRenew.setValue("sc_zzfcard.area",record.getValue("sc_zzfcard.area"));
     					recordRenew.setValue("sc_zzfcard.area_comn_rm",record.getValue("sc_zzfcard.area_comn_rm"));
     					recordRenew.setValue("sc_zzfcard.eq_desc",record.getValue("sc_zzfcard.eq_desc"));
     					recordRenew.setValue("sc_zzfcard.weixiu_log",record.getValue("sc_zzfcard.weixiu_log"));
     					recordRenew.setValue("sc_zzfcard.date_checkin_old",record.getValue("sc_zzfcard.date_checkin"));
     					recordRenew.setValue("sc_zzfcard.date_check_ought_old",record.getValue("sc_zzfcard.date_checkout_ought"));
     					recordRenew.setValue("sc_zzfcard.key_checkin",record.getValue("sc_zzfcard.key_checkin"));
     					recordRenew.setValue("sc_zzfcard.comment_checkin",record.getValue("sc_zzfcard.comment_checkin"));
     					recordRenew.setValue("sc_zzfcard.rmsrc_situation",record.getValue("sc_zzfcard.rmsrc_situation"));
    	           
     					recordRenew.setValue("sc_zzfcard.card_status","yxq");
     					recordRenew.setValue("sc_zzfcard.lease_id",result.message);
     					recordRenew.setValue("sc_zzfcard.is_renew","1");
     					ZZFCardStu.saveRecord(recordRenew);
     					//生成新合同之后把原合同的是否续签状态改为是，并把新合同编号写入旧合同中,新合同中的New_card_id 为空
     					//新合同
     					var res2=new Ab.view.Restriction();
     					res2.addClause('sc_zzfcard.new_card_id',controller.cardId,'=');
     					var newRecord=ZZFCardStu.getRecord(res2);
     					record.setValue("sc_zzfcard.new_card_id",newRecord.getValue("sc_zzfcard.card_id"))
     					record.setValue("sc_zzfcard.is_renew","2")
     					ZZFCardStu.saveRecord(record);
     					
     					newRecord.setValue("sc_zzfcard.new_card_id","")
     					ZZFCardStu.saveRecord(newRecord);
     					View.showMessage("续签成功");
        	    	 }
        	    }else{
        	     
        	    }
        	});
    	}   	
  	   
    }
});


function afterSelectInfo(fieldName, newValue, oldValue){
	var form = View.panels.get('teacherForm');
	if (fieldName == 'sc_zzfcard.rent_type'){
		if(newValue=="按面积"){
			form.setFieldValue("sc_zzfcard.rent_type", "0");
			abReletDetailRoomController.type="0";
		}else{
			form.setFieldValue("sc_zzfcard.rent_type", "1");
			abReletDetailRoomController.type="1";
		}
	}
	if (fieldName == 'sc_zzfcard.rent_level'){
		form.setFieldValue('sc_zzfcard.rent_level', newValue);
	}
	if (fieldName == 'sc_zzfcard.curr_rent_rate'){
		form.setFieldValue('sc_zzfcard.curr_rent_rate', newValue);
		abReletDetailRoomController.afterSelectType();	
	}
	
}