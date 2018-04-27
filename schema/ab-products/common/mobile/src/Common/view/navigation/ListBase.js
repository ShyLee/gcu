/**
 * The ListBase class should be used as the base class for all List Views that are used with the
 * Common.view.navigation.NavigationView class. The ListBase class contains the editView configuration that allows the
 * navigation framework to determine which view to load when a record is added to the list or when a record is updated.
 * 
 * @author Jeff Martin
 */

Ext.define('Common.view.navigation.ListBase', {
	extend : 'Ext.Container',

	isNavigationList : true,

	config : {
		/**
		 * @cfg {String} editViewClass The name of the View class that is used by this List view to add or update
		 *      records.
		 * @accessor
		 */
		editViewClass : null,
		layout : 'vbox',
		padding : Ext.os.is.Phone ? 2 : 20,
		enableDisclosure : false
	},

	initialize : function() {
		// Get all of the lists and add the disclosure event
		var me = this, lists = me.query('list');

		this.callParent();

		Ext.each(lists, function(list) {
			var enableDisclosure = this.getEnableDisclosure();
			list.setOnItemDisclosure(enableDisclosure);

			if (enableDisclosure) {
				list.on({
					scope : me,
					disclose : me.onDisclose
				});
			} else {
				list.on({
					scope : me,
					itemsingletap : me.onItemSingleTap
				});
			}
		}, me);

	},

	onDisclose : function(scope, record, target, index, e, eOpts) {
		this.fireEvent('itemDisclosed', this, record, target, index, e, eOpts);
	},

	onItemSingleTap : function(scope, index, target, record, e, eOpts) {
		// Change the parameter order to match the itemDisclosed event
		this.fireEvent('itemSingleTapped', this, record, target, index, e, eOpts);
	}

});