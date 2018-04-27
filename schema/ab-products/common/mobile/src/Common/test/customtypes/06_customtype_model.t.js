StartTest(function (t) {
    t.requireOk('Common.model.ModelBase', 'Common.store.sync.SyncStore', 'Common.store.proxy.SqliteConnectionManager',
            'Common.store.proxy.Sqlite', function () {

                Ext.define('TestModel', {
                    extend: 'Common.model.ModelBase',

                    config: {
                        fields: [
                            {name: 'id', type: 'int'},
                            {name: 'intfld', type: 'integerclass'},
                            {name: 'datefld', type: 'dateclass'},
                            {name: 'timefld', type: 'timeclass'},
                            {name: 'timestampfld', type: 'timestampclass'},
                            {name: 'stringfld', type: 'string'},
                            {name: 'baseintfld', type: 'int'},
                            {name: 'floatfld', type: 'float'},
                            {name: 'booleanfld', type: 'bool'},
                            {name: 'basedatefld', type: 'date'}
                        ]
                    }
                });



                var testModel = Ext.create('TestModel');

                // Create store
                var store = Ext.create('Common.store.sync.SyncStore',
                        {
                            model: 'TestModel',
                            storeId: 'typeTestStore',
                            proxy : {
                                type : 'Sqlite',
                                tableName : 'typetest'
                            }
                        });

                store.enableAutoLoad = false;

                // Create and populate the model

                var currentDate = new Date();
                var modelData = {
                    intfld: 98,
                    datefld: '2012-12-25',
                    timefld: '15:45',
                    timestampfld: '2012-11-30 17:55:33',
                    stringfld: 'Test String',
                    baseintfld: 101,
                    floatfld: 87.543,
                    booleanfld: true,
                    basedatefld: currentDate
                };

                testModel.setData(modelData);

                store.add(testModel);

                store.on('write', function () {
                    console.log('Data written to the database');
                    // Read the data back
                    var index = store.findExact('intfld', 98);
                    if (index > -1) {
                        var record = store.getAt(index);
                        t.ok(record.get('intfld') === 98, 'intfld matches');
                        t.isDateEqual(record.get('datefld'), new Date(2012, 11, 25, 0, 0, 0), 'datefld matches');
                        t.isDateEqual(record.get('timefld'), new Date(1970, 0, 1, 15, 45, 0), 'timefld matches');
                        t.isDateEqual(record.get('timestampfld'), new Date(2012, 10, 30, 17, 55, 33), 'timefld matches');
                        t.ok(record.get('stringfld') === 'Test String', 'stringfld matches');
                        t.ok(record.get('baseintfld') === 101, 'baseintfld matches');
                        t.ok(record.get('floatfld') === 87.543, 'floatfld matches');
                        t.ok(record.get('booleanfld') === true, 'booleanfld matches');
                        t.isDateEqual(record.get('basedatefld'), currentDate, 'basedatefld matches');
                    }

                    t.endAsync(async);
                    t.done();
                });

                var async = t.beginAsync();
                store.dropAndCreateTable(function () {
                    console.log('Drop and create table');
                    store.sync();
                }, this);


            });


});