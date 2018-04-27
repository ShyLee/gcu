var controller = View.createController('abOnDemandCfWrUpdateController',{
	woRecords : {},
	
	wo_report_afterRefresh: function(){
		if(parseInt(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']) != 0){
			this.wo_report.selectAll(true);
			var wo_rows = this.wo_report.getPrimaryKeysForSelectedRows();
			
			//KB3036931 - only call WFR when the grid is not empty
			if(wo_rows.length>0){
				var result = {};
				try {
					 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkWoCfSubstitutes',wo_rows);
				} catch (e) {
					Workflow.handleError(e);
				}
				if(result.code == 'executed'){
					this.woRecords = eval('('+result.jsonExpression+')');
					
					this.wo_report.gridRows.each(function(row) {
						
						// get wr.status for this row
						var woId = row.getRecord().getValue('wo.wo_id');
						for(var j=0;j<controller.woRecords.length;j++){
							if(controller.woRecords[j] == woId){
								color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
								Ext.get(row.dom).setStyle('background-color', color);
								break;
							}
						}
					});
					
					
				} else {
					Workflow.handleError(result);
				}
			}		
			
			var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
			this.wo_report.setInstructions(instructions);
			this.wo_report.selectAll(false);
		}
	}
});

function selectAllRecords() {
	var grid = AFM.view.View.getControl('', 'wr_report');
	var selectedRows = grid.setAllRowsSelected();
}
function unselectAllRecords() {
	var grid = AFM.view.View.getControl('', 'wr_report');
	var unselectedRows = grid.setAllRowsSelected(false);
}