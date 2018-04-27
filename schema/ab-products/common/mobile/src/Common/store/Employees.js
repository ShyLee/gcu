Ext.define('Common.store.Employees', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Employee' ],

	serverTableName : 'em',

	serverFieldNames : [ 'em_id', 'email', 'bl_id', 'fl_id', 'phone' ],
	inventoryKeyNames : [ 'em_id' ],

	config : {
		model : 'Common.model.Employee',
		storeId : 'employeesStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'em_id',
			direction : 'ASC'
		} ],
		enableAutoLoad : false,
		proxy : {
			type : 'Sqlite'
		}
	}
});