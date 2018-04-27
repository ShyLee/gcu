Ext.define('Campus.store.FloorDrawings', {
	extend : 'Common.store.sync.SqliteStore',

	requires : 'Campus.model.FloorDrawing',

	config : {
		model : 'Campus.model.FloorDrawing',
		storeId : 'floorDrawings',
        remoteFilter: true,
		enableAutoLoad : true,
		disablePaging : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});