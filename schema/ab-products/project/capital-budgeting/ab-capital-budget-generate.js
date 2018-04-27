var capitalBudgetGenerateController = View.createController('capitalBudgetGenerate', {

	programtypes : null,
	programsites : null,
	// overwritten during runtime
	abSchemaSystemGraphicsFolder : '/archibus/schema/ab-system/graphics',
	
	afterInitialDataFetch : function() {;
		var html = '';
		html += '<input id="capitalBudgetGenerateConsole_programtypes" class="inputField" style="width:1000px" type="text" onkeypress="View.showMessage(getMessage(\'useSelValButton\'))" onfocus="View.showMessage(getMessage(\'useSelValButton\'))" name="capitalBudgetGenerateConsole_program.program_type" maxlength="500" size="500"/>';
		html += '<img onclick="openSelvalDialog(\'capitalBudgetGenerateSelectProgramTypes\')" class="selectValue_Button" value="..." src="' + this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif"/>';
		$('capitalBudgetGenerateConsole_programtypes').parentNode.innerHTML = html;

		html  = '<input id="capitalBudgetGenerateConsole_programsites" class="inputField" style="width:1000px" type="text" onkeypress="View.showMessage(getMessage(\'useSelValButton\'))" onfocus="View.showMessage(getMessage(\'useSelValButton\'))" name="capitalBudgetGenerateConsole_program.site_id" maxlength="500" size="500"/>';
		html += '<img onclick="openSelvalDialog(\'capitalBudgetGenerateSelectProgramSites\')" class="selectValue_Button" value="..." src="' + this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif"/>';
		$('capitalBudgetGenerateConsole_programsites').parentNode.innerHTML = html;
		
		$('from_yeard').parentNode.innerHTML = '<img id="from_yeard" style="vertical-align:top;border:0;margin:0;padding:0" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'from_year\');"/>';
		$('from_yearu').parentNode.innerHTML = '<img id="from_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'from_year\');"/>';
		
		$('to_yeard').parentNode.innerHTML = '<img id="to_yeard" style="vertical-align:top;border:0;margin:0;padding:0" alt="Up" src="' + this.abSchemaSystemGraphicsFolder + '/but_yeard.gif" onclick="changeYear(1, \'to_year\');"/>';
		$('to_yearu').parentNode.innerHTML = '<img id="to_yearu" style="vertical-align:top;border:0;margin:0;padding:0" alt="Down" src="' + this.abSchemaSystemGraphicsFolder + '/but_yearu.gif" onclick="changeYear(-1, \'to_year\');"/>';

		this.capitalBudgetGenerateConsole_onClear();
	},
	
	capitalBudgetGenerateConsole_onClear : function() {
		this.programtypes = null;
		this.programsites = null;
		$('capitalBudgetGenerateConsole_programtypes').value = getMessage('allTypes');
		$('capitalBudgetGenerateConsole_programsites').value = getMessage('allTypes');		
		this.capitalBudgetGenerateConsole.clear();
		setDefaultDateValues();
		$('update_yes').checked = true;
		$('update_no').checked = false;
	},
	
	showProgramFieldsForBudget : function(budget_id) {		
		/* obtain unique program type and program site values from the prog_budget_items table for this budget_id */
		var restriction = new Ab.view.Restriction();
		restriction.addClause('prog_budget_items.budget_id', budget_id);
		this.programtypes = this.capitalBudgetGenerateProgramTypesDs.getRecords(restriction);		
		this.programsites = this.capitalBudgetGenerateProgramSitesDs.getRecords(restriction);
		this.showProgramFieldValues();
		
		/* obtain max and min fiscal year values from the prog_budget_items table for this budget_id */
		var record = this.capitalBudgetGenerateFiscalYearsDs.getRecord(restriction);
		var minFiscal = record.getValue('prog_budget_items.min_fiscal_year');
		var maxFiscal = record.getValue('prog_budget_items.max_fiscal_year');
		if (minFiscal) {
			$('from_year').value = minFiscal;
			$('to_year').value = maxFiscal;
		} else setDefaultDateValues();
	},
	
	showProgramFieldValues : function() {
			$('capitalBudgetGenerateConsole_programtypes').value = 
				getStrListOfValues(this.programtypes, 'program.program_type', ', ') == ''? getMessage('allTypes') : getStrListOfValues(this.programtypes, 'program.program_type', ', ');
			$('capitalBudgetGenerateConsole_programsites').value = 
				getStrListOfValues(this.programsites, 'program.site_id', ', ') == ''? getMessage('allTypes') : getStrListOfValues(this.programsites, 'program.site_id', ', ');
	},
	
	capitalBudgetGenerateConsole_onGenerateCapitalBudget : function() {
		var budget_id = this.capitalBudgetGenerateConsole.getFieldValue('budget.budget_id');
		if (budget_id == "" || trim($('from_year').value) == "" || trim($('to_year').value) == "") {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		if (!validateConsoleFields()) return;
		
		var parameters = {
			'sites_list': getStrListOfValues(this.programsites, 'program.site_id', ';'),
			'program_type_list': getStrListOfValues(this.programtypes, 'program.program_type', ';'),
			'from_year': $('from_year').value,
			'to_year': $('to_year').value,
			'budget_id': budget_id,
			'updateBudgetItems': $('update_yes').checked		
		};
		
		try {
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-generateProgramBudget', parameters);
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('prog_budget_items.budget_id', budget_id);
				this.capitalBudgetEditItemsTable.refresh(restriction);
			}
		} 
		catch (e) {
			Workflow.handleError(e);
		}
	}
	
});

function selectBudget(fieldName, selectedValue, previousValue)
{
	var controller = View.controllers.get('capitalBudgetGenerate');
	controller.capitalBudgetGenerateConsole.setFieldValue('budget.budget_id', selectedValue);
	controller.showProgramFieldsForBudget(selectedValue);
}

function openSelvalDialog(panelId) {
	var controller = View.controllers.get('capitalBudgetGenerate');
	View.openDialog('ab-capital-budget-generate-select.axvw', null, false, {
		afterInitialDataFetch: function(dialogView) {
	    	var dialogController = dialogView.controllers.get('capitalBudgetGenerateSelect');
	    	dialogView.panels.get(panelId).refresh(null);
			dialogView.panels.get(panelId).show(true);
		}
	});	
}

function getStrListOfValues(records, fieldname, tokenizer) {
	var str_list = '';
	var i = 0;
	if (records && records.length > 0) {
		for (i = 0; i < records.length-1; i++) {
			str_list += records[i].getValue(fieldname) + tokenizer;			
		}
		str_list += records[i].getValue(fieldname);
	}
	return str_list;
}

/* Console date functions */

var systemYear = 2025;

function setDefaultDateValues()
{
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	
	$('from_year').value = systemYear;
	$('to_year').value = systemYear+5;
}

function changeYear(amount, fieldId)
{
	if ($(fieldId)) 
	{
		var field_value = $(fieldId).value? parseInt($(fieldId).value) : systemYear+2; 
		$(fieldId).value = amount + field_value;
	}
}

function validateConsoleFields() {
	var timeframeRestriction = "";
	var from_year = trim($('from_year').value);
	var to_year = trim($('to_year').value);
	var objRegExp  = /^-?\d+$/;
	if(!objRegExp.test(from_year) || !objRegExp.test(to_year)){
		View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}	
	if (to_year < from_year) {
	  	View.showMessage(getMessage('invalid_date_range'));
	   	return false;
	}
	if (to_year - from_year > 50) {
	  	View.showMessage(getMessage('range_exceeds_maximum'));
	   	return false;
	}
	if (to_year - from_year > 10) {
		var message = String.format(getMessage('range_exceeds_ten'), to_year - from_year);
		return confirm(message);
	}
	return true;
}