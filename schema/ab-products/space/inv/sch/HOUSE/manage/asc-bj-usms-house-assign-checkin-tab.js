(function(){
    jQuery("#new_rm_detail_sc_zzfcard\\.date_checkin").addClass("defWidth");
    jQuery("#new_rm_detail_sc_zzfcard\\.date_first_pay").addClass("defWidth");
})()


var zzfEmpoyeeController = View.createController('zzfEmpoyeeController', {

    tabs: null,
    //cardId: null,
    
    afterViewLoad: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.cardId = this.tabs.cardId;
        //教工周转房rm_type='30301'
//        this.site_tree.addParameter('rmType', " rm_type in ("+houseConstantControl.HOUSR_RM_TYPES+")");
//        this.treePrDS.addParameter('rmType', " rm_type in ("+houseConstantControl.HOUSR_RM_TYPES+")");
        this.bl_tree.addParameter("rmType1", " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeFlDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeRmDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        
		document.getElementById("require_reply").checked = false;
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
    },
    
    afterInitialDataFetch: function(){
//        var restriction = new Ab.view.Restriction();
//        restriction.addClause('sc_zzfcard.card_id', this.cardId, '=');
//        this.applicant_info.refresh(restriction, false);
//    	this.treeBlDS.addParameter("rmType", " rm_type in "+houseConstantControl.HOUSR_RM_TYPES+")";
    	this.new_rm_detail.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
        this.applicant_info.refresh([], true);
        this.setNewRoomdates();
        this.showHistory();
//        this.changeCheckin();
        this.applicant_info.actions.get('ireport').enable(false);
    },
    
    onBack: function(){
        var tabName = 'detailTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
        tab.loadView();
        tab.show(true);
    },
    
    changePaymentTo: function(){
        var payment = this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to');
        if (payment == 'finance') {
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            this.new_rm_detail.setFieldValue('sc_zzfcard.is_day_first', '2');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
            jQuery('#new_rm_detail_sc_zzfcard\\.is_day_first').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
            jQuery('#new_rm_detail_sc_zzfcard\\.is_day_first').attr('disabled', false);
        }
    },
    
    setNewRoomdates: function(){
        var today = new Date();
        var startDay = monthStartDate(today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkin', today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var dateCheckout = nYearsLaterSameDay(dateCheckin, '3');
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
    },
    
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        if (dateCheckin) {
            var dateTotalUse = getTotalTime(identity, dateCheckin);
            this.applicant_info.setFieldValue('sc_zzfcard.total_rent_all', dateTotalUse);
        }
        //dateCheckin = new Date(dateCheckin);
        var startDay = monthStartStr(dateCheckin);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
//        if (this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last')) {
//            lastDate = getPrevMonthLastDay(new Date(dateCheckin));
//            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
//        }
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
        this.calcActionRent();
    },
    
    showHistory: function(){
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        //计算员工租房总月数
        var emDateCheckin = getEmCheckinDate(identity);
        this.applicant_info.setFieldValue('sc_zzfcard.date_checkin_first', emDateCheckin);
        //刷新现在正在租住的房间信息
        var lastDate = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        if (lastDate) {
            var dateTotalUse = getTotalTime(identity, lastDate);
            this.applicant_info.setFieldValue('sc_zzfcard.total_rent_all', dateTotalUse);
            lastDate = getPrevMonthLastDay(new Date(lastDate));
        }
        var res2 = new Ab.view.Restriction();
        var term2 = ['yrz', 'yxq'];
        res2.addClause('sc_zzfcard.identi_code', identity, '=');
        res2.addClause('sc_zzfcard.card_status', term2, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res2);
        if (records.length > 0) {
//            this.used_rm_detail.refresh(res2, false);
//            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
//            this.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
//            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
        }
        else {
//            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
//            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', false);
//            this.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
//            this.used_rm_detail.enableField('sc_zzfcard.ttqx', false);
        }
        this.calcActionRent();
    },
    
    calcActionRent: function(){
        var dateLimit = "2012-07-01";
        var totalRentMonth = this.applicant_info.getFieldValue('sc_zzfcard.total_rent_all');
        var dateComein = this.applicant_info.getFieldValue('sc_zzfcard.date_work_begin');
        var checkinTime = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        checkinTime1 = new Date(checkinTime);
        var checkoutOught = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        checkoutOught1 = new Date(checkoutOught);
        if (!dateCompare(dateComein, dateLimit)) {
            if (totalRentMonth == 0 || totalRentMonth == 12 || totalRentMonth == 24 || totalRentMonth >= 36) {
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', checkoutOught);
                if (totalRentMonth == 0) {
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '60');
                }
                else 
                    if (totalRentMonth == 12) {
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '70');
                    }
                    else 
                        if (totalRentMonth == 24) {
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '80');
                        }
                        else 
                            if (totalRentMonth >= 36) {
                                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '100');
                            }
            }
            else {
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', getOneEndDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_begin', getTwoBeginDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_end', checkoutOught);
                if (totalRentMonth > 0 && totalRentMonth <= 12) {
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 60);
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 70);
                }
                else 
                    if (totalRentMonth > 12 && totalRentMonth <= 24) {
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 70);
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 80);
                    }
                    else 
                        if (totalRentMonth > 24 && totalRentMonth <= 36) {
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 80);
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 100);
                        }
            }
        }
        else {
			//View.showMessage("员工于2012-7-1前入校，累计租住时间未满36个月时，使用成本租金计算房租，超过36个月时，使用市场租金计算房租");
            if (totalRentMonth == 0 || totalRentMonth == 12 || totalRentMonth == 24 || totalRentMonth >= 36) {
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', checkoutOught);
            }
            else {
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', getOneEndDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_begin', getTwoBeginDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_end', checkoutOught);
            }
        }
    },
    
    onClickRmNode: function(){
    	var isCardId = this.applicant_info.getFieldValue("sc_zzfcard.card_id");
    	if(isCardId!=''){
    		this.applicant_info.refresh([],true);
    		this.applicant_info.actions.get('save').enable(true);
    		this.applicant_info.actions.get('ireport').enable(false);
    	}
        var currentNode = this.bl_tree.lastNodeClicked;
        var blId = currentNode.data['rm.bl_id'];
        var flId = currentNode.data['rm.fl_id'];
        var rmId = currentNode.data['rm.rm_id'];
        res1 = new Ab.view.Restriction();
        res1.addClause('rm.bl_id', blId);
        res1.addClause('rm.fl_id', flId);
        res1.addClause('rm.rm_id', rmId);
        this.rm_detail.refresh(res1, false);
        
        //2015.06.29 zhangyan
        //1、添加计费面积到sc_zzfcard
        var area_jf=this.rm_detail.getFieldValue("rm.hd_area");
        this.new_rm_detail.setFieldValue("sc_zzfcard.area_lease",area_jf);
        
        //2、计算租住比列 ;;1;1;2;1/2;3;1/3;4;1/4;5;1/5;6;1/6;7;1/7;8;1/8;
        var yzlzys=parseInt(this.rm_detail.getFieldValue("rm.yzlzys"))+1;
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
        this.new_rm_detail.setFieldValue("sc_zzfcard.rent_rate",rentRate);
        
        //3、计算每月租金
        var construction_type=this.rm_detail.getFieldValue("rm.construction_type");
        var is_left=this.rm_detail.getFieldValue("rm.is_left");
        var is_low_high=this.rm_detail.getFieldValue("rm.is_low_high");
        
        //建筑结构是否是“框架”结构 ;;N/A;未知;01010000;混合;01010200;砖木;01010300;砖石;01010400;木结构;01010500;钢筋混凝土;01010600;框架结构;01010700;钢结构;01020000;室外构筑物;QT;其他
        var area_construction=0;
        if(construction_type=="01010600"){
        	area_construction=2*area_jf;
        }
        
        //有无电梯 ;;1;有;2;无
        var area_left=0;
        if(is_left=="1"){
        	area_left=2*area_jf;
        }
        
        //是一顶楼 ;;1;是;2;否
        var area_Low=0;
        if(is_low_high=="1"){
        	area_Low=2*area_jf;
        }
        //
        var curr_rent_rate=this.new_rm_detail.getFieldValue("sc_zzfcard.curr_rent_rate");
        var rent_month2=curr_rent_rate*area_jf+area_construction+area_left-area_Low;
        var rent_month =  rent_month2.toFixed(2);
        this.new_rm_detail.setFieldValue("sc_zzfcard.desposit_payoff",rent_month);
         
    },
    
    applicant_info_onSave: function(){
		//未选房间提醒
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间！');
            return;
        }
		//未填入住日期提醒
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        if (!dateCheckin) {
            View.showMessage('请选择入住日期！');
            return;
        }
        
        //申请人姓名不能为空
        var cashDeposit = this.applicant_info.getFieldValue('sc_zzfcard.em_name');
        if(!cashDeposit){
        	View.showMessage("申请人【姓名】不能为空！");
        	return;
        }

        
        
		var area = this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease');
        if (parseFloat(area) == 0) {
            View.showMessage('请输入计费面积，且不能为0！');
            return;
        }
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
		//选择别人代缴却没有填写代缴人提醒
		var checked = document.getElementById("require_reply").checked;
		var daijiaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.djfr');
		if(checked==true && daijiaoren==''){
			View.showMessage('请选择代缴人');
            return;
		}
		
		
		View.confirm("确定要登记入住信息吗？【入住信息登记后不可修改，请确认信息后登记入住！】",function(button){
	            if(button== "yes"){
		        //修改未腾退房间协议信息
		        var res = new Ab.view.Restriction();
		        var term = ['yrz', 'yxq'];
		        res.addClause('sc_zzfcard.identi_code', identity, '=');
		        res.addClause('sc_zzfcard.card_status', term, 'IN');
		        var record = zzfEmpoyeeController.sc_zzfcardDataSource.getRecord(res);
		        if (record != '') {
		//            var dateLast = this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last');
		//            var ttqx = this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx');
		//            if (!dateLast || !ttqx) {
		//                View.showMessage('请填写停缴时间和腾退期限');
		//                return;
		//            }
		//            record.setValue('sc_zzfcard.date_payrent_last', this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last'));
		//            record.setValue('sc_zzfcard.ttqx', this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx'));
		//            this.sc_zzfcardDataSource.saveRecord(record);
		        }
		        
		        
		        //存入新的房间协议
		        zzfEmpoyeeController.applicant_info.save();
		        var inputYear = jQuery('#checkout').val();
		        var htqx = '';
		        if (inputYear != '') {
		            htqx = inputYear + '年';
		        }
		        var cardId = zzfEmpoyeeController.applicant_info.getFieldValue('sc_zzfcard.card_id');
		        var blId = zzfEmpoyeeController.rm_detail.getFieldValue('rm.bl_id');
		        var flId = zzfEmpoyeeController.rm_detail.getFieldValue('rm.fl_id');
		        var rmId = zzfEmpoyeeController.rm_detail.getFieldValue('rm.rm_id');
		        var locationRm = zzfEmpoyeeController.rm_detail.getFieldValue('rm.location');
		        var res1 = new Ab.view.Restriction();
		        res1.addClause('sc_zzfcard.card_id', cardId);
		        var record1 = zzfEmpoyeeController.sc_zzfcardDataSource.getRecord(res1);
		        record1.setValue('sc_zzfcard.bl_id', blId);
		        record1.setValue('sc_zzfcard.fl_id', flId);
		        record1.setValue('sc_zzfcard.rm_id', rmId);
		        record1.setValue('sc_zzfcard.location', locationRm);
		        record1.setValue('sc_zzfcard.huxing', zzfEmpoyeeController.rm_detail.getFieldValue('rm.huxing'));
		        record1.setValue('sc_zzfcard.rm_type', zzfEmpoyeeController.rm_detail.getFieldValue('rm.rm_type'));
		        record1.setValue('sc_zzfcard.date_checkin', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin'));
		        record1.setValue('sc_zzfcard.date_payrent_last', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin'));
		        record1.setValue('sc_zzfcard.date_checkout_ought', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
		        record1.setValue('sc_zzfcard.date_first_pay', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.date_first_pay'));
		        record1.setValue('sc_zzfcard.payment_to', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.payment_to'));
		        record1.setValue('sc_zzfcard.rent_period', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.rent_period'));
		        record1.setValue('sc_zzfcard.cash_deposit', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.cash_deposit'));
		        record1.setValue('sc_zzfcard.desposit_payoff', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.desposit_payoff'));
		        record1.setValue('sc_zzfcard.area_lease', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.area_lease'));
		        record1.setValue('sc_zzfcard.is_day_first', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.is_day_first'));
		        record1.setValue('sc_zzfcard.rent_rate', zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.rent_rate'));
		        record1.setValue('sc_zzfcard.card_status', 'yrz');
		        //card_type（登记类型）：0;周转房(在校职工);1;周转房(外来人员);2;博士后公寓
		        record1.setValue('sc_zzfcard.card_type', zzfEmpoyeeController.applicant_info.getFieldValue("sc_zzfcard.card_type"));
		        //合同期限
		        record1.setValue('sc_zzfcard.htqx', htqx);
		        zzfEmpoyeeController.sc_zzfcardDataSource.saveRecord(record1);
		        
		        //更新房间的可租赁资源数
		        var res2 = new Ab.view.Restriction();
		        res2.addClause('rm.bl_id', blId);
		        res2.addClause('rm.fl_id', flId);
		        res2.addClause('rm.rm_id', rmId);
		        zzfEmpoyeeController.rm_detail.refresh(res2);
		        var permit = zzfEmpoyeeController.rm_detail.getFieldValue('rm.kzlzys');
		        //添加页面判断，可租赁资源不足不可以输入资源
		        if(permit<=0){
		        	View.showMessage("可租赁资源不足，请重新选择入住房间或者定义租赁资源数量！");
		        	return;
		        }else{
			        var permitNum = Number(permit)-Number(1);
			        zzfEmpoyeeController.rm_detail.setFieldValue('rm.kzlzys', permitNum);
			        var source = zzfEmpoyeeController.rm_detail.getFieldValue('rm.yzlzys');
			        var rentedNums = Number(source) + Number(1);
			        zzfEmpoyeeController.rm_detail.setFieldValue('rm.yzlzys', rentedNums);
			        zzfEmpoyeeController.rm_detail.save();
		        }
		
				View.showMessage('入住成功！');
				zzfEmpoyeeController.applicant_info.actions.get('save').enable(false);
				zzfEmpoyeeController.applicant_info.actions.get('ireport').enable(true);
        
	          }
	    });
    },
    
    new_rm_detail_onUploadFile: function(){
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        if (cardId != '') {
            var restriction = new Ab.view.Restriction();
            restriction.addClause("sc_zzfcard.card_id", cardId, '=');
            this.upload_file.refresh(restriction);
            this.upload_file.showInWindow({
                title: "附件上传",
                x: 800,
                y: 200,
                width: 500,
                height: 260,
                closeButton: false
            });
        }
        else {
            View.showMessage("保存协议后再进行附件上传");
        }
    },
    
    selectDaikouPerson: function(){
        if (document.getElementById("require_reply").checked) {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').show();
			this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'finance');
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.payment_to').attr('disabled', 'disabled');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
			this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'house');
			jQuery('#new_rm_detail_sc_zzfcard\\.payment_to').attr('disabled', false);
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    changeIsNotChangZu:function(){
    	var is_day_first = this.new_rm_detail.getFieldValue("sc_zzfcard.is_day_first");
    	if(is_day_first=='1'){
    		this.new_rm_detail.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = false;
    		this.new_rm_detail.getFieldElement('sc_zzfcard.payment_to').disabled = true;
    		this.changeCheckin();
    	}else{
    		this.new_rm_detail.getFieldElement('sc_zzfcard.date_checkout_ought').disabled = true;
    		this.new_rm_detail.getFieldElement('sc_zzfcard.payment_to').disabled = false;
    		this.changeCheckin();
    	}
    	
    },
    //打印报表
    applicant_info_onIreport:function(){
    	var card_Id = this.applicant_info.getFieldValue("sc_zzfcard.card_id");
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
              width: 470,
              height: 200,
              xmlName: "asc-bj-rpt-zzf-cont-simple",//报表名称
              parameters: {     
                 'CARD_ID':card_Id 
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
	var form = View.panels.get('applicant_info');
	
    if (fieldName == 'sc_zzfcard.sex') {
        dealWith('applicant_info', fieldName, selectedValue);
        return false;
    }
    if (fieldName == 'sc_zzfcard.marriage_stat') {
        dealWith('applicant_info', fieldName, selectedValue);
        return false;
    }
    if (fieldName == 'sc_zzfcard.is_working_parents') {
    	dealWith('applicant_info', fieldName, selectedValue);
    	return false;
    }
    if (fieldName == 'sc_zzfcard.xueli') {
        dealWith('applicant_info', fieldName, selectedValue);
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
