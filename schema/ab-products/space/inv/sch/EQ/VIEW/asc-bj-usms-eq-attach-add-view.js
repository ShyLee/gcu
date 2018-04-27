var controller=View.createController('SearchReturnListForm',{
	rtrId:"",
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
		this.returnListGrid.show(false);
	},
	
	//打印过以后通过传递报增单，将此报增单的状态转换为：已打印
	changePrintStatus: function(){
    	var role=View.user.role;
    	
    	var panel = this.returnListGrid;
    	var returnEqId = panel.rows[0]["eq_change.rtr_dip_id"];
    	
//    	var returnEqId="464";
    	//只有当用户角色为"资产处管理员"时，才改变报增单的状态
    	if(role=='UNV EQ ADMIN'){
    		var returnEqDs=View.dataSources.get('ascBjUsmsReturnEqDs');
    		var returnEqRes=new Ab.view.Restriction();
    		returnEqRes.addClause('return_dispose.rtr_dip_id',returnEqId,'=');
    		var returnEqRecord=returnEqDs.getRecord(returnEqRes);
    		returnEqRecord.setValue('return_dispose.isDonePrint','1');
    		returnEqDs.saveRecord(returnEqRecord);
    		View.panels.get('returnListGrid').refresh();
    		View.alert('此追加单打印状态更改成功!');
    	}
//    	this.returnEqGrid.refresh();
    },
	
    //打印设备追加单
    printAddEq: function(){
    	var panel = this.returnListGrid;
    	var selectedIndex = panel.selectedRowIndex;
    	var returnEqId = panel.rows[selectedIndex]["eq_change.rtr_dip_id"];
    	var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];

    	var eqRecrdLength=this.checkAddEqNumById(returnEqId);
    	
    	if(!valueExistsNotEmpty(returnEqId)){
    		View.alert('此追加单不存在,无法打印');
    		return;
    	}else{
    		window.open("/archibus/schema/ab-products/htmlreport/returneqprintreport.jsp?xmlName=gcu-eq-add&RTR_DIP_ID="+returnEqId+"&EQ_ID="+eq_id+"&subReports=gcu-eq-add-subreport");
    		
    	}
    },
    //批量打印设备追加单
    returnListGrid_onBatchPrint: function(){
    	var selected=this.returnListGrid.getSelectedRows();
    	if (selected.length<1) {
    		View.alert('请选择要打印的追加单！');
			return;
		}
		var eqIds="(";
		for ( var i = 0; i < selected.length; i++) {
			if (i==selected.length-1) {
				eqIds+="'"+selected[i]['eq_change.eq_id']+"'";
			}else {
				eqIds+="'"+selected[i]['eq_change.eq_id']+"',";
			}
		}
		eqIds+=")";
    	var eqRecrdLength=this.checkAddEqNumById(this.rtrId);
    	if(!valueExistsNotEmpty(this.rtrId)){
    		View.alert('此追加单不存在,无法打印');
    		return;
    	}
    	generate('gcu-eq-attache-change-batch',{'RTR_DIP_ID':this.rtrId,'EQ_IDS':eqIds});
    },
    
    checkAddEqNumById: function(returnEqId){
    	var eqDs=View.dataSources.get('ascBjUsmsReturnEqCheckNumDs');
    	var res=new Ab.view.Restriction();
    	res.addClause('eq_change.rtr_dip_id',returnEqId,'=');
    	var eqRecords=eqDs.getRecords(res);
    	return eqRecords.length;
    },
	
	/**
     * 查看设备附件列表
     */
    returnListGrid_onViewAttach:function(){
    	var selectIndex=this.returnListGrid.selectedRowIndex;
		var eqId=this.returnListGrid.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
        
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach_change.eq_id',eqId,'=');
		res.addClause('eq_attach_change.rtr_dip_id',controller.rtrId,'=');
		this.eqAttachChangePanel.refresh(res,false);
		this.eqAttachChangePanel.setTitle("设备【"+eqId+"】资产追加列表");
		this.eqAttachChangePanel.showInWindow({
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
	controller.rtrId=rtId;
}
function generate(xmlName, param){
    var wfrId = 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport';
    try {
        var result = Workflow.callMethod(wfrId, xmlName, '1', param);
        if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
            result.data = eval('(' + result.jsonExpression + ')');
            this.jobId = result.data.jobId;
            var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
            window.open(url);
        }
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    View.closeThisDialog();
};