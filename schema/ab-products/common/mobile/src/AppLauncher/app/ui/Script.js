Ext.define('AppLauncher.ui.Script', {
    singleton: true,

    ssoModeEnabled: false,

    waitForDwrScriptsToLoad: function(onConnected, scope) {
        var me = this,
                i = 0,
                interval = setInterval(function() {
                    i += 1;
                    console.log(' ----> Looping in script delay count: ' + i);
                    var areScriptsReady = ScriptManager.isSmartClientConfigServiceAvailable();
                    if(areScriptsReady || i === 10) {
                        clearInterval(interval);
                        if(typeof onConnected === 'function') {
                            onConnected.call(me || scope);
                        }
                    }
                }, 250);
    },

    isInSsoMode: function(onCompleted, scope) {
        var me = this,
            isInSsoMode = false;
        // Check if the SmartClientConfigService is available
        me.waitForDwrScriptsToLoad(function() {
            isInSsoMode = MobileSecurityServiceAdapter.isInSsoMode();
            me.ssoModeEnabled = isInSsoMode;
            Ext.callback(onCompleted, scope || me, [isInSsoMode]);
        }, me);
    }
});