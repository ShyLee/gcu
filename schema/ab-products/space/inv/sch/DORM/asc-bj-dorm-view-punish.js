var checkoutPunishController=View.createController('checkoutPunishController', {
	stuName:"",
	stuYear:"",
	stuDvName:"",
	stuPunish:"",
	datePunishFrom:"",
	datePunishTo:"",
	showTotal:function(){
		this.datePunishFrom = this.consolePunishPanel.getFieldValue("sc_stu_punish_log.date_from");
		this.datePunishTo = this.consolePunishPanel.getFieldValue("sc_stu_punish_log.date_to");
		this.stuDvName = this.consolePunishPanel.getFieldValue("dv.dv_name");
		this.stuPunish = this.consolePunishPanel.getFieldValue("sc_stu_punish_log.punish");
		this.stuYear = this.consolePunishPanel.getFieldValue("sc_stu_punish_log.stu_in_year");
		this.stuName = this.consolePunishPanel.getFieldValue("sc_stu_punish_log.stu_name");
		
		var totalPanel = this.gridTotalPunishPanel;
		var restriction = new Ab.view.Restriction();
		if(this.stuYear!=""){
			restriction.addClause("sc_stu_property_log.stu_in_year",this.stuYear,"=");
		}
		
		if(this.stuName!=""){
			restriction.addClause("sc_stu_property_log.stu_in_year",this.stuName,"=");
		}
		
		if(this.stuPunish!=""){
			restriction.addClause("sc_stu_property_log.punish",this.stuPunish,"=");
		}
		
		if(this.stuDvName!=""){
			restriction.addClause("dv.dv_name",this.stuDvName,"=");
		}
		
		if(this.datePunishFrom!=""){
			restriction.addClause("sc_stu_property_log.date_from","to_date('"+this.datePunishFrom+"', 'yyyy/MM/dd')",">=");
		}
		
		if(this.datePunishTo!=""){
			restriction.addClause("sc_stu_property_log.date_to","to_date('"+this.datePunishTo+"', 'yyyy/MM/dd')","<=");
		}
		
		totalPanel.refresh();
	}

});

