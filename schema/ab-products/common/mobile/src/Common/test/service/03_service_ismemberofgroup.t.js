// Tests AdminService.isUserMemberOfGroup() method call.
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
							.startMobileUserSession(ConfigFileManager.deviceId);

					// make AdminService.isUserMemberOfGroup() call
					{
						var isUserMemberOfGroup = Common.service.MobileSecurityServiceAdapter
								.isUserMemberOfGroup("ANY_GROUP");

						// verify the results
						{
							console.log(isUserMemberOfGroup);
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