var controller=View.createController('eqForm',{

	consolePanel_onShow: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();	
		this.gridPanel.refresh(restriction);
	},
	formPanel_onSave: function(){
		this.formPanel.save();
		this.consolePanel_onShow();
	},
	consolePanel_onShowDvIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.dv_id",'','IS NULL');
		this.gridPanel.refresh(restriction);
	},
	consolePanel_onShowEmIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.em_id",'','IS NULL');
		this.gridPanel.refresh(restriction);
	},
	consolePanel_onShowRmIsNull: function(){
		this.setCsi();
		var restriction = this.consolePanel.getFieldRestriction();
		restriction.addClause("eq.rm_id",'','IS NULL');
		this.gridPanel.refresh(restriction);
	},
	setCsi: function(){
		var csi= this.consolePanel.getFieldValue("eq.csi_id");	
		for(var i=0;i<5;i++){
			csi = csi.replace(/(00)\b/gi,"");
		}
		this.consolePanel.setFieldValue("eq.csi_id",csi);
	}
})