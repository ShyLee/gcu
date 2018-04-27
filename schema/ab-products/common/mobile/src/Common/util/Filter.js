/**
 * Provides additional filter functions.
 * <p>
 * Allows filters to use NULL values when querying the SQLite database.
 * <p>
 * Example: Select all records from the SpaceSites table where the detail_dwg value is not NULL
 * 
 * var spaceBookSitesStore = Ext.getStore('spaceBookSites'); var filter = Ext.create('Common.util.Filter', { property:
 * 'detail_dwg', value: '', matchIsNullValue: true, isEqualNull: false });
 * 
 * spaceBookSitesStore.filter(filter); spaceBookSitesStore.load();
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Filter', {
	extend : 'Ext.util.Filter',

	isExtendedFilter : true,

	config : {
		/**
		 * @cfg matchIsNullValue When true the filter will create a restriction using the database NULL value
		 */
		matchIsNullValue : false,

		/**
		 * @cfg isEqualNull {Boolean} When true the filter will create a restriction using IS NULL. When false the
		 *      restriction is created as IS NOT NULL.
		 */
		isEqualNull : true,

		conjunction : 'AND'
	},

	constructor : function(config) {
		this.callParent([ config ]);
	}

});