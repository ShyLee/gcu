
var SearchReturnController=View.createController('SearchReturnController',{
	maker:null,
	requestConsole_onBtnFilter: function(){
		var id=this.requestConsole.getFieldValue('return_dispose.rtr_dip_id');
		var dvId=this.requestConsole.getFieldValue('return_dispose.dv_id');
		var date=this.requestConsole.getFieldValue('return_dispose.date_request');
		var eqId=this.requestConsole.getFieldValue('return_dispose.rtr_doc');
		
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
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			eqId:eqId
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
	},
	//生成报表
	returnListGrid_onBtnPrintImport:function(){
		
		var rtrDipId = this.maker;
		
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "gcu-eq-dispose",
            
            parameters: {
                 'RTR_DIP_ID':rtrDipId,
                 'subReports':"gcu-eq-dispose-attach"
            },
            closeButton: false
        });
	}
	
	/*showReturnListPanel:function(){
		
	}*/
	
});

function showReturnListPanel(row){
	var rtId=row.restriction["return_dispose.rtr_dip_id"];
	var rtRes=new Ab.view.Restriction();
	rtRes.addClause('eq_change.rtr_dip_id',rtId);
	var returnListGrid=View.panels.get('returnListGrid');
	returnListGrid.refresh(rtRes);
	SearchReturnController.maker = rtId;
	//alert(SearchReturnController.maker);
	
	
	var rtRes2=new Ab.view.Restriction();
	rtRes2.addClause('eq_attach_change.rtr_dip_id',rtId);
	var returnAttachListGrid=View.panels.get('returnAttachListGrid');
	returnAttachListGrid.refresh(rtRes2);
	
	
	
}