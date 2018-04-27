Ext.define('Common.view.prompt.PromptBase', {
	extend : 'Ext.Panel',

	requires : 'Ext.plugin.ListPaging',

	xtype : 'promptBase',

	config : {
		layout : 'vbox',

		list : {
			flex : 1,
			scrollable : true,
			emptyText : '<div class="empty-text">No Records to Display</div>',
			plugins : {
				xclass : 'Ext.plugin.ListPaging',
				autoPaging : true
			}
		},

		titleBar : {
			docked : 'top'
		}
	},

	onPromptItemTapped : function(list, index, target, record) {
		var me = this;
		me.fireEvent('promptitemtapped', list, record);
	},

	applyList : function(config) {
		return Ext.factory(config, Ext.dataview.List, this.getList());
	},

	updateList : function(newList, oldList) {
		if (newList) {
			newList.on({
				itemtap : this.onPromptItemTapped,
				scope : this
			});
			this.add(newList);
		}
		if (oldList) {
			this.remove(oldList);
		}
	},

	applyTitleBar : function(config) {
		return Ext.factory(config, Ext.TitleBar, this.getTitleBar());
	},

	updateTitleBar : function(newTitleBar, oldTitleBar) {
		if (newTitleBar) {
			this.add(newTitleBar);
		}
		if (oldTitleBar) {
			this.remove(oldTitleBar);
		}
	},

    /**
     * Clears any selected items from the list
     */
    clearListSelection: function() {
        var list = this.getList();
        if (list) {
            list.deselectAll(true);
        }
    }
});