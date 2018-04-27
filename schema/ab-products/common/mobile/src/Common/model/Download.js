Ext.define('Common.model.Download', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'application',
            type : 'string'
        }, {
            name : 'downloadTime',
            type : 'date'
        } ]
    }
});