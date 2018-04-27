/**
 * Provides persistence to application domain objects/models.
 * <p>
 * Uses SQLite database for persistence.
 * <p>
 * Holds properties that override default behavior or values inherited from the parent class.
 * <p>
 * The Store class encapsulates a cache of domain objects.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 * 
 * 01.03.13 Removed the tableName config property. The table name is now set in
 * the proxy configuration. JM
 */
Ext.define('Common.store.sync.SqliteStore', {
	extend : 'Ext.data.Store',

	requires : [ 'Common.store.proxy.Sqlite', 'Common.data.ModelGenerator' ],

	config : {
		/**
		 * @cfg disablePaging Disables built-in paging feature. When
		 *      disablePaging is set to true the store will load all of the
		 *      records from the database ignoring the pageSize configuration.
		 *      This property should only be enabled for stores that manage
		 *      tables with relatively small numbers of records.
		 * @accessor
		 */
		disablePaging : false,

		/**
		 * @cfg enableAutoLoad {Boolean} true to load the store during application start up when the
         * autoLoad configuration is set to false. If false, the store auto load function is set by
         * the autoLoad property.
         * <p>
         * When the app is executing in the native device environment, the loading of the store should
         * be delayed until the Phonegap library files have loaded.
         * <p>
         * Setting enableAutoLoad to true will load the store after the Phonegap library has loaded.
		 */
		enableAutoLoad : true,

		/**
		 * @cfg remoteFilter {Boolean}
         * true to defer any filtering operation to the server. If false, the filtering is done locally on
         * the client.
         * When set to true, you will have to manually call the load method after you filter to retrieve
         * the filtered data from the server.
         * <p>
         * Sqlite stores have this value set to true by default to force the filter
         * to be applied to the Sqlite database.
         *
		 */
		remoteFilter : true,

		/**
		 * @cfg dynamicModel Set to true if the store uses a dynamic model
		 *      instance. Dynamic models are generated using a combination of
		 *      the Application Preferences visible fields and the server table
		 *      Table Def
		 * 
		 */
		dynamicModel : false,

        savedCurrentPage: null
	},

	constructor : function(config) {
		this.callParent(arguments);
	},

    updateDisablePaging: function(newDisablePaging, oldDisablePaging) {
        if(newDisablePaging) {
            this.setSavedCurrentPage(this.currentPage);
        } else {
            // We are enabling paging for the store. Set the currentPage if it is not defined
            if(!Ext.isDefined(this.currentPage)) {
                this.currentPage = this.getSavedCurrentPage();
            }
        }
    },

	/**
	 * Overrides the Ext.data.Store load function. Uses the disablePaging
	 * configuration setting to turn off the paging function.
	 * 
	 * @override
	 * @param options
	 * @param scope
	 * @return {*}
	 */
	load : function(options, scope) {
		var me = this,
            operation,
            currentPage = me.currentPage,
            pageSize = me.getPageSize(),
            start;

		options = options || {};

		if (Ext.isFunction(options)) {
			options = {
				callback : options,
				scope : scope || this
			};
		}

		if (me.getRemoteSort()) {
			options.sorters = options.sorters || this.getSorters();
		}

		if (me.getRemoteFilter()) {
			options.filters = options.filters || this.getFilters();
		}

		if (me.getRemoteGroup()) {
			options.grouper = options.grouper || this.getGrouper();
		}

		// Override the limit settings
		// Setting pageSize to null will cause the proxy to not
		// add the limit clause to the query.
		if (this.getDisablePaging()) {
			currentPage = null;
		} else {
			start = (currentPage - 1) * pageSize;
		}

		Ext.applyIf(options, {
			page : currentPage,
			start : start,
			limit : pageSize,
			addRecords : false,
			action : 'read',
			model : this.getModel()
		});

		operation = Ext.create('Ext.data.Operation', options);

		if (me.fireEvent('beforeload', me, operation) !== false) {
			me.loading = true;
			me.getProxy().read(operation, me.onProxyLoad, me);
		}

		return me;
	},

    /**
     * @override
     * Override the Ext.data.Store sync function to add onSuccess, onFailure and scope parameters.
     * @parameter onSuccess {Function} called when the sync has completed successfully.
     * @parameter onFailure {Function} called when there is an error during the sync operation
     * @parameter scope {Object} The scope to execute the callback functions
     *
     * Synchronizes the Store with its Proxy. This asks the Proxy to batch together any new, updated
     * and deleted records in the store, updating the Store's internal representation of the records
     * as each operation completes.
     * @return {Object}
     * @return {Object} return.added
     * @return {Object} return.updated
     * @return {Object} return.removed
     */
    sync: function(onCompleted, onFailure, scope) {
        var me = this,
                operations = {},
                toCreate = me.getNewRecords(),
                toUpdate = me.getUpdatedRecords(),
                toDestroy = me.getRemovedRecords(),
                needsSync = false;

        // Start override
        // Check additional parameters
        if (!onCompleted) {
            onCompleted = Ext.emptyFn;
        }

        if (!onFailure) {
            onFailure = Ext.emptyFn;
        }

        if (!scope) {
            scope = me;
        }
        // End override

        if (toCreate.length > 0) {
            operations.create = toCreate;
            needsSync = true;
        }

        if (toUpdate.length > 0) {
            operations.update = toUpdate;
            needsSync = true;
        }

        if (toDestroy.length > 0) {
            operations.destroy = toDestroy;
            needsSync = true;
        }

        // Override
        // Add success, failure and scope properties to the batch object
        if (needsSync && me.fireEvent('beforesync', this, operations) !== false) {
            me.getProxy().batch({
                operations: operations,
                listeners: me.getBatchListeners(),
                success: onCompleted,
                failure: onFailure,
                scope: scope
            });
        } else {
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me);
            }
        }

        return {
            added: toCreate,
            updated: toUpdate,
            removed: toDestroy
        };
    },


    /**
	 * Drops and creates table for this store.
	 * 
	 * @private
	 */
	dropAndCreateTable : function(callback, scope) {
		var model = this.getModel(), proxy = this.getProxy(), tableName = proxy
				.getTable();

		if (proxy) {
			proxy.dropAndCreateTable(tableName, model, callback, scope);
		}
	},

	/**
	 * Removes all records from the database. Does not update the store. Call
	 * the load() function to update the store
	 * 
	 * @private
	 */
	removeAllRecords : function() {
		this.getProxy().removeAll();
	},

	/**
	 * Removes all records from the database, than inserts the provided records.
	 * 
	 * @private
	 * @param {Model[]}
	 *            records to be inserted into the database.
	 */
	removeAllAndInsertRecords : function(records, callback, scope) {
		var me = this;
		me.getProxy().removeAllAndInsertRecords(records, function() {
			if (typeof callback === 'function') {
				callback.call(scope || me);
			}
		}, me);
	},

    /**
     * Generates the model fields and applies the model to the store.
     */
	setDynamicModelDefinition : function() {
		var me = this;

		// Update the model reference. The generateModel function updates the
		// store model by reference
		// There is no need to call Store.setModel()
		Common.data.ModelGenerator.generateModel(me.getModel(),
				me.serverTableName);

		// Update the proxy model definition
		me.getProxy().updateModel(me.getModel());
	},

    /**
     * Retrieves all records from the store.
     * Disables the store paging, saves the applied filters, applies new filters and retrieves
     * the data from the SQLite database.
     * The original filters are reapplied and the store is loaded again to set the data
     * in the store back to the original state.
     * <p>
     * There are many cases where we need to retrieve all of the records from a store
     * without limiting the returned results by the store page size
     * <p>
     * This function provides a method for us to use to retrieve all of the records from
     * the database then put the contents of the store back to the original state.
     *
     * @param filters {Array} Filters to be applied to the store before retrieving the records
     */
    // TODO: Consider suspending store events to prevent lists from updated
    retrieveAllStoreRecords: function(filters, onCompleted, scope) {
        var me = this,
            currentFilters = me.getFilters(),
            retrievedRecords = [],
            isPagingDisabled = me.getDisablePaging();

        me.clearFilter();
        if(!Ext.isEmpty(filters)) {
            me.setFilters(filters);
        }
        me.setDisablePaging(true);
        me.load(function (records) {
            retrievedRecords = records;
            me.setFilters(currentFilters);
            me.setDisablePaging(isPagingDisabled);
            me.loadPage(1, function(){
                if(typeof onCompleted === 'function') {
                    onCompleted.call(scope || me, retrievedRecords);
                }
            });
        });
    }
});