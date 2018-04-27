/**
 * Collection of utility functions used by the {@link Common.store.proxySqlite} and
 * {@link Common.store.proxy.ChangeTableStructureOperation} classes
 * <p>
 * 
 * @author Jeff Martin
 * @since 21.1
 * 
 */

Ext
		.define(
				'Common.store.proxy.ProxyUtil',
				{
					alternateClassName : [ 'ProxyUtil' ],

					singleton : true,

					/**
					 * Converts the Model fields definition into an object array containing the field name, the database
					 * type for the field, and the field default value.
					 * <p>
					 * Excludes the Model id field and any Model fields that are marked as non-persistent.
					 * <p>
					 * The returned object array is used when creating database objects based on the associated Model.
					 * 
					 * @param model
					 *            The Model instance to retrieve the field definitions from.
					 * @return {Array} Object array where each item contains the field name, database field type, and
					 *         field default value.
					 */

					getDbFields : function(model) {
						var me = this, idProperty = model.getIdProperty(), fields = model.getFields().items, databaseFields = [];

						Ext.each(fields, function(field) {
							var type = field.getType().type, name = field.getName();

							// Exclude id fields and fields with persist = false
							if (field.getPersist()) {
								if (name === idProperty) {
									type = 'INTEGER PRIMARY KEY AUTOINCREMENT';
								} else {
									type = me.convertToSqlType(type);
								}
								databaseFields.push({
									name : name,
									type : type,
									defaultValue : field.getDefaultValue()
								});
							}
						});
						return databaseFields;
					},

					/**
					 * Converts the Model field type to the SQLite database type.
					 * <p>
					 * Handles the conversion of the Custom Datatypes defined in the {@link Common.type.TypeManager}
					 * class.
					 * <p>
					 * Note: Custom types are read as type AUTO unless the Model class extends the
					 * {@link Common.model.ModelBase} class.
					 * 
					 * @param type
					 *            {String} The type name of the Model field.
					 * @return {String} The database type name.
					 */

					convertToSqlType : function(type) {
						var databaseType;
						switch (type.toUpperCase()) {
						case 'STRING':
						case 'DATECLASS':
						case 'TIMECLASS':
						case 'TIMESTAMPCLASS':
						case 'DATE':
							databaseType = 'TEXT';
							break;
						case 'INT':
						case 'INTEGERCLASS':
						case 'BOOL':
							databaseType = 'INTEGER';
							break;
						case 'FLOAT':
							databaseType = 'REAL';
							break;
						default:
							databaseType = 'TEXT';
							break;
						}
						return databaseType;
					},

					/**
					 * Converts a Model record to a string of comma delimited database fields and types.
					 * <p>
					 * Used when creating database objects.
					 * 
					 * @private
					 * @param model
					 *            Model instance of the fields to convert.
					 * @return {String} Comma delimited string of database field names and database types.
					 */
					constructFields : function(model) {
						var fields = this.getDbFields(model), schema = [];

						Ext.each(fields, function(field) {
							schema.push(field.name + ' ' + field.type);
						});

						return schema.join(',');
					},

					getFilterRestriction : function(filters) {
						var sql = '', filterStatement = ' WHERE ', ln, filter, filterProperties, i, sortedFilters, startParen = '', endParen = '';

						ln = filters && filters.length;
						if (ln) {
							sortedFilters = this.sortFilters(filters);
							for (i = 0; i < ln; i++) {
								// filter = filters[i];
								filter = sortedFilters[i];
								filterProperties = this.getFilterProperties(filter);
								startParen = filter.start ? '(' : '';
								endParen = filter.end ? ')' : '';
								if (filterProperties.property !== null) {
									if (filterProperties.matchIsNullValue) {
										sql += filterStatement + filterProperties.property
												+ (filterProperties.isEqualNull ? (' IS ') : (' IS NOT ')) + 'NULL';
									} else {
										sql += filterStatement
												+ startParen
												+ filterProperties.property
												+ ' '
												+ (filterProperties.anyMatch ? ('LIKE \'%' + filterProperties.value + '%\'')
														: ('= \'' + filterProperties.value + '\'')) + endParen;
									}
									filterStatement = ' ' + filterProperties.conjunction + ' ';
								}
							}
						}
						return sql;
					},

					/**
					 * Retrieves the properties from the filter object. Checks if the filter is type of Common.util.
					 * 
					 * @param filter
					 */
					getFilterProperties : function(filter) {
						var filterProperties = {},
                            filterValue = filter.getValue();

                        // Escape any apostrophes in the filter value
                        if (Ext.isString(filterValue)) {
                            filterValue = filterValue.replace("'","''");
                        }

						filterProperties.property = filter.getProperty();
						filterProperties.value = filterValue;
						filterProperties.anyMatch = filter.getAnyMatch();
						filterProperties.conjunction = 'AND';

						if (filter.isExtendedFilter) {
							filterProperties.matchIsNullValue = filter.getMatchIsNullValue();
							filterProperties.isEqualNull = filter.getIsEqualNull();
							filterProperties.conjunction = filter.getConjunction();
						}

						return filterProperties;
					},

					/**
					 * Sorts the filter properties by conjunction property. Used to group the 'OR' statements together
					 * 
					 * @param filterProperties
					 */
					sortFilters : function(filters) {
						var andFilters = [], orFilters = [], orFiltersLength;

						Ext.each(filters, function(filter) {

							if (filter.isExtendedFilter && filter.getConjunction() === 'OR') {
								orFilters.push(filter);
							} else {
								andFilters.push(filter);
							}
						});
						orFiltersLength = orFilters.length;
						// Find first and last OR filters and add parenthesize
						if (orFiltersLength > 1) {
							orFilters[0].start = true;
							orFilters[0].end = null;
							orFilters[orFiltersLength - 1].end = true;
							orFilters[orFiltersLength - 1].start = null;
						}
						return andFilters.concat(orFilters);

					}

				});