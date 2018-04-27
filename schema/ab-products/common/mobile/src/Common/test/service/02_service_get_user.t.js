// Tests AdminService.getUser() method call.
StartTest(function(test) {
	test.requireOk('Common.scripts.ScriptManager',
			'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager',
            'Common.test.util.TestUser', function() {

                // Configure test user.
                Common.test.util.TestUser.registerTestUser('TRAM', 'afm');
				try {
					// Using the device id configured in the shared
					// development database. Login will fail if
					// device id is not configured.
					Common.service.MobileSecurityServiceAdapter
							.startMobileUserSession(
									Common.util.ConfigFileManager.deviceId);

					// make AdminService.getUser() call
					{
						var user = Common.service.MobileSecurityServiceAdapter
								.getUser();

						// verify the results
						{
							console.log(user);
							console.log(user.employee);
							console.log(user.employee.id);
							console.log(user.employee.space.siteId);
							console.log(user.employee.organization.departmentId);
							// TODO
						}
					}
				} catch (e) {
					console.log(e);
					alert('Error During service call ' + e);
				} finally {
					Common.service.MobileSecurityServiceAdapter.logout();
					test.done();
				}
			});
});