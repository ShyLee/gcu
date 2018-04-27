Ext.define('SpaceBook.store.RoomSurveys', {

    extend: 'Common.store.sync.SyncStore',
    requires: [ 'SpaceBook.model.RoomSurvey' ],

    serverTableName: 'surveyrm_sync',
    serverFieldNames: [ 'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id', 'rm_cat', 'rm_type', 'rm_std', 'prorate',
        'status', 'survey_id', 'rm_use', 'name', 'mob_locked_by', 'mob_is_changed', 'transfer_status', 'survey_id' ],

    inventoryKeyNames: [ 'bl_id', 'fl_id', 'rm_id', 'survey_id' ],

    config: {
        model: 'SpaceBook.model.RoomSurvey',
        storeId: 'roomSurveyStore',
        remoteFilter: true,
        remoteSort: true,
        destroyRemovedRecords: false,
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});