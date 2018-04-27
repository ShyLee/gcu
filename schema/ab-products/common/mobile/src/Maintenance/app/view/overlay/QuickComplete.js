Ext.define('Maintenance.view.overlay.QuickComplete', {
    extend: 'Common.form.FormPanel',

    xtype: 'quickCompletePanel',

    config: {
        layout: 'vbox',
        workRequestRecord: null,

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWidth: Ext.os.is.Phone ? 120: 180,
                    stepValue: 0.1,
                    minValue: 0
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'cf_id'
                    },
                    {
                        xtype: 'spinnerfield',
                        label: 'Actual Hours',
                        name: 'hours_straight'
                    },
                    {
                        xtype: 'spinnerfield',
                        label: 'Overtime Hours',
                        name: 'hours_over'
                    },
                    {
                        xtype: 'spinnerfield',
                        label: 'Doubletime Hours',
                        name: 'hours_double'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'work_type'
                    }
                ]
            },
            {
                xtype: 'container',
                html: '',
                cls: 'error-panel',
                padding: 6,
                margin: '0 0 10 0',
                hidden: true
            },
            {
                xtype: 'container',
                layout: 'hbox',
                margin: Ext.os.is.Phone ? '0' : '0 0 10 0',
                items: [
                    {
                        xtype: 'button',
                        text: 'Cancel',
                        flex: 1,
                        ui: 'iron',
                        action: 'quickCompleteCancel'
                    },
                    {
                        xtype: 'spacer',
                        flex: 1
                    },
                    {
                        xtype: 'button',
                        text: 'Save',
                        flex: 1,
                        ui: 'iron',
                        action: 'quickCompleteSave',
                        itemId: 'quickCompleteSaveButton'
                    }
                ]
            }

        ]
    },

    constructor: function(config) {
        var me = this,
            initialConfig = me.config;
            config = Ext.apply(config || {}, initialConfig);

        me.callParent(config);
    },

    initialize: function () {
        var me = this,
            saveButton = me.query('#quickCompleteSaveButton')[0];

        saveButton.on('tap', me.onSaveButtonTapped, me);
        me.callParent(arguments);
    },

    /*
     * applyViewIds: function (config) { var record = this.getRecord(); record.set('mob_wr_id', config.mobileId);
     * record.set('wr_id', config.workRequestId); },
     */

    onSaveButtonTapped: function () {
        var me = this;
        me.fireEvent('quickcompletesave', me.getRecord(), me.getWorkRequestRecord());
    }

});