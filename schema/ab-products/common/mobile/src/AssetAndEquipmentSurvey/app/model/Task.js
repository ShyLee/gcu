Ext.define('AssetAndEquipmentSurvey.model.Task', {
    extend: 'Common.model.ModelBase',

    config: {

        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'survey_id',
                type: 'string'
            },
            {
                name: 'eq_id',
                type: 'string'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'eq_std',
                type: 'string'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'marked_for_deletion',
                type: 'IntegerClass'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'transfer_status',
                type: 'string'
            },
            {
                name: 'survey_complete',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'eq_id'
            },
            {
                type: 'presence',
                field: 'survey_id'
            }
        ]
    }
});