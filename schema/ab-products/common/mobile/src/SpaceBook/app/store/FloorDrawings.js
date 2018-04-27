Ext.define('SpaceBook.store.FloorDrawings', {
	extend : 'Common.store.sync.SqliteStore',

	requires : 'SpaceBook.model.FloorDrawing',

	config : {
		model : 'SpaceBook.model.FloorDrawing',
		storeId : 'floorDrawings',
        remoteFilter: true,
		enableAutoLoad : true,
		disablePaging : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});