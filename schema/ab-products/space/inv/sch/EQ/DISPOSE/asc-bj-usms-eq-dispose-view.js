var controller = View.createController('controller', {
	console_Panel_onShow: function(){
		var rtr_dip_name = this.console_Panel.getFieldValue("return_dispose.rtr_dip_name");
		var dv_id = this.console_Panel.getFieldValue("return_dispose.dv_id");
		
		var res = new Ab.view.Restriction();
		if(valueExistsNotEmpty(rtr_dip_name)){
			res.addClause("return_dispose.rtr_dip_name",'%'+rtr_dip_name+'%',"LIKE");
		}
		if(valueExistsNotEmpty(dv_id)){
			res.addClause("return_dispose.dv_id",dv_id,"=");
		}
		this.return_dispose_Panel.refresh(res);
		this.EqReturnDisposeDitailPanel.show(false);
		this.eq_change_Panel.show(false);
	},
	console_Panel_onClear: function(){
		this.console_Panel.clear();
		this.return_dispose_Panel.restriction=null;
		this.return_dispose_Panel.refresh("");
	},
	return_dispose_Panel_rtr_dip_name_onClick: function(row){
		var rtr_dip_id = row.getFieldValue("return_dispose.rtr_dip_id");
		var auditStatus = row.getFieldValue("return_dispose.audit_status");
		var res = new Ab.view.Restriction();
		res.addClause("eq_change.rtr_dip_id",rtr_dip_id,"=");
		
		var disposeRes=new Ab.view.Restriction();
		disposeRes.addClause("return_dispose.rtr_dip_id",rtr_dip_id,"=");
		/*var csi_id = this.console_Panel.getFieldValue("eq_change.csi_id");
		if(valueExistsNotEmpty(csi_id)){
			for(var i=0;i<5;i++){
				csi_id = csi_id.replace(/(00)\b/gi,"");
			}
			res.addClause("eq_change.csi_id",csi_id+'%',"LIKE");
		}*/
		
		this.EqReturnDisposeDitailPanel.refresh(disposeRes);
		this.eq_change_Panel.refresh(res);
		if(auditStatus!='4'){
			this.EqReturnDisposeDitailPanel.enableField("return_dispose.cz_price",false);
			this.EqReturnDisposeDitailPanel.actions.get("btnSave").show(false);
		}else{
			this.EqReturnDisposeDitailPanel.enableField("return_dispose.cz_price",true);
			this.EqReturnDisposeDitailPanel.actions.get("btnSave").show(true);
		}
	},
	eq_change_Panel_eq_id_onClick: function(row){
		var eq_id = row.getFieldValue("eq_change.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id,
        	closeButton: false
        });
	},
	openEditStatusPanel: function(){
		var role=View.user.role;
		if(role=='UNV EQ ADMIN'){
			var selectIndex=this.eq_change_Panel.selectedRowIndex;
			var eq_id=this.eq_change_Panel.gridRows.get(selectIndex).getRecord().getValue("eq_change.eq_id");
			var res=new Ab.view.Restriction();
			res.addClause("eq.eq_id",eq_id,'=');
			 this.eqStatusPanel.show(true);
			 this.eqStatusPanel.showInWindow({
			        width: 600,
			        height: 300
			 });
			 this.eqStatusPanel.refresh(res);
		}
		
	},
	eqStatusPanel_onBtnSave: function(){
		View.confirm("是否确定要修改设备状态",function(button){
			if(button=='yes'){
				View.panels.get("eqStatusPanel").save();
				View.panels.get("eq_change_Panel").refresh();
			}
		})
	}
});