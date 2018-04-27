/**
 * Provides a navigation framework that can be used for applying the familiar pattern of adding and updating items
 * contained in a list.
 * <p>
 * This class works with the {@link Common.view.navigation.NavigationBar}, {@link Common.view.navigation.EditBase} ,
 * {@link Common.view.navigation.ListBase} and {@link Common.controller.NavigationController} to provide a basic
 * navigation structure.
 * <p>
 * The {@link Common.controller.NavigationController} uses information contained in the displayed view configuration to
 * determine the action that should be taken on the currently displayed view. T
 * <p>
 * This class extends {@link Ext.navigation.View}. Use of the class is very similar to the {@link Ext.navigation.View}
 * with the exception that all views used with this class should extend either the
 * {@link Common.view.navigation.EditBase} or the {@link Common.view.navigation.ListBase} class.
 * <p>
 * Adding and removing views to the navigation view is accomplished using the push() and pop() functions. Pushing a view
 * displays the view and adds the view to the navigation view stack. Tapping the Back button automatically pops the view
 * from the navigation view stack and navigates back to the previous view.
 * <p>
 * Views are automatically destroyed when popping them from the navigation view.
 * 
 * @overrides: Ext.navigation.View
 * 
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.view.navigation.NavigationView', {
	extend : 'Ext.navigation.View',

	requires : [ 'Common.view.navigation.NavigationBar' ],

	/**
	 * Overrides the base implementation to allow us to use our custom Common.view.navigation.NavigationBar class.
	 * 
	 * @override
	 * @param config
	 * @return {*}
	 */
	// @private
	applyNavigationBar : function(config) {
		if (!config) {
			config = {
				hidden : true,
				docked : 'top'
			};
		}

		if (config.title) {
			delete config.title;

			throw new Error("Common.view.navigation.NavigationView: The 'navigationBar' "
					+ "configuration does not accept a 'title' property. You "
					+ "set the title of the navigationBar by giving this "
					+ "navigation view's children a 'title' property.");
		}

		config.view = this;
		config.useTitleForBackButtonText = this.getUseTitleForBackButtonText();

		return Ext.factory(config, Common.view.navigation.NavigationBar, this.getNavigationBar());

	}

});