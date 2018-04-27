/**
 * Store class to maintain AfmUser models.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.Users', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.User' ],

	serverTableName : 'afm_users',

	serverFieldNames : [ 'user_name', 'email' ],

	inventoryKeyNames : [ 'afm_user' ],

	config : {
		model : 'Common.model.User',
		storeId : 'usersStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'user_name',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}

});