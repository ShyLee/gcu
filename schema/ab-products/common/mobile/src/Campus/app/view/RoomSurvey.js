Ext.define('Campus.view.RoomSurvey', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'roomSurveyPanel',

    config: {
        model: 'Campus.model.RoomSurvey',
        storeId: 'roomSurveyStore',

        items: [
            {
                xtype: 'fieldset',
                title: 'Survey Room',
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Survey Code',
                        name: 'survey_id',
                        readOnly: true
                    },
                    {
                        xtype: 'textfield',
                        label: 'Building Code',
                        name: 'bl_id',
                        readOnly: true
                    },
                    {
                        xtype: 'textfield',
                        label: 'Floor Code',
                        name: 'fl_id',
                        readOnly: true
                    },
                    {
                        xtype: 'textfield',
                        label: 'Room Code',
                        name: 'rm_id',
                        readOnly: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: 'Room Information',
                items: [
                    {
                        xtype: 'promptfield',
                        label: 'Room Category',
                        name: 'rm_cat',
                        panelName: 'roomSurveyPanel'
                    },
                    {
                        xtype: 'promptfield',
                        label: 'Room Type',
                        name: 'rm_type',
                        panelName: 'roomSurveyPanel'
                    },
                    {
                        xtype: 'promptfield',
                        label: 'Room Standard',
                        name: 'rm_std',
                        panelName: 'roomSurveyPanel'
                    },
                    {
                        xtype: 'selectfield',
                        store: 'roomUsesStore',
                        valueField: 'rm_use',
                        displayField: 'description',
                        label: 'Room Use',
                        name: 'rm_use'
                    },
                    {
                        xtype: 'textfield',
                        label: 'Room Name',
                        name: 'name'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: 'Organizational Information',
                items: [
                    {
                        xtype: 'promptfield',
                        name: 'dv_id',
                        label: 'Division',
                        panelName: 'roomSurveyPanel'
                    },
                    {
                        xtype: 'promptfield',
                        label: 'Department',
                        name: 'dp_id',
                        panelName: 'roomSurveyPanel'
                    }
                ]
            }
        ]
    }

});