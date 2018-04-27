/**
 * Provides WebCentral user session management: starts and ends user session around the specified operation. The
 * operation is typically a DWR service call, if that service method requires existing user session.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.Session', {

    requires: [ 'Common.service.MobileSecurityServiceAdapter',
                'Common.util.ConfigFileManager',
                'Common.util.Device' ],

    config: {
        /**
         * ID of the device.
         * <p>
         * Required to login to WebCentral, if WebCentral is not in SSO mode.
         */
        deviceId: null,

        /**
         * Username of the current user.
         * <p>
         * Cached in this class, to be used in derived classes to create restrictions by username and to pass to
         * WFRs.
         */
        username: null,

        /**
         * Current Java locale name, for example "en_US".
         * <p>
         * Used after the WebCentral user session is started, to set the locale of the session.
         */
        localeName: null
    },

    statics: {
        sessionCount: 0
    },

    constructor: function (config) {
        this.initConfig(config);
    },

    /**
     * @private Sets the Session properties using the properties stored in the ConfigFileManager class.
     */
    setSessionProperties: function () {
        var me = this;

        me.setDeviceId(ConfigFileManager.deviceId);
        me.setUsername(ConfigFileManager.username);
        me.setLocaleName(ConfigFileManager.localeName);
    },

    /**
     * @public Performs specified callbackOperation in context of user session: starts new user session,
     *         performs callbackOperation, ends the user session.
     *         <p>
     * @throws an
     *             exception if user does not have the authorization to access Web Central from a mobile device,
     *             or if user account cannot be found, or if user session cannot be started.
     *
     */
    doInSession: function (callbackOperation) {
        var me = this;
        me.setSessionProperties();
        try {
            if (Common.Session.sessionCount > 0) {
                me.logoutOfOrphanedSessions();
            }
            Common.Session.sessionCount += 1;
            console.log(' ---> ' + 'Starting Session - Session Count: [' + Common.Session.sessionCount + ']');
            Common.service.MobileSecurityServiceAdapter.startMobileUserSession(me.getDeviceId(), me.getLocaleName());
            callbackOperation();
        }
        catch(e) {
            console.log(' ----> Catch error Common.Session.doInSession error: ' + e.message + ' Session Count: [' + Common.Session.sessionCount + ']');
            throw new Error(e);
        }
        finally {
            Common.service.MobileSecurityServiceAdapter.logout();
            if (Common.Session.sessionCount > 0) {
                Common.Session.sessionCount -= 1;
            }
            console.log(' ---> ' + 'Closing Session - Session Count: [' + Common.Session.sessionCount + ']');
        }
    },

    /**
     * Performs specified callbackOperation in context of user session: starts new user session,
     *         performs callbackOperation, ends the user session. Notifies the caller when the
     *         session has been closed
     * <p>
     * In some cases, when performing multiple service calls, program control can return to the caller
     * before the session has been closed.
     * <p>
     * For these cases, the onLogout callback is provided to allow the caller to know when the session
     * has ended
     * @param callbackOperation {Function} The operation to execute in the session
     * @param onLogout {Function} Function called when the session has ended
     * @param scope {Object} Scope to execute the callback in.
     */
    doInSessionWithLogoutNotify: function (operation, onLogout, scope) {
        var me = this;
        me.setSessionProperties();
        try {
            if (Common.Session.sessionCount > 0) {
                me.logoutOfOrphanedSessions();
            }
            Common.service.MobileSecurityServiceAdapter.startMobileUserSession(me.getDeviceId(), me.getLocaleName());
            Common.Session.sessionCount += 1;
            operation();
        } finally {
            Common.service.MobileSecurityServiceAdapter.logout();
            if (Common.Session.sessionCount > 0) {
                Common.Session.sessionCount -= 1;
            }
            if (typeof onLogout === 'function') {
                onLogout.call(scope || me);
            }
        }
    },

    /**
     * Close all open sessions. Orphaned sessions can occur when an exception is thrown
     * and the processing is not stopped before the exception is handled.
     */
    logoutOfOrphanedSessions: function() {
        var orphanedSessions = Common.Session.sessionCount,
            i;

        for (i = 0; i < orphanedSessions; i++) {
            console.log('Log out of orphan session');
            Common.service.MobileSecurityServiceAdapter.logout();
            Common.Session.sessionCount -= 1;
        }
    },

    /**
     * Starts a user session. The programmer is responsible for closing the session
     * using the endSession function.
     */
    startSession: function() {
        var me = this,
            deviceId = ConfigFileManager.deviceId,
            localeName = ConfigFileManager.localeName;

        if (Common.Session.sessionCount > 0) {
            me.logoutOfOrphanedSessions();
        }

        // TODO: Handle errors
        Common.service.MobileSecurityServiceAdapter.startMobileUserSession(deviceId, localeName);
        Common.Session.sessionCount += 1;
    },

    /**
     * Ends a user session
     */
    endSession: function() {
        // TODO: Handle errors
        Common.service.MobileSecurityServiceAdapter.logout();
        if (Common.Session.sessionCount > 0) {
            Common.Session.sessionCount -= 1;
        }
    },


    /**
     * Starts a user session. Does not throw an exception if the session invocation fails
     * @returns sessionResult {Object}
     *         success - true if the session started without errors
     *         errorMessage - the error message if success is false.
     */
    startSessionWithReturn: function() {
        var me = this,
            deviceId = ConfigFileManager.deviceId,
            localeName = ConfigFileManager.localeName,
            sessionResult;

        if (Common.Session.sessionCount > 0) {
            me.logoutOfOrphanedSessions();
        }

        sessionResult = Common.service.MobileSecurityServiceAdapter.startMobileUserSessionWithReturn(deviceId, localeName);
        Common.Session.sessionCount += 1;

        return sessionResult;
    }
});