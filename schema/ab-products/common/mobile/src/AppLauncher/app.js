// Enable the loader
// <debug>
Ext.Loader.setConfig({
	enabled : true
});
// </debug>

Ext.Loader.setPath({
	'Ext' : '../touch/src',
	'Common' : '../Common',
	'AppLauncher' : 'app'
});

Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.LocaleManager' ], function() {

	Ext.application({
		models : [ 'Common.model.App',
                   'AppLauncher.model.Registration' ],

		stores : [ 'Common.store.TableDefs',
                   'Common.store.AppPreferences',
                   'Common.store.Apps',
                   'Common.store.Downloads'],

		views : [ 'Registration',
                  'AppSelection',
                  'ChangeUrl' ],

		controllers : [ 'Registration',
                        'Preferences' ],

        profiles: ['Phone', 'Tablet'],

		name : 'AppLauncher',


        launch: function() {
            // Destroy the #appLoadingIndicator element
            Ext.fly('appLoadingIndicator').destroy();
        }

	});
});
