Ext.define('AssetAndEquipmentSurvey.store.Tasks', {
	extend : 'Common.store.sync.SyncStore',
	requires : [ 'AssetAndEquipmentSurvey.model.Task' ],

	serverTableName : 'eq_audit',
	serverFieldNames : [ 'survey_id', 'eq_id', 'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id', 'em_id', 'status',
			'eq_std','marked_for_deletion', 'mob_is_changed', 'mob_locked_by', 'transfer_status', 'site_id' ],

	inventoryKeyNames : [ 'survey_id', 'eq_id' ],

	config : {
		model : 'AssetAndEquipmentSurvey.model.Task',
		storeId : 'surveyTasksStore',
		enableAutoLoad : true,
		remoteFilter : true,
        remoteSort: true,
        dynamicModel: true,
        autoSync: true,
		proxy : {
			type : 'Sqlite'
		}
	}
});
