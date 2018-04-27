var dialogController=View.createController('dialogController',{
	date_first_all:null,
	days_first_all:0,
	newPayLast_all:null,
	newPayLast1_all:null,
	days_duanzu:null,
	
	afterInitialDataFetch:function(){
		var cardId=this.view.parameters["cardId"];
		
	   	var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_zzfcard.card_id", cardId, "=");
    	this.addForm.refresh(restriction);
    	
    	this.paymentPanel.refresh([],true);
    	
    	//自动计算 起始年月、截止年月
    	var card_id=this.addForm.getFieldValue("sc_zzfcard.card_id");
    	var date_payrent_last=this.addForm.getFieldValue("sc_zzfcard.date_payrent_last");
    	var rent_period=this.addForm.getFieldValue("sc_zzfcard.rent_period");
    	var is_day_first=this.addForm.getFieldValue("sc_zzfcard.is_day_first");
    	
		var startYear=date_payrent_last.substring(0,4);
		var startMonth=date_payrent_last.substring(5,7);
		var startYearMonth=startYear+startMonth;
		
		var date_last_value = date_payrent_last.replace("-", "/").replace("-", "/");
		date_last_value = new Date(date_last_value);
		var date_last=date_last_value.getLastDateOfMonth();
		if(date_payrent_last==date_last.format0("YYYY-MM-dd")){
			startYearMonth=this.calculateYearMonth(startYearMonth,1);
		}
		
		var endtYearMonth=startYearMonth;
    	//Month;按月;Quarter;按季度;Halfyear;按半年;Year;按年
    	if(rent_period=="Month"){
    		endtYearMonth=startYearMonth;
		}
		if(rent_period=="Quarter"){
			endtYearMonth=this.calculateYearMonth(startYearMonth,2);
			
		}
		if(rent_period=="Halfyear"){
			endtYearMonth=this.calculateYearMonth(startYearMonth,5);
		}
		if(rent_period=="Year"){
			endtYearMonth=this.calculateYearMonth(startYearMonth,11);
		}
		
		this.paymentPanel.setFieldValue("sc_zzfrent.card_id",card_id);
		this.paymentPanel.setFieldValue("sc_zzfrent.yearmonth_start",startYearMonth);
		this.paymentPanel.setFieldValue("sc_zzfrent.yearmonth_end",endtYearMonth);
		//1;非自然月;2;自然月
		if(is_day_first=="2"){
			this.paymentPanel.setFieldValue("sc_zzfrent.is_day_first","2");
			this.paymentPanel.showField('sc_zzfrent.date_checkin_start',false);
			this.paymentPanel.showField('sc_zzfrent.date_checkin_end',false);
			this.paymentPanel.actions.get("calculate").enable(true);
		}
		if(is_day_first=="1"){
			this.paymentPanel.setFieldValue("sc_zzfrent.date_checkin_start",this.addForm.getFieldValue("sc_zzfcard.date_checkin"));
			this.paymentPanel.setFieldValue("sc_zzfrent.date_checkin_end",this.addForm.getFieldValue("sc_zzfcard.date_checkout_ought"));
			this.paymentPanel.showField('sc_zzfrent.yearmonth_start',false);
			this.paymentPanel.showField('sc_zzfrent.yearmonth_end',false);
			
			this.paymentPanel.actions.get("calculate").enable(false);
		}

		//没有缴费记录的，缴费年月设为 初始缴费时间的年月
    	var res = new Ab.view.Restriction();
		res.addClause("sc_zzfrent.card_id", cardId, "=");
		
		var date_checkin1=this.addForm.getFieldValue("sc_zzfcard.date_first_pay");
		var records = this.ZzfRentDs.getRecords(res);
		if(records.length==0){
			var startYear1=date_checkin1.substring(0,4);
			var startMonth1=date_checkin1.substring(5,7);
			var startYearMonth1=startYear1+startMonth1;
			
			this.paymentPanel.setFieldValue("sc_zzfrent.yearmonth_start",startYearMonth1);
			this.paymentPanel.setFieldValue("sc_zzfrent.yearmonth_end",startYearMonth1);
			
		}
		
		this.paymentPanel_onCalculate();
	},
	paymentPanel_onCalculate:function(){
		//is_day_first 1;非自然月;2;自然月
    	// 在这里需要注意一下：如果是非自然月，那么起缴月按照正常计算6-12到7-12是一个月
        // 如果自然月、财务代扣，那么就按照自然月计算，如果不满一个月的按天计算，每天房租=月房租/30
    	var monthRent=this.addForm.getFieldValue("sc_zzfcard.desposit_payoff");
//    	var dateCheckin=this.addForm.getFieldValue("sc_zzfcard.date_checkin");
    	var dateCheckin=this.addForm.getFieldValue("sc_zzfcard.date_first_pay");
    	var dateCheckout=this.addForm.getFieldValue("sc_zzfcard.date_checkout_ought");
    	var date_payrent_last=this.addForm.getFieldValue("sc_zzfcard.date_payrent_last");
    	
    	var dayFirst=this.paymentPanel.getFieldValue("sc_zzfrent.is_day_first");
    	var yearmonth_start=this.paymentPanel.getFieldValue("sc_zzfrent.yearmonth_start");
    	var yearmonth_end=this.paymentPanel.getFieldValue("sc_zzfrent.yearmonth_end");
    	var date_payrent_last1="";
    	if(dayFirst=="2"){
    		if(yearmonth_start==""){
	    		View.showMessage("起始年月不可以为空，请填写！");
	    	}else if(yearmonth_end==""){
	    		View.showMessage("截止年月不可以为空，请填写！");
	    	}
    		var date_checkin = dateCheckin.replace("-", "/").replace("-", "/");
    		date_checkin = new Date(date_checkin);
    		
    		var startYear2=dateCheckin.substring(0,4);
			var startMonth2=dateCheckin.substring(5,7);
			var startYearMonth2=startYear2+startMonth2;
    		
    		var yearmonth_current=yearmonth_start;
    		var notes="";
    		var totalRent=0;
    		if(startYearMonth2==yearmonth_start){
    			//计算起缴月份需要缴费的天数-房租第一个月缴费规则 
    			//1、获取当前月的第一天，如果当月第一天就是合同开始日期，则这个月按照整月计算；2、如果当月第一天不是合同开始日期，那么获取当前月的最后一天，3、根据合同开始日期，计算出需要缴费的天数
    			//计算起缴月份需要缴费的天数-房租最后一个月缴费规则 
    			//1、退房日期如果<=15 房租按天计算，如果>15，那么房租按照一个月计算。
    			var date_first=date_checkin.getFirstDateOfMonth();
    			this.date_first_all=date_first.format0("YYYY-MM-dd");
    			if(date_checkin.format0("YYYY-MM-dd")!=date_first.format0("YYYY-MM-dd")){
    				// dayFirst is_day_first 1;非自然月;2;自然月
    				if(dayFirst=="2"){
    					var dayRent=monthRent/30;
    					var dayRentTwo=dayRent.toFixed(2);
    					var date_last=date_checkin.getLastDateOfMonth();
    					var days = ((date_last.getTime() - date_checkin.getTime()) / 1000 / 60 / 60 / 24)+1;
    					this.days_first_all=days;
    					var firstMonthRent=days*dayRent;
    					firstMonthRent=firstMonthRent.toFixed(2); 
    					var note=yearmonth_start+"的房租为："+firstMonthRent+"元(其中房租="+dayRentTwo+"元/天,天数="+days+"天);";
    					notes=notes+note;
    					totalRent=parseFloat(totalRent)+parseFloat(firstMonthRent);
    					yearmonth_start=this.calculateYearMonth(yearmonth_start,1);
    				}
    			}
    		}
    		//计算每月房租 
    		while(yearmonth_start<=yearmonth_end){
    			var currentMonthRent=monthRent;
    			var note=yearmonth_start+"的房租为："+monthRent+"元;";
    			notes=notes+note;
    			totalRent=parseFloat(totalRent)+parseFloat(currentMonthRent);
    			
    			yearmonth_start=this.calculateYearMonth(yearmonth_start,1);
    			date_payrent_last=this.DateAdd("m",1,date_payrent_last);
    		}
    		
    		var newPayLast=yearmonth_end;
			if(dayFirst=="2"){
				var payDate=yearmonth_end.substring(0,4)+"-"+yearmonth_end.substring(4,6)+"-01";
				payDate = payDate.replace("-", "/").replace("-", "/");
				payDate = new Date(payDate);
				payDate=payDate.getLastDateOfMonth();
				newPayLast=payDate.format0("YYYY-MM-dd");
			}else{
				newPayLast=date_payrent_last.format0("YYYY-MM-dd");
			}
			
			var newPayLast1=date_payrent_last.format0("YYYY-MM-dd");
			newPayLast1=ABZF_getYearMonthDateByString(newPayLast1);
    		this.newPayLast_all=newPayLast;
    		this.newPayLast1_all=newPayLast1;
    		this.paymentPanel.setFieldValue("sc_zzfrent.need_rent",totalRent);
    		this.paymentPanel.setFieldValue("sc_zzfrent.actual_rent",totalRent);
    		notes="本次缴费总共："+totalRent+"元，房租缴至："+newPayLast+";房租详细信息："+notes;
    		this.paymentPanel.setFieldValue("sc_zzfrent.comments",notes);
    	}else if(dayFirst=="1"){
    		// 短租的，计算天数 和 租金 
    		var date_checkin = dateCheckin.replace("-", "/").replace("-", "/");
    		date_checkin = new Date(date_checkin);
    		
    		var date_checkout = dateCheckout.replace("-", "/").replace("-", "/");
    		date_checkout = new Date(date_checkout);
    		
    		var dayRent2=monthRent/30;
    		var dayRentTwo2=dayRent2.toFixed(2);
    		var days2 = ((date_checkout.getTime() - date_checkin.getTime()) / 1000 / 60 / 60 / 24)+1;
    		var monthRent2=days2*dayRent2;
    		monthRent2=monthRent2.toFixed(2);
    		this.days_duanzu=days2;
    		
    		var notes2= "房租租金为："+monthRent2+"元(其中房租="+dayRentTwo2+"元/天,天数="+days2+"天);(注：短租租金为一次性全部交完!)";
    		
    		this.paymentPanel.setFieldValue("sc_zzfrent.need_rent",monthRent2);
    		this.paymentPanel.setFieldValue("sc_zzfrent.actual_rent",monthRent2);
    		this.paymentPanel.setFieldValue("sc_zzfrent.comments",notes2);
    	}
    },
    calculateYearMonth:function(yearMonth,num){
		for(var i=1;i<=num;i++){
			var year=yearMonth.substring(0,4);
			var month=yearMonth.substring(4,6);
			if(month=="12"){
				month="01";
				year=parseInt(year)+1;
				yearMonth=year+month;
			}else{
				yearMonth=parseInt(yearMonth)+1+"";
			}
		}
		var newYearMonth=yearMonth;
		return newYearMonth;
		
    },
    DateAdd: function(interval,number,date){
    	var currentDay=new Date(date);
        switch(interval){
          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
          case "w" : currentDay.setDate(currentDay.getDate()-number);  break;
          case "d" : currentDay.setDate(date.getDate()+number);break;
        }
        return   currentDay;
    },
    paymentPanel_onSave:function(){
    	var need_rent = this.paymentPanel.getFieldValue("sc_zzfrent.need_rent");
    	var actual_rent = this.paymentPanel.getFieldValue("sc_zzfrent.actual_rent");
    	if(need_rent!=actual_rent){
    		View.alert("应缴金额与实缴金额不符！");
    		return;
    	}
    	
		var success=this.paymentPanel.save();
		
		var is_day_first=this.paymentPanel.getFieldValue("sc_zzfrent.is_day_first");
		var cardId=this.addForm.getFieldValue("sc_zzfcard.card_id");
		var rentId=this.paymentPanel.getFieldValue("sc_zzfrent.rent_id");
		var monthRent=this.addForm.getFieldValue("sc_zzfcard.desposit_payoff");
		if(success){
			if(is_day_first=="2"){
				var yearmonth_start=this.paymentPanel.getFieldValue("sc_zzfrent.yearmonth_start");
				var yearmonth_end=this.paymentPanel.getFieldValue("sc_zzfrent.yearmonth_end");
				
				var date_payrent_last=this.addForm.getFieldValue("sc_zzfcard.date_payrent_last");
				var payment_chg_id=this.addForm.getFieldValue("sc_zzfcard.payment_chg_id");
				var dateCheckinText=this.addForm.getFieldValue("sc_zzfcard.date_first_pay")
				dateCheckinText = new Date(dateCheckinText);
				var dateCheckin=dateCheckinText.format0("YYYY-MM-dd");
		        var result;
		        try {
		            result = Workflow.callMethod('AbMyExtension01-ZZFHandler-createPaymentLogByHouse',yearmonth_start,yearmonth_end,monthRent,dateCheckin,date_payrent_last,this.newPayLast_all,this.date_first_all,is_day_first,this.days_first_all,cardId,rentId,payment_chg_id,this.newPayLast1_all);
		        }catch (e) {
		            Workflow.handleError(e);
		            return ;
		        }
			}
			
			if(is_day_first=="1"){
				var dateStart = this.paymentPanel.getFieldValue("sc_zzfrent.date_first_pay");
				var dateEnd = this.paymentPanel.getFieldValue("sc_zzfrent.date_checkin_end");
				var comment = this.paymentPanel.getFieldValue("sc_zzfrent.comments");
				var result;
				
				try {
		            result = Workflow.callMethod('AbMyExtension01-ZZFHandler-createPaymentLogByDuanZuHouse',cardId,rentId,monthRent,dateStart,dateEnd,this.days_duanzu,is_day_first,comment);
		        }catch (e) {
		            Workflow.handleError(e);
		            return ;
		        }
			}
		        if (result.code == 'executed') {
		            if(this.onClose){
						this.onClose(this);
					}
					View.closeThisDialog();
		        }
		}
			
	},
	//检查入住表中有没有新的缴费日期：date_payment_chg，如果有值，说明缴费方式发生了变化,需要更新缴费方式、缴费周期、新的缴费日期
	UpdatePaymentByChange:function(){
		
	}
});