var rentOutController = View.createController("rentOutController", {
    cardId: null,
    cardType: null,
    parentController: null,
    
    afterInitialDataFetch: function(){
        if (this.view.parameters) {
            this.cardId = this.view.parameters['cardId'];
            this.cardType = this.view.parameters['cardType'];
            this.parentController = this.view.parameters['parentController'];
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.card_id", this.cardId, "=");
        
        this.rentOutInfo.refresh(restriction, false);
        this.proInfo.refresh(restriction, false);
        this.FCBInfo.refresh(restriction, false);
        /*var today = new Date();
        this.rentOutInfo.setFieldValue('sc_zzfcard.date_checkout_actual', today);*/
    },
    autoSetDate: function(){
        var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
        if (this.cardType == '博士后公寓') {
            var day = this.getDayBefore(date_checkout_actual);
            this.rentOutInfo.setFieldValue('sc_zzfcard.date_payrent_last', day);
        }
        else {
            var day = this.getLastDayBefore(date_checkout_actual);
            this.rentOutInfo.setFieldValue('sc_zzfcard.date_payrent_last', day);
        }
    },
    rentOutInfo_onSave: function(){
    	//判断是否符合退租的条件
    	/*var canNotOut = this.showWarningInfo();
    	if(canNotOut){
    		return;
    	}*/
    	
        if (!this.rentOutInfo.canSave()) {
            return;
        }
        
        var bl_id = this.rentOutInfo.getFieldValue("sc_zzfcard.bl_id");
        var fl_id = this.rentOutInfo.getFieldValue("sc_zzfcard.fl_id");
        var rm_id = this.rentOutInfo.getFieldValue("sc_zzfcard.rm_id");
    		
        var controller = this;
        View.confirm("确定要退租吗？", function(button){
            if (button == 'yes') {
                //保存退租信息
                controller.saveRentOutInfo(controller.cardId,controller.cardType);
                //维护租赁资源
                controller.saveValueIntoRm(bl_id,fl_id,rm_id);
                //保存续签信息
                /**
                 * 此处数据库建立一个触发器，如果，监听到此协议已续租，则自动更新属于此协议的续签列表为无效
                 * */
                View.closeThisDialog();
                if (controller.parentController.id == 'checkoutController') {
                    controller.parentController.sc_zzfCardListPanel.refresh();
                }
                else 
                    if (controller.parentController.id == 'ascProtocolWarnController') {
                        controller.parentController.zzf_fee_detail.refresh();
                    }
            }
        });
        
    },
    /**
     * 维护租赁资源
     * */
    saveValueIntoRm: function(bl_id,fl_id,rm_id){
		var rmDs=View.dataSources.get('rmDs');
		var res = new Ab.view.Restriction();
		res.addClause('rm.bl_id',bl_id,'=');
		res.addClause('rm.fl_id',fl_id,'=');
		res.addClause('rm.rm_id',rm_id,'=');
		var record=rmDs.getRecord(res);
//		record.setValue("rm.count_house_all",(parseFloat(record.getValue('rm.count_house_all'))+1));
		record.setValue("rm.count_house_yz",(parseFloat(record.getValue('rm.count_house_yz'))-1));
		record.setValue("rm.count_house_kz",(parseFloat(record.getValue('rm.count_house_kz'))+1));
		rmDs.saveRecord(record);
	},
    /**
     * 警告信息
     * */
    showWarningInfo: function(){
    	var boolen = false;
    	var str = "";
    	var i = 0;
    	var date_checkout_ought = this.rentOutInfo.getFieldValue("sc_zzfcard.date_checkout_ought");
    	var date_payrent_last = this.rentOutInfo.getFieldValue("sc_zzfcard.date_payrent_last");
    	var date_checkout_actual = this.rentOutInfo.getFieldValue("sc_zzfcard.date_checkout_actual");
    	if(new Date(formatDate(date_payrent_last)).getTime() > new Date(formatDate(date_checkout_ought)).getTime()){
    		boolen = true;
    		//str = (++i) + ": 房租缴至日期 [" + date_payrent_last + "]超过应退日期 [" + date_checkout_ought + "]，请先走续签界面，并完成缴费\n";
    		str = "房租缴至日期 [" + date_payrent_last + "]超过应退日期 [" + date_checkout_ought + "]，请先走续签界面，并完成缴费\n";
    	}
    	
//    	var num = this.isNoPayNums(this.cardId);
//    	if(num > 0){
//    		boolen = true;
//    		//str += (++i) + ": 您还有[" +num + "]项房租未缴齐,请缴齐再来退租";
//    		str += "您还有[" +num + "]项房租未缴齐,请缴齐再来退租";
//    	}
    	
    	
    	if(new Date(formatDate(date_checkout_actual)).getTime() > new Date(formatDate(date_payrent_last)).getTime()){
    		boolen = true;
    		str = "退房日期 [" + date_checkout_actual + "]超过房租缴至日期 [" + date_payrent_last + "];如需退房,请修改退房日期!";
    	}
    	
    	if(boolen){
    		View.showMessage(str);
    	}
    	
    	
    	
    	
    	return boolen;
    },
    /**
     *判断是否存在还未缴费完全的缴费项目 
     * 
     * */
    isNoPayNums: function(card_id){
		var restriction = "sc_zzf_fee.card_id='" + card_id + "' and sc_zzf_fee.pay_ought &gt; sc_zzf_fee.pay_actual";
        var parameters = {
            tableName: 'sc_zzf_fee',
            fieldNames: toJSON(['sc_zzf_fee.card_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        return result.data.records.length;
	},
    
    rentOutInfo_onCancel: function(){
        View.closeThisDialog();
    },
    /**
     * 保存退租信息，如果是教职工退租的话，还要计算当前协议的累积租住月份
     * 
     * */
    saveRentOutInfo: function(cardId,cardType){
        var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
        var cause_checkout = this.rentOutInfo.getFieldValue('sc_zzfcard.cause_checkout');
        var date_payrent_last = this.rentOutInfo.getFieldValue('sc_zzfcard.date_payrent_last');
        
        var fee_water_info = this.proInfo.getFieldValue('sc_zzfcard.fee_water_info');
        var fee_ele_info = this.proInfo.getFieldValue('sc_zzfcard.fee_ele_info');
        var pro_info = this.proInfo.getFieldValue('sc_zzfcard.pro_info');
        var pro_other_info = this.proInfo.getFieldValue('sc_zzfcard.pro_other_info');
        var pro_people = this.proInfo.getFieldValue('sc_zzfcard.pro_people');
        
        var rent_info = this.FCBInfo.getFieldValue('sc_zzfcard.rent_info');
        var key_info = this.FCBInfo.getFieldValue('sc_zzfcard.key_info');
        var furniture_info = this.FCBInfo.getFieldValue('sc_zzfcard.furniture_info');
        var room_info = this.FCBInfo.getFieldValue('sc_zzfcard.room_info');
        var fcb_other_info = this.FCBInfo.getFieldValue('sc_zzfcard.fcb_other_info');
        var fcb_people = this.FCBInfo.getFieldValue('sc_zzfcard.fcb_people');
        
        var record = this.sc_zzfcardDataSource.getRecord({
            'sc_zzfcard.card_id': cardId
        });
        record.setValue('sc_zzfcard.card_status', 'ytz');
        record.setValue('sc_zzfcard.date_checkout_actual', date_checkout_actual);
        record.setValue('sc_zzfcard.cause_checkout', cause_checkout);
        record.setValue('sc_zzfcard.date_payrent_last', date_payrent_last);
        record.setValue('sc_zzfcard.fee_water_info', fee_water_info);
        record.setValue('sc_zzfcard.fee_ele_info', fee_ele_info);
        record.setValue('sc_zzfcard.pro_info', pro_info);
        record.setValue('sc_zzfcard.pro_other_info', pro_other_info);
        record.setValue('sc_zzfcard.pro_people', pro_people);
        record.setValue('sc_zzfcard.rent_info', rent_info);
        record.setValue('sc_zzfcard.key_info', key_info);
        record.setValue('sc_zzfcard.furniture_info', furniture_info);
        record.setValue('sc_zzfcard.room_info', room_info);
        record.setValue('sc_zzfcard.fcb_other_info', fcb_other_info);
        record.setValue('sc_zzfcard.fcb_people', fcb_people);
        
        /**
         * 如果是2012年7月1日以后进校教职工退租的话，
         * 
         * 还要计算当前协议的累积租住月份
         * 
         * */
        if(cardType == '周转房(在校职工)'){
        	var date_work_begin = this.rentOutInfo.getFieldValue('sc_zzfcard.date_work_begin');
        	if(new Date(formatDate(date_work_begin)).getTime() >= new Date("2012-07-01").getTime()){
        		
        		var date_checkin = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkin');
            	var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
            	
        		var total_rent = this.getTotalRentMonth(date_checkin,date_checkout_actual);
            	record.setValue('sc_zzfcard.total_rent', total_rent);
            	
        	}
        }
        
        this.sc_zzfcardDataSource.saveRecord(record);
    },
    /**
     * 计算当前协议的累积租住月份
     * */
    getTotalRentMonth: function(date_checkin,date_checkout_actual){
    	var arrayBegin = date_checkin.split("-");
    	var arrayEnd = date_checkout_actual.split("-");
    	
    	var totalMonths = (parseInt(arrayEnd[0]) - parseInt(arrayBegin[0])) * 12 
    					  + (parseInt(arrayEnd[1]) - parseInt(arrayBegin[1]));
    	//如果不够一个月的日期 按一个月计算
    	if(parseInt(arrayEnd[2]) > parseInt(arrayBegin[2])){
    		totalMonths++;
    	}
    		
    	return totalMonths;
    },
    /**
     * 返回当前日期的前一天
     * */
    getDayBefore: function(date_begin){
        var time = new Date(formatDate(date_begin)).getTime() - 1000 * 60 * 60 * 24;
        var date = new Date(time);
        var strYear = date.getFullYear();
        var strDay = date.getDate();
        var strMonth = date.getMonth() + 1;
        return strYear + "-" + strMonth + "-" + strDay;
    },
    /**
     * 返回当前日期上一个月的最后一天
     * */
    getLastDayBefore: function(date_begin){
        var array = date_begin.split("-");
        
        var dd = parseInt(array[2]);
        
        var time = new Date(formatDate(date_begin)).getTime() - 1000 * 60 * 60 * 24 * dd;
        var date = new Date(time);
        var strYear = date.getFullYear();
        var strDay = date.getDate();
        var strMonth = date.getMonth() + 1;
        return strYear + "-" + strMonth + "-" + strDay;
    }
    
});
/**
 * 格式化日期
 * archibus系统 获取的date类型的字符串儿， 月份与日期没有自动补零
 *     (如 我们选的日期时"2014-08-08" 但form和grid界面中显示的是"2014-8-8")
 * 如果我们从界面中获取的值是"2014-8-8"
 * 用js Date函数  new Date("2014-8-8")时,获取不到具体的时间值
 * 此函数自动补零
 * */
function formatDate(date){
    var array = date.split("-");
    var yyyy = parseInt(array[0]);
    var mm = parseInt(array[1]);
    var dd = parseInt(array[2]);
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}

