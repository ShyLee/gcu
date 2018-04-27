Ext.define('SpaceBook.store.UserGroups', {
    extend : 'Common.store.sync.SqliteStore',

    requires : 'SpaceBook.model.UserGroup',

    config : {
        model : 'SpaceBook.model.UserGroup',
        storeId : 'userGroups',
        remoteFilter: true,
        enableAutoLoad : true,
        disablePaging : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});