Ext.define('SpaceBook.model.SpaceFloor', {
    extend: 'Ext.data.Model',

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
                name: 'name',
                type: 'string'
            },
            {
                name: 'area_gross_ext',
                type: 'float'
            },
            {
                name: 'area_gross_int',
                type: 'float'
            },
            {
                name: 'area_rentable',
                type: 'float'
            },
            {
                name: 'area_usable',
                type: 'float'
            },
            {
                name: 'blName',
                type: 'string',
                persist: 'false'
            }
        ]
    }
});