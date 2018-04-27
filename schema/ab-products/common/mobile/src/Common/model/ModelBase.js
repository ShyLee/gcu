/**
 * Provides support for custom data types in models. All model classes should inherit from this class.
 *
 * @author Jeff Martin
 * @author Valery Tydykov
 * @since 21.1
 */

Ext.define('Common.model.ModelBase', {
    extend: 'Ext.data.Model',

    requires: [ 'Common.type.TypeManager',
                 'Common.type.CustomType',
                 'Common.data.Field' ],

    disableEditHandling: false,

    config: {
        customValidations: []
    },

    /**
     * Overrides Ext.data.Model#get method.
     * <p>
     * Returns value of the field.
     * <p>
     * Handles fields of custom data types and of regular data types.
     *
     * @param {String}
     *            fieldName The field to fetch the value for.
     * @return {Object} The value.
     */
    get: function (fieldName) {
        if (this.data[fieldName] instanceof Common.type.CustomType) {
            return this.data[fieldName].getValue();
        } else {
            return this.data[fieldName];
        }
    },

    /**
     * Sets the Changed on Mobile field to true if any of the values in the record have been modified
     */
    setChangedOnMobile: function () {
        if (this.isRecordModified() && this.fields.containsKey('mob_is_changed')) {
            this.set('mob_is_changed', 1);
        }

        // If this is a new record set the mob_locked_by field.
        if (this.phantom) {
            if (this.fields.containsKey('mob_locked_by')) {
                this.set('mob_locked_by', ConfigFileManager.username);
            }
        }
    },

    /**
     * Override the afterEdit function
     * We update the mob_is_changed and mob_locked_by fields when a model record is edited
     * The update of the mobile framework fields is disabled during the synchronization process.
     * @override
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * `afterEdit` method is called.
     * @param {String[]} modifiedFieldNames Array of field names changed during edit.
     */
    afterEdit : function(modifiedFieldNames, modified) {
        var disableEditHandling = this.disableEditHandling;
        if(!disableEditHandling) {
            // setChangedOnMobile
            if (modifiedFieldNames.length === 1 && !this.containsMobField(modifiedFieldNames)) {
                this.setChangedOnMobile();
            }
        }
        this.notifyStores('afterEdit', modifiedFieldNames, modified);
    },

    /**
     * Returns true if the fieldNames array contains any of the 'mob' framework fields.
     * @param fieldNames {Array} Array of modified field names
     * @returns {Boolean} true if the fieldNames array contains any of the mobile
     *                    framework fields.
     */
    containsMobField: function(fieldNames) {
        return Ext.Array.contains(fieldNames, 'mob_is_changed') ||
               Ext.Array.contains(fieldNames, 'mob_locked_by') ||
               Ext.Array.contains(fieldNames, 'mob_pending_action');

    },

    /**
     * Returns true if any of the record values have been modified.
     *
     * @private
     * @return {Boolean}
     */
    isRecordModified: function () {
        var field;
        for (field in this.modified) {
            if (this.modified.hasOwnProperty(field)) {
                // Compare the original value in the modified
                // array to the current model value
                if (this.get(field) !== this.getModifiedValue(this.modified[field])) {
                    return true;
                }
            }
        }
        return false;
    },

    getModifiedValue: function (modifiedItem) {
        if (modifiedItem instanceof Common.type.CustomType) {
            return modifiedItem.getValue();
        } else {
            return modifiedItem;
        }
    },

    /**
     * @override
     */
    validate: function () {
        var me = this,
            errors = this.callParent(),
            customValidations = this.getCustomValidations(),
            validators = Ext.data.Validations;

        Ext.each(customValidations, function (validation) {
            var type = validation.type,
                fields = validation.fields,
                fieldValues = [], valid;

            Ext.each(fields, function (field) {
                fieldValues.push(me.get(field));
            }, me);

            valid = validators[type](validation, fieldValues);

            if (!valid) {
                // Add an error for each field
                Ext.each(fields, function (field) {
                    errors.add(Ext.create('Ext.data.Error', {
                        field: field,
                        message: validation.message
                    }));
                });
            }
        }, me);
        return errors;
    },

    updateFields: function (fields) {
        var ln = fields.length,
            me = this,
            prototype = me.self.prototype,
            idProperty = me.getIdProperty(),
            idField, fieldsCollection, field, i;

        /**
         * @property {Ext.util.MixedCollection} fields The fields defined on this model.
         */
        fieldsCollection = me._fields = me.fields = new Ext.util.Collection(prototype.getFieldName);

        for (i = 0; i < ln; i++) {
            field = fields[i];
            if (!field.isField) {
                field = new Common.data.Field(fields[i]);
            }
            fieldsCollection.add(field);
        }

        // We want every Model to have an id property field
        idField = fieldsCollection.get(idProperty);
        if (!idField) {
            fieldsCollection.add(new Common.data.Field(idProperty));
        } else {
            idField.setType('auto');
        }

        fieldsCollection.addSorter(prototype.sortConvertFields);
    }

});
