Ext.define('Maintenance.store.ProblemDescriptions', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Maintenance.model.ProblemDescription' ],

	serverTableName : 'pd',
	serverFieldNames : [ 'pd_id', 'pd_description' ],
	inventoryKeyNames : [ 'pd_id' ],

	config : {
		model : 'Maintenance.model.ProblemDescription',
		sorters : [ {
			property : 'pd_id',
			direction : 'ASC'
		} ],
		storeId : 'problemDescriptionsStore',
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});
