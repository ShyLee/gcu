/**
 * Provides controller functionality which is common for all applications:
 * <p> - common UI event handlers;
 * 
 * @author Jeff Martin
 * @author Valery Tydykov
 */
// TODO naming "Common" is already in the package name.
// 12.25.12 Renamed to CommonController. JM.
Ext.define('Common.controller.CommonController', {

	extend : 'Ext.app.Controller',

	config : {
		control : {
			'button[action=backToAppLauncher]' : {
				tap : 'navigateToAppLauncher'
			}
		},

        appLaunchKey: 'Ab.AppLauncher'
	},

	navigateToAppLauncher : function() {
		var appLauncherUrl,
            applicationName = this.getApplication().getName(),
            currentUrl = document.location.href;

        // Set the localStorage to indicate to the AppLauncher that we are returning from
        // a launched app
        this.setAppLaunchedKey();
		appLauncherUrl = currentUrl.replace(applicationName, 'AppLauncher');
		document.location.href = appLauncherUrl;
	},

    setAppLaunchedKey: function() {
        var key = this.getAppLaunchKey();

        localStorage.setItem(key, true);
    }
});
