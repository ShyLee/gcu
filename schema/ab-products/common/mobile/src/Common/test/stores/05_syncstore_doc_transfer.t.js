StartTest(function(t) {

	t.requireOk('Maintenance.store.WorkRequests', 'Maintenance.model.WorkRequest',
			'Common.util.SynchronizationManager', 'Common.util.Device', 'Common.store.sync.ValidatingTableStore',
			'Common.store.TableDefs', function() {

				var workRequestStore = Ext.create('Maintenance.store.WorkRequests');
				var workRequestModel = Ext.create('Maintenance.model.WorkRequest');
				var tableDefsStore = Ext.create('Common.store.TableDefs');

                // Add document fields to the store in case they are not defined in the file
                workRequestStore.serverFieldNames = [ 'wr_id', 'bl_id', 'fl_id', 'rm_id', 'site_id', 'cf_notes', 'date_requested', 'description',
                    'eq_id', 'location', 'priority', 'prob_type', 'requestor', 'tr_id', 'status', 'mob_locked_by',
                    'mob_pending_action', 'mob_wr_id', 'doc1', 'doc2', 'doc3', 'doc4'];

                var imageData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAwUExURQAm///YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAt4U8AAAAJcEhZcwAADsIAAA7CARUoSoAAAAAVSURBVBjTY2AAAkEgYKCQQQ0zgAAAMp8EQTkXHrEAAAAASUVORK5CYII=';

                var testUserDeviceId = Common.test.util.TestUser.testUserDeviceId;
                if (testUserDeviceId === null) {
                    Common.test.util.TestUser.registerTestUser('TRAM','afm');
                }

				// Include required fields
				workRequestModel.set('wr_id', 1001);
				workRequestModel.set('bl_id', 'Building 1');
				workRequestModel.set('fl_id', 'Floor 1');
				workRequestModel.set('prob_type', 'Doc Test');
				workRequestModel.set('description', 'Doc Test');
				workRequestModel.set('mob_is_changed', 1);
                workRequestModel.set('mob_wr_id', 1001);

				workRequestModel.set('doc1', 'file1.jpg');
				workRequestModel.set('doc1_contents', imageData);
				workRequestModel.set('doc1_isnew', true);

				workRequestStore.add(workRequestModel);

				var async = t.beginAsync();

				workRequestStore.on('write', function() {
					tableDefsStore.load(function() {
						SynchronizationManager.syncTransactionTables('workRequestsStore', function() {
						 // TODO: Check values here
						 alert('sync finished');
						});
					});
				});

				workRequestStore.sync();

				t.endAsync(async);
				t.done();

			});
});