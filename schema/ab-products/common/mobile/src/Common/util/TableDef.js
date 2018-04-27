/**
 * Utility class to manage operations on TableDef objects
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.TableDef', {
	alternateClassName : [ 'TableDef' ],
	requires : 'Common.Session',

	singleton : true,

	/**
	 * Extract the enumerated list information from the the TableDef Field Def
	 * 
	 * @param tableName
	 *            {String} Name of the table that the TableDef represents
	 * @param fieldName
	 *            {String} Name of the field to retrieve the enumerated list information.
	 * @return {Object} Enumerated list object.
	 */
	getEnumeratedList : function(tableName, fieldName) {
		var tableDefStore = Ext.getStore('tableDefsStore'),
            tableDefRecord = tableDefStore.findRecord('tableName', tableName),
            tableDefObject, enumFieldIndex;

		if (tableDefRecord) {
			tableDefObject = JSON.parse(tableDefRecord.get('tableDef'));
			enumFieldIndex = Ext.each(tableDefObject.fieldDefs, function(fieldDef) {
				if (fieldDef.name === fieldName) {
					return false;
				}
			});

			var enumField = tableDefObject.fieldDefs[enumFieldIndex];
			if (enumField) {
				return enumField.enumObjectToDisplay;
			} else {
				return '';
			}
		} else {
			return '';
		}
	},

	/**
	 * Returns the Table Def record for the provided table.
	 * 
	 * @param tableName
	 *            The table name of the Table Def. This is the name of the server side table.
	 * @return {Ext.data.Model} The Table Def record. Returns null if the Table Def is not found in the store.
	 */
	getTableDefRecord : function(tableName) {
		var tableDefStore = Ext.getStore('tableDefsStore'),
            tableDefRecord = tableDefStore.findRecord('tableName', tableName);

		return tableDefRecord;
	},

	/**
	 * Returns the Table Def object for the provided table.
	 * 
	 * @param tableName
	 *            The table name of the Table Def. This is the name of the server side table.
	 * @return {Object} The Table Def object
	 */
	getTableDefObject : function(tableName) {
		var tableDefRecord = this.getTableDefRecord(tableName), tableDefString, tableDefObject;

		if (tableDefRecord === null) {
			tableDefObject = null;
		} else {
			tableDefString = tableDefRecord.get('tableDef');
			tableDefObject = this.tableDefFromString(tableDefString);
		}

		return tableDefObject;
	},

	/**
	 * De-serializes TableDef from the string.
	 * 
	 * @private
	 * @param {String}
	 *            tableDefAsString serialized TableDef.
	 * @return {TableDef} de-serialized object.
	 */
	tableDefFromString : function(tableDefAsString) {
		// de-serialize TableDef from the string
		return JSON.parse(tableDefAsString);
	},

	/**
	 * Serializes TableDef to string.
	 * 
	 * @private
	 * @param {TableDef}
	 *            tableDef to be serialized.
	 * @return {String} serialized tableDef.
	 */
	tableDefToString : function(tableDef) {
		// serialize TableDef to string
		return JSON.stringify(tableDef);
	},

	/**
	 * Compares the TableDef objects. The TableDef objects are considered to be equal if all of the properties are
	 * equal.
	 * 
	 * @private
	 * @param {TableDef}
	 *            object1 the first TableDef object to compare
	 * @param {TableDef}
	 *            object2 the second TableDef object to compare
	 * @return {Boolean} returns true if the objects are equal.
	 */
	compareTableDefObject : function(object1, object2) {

		var object1PropertyCount, object2PropertyCount, property;

        // TODO: Test if object1 and object2 are objects to prevent Object.keys from failing.
		object1PropertyCount = object1 === null ? 0 : Object.keys(object1).length;
		object2PropertyCount = object2 === null ? 0 : Object.keys(object2).length;

		if (object1PropertyCount !== object2PropertyCount) {
			return false;
		}

		for (property in object1) {
			if (typeof object1[property] === 'object') {
				if (!this.compareTableDefObject(object1[property], object2[property])) {
					return false;
				}
			} else if (object1[property] !== object2[property]) {
				return false;
			}
		}

		return true;

	},

	/**
	 * Saves the Table Def object to the database
	 * 
	 * @param {Object}
	 *            tableDef The Table Def object to save to the database.
	 */
	saveTableDef : function(tableDef) {
		var tableDefRecord = this.getTableDefRecord(tableDef.name), tableDefStore = Ext.getStore('tableDefsStore');

		if (tableDefRecord === null) {
			tableDefRecord = new Common.model.TableDef();
		}

		tableDefRecord.set('tableDef', this.tableDefToString(tableDef));
		tableDefRecord.set('tableName', tableDef.name);
		// Check if the tableDef is in the store

		tableDefStore.add(tableDefRecord);
	},

	/**
	 * Returns the Multi-Line heading value for each of the columns of the table. The Multi-Line heading is formatted in
	 * a single line for use in the form label fields.
	 * 
	 * @param {String}
	 *            tableName The table to retrieve the headings from.
	 * @return {Ext.util.MixedCollection} The heading values.
	 */
	getTableHeadings : function(tableName, isPhone) {
		var headings = new Ext.util.MixedCollection(),
            tableDef = this.getTableDefObject(tableName);

		// Get the multiline heading from each table column
		if (tableDef) {
			Ext.each(tableDef.fieldDefs, function(fieldDef) {
                var multiLineHeadings = fieldDef.multiLineHeadings,
                    singleLineHeading = fieldDef.singleLineHeading,
                    heading;

                if(singleLineHeading && isPhone) {
                    heading = singleLineHeading;
                } else {
                    heading= this.convertMulitLineToSingleLineHeading(multiLineHeadings, isPhone);
                }
				headings.add(fieldDef.name, heading);
			}, this);
		}
		return headings;
	},

	/**
	 * Converts the Multi-Line heading array into a single line string
	 * 
	 * @private
	 * @param {Array}
	 *            multiLineHeading The Multi-Line heading array from the fieldDef object
	 * @return {String} The Multi-Line heading contents formatted in a single line.
	 */
	convertMulitLineToSingleLineHeading : function(multiLineHeading, isPhone) {
		var heading = '',
            separator = isPhone ? '<br>' : ' ',
            i;

		for (i = 0; i < multiLineHeading.length; i++) {
			heading += multiLineHeading[i] + separator;
		}

		return Ext.String.trim(heading);
	},

	/**
	 * Retrieves the TableDef object from the server
	 * 
	 * @param {String}
	 *            serverTableName The name of the server side table.
	 */
	getTableDefFromServer : function(serverTableName) {
		var session = Ext.create('Common.Session'), tableDef = null;

		session.doInSession(function() {
			tableDef = Common.service.MobileSyncServiceAdapter.getTableDef(serverTableName);
		});

		return tableDef;
	}
});