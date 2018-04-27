var controller=View.createController('SearchReturnListForm',{
	
	requestConsole_onBtnFilter: function(){
		var id=this.requestConsole.getFieldValue('return_dispose.rtr_dip_id');
		var dvId=this.requestConsole.getFieldValue('return_dispose.dv_id');
		var date=this.requestConsole.getFieldValue('return_dispose.date_request');
		
		var filterRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(id)){
			filterRes.addClause('return_dispose.rtr_dip_id',id,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			filterRes.addClause('return_dispose.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(date)){
			filterRes.addClause('return_dispose.date_request',date,'=');
		}
		this.returnEqGrid.refresh(filterRes);
		if(this.returnEqGrid.gridRows.length<1){
			this.returnListGrid.show(false);
		}
	},
	requestConsole_onBtnCancel: function(){
		this.requestConsole.clear();
		this.returnEqGrid.restriction=null;
		this.returnEqGrid.refresh("");
	},
	
	showEqCard: function(){
		var selectIndex=this.returnListGrid.selectedRowIndex;
		var eq_id=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_attach_change.eq_id');
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	}
});

function showReturnListPanel(row){
	var rtId=row.restriction["return_dispose.rtr_dip_id"];
	var rtRes=new Ab.view.Restriction();
	rtRes.addClause('eq_attach_change.rtr_dip_id',rtId);
	var returnListGrid=View.panels.get('returnListGrid');
	returnListGrid.show(true);
	returnListGrid.refresh(rtRes);
}