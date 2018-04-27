StartTest(function(t) {
    t.requireOk('Common.scripts.ScriptManager', 'Common.service.MobileSecurityServiceAdapter',
            'Common.util.ConfigFileManager', function() {

                var deviceId = 'faec3741-7a19-4d1a-cbc2-118ef15e8ce4';
                var userName = 'TRAM';
                var password = 'afm';

                var wfrResult = function(result) {
                    console.log('WFR finished');
                    Common.service.MobileSecurityServiceAdapter.logout();
                };

                var wfrError = function(error) {
                    console.log('WFR error ' + error);
                }

                // Register user TRAM
                Common.service.MobileSecurityServiceAdapter.registerDevice(deviceId, userName, password);

                // Call workflow rule directly
                var options = {
                    'callback' : wfrResult,
                    'errorHandler': wfrError,
                    'async' : true,
                    'timeout' : 60000
                 };

                var parameters = {
                    methodParameters: '["TRAM", "WILL TRAM"]',
                    version: '2.0'
                }

                Common.service.MobileSecurityServiceAdapter.startMobileUserSession(deviceId, 'en-US');

                workflow.runWorkflowRule('AbBldgOpsHelpDesk-MaintenanceMobileService-syncWorkData', parameters, null, options);


        t.done();
    });
});