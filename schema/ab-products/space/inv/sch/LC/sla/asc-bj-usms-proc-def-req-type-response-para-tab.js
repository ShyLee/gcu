var requestPanel;
var responsePanel;
var ondemandPanel;

var helpdeskConditionFields;
var ondemandConditionFields;

var addNew = false;
var basicStatus;
var step;
var stepType;
var steps;
var current_view_path = (window.location).toString();
var image_path = "/" + current_view_path.substring(current_view_path.indexOf('archibus'), current_view_path.lastIndexOf('asc-bj-usms-proc-def-req-type-response-para-tab.axvw')) + "graphics/";

View.createController('defineSlaPriorityTab_Controller', {

    afterInitialDataFetch: function(){
        var tabs = View.getControlsByType(parent, 'tabs')[0];
        
        requestPanel = View.panels.get('panel_request');
        responsePanel = View.panels.get('panel_response');
        ondemandPanel = View.panels.get("panel_ondemand_response");
        
        var reqRest = new Ab.view.Restriction();
        reqRest.addClause('helpdesk_sla_response.ordering_seq', tabs.ordering_seq);
        reqRest.addClause('helpdesk_sla_response.activity_type', tabs.activity_type);
        reqRest.addClause('helpdesk_sla_response.priority', 1);
        
        requestPanel.refresh(reqRest);
        requestPanel.show(false);
        responsePanel.refresh(reqRest);
        responsePanel.show(false);
        
        var record = responsePanel.getRecord();
        setPanelRecord("panel_ondemand_response", record);
        ondemandPanel.show(false);
        
        setTimeToRespond();
        setTimeToComplete();
        
        setRadioButton("notify_service_provider_odw", "helpdesk_sla_response.notify_service_provider", "panel_ondemand_response");
        setRadioButton("notify_craftsperson", "helpdesk_sla_response.notify_craftsperson", "panel_ondemand_response");
        setRadioButton("autoissue", "helpdesk_sla_response.autoissue", "panel_ondemand_response");
        setServiceWindow();
        setRadioButton("allow_work_on_holidays", "helpdesk_sla_response.allow_work_on_holidays", "panel_response");
        setDefaultSlaManager();
        setDispatching();
        
        $("save_button").value = getMessage("Save");
        $("close_button").value = getMessage("Close");
        
        helpdeskConditionFields = getConditionFields("AbBldgOpsHelpDesk");
        ondemandConditionFields = getConditionFields("AbBldgOpsOnDemandWork");
        
        // get workflow steps and display them
        getHelperRules();
        
        // get all possible steps 
        getSteps();
        
        setStepButtons();
        
        requestPanel.show(false);
        View.panels.get('status_request').setTitle(getMessage('panelTitle') + " " + tabs.problemType);
    }
});


function getConditionFields(activity_id){
    var result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getStepConditionFieldsForActivity", activity_id);
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        return res;
    }
    else {
        Workflow.handleError(result);
    }
}


/**
 * Retrieve helper rules (steps) from database and create step elements in the form<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#getHelperRules(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getHelperRules</a><br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function getHelperRules(){
    var ordering_seq = responsePanel.getFieldValue('helpdesk_sla_response.ordering_seq');
    var priority = responsePanel.getFieldValue('helpdesk_sla_response.priority');
    var activity_type = responsePanel.getFieldValue('helpdesk_sla_response.activity_type');
    
    var result = Workflow.callMethod("AbBldgOpsHelpDesk-SLAService-getHelperRules", ordering_seq, priority, activity_type);
    
    if (result.code == 'executed') {
        document.getElementById('REQUESTED').innerHTML = '';
        var res = eval('(' + result.jsonExpression + ')');
        
        for (var i = 0; i < res.length; i++) {
        
            var statusValue = res[i].status;
            
            var ul = document.getElementById(statusValue);
            
            if (ul == "undefined" || ul == null) 
                View.showMessage("ul for status " + statusValue + " not found")
            
            var type = res[i].step_type;
            var step = res[i].step;
            
            var condition = res[i].condition;
            var multiple_required = res[i].multiple_required;
            
            var em_id = res[i].em_id;
            var vn_id = res[i].vn_id;
            var cf_id = res[i].cf_id;
            
            var role = res[i].role;
            
            var notify_responsible = res[i].notify_responsible;
            
            var li = document.createElement("li");
            li.setAttribute("type", type);
            li.setAttribute("category", type);
            li.setAttribute("step", step);
            // li.setAttribute("class", "step");
            li.className = "step"
            
            var txt = step.substring(0, 1).toUpperCase() + step.substring(1, step.length);
            var by = null;
            if (em_id != null && em_id != "") {
                by = em_id;
                li.setAttribute("em_id", em_id);
            }
            else 
                if (vn_id != null && vn_id != "") {
                    by = vn_id;
                    li.setAttribute("vn_id", vn_id);
                }
                else 
                    if (cf_id != null && cf_id != "") {
                        by = cf_id;
                        li.setAttribute("cf_id", cf_id);
                    }
                    else 
                        if (role != null && role != "") {
                            by = role;
                            li.setAttribute("role", role);
                        }
            if (by != null) {
                txt += " " + getMessage("by") + " " + by;
            }
            
            if (condition != null && condition != "") {
                txt += " " + getMessage("when") + " " + getConditionText(res[i].activity_id, condition);
                li.setAttribute("condition", condition);
            }
            
            if (type == 'approval' && role != null && role != "" && multiple_required != null && multiple_required == "1") {
                txt += ", " + getMessage("multipleRequired");
                li.setAttribute("multiple_required", "true");
            }
            else {
                li.setAttribute("multiple_required", "false");
            }
            
            if (type != 'notification' && notify_responsible != null && notify_responsible == 1) {
                li.setAttribute("notify_responsible", "true");
            }
            else {
                li.setAttribute("notify_responsible", "false");
            }
            
            setInnerHTML(li, txt);
            ul.appendChild(li);
        }
        
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Get all steps from the database<br />
 * Called by <a href='#user_form_onload'>user_form_onload</a><br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getSteps(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getSteps</a><br />
 * Sets global javascript variable 'steps' with returned jsonExpression
 */
function getSteps(){
    var result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSteps");
    
    if (result.code == 'executed') {
        steps = eval('(' + result.jsonExpression + ')');
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Add step buttons to the step containers<br />
 * Based on the possible steps per status and activity
 */
function setStepButtons(){
    var add_text = getMessage("helpdesk_sla_create_priority_level_add");
    for (var i = 0; i < steps.length; i++) {
        var state = steps[i].state;
        if (state == "REQUESTED") {
            var buttonContainer = $("buttons_" + state);
            buttonContainer.innerHTML = '';
            if (buttonContainer != undefined) {
                var types = steps[i].types;
                
                for (var j = 0; j < types.length; j++) {
                    var type = "" + types[j].type.value;
                    if (type == 'approval') {
                        var typeText = "" + types[j].type.text;
                        var args = [type, state];
                        
                        var button = document.createElement("input");
                        button.type = "button";
                        
                        button.value = add_text + " " + typeText;
                        button.id = "btn_" + type + "_" + state;
                        
                        if (type != "basic") {
                        
                            if (type == "acceptance" && state == "APPROVED" && responsePanel.getFieldValue('helpdesk_sla_response.activity_type') == 'SERVICE DESK - MAINTENANCE') {
                                // do nothing
                            }
                            else 
                                if (type == "dispatch" && state == "APPROVED" && responsePanel.getFieldValue('helpdesk_sla_response.activity_type') != 'SERVICE DESK - MAINTENANCE') {
                                // do nothing					
                                }
                                else {
                                    button.id = "btn_" + type + "_" + state;
                                    YAHOO.util.Event.addListener(button, "click", addStep, args);
                                    buttonContainer.appendChild(button);
                                }
                        }
                    }
                }
            }
        }
    }
}


/**
 * Add step<br />
 * Opens dialog to create new step
 * @param {Event} e event
 * @param {Array} args stepType and basicStatus
 */
addStep = function(e, args){
    /* type, statusValue
     basicStatus = statusValue;
     stepType = type;
     step = type; */
    stepType = args[0];
    step = stepType;
    
    basicStatus = args[1];
    
    // public 
    dropContainer = document.getElementById(basicStatus);
    
    element = document.createElement("li");
    element.className = "step";
    // element.setAttribute("class","step");	
    element.setAttribute("type", stepType);
    element.setAttribute("status", basicStatus);
    
    if (stepType != "notification") {
        element.setAttribute("notify_responsible", "false");
    }
    
    addNew = true;
    
    editStep(basicStatus, stepType, element, e);
}

/**
 * Edit step<br />
 * Opens dialog to edit a step
 * @param {String} state Status for selected step
 * @param {String} type Type of step
 * @param {Element} element Element to edit
 */
function editStep(state, type, element, e){
    dropItem = element;
    stepType = type;
    
    // public variable
    dropContainer = document.getElementById(state);
    
    populateSteps(type, state);
    populateConditionField(dropContainer.getAttribute("activity"), document.getElementById("condition_field"));
    populateConditionField(dropContainer.getAttribute("activity"), document.getElementById("condition_field_"));
    populateRoles(type);
    
    if (dropItem.getAttribute("condition") != null) {
        document.getElementById("helpdesk_sla_steps.condition").value = dropItem.getAttribute("condition");
        var condition = dropItem.getAttribute("condition");
        var terms = condition.split(" ");
        
        if (terms.length >= 7) {
            document.getElementById("condition_operand").value = terms[3];
            document.getElementById("condition_field_").value = terms[4];
            document.getElementById("condition_operator_").value = terms[5];
            document.getElementById("condition_value_").value = terms[6];
        }
        else {
            document.getElementById("condition_field_").value = "";
            document.getElementById("condition_value_").value = "";
        }
        
        if (terms.length >= 3) {
            document.getElementById("condition_field").value = terms[0];
            document.getElementById("condition_operator").value = terms[1];
            document.getElementById("condition_value").value = terms[2];
        }
        else {
            document.getElementById("condition_field").value = "";
            document.getElementById("condition_value").value = "";
        }
        
    }
    else {
        document.getElementById("condition_field").value = "";
        document.getElementById("condition_value").value = "";
        document.getElementById("condition_field_").value = "";
        document.getElementById("condition_value_").value = "";
    }
    
    if (dropItem.getAttribute("step") != null) {
        document.getElementById("helpdesk_sla_steps.step").value = dropItem.getAttribute("step");
    }
    else {
        document.getElementById("helpdesk_sla_steps.step").value = "";
    }
    
    if (dropItem.getAttribute("em_id") != null) 
        document.getElementById("helpdesk_sla_steps.em_id").value = dropItem.getAttribute("em_id");
    else 
        document.getElementById("helpdesk_sla_steps.em_id").value = "";
    
    if (dropItem.getAttribute("role") != null) {
        document.getElementById("helpdesk_sla_steps.role").value = dropItem.getAttribute("role");
        if (type == 'approval' && dropItem.getAttribute("multiple_required") != null && dropItem.getAttribute("role") != "") {
            document.getElementById("multiple_required_" + dropItem.getAttribute("multiple_required")).checked = true;
            enableRadioButtons("multiple_required", true);
        }
    }
    else {
        document.getElementById("helpdesk_sla_steps.role").value = "";
    }
    
    if (dropItem.getAttribute("notify_responsible") != null) {
        document.getElementById("notify_responsible_" + dropItem.getAttribute("notify_responsible")).checked = true;
        enableRadioButtons("notify_responsible", true);
    }
    
    if (type == "dispatch" || type == "scheduling" || type == "estimation") {
        hideStepField("Vendor");
        hideStepField("Craftsperson");
    }
    else 
        if (type == "acceptance") {
            hideStepField("Craftsperson");
        }
        else {
            showStepField("Vendor");
            showStepField("Craftsperson");
        }
    if (type != 'approval') {
        //hide radiobuttons for Multiple Required
        document.getElementById("dialogRowMultiple1").style.display = 'none';
        document.getElementById("dialogRowMultiple2").style.display = 'none';
    }
    else {
        document.getElementById("dialogRowMultiple1").style.display = '';
        document.getElementById("dialogRowMultiple2").style.display = '';
        if (dropItem.getAttribute("role") == null) {
            enableRadioButtons("multiple_required", false);
        }
    }
    
    if (type == 'notification') {
        //hide radiobuttons for 'Notify Responsible?'
        document.getElementById("dialogRowNotify").style.display = 'none';
    }
    else {
        document.getElementById("dialogRowNotify").style.display = '';
    }
    
    if (e != undefined) {
        //Guo change 2009-07-03 to solve KB3023417
        var pos = YAHOO.util.Event.getPageY(e);
        var topTitlePos = YAHOO.util.Dom.getY('panel_request_title');
        if (YAHOO.util.Event.isIE) {
            pos = pos - topTitlePos
        }
        $("dialog").style.top = 80;
        $("dialog").style.left = "100px";
    }
    
    openDialog();
}

/**
 * Populate selection element for steps<br />
 * Called by <a href='#user_form_onload'>user_form_onload</a>
 * @param {String} type type of steps required
 * @param {String} state starting state for steps in dropdown
 */
function populateSteps(type, state){
    var selectElement = document.getElementById("helpdesk_sla_steps.step");
    selectElement.length = 0;
    
    for (i = 0; i < steps.length; i++) {
        if (steps[i].state == state) {
            var types = steps[i].types;
            
            for (j = 0; j < types.length; j++) {
                if (types[j].type.value == type) {
                    var mySteps = types[j].steps;
                    
                    if (mySteps.length > 1) {
                        var selectTitle = '';
                        if (getMessage('selectTitle') != "") 
                            selectTitle = getMessage('selectTitle');
                        
                        var option = new Option(selectTitle, "");
                        selectElement.options[0] = option;
                        selectElement.length = 1;
                        for (k = 0; k < mySteps.length; k++) {
                            selectElement.length = selectElement.length + 1;
                            var option = new Option(mySteps[k].text, mySteps[k].step);
                            selectElement.options[k + 1] = option;
                        }
                    }
                    else 
                        if (mySteps.length == 1) {
                            var option = new Option(mySteps[0].text, mySteps[0].step);
                            selectElement.options[0] = option;
                        }
                    
                }
            }
        }
    }
}



function populateConditionField(activity_id, selectElement){
    // var selectElement = document.getElementById("condition_field");
    selectElement.length = 0;
    if (activity_id == 'AbBldgOpsHelpDesk') 
        optionMap = helpdeskConditionFields;
    else 
        if (activity_id = 'AbBldgOpsOnDemandWork') 
            optionMap = ondemandConditionFields;
        else 
            return;
    
    
    // get "-select" localized string 
    var selectTitle = '';
    if (getMessage('selectTitle') != "") 
        selectTitle = getMessage('selectTitle');
    
    var option = new Option(selectTitle, "");
    selectElement.options[0] = option;
    for (i = 0; i < optionMap.length; i++) {
        var option = new Option(optionMap[i].text, optionMap[i].value);
        selectElement.options[i + 1] = option;
    }
}

function populateRoles(type){
    document.getElementById("helpdesk_sla_steps.role").options.length = 0;
    ABHDC_populateSelectList("helpdesk_roles", "role", "role", "helpdesk_sla_steps.role", "step_type='" + type + "'");
    if (document.getElementById("helpdesk_sla_steps.role").options.length == 0) {
        document.getElementById("dialogRowRole").style.display = 'none';
        document.getElementById("dialogRowMultiple1").style.display = 'none';
        document.getElementById("dialogRowMultiple2").style.display = 'none';
    }
}


function ABHDC_populateSelectList(tableName, valueField, textField, selectElement, where){
    var parameters;
    if (where != 'undefined') {
        where = ""
    }
    
    var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getSelectList", tableName, valueField, textField, where);
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        var items = res.items;
        var selectElement = document.getElementById(selectElement);
        
        // get "-select" localized string 
        var selectTitle = '';
        if (getMessage('selectTitle') != "") 
            selectTitle = getMessage('selectTitle');
        
        var option = new Option(selectTitle, "");
        selectElement.options[0] = option;
        
        var j = 1;
        for (i = 0; i < items.length; i++) {
            if (items[i].value != undefined) {
                if (items[i].text == undefined ||
                items[i].text == 'undefined' ||
                items[i].text == '') {
                    items[i].text = 'N/A';
                    items[i].value = 'N/A';
                }
                var option = new Option(items[i].text, items[i].value);
                selectElement.options[j] = option;
                j++;
            }
        }
        
    }
    else {
        AFM.workflow.Workflow.handleError(result);
    }
}

function hideStepField(field){
    if ($("dialogRow" + field)) {
        $("dialogRow" + field).style.display = 'none';
    }
}

function showStepField(field){
    //$("dialogRow"+field).style.display = 'inline';
    if ($("dialogRow" + field)) {
        $("dialogRow" + field).removeAttribute("style");
    }
}

/**
 * Open new dialog window for a step
 */
function openDialog(){
    document.getElementById("dialog").style.display = "block";
    enableAllFields();
}

/**
 * Close dialog
 */
function closeDialog(){
    document.getElementById("dialog").style.display = "none";
}


/**
 * Save created/updated step<br >
 * Add extra item to step list for new step<br />
 */
function onSetStep(){
    if ($("helpdesk_sla_steps.em_id").value == "" &&
    $("helpdesk_sla_steps.role").value == "") {
        View.showMessage(getMessage("assigneeRequired"));
        return false;
    }
    
    
    if (addNew) {
        dropContainer.appendChild(dropItem);
    }
    
    var statusValue = dropContainer.getAttribute("state");
    
    // dropItem.setAttribute("class","step");
    dropItem.className = "step";
    dropItem.setAttribute("category", stepType);
    dropItem.setAttribute("type", stepType);
    dropItem.setAttribute("status", statusValue);
    
    step = document.getElementById("helpdesk_sla_steps.step").value;
    if (!step) {
        View.alert("请先选择一个类型");
        return;
    }
    dropItem.setAttribute("step", step);
    
    dropItem.setAttribute("multiple_required", "false");
    dropItem.setAttribute("em_id", document.getElementById("helpdesk_sla_steps.em_id").value);
    dropItem.setAttribute("role", document.getElementById("helpdesk_sla_steps.role").value);
    
    if (dropItem.getAttribute("type") != 'notification') {
        if (document.getElementById("notify_responsible_true").checked) {
            dropItem.setAttribute("notify_responsible", "true");
        }
        else {
            dropItem.setAttribute("notify_responsible", "false");
        }
    }
    
    dropItem.innerHTML = '';
    var txt = step.substring(0, 1).toUpperCase() + step.substring(1, step.length);
    if (dropItem.getAttribute("em_id") != null || dropItem.getAttribute("role") != null) {
        txt += " " + getMessage("by") + " " + dropItem.getAttribute("em_id") + dropItem.getAttribute("role");
    }
    
    setInnerHTML(dropItem, txt);
    addNew = false;
    closeDialog();
}


/**
 * Set innerHTML for new step
 * @param {Element} dropItem li element to add
 * @param {String} txt Text for new element
 */
function setInnerHTML(dropItem, txt){
    // drop item is the <li> element
    dropItem.innerHTML = '';
    
    var table = document.createElement("table");
    table.setAttribute("width", "700");
    
    // for append row set index = -1
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.setAttribute("width", 20);
    addIcon(cell, dropItem.getAttribute("category"));
    
    cell = row.insertCell(-1);
    cell.setAttribute("width", 630);
    cell.className = "txt";
    // cell.setAttribute("class", "txt");
    cell.setAttribute("style", "font-size: 11px;");
    cell.appendChild(document.createTextNode(txt));
    
    cell = row.insertCell(-1);
    cell.setAttribute("width", 50);
    addControlButtons(cell);
    
    dropItem.appendChild(table);
}


/**
 * Add icon to step element
 * @param {Element} element Element to add icon to
 * @param {String} category Type of icon
 */
function addIcon(element, category){
    var src = image_path + category + ".png";
    
    var img = document.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("border", "0");
    
    img.setAttribute("align", "left");
    img.setAttribute("valign", "middle");
    
    element.appendChild(img);
}


/**
 * Add control buttons to step element
 * @param {Element} element Element to add buttons to
 */
function addControlButtons(element){

    element.setAttribute("align", "right");
    
    var img1 = document.createElement("img");
    img1.setAttribute("src", image_path + "edit.png");
    img1.setAttribute("border", "0");
    img1.style.cursor = "pointer";
    // img - td - tr - table - li 
    // img1.onclick = function(){ editElement(this.parentNode.parentNode.parentNode.parentNode.parentNode); };
    
    //var li = element.parentNode.parentNode.parentNode.parentNode.parentNode; 
    
    YAHOO.util.Event.addListener(img1, "click", editElement, element);
    
    var img2 = document.createElement("img");
    img2.setAttribute("src", image_path + "delete.png");
    img2.setAttribute("border", "0");
    img2.style.cursor = "pointer";
    // img - td - tr - table - li 
    img2.onclick = function(){
        deleteElement(this.parentNode.parentNode.parentNode.parentNode.parentNode);
    };
    
    element.appendChild(img1);
    element.appendChild(img2);
    
    return element;
}

/**
 * Edit step element
 * @param {Element} element Element to edit
 */
editElement = function(e, obj){
    var element = obj.parentNode.parentNode.parentNode.parentNode;
    
    var category = element.getAttribute("category");
    // public variable
    dropContainer = element.parentNode;
    var state = dropContainer.getAttribute("state");
    
    editStep(state, category, element, e);
}

/**
 * Enable all fields in the step dialog
 */
function enableAllFields(){
    enableField("helpdesk_sla_steps.em_id");
    enableField("helpdesk_sla_steps.role");
}

/**
 * Enable given field in the step dialog
 * @param {String} field field name
 */
function enableField(field){
    if ($(field)) {
        $(field).style.readOnly = false;
        $(field).disabled = false;
    }
}


function selectStepsEmployee(){
    //select dispatcher for dispatch step
    if (dropItem.getAttribute("type") == 'dispatch') {
        var sql = "email IN (SELECT email FROM afm_users WHERE role_name like '%DISPATCH%')";
        View.selectValue('', getMessage('dispatcher'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], sql, afterSelectEmployee);
    }
    else 
        if (dropItem.getAttribute("type") == 'scheduling') {
            var form = View.panels.get('panel_ondemand_response');
            var workTeamId = form.getFieldValue("helpdesk_sla_response.work_team_id");
            var supervisor = form.getFieldValue("helpdesk_sla_response.supervisor");
            //select planner for schedule step
            var sql = "email IN (SELECT email FROM cf WHERE is_planner = 1)"
            if (workTeamId) {
                sql = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND work_team_id = '" +
                workTeamId +
                "')";
            }
            else 
                if (supervisor) {
                    sql = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND " +
                    "work_team_id = (SELECT work_team_id FROM cf WHERE email = " +
                    "(SELECT email FROM em WHERE em_id = '" +
                    supervisor +
                    "')))";
                }
            View.selectValue('', getMessage('planner'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.name', 'em.dv_id', 'em.email'], sql, afterSelectEmployee);
        }
        else 
            if (dropItem.getAttribute("type") == 'estimation') {
                //select estimator for estimation step
                var sql = "email IN (SELECT email FROM cf WHERE is_estimator = 1)";
                View.selectValue('', getMessage('estimator'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.name', 'em.dv_id','em.email'], sql, afterSelectEmployee);
            }
            else {
                var restriction = "EXISTS(SELECT 1 FROM afm_users WHERE em.email = afm_users.email)";
                View.selectValue('', getMessage('employee'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.name', 'em.dv_id','em.email'], restriction, afterSelectEmployee);
            }
}

/**
 * Called after an employee is selected for a step<br />
 * Disables fields for craftsperson, vendor and role
 */
function afterSelectEmployee(fieldName, newValue, oldValue){
    document.getElementById(fieldName).value = newValue;
    enableField("helpdesk_sla_steps.em_id");
    $("helpdesk_sla_steps.role").value = "";
    enableRadioButtons("multiple_required", false);
}


function setPanelRecord(panelId, record){
    var panel = View.panels.get(panelId);
    panel.setRecord(record);
    panel.show(true);
}


/**
 * Enter the current user in the manager field
 */
function setDefaultSlaManager(){
    if (responsePanel.getFieldValue('helpdesk_sla_response.manager') == "") {
        responsePanel.setFieldValue("helpdesk_sla_response.manager", View.user.name);
    }
}

/**
 * Fill in time to respond<br />
 * Used when loading the form
 */
function setTimeToRespond(){
    var interval = responsePanel.getFieldValue("helpdesk_sla_response.interval_to_respond");
    var value = responsePanel.getFieldValue("helpdesk_sla_response.time_to_respond");
    document.getElementById("helpdesk_sla_response.time_to_respond").value = value;
    document.getElementById("helpdesk_sla_response.interval_to_respond").value = interval;
}

/**
 * Fill in time to complete<br />
 * Used when loading the form
 */
function setTimeToComplete(){
    var interval = responsePanel.getFieldValue("helpdesk_sla_response.interval_to_complete");
    var value = responsePanel.getFieldValue("helpdesk_sla_response.time_to_complete");
    document.getElementById("helpdesk_sla_response.time_to_complete").value = value;
    document.getElementById("helpdesk_sla_response.interval_to_complete").value = interval;
}

/**
 * Get time to respond from submitted form<br />
 * Used when saving the form
 */
function getTimeToRespond(){
    var interval = document.getElementById("helpdesk_sla_response.interval_to_respond").value;
    var value = document.getElementById("helpdesk_sla_response.time_to_respond").value;
    responsePanel.setFieldValue("helpdesk_sla_response.time_to_respond", value);
    responsePanel.setFieldValue("helpdesk_sla_response.interval_to_respond", interval);
}

/**
 * Get time to complete from submitted form<br />
 * Used when saving the form
 */
function getTimeToComplete(){
    var interval = document.getElementById("helpdesk_sla_response.interval_to_complete").value;
    var value = document.getElementById("helpdesk_sla_response.time_to_complete").value;
    responsePanel.setFieldValue("helpdesk_sla_response.time_to_complete", value);
    responsePanel.setFieldValue("helpdesk_sla_response.interval_to_complete", interval);
}

function checkTimes(){
    if (document.getElementById("helpdesk_sla_response.interval_to_respond").value == document.getElementById("helpdesk_sla_response.interval_to_complete").value) {
        if (parseFloat(document.getElementById("helpdesk_sla_response.time_to_complete").value) < parseFloat(document.getElementById("helpdesk_sla_response.time_to_respond").value)) {
            return false;
        }
    }
    return true;
}

function checkServiceWindow(){
    if (document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_start").value != "" &&
    document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_end").value != "") {
        var startTime = document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_start").value;
        var endTime = document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_end").value;
        var startArr = startTime.split(":");
        var endArr = endTime.split(":");
        var start = parseFloat(startArr[0]);
        var end = parseFloat(endArr[0]);
        return start < end;
    }
    else 
        return true;
}

/**
 * Check form before saving<br />
 * Required fields:
 * 	<ul>
 * 		<li>Manager</li>
 * 		<li>Employee or Vendor or Acceptance Step for Helpdesk workflow</li>
 * 		<li>Supervisor or Trade or Dispatch Step for On demand Workflow</li>
 * 		<li>Default duration for a craftsperson for On demand work</li>
 * 	</ul>
 * @return true if form is ok, false if values are missing
 */
function displayInvalidHtmlField(id, errorMessage, form){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).addClass('formErrorInput');
    var errorBreakElement = document.createElement('br');
    errorBreakElement.className = 'formErrorText';
    fieldInputTd.appendChild(errorBreakElement);
    
    var errorTextElement = document.createElement('span');
    errorTextElement.className = 'formErrorText';
    errorTextElement.appendChild(document.createTextNode(errorMessage));
    fieldInputTd.appendChild(errorTextElement);
    View.showMessage('error', form.validationResult.message);
}

function clearInvalidHtmlField(id){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).removeClass('formErrorInput');
    
    // remove per-field error messages
    var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
    for (var e = 0; e < errorTextElements.length; e++) {
        fieldInputTd.removeChild(errorTextElements[e]);
    }
}

function checkForm(){
    requestPanel.clearValidationResult();
    responsePanel.clearValidationResult();
    clearInvalidHtmlField('helpdesk_sla_response.time_to_complete');
    ondemandPanel.clearValidationResult();
    if (!checkTimes()) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_complete", getMessage("timeToRespondVsComplete"));
        displayInvalidHtmlField('helpdesk_sla_response.time_to_complete', getMessage("timeToRespondVsComplete"), responsePanel)
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowStart"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_end", getMessage("serviceWindowEnd"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!checkServiceWindow()) {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowTimes"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!isFinite(document.getElementById("helpdesk_sla_response.time_to_respond").value)) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_respond", getMessage("enterInteger"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!isFinite(document.getElementById("helpdesk_sla_response.time_to_complete").value)) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_complete", getMessage("enterInteger"));
        responsePanel.displayValidationResult();
        return false;
    }
    
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") {
        /*alert(getMessage("serviceWindowStartEndRequired"));
         document.getElementById("helpdesk_sla_response.serv_window_start").focus();*/
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") {
        /*alert(getMessage("serviceWindowStartEndRequired"));
         document.getElementById("helpdesk_sla_response.serv_window_end").focus();*/
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_end", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    
    
    // manager is required
    //if (responsePanel.getFieldValue("helpdesk_sla_response.manager") == "") {
    //alert(getMessage("noManager"));
    //document.getElementById("helpdesk_sla_response.manager").focus();
    // responsePanel.addInvalidField("helpdesk_sla_response.manager", getMessage("noManager"));
    // responsePanel.displayValidationResult();
    //return false;
    //}
    
    
    //check dispatching
    
    //if (ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor") != "" || ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id") != "") {
    //    ondemandPanel.setFieldValue("helpdesk_sla_response.autodispatch", 1);
    // }
    // else {
    //   ondemandPanel.addInvalidField("helpdesk_sla_response.supervisor", getMessage("noDispatcher"));
    // ondemandPanel.displayValidationResult();
    //return false;
    //}
    return true;
}

/**
 * Save the form<br />
 * Called by <a href='#onSave'>onSave()</a>
 * <div class='detailHead'>Pseudo-code:</div>
 * <ol>
 * 		<li><a href='#checkForm'>Check form</a></li>
 * 		<li>Create XML for steps</li>
 * 		<li>Get <a href='#getTimeToRespond'>time to respond</a> and <a href='#getTimeToComplete'>time to complete</a></li>
 * 		<li>Get form values</li>
 * 		<li>Call WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/ServiceLevelAgreementHandler.html#saveSLAResponseParameters(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveSLAResponseParameters</a> to save values</li>
 * 		<li>Return the WFR result</li>
 * </ol>
 */
function saveForm(){
    if (!checkForm()) {
        return;
    }
    
    var uls = document.getElementsByTagName("ul");
    
    // alert(uls)
    
    var j = 0;
    var state = "";
    var xml = "<states>";
    
    responsePanel.setFieldValue("helpdesk_sla_response.autoapprove", 1);
    responsePanel.setFieldValue("helpdesk_sla_response.autoaccept", 1);
    View.panels.get('panel_ondemand_response').setFieldValue("helpdesk_sla_response.autodispatch", 1);
    
    for (var i = 0; i < uls.length; i++) {
        var ul = uls[i];
        
        if (ul.getAttribute("state") != null && ul.getAttribute("state") != state) {
            state = ul.getAttribute("state");
            
            activity = ul.getAttribute("activity");
            
            if (xml != "<states>") 
                xml += "</state>";
            
            xml += '<state activity="' + activity + '"  value="' + ul.getAttribute("state") + '">';
        }
        
        var lis = ul.getElementsByTagName("li");
        
        for (var x = 0; x < lis.length; x++) {
            var step_type = lis[x].getAttribute("type");
            xml += '<' + step_type + ' ';
            
            if (state == "REQUESTED" && (step_type == "approval" || step_type == "review")) {
                responsePanel.setFieldValue("helpdesk_sla_response.autoapprove", 0);
            }
            if (state == "APPROVED" && step_type == "acceptance") {
                responsePanel.setFieldValue("helpdesk_sla_response.autoaccept", 0);
            }
            if (state == "APPROVED" && step_type == "dispatch") {
                View.panels.get('panel_ondemand_response').setFieldValue("helpdesk_sla_response.autodispatch", 0);
            }
            
            if (lis[x].getAttribute("step") != null && lis[x].getAttribute("step") != "") 
                xml += ' step="' + encodeURIComponent(lis[x].getAttribute("step")) + '"';
            
            if (lis[x].getAttribute("condition") != null && lis[x].getAttribute("condition") != "") 
                xml += ' condition="' + lis[x].getAttribute("condition").replace("<", "&lt;").replace(">", "&gt;") + '"';
            
            if (lis[x].getAttribute("em_id") != null && lis[x].getAttribute("em_id") != "") 
                xml += ' em_id="' + encodeURIComponent(lis[x].getAttribute("em_id")) + '"';
            if (lis[x].getAttribute("vn_id") != null && lis[x].getAttribute("vn_id") != "") 
                xml += ' vn_id="' + encodeURIComponent(lis[x].getAttribute("vn_id")) + '"';
            if (lis[x].getAttribute("cf_id") != null && lis[x].getAttribute("cf_id") != "") 
                xml += ' cf_id="' + encodeURIComponent(lis[x].getAttribute("cf_id")) + '"';
            if (lis[x].getAttribute("role") != null && lis[x].getAttribute("role") != "") 
                xml += ' role="' + encodeURIComponent(lis[x].getAttribute("role")) + '"';
            
            if (lis[x].getAttribute("multiple_required") != null && lis[x].getAttribute("multiple_required") != "") 
                xml += ' multiple_required="' + lis[x].getAttribute("multiple_required") + '"';
            
            if (lis[x].getAttribute("notify_responsible") != null && lis[x].getAttribute("notify_responsible") != "") {
                xml += ' notify_responsible="' + lis[x].getAttribute("notify_responsible") + '"';
            }
            
            xml += '/>';
            // end if
        } // end for x		
    } // end for i
    if (xml == "<states>") 
        xml += "</states>";
    else 
        xml += "</state></states>";
    
    getTimeToRespond();
    getTimeToComplete();
    var record = getSavingRecord();
    var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAResponseParameters', record, xml);
    
    if (result.code != 'executed') {
        Workflow.handleError(result);
    }
    return result;
}

function getSavingRecord(){

    var record = {};
    for (var i = 0; i < responsePanel.fields.items.length; i++) {
        var fieldName = responsePanel.fields.items[i].fieldDef.id;
        if (/^helpdesk_sla_response./.test(fieldName)) {
            var fieldValue = responsePanel.getFieldValue(fieldName);
            record[fieldName] = fieldValue;
        }
    }
    
    record['helpdesk_sla_response.status'] = 'Active';
    record['helpdesk_sla_response.supervisor'] = ondemandPanel.getFieldValue('helpdesk_sla_response.supervisor');
    record['helpdesk_sla_response.work_team_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.work_team_id');
    record['helpdesk_sla_response.cf_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.cf_id');
    record['helpdesk_sla_response.default_duration'] = ondemandPanel.getFieldValue('helpdesk_sla_response.default_duration');
    record['helpdesk_sla_response.notify_service_provider'] = ondemandPanel.getFieldValue('helpdesk_sla_response.notify_service_provider');
    record['helpdesk_sla_response.notify_craftsperson'] = ondemandPanel.getFieldValue('helpdesk_sla_response.notify_craftsperson');
    record['helpdesk_sla_response.autoapprove'] = 0;
    record['helpdesk_sla_response.autoaccept'] = 0;
    record['helpdesk_sla_response.autodispatch'] = 0;
    record['helpdesk_sla_response.autoissue'] = 0;
    return record;
}

/**
 * Save form
 * <div class='detailHead'>Pseudo-code</div>
 * <ol>
 * 		<li><a href='#saveForm'>Save Form</a> (returns WFR result)</li>
 * 		<li>If WFR is executed, create restriction for next tab and <a href='#selectTab'>select next tab</a></li>
 * </ol>
 */
function onSave(){
    var result = saveForm();
    if (result == null) 
        return;
    
    if (result.code == 'executed') {
        var tabs = View.getControlsByType(parent, 'tabs')[0];
        tabs.selectTab("select");
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Check radio button
 * @param {String} radioField name of button element
 * @param {String} dbField name of element with database value
 */
function setRadioButton(radioField, dbField, panelId){
    var dbValue = View.panels.get(panelId).getFieldValue(dbField);
    var buttons = document.getElementsByName(radioField);
    if (dbValue != "") {
        if (dbValue == 1) {
            buttons[0].checked = true;
        }
        else 
            if (dbValue == 0) {
                buttons[1].checked = true;
            }
    }
}



/**
 * Set service days<br />
 * Check checkboxes for service days<br />
 * Input in serv_window_days element: x,x,x,x,x,x,x where x = 0 (day off) or 1 (working day)
 */
function setServiceWindow(){
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days") == "") { // new, set default values
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_days", "0,1,1,1,1,1,0");
    }
    
    var serv_days = responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days");
    var days = serv_days.split(",", 7);
    for (var i = 0; i < 7; i++) {
        if (days[i] == 1) {
            var check = document.getElementById("days" + i);
            check.checked = true;
        }
    }
    
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") 
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_start", "09:00");
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") 
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_end", "17:00");
}


/**
 * Set service day in serv_window_days
 * @param {int} id : index of element in array with service window days to change
 */
function setServiceDay(id){
    var serv_days = responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days");
    
    if (serv_days != "") {
        var check = document.getElementById("days" + id);
        var days = serv_days.split(",", 7);
        if (check.checked) {
            days[id] = 1;
        }
        else {
            days[id] = 0;
        }
        var sd = "";
        for (var i = 0; i < 7; i++) {
            sd += days[i] + ",";
        }
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_days", sd.substring(0, 13));
    }
}

/**
 * Select craftsperson<br />
 * If trade is selected, only provide craftspersons of selected trade
 */
function selectCraftsperson(){
    var workTeamId = ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id");
    var supervisor = ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor");
    var sql = "cf.assign_work = 1";
    if (workTeamId) {
        sql += " AND cf.work_team_id='" + workTeamId + "'";
    }
    else 
        if (supervisor) {
            sql += " AND cf.work_team_id = (SELECT work_team_id FROM cf WHERE email = (SELECT email FROM em WHERE em_id = '" + supervisor + "'))";
        }
    View.selectValue('panel_ondemand_response', getMessage('craftsperson'), ['helpdesk_sla_response.cf_id'], 'cf', ['cf.cf_id'], ['cf.cf_id', 'cf.name', 'cf.tr_id', 'cf.work_team_id'], sql);
}


/**
 * Disable given field in the step dialog
 * @param {String} field field name
 */
function disableField(field){
    if ($(field)) {
        $(field).value = "";
        $(field).style.readOnly = true;
        $(field).disabled = true;
    }
}



/**
 * Called when an option for the dispatching of a request is selected<br />
 * Enables/Disables fields for supervisor and or trade or adds dispatch step
 * @param {String} type dispatch type (supervisor, work_team_id or dispatch)
 */
function selectDispatching(type){
    if (type == 'supervisor') {
        ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
        ondemandPanel.enableField("helpdesk_sla_response.supervisor", true);
        ondemandPanel.setFieldValue("helpdesk_sla_response.work_team_id", "");
    }
    else 
        if (type == 'work_team_id') {
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", true);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
            ondemandPanel.setFieldValue("helpdesk_sla_response.supervisor", "");
        }
}

/**
 * Selects radio button and enables/disables fields for dispatching of request
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setDispatching(){
    var dispatch = '';
    if (ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor")) {
        dispatch = "supervisor";
        ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
        ondemandPanel.enableField("helpdesk_sla_response.supervisor", true);
    }
    else 
        if (ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id")) {
            dispatch = "work_team_id";
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", true);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
        }
        else {
            dispatch = "dispatch";
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
        }
    var buttons = document.getElementsByName("dispatching");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == dispatch) {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
}

/**
 * Called after a dispatch step is added<br />
 * Disables and empties fields for supervisor and trade<br />
 */
function afterAddDispatch(){
    ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
    ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
    ondemandPanel.setFieldValue("helpdesk_sla_response.work_team_id", "");
    ondemandPanel.setFieldValue("helpdesk_sla_response.supervisor", "");
    var buttons = document.getElementsByName("dispatching");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == "dispatch") {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
}



function enableRadioButtons(buttonName, enabled){
    var buttons = document.getElementsByName(buttonName);
    for (i = 0; i < buttons.length; i++) {
        if (enabled) 
            buttons[i].removeAttribute("disabled");
        else 
            buttons[i].disabled = true;
    }
}

/**
 * Autodispatch = dispatch to supervisor or workteam, not by dispatch step
 */
function checkAutoDispatch(){
    var buttons = document.getElementsByName("dispatching");
    if (buttons[2].checked == true) {
        View.showMessage(getMessage("autoDispatch"))
        return false;
    }
    else {
        return true;
    }
}

function onShowServContDetails(){
    var servcont = responsePanel.getFieldValue('helpdesk_sla_response.servcont_id');
    if (servcont != '') {
        var rest = new Ab.view.Restriction();
        rest.addClause('servcont.servcont_id', servcont);
        View.openDialog("ab-pm-servcont-detl.axvw", rest, false, 10, 10, 600, 400);
    }
}


function selectServiceContract(){
    View.selectValue('panel_response', getMessage('serviceContract'), ['helpdesk_sla_response.servcont_id'], 'servcont', ['servcont.servcont_id'], ['servcont.servcont_id', 'servcont.description', 'servcont.date_expiration'])
}

function setFormFieldValue(panelId, filedName, value){
    View.panels.get(panelId).setFieldValue(filedName, value);
}

function selectSupervisor(){
    View.selectValue("panel_ondemand_response", getMessage('supervisor'), ['helpdesk_sla_response.supervisor'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)');
}


/**
 * Called after an employee is selected for a step<br />
 * Disables fields for craftsperson, vendor and employee
 */
function afterSelectRole(){
    if ($("helpdesk_sla_steps.role").value != "") {
        enableField("helpdesk_sla_steps.role");
        disableField("helpdesk_sla_steps.em_id");
        disableField("helpdesk_sla_steps.vn_id");
        disableField("helpdesk_sla_steps.cf_id");
        enableRadioButtons("multiple_required", true);
    }
    else {
        $("helpdesk_sla_steps.em_id").disabled = false;
        $("helpdesk_sla_steps.vn_id").disabled = false;
        $("helpdesk_sla_steps.cf_id").disabled = false;
        enableRadioButtons("multiple_required", false);
    }
}

function onSelectConditionValue(fieldName, fieldValueName){
    if (document.getElementById(fieldName).value != "") {
        var activityId = dropContainer.getAttribute("activity");
        var conditionValue = document.getElementById(fieldName).value;
        var result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSelectValueForConditionField", activityId, conditionValue);
        if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
            if (res.table != undefined && res.field != undefined) {
                View.selectValue('panel_response', '', [fieldValueName], res.table, [res.table + "." + res.field], [res.table + "." + res.field], null, afterSelectConditionValue);
            }
            else {
                return;
            }
        }
        else {
            Workflow.handleError(result);
        }
    }
    else {
        View.showMessage(getMessage("selectConditionField"));
    }
}

function afterSelectConditionValue(fieldName, newValue, oldValue){
    $(fieldName).value = newValue;
}

// esacape and set quotes
function literal(value){
    if (value.indexOf("'") == 0 && value.lastIndexOf("'") + 1 == value.length) {
        //value already between quotes?
        return value;
    }
    else {
        return "'" + value + "'";
    }
}


/**
 *	get condition text value
 */
function getConditionText(activity_id, condition){
    var parts = condition.split(" ");
    // first condition field
    if (parts.length > 2) {
        parts[0] = getFieldTitle(activity_id, parts[0]);
    }
    // second condition field
    if (parts.length > 5) {
        parts[4] = getFieldTitle(activity_id, parts[4]);
    }
    
    return parts.join(" ");
}



/**
 * 	get descriptive text value for condition field
 */
function getFieldTitle(activity_id, field){
    var fieldTxt = "";
    var options;
    if (activity_id == 'AbBldgOpsHelpDesk') {
        options = helpdeskConditionFields;
    }
    else 
        if (activity_id == 'AbBldgOpsOnDemandWork') {
            options = ondemandConditionFields;
        }
        else {
            return field;
        }
    
    for (i = 0; i < options.length; i++) {
        if (options[i].value == field) 
            return options[i].text;
    }
}

/**
 * Delete step element
 * @param {Element} element Element to delete
 */
function deleteElement(element){
    var container = element.parentNode;
    container.removeChild(element);
}
