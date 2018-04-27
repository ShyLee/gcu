var controller = View.createController('eqview', {
	showEqCard: function(){
		var selectIndex=this.eq_checkGridPanel.selectedRowIndex;
		var selectRecord=this.eq_checkGridPanel.gridRows.get(selectIndex).getRecord();
		var eq_id = selectRecord.getValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id,
        	closeButton: false
        });
	},
	showEqAttachCard: function(){
		var selectIndex=this.eqAttach_checkGridPanel.selectedRowIndex;
		var selectRecord=this.eqAttach_checkGridPanel.gridRows.get(selectIndex).getRecord();
		var eq_id = selectRecord.getValue("eq_check_attach.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id,
        	closeButton: false
        });
	}

});

function showDoc(value){
	View.panels.get('docPanel').refresh(value.restriction);
	View.panels.get('docPanel').show(true);
	View.panels.get('docPanel').showInWindow({
        width: 400,
        height: 170
    });
}