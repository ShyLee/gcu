Ext.define('Maintenance.store.WorkRequestCosts', {
	extend : 'Common.store.sync.SyncStore',
	requires : [ 'Maintenance.model.WorkRequestCost' ],

	serverTableName : 'wr_other_sync',
	serverFieldNames : [ 'wr_id', 'date_used', 'other_rs_type', 'cost_estimated', 'cost_total', 'description',
			'qty_used', 'units_used', 'mob_is_changed', 'mob_locked_by', 'mob_wr_id' ],

	inventoryKeyNames : [ 'wr_id', 'date_used', 'other_rs_type' ],

	config : {
		model : 'Maintenance.model.WorkRequestCost',
		storeId : 'workRequestCostsStore',
		remoteFilter : true,
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
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
		this.setMobileWorkRequest(records);
		return records;
	},

	setMobileWorkRequest : function(records) {
		var workRequestStore = Ext.getStore('workRequestsStore'),
            workRequestIdMap = workRequestStore.workRequestIdMap;

		Ext.each(records, function(record) {
			var id = workRequestIdMap.get(record.get('wr_id'));
			record.set('mob_wr_id', id);
		});
	}
});