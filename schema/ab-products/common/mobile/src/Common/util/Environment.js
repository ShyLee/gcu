/**
 * Provides information about the environment the app is running in.
 */
Ext.define('Common.util.Environment', {

	alternateClassName : [ 'Environment' ],

	singleton : true,

	/**
	 * Detects the browser that the app is running in. Used to allow the app to run on browsers other than the Chrome
	 * and WebView browsers.
	 * 
	 * @returns {boolean} False if the app is running on a device or in the Chrome browser True otherwise.
	 */
	getBrowserMode : function() {
        var developerMode;

        if (typeof Abm !== 'undefined') {
            developerMode = Abm.DEV_MODE;
        } else {
            developerMode = false;
        }
		if (Ext.browser.is.PhoneGap || (Ext.browser.is.Chrome && developerMode)) {
			console.log('Running in Chrome or in WebView. Filesystem access enabled');
			return false;
		} else {
			console.log('Running in Browser Mode. Filesystem access disabled');
			return true;
		}
	},

    getNativeMode: function () {
        if (Ext.browser.is.PhoneGap) {
            return Ext.browser.is.PhoneGap;
        } else {
            return false;
        }
    }

});