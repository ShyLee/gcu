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
 * Does not convert data from the server to model objects before writing the data to the database for performance.  
 * Assumes that any validating table on the mobile device:
 * <p>
 * - will always have fields of type string;
 * <p>
 * - will never have fields of type int, date, time, number (Double, Float).
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.ValidatingTableStore', {
	extend : 'Common.store.sync.SchemaUpdaterStore',
	requires : [ 'Common.service.MobileSyncServiceAdapter' ],

	constructor : function(config) {
		this.callParent(arguments);
	},

    /**
     * Clears the store and table, imports records from the server.
     * Before importing records, updates model and table of the store according
     * to the server-side TableDef, if cached TableDef does not match.
     * @param completedCallback {Function} Executed when the operation is completed.
     *         @param success {Boolean} true if the operation completes without errors
     * @param scope {Object} The scope to execute the completedCallback function.
     */
	clearAndImportRecords : function(completedCallback, scope) {

		var me = this,
            restriction = me.getRestriction(),
		    tableDef = me.getTableDefFromServer(me.serverTableName);

        me.updateIfNotModelAndTable(tableDef, function () {
            me.session.startSession();
            me.importRecords(restriction, function(success) {
                me.session.endSession();
                if (typeof completedCallback === 'function') {
                    completedCallback.call(scope || me, success);
                }
            }, me);
        }, me);
	},

    /**
     * Imports records from the server into this table.
     * @param {AbstractRestrictionDef}
     *            restriction to be applied to the server-side table.
     * @param onCompletedCallback {Function} Called when the import operation is completed
     *        @param success {Boolean} true if the import succeeded without errors.
     * @param scope {Object} The scope to execute the onCompletedCallback function
     */
	importRecords : function(restriction, onCompletedCallback,  scope) {
		// Retrieve the records from the server but do not convert them to model instances
        var me = this;
        MobileSyncServiceAdapter.retrieveRecordsAsync(me.serverTableName,
                                                      me.serverFieldNames,
                                                      restriction,
                                                      me.getModel(),
                                                      false, function(result) {
                    if(result.success) {
                        me.removeAllAndInsertRecords(result.records, function() {
                            if (typeof onCompletedCallback === 'function') {
                                onCompletedCallback.call(scope || me, true);
                            }
                        }, me);
                    } else {
                        Ext.Msg.alert('Error', ExceptionTranslator.extractMessage(result.exception));
                        if (typeof onCompletedCallback === 'function') {
                            onCompletedCallback.call(scope || me, false);
                        }
                    }
                }, me);

	}
});