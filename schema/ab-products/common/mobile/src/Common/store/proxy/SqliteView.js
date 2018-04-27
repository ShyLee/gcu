/**
 * Read only proxy that supports reading data from a SQLite database view.
 * <p>
 * The SqliteView class is used to combine data from different SQLite databases into one readonly store.
 * <p>
 * The SqliteView class creates a view in the SQLite database using the viewDefinition and viewName configuration
 * parameters.
 * <p>
 * The database view is dropped and created once per proxy object instantiation. The SQLite tables that the view is
 * created for must already exist in the database when the proxy creates the view.
 * <p>
 * 
 * 
 * @author Jeff Martin
 * @since 21.1
 */
// TODO field and method comments
Ext
		.define(
				'Common.store.proxy.SqliteView',
				{
					extend : 'Ext.data.proxy.Client',
					requires : [ 'Common.store.proxy.SqliteConnectionManager', 'Common.store.proxy.ProxyUtil' ],

					alias : 'proxy.SqliteView',

					config : {
						/**
						 * @cfg viewDefinition The SQL view definition of the view used in the proxy. The view definition
						 *      should include only the SQL select statement used to create the view.
						 */
						viewDefinition : null,

						/**
						 * @cfg viewName The name of the view in the SQLite database.
						 * 
						 */
						viewName : null,

						/**
						 * @cfg isViewDefinitionCurrent True if the view has been created in the SQLite database, false
						 *      if it has not been created. The view is dropped and created the first time the read
						 *      operation is called.
						 */
						isViewDefinitionCurrent : false,

						// TODO comments
						baseTables : []
					},

					getDatabaseConnection : function() {
						return Common.store.proxy.SqliteConnectionManager.getConnection();
					},

					throwDatabaseError : function(transaction, error) {
						throw new Error('Database Error [SqliteView] ' + error.message);
					},

					create : function() {
						throw new Error('SqlliteView is read only and does not support creating records.');
					},

					update : function() {
						throw new Error('SqliteView is read only and does not support updating records');
					},

					destroy : function() {
						throw new Error('SqliteView is read only and does not support deleting records');
					},

					read : function(operation, callback, scope) {
						var me = this, viewDefinitionIsCurrent = me.getIsViewDefinitionCurrent(), baseTableCount = me
								.getBaseTables().length;

						if (viewDefinitionIsCurrent) {
							me.executeReadOperation(operation, callback, scope);
						} else {
							me.checkBaseTablesExist(function(numberOfTables) {
								if (numberOfTables === baseTableCount) {
									me.dropViewIfExists(function() {
										me.setIsViewDefinitionCurrent(true);
										me.executeReadOperation(operation, callback, scope);
									});
								}
							});
						}
					},

					executeReadOperation : function(operation, callback, scope) {
						var me = this;

						this.selectRecords(operation, function(resultSet) {
							if (operation.process(operation.getAction(), resultSet) === false) {
								throw new Error('Database error in SqliteView proxy.');
							}
							if (typeof callback === 'function') {
								callback.call(scope || me, operation);
							}
						}, this);
					},

					createViewIfNotExists : function(callback, scope) {
						var me = this, viewDefinition = this.getViewDefinition(), viewName = this.getViewName(), sql = 'CREATE VIEW IF NOT EXISTS '
								+ viewName + ' AS ' + viewDefinition, db = this.getDatabaseConnection(),

						onSuccess = function() {
							if (typeof callback === 'function') {
								callback.call(scope || me);
							}
						};

						db.transaction(function(transaction) {
							transaction.executeSql(sql, null, onSuccess, me.throwDatabaseError);
						});
					},

					dropViewIfExists : function(callback, scope) {
						var me = this, db = Common.store.proxy.SqliteConnectionManager.getConnection(), sql = 'DROP VIEW IF EXISTS '
								+ this.getViewName(),

						onSuccess = function() {
							me.createViewIfNotExists(callback, scope);
						};

						db.transaction(function(transaction) {
							transaction.executeSql(sql, [], onSuccess, me.throwDatabaseError);
						});
					},

					/**
					 * Verifies that the required view base tables are present in the database before creating the view.
					 * 
					 * @param callback
					 *            {Function} Called when the database access is complete. Returns the count of
					 * @param scope
					 */
					checkBaseTablesExist : function(callback, scope) {
						var me = this, db = Common.store.proxy.SqliteConnectionManager.getConnection(), baseTables = me
								.getBaseTables(), baseTableNames, sql, onSuccess = function(transaction, result) {
							if (typeof callback === 'function') {
								callback.call(scope || me, result.rows.item(0).TableCount);
							}
						};

						// Build the restriction
						baseTableNames = Ext.Array.map(baseTables, function(table) {
							return "'" + table + "'";
						});

						sql = 'SELECT COUNT(*) AS TableCount FROM sqlite_master WHERE name IN('
								+ baseTableNames.join(',') + ')';

						db.transaction(function(transaction) {
							transaction.executeSql(sql, [], onSuccess, me.throwDatabaseError);
						});
					},

					getSelectStatement : function(filters) {
						var modelFields = this.getModel().getFields().items, whereClause = ProxyUtil
								.getFilterRestriction(filters), fields = [], selectFields, sql;

						Ext.each(modelFields, function(field) {
							var fieldName = field.getName();
							if (fieldName !== 'id') {
								fields.push(fieldName);
							}
						});

						selectFields = fields.join(',');

						sql = 'SELECT ' + selectFields + ' FROM ' + this.getViewName();

						// Replace = with LIKE to handle case sensitive searching.
						whereClause = whereClause.replace('=', ' LIKE ');

						sql += whereClause;

						return sql;
					},

					selectRecords : function(operation, callback, scope) {
						var me = this,
                            db = me.getDatabaseConnection(),
                            filters = operation.getFilters(), sql, rows, count,
                            idProperty = me.getModel().getIdProperty(), records = [],

						result = new Ext.data.ResultSet({
							records : records,
							success : true
						}), i;

						sql = this.getSelectStatement(filters);

						db.transaction(function(transaction) {

							transaction.executeSql(sql, null, function(transaction, resultSet) {
								rows = resultSet.rows;
								count = rows.length;

								for (i = 0; i < count; i++) {
									data = rows.item(i);
									records.push({
										clientId : null,
										id : data[idProperty],
										data : data,
										node : data
									});
								}

								result.setSuccess(true);
								result.setTotal(count);
								result.setCount(count);

								if (typeof callback === 'function') {
									callback.call(scope || me, result);
								}
							}, function(transaction, errors) {
								result.setSuccess(false);
								result.setTotal(0);
								result.setCount(0);

								if (typeof callback === 'function') {
									callback.call(scope || me, result);
								}
							});
						});
					}
				});