Ext.define('Campus.model.RoomSurvey', {
    extend: 'Common.model.ModelBase',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
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
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
                type: 'string'
            },
            {
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'prorate',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'survey_id',
                type: 'string'
            },
            {
                name: 'rm_use',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
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
            }
        ]
    }
});