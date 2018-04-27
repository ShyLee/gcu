// TODO: Rename scripts folder to script
Ext.define('Common.scripts.ApplicationLoader', {
	singleton : true,

	onUpdatedFunction : function() {
		Ext.Msg.confirm("Application Update",
				"This application has just successfully been updated to the latest version. Reload now?", function(
						buttonId) {
					if (buttonId === 'yes') {
						window.location.reload();
					}
				});
	}
}, function() {
	Ext.apply(Ext, {
		application : function(config) {
			var appName = config.name, onReady, scope, requires;

			if (!config) {
				config = {};
			}

			config.onUpdated = function() {
				Ext.Msg.confirm("Application Update",
						"This application has just successfully been updated to the latest version. Reload now?",
						function(buttonId) {
							if (buttonId === 'yes') {
                                // Save the new data before reloading
                                Common.util.AppCacheManager.writeAppCacheData(function() {
                                    window.location.reload();
                                });
							}
						});
			};

			if (!Ext.Loader.config.paths[appName]) {
				Ext.Loader.setPath(appName, config.appFolder || 'app');
			}

			requires = Ext.Array.from(config.requires);
			config.requires = [ 'Common.Application' ];

			onReady = config.onReady;
			scope = config.scope;

			config.onReady = function() {
				config.requires = requires;
				new Common.Application(config);

				if (onReady) {
					onReady.call(scope);
				}
			};

			Ext.setup(config);
		}
	});
});
