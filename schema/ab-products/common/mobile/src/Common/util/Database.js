/**
 * Database utility functions
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Database', {

    singleton: true,

    onError: function(tx, error) {
        throw new Error(error.message);
    },

    /**
     * Retrieves a list of all database tables in the Sqlite database.
     * Does not include the system tables
     * @param onCompleted {Function} Callback function called when the operation is completed
     *          @param tableNames {Array} Array of table names
     * @param scope {Object} The scope to execute the callback
     */
    getAllDatabaseTables: function(onCompleted, scope) {
        var me = this,
            tableNames = [],
            db = SqliteConnectionManager.getConnection(),
            sql = "SELECT name FROM sqlite_master WHERE type='table' and name NOT IN ('__WebKitDatabaseInfoTable__','sqlite_sequence')",
            i;

            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx, result) {
                    if (result.rows.length > 0) {
                        for(i = 0; i < result.rows.length; i++) {
                            tableNames.push(result.rows.item(i).name);
                        }
                    }
                    if (typeof onCompleted === 'function') {
                        onCompleted.call (scope || me, tableNames);
                    }
                },me.onError);

            });
    },

    /**
     * Deletes the data from all database tables excluding the system tables
     * @param onCompleted {Function} Executed when all tables have had the data deleted
     * @param scope {Object} The scope to execute the callback function
     */
    deleteDataFromAllTables: function (onCompleted, scope) {
        var me = this,
            tableCount = 0,
            checkIfCompleted = function () {
                tableCount -= 1;
                if (tableCount === 0) {
                    if (typeof onCompleted === 'function') {
                        onCompleted.call (scope || me);
                    }
                }
            };
        me.getAllDatabaseTables(function (tableNames) {
            tableCount = tableNames.length;
            Ext.each(tableNames, function(table) {
                me.deleteDataFromTable(table, function () {
                    checkIfCompleted();
                }, me);
            },me);
        }, me);
    },

    /**
     * Deletes all records from the database table
     * @param tableName {String} Name of the database table
     * @param onSuccess {Function} Called when the delete operation is successful
     * @param scope {Object} The scope to execute the onSuccess function.
     */
    deleteDataFromTable: function (tableName, onSuccess, scope) {
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = 'DELETE FROM ' + tableName;

        db.transaction(function (tx) {
            tx.executeSql(sql, null, function() {
                if (typeof onSuccess === 'function') {
                    onSuccess.call (scope || me);
                }
            }, me.onError);
        });
    }
});