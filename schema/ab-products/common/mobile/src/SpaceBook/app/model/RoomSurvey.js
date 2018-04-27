Ext.define('SpaceBook.model.RoomSurvey', {
    extend: 'Common.model.ModelBase',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
                type: 'string'
            },
            {
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'prorate',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'survey_id',
                type: 'string'
            },
            {
                name: 'rm_use',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'transfer_status',
                type: 'string'
            },
            {
                name: 'surveyEdit',
                type: 'boolean',
                isSyncField : false
            }
        ]
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
            this.data.surveyEdit = true;
        }
        this.notifyStores('afterEdit', modifiedFieldNames, modified);
    }

});