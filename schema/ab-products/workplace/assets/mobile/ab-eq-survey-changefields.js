var controller = View.createController('changeEqSurveyFieldsController', {
	
	
	record: null,
	
	datasource: null,
	
	fieldNames: [],
	
	mlHeadings: {},
	
	required: {},
	
	storeFieldNameAndHeadings: function() {
		var changeFieldsDatasource =  View.dataSources.get('eqChangeFields_ds');
		var changeFieldsRecords = changeFieldsDatasource.getRecords();
		if(changeFieldsRecords!= null){
			for(var i=0; i < changeFieldsRecords.length; i++){
				var fieldName = changeFieldsRecords[i].values['afm_flds.field_name'];
				var allowNull = changeFieldsRecords[i].values['afm_flds.allow_null'];
				var mlHeading = changeFieldsRecords[i].values['afm_flds.ml_heading'];
				this.fieldNames.push(fieldName);
				if(allowNull==0){
					this.required[fieldName] = true;
				} else {
					this.required[fieldName] = false;
				}
				this.mlHeadings[fieldName] = mlHeading;
			}
		}
	},
	

	addField: function(fieldName){
		var index = this.fieldNames.indexOf(fieldName);
		
		var inputElemHtml = "";
		if(index > -1){
			inputElemHtml += "<tr><td align='right'><input type='checkbox' id='checkbox_" + fieldName + "'";
			
			if(this.required[fieldName]){
				inputElemHtml += " checked='true' disabled='true'";
			}
			
			if(fieldName == 'dv_id')
				inputElemHtml += " onchange='onDvCheckBox()'";
			else if(fieldName == 'dp_id')
				inputElemHtml += " onchange='onDpCheckBox()'";
				
			inputElemHtml += "></input></td><td><span translatable='true'>" + this.mlHeadings[fieldName] + "</span>";
			
			if(this.required[fieldName])
				inputElemHtml += "<span style='color:red;'>*</span>";
			
			inputElemHtml += "</td></tr>";

		}
		
		return inputElemHtml;
	},

	loadInputFields: function() {	
		
		var changeFieldsDiv = $('changeFieldsTemplatePanel');

		var inputElemHtml = "<table align='center'><tr></tr>";
		
		inputElemHtml += this.addField("survey_id");
		inputElemHtml += this.addField("site_id");
		inputElemHtml += this.addField("bl_id");
		inputElemHtml += this.addField("fl_id");
		inputElemHtml += this.addField("rm_id");
		inputElemHtml += this.addField("dv_id");
		inputElemHtml += this.addField("dp_id");
		inputElemHtml += this.addField("eq_id");
		inputElemHtml += this.addField("status");
		
		for(var i=0; i < this.fieldNames.length; i++){
			var fieldName = this.fieldNames[i];
			if(fieldName!='survey_id' && fieldName!='site_id' && fieldName!='bl_id' && fieldName!='fl_id' 
				&& fieldName!='rm_id' && fieldName!='dv_id' && fieldName!='dp_id' && fieldName!='eq_id' && fieldName!='status')
				inputElemHtml += this.addField(fieldName);
		}

		inputElemHtml += "</table>";

		changeFieldsDiv.innerHTML = inputElemHtml ;
		
	},
	
	afterViewLoad: function() {
		
		//hide all the buttons at title bar.
		if(Ext.get("alterButton")!=null)
			Ext.get("alterButton").dom.hidden = true;
	
		if(Ext.get("favoritesButton")!=null)
			Ext.get("favoritesButton").dom.hidden = true;
		
		if(Ext.get("printButton")!=null)
			Ext.get("printButton").dom.hidden = true;
		
		if(Ext.get("emailButton")!=null)
			Ext.get("emailButton").dom.hidden = true;
		
		if(Ext.get("loggingButton")!=null)
			Ext.get("loggingButton").dom.hidden = true;
		
		
		//store the required field, optional fields and their multiple headings into array and map.
		this.storeFieldNameAndHeadings();
		
		// add the input fields
		this.loadInputFields();
		
		this.datasource = View.dataSources.get('eqFields_ds');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_activity_params.activity_id', 'AbAssetManagement', '=');
		restriction.addClause('afm_activity_params.param_id', 'EquipmentFieldsToSurvey', '=');
		
		var records = this.datasource.getRecords(restriction);
		if(records!= null && records.length > 0){
			this.record = records[0];
			var paramValue = this.record.values['afm_activity_params.param_value'];
			var paramArray = paramValue.split(";");
			for(var i=0; i < paramArray.length; i++){
				var checkBoxElem = $('checkbox_' + paramArray[i]);
				if(checkBoxElem)
					checkBoxElem.checked=true;
			}
		} else {
			//there is no activity_parameter record, create one.
			var paramValue = "";
			for(var i=0; i < this.fieldNames.length; i++){
				var fieldName = this.fieldNames[i];
				if(this.required[fieldName]){
					var checkBoxElem = $('checkbox_' + fieldName);
					if(checkBoxElem)
						checkBoxElem.checked=true;
					if(paramValue.length >0)
						paramValue += ";";
					paramValue += fieldName;
				}
			}
			
			//new record
			this.record =  new Ab.data.Record();
			this.record.setValue('afm_activity_params.activity_id', 'AbAssetManagement');
			this.record.setValue('afm_activity_params.param_id', 'EquipmentFieldsToSurvey');
			this.record.setValue('afm_activity_params.param_value', paramValue);
			this.record.setValue('afm_activity_params.description', 'Asset Management Equipment Field to Survey');
			this.datasource.saveRecord(this.record);
		}
   	}
});

function onChangeSurveyFields() {
	var fieldsToSurvey = '';
	for(var i=0; i < controller.fieldNames.length; i++){
		var fieldName = controller.fieldNames[i];
		var checkBoxElem = $('checkbox_' + fieldName);
		if(checkBoxElem && checkBoxElem.checked){
			if(fieldsToSurvey.length >0)
				fieldsToSurvey += ";";
			
			fieldsToSurvey += fieldName;
		}
	}
	
	controller.record.setValue('afm_activity_params.param_value', fieldsToSurvey);
	controller.record.isNew = false;
	try{
		controller.datasource.saveRecord(controller.record);
	} catch(e){
		View.showMessage('error', getMessage('error_save'), e.message, e.data);
	}
}

function onDvCheckBox() {
	$('checkbox_dp_id').checked = $('checkbox_dv_id').checked;
}

function onDpCheckBox() {
	$('checkbox_dv_id').checked = $('checkbox_dp_id').checked;
}
