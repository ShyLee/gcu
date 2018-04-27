Ext.define('AssetAndEquipmentSurvey.view.Task', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'taskEditPanel',

    requires: [ 'Common.view.prompt.tablet.Building',
                'Common.view.prompt.tablet.Floor',
                'Common.view.prompt.tablet.Room',
                'Common.view.prompt.tablet.Equipment',
                'Common.view.prompt.tablet.EquipmentStandard',
                'Common.view.prompt.tablet.Division',
                'Common.view.prompt.tablet.Department',
                'Common.view.prompt.tablet.Site',
                'Common.util.Ui'
              ],

    config: {
        title: 'Edit Task',

        model: 'AssetAndEquipmentSurvey.model.Task',
        storeId: 'surveyTasksStore',

        /**
         * @cfg fieldOrder {Array} The order of the fields used when the form fields
         * are generated dynamically
         */
        fieldOrder: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_id', 'survey_id',
                     'dv_id', 'dp_id', 'eq_std', 'marked_for_deletion', 'status'],

        layout: 'vbox',

        /**
         * @cfg displayPreviousNextButtons {Object} true to display the Previous and Next buttons.
         * The Previous and Next buttons should not be displayed if there is only one record in the
         * Task list.
         */
        displayPreviousNextButtons: {
            disablePrevious: false,
            disableNext: false
        },

        /**
         * @cfg surveyField {Object} The default survey field configuration. The survey code
         * field is added to the form if it is not included in the Fields to Survey list
         */
        surveyField: {
            xtype: 'textfield',
            label: 'Survey Code',
            name: 'survey_id',
            readOnly: true
        },

        items: [
            {
                xtype: 'container',
                itemId: 'taskHeader',
                html: ''
            },
            {
                xtype: 'fieldset',
                title: '',
                items: [

                    {
                        xtype: 'promptfield',
                        label: 'Building',
                        name: 'bl_id',
                        panelName: 'taskEditPanel'
                    },
                    {
                        xtype: 'promptfield',
                        label: 'Floor',
                        name: 'fl_id',
                        panelName: 'taskEditPanel'
                    },
                    {
                        xtype: 'promptfield',
                        label: 'Room',
                        name: 'rm_id',
                        panelName: 'taskEditPanel'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Equipment',
                        name: 'eq_id'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Survey Code',
                        name: 'survey_id',
                        readOnly: true
                    },
                    {
                        xtype: 'textfield',
                        label: 'Division Code',
                        name: 'dv_id'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Department Code',
                        name: 'dp_id'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Equipment Standard',
                        name: 'eq_std'
                    },
                    {
                        xtype: 'selectfield',
                        label: 'Equipment Status',
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        options: [
                            {
                                "displayValue": "In service",
                                "objectValue": "in"
                            },
                            {
                                "displayValue": "Out of Service",
                                "objectValue": "out"
                            },
                            {
                                "displayValue": "In Repair",
                                "objectValue": "rep"
                            },
                            {
                                "displayValue": "In storage",
                                "objectValue": "stor"
                            },
                            {
                                "displayValue": "salvaged",
                                "objectValue": "salv"
                            },
                            {
                                "displayValue": "sold",
                                "objectValue": "sold"
                            }
                        ]
                    },
                    {
                        xtype: 'selectfield',
                        label: 'Marked for Deletion',
                        name: 'marked_for_deletion',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        options: [
                            {
                                displayValue: 'No',
                                objectValue: '0'
                            },
                            {
                                displayValue: 'Yes',
                                objectValue: '1'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'container',
                layout:
                {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },

                items: [
                    {
                        xtype: 'button',
                        iconCls: 'arrow_left',
                        iconMask: true,
                        itemId: 'previousButton',
                        style: 'margin-right:10px'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'arrow_right',
                        iconMask: true,
                        itemId: 'nextButton',
                        style: 'margin-left:10px'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            previousButton,
            nextButton,
            fieldSet,
            formItems;

        me.callParent(arguments);

        // Set title
        if (me.getIsCreateView()) {
            me.setTitle('Add Task');
        }

        // Generate form fields dynamically
        fieldSet = me.down('fieldset');
        formItems = Common.util.Ui.generateFormFields('eq_audit', 'taskEditPanel');

        // Only set the dynamic fields if formItems is populated.
        if (formItems && formItems.length > 0) {
            var hasSurveyId = me.formItemsContainsSurveyCode(formItems),
                orderedFormItems,
                mergedFormItems;

            if(!hasSurveyId) {
                formItems.push(me.getSurveyField());
            }
            orderedFormItems = me.setFormItemOrder(formItems);
            mergedFormItems = Ext.Array.merge(orderedFormItems, formItems);
            mergedFormItems = me.removeEmployeeField(mergedFormItems);
            fieldSet.setItems(mergedFormItems);
        }

        previousButton = me.query('#previousButton')[0];
        nextButton = me.query('#nextButton')[0];

        previousButton.on('tap', this.onPreviousTap, me);
        nextButton.on('tap', this.onNextTap, me);

        me.processEquipmentField();
        me.setReadOnlyFields();
    },

    /**
     * Checks if the survey_id field is included in the Fields to Survey list
     * @param formItems {Array} The list of Fields to Survey
     * @returns {boolean} True if the survey_id field exists in the Fields to Survey list.
     */
    formItemsContainsSurveyCode: function(formItems) {
        var ln = formItems.length,
            i;

        for(i = 0; i < ln; i++) {
            if(formItems[i].name === 'survey_id') {
                return true;
            }
        }
        return false;
    },

    setFormItemOrder: function (formItems) {
        var me = this,
            fieldOrder = this.getFieldOrder(),
            orderedFormItems = [],
            formItem;

        Ext.each(fieldOrder, function (field) {
            formItem = me.findFormItem(field, formItems);
            if (formItem !== null) {
                orderedFormItems.push(formItem);
            }
        }, me);

        return orderedFormItems;
    },

    findFormItem: function (fieldName, formItems) {
        var ln = formItems.length,
            i;

        for (i = 0; i < ln; i++) {
            if (formItems[i].name === fieldName) {
                return formItems[i];
            }
        }
        return null;
    },

    onPreviousTap: function () {
        this.fireEvent('previoustap', this);
    },

    onNextTap: function () {
        this.fireEvent('nexttap', this);
    },

    setReadOnlyFields: function() {
        var isCreateView = this.getIsCreateView(),
            eqPrompt = this.query('textfield[name=eq_id]'),
            previousButton = this.query('#previousButton'),
            nextButton = this.query('#nextButton'),
            surveyIdField = this.query('textfield[name=survey_id]'),
            displayPreviousNextButtons = this.getDisplayPreviousNextButtons();

        if (eqPrompt) {
            eqPrompt[0].setReadOnly(!isCreateView);
        }

        // Always set the survey id field to read only
        // if it is included in the fields to display
        if (surveyIdField && surveyIdField.length > 0) {
            surveyIdField[0].setReadOnly(true);
        }

        if(displayPreviousNextButtons) {
            previousButton[0].setHidden(isCreateView);
            nextButton[0].setHidden(isCreateView);
        } else {
            previousButton[0].setHidden(true);
            nextButton[0].setHidden(true);
        }
    },

    setAllFieldsReadOnly: function () {
        var fields = this.query('field');

        Ext.each(fields, function (field) {
            field.setReadOnly(true);
        });
    },

    setRecord: function (record) {
        this.callParent(arguments);
        if (record) {
            if (record.get('survey_complete')) {
                this.setAllFieldsReadOnly();
                this.setTitle('Completed Task');
            }
        }
    },

    updateDisplayPreviousNextButtons: function (newValue) {
        var previousButton = this.query('#previousButton')[0],
            nextButton = this.query('#nextButton')[0];

        if (Ext.isDefined(newValue)) {
            if(newValue.disablePrevious && newValue.disableNext) {
                previousButton.setHidden(true);
                nextButton.setHidden(true);
            } else {
                previousButton.setHidden(false);
                nextButton.setHidden(false);
                previousButton.setDisabled(newValue.disablePrevious);
                nextButton.setDisabled(newValue.disableNext);
            }
        }
    },

    /**
     * Forces equipment code input to be upper case
     */
    processEquipmentField: function() {
        var me = this,
            equipmentField = this.down('textfield[name=eq_id]');

        if(equipmentField) {
            equipmentField.on('keyup', function(field) {
                field.setValue(field.getValue().toUpperCase());
            }, me);
        }
    },

    /**
     * Removes the employee field if it is included in the Fields to Survey list
     * Returns the fieldItems array with the em_id field removed.
     */
    removeEmployeeField: function(fieldItems) {
        var newArray = [];
        Ext.each(fieldItems, function(item) {
            if(item.name !== 'em_id') {
                newArray.push(item);
            }
        });
        return newArray;
    }

});