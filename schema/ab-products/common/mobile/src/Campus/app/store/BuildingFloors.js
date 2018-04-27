/**
 * Store to maintain BuildingFloor view.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Campus.store.BuildingFloors', {
	extend : 'Common.store.sync.SqliteStore',

	requires : [ 'Common.store.proxy.SqliteView', 'Campus.model.BuildingFloor' ],

	config : {
		storeId : 'buildingFloorsStore',
		model : 'Campus.model.BuildingFloor',
		autoLoad : false,
		enableAutoLoad : true,
		remoteFilter : true,
		proxy : {
			type : 'SqliteView',

			viewDefinition : 'SELECT building.site_id,building.bl_id,floor.fl_id'
					+ ' FROM Building JOIN Floor on building.bl_id = Floor.bl_id',

			viewName : 'BuildingFloor',

			baseTables : [ 'Building', 'Floor' ]
		}
	}
});