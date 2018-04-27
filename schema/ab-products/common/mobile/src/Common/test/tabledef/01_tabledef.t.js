StartTest(function (t) {

    t.requireOk('Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.Sqlite',
            'Common.store.TableDefs', 'Common.util.TableDef',  function () {

        var tableDefsStore = Ext.create('Common.store.TableDefs');
        var async = t.beginAsync();
        tableDefsStore.load(function (records) {
            if (records.length === 0) {
                alert('TableDef store contains no records. Sync the records before executing this test');
            }

            // TODO: Assumes we have a tableDef for the wr_sync table
            var headings = TableDef.getTableHeadings('wr_sync');

            t.is(headings.get('status'),'Work Request Status', 'Status field matches');
            t.is(headings.get('bl_id'),'Building Code', 'Building field matches');
            t.is(headings.get('fl_id'),'Floor Code', 'Floor field matches');

            t.endAsync(async);
            t.done();
        });
    });
});