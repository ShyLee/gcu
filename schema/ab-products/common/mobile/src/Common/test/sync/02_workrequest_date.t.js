// Test the synchronization of WorkRequest records created on the mobile client
// Test if a date value survives roundtrip to server and back.
// To run this test: 
// -	Install fresh canonic HQ.db;
// -	Clear browser cache;
// -	Open AppLauncher;
// -	Register user TRAM;
// - 	Open the Maintenance application to have the WorkRequest table created in the client database;
// -	Run this test.
// 
// To check the timezone issue:
// -	Set the client timezone to Beijing GMT +8. The Web Central server should be set to a local timezone.
// -	Close the client browser and re-open.

StartTest(function(t) {

	t.diag('Testing Work Request Sync: test if a date value survives roundtrip to server and back.');

	t.requireOk('Maintenance.model.WorkRequest',
			'Maintenance.store.WorkRequests', 'Common.scripts.ScriptManager',
			'Common.service.MobileSyncServiceAdapter',
			'Common.service.MobileSecurityServiceAdapter',
			'Common.util.ConfigFileManager', 'Common.util.TableDef',
			'Common.store.TableDefs', 'Common.store.sync.SchemaUpdaterStore',
			'Common.store.sync.ValidatingTableStore',
			'Common.test.util.Database', 'Common.test.util.TestUser',
			function() {

				// Configure test user.
				Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

				// Register the tableDefs store in the StoreManager
				Ext.create('Common.store.TableDefs');

				// expected date value
				var expectedDate = new Date("01-13-1999");
				var description = 'TEST WORK REQUEST SYNC: DATE';

				var workRequestModel1 = Ext
						.create('Maintenance.model.WorkRequest');
				workRequestModel1.setData({
					bl_id : 'HQ',
					fl_id : '01',
					rm_id : '151',
					prob_type : 'ASBESTOS',
					description : description,
					mob_is_changed : 1,
					mob_locked_by : 'TRAM',
					date_assigned : expectedDate
				});

				var workRequestStore = Ext
						.create('Maintenance.store.WorkRequests');

				workRequestStore.add(workRequestModel1);

				var async = t.beginAsync(30000);

				// Clean up the local database before inserting records
				Common.test.util.Database.deleteWorkRequestSyncTestRecords(
						function() {
							workRequestStore.sync(function() {
								workRequestStore.synchronize(function() {
									workRequestStore.clearFilter();
									// TODO this filter does not work
									workRequestStore.filter('description',
											description);
									workRequestStore.load(function(records) {

										Ext.each(records, function(record) {
											var dateAssigned = record
													.get('date_assigned');
											// verify that date value survived
											// roundtrip to server and back.
											t.is(dateAssigned, expectedDate,
													'Date value matches');
										});

										t.endAsync(async);
										t.done();
									});
								});
							});
						}, this);
			});

});