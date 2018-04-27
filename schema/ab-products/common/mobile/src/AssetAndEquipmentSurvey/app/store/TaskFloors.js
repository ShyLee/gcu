Ext.define('AssetAndEquipmentSurvey.store.TaskFloors', {
    extend : 'Common.store.sync.SqliteStore',

    requires : [ 'Common.store.proxy.SqliteView', 'AssetAndEquipmentSurvey.model.TaskFloor' ],

    config : {
        storeId : 'taskFloorsStore',
        model : 'AssetAndEquipmentSurvey.model.TaskFloor',
        autoLoad : false,
        enableAutoLoad : true,
        remoteFilter : true,
        proxy : {
            type : 'SqliteView',

            viewDefinition : 'SELECT DISTINCT survey_id,bl_id,fl_id FROM Task',

            viewName : 'TaskFloor',

            baseTables : [ 'Task' ]
        }
    }
});