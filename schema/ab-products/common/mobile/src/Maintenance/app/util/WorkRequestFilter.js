/**
 * Applies the My Work/ My Requests filter to the work request list
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Maintenance.util.WorkRequestFilter', {
	alternateClassName : [ 'WorkRequestFilter' ],
	requires : [ 'Common.util.Filter' ],

	singleton : true,

	/**
	 * Applies filter to display either the My Work or My Requests work request list.
	 * 
	 * @param showMyWork
	 *            {Boolean} When true, the My Work items are displayed. When false the My Requests items are displayed.
	 */
	applyMyWorkListFilter : function(showMyWork) {

		var store = Ext.getStore('workRequestsStore');
		store.clearFilter();
		store.filter('request_type', showMyWork ? 0 : 1);
		store.load();
	}
});