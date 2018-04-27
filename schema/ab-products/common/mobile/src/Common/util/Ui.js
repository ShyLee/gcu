Ext.define('Common.util.Ui', {

    requires: 'Common.util.TableDef',

	singleton : true,

	generateFormFields : function(tableName, viewName) {

        var tableDefObject = TableDef.getTableDefObject(tableName),
             fieldsToDisplay = this.getFieldsToDisplay(tableName),
             fieldDefs = this.getTableDefFieldsToDisplay(fieldsToDisplay, tableDefObject),
             items = [];



        Ext.each(fieldDefs, function(fieldDef) {
            items.push(this.generateFormField(fieldDef, viewName));
        }, this);

		return items;
	},

    getFieldsToDisplay: function (tableName) {
        var activityParameterCodes = this.getPreferenceCodesFromTableName(tableName),
            preferencesStore = Ext.getStore('appPreferencesStore'),
            fieldsToDisplayIndex,
            preferencesRecord;

        if(!preferencesStore.isLoaded()) {
            throw new Error('The App Preferences store is not loaded. Cannot retrieve preferences');
        }

        fieldsToDisplayIndex = preferencesStore.findBy(function (record) {
            return record.get('activity_id') === activityParameterCodes.activity_id &&
                    record.get('param_id') === activityParameterCodes.param_id;
        });

        if (fieldsToDisplayIndex === -1) {
            return null;
        }

        preferencesRecord = preferencesStore.getAt(fieldsToDisplayIndex);
        return preferencesRecord.get('param_value').split(';');
    },


    getPreferenceCodesFromTableName: function (tableName) {
        if (tableName === 'eq_audit') {
            return {
                activity_id: 'AbAssetManagement',
                param_id: 'EquipmentFieldsToSurvey'
            }
        } else {
            return null;
        }
    },

    getTableDefFieldsToDisplay: function (fieldsToDisplay, tableDefObject) {
        var tableDefFields  = [];

        if (tableDefObject === null) {
            return tableDefFields;
        }

        Ext.each(fieldsToDisplay, function (field) {
            Ext.each(tableDefObject.fieldDefs, function (fieldDef) {
                if (field === fieldDef.name) {
                    tableDefFields.push(fieldDef);
                    return false;
                }
            }, this);

        }, this);

        return tableDefFields;
    },

    generateFormField: function (fieldDef, viewName) {
        var fieldConfig = {},
            singleLineHeading = fieldDef.singleLineHeading;

        // TODO: Refactor getFieldType
        if (fieldDef.name === 'bl_id' || fieldDef.name === 'fl_id' || fieldDef.name === 'rm_id' ||
                fieldDef.name === 'dv_id' || fieldDef.name === 'dp_id' ||
                fieldDef.name === 'eq_std' || fieldDef.name === 'site_id') {

            fieldConfig.xtype = 'promptfield';
            fieldConfig.panelName = viewName;

        } else if (fieldDef.enumObjectToDisplay !== null ) {
            fieldConfig.xtype = 'selectfield';
            fieldConfig.valueField = 'objectValue';
            fieldConfig.displayField = 'displayValue';
            fieldConfig.options = fieldDef.enumObjectToDisplay;
        } else {
            fieldConfig.xtype = 'textfield';
        }

        fieldConfig.name = fieldDef.name;
        fieldConfig.label = (singleLineHeading) ? singleLineHeading : TableDef.convertMulitLineToSingleLineHeading(fieldDef.multiLineHeadings, Ext.os.is.Phone);

        return fieldConfig;
    },
    
    convertMultiLineHeading: function (multiLineHeading) {
        var label = '';
        Ext.each(multiLineHeading, function (line) {
            label = label + line + ' ';
        });
        return Ext.String.trim(label);
    },

    createViewIfNotExists : function(selector, className) {
        var view = Ext.ComponentQuery.query(selector)[0];
        if (!Ext.isDefined(view)) {
            view = Ext.create(className);
        }
        return view;
    },

    /**
     * Returns the enumerated list display value
     * @param tableName {String} The table name of the table containing the enumerated list field.
     * @param fieldName {String} The field name of the enumerated list field.
     * @param enumeratedValue {String} The enumerated value
     * @returns {String} The enumerated display value or an empty string if the enumerated value cannot
     * be decoded.
     */
    getEnumeratedDisplayValue: function(tableName, fieldName, enumeratedValue) {
        var enumList = TableDef.getEnumeratedList(tableName, fieldName),
            i;

        if (enumList === '') {
            return '';
        }

        for (i = 0; i < enumList.length; i++) {
            if(enumList[i].objectValue === enumeratedValue) {
                return enumList[i].displayValue;
            }
        }
        return '';
    }

});
