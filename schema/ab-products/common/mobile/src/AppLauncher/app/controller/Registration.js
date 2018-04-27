/**
 * Provides controller part of MVC functionality related to RegistrationPanel:
 * <p> - handles events;
 * <p> - prepares data to be shown in the panel, processes entered data;
 * <p> - shows RegistrationPanel.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('AppLauncher.controller.Registration', {
    extend: 'Ext.app.Controller',

    requires: [ 'Common.Session', 'Common.service.MobileSyncServiceAdapter',
                'Common.service.MobileSecurityServiceAdapter', 'Common.util.Device',
                'Common.util.VersionInfo', 'AppLauncher.ui.IconData',
                'AppLauncher.ui.IconView', 'AppLauncher.ui.AppIcon', 'Common.util.Database',
                'AppLauncher.ui.Script'],

    config: {
        refs: {
            registrationView: 'registrationPanel',
            applicationIcon: 'appicon',
            preferencesView: 'preferencesPanel'
        },
        control: {
            applicationIcon: {
                appIconTapped: 'launchSelectedApplication'
            },
            'button[action=registerUser]': {
                tap: 'onRegisterUser'
            },
            'registrationPanel button[itemId=registerButton]': {
                register: 'onRegisterDevice'
            },
            'button[action=guestSignOn]': {
                tap: 'onGuestSignOn'
            }
        },

        guestUserAccount: 'GUEST-MOBILE'
    },

    /**
     * Application entry point
     * <p>
     * Displays the registration form if the device is not registered
     * <p>
     * Displays the
     */
    launch: function () {
        this.onLaunch();
    },

    onLaunch: function () {
        var me = this,
            displayAppSelection = function () {
                me.loadApplicationStore(function () {
                    me.displayAppSelectionView();
                }, me);
            };


        // Check if we are returning from another app
        var fromApp = me.getAppLaunchedKey();

        if(!ConfigFileManager.isRegistered) {
            AppLauncher.ui.Script.isInSsoMode(function(isSsoMode) {
                if(isSsoMode) {
                    // Skip the display of the registration page.
                    me.registerDeviceInSsoMode();
                } else {
                    me.displayRegistrationView();
                }
            }, me);
        } else if (!fromApp) {
            me.refreshEnabledApplications(function () {
                displayAppSelection();
            }, me);
        } else {
            displayAppSelection();
        }
    },

    /**
     * Checks the applications that the user is authorized to use.
     * Queries the server for the enabled applications each time the
     * @param onCompleted
     * @param scope
     */
    refreshEnabledApplications: function(onCompleted, scope) {
        var me = this,
            appsResult,
            isCompleted = function() {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            };

        Network.isDeviceAndServerConnectedAsync(null, function(isConnected) {
            if(isConnected) {
                AppLauncher.ui.Script.waitForDwrScriptsToLoad(function() {
                    appsResult = me.getEnabledApplications();
                    if(appsResult.success) {
                        me.saveEnabledApplications(appsResult.applications, isCompleted, me);
                    } else {
                        // Fail silently during the application refresh
                        // Only display the not registered message
                        // TODO: Checking the message contents by text will break when the app is localized
                        if(appsResult.errorMessage.indexOf('mobile device is not registered') !== 1) {
                            Ext.Msg.alert('Device', appsResult.errorMessage);
                        }
                        isCompleted();
                    }
                }, me);
            } else {
                isCompleted();
            }
        }, me);
    },

    displayRegistrationView: function () {
        var me = this;
        if (!me.registrationView) {
            me.registrationView = Ext.create('AppLauncher.view.Registration');
        }
        me.registrationView.setRecord(new AppLauncher.model.Registration());
        Ext.Viewport.setActiveItem(me.registrationView);
    },

    displayAppSelectionView: function () {
        var me = this,
            store = Ext.getStore('appsClientStore'),
            fromApp = me.getAppLaunchedKey(),
            viewConfig,
            application;

        if (!fromApp && store.getCount() === 1) {
            application = store.getAt(0).data.url;
            me.launchSelectedApplication(application);
        } else {
            // Destroy the view if it exists. This forces the icons to be regenerated
            if (me.applicationSelectionView) {
                me.applicationSelectionView.destroy();
            }
            me.applicationSelectionView = Ext.create('AppLauncher.view.AppSelection');
            // Generate the icons and layout for the view
            viewConfig = AppLauncher.ui.IconView.generateIconView(store);
            me.applicationSelectionView.add(viewConfig);
            me.resetAppLaunchedKey();
            Ext.Viewport.setActiveItem(me.applicationSelectionView);
        }
    },

    getAppLaunchedKey: function () {
        var isAppLaunched = localStorage.getItem('Ab.AppLauncher');

        if (isAppLaunched) {
            return isAppLaunched === 'true';
        } else {
            return false;
        }
    },

    resetAppLaunchedKey: function () {
        localStorage.setItem('Ab.AppLauncher', false);
    },

    /**
     * Shows AppSelectionPanel.
     */
    loadApplicationStore: function (callback, scope) {
        var me = this,
            store = Ext.getStore('appsClientStore');

        if (!store.isLoaded()) {
            store.load(function () {
                if (typeof callback === 'function') {
                    callback.call(scope || me);
                }
            });
        } else {
            callback.call(scope || me);
        }
    },

    /**
     * Handles "OK" button tap event: - tries to register the device for the entered username and password; - if
     * the registration is successful, sets isRegistered value to true, caches it and username in AppLauncher,
     * saves those values to the database. - shows app selection form.
     */
    onRegisterDevice: function () {
        // Get username, password from the form;
        var me = this,
            formPanel = me.registrationView,
            formData = formPanel.getRecord(),
            isNativeMode = Environment.getNativeMode();

        if (formData.isValid()) {
            var username = formData.get('username'),
                password = formData.get('password'),
                deviceId = ConfigFileManager.deviceId;

            // If we are not in native mode we need to generate a device id
            if (!isNativeMode) {
                deviceId = Device.generateDeviceId();
                // Save for use in the Session object
                ConfigFileManager.deviceId = deviceId;
            }

            if (!Network.checkNetworkConnectionAndDisplayMessage()) {
                return;
            }
            me.registerDevice(deviceId, username, password);
        } else {
            formPanel.displayErrors(formData);
        }
    },

    /**
     * Saves the users application info to the database The store is loaded with the existing application list.
     * The list is then replaced with the new application list that was downloaded from the server.
     *
     * @param enabledApplications
     *            List of user applications retrieved from the server
     * @param callback
     *            Function to call when the saveEnabledApplications function has completed
     * @param scope
     *            The scope to execute the callback function
     */
    saveEnabledApplications: function (enabledApplications, callback, scope) {

        var me = this,
            store = Ext.getStore('appsClientStore');

        var onStoreLoaded = function () {
            var me = this,
                enabledApplicationRecords;

            store.removeAll();
            enabledApplicationRecords = me.convertEnabledApplicationsToRecords(enabledApplications);
            store.add(enabledApplicationRecords);
            store.sync(function () {
                if (typeof callback === 'function') {
                    callback.call(scope || me);
                }
            }, Ext.emptyFn, me);
        };

        // Load the store
        // The onStoreLoaded function is called when the store is finished loading.
        store.load({
            callback: onStoreLoaded,
            scope: me
        });
    },

    /**
     * Registers device with specified deviceId for the ARCHIBUS user with specified username and password.
     *
     * @param deviceId
     *            ID of the device to be registered.
     * @param username
     *            ARCHIBUS username for whom the device will be registered.
     * @param password
     *            password of the ARCHIBUS user for whom the device will be registered.
     * @throws exception
     *             if registration fails.
     */
    registerDevice: function (deviceId, username, password) {
        var me = this,
            registerSuccess,
            employeeId = '',
            appsResult;

        registerSuccess = MobileSecurityServiceAdapter.registerDevice(deviceId, username, password);

        if (!registerSuccess) {
            Ext.Msg.alert('Registration', 'Registration Failed');
            return;
        }

        employeeId = me.retrieveUserEmployeeId();

        appsResult = me.getEnabledApplications();

        if (appsResult.success) {
            me.saveEnabledApplications(appsResult.applications, function () {
                me.savePreferences(true, username, deviceId, employeeId, function () {
                    me.displayAppSelectionView();
                });
            }, me);
        } else {
            Ext.Msg.alert('Error', appsResult.errorMessage);
            me.displayAppSelectionView();
        }
    },

    /**
     * Registers the device when the connection is in SSO mode.
     */
    // TODO: This function is the same as registerDevice except that we retrieve the
    // username after the device is registered. The registerDevice and registerDeviceInSsoMode
    // functions should be combined.
    registerDeviceInSsoMode: function() {
        var me = this,
                session = Ext.create('Common.Session'),
                isNativeMode = Environment.getNativeMode(),
                user,
                deviceId,
                registerSuccess,
                employeeId,
                appsResult;

        // If we are not in native mode we need to generate a device id
        if (!isNativeMode) {
            deviceId = Device.generateDeviceId();
            // Save for use in the Session object
            ConfigFileManager.deviceId = deviceId;
        }

        registerSuccess = MobileSecurityServiceAdapter.registerDevice(deviceId, null, null);

        if (!registerSuccess) {
            Ext.Msg.alert('Registration', 'Registration Failed');
            return;
        }

        employeeId = me.retrieveUserEmployeeId();

        // Get the current username
        session.doInSession(function() {
            user = Common.service.MobileSecurityServiceAdapter.getUser();
        });

        appsResult = me.getEnabledApplications();

        if (appsResult.success) {
            me.saveEnabledApplications(appsResult.applications, function () {
                me.savePreferences(true, user.name, deviceId, employeeId, function () {
                    me.displayAppSelectionView();
                });
            }, me);
        } else {
            Ext.Msg.alert('Error', appsResult.errorMessage);
            me.displayAppSelectionView();
        }
    },

    /**
     * Saves the user preferences to the Configuration storage
     * @param isRegistered {Boolean} true if the device is registered, false otherwise
     * @param username {String} The device user name
     * @param deviceId {String} The device id
     * @param employeeId {String} The employee code of the device user
     * @param callback {Function} executed when the save operation is completed.
     */
    savePreferences: function (isRegistered, username, deviceId, employeeId, callback) {
        var me = this;

        ConfigFileManager.isRegistered = isRegistered;
        ConfigFileManager.username = username;
        ConfigFileManager.deviceId = deviceId;
        ConfigFileManager.employeeId = employeeId;

        // Wait for the save to complete before proceeding.
        //
        ConfigFileManager.sync(function () {
            if (typeof callback === 'function') {
                callback.call(me || this);
            }
        });
    },

    /**
     * Retrieves the applications the registered user has access to.
     * @return result {Object} result object containing the applications and success information.
     *         success: {Boolean} True if the operation completes without errors
     *         enabledApplications: {Array} Array of application records.
     *         errroMessage: {Object} The exception message if success is false
     */
    getEnabledApplications: function () {
        var session = Ext.create('Common.Session'),
            enabledApplicationResult = {},
            sessionResult;

        // Try to start a user session
        sessionResult = session.startSessionWithReturn();

        if(sessionResult.success) {
            enabledApplicationResult = MobileSyncServiceAdapter.getEnabledApplications();
            session.endSession();
        } else {
            enabledApplicationResult.applications = [];
            enabledApplicationResult.success = false;
            enabledApplicationResult.errorMessage = sessionResult.errorMessage;
        }

       return enabledApplicationResult;
    },

    /**
     * Converts the enabled application records returned from the server to an array of application model
     * objects.
     *
     * @param enabledApplications
     *            {Array} Enabled applications for the mobile user
     * @returns {Model} An array of application models
     */
    convertEnabledApplicationsToRecords: function (enabledApplications) {
        var me = this, applicationRecords = [];

        Ext.each(enabledApplications, function (application) {
            var applicationId, iconData, appModel;

            // Get the data for the application icon
            // The icon data should be provided by the server when the applications
            // are downloaded. For now we are storing the icon url data in the IconData class.

            // Get the application id from the url.
            // We only need the root of the url
            // WorkRequest instead of ../WorkRequest/index.html.
            applicationId = application.url.replace(/\/index.html/g, '').replace(/..\//g, '');
            iconData = AppLauncher.ui.IconData.getIconData(applicationId);

            appModel = new Common.model.App();
            appModel.set('title', application.title);
            appModel.set('url', applicationId);
            appModel.set('iconData', iconData);
            applicationRecords.push(appModel);
        }, me);

        return applicationRecords;
    },

    launchSelectedApplication: function (application) {

        // Load the application using an absolute URL
        var targetUrl,
            browserMode = Common.util.Environment.getBrowserMode();

        // <debug>
        // Handle the debug case
        if (Ext.os.deviceType === 'Desktop' || browserMode) {
            var currentUrl = window.location.href;
            // Replace AppLauncher with the new application name
            targetUrl = currentUrl.replace(/AppLauncher/g, application);
            window.document.location = targetUrl;
            return;
        }
        // </debug>

        // If we are running on a device we need to get the URL configuration from the config file.
        if (Ext.os.deviceType === 'Phone' || Ext.os.deviceType === 'Tablet') {
            // var currentUrl = window.location.href;
            // Replace AppLauncher with the new application name
            // targetUrl = currentUrl.replace(/AppLauncher/g, application);
            // window.document.location = targetUrl;

            // TODO: check if site is reachable and if it is cached
            var applicationUrl = ConfigFileManager.url + '/' + application + '/index.html';
            window.document.location = applicationUrl;
        }
    },

    onRegisterUser: function () {
        var me = this,
            preferencesView = this.getPreferencesView(),
            userName = preferencesView.query('textfield[name=user_name]')[0].getValue();

        // Warn user that data may be lost
        Ext.Msg.confirm('Register Device', 'Changing the registered user will remove all of the data for user ' + userName + '.<br>' +
                'Any changes that have not been synchronized to the server will be lost. Do you want to continue?', function (response) {
            if (response === 'yes') {
                Common.util.Database.deleteDataFromAllTables(function () {
                    me.deleteSpaceSurveyKey();
                    me.doRegisterUser(preferencesView);
                }, me);
            } else {
                return;
            }
        });
    },

    doRegisterUser: function (preferencesView) {
        var me = this;

        if (preferencesView) {
            preferencesView.hide();
        }
        // Set isRegistered to false
        // Set userName to empty
        ConfigFileManager.username = '';
        ConfigFileManager.isRegistered = false;
        ConfigFileManager.employeeId = '';
        ConfigFileManager.sync(function () {
            me.onLaunch();
        });
    },

    /**
     * Deletes the Space Book survey tracking data from localStorage if it exists.
     */
    deleteSpaceSurveyKey: function () {
        var spaceSurveyValue = localStorage.getItem('Ab.SpaceBook.SurveyState');
        if (spaceSurveyValue) {
            localStorage.removeItem('Ab.SpaceBook.SurveyState');
        }
    },

    /**
     * Uses the device id defined in the device-api file. Uses the GUEST-MOBILE account.
     * Only available in browser mode
     */
    onGuestSignOn: function () {
        var me = this,
        // Use the device id defined in the device-api.js file
            deviceId = device.uuid,
            username = me.getGuestUserAccount(),
            employeeName;

        ConfigFileManager.deviceId = deviceId;
        employeeName = me.retrieveUserEmployeeId();

        me.getAndSaveEnabledApplications(function () {
            me.savePreferences(true, username, deviceId, employeeName, function () {
                me.displayAppSelectionView();
            });
        }, me);
    },

    retrieveUserEmployeeId: function () {
        var session = Ext.create('Common.Session'),
            user = null,
            employeeId = '';

        session.doInSession(function () {
            user = Common.service.MobileSecurityServiceAdapter.getUser();
        });

        if (user) {
            employeeId = user.employee.id;
        }

        return employeeId;
    }

    /*
    waitForDwrScriptsToLoad: function(onConnected, scope) {
        var me = this,
            i = 0,
            clearInt = function() {
                clearInterval(interval);
            },

            interval = setInterval(function() {
                i += 1;
                console.log(' ----> Looping in script delay count: ' + i);
                var areScriptsReady = ScriptManager.isSmartClientConfigServiceAvailable();
                if(areScriptsReady || i === 10) {
                    clearInt();
                    if(typeof onConnected === 'function') {
                        onConnected.call(me || scope);
                    }
                }
            }, 250);
    },
    */

    /*
    isInSsoMode: function(onCompleted, scope) {
        var me = this,
            isInSsoMode = false;
        // Check if the SmartClientConfigService is available
        me.waitForDwrScriptsToLoad(function() {
            isInSsoMode = MobileSecurityServiceAdapter.isInSsoMode();
            Ext.callback(onCompleted, scope || me, [isInSsoMode]);
        }, me);
    }
    */
});