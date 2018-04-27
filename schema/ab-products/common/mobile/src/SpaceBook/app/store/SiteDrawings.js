Ext.define('SpaceBook.store.SiteDrawings', {
	extend : 'Common.store.sync.SqliteStore',

	requires : 'SpaceBook.model.SiteDrawing',

	config : {
		model : 'SpaceBook.model.SiteDrawing',
		storeId : 'siteDrawings',
		enableAutoLoad : true,
		disablePaging : true,
		proxy : {
			type : 'Sqlite'
		}
	}

});