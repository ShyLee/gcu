/**
 * @author Guo Jiangtao
 */

// this is called by the SWF control if custom color is desired
function getColorForRecord(record) {
	var color = 0xFFFFFF;
	if (calendarControl.colorField == 'activity_log.status') {
		color = getColorByStatus(record);
	} else if (calendarControl.colorField == 'regrequirement.priority') {
		color = getColorByPriority(record);
	} else if (calendarControl.colorField == 'regrequirement.regreq_type') {
		color = getColorByRequiementType(record);
	}

	return color;
}

//set calendar control instruction
function setInstruction(panel,colorField) {
	if (colorField == 'activity_log.status') {
		setInstructionByStatus(panel);
	} else if (colorField == 'regrequirement.priority') {
		setInstructionByPriority(panel);
	} else if (colorField == 'regrequirement.regreq_type') {
		setInstructionByRequiementType(panel);
	}
}

// get color by field activity_log.status
function getColorByStatus(record) {
	var color = 0x5186BD;
	var status = record.getValue('activity_log.status');

	if (status == 'SCHEDULED') {
		color = 0x666600;
	} else if (status == 'CANCELLED') {
		color = 0x9900FF;
	} else if (status == 'IN PROGRESS') {
		color = 0x0000FF;
	} else if (status == 'IN PROCESS-H') {
		color = 0xFF00FF;
	} else if (status == 'STOPPED') {
		color = 0xFF9900;
	} else if (status == 'COMPLETED') {
		color = 0x009900;
	} else if (status == 'COMPLETED-V') {
		color = 0x009900;
	} else if (status == 'CLOSED') {
		color = 0x66FF33;
	}
	
	if(record.getValue('activity_log.isOverdue')=='true'){
		color = 0xFF0000;
	}

	return color;
}

//set calendar control instruction by field activity_log.status
function setInstructionByStatus(panel) {
	var instructions = "<span>" + getMessage('EVENT_CALENDAR_MESS1') + ":</span>";
	instructions += "<span style='color:#666600'>" + getMessage('EVENT_CALENDAR_MESS2') + ", </span>";
	instructions += "<span style='color:#9900FF'>" + getMessage('EVENT_CALENDAR_MESS3') + ", </span>";
	instructions += "<span style='color:#0000FF'>" + getMessage('EVENT_CALENDAR_MESS4') + ", </span>";
	instructions += "<span style='color:#FF00FF'>" + getMessage('EVENT_CALENDAR_MESS5') + ", </span>";
	instructions += "<span style='color:#FF9900'>" + getMessage('EVENT_CALENDAR_MESS6') + ", </span>";
	instructions += "<span style='color:#009900'>" + getMessage('EVENT_CALENDAR_MESS7') + ", </span>";
	instructions += "<span style='color:#66FF33'>" + getMessage('EVENT_CALENDAR_MESS8') + ", </span>";
	instructions += "<span style='color:#5186BD'>" + getMessage('EVENT_CALENDAR_MESS9') + ", </span>";
	instructions += "<span style='color:#FF0000'>" + getMessage('EVENT_CALENDAR_MESS10') + "</span>";
	panel.setInstructions(instructions);
}

// get color by field regrequirement.priority
function getColorByPriority(record) {
	var color = 0xFFFFFF;
	var priority = record.getValue('regrequirement.priority');
	if (priority == '1') {
		color = 0xFF0000;
	} else if (priority == '2') {
		color = 0xC00000;
	} else if (priority == '3') {
		color = 0xFF9900;
	} else if (priority == '4') {
		color = 0xFF00FF;
	} else if (priority == '5') {
		color = 0x00B0F0;
	} else if (priority == '6') {
		color = 0x31849B;
	} else if (priority == '7') {
		color = 0x666600;
	} else if (priority == '8') {
		color = 0x548B54;
	} else if (priority == '9') {
		color = 0x009900;
	} 

	return color;
}

//set calendar control instruction by field regrequirement.priority
function setInstructionByPriority(panel) {
	var instructions = "<span>" + getMessage('EVENT_CALENDAR_MESS11') + ":</span>";
	instructions += "<span style='color:#FF0000'>" + getMessage('EVENT_CALENDAR_MESS12') + ", </span>";
	instructions += "<span style='color:#C00000'>" + getMessage('EVENT_CALENDAR_MESS13') + ", </span>";
	instructions += "<span style='color:#FF9900'>" + getMessage('EVENT_CALENDAR_MESS14') + ", </span>";
	instructions += "<span style='color:#FF00FF'>" + getMessage('EVENT_CALENDAR_MESS15') + ", </span>";
	instructions += "<span style='color:#00B0F0'>" + getMessage('EVENT_CALENDAR_MESS16') + ", </span>";
	instructions += "<span style='color:#31849B'>" + getMessage('EVENT_CALENDAR_MESS17') + ", </span>";
	instructions += "<span style='color:#666600'>" + getMessage('EVENT_CALENDAR_MESS18') + ", </span>";
	instructions += "<span style='color:#548B54'>" + getMessage('EVENT_CALENDAR_MESS19') + ", </span>";
	instructions += "<span style='color:#009900'>" + getMessage('EVENT_CALENDAR_MESS20') + "</span>";
	panel.setInstructions(instructions);
}

// get color by field regrequirement.regreq_type
function getColorByRequiementType(record) {
	var color = 0xFFFFFF;
	var type = record.getValue('regrequirement.regreq_type');
	if (type == 'Abatement') {
		color = 0xFF00FF;
	} else if (type == 'Assessment/Remediation') {
		color = 0x0000FF;
	} else if (type == 'Audit') {
		color = 0x009900;
	} else if (type == 'Corrective Action') {
		color = 0x9900FF;
	} else if (type == 'Documentation') {
		color = 0xFF99FF;
	} else if (type == 'Emergency Response') {
		color = 0x66FF33;
	} else if (type == 'Inspection') {
		color = 0xFF9900;
	} else if (type == 'License' || type == 'Permit') {
		color = 0x00B0F0;
	} else if (type == 'Maintenance') {
		color = 0x666600;
	} else if (type == 'Measurement') {
		color = 0x31849B;
	} else if (type == 'Medical Monitoring') {
		color = 0xFF0000;
	} else if (type == 'Monitoring') {
		color = 0xC00000;
	} else if (type == 'Other') {
		color = 0x000000;
	} else if (type == 'Other Action') {
		color = 0x5186BD;
	} else if (type == 'Reporting') {
		color = 0x5C246E;
	} else if (type == 'Sampling') {
		color = 0x9BBB59;
	} else if (type == 'Training') {
		color = 0x548B54;
	}
	return color;
}

//set calendar control instruction by field regrequirement.regreq_type
function setInstructionByRequiementType(panel) {
	var instructions = "<span>" + getMessage('EVENT_CALENDAR_MESS21') + ":</span>";
	instructions += "<span style='color:fuchsia'>" + getMessage('EVENT_CALENDAR_MESS22') + ", </span>";
	instructions += "<span style='color:blue'>" + getMessage('EVENT_CALENDAR_MESS23') + ", </span>";
	instructions += "<span style='color:#009900'>" + getMessage('EVENT_CALENDAR_MESS24') + ", </span>";
	instructions += "<span style='color:#9900FF'>" + getMessage('EVENT_CALENDAR_MESS25') + ", </span>";
	instructions += "<span style='color:#FF99FF'>" + getMessage('EVENT_CALENDAR_MESS26') + ", </span>";
	instructions += "<span style='color:#66FF33'>" + getMessage('EVENT_CALENDAR_MESS27') + ", </span>";
	instructions += "<span style='color:#FF9900'>" + getMessage('EVENT_CALENDAR_MESS28') + ", </span>";
	instructions += "<span style='color:#00B0F0'>" + getMessage('EVENT_CALENDAR_MESS29') + ", </span>";
	instructions += "<span style='color:#666600'>" + getMessage('EVENT_CALENDAR_MESS30') + ", </span>";
	instructions += "<span style='color:#31849B'>" + getMessage('EVENT_CALENDAR_MESS31') + ", </span>";
	instructions += "<span style='color:red'>" + getMessage('EVENT_CALENDAR_MESS32') + ", </span>";
	instructions += "<span style='color:#C00000'>" + getMessage('EVENT_CALENDAR_MESS33') + ", </span>";
	instructions += "<span style='color:black'>" + getMessage('EVENT_CALENDAR_MESS34') + ", </span>";
	instructions += "<span style='color:#5186BD'>" + getMessage('EVENT_CALENDAR_MESS35') + ", </span>";
	instructions += "<span style='color:#5C246E'>" + getMessage('EVENT_CALENDAR_MESS36') + ", </span>";
	instructions += "<span style='color:#9BBB59'>" + getMessage('EVENT_CALENDAR_MESS37') + ", </span>";
	instructions += "<span style='color:#548B54'>" + getMessage('EVENT_CALENDAR_MESS38') + "</span>";
	panel.setInstructions(instructions);
}
