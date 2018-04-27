/**
 * The EditBase class should be used as the base class for all Edit views that are used with the
 * Common.view.navigation.NavigationView class. The EditBase class provides configuration options model, storeId, and
 * isCreateView that allow the navigation framework to determine the action to take.
 * <p>
 *
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.view.navigation.EditBase', {
    extend: 'Common.form.FormPanel',

    isNavigationEdit: true,

    config: {
        /**
         * @cfg {String} model The name of the Model class that is associated with this view. The Model
         *      class is used when a new record is created for this view.
         * @accessor
         */
        model: null,

        /**
         * @cfg {String} storeId The id of the Store associated with this view. Used when the contents
         *      of this view is added to a List View
         * @accessor
         */
        storeId: null,

        /**
         * @cfg {Boolean} isCreateView When isCreateView is true a new record is created to store the
         *      view data.
         *      <p>
         *      When isCreateView is false, the view is updating an existing record. In this case the
         *      record is supplied by the list view that initiated this view.
         *
         * @accessor
         */
        isCreateView: false,

        padding: Ext.os.is.Phone ? '0.2em' : '1em'
    },

    initialize: function () {

        if (Ext.isEmpty(this.getModel)) {
            throw new Error(
                    "The name of the Model class associated with this view must be supplied in the model property");
        }

        if (Ext.isEmpty(this.getStoreId)) {
            throw new Error(
                    "The store id of the Store class associated with this view must be supplied in the storeId property");
        }
    },

    updateIsCreateView: function (newIsCreateView) {
        // If the form is displaying a new record get the model name and set the record property.
        if (newIsCreateView) {
            var modelName = this.getModel(), record = Ext.create(modelName);
            this.setRecord(record);
        }
    },

    /**
     * Sets the field labels to the values contained in the server side schema definition.
     * The function expects to find all fields contained in a single fieldset.
     * Override this function if the form has a different layout
     * @param tableName
     */
    setColumnHeadings: function (tableName) {
        var headings = TableDef.getTableHeadings(tableName, Ext.os.is.Phone),
            fields = this.query('field');

        // Loop through the fields object and retrieve the
        // tableDef heading for the field
        // Assign the heading to the field label.

        Ext.each(fields, function (field) {
            var fieldName = field.getName(),
                    fieldHeading = headings.get(fieldName);

            field.setLabel(fieldHeading);
        });
    },

    /**
     * Limits the height of the spin up and spin down buttons on the
     * spinner controls. By default, if the field has a multi-line label the spinner buttons are
     * stretched to fill the field height. This functions corrects this behavior.
     */
    limitSpinnerButtonHeight: function () {
        // Limit spinner height
        var spinnerControls = this.query('spinnerfield');
        Ext.each(spinnerControls, function(control) {
            control.spinUpButton.setHeight('2em');
            control.spinDownButton.setHeight('2em');
        });
    }
});