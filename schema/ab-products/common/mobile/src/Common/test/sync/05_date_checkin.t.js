/**
 * Tests the date conversion of the MobileSyncServiceAdapter.checkInRecords
 * function. To execute this test: - Delete all values in the wrcf_sync table. -
 * Execute the test
 */
StartTest(function(t) {
	t
			.requireOk(
					'Maintenance.model.WorkRequestCraftsperson',
					'Common.scripts.ScriptManager',
					'Common.service.MobileSyncServiceAdapter',
					'Common.service.MobileSecurityServiceAdapter',
					'Common.util.ConfigFileManager',
					'Common.store.sync.SchemaUpdaterStore',
					'Common.test.util.Database',
					'Common.test.util.TestUser',
					function() {

						// Configure test user.
						Common.test.util.TestUser.registerTestUser('TRAM',
								'afm');

						var generateModels = function() {
							var modelData = {
								cf_id : 'WILL TRAM',
								time_assigned : '12:00',
								hours_straight : 1.0,
								mob_locked_by : 'TRAM'
							};
							var modelRecords = [];

							for ( var i = 1; i < 2; i++) {
								modelData.wr_id = i;
								modelData.date_assigned = '2013-' + i + '-01';

								var workRequestCraftsperson = Ext
										.create('Maintenance.model.WorkRequestCraftsperson');
								workRequestCraftsperson.setData(modelData);
								modelRecords.push(workRequestCraftsperson);
							}

							return modelRecords;
						};

						// Get an array of model records with the date_assigned
						// value for each month in the year
						var modelRecords = generateModels();

						// Test the date_assigned values in the model before
						// syncing
						Ext
								.each(
										modelRecords,
										function(record, index) {
											// The wrId value is equal to the
											// month value of the record
											var wrId = record.get('wr_id');
											var dateAssigned = record
													.get('date_assigned'), expectedDate = new Date(
													2013, wrId - 1, 1);
											t
													.is(dateAssigned,
															expectedDate,
															'Date Assigned values match before sync');
										});

						var session = Ext.create('Common.Session');
						session.doInSession(function() {
							MobileSyncServiceAdapter.checkInRecords(
									'wrcf_sync', [ 'wr_id', 'cf_id',
											'date_assigned', 'time_assigned' ],
									modelRecords);
						});

						// Check out records
						var modelInstance = Ext.ModelManager
								.getModel('Maintenance.model.WorkRequestCraftsperson');
						var resultRecords;

						session.doInSession(function() {
							resultRecords = MobileSyncServiceAdapter
									.checkOutRecords('wrcf_sync', [ 'wr_id',
											'cf_id', 'date_assigned',
											'time_assigned' ], null,
											modelInstance);
						});

						// Compare the returned values of date_assigned
						Ext
								.each(
										resultRecords,
										function(record) {
											// The wrId value is equal to the
											// month value of the record
											var wrId = record.get('wr_id');
											if (wrId > 0 && wrId < 13) {
														dateAssigned = record
																.get('date_assigned'),
														expectedDate = new Date(
																2013, wrId - 1,
																1);
												t
														.is(dateAssigned,
																expectedDate,
																'Date Assigned values match after sync');
											}
										})
						t.done();
					});
});