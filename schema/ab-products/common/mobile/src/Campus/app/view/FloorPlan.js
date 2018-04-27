// TODO: This should be a container with a floor plan view and a list view
Ext.define('Campus.view.FloorPlan', {
    extend: 'Common.controls.DrawingControl',

    requires: ['Common.control.PanButton',
               'Common.control.ZoomButton'],


    xtype: 'floorPlanPanel',

    config: {
        layout: 'vbox',

        title: 'Survey',

        surveyId: null,

        svgDivId: 'floorSvgDiv',

        /**
         * @cfg record {Model} The floor model for the displayed floor plan
         */
        record: null,

        planType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: 'Start Survey',
                action: 'startSurvey',
                displayOn: 'all',
                align: 'right',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                text: 'Add to Survey',
                action: 'addToSurvey',
                displayOn: 'all',
                align: 'right',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                text: 'Sync and Post Changes',
                action: 'syncAndPost',
                displayOn: 'all',
                align: 'right',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                text: 'Sync Survey',
                action: 'syncSurvey',
                displayOn: 'all',
                align: 'right',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                text: 'Complete Survey',
                action: 'completeSurvey',
                displayOn: 'all',
                align: 'right',
                hidden: true
            }
        ],

        items: [
            {
                xtype: 'toolbar',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        itemId: 'planTypeButton',
                    }
                ],
                hidden: true
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        items: [
                            {
                                text: 'Room List',
                                itemId: 'roomList'
                            },
                            {
                                text: 'Floor Plan',
                                itemId: 'floorPlanView'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'roomsurveylist',
                flex: 1,
                hidden: true
            },
            {
                xtype: 'container',
                itemId: 'floorPlan',
                margin: 20
            }
        ]
    },

    initialize: function () {

        var me = this,
            floorPlanContainer = this.down('container[itemId=floorPlan]');

        me.callParent(arguments);
        floorPlanContainer.setHtml('<div id=' + this.getSvgDivId() + ' height="100%" width="100%"></div>');

        // Set up the Plan Type segmented buttons
        var planTypeButtons = Campus.util.Ui.getPlanTypeButtons();
        this.query('#planTypeButton')[0].setItems(planTypeButtons);
        this.setSurveyButtonVisibility();

    },

    // TODO: This only works the first time the view is instantiated because we are setting
    // the config property of the toolbar button only.
    setSurveyButtonVisibility: function () {
        var surveyState = SurveyState.getSurveyState(), surveyButtons = this.getToolBarButtons();

        // Depends on the order that the buttons are defined in the
        // configuration. This will break if the button order is modified.
        if (surveyState.isSurveyActive) {
            surveyButtons[0].hidden = true;
            surveyButtons[1].hidden = true;
            surveyButtons[2].hidden = false;
            surveyButtons[3].hidden = false;
            surveyButtons[4].hidden = false;
        }
    },

    // TODO: What is this used for?
    onRoomSurveyTapped: function () {
        var record = this.getRecord();
        this.fireEvent('roomsurveytapped', record, this);
    },

    onClickRoom: function (locationCodes) {
        // Get a reference to this view. It would be better if we could get
        // the event handler called with the view scope.
        var floorPlanPanel = Ext.ComponentQuery.query('floorPlanPanel')[0];
        floorPlanPanel.fireEvent('roomtap', locationCodes, floorPlanPanel);
    }
});
