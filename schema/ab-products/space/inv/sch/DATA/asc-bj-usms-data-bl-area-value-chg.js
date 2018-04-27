var abDataBlMngtChgController = View.createController('abDataBlMngtChgController',{
	
	tsBlGrid_afterRefresh: function(){
		this.tsBlGrid.enableSelectAll(false);
		this.selectedRow = null;
	},
	tsBlConsole_onShow: function(){
		var blId = this.tsBlConsole.getFieldValue('bl.bl_id');
		var blName = this.tsBlConsole.getFieldValue('bl.name');
		var res = new Ab.view.Restriction();
		if(blId != ""){
			res.addClause('bl.bl_id', blId, '=');
		}
		if(blName != ""){
			res.addClause('bl.name', blName, '=');
		}
		this.tsBlGrid.refresh(res,false);
	},
	tsBlGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	tsBlGrid_onChange: function(){
		
		if(this.selectedRow != null){
			var blId = this.selectedRow.getFieldValue('bl.bl_id');
			var blName = this.selectedRow.getFieldValue('bl.name');
			var area_building_manual = this.selectedRow.getFieldValue('bl.area_building_manual');
			var value_book = this.selectedRow.getFieldValue('bl.value_market');
			var res = new Ab.view.Restriction();
    		res.addClause('sc_bl_value_chg.bl_id', blId, '=');
			View.openDialog('asc-bj-usms-data-bl-area-value-chg-dialog.axvw', res, true, {
			        width: 800,
			        height: 600,
			        bl_id: blId,
			        bl_name: blName,
			        area: area_building_manual,
			        value: value_book,
			        openerController: abDataBlMngtChgController,
			        flag: 'change', //传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
			        closeButton: false
			});
		}else{
			View.showMessage(getMessage('wrongNoSelectRow'));
		}
	},
	tsBlGrid_onCheack: function(){
		
		if(this.selectedRow != null){
			var blId = this.selectedRow.getFieldValue('bl.bl_id');
			var blName = this.selectedRow.getFieldValue('bl.name');
			var area_building_manual = this.selectedRow.getFieldValue('bl.area_building_manual');
			var value_book = this.selectedRow.getFieldValue('bl.value_book');
			var res = new Ab.view.Restriction();
    		res.addClause('sc_bl_value_chg.bl_id', blId, '=');
			View.openDialog('asc-bj-usms-data-bl-area-value-chg-dialog.axvw', res, true, {
			        width: 800,
			        height: 600,
			        bl_id: blId,
			        bl_name: blName,
			        area: area_building_manual,
			        value: value_book,
			        openerController: abDataBlMngtChgController,
			        flag: 'history', //传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
			        closeButton: false
			});
		}else{
			View.openDialog('asc-bj-usms-data-bl-area-value-chg-dialog.axvw', null, true, {
		        width: 800,
		        height: 600,
		        flag: 'building',
		        closeButton: false
		});
		}
	}
});