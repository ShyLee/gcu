/**
 * Adds functionality to all Application class instances.
 * <p>
 * This functionality ideally belongs to an Application-derived class, but Sencha does not provide a way to use
 * Application-derived class.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *
 * 01.03.13 No longer have to set the store proxy configuration.
 */

Ext.define('Common.Application', {
    extend: 'Ext.app.Application',

    requires: [ 'Common.util.Network',
        'Common.scripts.ScriptManager',
        'Common.util.ConfigFileManager',
        'Common.store.proxy.SqliteConnectionManager',
        'Common.store.sync.SqliteStore',
        'Common.store.proxy.Sqlite',
        'Ext.Toolbar',
        'Ext.form.FieldSet',
        'Ext.MessageBox',
        'Ext.Label',
        'Ext.field.Password',
        'Ext.field.Select',
        'Common.util.Mask',
        'Common.util.AppCacheManager'],

    /**
     * @private Callback that is invoked when all of the Application, Controller and Profile dependencies have
     *          been loaded. Launches the controllers, then the profile and application
     */

    onDependenciesLoaded: function () {
        var me = this,
            profile = this.getCurrentProfile(),
            controllers, name;

        this.instantiateStores();

        // <deprecated product=touch since=2.0>
        Ext.app.Application.appInstance = this;

        if (Ext.Router) {
            Ext.Router.setAppInstance(this);
        }
        // </deprecated>

        controllers = this.getControllerInstances();

        for (name in controllers) {
            controllers[name].init(this);
        }

        if (profile) {
            profile.launch();
        }

        // <debug>
        if(!me.isBrowserWebKit()) {
            return;
        }
        // </debug>
        me.loadConfiguration();
    },

    loadConfiguration: function () {
        console.log('Load configuration OK to access database');
        this.registerDwrServiceScriptsIfConnected();
        this.loadConfigFile();
    },

    /**
     * Loads the configuration data from the configuraiton file. Notifies the application class when the
     * configuration file has been read The application is ready to be launched when the file read operation is
     * completed.
     */
    loadConfigFile: function () {
        var me = this,
            errorMessage = 'Error loading the Configuration file.';

        Common.util.ConfigFileManager.load(function () {
            me.loadRequiredStores(me.onConfigFileLoaded, me);
        }, function (errMsg) {
            if(Ext.os.is.Desktop && Ext.browser.is.Chrome) {
                errorMessage  += '<br>Accept the browser request to store data on your local computer and refresh the page.';
            }
            throw new Error(errorMessage);
        }, me);
    },

    /**
     * Applies the proxy configuration to all Sqlite stores then calls the launchApplication function in the
     * Application.
     *
     * @private
     */
    onConfigFileLoaded: function () {
        var launcher = this.getLaunch(),
            controllers = this.getControllerInstances(),
            name;

        this.setStoreAutoLoad();

        // Save the microloader data
        Common.util.AppCacheManager.writeAppCacheData();

        launcher.call(this);

        for (name in controllers) {
            // <debug warn>
            if (controllers[name] && !(controllers[name] instanceof Ext.app.Controller)) {
                Ext.Logger.warn("The controller '" + name +
                         "' doesn't have a launch method. Are you sure it extends from Ext.app.Controller?");
            } else {
                // </debug>
                controllers[name].launch(this);
                // <debug warn>
            }
            // </debug>
        }

        this.redirectTo(window.location.hash.substr(1));
    },

    setStoreAutoLoad: function () {
        var stores = this.getApplication().getStores();

        Ext.each(stores, function (store) {
            if (store instanceof Common.store.sync.SqliteStore &&
                    !(store.storeId === 'tableDefsStore' || store.storeId === 'appPreferencesStore')) {
                // If the store uses a dynamic model retrieve the model definition here
                if (store.getDynamicModel()) {
                    store.setDynamicModelDefinition();
                }
                store.setAutoLoad(store.getEnableAutoLoad());
            }
        });
    },

    /**
     * Registers the DWR scripts if a connection can be established to the Web Central server
     */
            /*
    registerDwrServiceScriptsIfConnected: function () {
        if (Common.util.Network.isDeviceAndServerConnected()) {
            Common.scripts.ScriptManager.registerDwrServiceScripts();
        }
    },
    */

    registerDwrServiceScriptsIfConnected: function () {
        Common.util.Network.isDeviceAndServerConnectedAsync(null, function(isConnected) {
            if(isConnected) {
                Common.scripts.ScriptManager.registerDwrServiceScripts();
            }
        }, this);
    },

    /**
     * Loads the TableDef and Preferences stores. These stores are required
     * during application start up.
     * @param onStoreLoaded {Function} Called when the stores have finished loading
     * @param scope {Object} Scope to execute the onStoreLoaded function
     */
    loadRequiredStores: function (onStoreLoaded, scope) {
        var me = this,
            tableDefsStore = Ext.getStore('tableDefsStore'),
            appPreferencesStore = Ext.getStore('appPreferencesStore');

        tableDefsStore.load(function () {
            tableDefsStore.setAutoLoad(true);
            appPreferencesStore.load(function () {
                appPreferencesStore.setAutoLoad(true);
                if (typeof onStoreLoaded === 'function') {
                    onStoreLoaded.call(scope || me);
                }
            }, me);
        }, me);
    },

    isBrowserWebKit: function() {
        if (!Ext.browser.is.WebKit) {
            alert('The current browser is not supported.\n\nSupported browsers:\n' +
                    'Google Chrome\n' +
                    'Apple Safari\n' +
                    'Mobile Safari (iOS)\n' +
                    'Android Browser\n' +
                    'BlackBerry Browser');
            return false;
        } else {
            return true;
        }
    }
});