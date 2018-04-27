/**
 * Test retrieving records in async mode.
 */
StartTest(function(t) {
    t.requireOk('Common.scripts.ScriptManager', 'Common.service.MobileSyncServiceAdapter',
            'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager',
            'Common.test.util.TestUser', function() {

        var tableName = 'bl',
            fieldNames = [ 'bl_id', 'name', 'city_id', 'state_id', 'ctry_id', 'use1', 'contact_name', 'date_bl',
                'area_gross_ext', 'area_gross_int', 'area_rentable', 'area_usable', 'contact_phone', 'construction_type',
                'site_id', 'bldg_photo' ];

        var records = null;

        // Configure test user.
        Common.test.util.TestUser.registerTestUser('TRAM', 'afm');

        Common.service.MobileSecurityServiceAdapter.startMobileUserSession(ConfigFileManager.deviceId, 'en-US');
            MobileSyncService.retrieveRecords(tableName, fieldNames, null, {
            async : true,
            callback : function(returnValue) {
                records = returnValue;
                Common.service.MobileSecurityServiceAdapter.logout();
            },
            errorHandler : function(message, exception) {
                exception.genericMessage = 'Error retrieving records.';
                Common.service.ExceptionTranslator.translate(exception);
            }
        });

    });
});