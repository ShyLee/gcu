/**
 * @author kevenxi
 */
var defineLocRMController = View.createController('defineLocationRM', {
	curXZBL:null,
	blDsGrid_afterRefresh: function(){
		this.blDsGrid.enableSelectAll(true);
	},
	blDsGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	 blDsGrid_onXiaZhang: function(){
		if(this.selectedRow != null){
			var blId = this.selectedRow.getFieldValue('bl.bl_id');
			var res = new Ab.view.Restriction();
			var thisController = this;
			res.addClause('sc_bl_xz.bl_id' , blId , '=');
			this.curXZBL=blId;
			View.openDialog('asc-bj-usms-data-bl-xiazhang-wd.axvw' , res , true,{
				width: 600,
                height: 450,
				bl_id:blId,
				openerController:defineLocRMController,
                closeButton: false,
				afterViewLoad: function(dialogView){
                        var dialogController = dialogView.controllers.get('ascBjUsmsDataBlXiazhangWd');
                        dialogController.onClose = thisController.dialog2_onClose.createDelegate(thisController);
				   }
			});
		}else{
			View.showMessage(getMessage('xizhang'));
		}
	
    },
	dialog2_onClose: function(dialogController){
        View.log('defineLocationRM');
		this.refreshAfterXiaZhang();
    },
	refreshAfterXiaZhang:function(){
		var formPanel = View.panels.get('blDsGrid');
		this.blDsGrid.refresh("1=1");
		View.showMessage("建筑物：[" + this.curXZBL + "] 已被移至下账表，下账成功!");
	},
	updateByManual:function(){
    	window.open("ab-single-job.axvw?ruleId=AbCommonResources-SpaceService-updateRoomAreaFromManualArea");
    }
});

