var projRestrictionConsoleController = View.createController('projRestrictionConsole', {
	
	afterInitialDataFetch: function() {
		setConsoleTimeframe();
	}
});

var systemYear = 2025;

/***
 * Clears values from the console and sets status to "All"
*/
function clearConsole() 
{
		var consolePanel = View.panels.get('consolePanel');
		if (consolePanel) consolePanel.clear();
		if ($('status')) $('status').value = "All";	
		if ($('select_display')) $('select_display').value = "2";
		clearConsoleTimeframe();
}

function onClearParameter()
{
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport)
	{
		selectProjectReport.addParameter('projRestriction', '1=1');
		selectProjectReport.refresh();
	}
	clearConsole();
}

function onShow() {
	var restriction = getConsoleRestriction();
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport) selectProjectReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectProjectReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowActions() {
	var restriction = getConsoleRestrictionForActions();
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport) selectProjectReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectProjectReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowActionsWithDate() {
	var restriction = getConsoleRestrictionForActions()
	var selectActionsReport = View.panels.get('selectActionsReport');
	if (selectActionsReport) selectActionsReport.refresh(restriction);
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectActionsReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowParameter() {
	var projRestriction = getConsoleRestrictionParam();
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport)
	{
		selectProjectReport.addParameter('projRestriction', projRestriction);
		selectProjectReport.refresh();
	}
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectProjectReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowParameterProjReq() {
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel)
	{
		if (consolePanel.getFieldValue('project.project_id') == '') {
			View.showMessage(getMessage('empty_proj_field'));
			return;
		}
	}
	var projRestriction = getConsoleRestrictionParam();
	var selectProjectReport = View.panels.get('selectProjectReport');
	if (selectProjectReport)
	{
		selectProjectReport.addParameter('projRestriction', projRestriction);
		selectProjectReport.refresh();
	}
	View.panels.each(function(panel) {
	    if (panel.id != 'consolePanel' && panel.id != 'selectProjectReport' && panel.id != 'viewToolbar' && panel.id != 'instructionsPanel')
	    	panel.show(false);
	}); 
}

function onShowFunding() {
	View.panels.get('projectsApprovedByYearProgramTypeReport').show(false);
	View.panels.get('projectsApprovedByYearProgramReport').show(false);
	View.panels.get('projectsApprovedByYearProjectReport').show(false);
	 
	var restriction = getConsoleRestrictionParam();
	
	var report = null;
	if ($('select_display')) {
	    var display = $('select_display').value;
	    if (display == '0') report = View.panels.get('projectsApprovedByYearProgramTypeReport');
	    else if (display == '1') report = View.panels.get('projectsApprovedByYearProgramReport');
	    else if (display == '2') report = View.panels.get('projectsApprovedByYearProjectReport');	    	
	}
	if (report) {
		report.addParameter('consoleRestriction', restriction);
		report.refresh();
		report.show();
	}
}

function projectIdSelval(restriction)
{
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
	
	var consolePanel = View.panels.get('consolePanel');
	restriction = buildSelvalRestriction('project.project_type', restriction);
	restriction = buildSelvalRestriction('project.program_id', restriction);
	restriction = buildSelvalRestriction('project.proj_mgr', restriction);
	restriction = buildSelvalRestriction('project.bl_id', restriction);
	restriction = buildSelvalRestriction('project.site_id', restriction);
	restriction = buildSelvalRestriction('project.dp_id', restriction);
	restriction = buildSelvalRestriction('project.dv_id', restriction);
	restriction = buildSelvalRestriction('project.apprv_mgr1', restriction);// in Project Calendar console
	
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		if (restriction) restriction += " AND ";
		restriction += " (" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction += " " + siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\'))";
	}
	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		if (restriction) restriction += " AND ";
   		restriction += " (" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction += " " + siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\'))";
   	} 
   	
	var title = '';
	if (getMessage('customProjectIdSelvalTitle') != 'customProjectIdSelvalTitle') title = getMessage('customProjectIdSelvalTitle');
	else title = getMessage('projectIdSelvalTitle');
	View.selectValue('consolePanel', title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.project_name','project.project_type','project.status','project.requestor','project.summary'],restriction);
}

function programIdSelval()
{
	var restriction = '';
	restriction = buildSelvalRestriction('program.program_type', restriction);
	View.selectValue('consolePanel', getMessage('programIdSelvalTitle'),['project.program_id'],'program',['program.program_id'],['program.program_id','program.program_type'],restriction);
}

function buildSelvalRestriction(fieldName, restriction)
{
	var consolePanel = View.panels.get('consolePanel');
	if (consolePanel.getFieldValue(fieldName))
	{
		if (restriction) restriction += " AND ";
		restriction += fieldName+" LIKE \'%"+getValidValue(fieldName)+"%\'";
	}	
	return restriction;
}

function getConsoleRestriction()
{ 
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
	var programString = "EXISTS (SELECT 1 FROM program WHERE project.program_id = program.program_id AND ";
	
	var consolePanel = View.panels.get('consolePanel');
    var restriction = "";
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (consolePanel.getFieldValue('project.dv_id'))	restriction += "project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' AND ";
   	if (consolePanel.getFieldValue('project.project_type'))	restriction += "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\' AND "; 
   	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if (consolePanel.getFieldValue('project.dp_id'))	restriction += "project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.project_id')) restriction += "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.site_id'))	restriction += "project.site_id LIKE \'%" + getValidValue('project.site_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('program.program_type'))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (consolePanel.getFieldValue('project.proj_mgr'))	restriction += "project.proj_mgr LIKE \'%" + getValidValue('project.proj_mgr') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.bl_id'))	restriction += "project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.program_id'))	restriction += "project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\' AND ";

	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += "project.status IN (\'Approved\',\'Approved-In Design\')";
	    } else if (status == 'In Execution') {
	    	restriction += "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\')";
		} else restriction += "project.status LIKE \'%\'";
	} else restriction += "project.project_id IS NOT NULL";
	
	if ($('timeframe_type_years')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_years').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &lt;= "+to_year+" AND ${sql.yearOf('project.date_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} &gt;= "+from_year+" AND ${sql.yearOf('project.date_end')} &lt;= "+to_year + ")";
	    	
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &lt;= "+to_year+" AND ${sql.yearOf('project.date_target_end')} &gt;= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} &gt;= "+from_year+" AND ${sql.yearOf('project.date_target_end')} &lt;= "+to_year + ")";
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	
	if ($('timeframe_type_fiscal_year')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_fiscal_year').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "projfunds.fiscal_year &gt;= "+from_year+" AND projfunds.fiscal_year &lt;= "+to_year;
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	return restriction;	
}

function getConsoleRestrictionParam()
{ 
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
	var programString = "EXISTS (SELECT 1 FROM program WHERE project.program_id = program.program_id AND ";
	
	var consolePanel = View.panels.get('consolePanel');
    var restriction = "";
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (consolePanel.getFieldValue('project.dv_id'))	restriction += "project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' AND ";
   	if (consolePanel.getFieldValue('project.project_type'))	restriction += "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\' AND "; 
   	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if (consolePanel.getFieldValue('project.dp_id'))	restriction += "project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.project_id')) restriction += "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.site_id'))	restriction += "project.site_id LIKE \'%" + getValidValue('project.site_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('program.program_type'))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (consolePanel.getFieldValue('project.proj_mgr'))	restriction += "project.proj_mgr LIKE \'%" + getValidValue('project.proj_mgr') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.bl_id'))	restriction += "project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' AND "; 
   	if (consolePanel.getFieldValue('project.program_id'))	restriction += "project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\' AND ";

	if ($('status'))
	{
	    var status = $('status').value;
	    if (status == 'In Planning') {
	    	restriction += "project.status IN (\'Approved\',\'Approved-In Design\')";
	    } else if (status == 'In Execution') {
	    	restriction += "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\')";
		} else restriction += "project.status LIKE \'%\'";
	} else restriction += "project.project_id IS NOT NULL";
	
	if ($('timeframe_type_years')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_years').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} <= "+from_year+" AND ${sql.yearOf('project.date_end')} >= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} <= "+from_year+" AND ${sql.yearOf('project.date_end')} <= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} <= "+to_year+" AND ${sql.yearOf('project.date_end')} >= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_start')} >= "+from_year+" AND ${sql.yearOf('project.date_end')} <= "+to_year + ")";
	    	
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} <= "+from_year+" AND ${sql.yearOf('project.date_target_end')} >= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} <= "+from_year+" AND ${sql.yearOf('project.date_target_end')} <= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} <= "+to_year+" AND ${sql.yearOf('project.date_target_end')} >= "+to_year + ")";
	    	timeframeRestriction += " OR ";
	    	timeframeRestriction += "(${sql.yearOf('project.date_commence_work')} >= "+from_year+" AND ${sql.yearOf('project.date_target_end')} <= "+to_year + ")";
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	
	if ($('timeframe_type_fiscal_year')) {
		var timeframeRestriction = "";
	    if ($('timeframe_type_fiscal_year').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	timeframeRestriction = " AND (";
	    	timeframeRestriction += "projfunds.fiscal_year >= "+from_year+" AND projfunds.fiscal_year <= "+to_year;
	    	timeframeRestriction += ")";
	    } 
	    restriction += timeframeRestriction;
	}
	return restriction;	
}

function getConsoleRestrictionForActions() 
{
	var projectString = "EXISTS (SELECT 1 FROM project WHERE activity_log.project_id = project.project_id AND ";
	var blString = "EXISTS (SELECT 1 FROM project, bl WHERE activity_log.project_id = project.project_id AND bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM project, site WHERE activity_log.project_id = project.project_id AND site.site_id = project.site_id AND ";
	var programString = "EXISTS (SELECT 1 FROM project, program WHERE activity_log.project_id = project.project_id AND project.program_id = program.program_id AND ";
 
    var restriction = "";
	if (trim($('bl.state_id').value)) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (trim($('project.dv_id').value))	restriction += projectString + "project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\') AND ";
   	if (trim($('project.project_type').value))	restriction += projectString + "project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\') AND "; 
   	if (trim($('bl.city_id').value))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	if (trim($('project.dp_id').value))	restriction += projectString + "project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\') AND "; 
   	if (trim($('project.project_id').value)) restriction += projectString + "project.project_id LIKE \'%" + getValidValue('project.project_id') + "%\') AND "; 
   	if (trim($('project.site_id').value))	{
   		restriction += "(" + projectString + "project.site_id LIKE \'%" + getValidValue('project.site_id') + "%\') OR ";
   		restriction += blString + "bl.site_id LIKE \'%" + getValidValue('project.site_id') + "%\')) AND ";
   	}
   	if (trim($('program.program_type').value))	restriction += programString + "program.program_type LIKE \'%" + getValidValue('program.program_type') + "%\') AND "; 
   	if (trim($('project.proj_mgr').value))	restriction += projectString + "project.proj_mgr LIKE \'%" + getValidValue('project.proj_mgr') + "%\') AND "; 
   	if (trim($('project.bl_id').value))	restriction += projectString + "project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\') AND "; 
   	if (trim($('project.program_id').value))	restriction += projectString + "project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\') AND ";

    var status = $('status').value;
    if (status == 'In Planning') {
    	restriction += projectString + "project.status IN (\'Approved\',\'Approved-In Design\') AND project.is_template = 0)";
    } else if (status == 'In Execution') {
    	restriction += projectString + "project.status IN (\'Issued-In Process\',\'Issued-On Hold\',\'Completed-Pending\',\'Completed-Not Ver\') AND project.is_template = 0)";
	} else restriction += projectString + "project.is_template = 0)";

    if ($('timeframe_type_years')) {
	    var timeframeRestriction = "";
	    var date_start, date_end;
	    if ($('timeframe_type_years').checked)
	    {
	    	var from_year = $('from_year').value;
	    	var to_year = $('to_year').value;
	    	date_start = from_year + "-" + "01-01";
	   	    date_end = to_year + "-12-31";
	    	timeframeRestriction = getDateSchedRestriction(date_start, date_end,'timeframe1');
	    } else if ($('timeframe_type_days').checked)
	    {
	    	var num_days = $('num_days').value;
	    	var curdate = new Date();
	  	  	date_start = dateAddDays(curdate, 0);
	  	  	date_end = dateAddDays(curdate, num_days);
	  	  	timeframeRestriction = getDateSchedRestriction(date_start, date_end,'timeframe1');
	    }    
	    restriction += timeframeRestriction;
    }
	return restriction;
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('consolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function setConsoleTimeframe()
{
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	var optionData;
	
	if ($('from_year')) 
	{
		for (var i = 0 ; i < 21; i++)
		{
			optionData = new Option(systemYear-10+i, systemYear-10+i);
			$('from_year').options[i] = optionData;
		}
		$('from_year').value = systemYear;
	}
	if ($('to_year')) 
	{
		for (var i = 0 ; i < 21; i++)
		{
			optionData = new Option(systemYear-10+i, systemYear-10+i);
			$('to_year').options[i] = optionData;
		}
		$('to_year').value = systemYear;
	}
}

function clearConsoleTimeframe()
{
	if ($('from_year')) $('from_year').value = systemYear;
	if ($('to_year')) $('to_year').value = systemYear;
	if ($('num_days')) $('num_days').value = '0';
	if ($('timeframe_type_all')) $('timeframe_type_all').checked = true;
}

/* used by views displaying activity_log.date_scheduled_end, a calculated value */

function onCalcEndDatesForProject(project_id)
{
	var parameters = {'project_id':project_id};
	var result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject',parameters);
	if (result.code == 'executed') {
		return true;		
	} 
	else 
	{
		alert(result.code + " :: " + result.message);
		return false;
	}	
}

/* Adds nxtdays to date_start and returns as a SQL formatted string*/

function dateAddDays(date_start, nxtdays) 
{
	  date_new = new Date(date_start.getTime() + nxtdays*(24*60*60*1000));
	  var month = date_new.getMonth()+1;
	  if (month<10) month = "0" + month;
	  var day = date_new.getDate();
	  if (day<10) day = "0" + day;
	  return date_new.getFullYear() + '-' + month + '-' + day;
}

function getDateSchedRestriction(start, end, ctype) 
{
  var strDateRangeStatement = " AND (";
  var sTable = "activity_log";
  var sDateField1 = "date_scheduled";
  var sDateField2 = "date_scheduled_end";

  if (ctype=="timeframe2") {
  	sTable = "project";
  }

  var dstr1 = '#Date%'+start+'%';
  var dstr2 = '#Date%'+end+'%';
  var conj = " AND ";
  var endp = "";
  if (start == "") conj = "(";
  if (end == "") endp = ")";

  if (start!="") strDateRangeStatement += '(' + sTable + '.' + sDateField1 + '&gt;=' + dstr1 + endp;
  if (end!="") strDateRangeStatement += conj + sTable + '.' + sDateField1 + '&lt;=' + dstr2 + ')';

  if (sDateField2 != "") {

    if (start!="") strDateRangeStatement += ' OR (' + sTable + '.' + sDateField2 + '&gt;=' + dstr1 + endp;
    if (end!="") strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&lt;=' + dstr2 + ')';

    if (start!="" && end!="") {
      strDateRangeStatement += ' OR (' + sTable + '.' + sDateField1 + '&lt;=' + dstr1 + endp;
      strDateRangeStatement += conj + sTable + '.' + sDateField2 + '&gt;=' + dstr2 + ')';
    }
  }
  strDateRangeStatement += ')';
  return strDateRangeStatement;
}

function validateYear(iFromTo)
{
  var dToday = new Date();

  if ($('from_year')) {
    var iFromYear = parseInt($('from_year').value);
    var iToYear = parseInt($('to_year').value);
    if(iFromTo == 1) // From
    {
      if(!iFromYear)
      {
        iFromYear = dToday.getFullYear();
        $('from_year').value = iFromYear;
      }
      else if(iFromYear > iToYear)
      {
        $('from_year').value = iToYear;
      }
    }
    else // To
    {
      if(!iToYear)
      {
        iToYear = iFromYear+10;
        $('to_year').value = iToYear;
      }
      else if(iToYear < iFromYear)
      {
        $('to_year').value = iFromYear;
      }
    }
  }
}
