/**
 * Provides persistence and synchronization to application domain objects/models.
 * <p>
 * Uses SQLite database for persistence.
 * <p>
 * Uses DWR services for synchronization with the server.
 * <p>
 * Holds information required for mapping to the server-side table: serverTableName, inventoryKeyNames.
 * <p>
 * The Store class encapsulates a cache of domain objects.
 * <p>
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.SessionStore', {
	extend : 'Common.store.sync.SqliteStore',
	requires : [ 'Common.Session' ],

	constructor : function(config) {
		// callParent parameter requires array. Alternately use callParent([config]). JMs
		this.callParent(arguments);

		// 12.14.12 Renamed. JM
		this.cacheSession();
	},

	// Cached references
	session : null,

	/**
	 * Caches reference to Session with the deviceId from the preferences.
	 * 
	 * @private
	 */
	cacheSession : function() {
		// create and cache Session
		this.session = Ext.create('Common.Session');
	},

	/**
	 * Calls specified callback in context of user session: starts new user session, calls callback, ends the user
	 * session. To be called from the corresponding controller.
	 * <p>
	 * The callback needs to be specified in the controller, and should contain business logic specific for the
	 * application and the table. The callback typically contains calls to the synchronize method and to the DWR
	 * services.
	 * 
	 * @public
	 * @param {Function}
	 *            callback to be called inside of the WebCentral user session.
	 * 
	 */
	doInSession : function(callback) {
		this.session.doInSession(callback);
	},

    /**
     * Calls specified callback in context of user session: starts new user session, calls callback, ends the user
     * session. To be called from the corresponding controller.
     * @param callback {Function} Function executed inside the sessioin
     * @param onLoggedOut {Function} Called when the session has ended
     * @param scope {Object} The scope to execute onLoggedOut callback.
     */
    doInSessionWithLogoutNotify: function (callback, onLoggedOut, scope) {
        this.session.doInSessionWithLogoutNotify(callback, onLoggedOut, scope);
    }

});