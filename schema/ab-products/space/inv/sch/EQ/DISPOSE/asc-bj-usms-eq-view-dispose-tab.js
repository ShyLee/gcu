var controller=View.createController('SearchReturnListForm',{
	requestConsole_onBtnFilter: function(){
		var id=this.requestConsole.getFieldValue('return_dispose.rtr_dip_id');
		var dvId=this.requestConsole.getFieldValue('return_dispose.dv_id');
		var dateFrom=this.requestConsole.getFieldValue('return_dispose.datePurchasedFrom');
		var dateTo=this.requestConsole.getFieldValue('return_dispose.datePurchasedTo');
		var eqId=this.requestConsole.getFieldValue('return_dispose.rtr_doc');
		
		var filterRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(id)){
			filterRes.addClause('return_dispose.rtr_dip_id',id,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			filterRes.addClause('return_dispose.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(dateFrom)){
			filterRes.addClause('return_dispose.date_request',dateFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateTo)){
			filterRes.addClause('return_dispose.date_request',dateTo,'&lt;=');
		}
		if (valueExistsNotEmpty(eqId)) {
			this.returnEqGrid.addParameter('eqId', " exists(select 1 from eq_change where eq_change.rtr_dip_id=return_dispose.rtr_dip_id and eq_id='"+eqId+"')");
		}else {
			this.returnEqGrid.addParameter('eqId', " 1=1");
		}
		this.returnEqGrid.refresh(filterRes);
	},
	/**
     * 查看设备附件列表
     */
    returnListGrid_onViewAttach:function(){
    	var selectIndex=this.returnListGrid.selectedRowIndex;
		var eqId=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
        
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.is_dispose','0','=');
		this.eqAttachPanel.refresh(res,false);
		this.eqAttachPanel.setTitle("设备【"+eqId+"】附件列表");
		this.eqAttachPanel.showInWindow({
		      x:150,
		      y:200,
		      width: 900,
		      height: 400
		 });
    },
	requestConsole_onBtnCancel: function(){
		this.requestConsole.clear();
		this.returnEqGrid.restriction=null;
		this.returnEqGrid.refresh("");
	},
	
	showEqCard: function(){
		var selectIndex=this.returnListGrid.selectedRowIndex;
		var eq_id=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
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
	rtRes.addClause('eq_change.rtr_dip_id',rtId);
	var returnListGrid=View.panels.get('returnListGrid');
	returnListGrid.show(true);
	returnListGrid.refresh(rtRes);
}