StartTest(function (t) {

    t.requireOk('Common.util.Ui', 'Common.store.AppPreferences', 'Common.store.TableDefs', function () {

        var appPreferences = Ext.create('Common.store.AppPreferences');
        var tableDefStore = Ext.create('Common.store.TableDefs');

        var async = t.beginAsync();
        tableDefStore.load();
        appPreferences.load( function () {
            Common.util.Ui.generateFormFields('eq_audit');
            t.endAsync(async);
            t.done();
        })




    });
});