var abRplmBldgPropListController = View.createController('abRplmBldgPropList',{
	openerController:null,
	selectedRow:null,
	selectedId:null,
	selectedType:null,
	gridBuildingList_afterRefresh: function(){
		this.gridBuildingList.enableSelectAll(false);
	},
	gridBuildingList_onSave: function(){
		if(this.selectedRow == null){
			View.showMessage(getMessage('error_nobldgselected'));
			return;
		}
		this.openerController.itemId = this.selectedRow.getFieldValue('bl.bl_id');
		this.openerController.itemName = this.selectedRow.getFieldValue('bl.name');
		this.openerController.itemType = 'BUILDING';
		this.openerController.showSelection();
		View.closeThisDialog();
	},
	gridBuildingList_onCancel: function(){
		View.closeThisDialog();
	},
	restoreSelection:function(){
		if(this.selectedId != null && this.selectedType == 'BUILDING'){
			for(var i=0;i<this.gridBuildingList.gridRows.length;i++){
				if(this.gridBuildingList.gridRows.get(i).getFieldValue('bl.bl_id') == this.selectedId){
					this.selectedRow = this.gridBuildingList.gridRows.get(i);
					this.gridBuildingList.gridRows.get(i).select(true);
					break;
				}
			}
		}
	},
	gridBuildingList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	}
})
