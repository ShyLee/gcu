/**
 * Provides a proxy interface for the Sqlite database. This class is based on
 * the Ext.data.proxy.SQL class but does not directly extend from the
 * Ext.data.proxy.SQL class.
 *
 * @author Jeff Martin
 * @since 21.1
 */
// TODO: (VT): why not extend Ext.data.proxy.SQL class? Use mixin?
// TODO: (VT): why this class needs to know about "server formatted record"?
// Move this functionality to another class.
// TODO: (VT): this class is too big and needs to be refactored.
Ext.define('Common.store.proxy.Sqlite', {

    extend: 'Ext.data.proxy.Client',

    alias: 'proxy.Sqlite',

    mixins: [ 'Common.store.proxy.ChangeTableStructureOperation' ],

    config: {

        /**
         * @cfg {Object} reader
         * @hide
         */
        reader: null,
        /**
         * @cfg {Object} writer
         * @hide
         */
        writer: null,

        /**
         * @cfg {String} table Name of the database table used
         *      to maintain the store data. The table name is
         *      generated from the name of the model associated
         *      with the proxy. If the proxy is assigned to
         *      Common.model.Building model the table name will
         *      be Building.
         */
        table: null,

        /**
         * @cfg {Array} columns. An array of columns names
         *      retrieved from the model definition. The array
         *      only includes column names of columns used in
         *      the database.
         */
        columns: '',

        /**
         * @cfg {Boolean} uniqueIdStategy. True if the model is
         *      using a unique id. For most ARCHIBUS
         *      implementations this value will be false. Most
         *      implementations will use a 'simple' id strategy
         *      and let the database generate the sequential
         *      id's.
         */
        uniqueIdStrategy: false,

        /**
         * @cfg {String} defaultDataFormat The date format used
         *      when writing date data to the database
         */
        defaultDateFormat: 'Y-m-d H:i:s.u',

        /**
         * @cfg {Boolean} isSchemaCurrent True when the database
         *      table schema matches the table Model definition.
         *      The database schema is verified the first time
         *      the store accesses the database.
         */
        isSchemaCurrent: false,

        /**
         * @cfg {Boolean} throwExceptionOnError. When true any
         *      errors encountered when accessing the database
         *      result in an exception being thrown. When false,
         *      the exception event is generated when an error
         *      occurs
         */
        throwExceptionOnError: true
    },

    // TODO schema-related operations should be in a separate
    // class
    updateModel: function (model) {
        if (model) {
            var modelName = model.modelName,
                defaultDateFormat = this.getDefaultDateFormat(),
                table = modelName.slice(modelName.lastIndexOf('.') + 1);

            model.getFields().each(
                    function (field) {
                        if (field.getType().type === 'date' && !field.getDateFormat()) {
                            field.setDateFormat(defaultDateFormat);
                        }
                    });

            this.setUniqueIdStrategy(model.getIdentifier().isUnique);
            this.setTable(table);
            this.setColumns(this.getPersistedModelColumns(model));
        }

        this.callParent(arguments);
    },

    applyOperationParameters: function (params, operation) {
        var sorters = operation.getSorters(), filters = operation
                        .getFilters(), page = operation.getPage(), start = operation
                        .getStart(), limit = operation.getLimit(),

                operationParams = Ext.apply(params, {
                    page: page,
                    start: start,
                    limit: limit,
                    sorters: sorters,
                    filters: filters
                });

        return operationParams;
    },

    processResults: function (operation, resultSet) {
        var me = this,
            throwExceptionOnError = me.getThrowExceptionOnError();

        if (operation.process(operation.getAction(), resultSet) === false) {
            if (throwExceptionOnError) {
                throw new Error('Sqlite Proxy error during '
                        + operation.getAction() + ' operation.');
            } else {
                me.fireEvent('exception', this, operation);
            }
        }
    },

    create: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            createOperation = function (transaction) {
                me.insertRecords(records, transaction, function (resultSet) {
                    me.processResults(operation, resultSet);
                    if (typeof callback === 'function') {
                        callback.call(scope || this, operation);
                    }
                }, this, false);
            };

        operation.setStarted();
        me.executeOperation(createOperation);
    },

    read: function (operation, callback, scope) {
        var me = this,
            model = me.getModel(),
            idProperty = model.getIdProperty(),
            params = operation.getParams() || {},
            id = params[idProperty],

            readOperation = function (transaction) {
                me.selectRecords(transaction, id !== undefined ? id : params, function (resultSet) {
                        me.processResults(operation, resultSet);
                        if (typeof callback === 'function') {
                            callback.call(scope || me, operation);
                        }
                });
            };

        params = me.applyOperationParameters(params, operation);

        operation.setStarted();
        me.executeOperation(readOperation);
    },

    update: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            updateOperation = function (transaction) {
                me.updateRecords(transaction, records, function (resultSet) {
                    me.processResults(operation, resultSet);
                    if (typeof callback === 'function') {
                        callback.call(scope || me, operation);
                    }
                });
            };

        operation.setStarted();
        me.executeOperation(updateOperation);
    },

    destroy: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            destroyOperation = function (transaction) {
                me.destroyRecords(transaction, records, function (resultSet) {
                    me.processResults(operation, resultSet);
                    if (typeof callback === 'function') {
                        callback.call(scope || me, operation);
                    }
                });
            };

        operation.setStarted();
        me.executeOperation(destroyOperation);
    },

    /**
     * Removes all records from the database table and inserts
     * new records retrieved from the WebCentral server.
     *
     * @param {Array}
     *            records The records paramemeter can be an
     *            array of models or it can be an array of
     *            server formatted records.
     * @param {Function}
     *            callback Function executed when the operation
     *            is completed.
     * @param {Object}
     *            scope The scope to execute the callback
     *            function.
     */
    removeAllAndInsertRecords: function (records, callback, scope) {
        var me = this,
            removeAllAndInsertOperation = function (transaction) {
                me.deleteAllRecords(transaction,function (transaction) {
                    me.insertRecords(records, transaction, function () {
                        console.log('Finished insert table: [' + me.getTable() + '] ' + new Date());
                        if (typeof callback === 'function') {
                            callback.call(scope || me, me.getTable());
                        }
                    }, me, true);
                });
            };

        // Handle the case where there are no records to insert.
        if (!records || records.length === 0) {
            if (typeof callback === 'function') {
                callback.call(scope || me, me.getTable());
            }
        }
        me.executeOperation(removeAllAndInsertOperation);
    },

    /**
     * Executes the proxy operation
     *
     * @private
     * @param {Function}
     *            operationFunction
     */
    executeOperation: function (operationFunction) {
        var me = this,
            db = me.getDatabaseObject();

        me.checkCurrentSchema(function () {
            db.transaction(operationFunction);
        });
    },

    /**
     * Compares the current database table definition with the
     * model definition Creates the table if it does not exists.
     * Adds new columns to the table if they do not exist. The
     * check is executed one time before the first database
     * table access.
     *
     * @private
     * @param completedCallback
     * @param scope
     */
    checkCurrentSchema: function (completedCallback, scope) {
        var me = this, isSchemaCurrent = this
                .getIsSchemaCurrent(), onSchemaCheckCompleted = function () {
            me.setIsSchemaCurrent(true);
            if (typeof completedCallback === 'function') {
                completedCallback.call(scope || me);
            }
        };

        if (isSchemaCurrent) {
            onSchemaCheckCompleted();
        } else {
            me.createOrAlterTableIfNot(me.getTable(), me.getModel(), function () {
                onSchemaCheckCompleted();
            });
        }
    },

    /**
     * Deletes all records from the database table. Resets the
     * Sqlite table id sequence
     *
     * @private
     * @param {Object}
     *            transaction The database transaction
     * @param {Function}
     *            callback Function called when the operation is
     *            complete.
     * @param {Object}
     *            scope The scope to execute the callback in.
     */
    deleteAllRecords: function (transaction, callback, scope) {
        var me = this,
            deleteSql = 'DELETE FROM ' + me.getTable(),
            resetIdSql = 'DELETE FROM SQLITE_SEQUENCE WHERE name = ?';

        transaction.executeSql(deleteSql, null, function (transaction, result) {
            transaction.executeSql(resetIdSql,
                    [ me.getTable() ], function (tx, resultSet) {
                        if (typeof callback === 'function') {
                            callback.call(scope || me, tx);
                        }
                    }, Ext.emptyFn);
        }, Ext.emptyFn);

    },

    /**
     * Retrieves and formats the record data from a model or a
     * server formatted record
     *
     * @private
     * @param {Object}
     *            record Model or server formatted record
     * @return {Object} data object of fieldname : fieldvalue
     *         pairs. Example format: { bl_id: 'HQ', site_id:
					 *         'Site', name: 'Headquarters' }
     */
    // TODO why this class needs to know about "server formatted
    // record"?
    getRecordData: function (record) {
        // Handle both server record and model record formats
        if (record.isModel) {
            return this.getDataFromModel(record);
        } else {
            return this.getDataFromServerRecord(record);
        }

    },

    /**
     * Retrieves the data from a WebCentral server record. Used
     * when performing the Get Background Data function.
     *
     * @private
     * @param {Object}
     *            record WebCentral record.
     * @return {Object} data object.
     */
    // TODO why this class needs to know about "server formatted
    // record"? Move this functionality to another class.
    getDataFromServerRecord: function (record) {
        var data = {};

        Ext.each(record.fieldValues, function (field) {
            if (Ext.isDate(field.fieldValue)) {
                field.fieldValue = this.writeDate(field.fieldValue);
            }
            data[field.fieldName] = field.fieldValue;
        }, this);

        return data;
    },

    /**
     * Retrieves data from a model record.
     *
     * @private
     * @param {Model}
     *            record
     * @return {Object} data object
     */
    getDataFromModel: function (record) {
        var me = this,
            fields = record.getFields(),
            idProperty = record.getIdProperty(),
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            data = {}, name, value;

        fields.each(function (field) {
            if (field.getPersist()) {
                name = field.getName();
                if (name === idProperty && !uniqueIdStrategy) {
                    return;
                }
                value = record.get(name);
                if (me.isFieldTypeDate(field.getType().type)) {
                    value = me.writeDate(value);
                }
                data[name] = value;
            }
        }, me);

        return data;
    },

    /**
     * Inserts records into the Sqlite database. Based on the
     * insertRecords function in the Ext.data.proxy.SQL class.
     * The function has been modified to support inserting
     * records directly into the database without using the
     * associated data store.
     *
     * @param records
     * @param transaction
     * @param callback
     * @param scope
     * @param {Boolean}
     *            isDirectInsert When true, the records are
     *            inserted directly to the database bypassing
     *            the store.
     */
    // TODO why do we need isDirectInsert?
    insertRecords: function (records, transaction, callback, scope, isDirectInsert) {
        var me = this,
            table = me.getTable(),
            columns = me.getColumns(),
            totalRecords = records.length,
            executed = 0,
            tmp = [], insertedRecords = [], errors = [],
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            i, ln, placeholders, result;

        if (Ext.isEmpty(isDirectInsert)) {
            isDirectInsert = false;
        }

        result = new Ext.data.ResultSet({
            records: insertedRecords,
            success: true
        });

        for (i = 0, ln = columns.length; i < ln; i++) {
            tmp.push('?');
        }
        placeholders = tmp.join(', ');

        Ext.each(records, function (record) {
            var id = isDirectInsert ? null : record.getId(),
                data = me.getRecordData(record),
                values = me.getColumnValues(columns, data);

            transaction.executeSql('INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')',
                    values,
                    function (transaction, resultSet) {
                        executed++;

                        if (!isDirectInsert) {
                            insertedRecords.push({
                                        clientId: id,
                                        id: uniqueIdStrategy ? id : resultSet.insertId,
                                        data: data,
                                        node: data
                                    });
                        }

                        if (executed === totalRecords && typeof callback === 'function') {
                            callback.call(scope || me, result, errors);
                        }
                    },
                    function (transaction, error) {
                        executed++;
                        errors.push({
                                      clientId: id,
                                      error: error
                                    });

                        if (isDirectInsert) {
                            throw new Error('Sqlite Proxy error. Error inserting records');
                        }

                        if (executed === totalRecords && typeof callback === 'function') {
                            callback.call(scope || me, result,errors);
                        }
                    });
        });
    },

    /**
     * From Ext.data.proxy.SQL Override to correct error that
     * occurs if sorters are not defined
     *
     * @param transaction
     * @param params
     * @param callback
     * @param scope
     */
    selectRecords: function (transaction, params, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            sql = 'SELECT * FROM ' + table,
            records = [],
            sortStatement = ' ORDER BY ', i, ln, data, result,
            count, rows, sorter, property, sqlTotalRecords;

        result = new Ext.data.ResultSet({
            records: records,
            success: true
        });

        if (!Ext.isObject(params)) {
            sql += ' WHERE ' + idProperty + ' = ' + params;
        } else {
            ln = params.filters && params.filters.length;
            sql += ProxyUtil.getFilterRestriction(params.filters);

            sqlTotalRecords = 'SELECT COUNT(*) AS TotalCount FROM ' + me.getTable();
            sqlTotalRecords += ProxyUtil.getFilterRestriction(params.filters);

            // 01.14.13 Added check if params.sorters exist
            ln = params.sorters && params.sorters.length;
            if (ln) {
                for (i = 0; i < ln; i++) {
                    sorter = params.sorters[i];
                    property = sorter.getProperty();
                    if (property !== null) {
                        sql += sortStatement + property + ' ' + sorter.getDirection();
                        sortStatement = ', ';
                    }
                }
            }

            // handle start, limit, sort, filter and group
            // params
            // Override to handle the disablePaging property
            if (params.page !== undefined && params.page !== null && !isNaN(params.page) && !isNaN(params.start)) {
                sql += ' LIMIT ' + parseInt(params.start, 10) + ', ' + parseInt(params.limit, 10);
            }
        }

        console.log(sql);

        transaction.executeSql(sql, null, function (transaction, resultSet) {
                    rows = resultSet.rows;
                    count = rows.length;

                    for (i = 0, ln = count; i < ln; i++) {
                        data = rows.item(i);
                        records.push({
                            clientId: null,
                            id: data[idProperty],
                            data: data,
                            node: data
                        });
                    }

                    transaction.executeSql(sqlTotalRecords, null, function (tx, results) {

                                var recordCount = results.rows.item(0).TotalCount;

                                result.setSuccess(true);
                                result.setTotal(recordCount);
                                result.setCount(count);

                                if (typeof callback === 'function') {
                                    callback.call(scope || me, result);
                                }
                    });
                }, function (transaction, errors) {
                    result.setSuccess(false);
                    result.setTotal(0);
                    result.setCount(0);

                    console.log(errors);

                    if (typeof callback === 'function') {
                        callback.call(scope || me,
                                result);
                    }
                });
    },

    /**
     * From Ext.data.proxy.SQL
     */
    updateRecords: function (transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            columns = me.getColumns(),
            totalRecords = records.length,
            idProperty = me.getModel().getIdProperty(),
            executed = 0, updatedRecords = [],
            errors = [], i, ln, result;

        result = new Ext.data.ResultSet({
            records: updatedRecords,
            success: true
        });

        Ext.each(records, function (record) {
                    var id = record.getId(),
                        data = me.getRecordData(record),
                        values = me.getColumnValues(columns, data),
                        updates = [];

                    for (i = 0, ln = columns.length; i < ln; i++) {
                        updates.push(columns[i] + ' = ?');
                    }

                    transaction.executeSql('UPDATE ' + table + ' SET ' + updates.join(', ') + ' WHERE ' +
                                            idProperty + ' = ?',
                            values.concat(id),
                            function (transaction, resultSet) {
                                executed++;
                                updatedRecords.push({
                                            clientId: id,
                                            id: id,
                                            data: data,
                                            node: data
                                        });

                                if (executed === totalRecords && typeof callback === 'function') {
                                    callback.call(scope || me, result, errors);
                                }
                            },
                            function (transaction, error) {
                                executed++;
                                errors.push({
                                            clientId: id,
                                            error: error
                                        });

                                if (executed === totalRecords && typeof callback === 'function') {
                                    callback.call(scope || me, result, errors);
                                }
                            });
                });
    },

    /**
     * From Ext.data.proxy.SQL
     */
    destroyRecords: function (transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            ids = [], values = [],
            destroyedRecords = [], i, ln, result, record;

        for (i = 0, ln = records.length; i < ln; i++) {
            ids.push(idProperty + ' = ?');
            values.push(records[i].getId());
        }

        result = new Ext.data.ResultSet({
            records: destroyedRecords,
            success: true
        });

        transaction.executeSql('DELETE FROM ' + table + ' WHERE ' + ids.join(' OR '),
                values,
                function (transaction, resultSet) {
                    for (i = 0, ln = records.length; i < ln; i++) {
                        record = records[i];
                        destroyedRecords.push({
                            id: record.getId()
                        });
                    }

                    if (typeof callback === 'function') {
                        callback.call(scope || me, result);
                    }
                }, function (transaction, error) {
                    if (typeof callback === 'function') {
                        callback.call(scope || me, result);
                    }
                });
    },

    /**
     * Override to use the SqliteConnectionManager class.
     *
     * @return {Object} The one and only database connection.
     */
    getDatabaseObject: function () {
        return SqliteConnectionManager.getConnection();
    },

    isFieldTypeDate: function (type) {
        var typeUpperCase = type.toUpperCase();
        return typeUpperCase === 'DATECLASS'
                || typeUpperCase === 'TIMECLASS'
                || typeUpperCase === 'DATE'
                || typeUpperCase === 'TIMESTAMPCLASS';

    },

    writeDate: function (date) {
        if (date === null) {
            return date;
        }
        var dateFormat = this.getDefaultDateFormat();
        return Ext.Date.format(date, dateFormat);
    },

    getPersistedModelColumns: function (model) {
        var fields = model.getFields().items,
            uniqueIdStrategy = this.getUniqueIdStrategy(),
            idProperty = model.getIdProperty(),
            columns = [], ln = fields.length, i, field, name;

        for (i = 0; i < ln; i++) {
            field = fields[i];
            name = field.getName();

            if (name === idProperty && !uniqueIdStrategy) {
                continue;
            }

            if (field.getPersist() === true) {
                columns.push(field.getName());
            }
        }

        return columns;
    },

    getColumnValues: function (columns, data) {
        var ln = columns.length, values = [], i, column, value;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            value = data[column];
            if (value !== undefined) {
                values.push(value);
            }
        }

        return values;
    }
});