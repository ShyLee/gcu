Ext.define('Maintenance.view.WorkRequestCraftspersonEdit', {

    extend: 'Maintenance.view.WorkRequestEditBase',

    xtype: 'workRequestCraftspersonEditPanel',

    config: {
        model: 'Maintenance.model.WorkRequestCraftsperson',
        storeId: 'workRequestCraftspersonsStore',
        title: '',

        addTitle: LocaleManager.getLocalizedString('Add Assignment'),
        editTitle: LocaleManager.getLocalizedString('Edit Assignment'),

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: Ext.os.is.Tablet || Ext.os.is.Desktop
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWidth: Ext.os.is.Phone ? 100 : 200,
                    stepValue: 0.1,
                    minValue: 0
                },
                items: [

                    {
                        xtype: 'textfield',
                        name: 'cf_id',
                        label: 'Craftsperson',
                        readOnly: true
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
                        xtype: 'container',
                        layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
                        defaults: {
                            labelWidth: Ext.os.is.Phone ? 100 : 200
                        },
                        items: [
                            {
                                xtype: 'datepickerfield',
                                label: 'Date Started',
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_start',
                                flex: 1,
                                picker: {
                                    yearFrom: 2012,
                                    yearTo: 2020,
                                    listeners: {
                                        show: function (component, eOpts) {
                                            var date = this.getValue();
                                            if (!date) {
                                                this.setValue(new Date());
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'timepickerfield',
                                label: 'Time Started',
                                name: 'time_start',
                                style: 'border-bottom:1px solid #DDD',
                                picker: {
                                    listeners: {
                                        show: function (component, eOpts) {
                                            var date = this.getValue();
                                            if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                                                this.setValue(new Date());
                                            }
                                        }
                                    }
                                },
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
                        defaults: {
                            labelWidth: Ext.os.is.Phone ? 100 : 200
                        },
                        items: [
                            {
                                xtype: 'datepickerfield',
                                label: 'Date Finished',
                                dateFormat: LocaleManager.getLocalizedDateFormat(),
                                name: 'date_end',
                                flex: 1,
                                picker: {
                                    yearFrom: 2012,
                                    yearTo: 2020,
                                    listeners: {
                                        show: function (component, eOpts) {
                                            var date = this.getValue();
                                            if (!date) {
                                                this.setValue(new Date());
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'timepickerfield',
                                label: 'Time Finished',
                                name: 'time_end',
                                style: 'border-bottom:1px solid #DDD',
                                picker: {
                                    listeners: {
                                        show: function (component, eOpts) {
                                            var date = this.getValue();
                                            if (date && date.getHours() === 0 && date.getMinutes() === 0) {
                                                this.setValue(new Date());
                                            }
                                        }
                                    }
                                },
                                flex: 1
                            }
                        ]
                    },
                    {
                        xtype: 'selectfield',
                        label: 'Work Type',
                        name: 'work_type',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard work types are entered here to handle the
                        // case when the TableDef is not available.
                        options: [
                            {
                                displayValue: 'UnSpecified',
                                objectValue: 'UnSp'
                            },
                            {
                                displayValue: 'Work',
                                objectValue: 'W'
                            },
                            {
                                displayValue: 'Material Pickup',
                                objectValue: 'P'
                            },
                            {
                                displayValue: 'Job Setup or Prep.',
                                objectValue: 'Prep'
                            },
                            {
                                displayValue: 'Travel Time',
                                objectValue: 'Tr'
                            },
                            {
                                displayValue: 'Wait for Security',
                                objectValue: 'WSec'
                            },
                            {
                                displayValue: 'Wait for Client',
                                objectValue: 'WCli'
                            }
                        ]
                    },
                    {
                        xtype: 'textareafield',
                        label: 'Comments',
                        name: 'comments'
                    }
                ]

            }
        ]

    },

    initialize: function () {
        // Set the title
        var me = this,
            userProfile,
            record = me.getRecord(),
            workEnumList;

        me.callParent();

        workEnumList = TableDef.getEnumeratedList('wrcf_sync', 'work_type');
        if (workEnumList && workEnumList.length > 0) {
            me.query('selectfield[name=work_type]')[0].setOptions(workEnumList);
        }

        // Get the cf_id value
        userProfile = Common.util.UserProfile.getUserProfile();
        if (me.getIsCreateView()) {
            me.setValues(userProfile);
            record.setData(userProfile);
        }

        me.setColumnHeadings('wrcf_sync');
        me.limitSpinnerButtonHeight();

        // Adjust height of the date and time controls
        var dateTimeControls = me.query('datepickerfield');

        Ext.each(dateTimeControls, function (control) {
            control.setHeight('100%');
        });
    },

    applyViewIds: function (config) {
        var formHeader = this.down('formheader');
        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    },

    setRecord: function (record) {
        var me = this,
            isCreateView = me.getIsCreateView(),
            userProfile;

        me.callParent(arguments);

        if(isCreateView) {
            return;
        }
        if (record) {
            userProfile = Common.util.UserProfile.getUserProfile();
            if (userProfile.cf_id !== record.get('cf_id')) {
                this.setAllFieldsReadOnly();
            }
        }
    },

    setAllFieldsReadOnly: function () {
        var fields = this.query('field');
        Ext.each(fields, function (field) {
            field.setReadOnly(true);
        });
    }

});