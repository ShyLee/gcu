/**
 * Work Request Create and Update View.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Maintenance.view.WorkRequestEdit', {
    extend: 'Maintenance.view.WorkRequestEditBase',
    requires: 'Common.control.Select',

    xtype: 'workRequestPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        editTitle: LocaleManager.getLocalizedString('Update Work Request',
                'Maintenance.view.WorkRequestEdit'),
        addTitle: LocaleManager.getLocalizedString('Create Work Request',
                'Maintenance.view.WorkRequestEdit'),

        /**
         * @cfg {String} requestType Indicates if this view is being used to create a My Work or a My
         *      Request Work Order. Values are MyWork and MyRequest
         */
        requestType: 'MyWork',

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: Ext.os.is.Tablet || Ext.os.is.Desktop,
                dateLabel: LocaleManager.getLocalizedString('Requested',
                        'Maintenance.view.WorkRequestEdit')
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        allowToggle: false,
                        defaults: {
                            width: Ext.os.is.Phone ? '4em' : '6em'
                        },
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Labor',
                                        'Maintenance.view.WorkRequestEdit'),
                                actionId: 'LABOR',
                                itemId: 'laborButton'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Parts',
                                        'Maintenance.view.WorkRequestEdit'),
                                actionId: 'PARTS',
                                itemId: 'partsButton'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Costs',
                                        'Maintenance.view.WorkRequestEdit'),
                                actionId: 'COSTS',
                                itemId: 'costsButton'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Documents',
                                        'Maintenance.view.WorkRequestEdit'),
                                actionId: 'DOCUMENTS',
                                itemId: 'documentsButton'
                            }
                        ]
                    }
                ]
            },

            {
                xtype: 'fieldset',
                padding: 2,
                defaults: {
                    labelWidth: Ext.os.is.Phone ? 100 : 180
                },
                items: [
                    {
                        xtype: 'textfield',
                        name: 'requestor',
                        readOnly: true,
                        label: 'Requested By'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'site_id'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'date_requested'
                    },
                    {
                        xtype: 'promptfield',
                        name: 'bl_id',
                        label: 'Building',
                        panelName: 'workRequestPanel'
                    },
                    {
                        xtype: 'promptfield',
                        name: 'fl_id',
                        label: 'Floor',
                        panelName: 'workRequestPanel'
                    },
                    {
                        xtype: 'promptfield',
                        name: 'rm_id',
                        label: 'Room',
                        panelName: 'workRequestPanel'
                    },
                    {
                        xtype: 'textfield',
                        name: 'location',
                        label: 'Problem Location'
                    },
                    {
                        xtype: 'promptfield',
                        name: 'prob_type',
                        label: 'Problem Type'
                    },
                    {
                        xtype: 'selectlistfield',
                        label: 'Cause Type',
                        name: 'cause_type',
                        valueField: 'cause_type',
                        displayField: 'description',
                        store: 'causesStore',
                        value: ''
                    },
                    {
                        xtype: 'selectlistfield',
                        label: 'Repair Type',
                        name: 'repair_type',
                        valueField: 'repair_type',
                        displayField: 'description',
                        store: 'repairTypesStore'
                    },
                    {
                        xtype: 'textfield',
                        hidden: 'true',
                        name: 'pmp_id',
                        label: 'PM Procedure'
                    },
                    {
                        xtype: 'promptfield',
                        name: 'eq_id',
                        label: 'Equipment Code',
                        panelName: 'workRequestPanel'
                    },
                    {
                        xtype: 'datepickerfield',
                        hidden: 'true',
                        name: 'date_assigned',
                        label: 'Assigned Date',
                        readOnly: true
                    },
                    {
                        xtype: 'datepickerfield',
                        hidden: 'true',
                        name: 'date_est_completion',
                        label: 'Scheduled Date',
                        readOnly: true
                    },
                    {
                        xtype: 'textpromptfield',
                        label: 'Description',
                        name: 'description'
                    },
                    {
                        xtype: 'textpromptfield',
                        name: 'cf_notes',
                        label: 'Craftsperson Notes'
                    },
                    {
                        xtype: 'selectfield',
                        readOnly: true,
                        name: 'status',
                        label: 'Status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values
                        // are provided for the case
                        // where the
                        // TableDef object is not
                        // available.
                        options: [
                            {
                                displayValue: 'Requested',
                                objectValue: 'R'
                            },
                            {
                                displayValue: 'Reviewed but On Hold',
                                objectValue: 'Rev'
                            },
                            {
                                displayValue: 'Rejected',
                                objectValue: 'Rej'
                            },
                            {
                                displayValue: 'Approved',
                                objectValue: 'A'
                            },
                            {
                                displayValue: 'Assigned to Work Order',
                                objectValue: 'AA'
                            },
                            {
                                displayValue: 'Issued and In Process',
                                objectValue: 'I'
                            },
                            {
                                displayValue: 'On Hold for Parts',
                                objectValue: 'HP'
                            },
                            {
                                displayValue: 'On Hold for Access',
                                objectValue: 'HA'
                            },
                            {
                                displayValue: 'On Hold for Labor',
                                objectValue: 'HL'
                            },
                            {
                                displayValue: 'Stopped',
                                objectValue: 'S'
                            },
                            {
                                displayValue: 'Cancelled',
                                objectValue: 'Can'
                            },
                            {
                                displayValue: 'Completed',
                                objectValue: 'Com'
                            },
                            {
                                displayValue: 'Closed',
                                objectValue: 'Clo'
                            }
                        ]
                    }
                ]
            },
                // TODO: Photo containers should be implemented as stand alone controls.
            {
                xytpe: 'container',
                layout: 'hbox',
                style: 'height:120px;padding-left:180px',
                items: [
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        itemId: 'photo1',
                        style: 'padding:0px 20px 0px 20px',
                        hidden: true,
                        items: [
                            {
                                xtype: 'container',
                                html: 'Photo 1',
                                style: 'font-size:0.8em;font-weight:bold;padding-bottom:4px'
                            },
                            {
                                xtype: 'image',
                                height: 80,
                                width: 80,
                                name: 'doc1_contents'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        itemId: 'photo2',
                        style: 'padding:0px 20px 0px 20px',
                        hidden: true,
                        items: [
                            {
                                xtype: 'container',
                                html: 'Photo 2',
                                style: 'font-size:0.8em;font-weight:bold;padding-bottom:4px'
                            },
                            {
                                xtype: 'image',
                                height: 80,
                                width: 80,
                                name: 'doc2_contents'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        itemId: 'photo3',
                        style: 'padding:0px 20px 0px 20px',
                        hidden: true,
                        items: [
                            {
                                xtype: 'container',
                                html: 'Photo 3',
                                style: 'font-size:0.8em;font-weight:bold;padding-bottom:4px'
                            },
                            {
                                xtype: 'image',
                                height: 80,
                                width: 80,
                                name: 'doc3_contents'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        itemId: 'photo4',
                        style: 'padding:0px 20px 0px 20px',
                        hidden: true,
                        items: [
                            {
                                xtype: 'container',
                                html: 'Photo 4',
                                style: 'font-size:0.8em;font-weight:bold;padding-bottom:4px'
                            },
                            {
                                xtype: 'image',
                                height: 80,
                                width: 80,
                                name: 'doc4_contents'
                            }
                        ]
                    }
                ]
            }

        ]
    },

    initialize: function () {
        // Hide the segmented button if we are creating a work
        // request
        var me = this,
            isCreateView = this.getIsCreateView(),
            statusEnumList, dateRequestedField, problemTypeField;

        me.callParent();

        // Set the Date Requested value in the form header
        dateRequestedField = me.query('hiddenfield[name=date_requested]')[0];
        dateRequestedField.on('change', me.onDateRequestedChanged, me);

        problemTypeField = me.query('field[name=prob_type]')[0];
        problemTypeField.on('change', me.onProblemTypeChanged, me);

        statusEnumList = TableDef.getEnumeratedList('wr_sync', 'status');
        if (statusEnumList && statusEnumList.length > 0) {
            this.query('selectfield[name=status]')[0].setOptions(statusEnumList);
        }

        me.setFormView();
        me.setReadOnlyFields(isCreateView);
        me.setColumnHeadings('wr_sync');
    },

    onDateRequestedChanged: function (field, newValue, oldValue) {
        var formheader = this.down('formheader');
        formheader.setDateValue(newValue);
    },

    onProblemTypeChanged: function (field, newValue, oldValue) {
        if (newValue === 'PREVENTIVE MAINT') {
            this.setPmFormView();
        }
    },

    setFormView: function () {
        var isCreateView = this.getIsCreateView(),
                problemType = this.getValues().prob_type;

        if (isCreateView) {
            this.setCreateView();
        }

        if (problemType === 'PREVENTIVE MAINT' && !isCreateView) {
            this.setPmFormView();
        }
    },

    setPmFormView: function () {
        var pmpField = this.query('[name=pmp_id]')[0], dateAssignedField = this
                .query('[name=date_assigned]')[0], dateEstCompletionField = this
                .query('[name=date_est_completion]')[0];

        pmpField.setHidden(false);
        dateAssignedField.setHidden(false);
        dateEstCompletionField.setHidden(false);
    },

    setCreateView: function () {
        var me = this,
            userProfile,
            record = me.getRecord(),
            statusFields = me.query('[name=status]'),
            craftsPersonFields = me.query('[name=cf_notes]'),
            segmentedButton = me.query('toolbar > segmentedbutton'),
            causeTypeField = me.down('selectfield[name=cause_type]'),
            repairTypeField = me.down('selectfield[name=repair_type]');

        // Get the user profile values for the current user
        userProfile = Common.util.UserProfile.getUserProfile();

        // Get the cached employee id from the ConfigFileManager
        userProfile.requestor = ConfigFileManager.employeeId;

        this.setValues(userProfile);

        // set the record data
        record.setData(userProfile);

        if (statusFields) {
            statusFields[0].setHidden(true);
        }
        if (craftsPersonFields) {
            craftsPersonFields[0].setHidden(true);
        }

        // Hide the repair_type and cause_type fields.
        causeTypeField.setHidden(true);
        repairTypeField.setHidden(true);

        // Hide the segmented button if this is a create view
        if (segmentedButton) {
            segmentedButton[0].setHidden(true);
        }
    },

    setReadOnlyFields: function (isCreateView) {

        var description = this.query('field[name=description]')[0],
            building = this.query('field[name=bl_id]')[0],
            problemType = this.query('field[name=prob_type]')[0],
            isReadOnly = !isCreateView;

        description.setReadOnly(isReadOnly);
        building.setReadOnly(isReadOnly);
        problemType.setReadOnly(isReadOnly);
    },

    applyWorkRequestId: function (config) {
        var formHeader = this.down('formheader');

        formHeader.setWorkRequestId(config);
        return config;
    },

    applyRequestType: function (config) {
        var record = this.getRecord();
        if (record) {
            record.set('request_type', config === 'MyWork' ? 0 : 1);
        }
        return config;
    },

    /**
     * Displays the photo images when the form is in create mode
     */
    applyPhotoData: function () {
        var record = this.getRecord(),
            imageControl,
            photoData,
            photoContainer,
            documentFieldName,
            i;


        // Find all of the images in the current record and display them
        if (record) {
            for (i = 1;i < 5; i++) {
                documentFieldName = this.getDocumentFieldName(i);
                photoData = record.get(documentFieldName);
                if(photoData) {
                    imageControl = this.down('image[name=' + documentFieldName + ']');
                    imageControl.setSrc('data:image/jpg;base64,' + record.get(documentFieldName));
                    photoContainer = this.down('container[itemId=photo' + i.toString() + ']');
                    photoContainer.setHidden(false);
                }
            }
        }
    },

    getDocumentFieldName: function(docId) {
        return 'doc' + docId.toString() + '_contents';
    }

});