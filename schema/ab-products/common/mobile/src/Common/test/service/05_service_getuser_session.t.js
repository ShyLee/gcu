StartTest(function(test) {
    test.requireOk('Common.scripts.ScriptManager',
            'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager',
            'Common.test.util.TestUser', 'Common.Session', function() {

                var deviceIds = ['0C369A5D-1396-0656-93C9-69643203161A-67FCEE8CFADB-114A-C95E-4CBF-5FF1B740',
                                 'faec3741-7a19-4d1a-cbc2-118ef15e8ce4' ],
                    userNames = ['TRAM', 'IPAD'],
                    employeeId,
                        i, mod;

                var getUser = function(deviceId) {
                    ConfigFileManager.deviceId = deviceId;
                    var session = Ext.create('Common.Session');

                    var user = null;
                    session.doInSession(function () {
                        user = Common.service.MobileSecurityServiceAdapter.getUser();
                    });

                    if (user) {
                        employeeId = user.employee.id;
                    }

                    return employeeId;
                };

                var registerUser = function(deviceId, username, password) {
                    Common.service.MobileSecurityServiceAdapter.registerDevice(deviceId, username, password);
                }

                /*
                for (i=0; i< 10; i++) {
                    mod = i%2;
                    employeeId = getUser(deviceIds[mod]);
                    console.log('Index: ' + i + ' ' + employeeId);
                    if(mod === 1) {
                        test.is(employeeId, 'TRAM, WILL', 'Employee is TRAM');
                    }
                    if (mod === 0) {
                        test.is(employeeId, 'IPAD', 'Employee is IPAD');
                    }
                }
                */

                for (i=0; i< 10; i++) {
                    mod = i%2;
                    registerUser('0C369A5D-1396-0656-93C9-69643203161A-67FCEE8CFADB-114A-C95E-4CBF-5FF1B740', userNames[mod], 'afm');
                    employeeId = getUser('0C369A5D-1396-0656-93C9-69643203161A-67FCEE8CFADB-114A-C95E-4CBF-5FF1B740');
                    console.log('Index: ' + i + ' ' + employeeId);
                    if(mod === 0) {
                        test.is(employeeId, 'TRAM, WILL', 'Employee is TRAM');
                    }
                    if (mod === 1) {
                        test.is(employeeId, 'IPAD', 'Employee is IPAD');
                    }
                }



                test.done();

            });
});