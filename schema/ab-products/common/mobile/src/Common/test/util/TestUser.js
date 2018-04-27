Ext.define('Common.test.util.TestUser', {

    requires: ['Common.util.Device',
               'Common.util.ConfigFileManager'],

    singleton: true,

    testUserDeviceId: null,

    registerTestUser: function(userName, password) {
        var deviceId = Device.generateDeviceId();
        ConfigFileManager.deviceId = deviceId;
        ConfigFileManager.username = userName;
        ConfigFileManager.isRegistered = false;

        Common.service.MobileSecurityServiceAdapter.registerDevice(deviceId, userName, password);
        this.testUserDeviceId = deviceId;
    }
});
