Ext.define('Common.store.RoomStandards', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.RoomStandard' ],

	serverTableName : 'rmstd',

	serverFieldNames : [ 'rm_std', 'description' ],
	inventoryKeyNames : [ 'rm_std' ],

	config : {
		model : 'Common.model.RoomStandard',
		storeId : 'roomStandardsStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'description',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});