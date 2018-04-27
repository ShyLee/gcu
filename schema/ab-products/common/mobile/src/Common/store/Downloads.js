Ext.define('Common.store.Downloads', {
    extend : 'Common.store.sync.SqliteStore',

    requires : 'Common.model.Download',

    config : {
        model : 'Common.model.Download',
        storeId : 'downloadStore',
        enableAutoLoad : true,
        disablePaging : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});
