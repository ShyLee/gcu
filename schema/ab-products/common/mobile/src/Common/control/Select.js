/**
 * Select list control that does not default to selecting the first item in the list
 * Overrides Ext.field.Select
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.control.Select', {
    extend: 'Ext.field.Select',

    xtype: 'selectlistfield',

    initialize: function() {
        var me = this;

        me.callParent();
        me.element.addCls('x-prompt-clearicon');
    },

    /**
     * @override
     * Does not select the first item in the select list store if that item is not found in the store.
     * Shows the picker for the select field, whether that is a {@link Ext.picker.Picker} or a simple
     * {@link Ext.List list}.
     */
    showPicker: function() {
        var store = this.getStore();


        //check if the store is empty, if it is, return
        if (!store || store.getCount() === 0) {
            return;
        }

        if (this.getReadOnly()) {
            return;
        }

        this.isFocused = true;

        if (this.getUsePicker()) {
            var picker = this.getPhonePicker(),
                    name   = this.getName(),
                    value  = {};

            value[name] = this.getValue();
            picker.setValue(value);
            if (!picker.getParent()) {
                Ext.Viewport.add(picker);
            }
            picker.show();
        } else {
            var listPanel = this.getTabletPicker(),
                list = listPanel.down('list'),
                emptyValue = false,
                index, record;

            store = list.getStore();
            index = store.find(this.getValueField(), this.getValue(), null, null, null, true);
            if (index === -1) {
                emptyValue = true;
            }
            record = store.getAt((index == -1) ? 0 : index);

            if (!listPanel.getParent()) {
                Ext.Viewport.add(listPanel);
            }

            // Start override
            // Deselect the record in the list if the value is not found in the store.
            listPanel.showBy(this.getComponent(), (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10) ? 't-b' : null);
            if(emptyValue) {
                list.deselect(record, true);
            } else {
                list.select(record, null, true);
            }
        }
    }
});