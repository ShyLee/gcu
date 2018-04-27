Ext.define('AppLauncher.view.Preferences', {
    extend: 'Ext.Container',

    requires: 'Common.util.ConfigFileManager',

    xtype: 'preferencesPanel',

    config: {
        layout: {
            type: 'vbox'
        },
        showAnimation: {
            type: 'slide',
            direction: 'up',
            duration: 300
        },

        scrollable : {
            direction : 'vertical',
            directionLock : true
        }
    },

    setValues: function (userName, url, syncTime) {
        var webCentralUrlField = this.query('textfield[name=url]')[0],
            userNameField = this.query('textfield[name=user_name]')[0],
            lastSyncField = this.down('textfield[name=syncTime]'),
            displaySyncTime = '';

        if (Ext.isDate(syncTime)) {
            displaySyncTime = Ext.DateExtras.format(syncTime, 'm/d/Y H:m');
        }
        webCentralUrlField.setValue(url);
        userNameField.setValue(userName);
        lastSyncField.setValue(displaySyncTime);
    },

    /**
     * Sets the regions displayed in the Preferences form.
     * Only display the URL field if we are in native mode
     * Do not display the register user button if we are in SSO mode
     * @param isNativeMode
     */
    setDisplay: function (isNativeMode, isInSsoMode) {
        var urlFieldSet = this.query('#urlFieldSet'),
            registerUserButton = this.query('button[action=registerUser]');

        if (urlFieldSet && urlFieldSet.length > 0) {
            urlFieldSet[0].setHidden(!isNativeMode);
        }

        if (registerUserButton && registerUserButton.length > 0) {
            registerUserButton[0].setHidden(isInSsoMode);
        }
    },

    clearLastSyncField: function() {
        var lastSyncField = this.down('textfield[name=syncTime]');

        lastSyncField.setValue('');
    }
});