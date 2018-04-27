/**
 * Provides the toolbar view used in the {@link Common.navigation.NavigationView} class.
 * <p>
 * The NavigationBar class provides a Back button and either an Add or Save button depending on the displayed views
 * configuration. The NavigationBar class displays the Add button if the displayed view extends the
 * {@link Common.navigation.ListBase} class. The Save button is shown if the displayed view extends from the
 * {@link Common.navigation.EditBase} class.
 * <p>
 * 
 * 
 * @overrides Ext.navigation.Bar
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.view.navigation.NavigationBar', {
	extend : 'Ext.navigation.Bar',

	xtype : 'navigationbar',

	config : {

		addButton : {
			align : 'right',
			iconCls : 'add',
			iconMask : true,
			hidden : true,
			style : '-webkit-box-ordinal-group:3'
		},

		saveButton : {
			align : 'right',
			ui : 'action',
			text : 'Save',
			hidden : true,
            itemId: 'navBarSaveButton',
			style : '-webkit-box-ordinal-group:2'
		},

		/**
		 * @cfg viewStack Stores the views loaded in the NavigationView. Views are added and removed from the viewStack
		 *      as they are added and removed to the navigation view.
		 */
		// TODO why do we need to keep this list in two places?
		viewStack : [],

		/**
		 * @cfg {Boolean} showSaveButton Indicates if the Show or Add button should be displayed. The Save button is
		 *      displayed when true. The Add button is displayed when false. Both buttons are hidden when the value is
		 *      null
		 */
		showSaveButton : false,

        /**
         * @cfg {Boolean} Hides both the Add and Save buttons when true.
         */
        hideSaveButtons: false

	},

	constructor : function(config) {
		this.callParent([config]);
	},

	/**
	 * Sets the display of the Add or Save button when the showSaveButton property is changed.
	 * 
	 * @param {Boolean/null}
	 *            newShowSaveButton The Save button is displayed when True. The Add button is displayed when False. Both
	 *            buttons are hidden when the value is null.
	 */

	updateShowSaveButton : function(newShowSaveButton) {
        var hideSaveButtons = this.getHideSaveButtons();

		if (newShowSaveButton === null || hideSaveButtons === true) {
            // TODO: fix this Hack...
            var currentView = this.getCurrentView();
            if (currentView.xtype === 'roomSurveyPanel') {
                this.getSaveButton().show();
                this.getAddButton().hide();
            } else {
                this.getSaveButton().hide();
                this.getAddButton().hide();
            }
			return;
		}

		if (newShowSaveButton) {
			this.getSaveButton().show();
			this.getAddButton().hide();
		} else {
			this.getSaveButton().hide();
			this.getAddButton().show();
		}
	},

    /**
     * Hides both the Add and Save buttons if the hideSaveButtons config
     * is set to true.
     * @param newHideButton
     */
    updateHideSaveButtons: function (newHideButton) {
        if (newHideButton) {
            this.getSaveButton().hide();
            this.getAddButton().hide();
        }
    },

	applySaveButton : function(config) {
		return Ext.factory(config, Ext.Button, this.getSaveButton());
	},

	updateSaveButton : function(newSaveButton, oldSaveButton) {
		if (oldSaveButton) {
			this.remove(oldSaveButton);
		}

		if (newSaveButton) {
			this.add(newSaveButton);

			newSaveButton.on({
				scope : this,
				tap : this.onSaveButtonTap
			});
		}
	},

	applyAddButton : function(config) {
		return Ext.factory(config, Ext.Button, this.getAddButton());
	},

	updateAddButton : function(newAddButton, oldAddButton) {
		if (oldAddButton) {
			this.remove(oldAddButton);
		}

		if (newAddButton) {
			this.add(newAddButton);
			newAddButton.on({
				scope : this,
				tap : this.onAddButtonTap
			});
		}
	},

	onSaveButtonTap : function() {
		this.fireEvent('save', this);
	},

	onAddButtonTap : function() {
		this.fireEvent('add', this);
	},

	// TODO: Verify 2.1 overrides.
	/**
	 * @private
	 * @override Added viewStack handling
	 */
	onViewAdd : function(view, item) {
		var me = this,
            backButtonStack = me.backButtonStack, hasPrevious, title;

		me.endAnimation();

		/** * Start override ** */

		// Push the new view on the stack and set
		// the Add of Save button.
		me.getViewStack().push(item);

		// Display the Add or Save button
		me.setShowSaveButton(this.getDisplayShowButton(item));

		me.removeToolBarButtons();
		me.addToolBarButtons(item);

		/** * End override ** */

		title = (item.getTitle) ? item.getTitle() : item.config.title;

		backButtonStack.push(title || '&nbsp;');
		hasPrevious = backButtonStack.length > 1;

		me.doChangeView(view, hasPrevious, false);
	},

	/**
	 * @private
	 * @override Added viewStack handling
	 */
	onViewRemove : function(view) {
		var me = this, backButtonStack = me.backButtonStack, hasPrevious;

		me.endAnimation();
		backButtonStack.pop();
		hasPrevious = backButtonStack.length > 1;

		/** * Start override ** */

		// Remove the view from the view stack and
		// set the Add or Save button.
		var viewStack = this.getViewStack();
		viewStack.pop();

		me.removeToolBarButtons();

		var viewToShow = viewStack.length > 0 ? viewStack[viewStack.length - 1] : view;

		me.setShowSaveButton(this.getDisplayShowButton(viewToShow));
		me.addToolBarButtons(viewToShow);

		/** * End override ** */

		me.doChangeView(view, hasPrevious, true);
	},

	/**
	 * Returns false if the view is a Navigation List view, true if it is an Edit view.
	 * 
	 * @param {Object}
	 *            view
	 * @return {Boolean}
	 */
	getDisplayShowButton : function(view) {
		if (view.isNavigationList || view.isNavigationEdit) {
			return !view.isNavigationList;
		} else {
			return null;
		}
	},

	/**
	 * Returns the current displayed view
	 * 
	 * @return {Container}
	 */
	getCurrentView : function() {
		var viewStack = this.getViewStack();
		if (viewStack.length > 0) {
			return viewStack[viewStack.length - 1];
		} else {
			// return main view...
			return this.getView();
		}
	},

    // TODO: Comments
	addToolBarButtons : function(view) {

		var toolBarButtons, viewType;

		// Check if the view has any toolbar buttons defined
		if (typeof view.getToolBarButtons !== 'function') {
			return;
		}

		toolBarButtons = view.getToolBarButtons();

		if (!toolBarButtons) {
			return;
		}

		// Check if this is a create or update view
		if (typeof view.getIsCreateView === 'function') {
			viewType = view.getIsCreateView() ? 'create' : 'update';
		} else {
			viewType = 'all';
		}

		// Add the buttons
		Ext.each(toolBarButtons, function(button) {
			var toolBarButton = Ext.factory(button, 'Ext.Button'), displayOn = toolBarButton.getDisplayOn();

			if (displayOn === 'all' || viewType === displayOn) {
				this.add(toolBarButton);
			}
		}, this);
	},

	removeToolBarButtons : function() {
		var buttons = this.query('toolbarbutton');
		Ext.each(buttons, function(button) {
			this.remove(button, true);
		}, this);
	}

});