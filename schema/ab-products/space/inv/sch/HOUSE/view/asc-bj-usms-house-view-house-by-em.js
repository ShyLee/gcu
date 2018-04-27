var controller = View.createController("controller", {
	consoleForm_onShow:function(){
		var em_id=this.consoleForm.getFieldValue("sc_zzfcard.em_id");
		var em_name=this.consoleForm.getFieldValue("sc_zzfcard.em_name");
		var dv_name=this.consoleForm.getFieldValue("sc_zzfcard.dv_name");
		var res= new Ab.view.Restriction();
		if(valueExistsNotEmpty(em_id)){  			
	    	res.addClause("sc_zzfcard.em_id",em_id,"=");	    	
		}
		if(valueExistsNotEmpty(em_name)){  			
	    	res.addClause("sc_zzfcard.em_name","%"+em_name+"%","like");	    	
		}
		if(valueExistsNotEmpty(dv_name)){  			
			res.addClause("sc_zzfcard.dv_name","%"+dv_name+"%","like");	    		    	
		}
		this.emGridPanel.refresh(res);
		this.zzflistPanel.show(false);
		this.zzfDeatilPanel.show(false);
	},
	
	showDetail:function(){
		var panel = this.emGridPanel;
		var selectedIndex = panel.selectedRowIndex;
		var em_id = panel.rows[selectedIndex]["sc_zzfcard.em_id"];
		var res= new Ab.view.Restriction();
		res.addClause("sc_zzfcard.em_id",em_id,"=");
		this.zzflistPanel.refresh(res);
		this.zzfDeatilPanel.show(false);
	},
	
	showZZFCard:function(){
		var panel = this.zzflistPanel;
		var selectedIndex = panel.selectedRowIndex;
		var card_id = panel.rows[selectedIndex]["sc_zzfcard.card_id"];
		var res= new Ab.view.Restriction();
		res.addClause("sc_zzfcard.card_id",card_id,"=");
		this.zzfDeatilPanel.refresh(res);
	}
});