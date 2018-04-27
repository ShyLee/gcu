Ext.define('Maintenance.store.WorkRequestCraftspersons', {
    extend: 'Common.store.sync.SyncStore',
    requires: [ 'Maintenance.model.WorkRequestCraftsperson' ],

    serverTableName: 'wrcf_sync',
    serverFieldNames: [ 'cf_id', 'wr_id', 'date_assigned',
        'time_assigned', 'date_start', 'time_start',
        'date_end', 'time_end', 'hours_straight',
        'hours_over', 'hours_double', 'work_type',
        'comments', 'mob_is_changed', 'mob_locked_by',
        'mob_wr_id' ],

    inventoryKeyNames: [ 'wr_id', 'cf_id', 'date_assigned',
        'time_assigned' ],

    config: {
        model: 'Maintenance.model.WorkRequestCraftsperson',
        storeId: 'workRequestCraftspersonsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'Sqlite'
        }
    },

    /**
     * Override to allow us to set the mob_wr_id value with the
     * wr_id value
     *
     * @override
     * @param restriction
     * @return {*}
     */
    checkOutRecords: function (restriction) {
        var records = this.callParent(arguments);
        this.setMobileWorkRequest(records);
        return records;
    },

    setMobileWorkRequest: function (records) {
        var workRequestStore = Ext.getStore('workRequestsStore'),
                workRequestIdMap = workRequestStore.workRequestIdMap;

        Ext.each(records, function (record) {
            if (workRequestIdMap) {
                var id = workRequestIdMap.get(record.get('wr_id'));
                record.set('mob_wr_id', id);
            }
        });
    }
});