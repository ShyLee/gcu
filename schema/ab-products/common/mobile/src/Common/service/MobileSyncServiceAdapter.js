/**
 * Encapsulates details of MobileSyncService calls. Translates service exceptions using ExceptionTranslator. Converts
 * object values from and to the server formats using MobileSyncServiceConversionUtils.
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.service.MobileSyncServiceAdapter', {
	singleton : true,
    alternateClassName: ['MobileSyncServiceAdapter'],

	requires : [ 'Common.service.MobileSyncServiceConversionUtils',
                 'Common.service.ExceptionTranslator' ],

	/**
	 * Checks-in specified records into the specified sync table.
	 * 
	 * @public
	 * @param {String}
	 *            tableName the name of the sync table to check the records in.
	 * @param {String}
	 *            inventoryKeyNames names of the inventory key fields in the sync table.
	 * @param {Model[]}
	 *            records to be checked-in.
	 * @throws exception
	 *             if operation fails.
	 */
	checkInRecords : function(tableName, inventoryKeyNames, records) {
		var convertedRecords = MobileSyncServiceConversionUtils.convertRecordsForServer(records);

		console.log('Calling MobileSyncService.checkInRecords: tableName=[' + tableName + '], inventoryKeyNames=['
				+ inventoryKeyNames + '], convertedRecords=[' + convertedRecords + ']');

		MobileSyncService.checkInRecords(tableName, inventoryKeyNames, convertedRecords, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : Ext.emptyFn(),
			errorHandler : function(message, exception) {
                exception.genericMessage = 'Error Checking In Records.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});
	},

	/**
	 * Checks out records that meet the restriction. Locks the checked-out records.
	 * 
	 * @public
	 * @param {String}
	 *            tableName the name of the sync table to check the records out.
	 * @param {String}
	 *            fieldNames the names of the fields in the sync table to be included in the checked-out the records.
	 * @param {AbstractRestrictionDef}
	 *            restriction to be applied to the sync table.
	 * @return {Model[]} array of checked-out records. The array might be empty if user is not allowed to lock the
	 *         record.
	 * @throws exception
	 *             if operation fails.
	 */
	checkOutRecords : function(tableName, fieldNames, restriction, modelType) {
		console.log('Calling MobileSyncService.checkOutRecords: tableName=[' + tableName + '], fieldNames=[' +
				fieldNames + '], restriction=[' + restriction + ']');

		var records = null;

		MobileSyncService.checkOutRecords(tableName, fieldNames, restriction, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				records = returnValue;
			},
			errorHandler : function(message, exception) {
                exception.genericMessage = 'Error Checking Out Records.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

		var convertedRecords = MobileSyncServiceConversionUtils.convertRecordsFromServer(records, modelType);

		return convertedRecords;
	},

	/**
	 * Retrieves records from the specified table. Applies the specified restriction to select the records.
	 * 
	 * @public
	 * @param {String}
	 *            tableName the name of the table to retrieve records from.
	 * @param {String}
	 *            fieldNames the names of the fields in the table to be included in the the records.
	 * @param {AbstractRestrictionDef}
	 *            restriction to be applied to the table.
	 * @param {Boolean}
	 *            True if records should be converted to model instances false otherwise.
	 * @return {Model[]} array of records.
	 * @throws exception
	 *             if operation fails.
	 */
    // TODO: retrieveRecords is no longer used. Make this async or remove and use retrieveRecordsAsync
	retrieveRecords : function(tableName, fieldNames, restriction, modelType, convertRecords) {

		console.log('Calling MobileSyncService.retrieveRecords: tableName=[' + tableName + '], fieldNames=['
				+ fieldNames + '], restriction=[' + restriction + '], model=[' + modelType.getName() + ']');

		var records = null;

		MobileSyncService.retrieveRecords(tableName, fieldNames, restriction, {
			async : false,
			callback : function(returnValue) {
				records = returnValue;
			},
			errorHandler : function(message, exception) {
                exception.genericMessage = 'Error retrieving records.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

		if (Ext.isEmpty(convertRecords) || convertRecords) {
			return Common.service.MobileSyncServiceConversionUtils.convertRecordsFromServer(records, modelType);
		} else {
			return records;
		}
	},

    /**
     * Retrieves records from the specified table. Applies the specified restriction to select the records.
     * Executes in asynchronous mode. Safari browsers have a 10 second timeout for synchronous XMLHttpRequests.
     * The Safari timeout value can be reached when downloading tables with large amounts of data.
     * Calling MobileSyncService.retrieveRecords in asynchronous mode solves the timeout issue.
     * @public
     * @param {String}
     *            tableName the name of the table to retrieve records from.
     * @param {String}
     *            fieldNames the names of the fields in the table to be included in the the records.
     * @param {AbstractRestrictionDef}
     *            restriction to be applied to the table.
     * @param {Boolean}
     *            True if records should be converted to model instances false otherwise.
     * @param completedCallback {Function} Executed when the operation is compelete
     *        @param results {Object} Contains the retrieved records and the operation status
     *             records {Array} Records returned from the server
     *             success {Boolean} True if the operation completes without errors
     *             exception {Object} The exception object is success is false.
     */
    retrieveRecordsAsync: function(tableName, fieldNames, restriction, modelType, convertRecords, completedCallback, scope) {

        console.log('Calling MobileSyncService.retrieveRecordsAsync: tableName=[' + tableName + '], fieldNames=['
                + fieldNames + '], restriction=[' + restriction + '], model=[' + modelType.getName() + ']');

        var me = this,
            results = {
                records: [],
                success: false,
                exception: null
            };

        var onSuccess = function (records) {
            if (Ext.isEmpty(convertRecords) || convertRecords) {
                results.records = MobileSyncServiceConversionUtils.convertRecordsFromServer(records, modelType);
            } else {
                results.records = records;
            }
            results.success = true;
            if (typeof completedCallback === 'function') {
                completedCallback.call(scope || me, results );
            }
        };

        var onError = function(message, exception) {
            results.success = false;
            results.exception = exception;
            if (typeof completedCallback === 'function') {
                completedCallback.call(scope || me, results );
            }
        };

        // TODO: Make timeout value a constant
        var options = {
            async: true,
            timeout: 120 * 1000,
            callback: onSuccess,
            errorHandler: onError
        };

        MobileSyncService.retrieveRecords(tableName, fieldNames, restriction, options);
    },

	/**
	 * Returns table definition for specified table. Contains localized strings and enums according to the locale of the
	 * current user session.
	 * 
	 * @public
	 * @param {String}
	 *            tableName name of the table to return the definition for.
	 * @return {TableDef} TableDef of the specified table.
	 * 
	 * @throws exception
	 *             if operation fails.
	 */
	getTableDef : function(tableName) {
		// get tableDef for the store table
		console.log('Calling MobileSyncService.getTableDef: tableName=[' + tableName + ']');

		var tableDef = null;

		MobileSyncService.getTableDef(tableName, {
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				tableDef = returnValue;
			},
			errorHandler : function(message, exception) {
                exception.genericMessage = 'Error retrieving Table Definition.';
				Common.service.ExceptionTranslator.translate(exception);
			}
		});

		return tableDef;
	},

	/**
	 * Returns list of AppInfo objects. AppInfo contains properties of mobile applications enabled for the current user.
	 * AppInfo is localized according to the locale of the user session.
	 * 
	 * @public
	 * @return result {Object} result object containing the applications and success information.
     *         success: {Boolean} True if the operation completes without errors
     *         enabledApplications: {Array} Array of application records.
     *         errorMessage: {String} The exception message if success is false
	 * 
	 */
	getEnabledApplications : function() {
        // Result object
		var result = {
            success: false,
            applications:[],
            errorMessage: ''
        };

		// get list of enabled applications
		MobileSyncService.getEnabledApplications({
			async : false,
            headers: { "cache-control": "no-cache" },
			callback : function (returnValue) {
				result.success = true;
                result.applications = returnValue;
			},
			errorHandler : function(message, exception) {
                console.log('ERROR: MobileSyncServiceAdapter getEnabledApplications');
                result.success = false;
                exception.genericMessage = 'Error retrieving User Applications.';
                result.errorMessage = Common.service.ExceptionTranslator.translate(exception);
			}
		});

		return result;
	}
});