// Test the synchronization of WorkRequest records created on the mobile client
StartTest(function (t) {

    t.diag('Testing Work Request Sync');

    t.requireOk('Maintenance.model.WorkRequest','Maintenance.store.WorkRequests','Common.scripts.ScriptManager',
                'Common.service.MobileSyncServiceAdapter', 'Common.service.MobileSecurityServiceAdapter',
                'Common.util.ConfigFileManager', 'Common.util.TableDef', 'Common.store.TableDefs',
                'Common.store.sync.SchemaUpdaterStore','Common.store.sync.ValidatingTableStore',
                'Common.test.util.Database', 'Common.test.util.TestUser', function () {

                // Configure test user.
                Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

                // Register the tableDefs store in the StoreManager
                Ext.create('Common.store.TableDefs');

                var workRequestModel1 = Ext.create('Maintenance.model.WorkRequest');
                workRequestModel1.setData({
                    bl_id: 'HQ',
                    fl_id: '01',
                    rm_id: '151',
                    prob_type: 'ASBESTOS',
                    description: 'TEST WORK REQUEST SYNC',
                    mob_is_changed: 1,
                    mob_locked_by: 'TRAM'
                });

                var workRequestModel2 = Ext.create('Maintenance.model.WorkRequest');
                workRequestModel2.setData({
                    bl_id: 'HQ',
                    fl_id: '01',
                    rm_id: '151',
                    prob_type: 'AIR QUALITY',
                    description: 'TEST WORK REQUEST SYNC',
                    mob_is_changed: 1,
                    mob_locked_by: 'TRAM'
                });

                var workRequestModel3 = Ext.create('Maintenance.model.WorkRequest');
                workRequestModel3.setData({
                    bl_id: 'HQ',
                    fl_id: '01',
                    rm_id: '151',
                    prob_type: 'VANDALISM',
                    description: 'TEST WORK REQUEST SYNC',
                    mob_is_changed: 1,
                    mob_locked_by: 'TRAM'
                });

                var workRequestStore = Ext.create('Maintenance.store.WorkRequests');

                workRequestStore.add(workRequestModel1);
                workRequestStore.add(workRequestModel2);
                workRequestStore.add(workRequestModel3);

                var currentDate = new Date();
                // Remove time information
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(),currentDate.getDate(),0,0,0,0);
                var async = t.beginAsync();

                // Clean up the local database before inserting records
                Common.test.util.Database.deleteWorkRequestSyncTestRecords(function() {
                    workRequestStore.sync(function () {
                        workRequestStore.synchronize(function () {
                            workRequestStore.clearFilter();
                            workRequestStore.filter('description', 'TEST WORK REQUEST SYNC');
                            workRequestStore.load(function (records) {
                                t.is(records.length, 3, 'All Work requests synced to the wr_sync table.');
                                // Clean up database
                                Ext.each(records, function(record) {
                                    var dateRequested = record.get('date_requested');
                                    // TODO this assertion is incorrect. See 02_workrequest_date.t.js for correct assertion.
                                    t.is(dateRequested, currentDate, 'Date Requested matches the current date');
                                });
                                t.endAsync(async);
                                t.done();
                            });
                        });
                    });
                }, this);
            });

});