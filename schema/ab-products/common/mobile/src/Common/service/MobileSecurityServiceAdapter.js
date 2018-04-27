/**
 * Encapsulates details of MobileSecurityService, SecurityService, SmartClientConfigService, AdminService calls. Translates service
 * exceptions using ExceptionTranslator.
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.service.MobileSecurityServiceAdapter', {
	singleton : true,
    alternateClassName: ['MobileSecurityServiceAdapter'],

	requires : [ 'Common.service.ExceptionTranslator', 'Common.security.Security' ],

	/**
	 * Registers device with specified deviceId for ARCHIBUS user with specified username and password.
	 * 
	 * @public
	 * @param {String}
	 *            deviceId ID of the device to be registered.
	 * @param {String}
	 *            username ARCHIBUS username for whom the device will be registered.
	 * @param {String}
	 *            password password of the ARCHIBUS user for whom the device will be registered.
	 * @throws exception
	 *             if registration fails.
	 */
	registerDevice : function(deviceId, username, password) {
		console.log('Calling MobileSecurityService.registerDevice: deviceId=[' + deviceId + "], username=[" + username +
                     "], password=[" + password + "]");

		var deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
		    usernameEncrypted = Common.security.Security.encryptString(username),
		    passwordEncrypted = Common.security.Security.encryptString(password),

            result = false;

		MobileSecurityService.registerDevice(deviceIdEncrypted, usernameEncrypted, passwordEncrypted, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function () {
                result = true;
            },
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:registerDevice');
                exception.genericMessage = 'Error registering device.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

        return result;
	},

	/**
	 * Ends user session.
	 * 
	 * @public
	 * @throws exception
	 *             if operation fails.
	 */
	logout : function() {
		console.log('Calling SecurityService.logout');

		SecurityService.logout({
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : Ext.emptyFn,
            headers: { "cache-control": "no-cache" },
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:logout');
                exception.genericMessage = 'Error logging out of Session.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});
	},

	/**
	 * Starts user session for the mobile user.
	 * 
	 * @public
	 * @param {String}
	 *            deviceId ID of the device.
	 * @param {String}
	 *            localeName Java locale name, for example "en_US".
	 * @throws exception
	 *             if operation fails.
	 */
	startMobileUserSession : function(deviceId, localeName) {
        var me = this;
        console.log('Start Mobile User Session deviceId: [' + deviceId + ']');
		if (me.isInSsoMode()) {
			me.startMobileSsoUserSession();
		} else {
			me.startMobileUserSessionForDeviceId(deviceId);
		}
		me.setSessionLocale(localeName);
	},


    /**
     * Starts the session for the mobile user. Does not throw an exception if
     * an error occurs during the session set up.
     * The status of the session operation is returned in the result object
     * @param deviceId {String} The mobile device id
     * @param localeName {String} The locale setting of the mobile browser
     * @returns {Object} results object containing the success flag and any error messages.
     */
    startMobileUserSessionWithReturn: function(deviceId, localeName) {
        var me = this,
            startSessionResult;

        console.log('Start Mobile User Session deviceId: [' + deviceId + ']');
        if (me.isInSsoMode()) {
            startSessionResult = me.startMobileSsoUserSession(false);
        } else {
            startSessionResult = me.startMobileUserSessionForDeviceId(deviceId, false);
        }
        if (startSessionResult.success) {
            me.setSessionLocale(localeName);
        }
        return startSessionResult;
    },


	/**
	 * Sets locale of the user session.
	 * 
	 * @private
	 * @param {String}
	 *            localeName Java locale name, for example "en_US".
	 * @throws exception
	 *             if operation fails.
	 */
	setSessionLocale : function(localeName) {
		console.log('Calling SecurityService.setLocaleFromJavaLocale: localeName=[' + localeName + ']');

		SecurityService.setLocaleFromJavaLocale(localeName, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : Ext.emptyFn,
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:setSessionLocale');
                exception.genericMessage = 'Error setting Session Locale.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});
	},

	/**
	 * Starts user session for the mobile user.
	 * 
	 * @private
	 * @throws exception
	 *             if operation fails.
	 */
	startMobileSsoUserSession : function(throwError) {
		console.log('Calling MobileSecurityService.startMobileSsoUserSession');

        var result = {
                    success: false,
                    errorMessage: ''
                };

        if (!Ext.isDefined(throwError)) {
            throwError = true;
        }

		MobileSecurityService.startMobileSsoUserSession({
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function() {
                result.success = true;
            },
			errorHandler : function(message, exception) {
                result.success = false;
                exception.genericMessage = 'Error starting User Session.';
                result.errorMessage = Common.service.ExceptionTranslator.extractMessage(exception);
                if (throwError) {
                    Common.service.ExceptionTranslator.translate(exception);
                }
			}
		});

        return result;
	},

	/**
	 * Starts user session for the mobile user.
	 * 
	 * @private
	 * @param {String}
	 *            deviceId ID of the device.
	 * 
	 * @throws exception
	 *             if operation fails.
	 */
	startMobileUserSessionForDeviceId : function(deviceId, throwError) {
		console.log('Calling MobileSecurityService.startMobileUserSessionForDeviceId: deviceId=[' + deviceId + ']');

        var result = {
                success: false,
                errorMessage: ''
            },
            deviceIdEncrypted = Common.security.Security.encryptString(deviceId);


        if (!Ext.isDefined(throwError)) {
            throwError = true;
        }

		MobileSecurityService.startMobileUserSessionForDeviceId(deviceIdEncrypted, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function() {
                result.success = true;
            },
			errorHandler : function(message, exception) {
                result.success = false;
                console.log('ERROR - MobileSecurityServiceAdapter:startMobileUserSessionForDeviceId');
                exception.genericMessage = 'Error starting User Session.';
				result.errorMessage = Common.service.ExceptionTranslator.extractMessage(exception);

                if(throwError) {
                    Common.service.ExceptionTranslator.translate(exception);
                }
			}
		});

        return result;
	},

	/**
	 * Returns true if WebCentral uses one of the standard SSO configurations.
	 * 
	 * @private
	 * @return true if WebCentral uses one of the standard SSO configurations.
	 * @throws exception
	 *             if operation fails.
	 */
	isInSsoMode : function() {

		// Determine if WebCentral is in SSO mode:
		var ssoModeEncrypted = '',
            inSsoMode = false,
            ssoModeDecrypted;

		SmartClientConfigService.getSsoMode({
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				ssoModeEncrypted = returnValue;
			},
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:isInSsoMode');
                exception.genericMessage = 'Single Sign On Error';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

        if(ssoModeEncrypted.length > 0) {
            ssoModeDecrypted = Common.security.Security.decryptString(ssoModeEncrypted);
            // We are in sso mode if the decrypted string contains
            // the the text preauth.
            inSsoMode = ssoModeDecrypted.indexOf('preauth') !== -1;
        }
		return inSsoMode;
	},

	/**
	 * Returns User DTO.
	 * 
	 * @public
	 * @return DTO for User.
	 * @throws exception
	 *             if operation fails.
	 */
	getUser : function() {
		var user = null;

		AdminService.getUser({
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				user = returnValue;
			},
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:getUser');
                exception.genericMessage = 'Error retrieving User information.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

		return user;
	},
	
	/**
	 * Returns true if current user is a member of the specified security group.
	 * 
	 * @public
     * @param group id of security group.
     * @return true if current user is a member of the specified security group.
	 * @throws exception
	 *             if operation fails.
	 */
	isUserMemberOfGroup : function(group) {
		var isUserMemberOfGroup = null;

		AdminService.isUserMemberOfGroup(group, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				isUserMemberOfGroup = returnValue;
			},
			errorHandler : function(message, exception) {
                console.log('ERROR - MobileSecurityServiceAdapter:isUserMemberOfGroup');
                exception.genericMessage = 'Error retrieving User information.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

		return isUserMemberOfGroup;
	}
});