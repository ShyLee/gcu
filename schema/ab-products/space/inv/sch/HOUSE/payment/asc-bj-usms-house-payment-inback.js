var abPaymentInbackController = View.createController("abPaymentInbackController", {
	afterInitialDataFetch:function(){
	   this.editPanel.show(false);
	},
	gridPanel_onInback:function(){
		this.inbackType();
		var	selectedIndex=this.gridPanel.selectedRowIndex;
		var row=this.gridPanel.rows[selectedIndex];
		var card_id=row["sc_zzfcard.card_id"];
		var em_id=row["sc_zzfcard.em_id"];
		var em_name=row["sc_zzfcard.em_name"];
		var dv_name=row["sc_zzfcard.dv_name"];
		var payment_to=row["sc_zzfcard.payment_to"];
		var month_rent=row["sc_zzfcard.desposit_payoff.raw"];
		var cash_clean=row["sc_zzfcard.cash_clean"];
		var bl_id=row["sc_zzfcard.bl_id"];
		var bl_name=row["bl.name"];
		var unit_code=row["sc_zzfcard.unit_code"];
		var fl_id=row["sc_zzfcard.fl_id"];
		var rm_id=row["sc_zzfcard.rm_id"];
		var date_checkin=row["sc_zzfcard.date_checkin"];
		var date_checkout_ought=row["sc_zzfcard.date_checkout_ought"];
		var date_payrent_last=row["sc_zzfcard.date_payrent_last"];
		
		var currentDate = ASBT_getCurrentDate_Client();
		var emId=View.user.employee.id;
		var emName=ASBT_GetEmName(emId);
		this.editPanel.refresh([],true);
		this.editPanel.setFieldValue("sc_zzfrent_inback.card_id",card_id);
		this.editPanel.setFieldValue("sc_zzfcard.date_checkin",date_checkin);
		this.editPanel.setFieldValue("sc_zzfcard.date_checkout_ought",date_checkout_ought);
		this.editPanel.setFieldValue("sc_zzfcard.date_payrent_last",date_payrent_last);
		this.editPanel.setFieldValue("sc_zzfrent_inback.em_id",em_id);
		this.editPanel.setFieldValue("sc_zzfrent_inback.em_name",em_name);
		this.editPanel.setFieldValue("sc_zzfrent_inback.dv_id",dv_name);
		this.editPanel.setFieldValue("sc_zzfrent_inback.bl_id",bl_id);
		this.editPanel.setFieldValue("bl.name",bl_name);
		this.editPanel.setFieldValue("sc_zzfrent_inback.unit_code",unit_code);
		this.editPanel.setFieldValue("sc_zzfrent_inback.fl_id",fl_id);
		this.editPanel.setFieldValue("sc_zzfrent_inback.rm_id",rm_id);
		this.editPanel.setFieldValue("sc_zzfrent_inback.pay_name",em_name);
		
		this.editPanel.setFieldValue("sc_zzfrent_inback.date_change",currentDate);
		this.editPanel.setFieldValue("sc_zzfrent_inback.handle_em_id",emId);
		this.editPanel.setFieldValue("sc_zzfrent_inback.handle_em_name",emName);
		this.editPanel.setFieldValue("sc_zzfrent_inback.month_rent",month_rent);
		this.editPanel.setFieldValue("sc_zzfrent_inback.cash_clean",cash_clean);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause('sc_zzfrent_inback.card_id',card_id,'=');
		this.changeLogPanel.refresh(restriction);
	},
	editPanel_onSave:function(){
		var card_id=this.editPanel.getFieldValue("sc_zzfrent_inback.card_id");
//		var need_cash_clean=this.editPanel.getFieldValue("sc_zzf_payment.need_cash_clean");
		var need_month_rent=this.editPanel.getFieldValue("sc_zzfrent_inback.need_month_rent");

		if(this.editPanel.canSave()){
			var controller=this;
		    var confirmMessage="确定要保存吗?";
		    View.confirm(confirmMessage, function(button){
	        if (button == 'yes') {
	             try {
	            	if(parseInt(need_month_rent)>0){
	            		controller.editPanel.setFieldValue("sc_zzfrent_inback.inback_name","房租");
	            	}
	     			var success=controller.editPanel.save();
					if(success){
						//保存完成之后  需要更新到缴费明细表中吗？
//						var restriction=new Ab.view.Restriction();
//						restriction.addClause('sc_zzfcard.card_id',card_id,'=');
//						
//						var account=View.dataSources.get('sc_zzfcard_ds');
//						var record=account.getRecord(restriction);
//						record.setValue('sc_zzfcard.payment_to',new_payment);
//						account.saveRecord(record);
						
						controller.changeLogPanel.refresh();
					}
	             }catch(e){
	              View.showMessage(e.message);
	                 return;
	             }
	            }
		    });
		}
	},
	editPanel_onPaymmentBack:function(){
		var inbackNo=this.editPanel.getFieldValue("sc_zzfrent_inback.id");
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,{
            width: 470,
            height: 200,
            xmlName: "housePayBack",
            parameters: {
                'aInbackNo':inbackNo
            },
            closeButton: false
        });
	},
	
	inbackType : function(){
		var inbackType = this.editPanel.getFieldValue("sc_zzfrent_inback.inback_type");
		if(inbackType=='0'){
			this.editPanel.getFieldElement("sc_zzfrent_inback.date_change").disabled=true;
			
		}
		
		if(inbackType=='1'){
			this.editPanel.getFieldElement("sc_zzfrent_inback.date_change").disabled=false;
			
		}
		
	}
});
function autoCleanRent(){
	var inBackPanel = View.panels.get("editPanel");
	
	var cash_clean=inBackPanel.getFieldValue("sc_zzfrent_inback.cash_clean");
//	var month_rent=inBackPanel.getFieldValue("sc_zzfrent_inback.month_rent");
	
	var actual_cash_clean=inBackPanel.getFieldValue("sc_zzfrent_inback.actual_cash_clean");
//	var actual_month_rent=inBackPanel.getFieldValue("sc_zzfrent_inback.actual_month_rent");
	
	var need_cash_clean=(actual_cash_clean-cash_clean).toFixed(2);
//	var need_month_rent=(actual_month_rent-month_rent).toFixed(2);
	
	inBackPanel.setFieldValue("sc_zzfrent_inback.need_cash_clean",need_cash_clean);
//	inBackPanel.setFieldValue("sc_zzfrent_inback.need_month_rent",need_month_rent);
	
}
function autoMonthRent(){
	var inBackPanel = View.panels.get("editPanel");
	
//	var cash_clean=inBackPanel.getFieldValue("sc_zzfrent_inback.cash_clean");
	var month_rent=inBackPanel.getFieldValue("sc_zzfrent_inback.month_rent");
	
//	var actual_cash_clean=inBackPanel.getFieldValue("sc_zzfrent_inback.actual_cash_clean");
	var actual_month_rent=inBackPanel.getFieldValue("sc_zzfrent_inback.actual_month_rent");
	
//	var need_cash_clean=(actual_cash_clean-cash_clean).toFixed(2);
	var need_month_rent=(actual_month_rent-month_rent).toFixed(2);
	
//	inBackPanel.setFieldValue("sc_zzfrent_inback.need_cash_clean",need_cash_clean);
	inBackPanel.setFieldValue("sc_zzfrent_inback.need_month_rent",need_month_rent);
	
}
