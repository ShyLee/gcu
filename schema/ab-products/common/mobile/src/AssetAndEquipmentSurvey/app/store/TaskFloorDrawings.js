Ext.define('AssetAndEquipmentSurvey.store.TaskFloorDrawings', {
    extend : 'Common.store.sync.SqliteStore',

    requires : 'AssetAndEquipmentSurvey.model.TaskFloorDrawing',

    config : {
        model : 'AssetAndEquipmentSurvey.model.TaskFloorDrawing',
        storeId : 'taskFloorDrawings',
        enableAutoLoad : true,
        disablePaging : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});