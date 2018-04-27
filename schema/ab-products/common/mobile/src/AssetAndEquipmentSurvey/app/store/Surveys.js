Ext.define('AssetAndEquipmentSurvey.store.Surveys', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'AssetAndEquipmentSurvey.model.Survey' ],

	serverTableName : 'survey',
	serverFieldNames : [ 'survey_id', 'description', 'status', 'survey_date', 'em_id' ],
	inventoryKeyNames : [ 'survey_id' ],

	config : {
		model : 'AssetAndEquipmentSurvey.model.Survey',
		sorters : [ {
			property : 'survey_date',
			direction : 'ASC'
		} ],
		storeId : 'surveysStore',
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});
