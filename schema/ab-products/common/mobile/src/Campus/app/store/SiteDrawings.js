Ext.define('Campus.store.SiteDrawings', {
	extend : 'Common.store.sync.SqliteStore',

	requires : 'Campus.model.SiteDrawing',

	config : {
		model : 'Campus.model.SiteDrawing',
		storeId : 'siteDrawings',
		enableAutoLoad : true,
		disablePaging : true,
		proxy : {
			type : 'Sqlite'
		}
	}

});