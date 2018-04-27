//(function(){
//    jQuery("#leaseInfoPanel_sc_zzfcard\\.date_checkin").addClass("defWidth");
//    jQuery("#leaseInfoPanel_sc_zzfcard\\.date_first_pay").addClass("defWidth");
//})()

var zzfEmpoyeeController = View.createController('zzfEmpoyeeController', {

    tabs: null,
    
    afterViewLoad: function(){
        this.bl_tree.addParameter("rmType", " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeFlDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeRmDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
    },
    
    afterInitialDataFetch: function(){
    	this.leaseInfoPanel.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
        this.emInfoPanel.refresh([], true);
        this.leaseInfoPanel.refresh([], true);
        this.checkInPanel.refresh([], true);
        this.emInfoPanel.actions.get('printProtocol').enable(false);
        this.emInfoPanel.actions.get('printProtocolSafe').enable(false);
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
//    setNewRoomdates: function(){
//        var today = new Date();
//        var startDay = monthStartDate(today);
//        this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_checkin', today);
//        this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_first_pay', startDay);
//        var dateCheckin = this.leaseInfoPanel.getFieldValue('sc_zzfcard.date_checkin');
//        //dateCheckin = new Date(dateCheckin);
//        var dateCheckout = nYearsLaterSameDay(dateCheckin, '3');
//        this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
//    },
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.leaseInfoPanel.getFieldValue('sc_zzfcard.date_checkin');
//        var identity = this.emInfoPanel.getFieldValue('sc_zzfcard.identi_code');
//        if (dateCheckin) {
//            var dateTotalUse = getTotalTime(identity, dateCheckin);
//            this.emInfoPanel.setFieldValue('sc_zzfcard.total_rent_all', dateTotalUse);
//        }
//        var startDay = monthStartStr(dateCheckin);
        var startDay = dateCheckin;
        this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_checkin', startDay);
        this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.leaseInfoPanel.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    onClickRmNode: function(curr_rent_rate){
    	var isCardId = this.emInfoPanel.getFieldValue("sc_zzfcard.card_id");
    	if(isCardId!=''){
    		this.emInfoPanel.refresh([],true);
    		this.emInfoPanel.actions.get('save').enable(true);
    		this.emInfoPanel.actions.get('printProtocol').enable(false);
    		this.emInfoPanel.actions.get('printProtocolSafe').enable(false);
    	}
        var currentNode = this.bl_tree.lastNodeClicked;
        if(currentNode==null){
        	View.showMessage("请先选择一个房间！");
        	return;
        }else{
        	var blId = currentNode.data['rm.bl_id'];
        	var flId = currentNode.data['rm.fl_id'];
        	var rmId = currentNode.data['rm.rm_id'];
        	res1 = new Ab.view.Restriction();
        	res1.addClause('rm.bl_id', blId);
        	res1.addClause('rm.fl_id', flId);
        	res1.addClause('rm.rm_id', rmId);
        	this.rmInfoPanel.refresh(res1, false);
        	
        	//2015.06.29 zhangyan
        	//1、添加计费面积到sc_zzfcard
        	var area_jf=this.rmInfoPanel.getFieldValue("rm.area_lease");
        	this.leaseInfoPanel.setFieldValue("sc_zzfcard.area_lease",area_jf);
        	
        	//2、计算租住比列 ;;1;1;2;1/2;3;1/3;4;1/4;5;1/5;6;1/6;7;1/7;8;1/8;
        	var yzlzys=parseInt(this.rmInfoPanel.getFieldValue("rm.count_house_yz"))+1;
        	var rentRateValue="1/"+yzlzys;
        	var rentRate="1";
        	if(rentRateValue=="1"){
        		rentRate="1";
        	}else if(rentRateValue=="1/2"){
        		rentRate="2";
        	}else if(rentRateValue=="1/3"){
        		rentRate="3";
        	}else if(rentRateValue=="1/4"){
        		rentRate="4";
        	}else if(rentRateValue=="1/5"){
        		rentRate="5";
        	}
        	this.leaseInfoPanel.setFieldValue("sc_zzfcard.rent_rate",rentRate);
        	
        	//3、计算每月租金
        	var is_left=this.rmInfoPanel.getFieldValue("rm.is_left");
        	var is_low_high=this.rmInfoPanel.getFieldValue("rm.is_low_high");
        	
        	//计算月租金用两种方法：1、按面积：月租金=面积*计费面积 ；2、按床位：月租金=单价
        	//rent_type 0;按面积;1;按床位
        	var rent_type=this.leaseInfoPanel.getFieldValue("sc_zzfcard.rent_type");
        	if(!valueExistsNotEmpty(curr_rent_rate)){
        		curr_rent_rate=this.leaseInfoPanel.getFieldValue("sc_zzfcard.curr_rent_rate");
        	}       	
        	var rent_month2=0;
        	if(rent_type=="0"){
        		rent_month2=curr_rent_rate*area_jf;
        	}else{
        		rent_month2=curr_rent_rate;
        	}
        	var rent_month =parseFloat(rent_month2).toFixed(2);
        	this.leaseInfoPanel.setFieldValue("sc_zzfcard.desposit_payoff",rent_month);
        }
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
        //获取合同编号
        try {
	 		result = Workflow.callMethod('AbMyExtension01-UpdateOfficeService-getLeaseId');
	 	}
	 	catch (e) {
	 		Workflow.handleError(e);
	 		View.showMessage("获取合同编号出错，请联系管理员");
	 		return;
	 	}
	 	if(result.code == 'executed'){
	 		this.leaseInfoPanel.setFieldValue('sc_zzfcard.lease_id',result.message);
	 	}
        //判断房间可租户数
        var permit = this.rmInfoPanel.getFieldValue('rm.count_house_kz');
        if(permit<1){
        	View.showMessage("可租户数不够，请重新选择入住房间或者定义设计户数！");
			return;
        }else{
        	var controller=this;
        	View.confirm("确定要登记入住信息吗？入住信息登记后不可修改，请确认！",function(button){
        		if(button== "yes"){
        			//1、存入新的房间协议
        			controller.emInfoPanel.save();
        			var inputYear = jQuery('#checkout').val();
        			var htqx = '';
        			if (inputYear != '') {
        				htqx = inputYear + '年';
        			}
        			var panel1=controller.rmInfoPanel;
        			var blId = panel1.getFieldValue('rm.bl_id');
        			var flId = panel1.getFieldValue('rm.fl_id');
        			var rmId = panel1.getFieldValue('rm.rm_id');
        			//2、更新房间、合同、登记数据
        			var cardId = controller.emInfoPanel.getFieldValue('sc_zzfcard.card_id');
        			var res1 = new Ab.view.Restriction();
        			res1.addClause('sc_zzfcard.card_id', cardId);
        			var record1 = controller.sc_zzfcardDataSource.getRecord(res1);
//		        record1.setValue('sc_zzfcard.site_id', );
//		        record1.setValue('sc_zzfcard.pr_id', );
        			record1.setValue('sc_zzfcard.bl_id', blId);
        			record1.setValue('sc_zzfcard.unit_code', panel1.getFieldValue('rm.unit_code'));
        			record1.setValue('sc_zzfcard.fl_id', flId);
        			record1.setValue('sc_zzfcard.rm_id', rmId);
        			record1.setValue('sc_zzfcard.rm_cat', panel1.getFieldValue('rm.rm_cat'));
        			record1.setValue('sc_zzfcard.rmcat_name', panel1.getFieldValue('rm.rmcat_name'));
        			record1.setValue('rm_type', panel1.getFieldValue('rm.rm_type'));
        			record1.setValue('sc_zzfcard.rmtype_name', panel1.getFieldValue('rm.rmtype_name'));
        			record1.setValue('sc_zzfcard.is_left', panel1.getFieldValue('rm.is_left'));
        			record1.setValue('sc_zzfcard.is_low_high', panel1.getFieldValue('rm.is_low_high'));
        			record1.setValue('sc_zzfcard.huxing', panel1.getFieldValue('rm.huxing'));
        			record1.setValue('sc_zzfcard.chaoxiang', panel1.getFieldValue('rm.chaoxiang'));
        			record1.setValue('sc_zzfcard.area_comn_rm', panel1.getFieldValue('rm.area_comn_rm'));
        			record1.setValue('sc_zzfcard.eq_desc', panel1.getFieldValue('rm.eq_desc'));
        			record1.setValue('sc_zzfcard.weixiu_log', panel1.getFieldValue('rm.weixiu_log'));
        			
        			var panel2=controller.leaseInfoPanel;
        			record1.setValue('sc_zzfcard.htqx', htqx);
        			var date_first_pay=panel2.getFieldValue('sc_zzfcard.date_first_pay')
        			record1.setValue('sc_zzfcard.lease_id', panel2.getFieldValue('sc_zzfcard.lease_id'));
        			record1.setValue('sc_zzfcard.date_checkin', panel2.getFieldValue('sc_zzfcard.date_checkin'));
        			record1.setValue('sc_zzfcard.date_first_pay',date_first_pay);
        			record1.setValue('sc_zzfcard.date_payrent_last', date_first_pay);
        			record1.setValue('sc_zzfcard.date_checkout_ought', panel2.getFieldValue('sc_zzfcard.date_checkout_ought'));
        			record1.setValue('sc_zzfcard.payment_to', panel2.getFieldValue('sc_zzfcard.payment_to'));
        			record1.setValue('sc_zzfcard.rent_period', panel2.getFieldValue('sc_zzfcard.rent_period'));
        			record1.setValue('sc_zzfcard.is_day_first', panel2.getFieldValue('sc_zzfcard.is_day_first'));
        			record1.setValue('sc_zzfcard.rent_rate', panel2.getFieldValue('sc_zzfcard.rent_rate'));
        			record1.setValue('sc_zzfcard.cash_deposit', panel2.getFieldValue('sc_zzfcard.cash_deposit'));
        			record1.setValue('sc_zzfcard.rent_type', panel2.getFieldValue('sc_zzfcard.rent_type'));
        			record1.setValue('sc_zzfcard.rent_level', panel2.getFieldValue('sc_zzfcard.rent_level'));
        			record1.setValue('sc_zzfcard.curr_rent_rate', panel2.getFieldValue('sc_zzfcard.curr_rent_rate'));
        			record1.setValue('sc_zzfcard.area_lease', panel2.getFieldValue('sc_zzfcard.area_lease'));
        			record1.setValue('sc_zzfcard.desposit_payoff', panel2.getFieldValue('sc_zzfcard.desposit_payoff'));
        			record1.setValue('sc_zzfcard.rent_pay_id', panel2.getFieldValue('sc_zzfcard.rent_pay_id'));
        			record1.setValue('sc_zzfcard.rent_pay_people', panel2.getFieldValue('sc_zzfcard.rent_pay_people'));
        			record1.setValue('sc_zzfcard.cash_clean', panel2.getFieldValue('sc_zzfcard.cash_clean'));
        			record1.setValue('sc_zzfcard.clean_people_id', panel2.getFieldValue('sc_zzfcard.clean_people_id'));
        			record1.setValue('sc_zzfcard.clean_pay_people', panel2.getFieldValue('sc_zzfcard.clean_pay_people'));
        			record1.setValue('sc_zzfcard.sponsor', panel2.getFieldValue('sc_zzfcard.sponsor'));
        			record1.setValue('sc_zzfcard.sponsor_name', panel2.getFieldValue('sc_zzfcard.sponsor_name'));
        			record1.setValue('sc_zzfcard.sponsor_dv', panel2.getFieldValue('sc_zzfcard.sponsor_dv'));
        			record1.setValue('sc_zzfcard.lease_id', result.message);
        			
        			var panel3=controller.checkInPanel;
        			record1.setValue('sc_zzfcard.key_checkin', panel3.getFieldValue('sc_zzfcard.key_checkin'));
        			record1.setValue('sc_zzfcard.rmsrc_situation', panel3.getFieldValue('sc_zzfcard.rmsrc_situation'));
        			record1.setValue('sc_zzfcard.comment_checkin', panel3.getFieldValue('sc_zzfcard.comment_checkin'));
        			
        			
        			record1.setValue('sc_zzfcard.card_status', 'yrz');
        			controller.sc_zzfcardDataSource.saveRecord(record1);
        			
        			//3、更新房间的可租户数、已租户数
        			var permit = controller.rmInfoPanel.getFieldValue('rm.count_house_kz');
        			var permitNum = Number(permit)-Number(1);
        			controller.rmInfoPanel.setFieldValue('rm.count_house_kz', permitNum);
        			var source = controller.rmInfoPanel.getFieldValue('rm.count_house_yz');
        			var rentedNums = Number(source) + Number(1);
        			controller.rmInfoPanel.setFieldValue('rm.count_house_yz', rentedNums);
        			controller.rmInfoPanel.save();
        			
        			View.showMessage('入住成功！');
        			controller.checkInPanel.refresh(res1,false);
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
        }
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
    changeIsNotChangZu:function(){
    	var is_day_first = this.leaseInfoPanel.getFieldValue("sc_zzfcard.is_day_first");
    	if(is_day_first=='1'){
    		this.leaseInfoPanel.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = false;
    		this.leaseInfoPanel.getFieldElement('sc_zzfcard.payment_to').disabled = true;
    		this.changeCheckin();
    	}else{
    		this.leaseInfoPanel.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
    		this.leaseInfoPanel.getFieldElement('sc_zzfcard.payment_to').disabled = false;
    		this.changeCheckin();
    	}
    	
    },
    //打印报表
    emInfoPanel_onIreport:function(){
    	var card_Id = this.emInfoPanel.getFieldValue("sc_zzfcard.card_id");
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
              width: 470,
              height: 200,
              xmlName: "asc-bj-rpt-zzf-cont-simple",//报表名称
              parameters: {     
                 'CARD_ID':card_Id 
             },
              closeButton: false
        });
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
