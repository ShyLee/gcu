Ext.define('AppLauncher.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {

        views: ['AppLauncher.view.phone.Preferences']
    },

    isActive: function () {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    }
});