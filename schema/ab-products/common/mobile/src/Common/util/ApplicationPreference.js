/**
 * Manages access to the Application Preferences.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.ApplicationPreference', {
	singleton : true,

	/**
	 * Returns the application preference for the provided parameter code.
	 * 
	 * @param {String}
	 *            parameterCode The parameter id of the parameter to retrieve.
	 * @return {String} The Application Preference value.
	 * @exception {Error}
	 *                Throws an exection if the Application Preferences store is not found of the store has not been
	 *                loaded.
	 */
	getApplicationPreference : function(parameterCode) {
		var preferencesStore = Ext.getStore('appPreferencesStore'), preferenceValue = null;

		// Throw an error if the Application Preferences are not available to read.
		if (!preferencesStore || !preferencesStore.isLoaded()) {
			throw new Error('The Application Preferences have not been loaded');
		}

		var preferencesRecord = preferencesStore.findRecord('param_id', parameterCode);

		if (preferencesRecord) {
			preferenceValue = preferencesRecord.get('param_value');
		}

		return preferenceValue;
	},

	/**
	 * Maps the server side table name to the Application Preferences parameter id (param_id).
	 * 
	 * @param {String}
	 *            serverSideTable Name of the server side table to retrieve the list of visible fields for.
	 */

	getVisibleFields : function(serverSideTable) {
		// Map the server side table name to the Application Preference
		var visibleFields;

		switch (serverSideTable) {
		case 'eq_audit':
			visibleFields = this.getApplicationPreference('EquipmentFieldsToSurvey');
			break;
		default:
			visibleFields = '';
		}

		return visibleFields;
	}
});