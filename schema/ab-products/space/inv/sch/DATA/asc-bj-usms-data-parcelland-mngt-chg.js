var abDataParcellandMngtChgController = View.createController('abDataParcellandMngtChgController',{
	
	tsParcellandGrid_afterRefresh: function(){
		this.tsParcellandGrid.enableSelectAll(false);
		this.selectedRow = null;
	},
	tsParcellandGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	tsParcellandGrid_onChange: function(){
		
		if(this.selectedRow != null){
			var landCode = this.selectedRow.getFieldValue('sc_parcelland.land_code');
			var parcellandAddress = this.selectedRow.getFieldValue('sc_parcelland.parcelland_address');
			var areaTudi = this.selectedRow.getFieldValue('sc_parcelland.area_tudi');
			var valueBook = this.selectedRow.getFieldValue('sc_parcelland.value_book');
			/*var res = new Ab.view.Restriction();
    		res.addClause('sc_land_change.land_code', landCode, '=');*/
			View.openDialog('asc-bj-usms-data-parcelland-area-value-chg-dialog.axvw', null, true, {
			        width: 800,
			        height: 600,
			        land_code: landCode,
			        parcelland_address: parcellandAddress,
			        area: areaTudi,
			        value: valueBook,
			        openerController: abDataParcellandMngtChgController,
			        flag: 'change', //传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
			        closeButton: false
			});
		}else{
			View.showMessage(getMessage('wrongNoSelectRow'));
		}
	},
	tsParcellandGrid_onCheack: function(){
		
		if(this.selectedRow != null){
			var landCode = this.selectedRow.getFieldValue('sc_parcelland.land_code');
			var parcellandAddress = this.selectedRow.getFieldValue('sc_parcelland.parcelland_address');
			var areaTudi = this.selectedRow.getFieldValue('sc_parcelland.area_tudi');
			var valueBook = this.selectedRow.getFieldValue('sc_parcelland.value_book');
			var res = new Ab.view.Restriction();
    		res.addClause('sc_land_change.land_code', landCode, '=');
			View.openDialog('asc-bj-usms-data-parcelland-area-value-chg-dialog.axvw', res, true, {
			        width: 800,
			        height: 600,
			        land_code: landCode,
			        parcelland_address: parcellandAddress,
			        area: areaTudi,
			        value: valueBook,
			        openerController: abDataParcellandMngtChgController,
			        flag: 'history', //传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
			        closeButton: false
			});
		}else{
			View.showMessage(getMessage('wrongNoSelectRow'));
		}
	}
});