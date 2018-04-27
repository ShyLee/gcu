var projStatProjsFilterController = View.createController('projStatProjsFilter',{	
	projStatProjsFilter_filter_onShow:function() {
		var restriction = getConsoleRestrictionForProjects();
		var openerController = View.getOpenerView().controllers.get('projStatProjs');
		openerController.projStatProjs_summary.addParameter('summRestriction', restriction);
		openerController.projStatProjs_projects.addParameter('projectsRestriction', restriction);
		openerController.projStatProjs_projects.restriction = null; // remove drill-down status selection
		openerController.projStatProjs_projects.refresh();
		openerController.consoleRestriction = restriction;
		openerController.statusRestriction = " project.status NOT IN ('Created','Approved-Cancelled') AND project.status NOT LIKE ('Requested%') "; // remove drill-down status selection
		openerController.setProjectDatesForRestriction();
		openerController.projStatProjs_summary.refresh();
		View.closeThisDialog();
	}
});

function getConsoleRestrictionForProjects() {
	var restriction = " project.is_template = 0 ";
	var console = View.panels.get('projStatProjsFilter_filter');
	var projectId = console.getFieldValue('project.project_id').trim();
	if (projectId != '') restriction += " AND project.project_id LIKE '" + projectId + "'";
	var contactId = console.getFieldValue('project.contact_id').trim();
	if (contactId != '') restriction += " AND project.contact_id LIKE '" + contactId + "'";
	var projMgr = console.getFieldValue('project.proj_mgr').trim();
	if (projMgr != '') restriction += " AND project.proj_mgr LIKE '" + projMgr + "'";
	var deptContact = console.getFieldValue('project.dept_contact').trim();
	if (deptContact != '') restriction += " AND project.dept_contact LIKE '" + deptContact + "'";
	var requestor = console.getFieldValue('project.requestor').trim();
	if (requestor != '') restriction += " AND project.requestor LIKE '" + requestor + "'";
	var projectType = console.getFieldValue('project.project_type').trim();
	if (projectType != '') restriction += " AND project.project_type LIKE '" + projectType + "'";
	var programId = console.getFieldValue('project.program_id').trim();
	if (programId != '') restriction += " AND project.program_id LIKE '" + programId + "'";
	var programType = console.getFieldValue('program.program_type').trim();
	if (programType != '') restriction += " AND program.program_type LIKE '" + programType + "'";
	var siteId = console.getFieldValue('project.site_id').trim();
	if (siteId != '') restriction += " AND (project.site_id LIKE '" + siteId + "' OR bl.site_id LIKE '" + siteId + "')";
	var blId = console.getFieldValue('project.bl_id').trim();
	if (blId != '') restriction += " AND project.bl_id LIKE '" + blId + "'";
	var ctryId = console.getFieldValue('bl.ctry_id').trim();
	if (ctryId != '') restriction += " AND (bl.ctry_id LIKE '" + ctryId + "' OR site.ctry_id LIKE '" + ctryId + "')";
	var geoRegionId = console.getFieldValue('ctry.geo_region_id').trim();
	if (geoRegionId != '') restriction += " AND ctry.geo_region_id LIKE '" + geoRegionId + "'";
	var dvId = console.getFieldValue('project.dv_id').trim();
	if (dvId != '') restriction += " AND project.dv_id LIKE '" + dvId + "'";
	var dpId = console.getFieldValue('project.dp_id').trim();
	if (dpId != '') restriction += " AND project.dp_id LIKE '" + dpId + "'";
	var projectName = console.getFieldValue('project.project_name').trim();
	if (projectName != '') restriction += " AND project.project_name LIKE '" + projectName + "'";
	var status = console.getFieldValue('project.project_status').trim();
	if (status != '') restriction += " AND " + getMultiSelectFieldRestriction('project.status', status);
	return restriction;
}

function getValidValue(panel, inputFieldName)
{
	var fieldValue = panel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    restriction =  field + " IN " + stringToSqlArray(consoleFieldValue);
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}
