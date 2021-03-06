var abRplmDefVatMcCtrl = View.createController('abRplmDefVatMcCtrl', {
	activity_id: 'AbCommonResources',
	
	param_id: 'EnableVatAndMultiCurrency',
	
	param_value: 0,
	
	record: null,
	
	dataSource: null,
	
	afterInitialDataFetch: function(){
		this.dataSource = View.dataSources.get('abRplmDefVatMC_ds');
		this.getParamValue();
		this.abRplmDefVatMC_onCancel();
	},
	
	abRplmDefVatMC_onSave: function(){
		this.abRplmDefVatMC.clearValidationResult();
		var cboElem = document.getElementById('cboEnableVatMC');
		var paramValue = cboElem.value;
		try{
			this.record.setValue('afm_activity_params.param_value', paramValue);
			this.dataSource.saveRecord(this.record);
			this.abRplmDefVatMC.validationResult.valid = true;
			this.abRplmDefVatMC.displayValidationResult({message: getMessage("msg_record_saved")});
			View.showMessage(getMessage('restartServer'));
			this.getParamValue();
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},
	
	abRplmDefVatMC_onCancel: function(){
		var cboElem = document.getElementById('cboEnableVatMC');
		cboElem.value = this.param_value;
	},
	
	getParamValue: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_activity_params.activity_id', this.activity_id, '=');
		restriction.addClause('afm_activity_params.param_id', this.param_id, '=');
		
		this.record = this.dataSource.getRecord(restriction);
		var paramValue = this.record.getValue('afm_activity_params.param_value');
		if(valueExistsNotEmpty(paramValue)){
			this.param_value = paramValue;
		}
	}
});