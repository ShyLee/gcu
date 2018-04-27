/**
 * Parcelland XiaZhang 
 */
var ascBjUsmsDataParcellandOutAcc = View.createController('ascBjUsmsDataParcellandOutAcc', {
	curXZland_code:null,
	parcellandGrid_afterRefresh: function(){
		this.parcellandGrid.enableSelectAll(false);
	},
	parcellandGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	parcellandGrid_onXiaZhang: function(){
		if(this.selectedRow != null){
			var land_code = this.selectedRow.getFieldValue('sc_parcelland.land_code');
			var res = new Ab.view.Restriction();
			var thisController = this;
			res.addClause('sc_parcelland_xz.land_code' , land_code , '=');
			this.curXZland_code = land_code;
			View.openDialog('asc-bj-usms-data-parcelland-xiazhang-wd.axvw' , res , true,{
				width: 600,
                height: 450,
                landCode:land_code,
				openerController:ascBjUsmsDataParcellandOutAcc,
                closeButton: false
			});
		}else{
			View.showMessage(getMessage('xizhang'));
		}
	
    },
	dialog_onClose: function(){
        this.updateSc_parcelland();
		this.refreshAfterXiaZhang();
    },
	refreshAfterXiaZhang:function(){
		var formPanel = View.panels.get('parcellandGrid');
		this.parcellandGrid.refresh("1=1");
		View.showMessage("宗地：[" + this.curXZland_code + "] 已被移至下账表，下账成功!");
	},
	/*
	 * change sc_parcelland.accouted value to 'N'
	 * */
	updateSc_parcelland:function(){
		restriction = new Ab.view.Restriction;
	    
	    restriction.addClause('sc_parcelland.land_code', this.curXZland_code, '=');
		record = this.parcellandDs.getRecord(restriction);
    	record.setValue('sc_parcelland.accounted', 'N'); 
		this.parcellandDs.saveRecord(record);
    }
});