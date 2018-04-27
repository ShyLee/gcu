/**
 * Manages the checking and updating of the SQLite database table schema. The database table schema definition is
 * determined by the associated {@link Ext.data.Model} field definition.
 * <p>
 * This class is used as a mixin in the {@link Common.store.proxy.Sqlite} class.
 * <p>
 * The database table schema is checked once per proxy class instantiation.
 * <p>
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext
		.define(
				'Common.store.proxy.ChangeTableStructureOperation',
				{

					requires : [ 'Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.ProxyUtil' ],

					/**
					 * Called when the Change Table opertion is complete. The function is initialized by the
					 * createOrAlterTableIfNot function. The empty function definition is provided to handle the case
					 * where one of the check table functions is called directly.
					 */
					onChangeTableComplete : Ext.emptyFn,

					onDatabaseError : function(transaction, error) {
						throw new Error('Database error: ' + error.message);
					},

					/**
					 * Creates a table in the database if the table does not exists. If the table exists, the existing
					 * database schema definition is compared to the Model instance. Fields defined in the Model that
					 * are not in the database are created in the database.
					 * 
					 * @param tableName
					 *            {String} Name of the table to operate on
					 * @param model
					 *            {Model} The model instance associated with this table.
					 * @param successCallback
					 *            {Function} Called when the table operation is complete.
					 * @param scope
					 *            {Object} The scope to execute the successCallback function.
					 */
					createOrAlterTableIfNot : function(tableName, model, successCallback, scope) {
						var me = this;

						me.onChangeTableComplete = function(action) {
							if (typeof successCallback === 'function') {
								successCallback.call(scope || me, action);
							}
						};

						me.checkTableExists(tableName, model);

					},

					/**
					 * Checks if the table exists in the database. If the table does not exist it is created. If the
					 * table exists in the database the database schema is compared to the Model instance. Calls the
					 * Alter database function if there is a difference between the database schema and Model.
					 * 
					 * @param tableName
					 *            {String} The name of the table to check.
					 * @param model
					 *            {Model} The Model associated with the table.
					 */
					// TODO naming: checkTableExists contradicts createTable,addColumnsToTable - this method actually modifies schema
					checkTableExists : function(tableName, model) {
						var me = this, db = SqliteConnectionManager.getConnection(), sql = 'SELECT sql FROM sqlite_master WHERE name=?';

						db.transaction(function(transaction) {
							transaction.executeSql(sql, [ tableName ], function(transaction, results) {
								var databaseFields, modelFields, fieldsToAdd;

								if (results.rows.length === 0) {
									// The table does not exist, create it.
									me.createTable(transaction, tableName, model);
								} else {
									// Process table definition result
									databaseFields = me.parseTableDefinition(results.rows.item(0).sql);
									modelFields = ProxyUtil.getDbFields(model);
									fieldsToAdd = me.compareSchemaToModel(databaseFields, modelFields);

									// If the fieldNamesToAdd array is empty then we are finished
									if (fieldsToAdd.length > 0) {
										// Add new columns to the database.
										me.addColumnsToTable(transaction, fieldsToAdd, tableName);
									} else {
										me.onChangeTableComplete('No database table change applied. [' + tableName
												+ ']');
									}
								}
							}, me.onDatabaseError);
						});
					},

					/**
					 * Creates the table in the SQLite database.
					 * 
					 * @param transaction
					 *            {Object} The open database transaction.
					 * @param tableName
					 *            {String} The name of the table to create.
					 * @param model
					 *            {Model} The model associated with this table.
					 */
					createTable : function(transaction, tableName, model) {
						var me = this, sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + '('
								+ ProxyUtil.constructFields(model) + ')';

						transaction.executeSql(sql, null, function() {
							me.onChangeTableComplete('Created Table [' + tableName + ']');
						}, me.onDatabaseError);
					},

					/**
					 * Compares the existing database table columns with the fields defined in the associated Model.
					 * 
					 * @param databaseColumns
					 *            {Array} Database column names.
					 * @param modelFields
					 *            {MixecCollection} The Model fields collection.
					 * @return {Array} Fields contained in the Model that are not in the database.
					 */
					compareSchemaToModel : function(databaseColumns, modelFields) {

						var fieldsToAdd = [], modelFieldNames = Ext.Array.pluck(modelFields, 'name'),

						// Get the difference between the database and model field arrays
						fieldNamesToAdd = Ext.Array.difference(modelFieldNames, databaseColumns);

						Ext.each(fieldNamesToAdd, function(addField) {
							var field = null;
							Ext.each(modelFields, function(fieldObj) {
								if (fieldObj.name === addField) {
									fieldsToAdd.push({
										fieldName : fieldObj.name,
										fieldType : fieldObj.type,
										fieldDefault : fieldObj.defaultValue
									});
									field = fieldObj;
									return false;
								}
							}, this);
						}, this);

						return fieldsToAdd;

					},

					/**
					 * Executes the ALTER TABLE statement in the database. Updates the added fields default value if it
					 * is defined in the Model field.
					 * 
					 * @param transaction
					 *            {Object} Current database transaction.
					 * @param fieldsToAdd
					 *            {Array} Field objects to add to the database table.
					 * @param tableName
					 *            {String} The name of the table to alter.
					 */
					addColumnsToTable : function(transaction, fieldsToAdd, tableName) {

						var me = this;
						Ext.each(fieldsToAdd, function(field) {
							var sql = 'ALTER TABLE ' + tableName + ' ADD COLUMN ' + field.fieldName + ' '
									+ field.fieldType;
							transaction.executeSql(sql, [], function(transaction) {
								if (Ext.isEmpty(field.fieldDefault)) {
									me.onChangeTableComplete('No default value update for field: [' + field.fieldName
											+ ']');
									return;
								}
								// update field to have default value
								transaction.executeSql('UPDATE ' + tableName + ' SET ' + field.fieldName + ' = ?',
										[ field.fieldDefault ], function() {
											me.onChangeTableComplete('Update default value: field [' + field.fieldName
													+ ']');
										}, me.onDatabaseError);

							}, me.onDatabaseError);
						});

					},

					/**
					 * Parses the result returned from the SQLite master table query.
					 * 
					 * @private
					 * @param tableDefinition
					 *            {String} The result of the SQLite master table query.
					 * @return {Array} Column names of the SQLite database table.
					 */
					parseTableDefinition : function(tableDefinition) {
						var tableColumns = tableDefinition.match(/\((.+?)\)/)[1].split(','),

						columns = Ext.Array.map(tableColumns, function(column) {
							var field = Ext.String.trim(column).split(' ');
							return field[0];
						});

						return columns;
					},

					/**
					 * Drops and creates the database table.
					 * 
					 * @param tableName
					 *            {String} The name of the table to operate on
					 * @param model
					 *            {Model} The model associated with the database table.
					 * @param callback
					 *            {Function} Callback called when the operation is complete.
					 * @param scope
					 *            {Object} The scope to execute the callback function.
					 */
					dropAndCreateTable : function(tableName, model, callback, scope) {
						var me = this, db = Common.store.proxy.SqliteConnectionManager.getConnection(), sqlDrop = 'DROP TABLE IF EXISTS '
								+ tableName, sqlCreate = 'CREATE TABLE IF NOT EXISTS ' + tableName + '('
								+ ProxyUtil.constructFields(model) + ')', onSuccess = function() {
							if (typeof callback === 'function') {
								callback.call(scope || me);
							}
						};

						db.transaction(function(transaction) {
							transaction.executeSql(sqlDrop, [], Ext.emptyFn, me.onDatabaseError);
							transaction.executeSql(sqlCreate, [], onSuccess, me.onDatabaseError);
						});
					}
				});