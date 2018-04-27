StartTest(function (t) {

    t.requireOk('Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.Sqlite',
            'Common.store.TableDefs', 'Common.util.TableDef', function () {

                // Load the stores
                var tableDefsStore = Ext.create('Common.store.TableDefs');
                var async = t.beginAsync();
                tableDefsStore.load(function () {
                    var modelFields = TableDef.generateModelFields('eq_audit', 'bl_id, fl_id, rm_id, em_id, eq_id, status');
                    t.is(modelFields.length, 7, 'Number of model fields is correct');

                    var model = new Ext.create('AssetAndEquipmentSurvey.model.Task');

                    t.endAsync(async);
                    t.done();
                });
            });
});