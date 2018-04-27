/**
 * Domain object and store for application configuration.
 * <p>
 * Stores application configuration in a file.
 * <p>
 * Caches application configuration.
 * <p>
 * Allows the data to be loaded and accessed synchronously. The application should populate this object using the load
 * method. Changes to the configuration object should be saved to the file using the sync method.
 * 
 * @author Jeff Martin
 * @author Valery Tydykov
 * 
 * @since 21.1
 */
Ext.define('Common.util.ConfigFileManager', {
	alternateClassName : [ 'ConfigFileManager' ],

	requires : [ 'Common.lang.LocaleManager', 'Common.util.Environment' ],

	singleton : true,

	/**
	 * Maintains the current value of the isRegistered flag
	 */
	isRegistered : false,

	/**
	 * Maintains the base url for all ARCHIBUS mobile applications
	 */
	url : '',

	/**
	 * Maintains the username of the user who registered this device
	 */
	username : '',

	/**
	 * Maintains the unique device identifier
	 */
	deviceId : '',

	/**
	 * Maintains the current locale as determined by the browser.
	 * 
	 */
	localeName : 'en-US',

	isLoaded : false,

    employeeId: '',

	CONFIGURATION_FILENAME : 'MobileClient.conf',

	/**
	 * Indicates if the app is running in Browser Mode. Browser Mode is enabled if the app is not running in the native
	 * device environment or the app is running in the Chrome browser.
	 */
	browserMode : false,

	/**
	 * Prefix used when storing configuration items in local storage.
	 */
	localStoragePrefix : 'Common.util.ConfigFileManager',

	constructor : function() {
		this.browserMode = Environment.getBrowserMode();

		// If we are not in browser mode then we are either in the native Phonegap environment
		// or we are running on the desktop Chrome browser.
		if (!this.browserMode) {
			// Override the Filesystem API to allow us to debug on the desktop using an environment
			// that simulates the device environment
			if (Ext.browser.is.Chrome) {
				this.overrideFileSystem();
			}
		}
	},

	/**
	 * Reads the configuration file and populate the configuration properties
	 * 
	 * @param onSuccess -
	 *            Callback function called when the load operation is completed
	 * @param onError -
	 *            Callback function called with load error information
	 * @param scope -
	 *            Scope for the supplied callback execution.
	 */

	load : function(onSuccess, onError, scope) {
		var me = this,

		onFileRead = function(result) {
			// Convert the configuration object to properties
			me.objectToProperties(result);
			me.isLoaded = true;
			if (typeof onSuccess === 'function') {
				onSuccess.call(scope || me, result);
			}
		},

		onFileReadError = function(error) {
			if (typeof onError === 'function') {
				onError.call(scope || me, error);
			} else {
				throw new Error('ConfigFileManager exception during load operation.');
			}
		};

		if (me.browserMode) {
			me.readLocalStorage();
			if (typeof onSuccess === 'function') {
				onSuccess.call(scope || me, 'local');
			}
		} else {
			me.readConfigObject(onFileRead, onFileReadError, scope);
		}
	},

	/**
	 * Writes the contents of the configuration object to the configuration file.
	 * 
	 * @param onSuccess -
	 *            Callback function called when the sync function completes
	 * @param onError -
	 *            Callback function called with error info if an error occurs
	 * @param scope -
	 *            Scope for the supplied callback execution.
	 */
	sync : function(onSuccess, onError, scope) {
		var obj = this.propertiesToObject();

		if (this.browserMode) {
			this.writeLocalStorage();
			if (typeof onSuccess === 'function') {
				onSuccess.call(scope);
			}
		} else {
			this.writeConfigObject(obj, onSuccess, onError, scope);
		}
	},

	/**
	 * Reads the configuration object from the file system
	 * 
	 * @private
	 * @param resultCallback -
	 *            Callback function called when the operation is complete. Contains the configuration object
	 * @param errorCallback -
	 *            Callback function containing the error information
	 * @param scope -
	 *            Scope to execute the callback functions.
	 */
	readConfigObject : function(resultCallback, errorCallback, scope) {
		var me = this, defaultConfig = me.propertiesToObject(),

		onError = function(errMsg) {
			// if the error code is 1 the file does not exist.
			// create the file with default values
			if (errMsg.code === 1) {
				me.writeConfigObject(defaultConfig, function() {
					if (typeof resultCallback === 'function') {
						resultCallback.call(scope || me, defaultConfig);
					}
				});
			} else if (typeof errorCallback === 'function') {
				errorCallback.call(scope || me, errMsg);
			} else {
				throw errMsg;
			}
		};

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			fileSystem.root.getFile(me.CONFIGURATION_FILENAME, {
				create : true,
				exclusive : false
			}, function(fileEntry) {
				fileEntry.file(function(file) {
					me.readFile(file, resultCallback, scope);
				}, onError);
			}, onError);
		}, onError);

	},

	/**
	 * Reads the contents of the file
	 * 
	 * @private
	 * @param file -
	 *            Filename to read
	 * @param resultCallback -
	 *            Callback function containing the contents of the file.
	 * @param scope -
	 *            Scope to execute the callback in.
	 */
	readFile : function(file, resultCallback, scope) {
		var me = this, reader = new FileReader(), configObj = {};

		reader.onloadend = function(evt) {
			// Convert the JSON string from the file to a configuration object
			if (Ext.isEmpty(evt.target.result)) {
				configObj = me.propertiesToObject();
			} else {
				configObj = JSON.parse(evt.target.result);
			}

			if (typeof resultCallback === 'function') {
				resultCallback.call(scope || this, configObj);
			}
		};
		reader.readAsText(file);
	},

	/**
	 * Converts the configuration object to a string and writes the string to the configuration file.
	 * 
	 * @param configObject -
	 *            The configuration object
	 * @param writeEndCallback -
	 *            Callback function called when the write operation is completed
	 * @param errorCallback -
	 *            Callback function called when an error occurs
	 * @param scope -
	 *            Scope provided for callback function execution
	 */
	writeConfigObject : function(configObject, writeEndCallback, errorCallback, scope) {
		var me = this, configObj, configObjStr,

		onError = function(err) {
			if (typeof errorCallback === 'function') {
				errorCallback.call(scope || me, err);
			} else {
				throw err;
			}
		};

		configObj = configObject;
		configObjStr = JSON.stringify(configObj);

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) { // got filesystem
			fileSystem.root.getFile(me.CONFIGURATION_FILENAME, {
				create : true,
				exclusive : false
			}, function(fileEntry) {
				fileEntry.createWriter(function(writer) {

					writer.onwriteend = function(evt) {

						if (typeof writeEndCallback === 'function') {
							writeEndCallback.call(scope || me, evt);
						}
					};

					// If this is a mobile browser we can just write the string
					// if this is a desktop browser we have to convert to a Blob before
					// writing
					if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
						writer.write(configObjStr);
					} else {
						// The paddedStr is an ugly hack. The Blob object does not replace the file
						// if the new file contents are 'shorter' than the original the remaining characters
						// will be left in place. The additional spaces at the end of the file prevent this.
						// This is only required for development on the desktop browser.
						var paddedStr = configObjStr + '                        ';
						var blob = new Blob([ paddedStr ], {
							"type" : "text\/plain"
						});
						writer.write(blob);
					}
				}, onError);
			}, onError);
		});
	},

	/**
	 * Converts the configuration object to individual ConfigFileManager properties.
	 * 
	 * @private
	 * @param configObject -
	 *            The configuration object
	 */
	objectToProperties : function(configObject) {
		var property;

		for (property in configObject) {
			if (configObject.hasOwnProperty(property)) {
				this[property] = configObject[property];
			}
		}

		// localeName is coming from the LocaleManager
		this.localeName = LocaleManager.getLocaleName();
	},

	/**
	 * Converts the ConfigFileManager properties to object format. Used when writing the configuration data to the file
	 * system.
	 * 
	 * @private
	 * @return {Object}
	 */
	propertiesToObject : function() {
		var me = this,
            configObject = {};

		configObject.isRegistered = me.isRegistered;
		configObject.username = me.username;
		configObject.deviceId = me.deviceId;
		configObject.url = me.url;
		configObject.localeName = me.localeName;
        configObject.employeeId = me.employeeId;

		return configObject;
	},

	/**
	 * Reads configuration items from local storage
	 */
	readLocalStorage : function() {

		var me = this,
            localStorageId = this.localStoragePrefix + '-',
            isRegistered = localStorage.getItem(localStorageId + 'isRegistered');

		if (isRegistered === null) {
			isRegistered = false;
		}

		me.isRegistered = isRegistered;
		me.username = localStorage.getItem(localStorageId + 'username');
		me.deviceId = localStorage.getItem(localStorageId + 'deviceId');
		me.url = document.location.href;
		me.localeName = LocaleManager.getLocaleName();
        me.employeeId = localStorage.getItem(localStorageId + 'employeeId');
	},

	/**
	 * Writes configuration values to local storage
	 */
	writeLocalStorage : function() {
		var localStorageId = this.localStoragePrefix + '-';

		localStorage.setItem(localStorageId + 'isRegistered', this.isRegistered);
		localStorage.setItem(localStorageId + 'username', this.username);
		localStorage.setItem(localStorageId + 'deviceId', this.deviceId);
		localStorage.setItem(localStorageId + 'url', this.url);
        localStorage.setItem(localStorageId + 'employeeId', this.employeeId);
	},

	/**
	 * Overrides the Filesystem API. Used when debugging using the Chrome desktop browser.
	 * 
	 * @private
	 * 
	 */
	overrideFileSystem : function() {

		// Global LocalFileSystem object for debugging on the desktop.
		LocalFileSystem = {
			TEMPORARY : window.TEMPORARY || 0,
			PERSISTENT : window.PERSISTENT || 1
		};

		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

		// Request quota storage for Chrome browsers
		// Try/Catch is required to prevent errors during the production build
		try {
			window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024, function(grantedBytes) {
				window.requestFileSystem(PERSISTENT, grantedBytes, function(fileEntry) {
					console.log('Allocated Quota Storage.');
				}, function(errMsg) {
					console.log('Error Requesting file system.');
				});
			}, function(e) {
				console.log('Error requesting storage quota', e);
			});
		} catch (e) {
			alert('Error overriding Filesystem ' + e);
		}
	}

});
