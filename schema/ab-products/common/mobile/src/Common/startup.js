// This file contains JavaScript code that should be executed on start-up, before any other JavaScript code.
// Code belongs here if it has global scope.

// Set global error handler
window.onerror = function(message, url, line) {
	console.log(url + '\n' + line);

	// strip 'Uncaught' prefix
	message = message.replace('Uncaught', '');
    message = message.replace('Error:', '');
	// Ext.Msg requires Ext.MessageBox. No way to include the requires here
	// so we need to catch the exception and display an alert if Ext.Msg is not loaded.

    // Eat exceptions that are intermittently thrown by the framework
    // These exceptions can be enabled during development to catch actual implementation errors.
    // Eat exceptions with the text "Type 'null' is not an object"
    if(message.indexOf("Type 'null' is not an object") !== -1) {
        return;
    }
    // Eat exceptions with the text "Type 'undefined' is not an object"
    if(message.indexOf("Type 'undefined' is not an object") !== -1) {
        return;
    }

	try {
		Ext.Msg.alert('Error', message);
	} catch (e) {
		alert(message);
	} finally {
		// Turn off the progress mask if it is active
		if (Ext.Viewport) {
			Ext.Viewport.setMasked(false);
		}
		return true;
	}
};
