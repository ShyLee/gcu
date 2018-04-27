var abChangePaymentController = View.createController("abChangePaymentController", {
	afterInitialDataFetch:function(){
	   this.editPanel.show(false);
	},
	//payment_notes 1;从自缴到代扣;2;从代扣到自缴
    changePaymentTo: function(){
        var payment = this.editPanel.getFieldValue('sc_zzf_payment.new_payment');
        if (payment == 'finance') {
            this.editPanel.setFieldValue('sc_zzf_payment.rent_period_new', 'Month');
            this.editPanel.setFieldValue('sc_zzf_payment.payment_notes', '从自缴到代扣');
            jQuery('#editPanel_sc_zzf_payment\\.rent_period_new').attr('disabled', 'disabled');
        }
        else {
            this.editPanel.setFieldValue('sc_zzf_payment.payment_notes', '从代扣到自缴');
            jQuery('#editPanel_sc_zzf_payment\\.rent_period_new').attr('disabled', false);
        }
    },
	gridPanel_onChange:function(){
		var	selectedIndex=this.gridPanel.selectedRowIndex;
		var row=this.gridPanel.rows[selectedIndex];
		var card_id=row["sc_zzfcard.card_id.key"];
		var em_name=row["sc_zzfcard.em_name"];
		var dv_name=row["sc_zzfcard.dv_name"];
		var date_payrent_last=row["sc_zzfcard.date_payrent_last"];
		var oldPaymentTo=row["sc_zzfcard.payment_to.raw"];
		var currentDate = ASBT_getCurrentDate_Client();
		var emId=View.user.employee.id;
		var emName=ASBT_GetEmName(emId);
		this.editPanel.refresh([],true);
		this.editPanelDoc.show(false);
		this.editPanel.setFieldValue("sc_zzf_payment.card_id",card_id);
		this.editPanel.setFieldValue("sc_zzf_payment.request_name",em_name);
		this.editPanel.setFieldValue("sc_zzf_payment.old_payment",oldPaymentTo);
		this.editPanel.setFieldValue("sc_zzf_payment.date_change",currentDate);
		this.editPanel.setFieldValue("sc_zzf_payment.handle_name",emName);
		this.editPanel.setFieldValue("sc_zzf_payment.date_payrent_last",date_payrent_last);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause('sc_zzf_payment.card_id',card_id,'=');
		this.changeLogPanel.refresh(restriction);
	},
	editPanel_onSave:function(){
		var old_payment=this.editPanel.getFieldValue("sc_zzf_payment.old_payment");
		var new_payment=this.editPanel.getFieldValue("sc_zzf_payment.new_payment");
		var rent_period_new=this.editPanel.getFieldValue("sc_zzf_payment.rent_period_new");
		var date_payment_new=this.editPanel.getFieldValue("sc_zzf_payment.date_payment_new");
		var date_payrent_last=this.editPanel.getFieldValue("sc_zzf_payment.date_payrent_last");
		
		var date_change=this.editPanel.getFieldValue("sc_zzf_payment.date_change");
		var payment_notes=this.editPanel.getFieldValue("sc_zzf_payment.payment_notes");
		var money_need=this.editPanel.getFieldValue("sc_zzf_payment.money_need");
		var card_id=this.editPanel.getFieldValue("sc_zzf_payment.card_id");
		if(new_payment==""){
			View.showMessage("请选择变更后-缴费方式！");
			return;
		}
		var notes="在"+date_change+"变更了缴费方式："+payment_notes+",新的缴费开始日期："+date_payment_new+",在这之前需要缴清金额："+money_need+"元";
		if(this.editPanel.canSave()){
			if(old_payment!=new_payment){
				var success=this.editPanel.save();
				var success=true;
				var id1 = this.editPanel.getFieldValue("sc_zzf_payment.id");
				var resId = new Ab.view.Restriction();
				resId.addClause("sc_zzf_payment.id",id1);
				this.editPanelDoc.refresh(resId);
				if(success){
					var restriction=new Ab.view.Restriction();
					restriction.addClause('sc_zzfcard.card_id',card_id,'=');
					
					var account=View.dataSources.get('sc_zzfcard_ds');
					var record=account.getRecord(restriction);
					record.setValue('sc_zzfcard.payment_chg_id',id1);
					record.setValue('sc_zzfcard.date_payment_chg',date_payment_new);
					record.setValue('sc_zzfcard.payment_change',notes);
					//在费用没有缴清之前不变更缴费方式
					if(date_payrent_last<date_payment_new){
					}else{
						record.setValue('sc_zzfcard.payment_to',new_payment);
					}
					account.saveRecord(record);
					this.gridPanel.refresh();
					this.changeLogPanel.refresh();
				}
			}else{
				View.showMessage("缴费方式没有变化，请重新选择！");
				return;
			}
		}
	}
});