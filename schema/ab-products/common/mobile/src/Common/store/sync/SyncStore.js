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
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.SyncStore', {
    extend: 'Common.store.sync.SchemaUpdaterStore',
    requires: [ 'Common.service.MobileSyncServiceAdapter' ],

    constructor: function (config) {
        this.callParent(arguments);
    },

    serverFieldNames: null,
    inventoryKeyNames: null,

    /**
     * Creates restriction 'mob_locked_by' = username.
     *
     * @private
     */
    createAssignedToCurrentUserRestriction: function () {
        var restriction = {};

        restriction.clauses = [
            {
                tableName: this.serverTableName,
                fieldName: 'mob_locked_by',
                operation: 'EQUALS',
                value: this.session.getUsername()
            }
        ];

        console.log('createAssignedToCurrentUserRestriction');
        return restriction;
    },

    /**
     * Synchronizes the store with the server. Applies the restriction to the server before getting
     * records from the server.
     * <p>
     *
     * @public
     * @param {AbstractRestrictionDef}
     *            restriction to be applied to the server-side table.
     */
    synchronize: function (callback, scope) {

        var me = this, onSynchronizeCompleted = function () {
            if (typeof callback === 'function') {
                callback.call(scope || me);
            }
        }, tableDef = me.getTableDefFromServer(me.serverTableName);

        me.getChangedOnMobileRecords(function (records) {
            var checkedOutRecords = [];

            me.processDocumentFields(records);

            // Check if the table definition is current
            me.updateIfNotModelAndTable(tableDef, function () {
                me.doInSession(function () {
                    var restriction = me.createAssignedToCurrentUserRestriction();
                    me.checkInRecords(records);
                    checkedOutRecords = me.checkOutRecords(restriction);
                });
                me.removeAllAndInsertRecords(checkedOutRecords, onSynchronizeCompleted, me);
            }, me);
        }, me);
    },

    /**
     * Gets from this store records with mob_is_changed = 1.
     *
     * @private
     * @return {WorkRequest[]} records according to the filter.
     */
    getChangedOnMobileRecords: function (callback, scope) {

        var me = this,
                onLoad = function (records) {
                    if (typeof callback === 'function') {
                        callback.call(scope || me, records);
                    }
                };

        // filter records with Changed on Mobile? = Yes
        // Setting the remote filter so that the store retrieves all of the
        // records from the mobile database
        // This will handle the case where there are modified records that are
        // not in the current page.

        me.clearFilter();
        me.filter('mob_is_changed', 1);
        // get filtered records from records loaded into the store

        // Disable paging so we can be sure that we retrieve all of the records
        me.setDisablePaging(true);

        me.load(function (records) {
            me.clearFilter();
            // Reset the store page size
            me.setDisablePaging(false);
            onLoad(records);
        }, me);
    },

    /**
     * Checks in all changed records in this store.
     *
     * @private
     */
    checkInRecords: function (records) {
        Common.service.MobileSyncServiceAdapter.checkInRecords(this.serverTableName,
                this.inventoryKeyNames, records);
    },

    /**
     * Checks out all records to this store and table that meet the restriction. Locks the checked-out
     * records.
     *
     * @private
     * @param {AbstractRestrictionDef}
     *            restriction to be applied to the server-side table.
     */
    checkOutRecords: function (restriction) {

        var me = this,
                serverFieldNames = me.getServerFieldsFromModel(),
                records = Common.service.MobileSyncServiceAdapter.checkOutRecords(me.serverTableName, serverFieldNames, restriction, me.getModel());

        me.resetChangedOnMobile(records);

        return records;
    },

    /**
     * Resets "mob_is_changed" field value to false for all records. if records == null, do nothing.
     *
     * @private
     * @param {Model[]}
     *            records to be processed.
     */
    resetChangedOnMobile: function (records) {
        var ln = records.length, i;

        if (records !== null) {
            for (i = 0; i < ln; i++) {
                records[i].set('mob_is_changed', 0);
            }
        }
    },

    /**
     * Searches the record for all document fields. If the document field is populated and the
     * associated doc_isnew property is false, the document data is cleared and not included in the
     * check in
     *
     * @param {Array}
     *            changedOnMobileRecords
     */

    processDocumentFields: function (changedOnMobileRecords) {
        var me = this;

        Ext.each(changedOnMobileRecords, function (record) {
            var fields = record.getFields().items;
            Ext.each(fields, function (field) {
                var fieldName, docIsNewValue;
                if (field.getIsDocumentField()) {
                    fieldName = field.getName();
                    docIsNewValue = record.get(fieldName + '_isnew');
                    if (!docIsNewValue) {
                        record.set(fieldName + '_contents', '');
                    }
                }
            }, me);

        }, me);
    },

    /**
     * Generates an array of field names that are supplied to the server for synchronization The server
     * fields are generated dynamically because we need to support the synchronization of dynamic model
     * instances. The model id fields any doc_contents fields are not included in fields sent to the
     * server.
     *
     * @returns {Array} Model field names to be sent to the server during synchronization.
     */
    getServerFieldsFromModel: function () {
        var model = this.getModel(), fields = model.getFields().items, serverFields = [];

        Ext.each(fields,
                function (field) {
                    var fieldName = field.getName(), isDocContentsField = fieldName
                            .indexOf('_contents') !== -1;

                    if (field.getIsSyncField() && fieldName !== 'id' && !isDocContentsField) {
                        serverFields.push(field.getName());
                    }
                });

        return serverFields;
    }
});