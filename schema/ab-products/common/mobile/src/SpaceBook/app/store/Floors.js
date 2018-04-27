Ext.define('SpaceBook.store.Floors', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'SpaceBook.model.SpaceFloor' ],

	serverTableName : 'fl',
	serverFieldNames : [ 'bl_id', 'fl_id', 'name', 'area_gross_ext', 'area_gross_int', 'area_rentable', 'area_usable' ],

	inventoryKeyNames : [ 'bl_id', 'fl_id' ],

	config : {
		model : 'SpaceBook.model.SpaceFloor',
		sorters : [ {
			property : 'fl_id',
			direction : 'ASC'
		} ],
		storeId : 'spaceBookFloors',
		enableAutoLoad : true,
		remoteFilter : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});