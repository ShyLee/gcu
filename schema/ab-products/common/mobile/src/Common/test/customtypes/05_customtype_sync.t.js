// Tests if all supported by the WebCentral data types survive roundtrip to the server and back (including saving and loading from database).
StartTest(function(test) {
	test
			.requireOk(
					'Maintenance.model.WorkRequestCraftsperson',
					'Common.scripts.ScriptManager',
					'Common.service.MobileSyncServiceAdapter',
					'Common.service.MobileSecurityServiceAdapter',
                    'Common.test.util.TestUser',
					function() {
						// var r = window
						// .confirm('This test will write data to the server
						// side wr_sync table. Do you want to continue? Click
						// Cancel to abort.');
						//
						// if (r === false) {
						// console.log('Test Cancelled');
						// return;
						// }

						// Create and populate the model
						var workRequestCraftspersonModel = Ext
								.create('Maintenance.model.WorkRequestCraftsperson');

						// Supported type: Common.type.Integer
						// Generate a random wr_id
						var idExpected = Math.floor(Math.random() * 1001);
						workRequestCraftspersonModel.set('wr_id', idExpected);
						test
								.isaOk(
										workRequestCraftspersonModel.data['wr_id'],
										'Common.type.Integer',
										'wr_id field of the Model contains JavaScript object of type Common.type.Integer.');

						// Supported type: string
						var cfIdExpected = 'TRAM';
						workRequestCraftspersonModel.set('cf_id', cfIdExpected);
						test
								.is(
										test
												.typeOf(workRequestCraftspersonModel.data['cf_id']),
										'String',
										'cf_id field of the Model contains JavaScript value of type string.');

						// Supported type: Common.type.Date
						var dateAssignedExpected = new Date(2012, 9, 31, 0, 0,
								0, 0);
						workRequestCraftspersonModel.set('date_assigned',
								dateAssignedExpected);
						test
								.isaOk(
										workRequestCraftspersonModel.data['date_assigned'],
										'Common.type.Date',
										'date_assigned field of the Model contains JavaScript object of type Common.type.Date.');

						// Supported type: Common.type.Time
						var timeAssignedExpected = new Date(1970, 0, 1, 16, 45,
								0, 0);
						workRequestCraftspersonModel.set('time_assigned',
								timeAssignedExpected);
						test
								.isaOk(
										workRequestCraftspersonModel.data['time_assigned'],
										'Common.type.Time',
										'time_assigned field of the Model contains JavaScript object of type Common.type.Time.');

						// Supported type: number(float)
						var hoursStraightExpected = 123.45;
						workRequestCraftspersonModel.set('hours_straight',
								hoursStraightExpected);
						test
								.is(
										test
												.typeOf(workRequestCraftspersonModel.data['hours_straight']),
										'Number',
										'hours_straight field of the Model contains JavaScript value of type number.');

						var serverTableName = 'wrcf_sync';

						// Send the data to the server
						try {
							// Register user TRAM.
                            // The deviceId is generated randomly, we need to register the user for the test
                            // This will change the deviceId for the user that is maintained in the afm_users
                            // table.
                            // A separate test user account should be used if the test is run in a production
                            // environment.
                            var testUserDeviceId = Common.test.util.TestUser.testUserDeviceId;
                            if (testUserDeviceId === null) {
                                Common.test.util.TestUser.registerTestUser('TRAM','afm');
                                testUserDeviceId = Common.test.util.TestUser.testUserDeviceId;
                            }

							Common.service.MobileSecurityServiceAdapter
									.startMobileUserSession(
											testUserDeviceId,
											'en-US');

							// Check in the record
							{
								var records = [ workRequestCraftspersonModel ];
								Common.service.MobileSyncServiceAdapter
										.checkInRecords(serverTableName, [
												'wr_id', 'cf_id',
												'date_assigned',
												'time_assigned' ], records);
							}

							// check out the same record
							{
								var restriction = {};

								restriction.clauses = [ {
									tableName : serverTableName,
									fieldName : 'wr_id',
									operation : 'EQUALS',
									value : idExpected
								} ];

								var records = Common.service.MobileSyncServiceAdapter
										.checkOutRecords(serverTableName, [
												'wr_id', 'cf_id',
												'date_assigned',
												'time_assigned',
												'hours_straight' ],
												restriction,
                                                'Maintenance.model.WorkRequestCraftsperson');

								// verify the results
								{
									var recordActual = records[0];
									{
										var idActual = recordActual.data['wr_id'];
										test.is(idActual, idExpected,
												'wr_id matches');
										test
												.isaOk(
														idActual,
														'Common.type.Integer',
														'wr_id field of the Model contains JavaScript object of type Common.type.Integer.');
									}

									{
										var dateAssignedActual = recordActual.data['date_assigned'];
										test.is(dateAssignedActual.getValue(),
												dateAssignedExpected,
												'date_assigned matches');
										test
												.isaOk(
														dateAssignedActual,
														'Common.type.Date',
														'date_assigned field of the Model contains JavaScript object of type Common.type.Date.');
									}

									{
										var timeAssignedActual = recordActual.data['time_assigned'];
										test.is(timeAssignedActual.getValue(),
												timeAssignedExpected,
												'time_assigned matches');
										test
												.isaOk(
														timeAssignedActual,
														'Common.type.Time',
														'time_assigned field of the Model contains JavaScript object of type Common.type.Time.');
									}

									{
										var cfIdActual = recordActual.data['cf_id'];
										test.is(cfIdActual, cfIdExpected,
												'cf_id matches');
										test
												.is(test.typeOf(cfIdActual),
														'String',
														'cf_id field of the Model contains JavaScript value of type string.');
									}

									{
										var hoursStraightActual = recordActual.data['hours_straight'];
										test.is(hoursStraightActual,
												hoursStraightExpected,
												'hours_straight matches');
										test
												.is(
														test
																.typeOf(hoursStraightActual),
														'Number',
														'hours_straight field of the Model contains JavaScript value of type number.');
									}
								}
							}
						} catch (e) {
							console.log(e);
							alert('Error During sync ' + e);
						} finally {
							Common.service.MobileSecurityServiceAdapter
									.logout();
							test.done();
						}
					});
});