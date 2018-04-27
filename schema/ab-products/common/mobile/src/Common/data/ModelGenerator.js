/**
 * Generates dynamic models using the TableDef definition and a list of fields to be displayed on the form.
 * 
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.data.ModelGenerator', {

	requires : [ 'Common.util.ApplicationPreference', 'Common.util.TableDef', 'Common.data.Field' ],

	singleton : true,

	/**
	 * 
	 * @param {Model}
	 *            staticModel The existing model defined in the source code
	 * @param {String}
	 *            serverTable The name of the server side table
	 * @param {Object}
	 *            tableDefObject The TableDef object representing the server side table.
	 */
	generateModel : function(staticModel, serverTable, tableDefObject) {

		// Get a list of visible fields for this server table from the Application Preferences
		var visibleFields = Common.util.ApplicationPreference.getVisibleFields(serverTable), model = staticModel;

		// There is no work to be done if there is no visible field configuration for this server
		// table so just return.
		if (Ext.isEmpty(visibleFields)) {
			return;
		}

		if (!tableDefObject) {
			tableDefObject = TableDef.getTableDefObject(serverTable);
		}

		if (typeof model === 'string') {
			var registeredModel = Ext.data.ModelManager.getModel(model);
			if (!registeredModel) {
				Ext.Logger.error('Model with name "' + model + '" does not exist.');
			}
			model = registeredModel;
		}

		if (model && !model.prototype.isModel && Ext.isObject(model)) {
			model = Ext.data.ModelManager.registerType(model);
		}

		var newModelFields = this.getNewModelFields(model, visibleFields, tableDefObject);
		this.addFieldsToModel(staticModel, newModelFields);
	},

	/**
	 * Maps FieldDef data type to model field data type.
	 * 
	 * @private
	 * @param {String}
	 *            dataType from FieldDef.
	 * @return {String} Model field data type.
	 */
	mapFieldDefDataTypeToModelFieldDataType : function(dataType) {

		var fieldType;
		dataType = dataType.toUpperCase();

		switch (dataType) {
		case 'STRING':
			fieldType = 'string';
			break;
		case 'DOUBLE':
		case 'FLOAT':
			fieldType = 'float';
			break;
		case 'INTEGER':
			fieldType = 'integerclass';
			break;
		case 'DATE':
			fieldType = 'dateclass';
			break;
		case 'TIME':
			fieldType = 'timeclass';
			break;
		case 'TIMESTAMP':
			fieldType = 'timestampclass';
			break;
		default:
			fieldType = 'auto';
			break;
		}
		return fieldType;
	},

	/**
	 * Compares the visibleFields list with the fields from the existing model definition. Returns the model field
	 * definition for any fields that are included in the visibleFields list but are not included in the model
	 * definition.
	 * 
	 * @param {Model}
	 *            model Existing model definition.
	 * @param {String}
	 *            visibleFields Comma delimited list of visible fields.
	 * @param {Object}
	 *            tableDefObject The TableDef object of the server side table.
	 * @return {Array} Model field objects that are not included in the existing model definition.
	 */
	getNewModelFields : function(model, visibleFields, tableDefObject) {
		var fieldNames = this.getModelFieldNames(model), newModelFields = this.findNewModelFields(visibleFields,
				fieldNames);

		return this.getNewModelFieldObjects(tableDefObject, newModelFields);
	},

	/**
	 * Generates Model field objects for fields that are not included in the existing model
	 * 
	 * @private
	 * 
	 * @param {TableDef}
	 *            tableDef
	 * @param {Array}
	 *            tableFieldNames Array of field names
	 * @return {Array} FieldDef items that match any of the field names.
	 */
	getNewModelFieldObjects : function(tableDef, fieldNames) {

		var fields = [], i;

        if (Ext.isEmpty(tableDef)) {
            return fields;
        }

		Ext.each(tableDef.fieldDefs, function(fieldDef) {
			var field = {};
			for (i = 0; i < fieldNames.length; i++) {
				if (fieldDef.name === Ext.String.trim(fieldNames[i])) {
					field = {
						name : fieldDef.name,
						type : this.mapFieldDefDataTypeToModelFieldDataType(fieldDef.dataType)
					};
					if (fieldDef.defaultValue !== null) {
						field.defaultValue = fieldDef.defaultValue;
					}
					fields.push(field);
				}
			}
		}, this);

		return fields;

	},

	/**
	 * Returns the names of the model fields
	 * 
	 * @private
	 * @param {Model}
	 *            model The existing model definition
	 * @return {Array} An array of model field names.
	 */
	getModelFieldNames : function(model) {
		var fields = model.getFields().items, fieldNames;

		fieldNames = Ext.Array.map(fields, function(field) {
			return field.getName();
		});

		return fieldNames;
	},

	/**
	 * Returns fields that are in the visibleFields list but not included in the model fields list
	 * 
	 * @private
	 * @param {String}
	 *            visibleFields Comma delimited list of visible fields.
	 * @param {Array}
	 *            modelFields Array of model field names
	 * @return {Array} Visible fields that are not included in the existing model fields.
	 */

	findNewModelFields : function(visibleFields, modelFields) {
		var visibleFieldsArray = visibleFields.split(';'), fieldsToAdd = [];

		Ext.each(visibleFieldsArray, function(visibleField) {
			var field = Ext.String.trim(visibleField);
			if (!Ext.Array.contains(modelFields, field)) {
				fieldsToAdd.push(field);
			}
		});

		return fieldsToAdd;
	},

	/**
	 * Adds new field objects to the existing model. Creates new Ext.data.Field instances and adds them to the existing
	 * model definition.
	 * 
	 * @param {Model}
	 *            model The existing model.
	 * @param {Object}
	 *            newModelFields The new field objects to add.
	 */
	addFieldsToModel : function(model, newModelFields) {
		var modelFields = model.getFields(), field, i;

		// Create a field object for each new field and add it to the fields collection
		for (i = 0; i < newModelFields.length; i++) {
			field = new Common.data.Field(newModelFields[i]);
			modelFields.add(field);
		}
	}

});