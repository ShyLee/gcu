Ext.define('Maintenance.store.WorkRequestParts', {
	extend : 'Common.store.sync.SyncStore',
	requires : [ 'Maintenance.model.WorkRequestPart' ],

	serverTableName : 'wrpt_sync',
	serverFieldNames : [ 'wr_id', 'part_id', 'date_assigned', 'time_assigned', 'qty_actual', 'comments',
			'mob_is_changed', 'mob_locked_by', 'mob_wr_id' ],

	inventoryKeyNames : [ 'wr_id', 'part_id', 'date_assigned', 'time_assigned' ],

	config : {
		model : 'Maintenance.model.WorkRequestPart',
		storeId : 'workRequestPartsStore',
		enableAutoLoad : true,
		remoteFilter : true,
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
		var workRequestStore = Ext.getStore('workRequestsStore'), workRequestIdMap = workRequestStore.workRequestIdMap;

		Ext.each(records, function(record) {
			var id = workRequestIdMap.get(record.get('wr_id'));
			record.set('mob_wr_id', id);
		});
	}
});