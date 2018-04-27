/**
 * Provides functionality to update schema of the store: updates model and table of the store according to the
 * server-side TableDef, if cached TableDef does not match.
 * <p>
 * Uses DWR service to get TableDef from the server.
 * <p>
 * Holds information required for mapping to the server-side table: serverTableName.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext
		.define(
				'Common.store.sync.SchemaUpdaterStore',
				{
					extend : 'Common.store.sync.SessionStore',
					requires : [ 'Common.service.MobileSyncServiceAdapter', 'Common.data.ModelGenerator' ],

					mixins : [ 'Common.store.proxy.ChangeTableStructureOperation' ],

					serverTableName : null,

					config : {
						/**
						 * @cfg restrictionClause {Object/Array} A restriction clause limiting the record set retrieved
						 *      from the server. Multiple restrictions can be applied by providing the restriction
						 *      objects in an array. Example:
						 *      <p>
						 *      surveyStore.setRestrictionClause([{ tableName: 'survey', fieldName : 'em_id', operation :
						 *      'EQUALS', value : 'SMITH, JOHN' }, { tableName: 'survey', fieldName: 'status',
						 *      operation: 'EQUALS', value: 'Issued' }]);
						 */
						restrictionClause : null
					},

					constructor : function(config) {
						this.callParent(arguments);
					},

					/**
					 * Builds a restriction object if a restriction clause is defined for this store.
					 */
					getRestriction : function() {
						var restrictionClause = this.getRestrictionClause(), restriction = null;

						if (restrictionClause && restrictionClause !== null) {
							restriction = {};
							restriction.clauses = [];
							if (Ext.isArray(restrictionClause)) {
								Ext.each(restrictionClause, function(clause) {
									restriction.clauses.push(clause);
								});
							} else {
								restriction.clauses.push(restrictionClause);
							}
						}
						return restriction;
					},

					/**
					 * Updates model and table of the store according to the server-side TableDef, if cached TableDef
					 * does not match. Commits the cached tableDefs to the database.
					 * 
					 * @param {Object}
					 *            tableDef The TableDef object
					 * @param {Function}
					 *            completedCallback Exectuted when the operation has completed.
					 * @param {Object}
					 *            scope The scope to execute the callback function in.
					 */
					updateIfNotModelAndTable : function(tableDef, completedCallback, scope) {
						var me = this, cachedTableDefObject = TableDef.getTableDefObject(this.serverTableName), onCompleted = function() {
							if (typeof completedCallback === 'function') {
								completedCallback.call(scope || me);
							}
						};

						// Check if the server side Table Def is the same as the
						// Table Def stored in the local database.
						// If the Table Defs do not match, update the table
						// definition and save the new Table Def
						if (cachedTableDefObject === null || !this.isTableDefEqual(cachedTableDefObject, tableDef)) {

							// If this is a sync table we need to get a list of
							// fields to include in the model
							// from the AppPreferences store
							if (!(this instanceof Common.store.sync.ValidatingTableStore)) {
								Common.data.ModelGenerator.generateModel(me.getModel(), this.serverTableName, tableDef);
							}

							me.createOrAlterTableIfNot(me.getProxy().getTable(), me.getModel(), function() {
								me.cacheTableDef(tableDef);
								onCompleted();
							});
						} else {
							onCompleted();
						}
					},

					/**
					 * Retrieves the Table Def object from the server
					 * 
					 * @param tableName
					 *            The server side table name of the associated Table Def
					 * @return {Object} Table Def object
					 */
					getTableDefFromServer : function(tableName) {
						return TableDef.getTableDefFromServer(tableName);
					},

					/**
					 * Caches tableDef: saves it in the tableDefsStore store.
					 * 
					 * @private
					 * @param {TableDef}
					 *            tableDef to be cached.
					 */

					cacheTableDef : function(tableDef) {
						TableDef.saveTableDef(tableDef);
					},

					/**
					 * Returns true if tableDef1 equals tableDef2, TableDefs are equal if they have the same property
					 * values.
					 * 
					 * @private
					 * @param {TableDef}
					 *            tableDef1 the first tableDef to be compared.
					 * @param {TableDef}
					 *            tableDef2 the second tableDef to be compared.
					 * @return {Boolean} Returns true if tableDef1 equals tableDef2.
					 */
					isTableDefEqual : function(tableDef1, tableDef2) {
						return TableDef.compareTableDefObject(tableDef1, tableDef2);
					}

				});