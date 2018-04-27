Ext.define('Common.util.Device', {

	alternateClassName : [ 'Device' ],

	requires : [ 'Common.util.ConfigFileManager', 'Common.util.Environment' ],

	singleton : true,

	/**
	 * Returns the unique device id
	 * 
	 */
	getDeviceId : function() {
		return ConfigFileManager.deviceId;
	},

    generateDeviceId: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c === 'x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    }
});