var checkoutController = View.createController("checkoutController", {
	checkDetail: function(){
		  var grid = View.panels.get('sc_zzfCardListPanel');
		  var selecteRow = grid.rows[grid.selectedRowIndex];
		    
		  var card_type = selecteRow['sc_zzfcard.card_type'];
		  var card_id = selecteRow['sc_zzfcard.card_id'];
			  View.openDialog("asc-bj-usms-house-check-out-dialog.axvw", null, false,{
				  title:'房屋租赁-租住详细',
				  width:1000,
				  height:800,
				  cardId:card_id,
				  closeButton: false});
						
//		  }else if(card_type == '周转房(外来人员)'){//1;周转房(外来人员)
//			  View.openDialog("asc-bj-usms-proc-house-check-out-detail-outside-dialog.axvw", null, false,{
//				  title:'房屋租赁-租住详细',
//				  width:1000,
//				  height:800,
//				  cardId:card_id,
//				  closeButton: false});
//		  }else if(card_type == '博士后公寓'){//2;博士后公寓
//			  View.openDialog("asc-bj-usms-proc-house-check-out-detail-boshi-dialog.axvw", null, false,{
//				  title:'房屋租赁-租住详细',
//				  width:1000,
//				  height:800,
//				  cardId:card_id,
//				  closeButton: false});
//		  }
	},
	consolePanel_onFilter: function(){
		var date_checkin_from = this.consolePanel.getFieldValue("date_checkin_from");
    	var date_checkin_to = this.consolePanel.getFieldValue("date_checkin_to");
    	var date_checkout_ought_from = this.consolePanel.getFieldValue("date_checkout_ought_from");
    	var date_checkout_ought_to = this.consolePanel.getFieldValue("date_checkout_ought_to");
    	var bl_name = this.consolePanel.getFieldValue("bl.name");
    	var em_name = this.consolePanel.getFieldValue("sc_zzfcard.em_name");
    	
    	var restriction = new Ab.view.Restriction();
    	if(valueExistsNotEmpty(date_checkin_from)){
    		restriction.addClause("sc_zzfcard.date_checkin", date_checkin_from, "&gt;=");
    	}
    	if(valueExistsNotEmpty(date_checkin_to)){
    		restriction.addClause("sc_zzfcard.date_checkin", date_checkin_to, "&lt;=");
    	}
    	if(valueExistsNotEmpty(date_checkin_from) && valueExistsNotEmpty(date_checkin_to)){
    		if(new Date(formatDate(date_checkin_from)).getTime() > new Date(formatDate(date_checkin_to)).getTime()){
        		View.showMessage("入住起始时间不能大于截止时间");
        		return;
        	}
    	}
    	
    	if(valueExistsNotEmpty(date_checkout_ought_from)){
    		restriction.addClause("sc_zzfcard.date_checkout_ought", date_checkout_ought_from, "&gt;=");
    	}
    	if(valueExistsNotEmpty(date_checkout_ought_to)){
    		restriction.addClause("sc_zzfcard.date_checkout_ought", date_checkout_ought_to, "&lt;=");
    	}
    	if(valueExistsNotEmpty(date_checkout_ought_from) && valueExistsNotEmpty(date_checkout_ought_to)){
    		if(new Date(formatDate(date_checkout_ought_from)).getTime() > new Date(formatDate(date_checkout_ought_to)).getTime()){
        		View.showMessage("应退起始时间不能大于截止时间");
        		return;
        	}
    	}
    	if(valueExistsNotEmpty(bl_name)){
    		restriction.addClause("bl.name", "%"+bl_name+"%", "like");
    	}
    	if(valueExistsNotEmpty(em_name)){
    		restriction.addClause("sc_zzfcard.em_name", "%"+em_name+"%", "like");
    	}
    	
        this.sc_zzfCardListPanel.refresh(restriction);
	},
	showDetail:function(){	
		var grid =this.sc_zzfCardListPanel;	
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    var card_id= selectedRow["sc_zzfcard.card_id"];
		View.openDialog('asc-bj-usms-house-card.axvw', null, true, {
            width: 880,
            height: 600,
            card_id:card_id,
            closeButton: false
        });
	 },
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		this.sc_zzfCardListPanel.refreshClearAllFilters();
	},
	checkOut: function(){
		  var grid = View.panels.get('sc_zzfCardListPanel');
		  var selecteRow = grid.rows[grid.selectedRowIndex];
		    
		  var card_type = selecteRow['sc_zzfcard.card_type'];
		  var card_id = selecteRow['sc_zzfcard.card_id'];
		  var em_name = selecteRow['sc_zzfcard.em_name'];
		  
		  View.openDialog("asc-bj-usms-house-check-out-dialog.axvw", null, false,{
			  title:em_name+'-退住卡片',
			  width:1000,
			  height:800,
			  cardId:card_id,
			  cardType:card_type,
			  parentController:checkoutController,
			  closeButton: false});
	},
	
	/**
	 * 返回 教职工的累积住宿月数
	 * 
	 * */
	getInDaysByEmId: function(em_id){
		var months = 0;
		var restriction = "sc_zzfcard.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.total_rent']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        for(var i = 0; i < result.data.records.length; i++) {
        	months += parseInt(result.data.records[i]['sc_zzfcard.total_rent']);
        }
        return months;
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

