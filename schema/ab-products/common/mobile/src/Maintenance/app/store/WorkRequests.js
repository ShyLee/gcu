/**
 * Provides persistence and synchronization for WorkRequest domain object.
 * <p>
 * Uses SQLite database for persistence.
 * <p>
 * Uses DWR services for synchronization with the server.
 * <p>
 * Specifies information required for mapping to the server-side table: serverTableName, inventoryKeyNames.
 * <p>
 * The Store class encapsulates a cache of domain objects.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 * 12.11.12 Set enableAutoLoad to true. JM
 */

Ext.define('Maintenance.store.WorkRequests', {

	extend : 'Common.store.sync.SyncStore',
	requires : [ 'Maintenance.model.WorkRequest' ],

	serverTableName : 'wr_sync',
	serverFieldNames : [ 'wr_id', 'bl_id', 'fl_id', 'rm_id', 'site_id', 'cf_notes', 'date_requested', 'description',
			'eq_id', 'location', 'priority', 'prob_type', 'requestor', 'tr_id', 'status', 'mob_locked_by',
			'mob_pending_action', 'mob_is_changed', 'mob_wr_id', 'pmp_id', 'date_assigned', 'date_est_completion',
			'cause_type', 'repair_type', 'doc1', 'doc2', 'doc3', 'doc4', 'request_type' ],

	inventoryKeyNames : [ 'wr_id' ],

    workRequestIdMap : null,

	config : {
		model : 'Maintenance.model.WorkRequest',
		storeId : 'workRequestsStore',
		remoteFilter : true,
		remoteSort : true,

		sorters : [ {
			property : 'id',
			direction : 'DESC'
		}],

		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},

        /**
         * @cfg syncRemovedRecords {Boolean}
         * Do not sync records that are marked to be destroyed. Work request records are not destroyed
         * using the store.
         */
        syncRemovedRecords: false
	},

	/**
	 * Override to allow us to set the mob_wr_id field to the id field for all records that have been changed on the
	 * mobile device
	 * 
	 * @override
	 * @param callback
	 * @param scope
	 */
	getChangedOnMobileRecords : function(callback, scope) {

		var me = this,
            onLoad = function(records) {
			if (typeof callback === 'function') {
				callback.call(scope || me, records);
			}
		};

		// filter records with Changed on Mobile? = Yes
		// Setting the remote filter so that the store retrieves all of the
		// records from the mobile database
		// This will handle the case where there are modified records that are
		// not in the current page.

		me.clearFilter();
		me.filter('mob_is_changed', 1);
		// get filtered records from records loaded into the store

		// Disable paging so we can be sure that we retrieve all of the records
		me.setDisablePaging(true);

		me.load(function(records) {
			me.setMobileWrIdValues(records);
			me.clearFilter();
			// Reset the store page size
			me.setDisablePaging(false);
			onLoad(records);
		}, me);
	},

	/**
	 * Sets the mob_wr_id value to match the record id. Used during checkInRecords.
	 * 
	 * @param records
	 */
	setMobileWrIdValues : function(records) {
		Ext.each(records, function(record) {
			record.set('mob_wr_id', record.getId());
		});
	},

	/**
	 * Override to allow us to set the mob_wr_id value with the wr_id value
	 * 
	 * @override
	 * @param restriction
	 * @return {*}
	 */
	checkOutRecords : function(restriction) {
		var records = this.callParent(arguments);
		this.workRequestIdMap = Ext.create('Ext.util.HashMap');
		this.setMobileWorkRequest(records);
		return records;
	},

	setMobileWorkRequest : function(records) {
		var i = 0, mob_wr_id;

		Ext.each(records, function(record) {
            var requestType = record.get('request_type');
			mob_wr_id = i += 1;
			record.set('mob_wr_id', mob_wr_id);
            record.set('request_type', requestType === null ? 0 : requestType);
			var wr_id = record.get('wr_id');
            if (wr_id !== null) {
                this.workRequestIdMap.add(wr_id, mob_wr_id);
            }
		}, this);
	}

});