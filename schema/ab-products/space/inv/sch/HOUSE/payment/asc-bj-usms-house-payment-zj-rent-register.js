var ascBjUsmsHousePaymentRentRegister = View.createController('ascBjUsmsHousePaymentRentRegister', {
	afterInitialDataFetch:function(){
		this.showPaymentInfo(true);
	},
	codeConsole_onShow : function() {
		var identicode=this.codeConsole.getFieldValue("sc_zzfcard.identi_code");
		var emid=this.codeConsole.getFieldValue("sc_zzfcard.em_id");
		var emname=this.codeConsole.getFieldValue("sc_zzfcard.em_name");
		var year=this.codeConsole.getFieldValue("sc_zzfrent_details.year");
		var restriction = new Ab.view.Restriction();
		
		if(valueExistsNotEmpty(identicode)){
			restriction.addClause("sc_zzfcard.identi_code",identicode+"%",'like');
		}
		if(valueExistsNotEmpty(emid)){
			restriction.addClause("sc_zzfcard.em_id",emid+"%",'like');
		}
		if(valueExistsNotEmpty(emname)){
			restriction.addClause("sc_zzfcard.em_name",emname+"%",'like');
		}
		if(valueExistsNotEmpty(year)){
			var restrictionDetail = new Ab.view.Restriction();
			restrictionDetail.addClause("sc_zzfrent_details.year",year,'=');
			var accountRecord=View.dataSources.get("scZzfrentDetailsHistoryDs").getRecords(restrictionDetail);
			
			if(accountRecord!=""){
				var account=this.getRestrictionDetail(accountRecord);
				if(account!=""){
					restriction.addClause('sc_zzfcard.card_id',account,'IN');
				}
				else{
					restriction.addClause('sc_zzfcard.card_id',null,'IS NULL');
				}
			}
		}
		this.emGrid.refresh(restriction);
	},
	
	getRestrictionDetail:function(accountRecord){
	   	 var restriction = new Ab.view.Restriction();
	       var mainIds=[];
			for(var i=0;i<accountRecord.length;i++){
				var mainId=accountRecord[i].getValue("sc_zzfrent_details.card_id");
				if(valueExistsNotEmpty(mainId)){
					mainIds.push(mainId);
				}
			}
			return mainIds;
    },
    emGrid_payment_onClick:function(row){
    	var cardId=row.record["sc_zzfcard.card_id"];
		var controller=this;
		
		var date_checkout_ought=row.record["sc_zzfcard.date_checkout_ought"];
		var date_payrent_last=row.record["sc_zzfcard.date_payrent_last"];
		
		if(date_checkout_ought==date_payrent_last){
			View.alert("该用户房租费用已全部交完!");
			return;
		}
		
    	View.openDialog("asc-bj-usms-house-payment-zj-rent-register-dialog.axvw",null,false,{
			width:900,
			height:620,
			cardId:cardId,
			afterViewLoad:function(dialogView){
				var dialogController=dialogView.controllers.get("dialogController");
				dialogController.onClose=controller.formPanel_onClose.createDelegate(controller);
				}
		});
    },
	formPanel_onClose:function(){
		this.emGrid.refresh();
		this.mainInfoGrid.refresh();
		this.detailInfoGrid.refresh();
		View.alert("缴费成功!");
	},
	showPaymentInfo : function(autoShow) {
		var length = this.emGrid.rows.length;
		if(length>0){
			var panel = this.emGrid;
			var selectedIndex="-1";
			if(autoShow){
				selectedIndex="0";
			}else{
				selectedIndex=panel.selectedRowIndex;
			}
		}
		if(length>0)
			var cardId = panel.rows[selectedIndex]["sc_zzfcard.card_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_zzfrent_details.card_id", cardId, "=");
		this.mainInfoGrid.refresh(restriction);
		this.detailInfoGrid.refresh(restriction);
	}
});
Array.prototype.in_array = function(e)  
{  
	for(i=0;i<this.length && this[i]!=e;i++);  
	return !(i==this.length);  
} 
