var controller=View.createController('SearchSummerForm',{
	consolePanel_onBtnShow: function(){
		var addEqId=this.consolePanel.getFieldValue('add_eq.add_eq_id');
		var dvId=this.consolePanel.getFieldValue('add_eq.dv_id');
		var dateFrom=this.consolePanel.getFieldValue('add_eq.date_request');
		var dateTo=this.consolePanel.getFieldValue('add_eq.date_purchased');
		var res=new Ab.view.Restriction();
		if(valueExistsNotEmpty(addEqId)){
			res.addClause('add_eq.add_eq_id',addEqId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			res.addClause('add_eq.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(dateFrom)){
			res.addClause('add_eq.date_request',dateFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateTo)){
			res.addClause('add_eq.date_request',dateTo,'&lt;=');
		}
		res.addClause('add_eq.status','0','!=');
		this.gridPanel.refresh(res);
	},
	consolePanel_onBtnCancel: function(){
		this.consolePanel.clear();
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
	gridPanel_showAdFile_onClick: function(row){
		var add_eq_id = row.getFieldValue("add_eq.add_eq_id");
		View.openDialog("asc-bj-usms-eq-add-search-summary-dialog.axvw", null, false, {
        	width: 800,
        	height: 600,
        	add_eq_id: add_eq_id
        });
	}
});
