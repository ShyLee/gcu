var controller = View.createController('controller', {

    type:"",
    cardId:"",
    afterInitialDataFetch: function(){
    	//this.rmDetail.addParameter('rmType', " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
    },
    showZZFCardInfo:function(){
    	var panel = this.gridPanel;
    	var selectedIndex = panel.selectedRowIndex;
    	var card_id = panel.rows[selectedIndex]["sc_zzfcard.card_id"];
    	var res= new Ab.view.Restriction();
    	res.addClause("sc_zzfcard.card_id",card_id,"=");
    	this.room_info.refresh(res);
    	this.check_info.refresh(res);
    	this.zzf_info.refresh(res);
    	this.cardId=card_id;
    },
    afterSelectType:function(){
    	var rent_type=this.type;
    	var area_lease=this.room_info.getFieldValue('sc_zzfcard.area_lease');
    	var curr_rent_rate=this.room_info.getFieldValue('sc_zzfcard.curr_rent_rate');
    	if(rent_type=="0"){
    		this.room_info.setFieldValue('sc_zzfcard.desposit_payoff', (parseFloat(area_lease)*(curr_rent_rate)).toFixed(2));
    		this.room_info.setFieldValue('sc_zzfcard.rent_type', "0");
    	}else{
    		this.room_info.setFieldValue('sc_zzfcard.desposit_payoff', parseFloat(curr_rent_rate));
    		this.room_info.setFieldValue('sc_zzfcard.rent_type', "1");
    	}
    	
    },
    changeIsNotChangZu:function(){
    	var is_day_first = this.room_info.getFieldValue("sc_zzfcard.is_day_first");
    	if(is_day_first=='1'){
    		this.room_info.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = false;
    		this.room_info.getFieldElement('sc_zzfcard.payment_to').disabled = true;
    		this.changeCheckin();
    	}else{
    		this.room_info.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
    		this.room_info.getFieldElement('sc_zzfcard.payment_to').disabled = false;
    		this.changeCheckin();
    	}
    	
    },
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.room_info.getFieldValue('sc_zzfcard.date_checkin');
        
        var startDay = monthStartStr(dateCheckin);
        this.room_info.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        this.room_info.setFieldValue('sc_zzfcard.date_payrent_last', startDay);
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.room_info.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
            this.room_info.setFieldValue('sc_zzfcard.htqx', inputYear+"年");
        }
        else {
            this.room_info.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    changePaymentTo: function(){
        var payment = this.room_info.getFieldValue('sc_zzfcard.payment_to');
        if (payment == 'finance') {
            this.room_info.setFieldValue('sc_zzfcard.rent_period', 'Month');
            this.room_info.setFieldValue('sc_zzfcard.is_day_first', '2');
            this.room_info.getFieldElement('sc_zzfcard.rent_period').disabled = true;
            this.room_info.getFieldElement('sc_zzfcard.is_day_first').disabled = true;
        }
        else {
        	this.room_info.getFieldElement('sc_zzfcard.rent_period').disabled = false;
            this.room_info.getFieldElement('sc_zzfcard.is_day_first').disabled = false;
        }
    },
    room_info_onCancel:function(){
    	this.room_info.show(false);
    	this.check_info.show(false);
    	this.zzf_info.show(false);
    	this.rmInfo.show(false);
    },
    room_info_onDelete:function(){
    		var message="确定要删除";
        	var controller=this;
        	View.confirm(message,function(button){
        	    if(button=="yes"){
           		 	var res= new Ab.view.Restriction();
           		 	res.addClause("sc_zzfcard.card_id",controller.cardId,"=");
           		 	var record=controller.sc_zzfcardDataSource.getRecord(res);
           		 	controller.sc_zzfcardDataSource.deleteRecord(record);
           		 	controller.gridPanel.refresh();
           		 	View.showMessage("删除成功");
           		 	controller.room_info_onCancel();
        	    }else{
        	     
        	    }
        	 }); 	
   	
    },
    room_info_onSave:function(){   	
    	 var success=this.room_info.canSave();
    	 if(success){
    		 this.room_info.save();
    		 this.check_info.save();  	     
    	     this.gridPanel.refresh();
    	 }    	
    },
    room_info_onCheck:function(){   
    	var dsRm = View.dataSources.get("rmDetail");
    	var bl_id=this.zzf_info.getFieldValue('sc_zzfcard.bl_id');
    	var fl_id=this.zzf_info.getFieldValue('sc_zzfcard.fl_id');
    	var rm_id=this.zzf_info.getFieldValue('sc_zzfcard.rm_id');
    	var success=this.room_info.canSave();
    	if(success){
    		var message="是否填写完毕，确认入住？";
        	var controller=this;
        	View.confirm(message,function(button){
        	    if(button=="yes"){       	    	
           		 	
           		 	var res= new Ab.view.Restriction();
           		 	res.addClause("rm.bl_id",bl_id,"=");
           		 	res.addClause("rm.fl_id",fl_id,"=");
           		 	res.addClause("rm.rm_id",rm_id,"=");
           		 	var rmRecord=dsRm.getRecord(res);
           		 	controller.rmInfo.refresh(res);
           		 	controller.rmInfo.show(false);
           		 	var count_house_kz=rmRecord.getValue("rm.count_house_kz");
           		 	var count_house_yz=rmRecord.getValue("rm.count_house_yz");
           		 	if(parseFloat(count_house_kz)<=0){
           		 		View.showMessage("当前房间可租户数为0或房间已被出租");
           		 		return;
           		 	}else{
           		 		try {
           		 			result = Workflow.callMethod('AbMyExtension01-UpdateOfficeService-getLeaseId');
           		 		}
           		 		catch (e) {
           		 			Workflow.handleError(e);
           		 			View.showMessage("获取合同编号出错，请联系管理员");
           		 		}
           		 		if(result.code == 'executed'){
           		 			//可租户数减1，已租户数加1
               		 		var count_kz=parseFloat(count_house_kz)-parseFloat(1);
               		 		var count_yz=parseFloat(count_house_yz)+parseFloat(1);
               		 		controller.rmInfo.setFieldValue("rm.count_house_kz", count_kz);
               		 		controller.rmInfo.setFieldValue("rm.count_house_yz", count_yz);
               		 		controller.rmInfo.save(); 
               		 		
               		 		//改申请单状态改为已入住
               		 		controller.check_info.setFieldValue('sc_zzfcard.card_status', 'yrz');
               		 		controller.check_info.setFieldValue('sc_zzfcard.lease_id', result.message);
               		 		controller.check_info.save();  
               		 		controller.gridPanel.refresh();
               		 		View.showMessage("入住成功");
               		 		controller.room_info_onCancel();
           		 		}          		 		
           		 	}        		 	
        	    }else{
        	     
        	    }
        	 }); 	
    	} 	
    }
    
    
    
});


function afterSelectInfo(fieldName, newValue, oldValue){
	var form = View.panels.get('room_info');
	if (fieldName == 'sc_zzfcard.rent_type'){
		if(newValue=="按面积"){
			form.setFieldValue("sc_zzfcard.rent_type", "0");
			controller.type="0";
		}else{
			form.setFieldValue("sc_zzfcard.rent_type", "1");
			controller.type="1";
		}
	}
	if (fieldName == 'sc_zzfcard.rent_level'){
		form.setFieldValue('sc_zzfcard.rent_level', newValue);
	}
	if (fieldName == 'sc_zzfcard.curr_rent_rate'){
		form.setFieldValue('sc_zzfcard.curr_rent_rate', newValue);
		controller.afterSelectType();	
	}
	
}
