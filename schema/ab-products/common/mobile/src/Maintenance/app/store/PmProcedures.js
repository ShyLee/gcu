Ext.define('Maintenance.store.PmProcedures', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Maintenance.model.PmProcedure' ],

	serverTableName : 'pmp',
	serverFieldNames : [ 'pmp_id', 'description' ],
	inventoryKeyNames : [ 'pmp_id' ],

	config : {
		model : 'Maintenance.model.PmProcedure',
		sorters : [ {
			property : 'description',
			direction : 'ASC'
		} ],
		storeId : 'pmProcedurersStore',
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}

	}
});