Ext.define('SpaceBook.model.UserGroup', {
    extend : 'Ext.data.Model',

    config : {
        fields : [ {
            name : 'id',
            type : 'id'
        }, {
            name : 'userName',
            type : 'string'
        }, {
            name : 'groupName',
            type : 'string'
        }, {
            name : 'isMember',
            type : 'boolean'
        }
        ]
    }
});