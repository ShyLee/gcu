var controller=View.createController('controller',{
	eqListPanel_eq_id_onClick: function(row){
		var eqId=row.getRecord().getValue('eq_change.eq_id');
		View.openDialog("asc-bj-usms-eq-adjust-public-view.axvw", null, false, {
			x:150,
			y:200,
			width: 900,
        	height: 600,
        	eq_id: eqId,
        	closeButton: false
        });
	}
});