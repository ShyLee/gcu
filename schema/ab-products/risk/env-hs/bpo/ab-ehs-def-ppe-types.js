var abEhsDefPpeTypesCtrl = View.createController('abEhsDefPpeTypesCtrl',{
	
	recurringPatternCtrl : null,
	
	afterViewLoad:function(){
		this.recurringPatternCtrl = View.controllers.get("abRecurringPatternCtrl");
	},
	
	afterInitialDataFetch: function(){
		this.recurringPatternCtrl.editRecurringRule.show(false);
	},
	
	showForm: function(visible){
		this.recurringPatternCtrl.editRecurringRule.show(visible);
		this.abEhsDefPpeTypes_form.show(visible);
		if(visible){
			if(this.abEhsDefPpeTypes_form.getFieldValue('ehs_ppe_types.needs_renewal') == '1'){
				var recurringRule = this.abEhsDefPpeTypes_form.getFieldValue("ehs_ppe_types.recurring_rule");
				this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefPpeTypes_form.getFieldValue("ehs_ppe_types.recurring_rule"));
				this.abEhsDefPpeTypes_form.enableField("ehs_ppe_types.date_recurrence_end", true);
			}else{
				//this.recurringPatternCtrl.pattern.enable(false);
				this.abEhsDefPpeTypes_form.enableField("ehs_ppe_types.date_recurrence_end", false);
				
				this.recurringPatternCtrl.editRecurringRule.show(false);
			}
		}
	},
	
	onChangeNeedsRenewal: function(){
		var needsRenewal = this.abEhsDefPpeTypes_form.getFieldValue('ehs_ppe_types.needs_renewal'); 
		if(needsRenewal == '1'){
			this.recurringPatternCtrl.editRecurringRule.show(true);
			
			this.recurringPatternCtrl.pattern.enable(true);
			this.abEhsDefPpeTypes_form.enableField("ehs_ppe_types.date_recurrence_end", true);
		}else{
			this.recurringPatternCtrl.pattern.clear();
			//this.recurringPatternCtrl.pattern.enable(false);
			this.abEhsDefPpeTypes_form.enableField("ehs_ppe_types.date_recurrence_end", false);
			this.abEhsDefPpeTypes_form.fields.get("ehs_ppe_types.date_recurrence_end").clear();
			
			this.recurringPatternCtrl.editRecurringRule.show(false);
		}
	},
	
	abEhsDefPpeTypes_form_afterRefresh:function(){
		this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefPpeTypes_form.getFieldValue("ehs_ppe_types.recurring_rule"));
	},
	
	abEhsDefPpeTypes_form_beforeSave: function(){
		this.abEhsDefPpeTypes_form.setFieldValue("ehs_ppe_types.recurring_rule", this.recurringPatternCtrl.getRecurringPattern());
		var needsRenewal = this.abEhsDefPpeTypes_form.getFieldValue('ehs_ppe_types.needs_renewal'); 
		if(needsRenewal == '1'){
			//check that renewal frequency is described
			if(!valueExistsNotEmpty(this.abEhsDefPpeTypes_form.getFieldValue('ehs_ppe_types.recurring_rule'))){
				View.showMessage(getMessage("errNoRecurringRule"));
				return false;
			}
			
			//check that one of the stop conditions is defined: Date End or End After[ ]Ocurrences or Once button selected
			/* PC not required after last changes to common code, default values of 5-10 years can be used if no stop condition is indicated
			if(!isRecurrenceEnd(this.abEhsDefPpeTypes_form.getFieldValue("ehs_ppe_types.date_recurrence_end"), this.recurringPatternCtrl)){
				return false;
			}*/
		}
		return true;
	}
});
