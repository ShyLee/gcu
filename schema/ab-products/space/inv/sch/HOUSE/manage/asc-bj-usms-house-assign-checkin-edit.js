var zzfEmpoyeeController = View.createController('zzfEmpoyeeController', {

    tabs: null,
    
    afterInitialDataFetch: function(){
        this.emInfoPanel.actions.get('printProtocolSafe').enable(false);
        this.showDetail(true);
    },
    
    changePaymentTo: function(){
        var payment = this.leaseInfoPanel.getFieldValue('sc_zzfcard.payment_to');
        if (payment == 'finance') {
            this.leaseInfoPanel.setFieldValue('sc_zzfcard.rent_period', 'Month');
            this.leaseInfoPanel.setFieldValue('sc_zzfcard.is_day_first', '2');
            jQuery('#leaseInfoPanel_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
            jQuery('#leaseInfoPanel_sc_zzfcard\\.is_day_first').attr('disabled', 'disabled');
        }
        else {
            jQuery('#leaseInfoPanel_sc_zzfcard\\.rent_period').attr('disabled', false);
            jQuery('#leaseInfoPanel_sc_zzfcard\\.is_day_first').attr('disabled', false);
        }
    },
	showDetail:function(autoShow){
		var panel = this.gridPanel;
//		var selectedIndex = panel.selectedRowIndex;
		var selectedIndex="-1";
		if(autoShow){
			selectedIndex="0";
		}else{
			selectedIndex=panel.selectedRowIndex;
		}
		var card_id = panel.rows[selectedIndex]["sc_zzfcard.card_id"];
		var bl_id = panel.rows[selectedIndex]["sc_zzfcard.bl_id"];
		var fl_id = panel.rows[selectedIndex]["sc_zzfcard.fl_id"];
		var rm_id = panel.rows[selectedIndex]["sc_zzfcard.rm_id"];
		
		var res= new Ab.view.Restriction();
		res.addClause("sc_zzfcard.card_id",card_id,"=");
		
		this.emInfoPanel.refresh(res);
		this.leaseInfoPanel.refresh(res);
		this.checkInPanel.refresh(res);
		
		var res1= new Ab.view.Restriction();
		res1.addClause("rm.bl_id",bl_id,"=");
		res1.addClause("rm.fl_id",fl_id,"=");
		res1.addClause("rm.rm_id",rm_id,"=");
		this.rmInfoPanel.refresh(res1);
		
        this.emInfoPanel.actions.get('printProtocolSafe').enable(false);
	},
    emInfoPanel_onSave: function(){
		//未选房间提醒
        var rmId = this.rmInfoPanel.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间！');
            return;
        }
		//未填入住日期提醒
        var dateCheckin = this.leaseInfoPanel.getFieldValue('sc_zzfcard.date_checkin');
        if (!dateCheckin) {
            View.showMessage('请选择入住日期！');
            return;
        }
        //申请人姓名不能为空
        var cashDeposit = this.emInfoPanel.getFieldValue('sc_zzfcard.em_name');
        if(!cashDeposit){
        	View.showMessage("请输入申请人姓名！");
        	return;
        }
		var area = this.leaseInfoPanel.getFieldValue('sc_zzfcard.area_lease');
        if (parseFloat(area) == 0) {
            View.showMessage('请输入计费面积，且不能为0！');
            return;
        }
        	var controller=this;
        	View.confirm("确定要修改入住信息吗?",function(button){
        		if(button== "yes"){
        			//1、存入新的房间协议
        			controller.emInfoPanel.save();
        			
        			var panel1=controller.rmInfoPanel;
        			var blId = panel1.getFieldValue('rm.bl_id');
        			var flId = panel1.getFieldValue('rm.fl_id');
        			var rmId = panel1.getFieldValue('rm.rm_id');
        			//2、更新房间、合同、登记数据
        			var cardId = controller.emInfoPanel.getFieldValue('sc_zzfcard.card_id');
        			var res1 = new Ab.view.Restriction();
        			res1.addClause('sc_zzfcard.card_id', cardId);
        			var record1 = controller.sc_zzfcardDataSource.getRecord(res1);
        			
        			var panel2=controller.leaseInfoPanel;
        			record1.setValue('sc_zzfcard.rent_pay_id', panel2.getFieldValue('sc_zzfcard.rent_pay_id'));
        			record1.setValue('sc_zzfcard.rent_pay_people', panel2.getFieldValue('sc_zzfcard.rent_pay_people'));
        			record1.setValue('sc_zzfcard.cash_clean', panel2.getFieldValue('sc_zzfcard.cash_clean'));
        			record1.setValue('sc_zzfcard.clean_people_id', panel2.getFieldValue('sc_zzfcard.clean_people_id'));
        			record1.setValue('sc_zzfcard.clean_pay_people', panel2.getFieldValue('sc_zzfcard.clean_pay_people'));
        			record1.setValue('sc_zzfcard.sponsor', panel2.getFieldValue('sc_zzfcard.sponsor'));
        			record1.setValue('sc_zzfcard.sponsor_name', panel2.getFieldValue('sc_zzfcard.sponsor_name'));
        			record1.setValue('sc_zzfcard.sponsor_dv', panel2.getFieldValue('sc_zzfcard.sponsor_dv'));
        			
        			var panel3=controller.checkInPanel;
        			record1.setValue('sc_zzfcard.key_checkin', panel3.getFieldValue('sc_zzfcard.key_checkin'));
        			record1.setValue('sc_zzfcard.rmsrc_situation', panel3.getFieldValue('sc_zzfcard.rmsrc_situation'));
        			record1.setValue('sc_zzfcard.comment_checkin', panel3.getFieldValue('sc_zzfcard.comment_checkin'));
        			
        			controller.sc_zzfcardDataSource.saveRecord(record1);
        			
        			View.showMessage('修改成功！');
        			controller.checkInPanel.refresh(res1);
        			controller.emInfoPanel.actions.get('save').enable(false);
        			controller.emInfoPanel.actions.get('printProtocol').enable(true);
        			var card_type=controller.emInfoPanel.getFieldValue("sc_zzfcard.card_type");
        			if(card_type==3){
        				controller.emInfoPanel.actions.get('printProtocolSafe').enable(true);
        			}else{
        				controller.emInfoPanel.actions.get('printProtocolSafe').enable(false);
        			}
        			
        		}
        	});
    },
    selectDaikouPerson: function(){
        if (document.getElementById("require_reply").checked) {
            jQuery('#leaseInfoPanel_sc_zzfcard\\.djfr').show();
            jQuery('#leaseInfoPanel_sc_zzfcard\\.djfr_labelCell').show();
			this.leaseInfoPanel.setFieldValue('sc_zzfcard.payment_to', 'finance');
            this.leaseInfoPanel.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#leaseInfoPanel_sc_zzfcard\\.payment_to').attr('disabled', 'disabled');
            jQuery('#leaseInfoPanel_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#leaseInfoPanel_sc_zzfcard\\.djfr').hide();
            jQuery('#leaseInfoPanel_sc_zzfcard\\.djfr_labelCell').hide();
			this.leaseInfoPanel.setFieldValue('sc_zzfcard.payment_to', 'house');
			jQuery('#leaseInfoPanel_sc_zzfcard\\.payment_to').attr('disabled', false);
            jQuery('#leaseInfoPanel_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    emInfoPanel_onPrintProtocol:function(){
    	var card_id = this.emInfoPanel.getFieldValue("sc_zzfcard.card_id");
    	var card_type = this.emInfoPanel.getFieldValue("sc_zzfcard.card_type");
    	var currentXmlName="";
	    //0;周转房(在校职工);1;周转房(外来人员);3;周转房(合同工)
	    if(card_type==0){
	    	currentXmlName="gcu-house-print-protocol-in";
	    }else if(card_type==1){
	    	currentXmlName="gcu-house-print-protocol-out";
	    }else if(card_type==3){
	    	currentXmlName="gcu-house-print-protocol-in-part";
	    	
	    }else{
	    	currentXmlName="gcu-house-print-protocol-in";
	    }
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
              width: 470,
              height: 200,
              xmlName: currentXmlName,
              parameters: {     
                 'CARD_ID':card_id 
             },
              closeButton: false
        });
    },
    emInfoPanel_onPrintProtocolSafe:function(){
    	var card_id = this.emInfoPanel.getFieldValue("sc_zzfcard.card_id");
    	var card_type = this.emInfoPanel.getFieldValue("sc_zzfcard.card_type");
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "gcu-house-print-protocol-out-safe",
            parameters: {     
               'CARD_ID':card_id 
           },
            closeButton: false
      });
	 },
    emInfoPanel_onPrintProtocolStop:function(){
    	var card_id = this.emInfoPanel.getFieldValue("sc_zzfcard.card_id");
    	var card_type = this.emInfoPanel.getFieldValue("sc_zzfcard.card_type");
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
    		width: 470,
    		height: 200,
    		xmlName: "gcu-house-print-protocol-in-stop",
    		parameters: {     
    			'CARD_ID':card_id 
    		},
    		closeButton: false
    	});
    }
});

function getEmCheckinDate(identity){
    var parameters = {
        tableName: 'sc_zzfcard',
        fieldNames: toJSON(['sc_zzfcard.date_checkin']),
        restriction: "sc_zzfcard.identi_code ='" + identity + "' and sc_zzfcard.card_status in ('yrz','yxq','ytz') "
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    //var dataList = [];
    if (result.data.records.length > 0) {
        var dateOutput = result.data.records[0]['sc_zzfcard.date_checkin'];
        for (var i = 0; i < result.data.records.length; i++) {
            var dateCheckin = result.data.records[i]['sc_zzfcard.date_checkin'];
            if (dateOutput > dateCheckin) {
                dateOutput = dateCheckin;
            }
        }
        return dateOutput;
    }
    else {
        return '';
    }
}
function getTotalTime(identity, lastDate){
    var parameters = {
        tableName: 'sc_zzfcard',
        fieldNames: toJSON(['sc_zzfcard.date_checkin', 'sc_zzfcard.date_checkout_actual', 'card_status']),
        restriction: "sc_zzfcard.identi_code ='" + identity + "' and sc_zzfcard.card_status in ('yrz','yxq','ytz')"
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var dataList = [];
    if (result.data.records.length > 0) {
        var totalTime = 0;
        for (var i = 0; i < result.data.records.length; i++) {
            var record = result.data.records[i];
            var dateCheckIn = record['sc_zzfcard.date_checkin'];
            var dateCheckoutActual = record['sc_zzfcard.date_checkout_actual'];
            if (record['sc_zzfcard.card_status'] == '已退租') {
                totalTime += getTotalMonth(dateCheckIn, dateCheckoutActual);
            }
            else {
                totalTime += getTotalMonth(dateCheckIn, lastDate);
            }
        }
        return totalTime;
    }
    else {
        return 0;
    }
}
function afterSelectEmInfo(fieldName, selectedValue, previousValue){
	var form = View.panels.get('emInfoPanel');
	
    if (fieldName == 'sc_zzfcard.sex') {
        dealWith('emInfoPanel', fieldName, selectedValue);
        return false;
    }
    if (fieldName == 'sc_zzfcard.marriage_stat') {
        dealWith('emInfoPanel', fieldName, selectedValue);
        return false;
    }
    if (fieldName == 'sc_zzfcard.is_working_parents') {
    	dealWith('emInfoPanel', fieldName, selectedValue);
    	return false;
    }
    if (fieldName == 'sc_zzfcard.xueli') {
        dealWith('emInfoPanel', fieldName, selectedValue);
        return false;
    }
    
}
function dealWith(panelId, fieldName, selectedValue){
    var panel = View.panels.get(panelId);
    var listOptions = panel.getFieldElement(fieldName);
    
    if (typeof listOptions == 'undefined' || !listOptions) 
        return;
    
    var nCount = listOptions.options.length;
    for (var nIdx = 0; nIdx < nCount; nIdx++) {
        var optionsValue = listOptions.options[nIdx].innerHTML;
        if (optionsValue == selectedValue) {
            listOptions.selectedIndex = nIdx;
            break;
        }
    }
}
function getOneEndDate(date, n){
    var month = 12 - n % 12;
    dateOutPut = nMonthLater(date, month);
    var later = ieDateFormat(dateOutPut);
    var datea = new Date(later);
    return dateOutPut = getPrevMonthLastDay(datea);
}

function getTwoBeginDate(date, n){
    var month = 12 - n % 12;
    dateOutPut = nMonthLater(date, month);
    var later = ieDateFormat(dateOutPut);
    return dateOutPut = monthStartDate(new Date(later));
}
function autoCalcMonthRent(fieldName, newValue, oldValue){
	var currentRentRat=0;
	if(fieldName=="sc_zzfcard.curr_rent_rate"){
		currentRentRat=newValue;
		zzfEmpoyeeController.onClickRmNode(currentRentRat);
	}
	if(fieldName=="sc_zzfcard.rent_type"){
		dealWith('leaseInfoPanel', fieldName, newValue);
        return false;
	}
}
