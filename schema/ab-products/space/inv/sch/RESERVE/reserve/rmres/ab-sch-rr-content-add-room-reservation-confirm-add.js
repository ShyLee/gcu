
function selectEmail(gridId, emailField) {
	var gridPanel = View.panels.get(gridId);
	var rows = gridPanel.getSelectedRows();
    
	if (rows.length == 0) {
		View.showMessage(getMessage('recordApprovedCheck'));
    	return;
    }
	var emails = "";	
	for (var i = 0; i < rows.length; i++) {
    	var row = rows[i];
        var email = row[emailField];
		
		if (email == '') {
			continue;	
		}
		
		emails += email;
		if (i != (rows.length - 1)) {
			emails += ";"
		}
		if ((i%4 == 0) && i != 0 ) {
			emails += "\n" ;
		}
    }
		
	var confirmPanel = View.getOpenerView().panels.get('confirmRoomReservPanel');
    var originalAttendees = confirmPanel.getFieldValue('reserve.attendees');
    
	var selected_attendees = originalAttendees;
	if (selected_attendees != '') {
		selected_attendees = selected_attendees + ';';
	}
	selected_attendees = selected_attendees + emails;
    confirmPanel.setFieldValue('reserve.attendees', selected_attendees);
	var newOriginalAttendees = confirmPanel.getFieldValue('reserve.attendees');
	
	if (newOriginalAttendees.length < selected_attendees.length) {
		View.showMessage(getMessage("tooManyRows"));
		confirmPanel.setFieldValue('reserve.attendees', originalAttendees);	
		return false;
	}
	
	View.getOpenerView().closeDialog();
}
