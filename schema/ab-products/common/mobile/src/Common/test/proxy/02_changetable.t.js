StartTest(function (t) {

    t.requireOk('Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.ChangeTableStructureOperation',
            'Common.type.TypeManager', 'Common.type.CustomType', 'Common.model.ModelBase', 'Common.store.Buildings',
            'Common.store.proxy.Sqlite',
            function () {

        var changeTable = Ext.create('Common.store.proxy.ChangeTableStructureOperation');

                var buildingModel = Ext.define('TestModel', {
                    extend: 'Common.model.ModelBase',

                    config: {
                        fields: [
                            {name: 'id', type: 'int'},
                            {name: 'field1', type: 'string'},
                            {name: 'field2', type: 'IntegerClass'}
                        ]
                    }

                });


        changeTable.createOrAlterTableIfNot('testtable', buildingModel, function (action) {
            console.log('Test Complete action: ' + action);
        }, this);

        // Test dropAndCreateTable
        var store = Ext.create('Common.store.Buildings');
            store.dropAndCreateTable(function() {
                console.log('drop and create complete');
            });
        t.done();
    });
});