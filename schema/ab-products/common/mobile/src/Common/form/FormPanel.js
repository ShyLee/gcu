Ext.define('Common.form.FormPanel', {
    extend: 'Ext.form.Panel',

    requires: 'Common.type.CustomType',

    isErrorPanelDisplayed: false,

    config: {
        model: null
    },

    constructor: function (config) {
        this.callParent(arguments);
        this.addFieldListeners();
    },

    /**
     * @override Overrides Ext.panel.FormPanel. Required to handle custom type implementation
     */
    setValues: function (values) {
        var fields = this.getFields(), name, field, value, ln, i, f;

        values = values || {};

        for (name in values) {
            if (values.hasOwnProperty(name)) {
                field = fields[name];
                value = values[name];

                if (field) {
                    // If there are multiple fields with the same name. Checkboxes, radio fields and
                    // maybe event just
                    // normal fields..
                    if (Ext.isArray(field)) {
                        ln = field.length;

                        // Loop through each of the fields
                        for (i = 0; i < ln; i++) {
                            f = field[i];

                            if (f.isRadio) {
                                // If it is a radio field just use setGroupValue which will handle all
                                // of the radio
                                // fields
                                f.setGroupValue(value);
                            } else if (f.isCheckbox) {
                                if (Ext.isArray(value)) {
                                    f.setChecked((value.indexOf(f._value) !== -1));
                                } else {
                                    f.setChecked((value === f._value));
                                }
                            } else {
                                // If it is a bunch of fields with the same name, check if the value is
                                // also an array,
                                // so we can map it
                                // to each field
                                if (Ext.isArray(value)) {
                                    f.setValue(value[i]);
                                }
                            }
                        }
                    } else {
                        if (field.isRadio || field.isCheckbox) {
                            // If the field is a radio or a checkbox
                            field.setChecked(value);
                        } else {
                            // If just a normal field
                            // Changed to handle custom types
                            if (value instanceof Common.type.CustomType) {
                                field.setValue(value.getValue());
                            } else {
                                field.setValue(value);
                            }
                        }
                    }
                }
            }
        }

        return this;
    },

    /**
     * Registers change listeners for all fields included in the form panel. Updates the form record on
     * each field change.
     * <p>
     * This keeps the form model updated with the contents of the form. This simplifies the form
     * processing. We can call form.getRecord() and always get the contents of the form fields.
     */
    addFieldListeners: function () {
        var fields = Ext.ComponentQuery.query('> field'),
                me = this;

        Ext.each(fields, function (field) {
            field.on('change', function (field, newValue, oldValue) {
                console.log('Field Changed field: ' + field.getName() + ' newValue: ' + newValue + ' oldValue: ' + oldValue);
                var record = me.getRecord();
                if (record) {
                    record.set(field.getName(), field.getValue());
                    if (this.isErrorPanelDisplayed) {
                        this.displayErrors(record);
                    }
                }
            }, me);
        }, me);
    },

    displayErrors: function (data) {

        var fields = Ext.ComponentQuery.query('> field'), errors = data.validate(), errorMessages = '', j;

        Ext.each(fields, function (field) {
            var fieldName = field.getName(), fieldErrors = errors.getByField(fieldName);

            if (fieldErrors.length > 0) {
                field.element.last().first().addCls('invalid-field');
                for (j = 0; j < fieldErrors.length; j++) {
                    errorMessages = errorMessages + '<div style="padding-bottom:2px;">'
                            + field.getLabel() + '&nbsp;' + fieldErrors[j].getMessage() + '</div>';
                }
            } else {
                field.element.last().first().removeCls('invalid-field');
            }

        }, this);

        if (errorMessages.length > 0) {
            this.isErrorPanelDisplayed = true;
            // Check if the error panel is displayed
            this.removeErrorPanelIfExists();
            this
                    .add({
                        xtype: 'container',
                        id: 'errorPanel',
                        cls: 'error-panel',
                        html: '<div>Please correct the following:</div><div style="padding-left:6px;padding-top:4px;font-size:0.9em;">'
                                + errorMessages + '</div>'
                    });
        } else {
            this.isErrorPanelDisplayed = false;
            this.removeErrorPanelIfExists();
        }
    },

    removeErrorPanelIfExists: function () {
        var errorPanel = Ext.ComponentQuery.query('#errorPanel')[0];
        if (errorPanel) {
            this.remove(errorPanel, true);
        }
    }

});
