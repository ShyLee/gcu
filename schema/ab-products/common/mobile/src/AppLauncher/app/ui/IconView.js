/**
 * Generates an layout consisting of two application images per row. The data from the Apps store is used to generate
 * the image and place the icons in the container.
 * 
 * @author Jeff Martin
 */

Ext.define('AppLauncher.ui.IconView', {
	singleton : true,

	/**
	 * Generates a Vbox layout that contains rows of Hbox layouts. Each row of the layout can contain up to 2
	 * application images. The layout is generated using the data stored in the user application (Apps) store.
	 * 
	 * @param applicationStore
	 *            Store containing the data for the layout
	 * @return {Object} Object defining the layout.
	 */
	generateIconView : function(applicationStore) {

		var viewItems = {
			layout : {
				type : 'vbox',
				align : 'middle',
				fullscreen : true
			},
			items : []
		}, i, length, rowIndex = 0, numberItemsInRow, rowArray, storeItems;

		storeItems = applicationStore.getData().items;
		length = storeItems.length;

		// Make a copy of the storeItems array so we don't corrupt the contents of the store
		var storeItemsCopy = Ext.Array.map(storeItems, function(item) {
			return item;
		});

		for (i = 0; i < length; i = i + 2) {
			numberItemsInRow = length - 2 >= 0 ? 2 : 1;
			rowArray = storeItemsCopy.splice(0, numberItemsInRow);
			viewItems.items[rowIndex] = this.generateIconRow(rowArray);
			rowIndex += 1;
		}

		return viewItems;
	},

	/**
	 * Generates the object for each row of the layout
	 * 
	 * @param rowArray
	 *            The array containing one or two records of icon data
	 * @return {Object} The row of icons to be added to the main layout.
	 */
	generateIconRow : function(rowArray) {
		var iconRow = {
			xtype : 'container',
			layout : 'hbox',
			defaults : {
				margin : 50
			},
			items : []
		}, i, length;

		length = rowArray.length > 2 ? 2 : rowArray.length;

		// Add the icon items to the row.
		for (i = 0; i < length; i++) {
			iconRow.items[i] = this.generateIconItem(rowArray[i].getData());
		}

		return iconRow;

	},

	/**
	 * Generates the AppIcon configuration item
	 * 
	 * @param application
	 *            Record containg the icon data
	 * @return {Object} AppIcon configuration object
	 */

	generateIconItem : function(application) {
		var iconItem = {
			xtype : 'appicon',
			title : application.title,
			url : application.url,
			iconData : application.iconData
		};

		return iconItem;
	}

});