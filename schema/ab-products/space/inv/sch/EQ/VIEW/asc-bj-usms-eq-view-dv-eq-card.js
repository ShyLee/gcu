var controller = View.createController('controller', {
	restriction: null,
	afterInitialDataFetch:function(){
		this.refreshPanel(true);
	},
	consolePanel_onShow: function(){
		var eq_warehouse=this.consolePanel.getFieldValue('eq.eq_warehouse');
		var em_id=this.consolePanel.getFieldValue('eq.em_id');
		var eq_id=this.consolePanel.getFieldValue('eq.eq_id');
		var eq_name=this.consolePanel.getFieldValue('eq.eq_name');
		var bl_id=this.consolePanel.getFieldValue('eq.bl_id');
		var fl_id=this.consolePanel.getFieldValue('eq.fl_id');
		var rm_id=this.consolePanel.getFieldValue('eq.rm_id');
		var csi_id=this.consolePanel.getFieldValue('eq.csi_id');
		
		
		var restriction=new Ab.view.Restriction();
		if(valueExistsNotEmpty(eq_warehouse)){
			restriction.addClause('eq.eq_warehouse',eq_warehouse,'=');
		}
		if(valueExistsNotEmpty(eq_id)){
			restriction.addClause('eq.eq_id','%'+eq_id+'%','like');
		}
		if(valueExistsNotEmpty(em_id)){
			restriction.addClause('eq.em_id','%'+em_id+'%','like');
		}
		if(valueExistsNotEmpty(eq_name)){
			restriction.addClause('eq.eq_name','%'+eq_name+'%','like');
		}
		if(valueExistsNotEmpty(bl_id)){
			restriction.addClause('eq.bl_id',bl_id,'=');
		}
		if(valueExistsNotEmpty(fl_id)){
			restriction.addClause('eq.fl_id',fl_id,'=');
		}
		if(valueExistsNotEmpty(rm_id)){
			restriction.addClause('eq.rm_id',rm_id,'=');
		}
		if(valueExistsNotEmpty(csi_id)){
			restriction.addClause('eq.csi_id','%'+csi_id+'%','like');
		}		
		
		this.consolePanel.setFieldValue("eq.csi_id",csi_id);
		var user = this.view.user;
		if(user.role == "UNV DV ADMIN" || user.role == "UNV DIVISION HEAD")
		{
			var dv = user.employee.organization.divisionId;
			restriction.addClause("eq.dv_id",dv,"=");
		}
		this.gridPanel.refresh(restriction);
		this.restriction =restriction;
	},
	showEq:function(){	
		var user = this.view.user;
		var dv = null;
		if(user.role == "UNV DV EQ ADMIN")
		{
			dv = user.employee.organization.divisionId;
		}
		View.openDialog('asc-bj-usms-eq-view-dv-eq-card-view.axvw', null, true, {
            width: 900,
            height: 400,
            dv:dv,
            closeButton: false
        });
	
	},
	refreshPanel: function(row){
		var length = this.gridPanel.rows.length;
		if(length>0){
			var panel = this.gridPanel;
			var selectedIndex="-1";
			if(row){
				selectedIndex="0";
			}else{
				selectedIndex=panel.selectedRowIndex;
			}
			
			var eq_id = panel.rows[selectedIndex]["eq.eq_id"];
			var warranty_id = panel.rows[selectedIndex]["eq.warranty_id"];
			var res=new Ab.view.Restriction();
			res.addClause("eq.eq_id",eq_id,"=");
			this.formPanel.refresh(res);
			this.imagePanel.refresh(res);
			
			var rest1=new Ab.view.Restriction();
			rest1.addClause("eq_change.eq_id",eq_id,"=");
			this.eq_changePanel.refresh(rest1);
			
			var rest2=new Ab.view.Restriction();
			rest2.addClause("eq_attach.eq_id",eq_id,"=");
			this.eqAttachPanel.refresh(rest2);
			
			var image_file = panel.rows[selectedIndex]["eq.eq_photo"].toLowerCase();
			if (valueExistsNotEmpty(image_file)) {
				this.imagePanel.showImageDoc('image_field', 'eq.eq_id', 'eq.eq_photo');
	    	}else {
	    		this.imagePanel.fields.get('image_field').dom.src = null;
	    		this.imagePanel.fields.get('image_field').dom.alt = '';
	    	}
			
			var rest3=new Ab.view.Restriction();
			rest3.addClause("eq_repair.eq_id",eq_id,"=");
			this.repairPanel.refresh(rest3);
		}else{
			this.formPanel.show(false);
			this.eq_changePanel.show(false);
			this.eqAttachPanel.show(false);
			this.imagePanel.show(false);
			this.repairPanel.show(false);
		}
		
		
	}
});

