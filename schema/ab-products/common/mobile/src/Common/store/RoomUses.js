Ext.define('Common.store.RoomUses', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.RoomUse' ],

	serverTableName : 'rmuse',

	serverFieldNames : [ 'rm_use', 'description' ],
	inventoryKeyNames : [ 'rm_use' ],

	config : {
		model : 'Common.model.RoomUse',
		storeId : 'roomUsesStore',
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