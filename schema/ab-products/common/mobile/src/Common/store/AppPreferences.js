/**
 * Store for the Application Preferences
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 * 
 * 01.17.2013 Added restriction clause for applies_to = Mobile. JM
 */
Ext.define('Common.store.AppPreferences', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.AppPreference' ],

	serverTableName : 'afm_activity_params',
	serverFieldNames : [ 'activity_id', 'param_id', 'param_value', 'applies_to' ],
	inventoryKeyNames : [ 'activity_id', 'param_id' ],

	config : {
		model : 'Common.model.AppPreference',
		storeId : 'appPreferencesStore',
		remoteFilter : true,
		disablePaging : true,
		enableAutoLoad : false,
		proxy : {
			type : 'Sqlite'
		},
		restrictionClause : {
            tableName: 'afm_activity_params',
			fieldName : 'applies_to',
			operation : 'EQUALS',
			value : 'Mobile'
		}
	}
});