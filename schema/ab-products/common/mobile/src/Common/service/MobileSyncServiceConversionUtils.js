/**
 * Provides conversion of object values from and to server formats for MobileSyncService calls.
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.service.MobileSyncServiceConversionUtils', {
	singleton : true,
    alternateClassName: ['MobileSyncServiceConversionUtils'],
	/**
	 * Converts each Model object to the server-side record object.
	 * 
	 * @public
	 * @param {Model[]}
	 *            records to be converted.
	 * @return {Record[]} converted records.
	 */
	convertRecordsForServer : function(records) {

		var convertedRecords = Ext.Array.map(records, function(record) {
			return this.convertRecordForServer(record);
		}, this);

		return convertedRecords;
	},

	/**
	 * Converts Model object to the server-side record object. Does not include fields with the isSyncField property set
	 * to false
	 * 
	 * @private
	 * @param {Model}
	 *            record to be converted.
	 * @return {Record} converted record.
	 */
	convertRecordForServer : function(model) {
		// create FieldNameValue object
		var me = this, fieldValues = [], fields = model.getFields().items;

		Ext.each(fields, function(field) {
			var fieldName = field.getName(), isSyncField = field.getIsSyncField();

			if (fieldName !== 'id' && isSyncField) {
				var fieldValue = model.data[fieldName];
				
	            // Date and Time values are marshaled from JavaScript as "formatted" property of the
	            // Common.type.Date or Common.type.Time object.
				// TODO move this code to Common.type.Date and Common.type.Time classes
				if(fieldValue instanceof Common.type.Date){
					fieldValue.formatted = Ext.Date.format(fieldValue.getValue(), "Y-m-d");
				} else if(fieldValue instanceof Common.type.Time){
					fieldValue.formatted = Ext.Date.format(fieldValue.getValue(), "H:i:s.u"); 
				}
				
				fieldValues.push({
					fieldName : fieldName,
					fieldValue : fieldValue
				});
			}
		}, me);

		return {
			fieldValues : fieldValues
		};
	},

	/**
	 * Converts each server-side record object to Model object.
	 * 
	 * @public
	 * @param {Record[]}
	 *            records to be converted.
	 * @param {String}
	 *            modelType - type of the model to be converted to.
	 * @return {Model[]} converted records.
	 */
	convertRecordsFromServer : function(records, modelType) {

		var convertedRecords = Ext.Array.map(records, function(record) {
			return this.convertRecordFromServer(record, modelType);
		}, this);

		return convertedRecords;
	},

	/**
	 * Converts server-side record to Model object.
	 * 
	 * @private
	 * @param {Record}
	 *            record to be converted.
	 * @param {String}
	 *            modelType - type of the model to be converted to.
	 * @return {Model} converted record.
	 */
	convertRecordFromServer : function(record, modelType) {
		// create Model object
		var index, convertedRecord = Ext.create(modelType);

		// for each field in the record
		for (index in record.fieldValues) {
			// convert FieldNameValue object to Model
			var fieldNameValue = record.fieldValues[index];
			convertedRecord.set(fieldNameValue.fieldName, fieldNameValue.fieldValue);
		}

		return convertedRecord;
	}
});