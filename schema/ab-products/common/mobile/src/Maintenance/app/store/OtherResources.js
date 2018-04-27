Ext.define('Maintenance.store.OtherResources', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Maintenance.model.OtherResource' ],

	serverTableName : 'other_rs',
	serverFieldNames : [ 'other_rs_type', 'description' ],
	inventoryKeyNames : [ 'other_rs_type' ],

	config : {
		model : 'Maintenance.model.OtherResource',
		sorters : [ {
			property : 'description',
			direction : 'ASC'
		} ],
		storeId : 'otherResourcesStore',
		remoteFilter : true,
		enableAutoLoad : true,
		disablePaging : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});