/**
 * Manages scripts used in the application. Provides functions for dynamically managing scripts.
 * 
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.scripts.ScriptManager', {

    alternateClassName : [ 'ScriptManager' ],

	singleton : true,

	/**
	 * Indicates if the DWR scripts have completed loading. True when the scripts are loaded.
	 */
	//isDwrLoaded : false,

	/**
	 * Indicates if the DWR scripts are in the process of loading. True if the loading has started but is not complete.
	 */
	isScriptLoading : false,

	/**
	 * Registers the DWR scripts. It can take several seconds for the scripts to load so we provide a callback function
	 * that is called when all the scripts have loaded. The isDwrLoaded flag can be used to query if the scripts have
	 * been loaded.
	 * 
	 * @param callback
	 *            {Function} Called when the scripts have completed loading.
	 * @param scope
	 *            {Object} The scope to execute the callback function in.
	 */
	registerDwrServiceScripts : function(callback, scope) {

		var me = this;

        if(me.isScriptLoading) {
            return;
        }

        // If the scripts are already loaded execute the callback function if it exists
        if (me.checkIfDwrScriptsAreLoaded()) {
            if (typeof callback === 'function') {
                callback.call(scope || me);
            }
            me.isScriptLoading = false;
            return;
        }

        me.isScriptLoading = true;

		console.log('Start script load ' + new Date());
		var NUMBER_OF_SCRIPTS_TO_LOAD = 8;

		var checkIfScriptsAreLoaded = function() {
			NUMBER_OF_SCRIPTS_TO_LOAD -= 1;
			if (NUMBER_OF_SCRIPTS_TO_LOAD === 0) {
                if (me.checkIfDwrScriptsAreLoaded()) {
                    console.log('--> script loaded callback scripts are LOADED');
                } else {
                    console.log('--> script loaded callback scripts are NOT LOADED');
                }
				me.isScriptLoading = false;
				console.log('DWR scripts are loaded ' + new Date());
				if (typeof callback === 'function') {
                        callback.call(scope || me);
                }
			}
		};

		// The script id must match the id's defined in the index.html file
		var mobileSyncServiceEl = Ext.fly('mobilesyncservice');
		mobileSyncServiceEl.set({
			src : '/archibus/dwr/interface/MobileSyncService.js'
		});
		mobileSyncServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var securityServiceEl = Ext.fly('securityservice');
		securityServiceEl.set({
			src : '/archibus/dwr/interface/SecurityService.js'
		});
		securityServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var mobileSecurityServiceEl = Ext.fly('mobilesecurityservice');
		mobileSecurityServiceEl.set({
			src : '/archibus/dwr/interface/MobileSecurityService.js'
		});
		mobileSecurityServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var smartClientConfigServiceEl = Ext.fly('smartclientconfigservice');
		smartClientConfigServiceEl.set({
			src : '/archibus/dwr/interface/SmartClientConfigService.js'
		});
		smartClientConfigServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var adminServiceEl = Ext.fly('adminservice');
		adminServiceEl.set({
			src : '/archibus/dwr/interface/AdminService.js'
		});
		adminServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var drawingSvgServiceEl = Ext.fly('drawingSvgService');
		drawingSvgServiceEl.set({
			src : '/archibus/dwr/interface/DrawingSvgService.js'
		});
		drawingSvgServiceEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var workflowEl = Ext.fly('workflowScr');
		workflowEl.set({
			src : '/archibus/dwr/interface/workflow.js'
		});
		workflowEl.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};

		var element = Ext.fly('engineScr');
		element.set({
			src : '/archibus/dwr/engine.js'
		});
		element.dom.onload = function() {
			checkIfScriptsAreLoaded();
		};
	},

    checkIfDwrScriptsAreLoaded: function() {
        if ((typeof dwr !== 'undefined') &&
            (typeof SecurityService !== 'undefined') &&
            (typeof MobileSecurityService !== 'undefined') &&
            (typeof SmartClientConfigService !== 'undefined') &&
            (typeof workflow !== 'undefined') &&
            (typeof MobileSyncService !== 'undefined')) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Returns true if the SmartClientConfigService is available.
     * Used to determine if the dwr scripts are loaded
     * @returns {boolean}
     */
    isSmartClientConfigServiceAvailable: function() {
        var isAvailable = false,
            options = {
            async: false,
            callback: function(result) {
                if(result && (result.indexOf('com.archibus') !== -1)) {
                    isAvailable = true;
                }
            },
            errorHandler: function() {
                isAvailable = false;
            }
        };

        if(Ext.isDefined(SmartClientConfigService)) {
            SmartClientConfigService.toString(options);
            return isAvailable;
        } else {
            return false;
        }
    }

});