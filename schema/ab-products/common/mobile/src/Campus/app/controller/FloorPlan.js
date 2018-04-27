Ext.define('Campus.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    requires: [ 'Campus.model.RoomSurvey' ],

    config: {
        refs: {
            mainView: 'mainview',
            floorPlanSegmentedButton: 'floorPlanPanel > toolbar > segmentedbutton[itemId=planTypeButton]',
            floorPlanView: 'floorPlanPanel',
            floorPlanViewSelectButton: 'floorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            roomList: 'roomsurveylist',
            floorPlanContainer: 'floorPlanPanel > container[itemId=floorPlan]'
        },
        control: {
            floorPlanSegmentedButton: {
                toggle: 'onFloorPlanSegmentedButtonToggled'
            },
            floorPlanViewSelectButton: {
                toggle: 'onFloorPlanViewButtonToggled'
            },
            floorPlanView: {
                roomsurveytapped: 'displayRoomSurvey',
                roomtap: 'displayRoomSurvey'
            },
            roomList: {
                itemsingletap: function (list, index, target, record) {
                    // Build the room codes parameter
                    var data = record.getData(),
                        roomCodes = data.bl_id + ';' + data.fl_id + ';' + data.rm_id;
                    this.displayRoomSurvey(roomCodes);
                }
            }
        }
    },

    /**
     * Handles the toggle event of the Floor Plan segmented button
     *
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onFloorPlanSegmentedButtonToggled: function (segmentedButton, button, isPressed) {

        var actionId = button.config.actionId || button.actionId,
            floorPlanPanel = this.getFloorPlanView(),
            record = floorPlanPanel.getRecord(),
            planTypeRecord;

        if (actionId && isPressed) {
            planTypeRecord = button.getRecord();

            if (planTypeRecord) {
                var planType = planTypeRecord.get('plan_type');
                floorPlanPanel.setPlanType(planType);
                //floorPlanPanel.loadDrawing();
                this.loadDrawing(planType, record, floorPlanPanel);
            }
        }
    },

    loadDrawing: function (planType, record, view) {
        var me = this,
                parameters = {},
                blId = record.get('bl_id'),
                flId = record.get('fl_id'),
                svgDataFromServer;

        //parameters.pkeyValues is required
        parameters.pkeyValues = {
            'bl_id': blId,
            'fl_id': flId
        };
        
        parameters.highlightParameters = [ {
        	'view_file' : "ab-sp-space-book-rmxrmstd.axvw",
            'hs_ds' : "ds_ab-sp-space-book-rmxrmstd_rmHighlight",
            'label_ds' : 'ds_ab-sp-space-book-rmxrmstd_rmLabel',
            'label_clr' : 'gray',
            'label_ht' : '0.50'
        }, {
            'view_file' : "ab-sp-space-book-eqxeqstd.axvw",
            'hs_ds' : "ds_ab-sp-space-book-exeqstd_eqxeqstdHighlight",
            'label_ds' : 'ds_ab-sp-space-book-eqxeqstd_eqxeqstdLabel'
        } ];

        me.getSvgDataFromFloorDrawings(blId, flId, planType, function (svgData) {
            if (svgData !== null) {
                me.doProcessSvgData(svgData, view);
            } else {
                //parameters.plan_type = planType;
                svgDataFromServer = Common.util.Drawing.getSVGFromServer(parameters);
                if (svgDataFromServer !== null) {
                    me.doProcessSvgData(svgDataFromServer, view );
                }
            }
        }, me);
    },

    getSvgDataFromFloorDrawings: function(blId, flId, planType, onCompleted, scope) {
        var me = this,
            floorDrawingsStore = Ext.getStore('floorDrawings'),
            svgData = null;

        floorDrawingsStore.clearFilter();
        floorDrawingsStore.filter('bl_id', blId);
        floorDrawingsStore.filter('fl_id', flId);
        floorDrawingsStore.filter('plan_type', planType);

        floorDrawingsStore.load( function (records) {
            if (records && records.length > 0) {
                svgData = records[0].get('svg_data');
            }
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me, svgData);
            }
        });
    },

    updateSurveyPlanHighlights: function (record) {
        var me = this,
                //record = this.getRecord(),
                blId = record.get('bl_id'),
                flId = record.get('fl_id');

        me.getModifiedRoomCodesForFloor(blId, flId, function (roomCodes) {
            console.log(roomCodes);
            Ext.each(roomCodes, function(code) {
                Ext.get(code).setStyle('fill', '#ffcc66');
            });
        }, me);
    },

    // TODO: Create store getAllRecords
    getModifiedRoomCodesForFloor: function (blId, flId, onCompleted, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            currentFilters = roomSurveyStore.getFilters(),
            roomCodes = [];

        roomSurveyStore.clearFilter();
        roomSurveyStore.filter('bl_id', blId);
        roomSurveyStore.filter('fl_id', flId);
        roomSurveyStore.filter('mob_is_changed', 1);
        roomSurveyStore.setDisablePaging(true);
        roomSurveyStore.load(function (records) {
            Ext.each(records, function (record) {
                roomCodes.push(record.get('bl_id') + ';' + record.get('fl_id') + ';' + record.get('rm_id'));
            });
            roomSurveyStore.setDisablePaging(false);
            roomSurveyStore.clearFilter();
            roomSurveyStore.setFilters(currentFilters);
            roomSurveyStore.loadPage(1, function () {
                if (typeof onCompleted === 'function') {
                    onCompleted.call( scope || me, roomCodes);
                }
            });
        });
    },

    doProcessSvgData: function (svgData, view) {
        var svgDivId = view.getSvgDivId();
        view.processSvg(view, svgDivId, svgData, [
            {
                'assetType': 'rm',
                'handler': view.onClickRoom
            }
        ]);
        view.handleAssetDrag("eq", "use");
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        var buttonItemId = button.getItemId();

        if (isPressed) {
            switch (buttonItemId) {
                case 'roomList':
                    this.displayRoomList();
                    break;
                case 'floorPlanView':
                    this.displayFloorPlan();
                    break;
                default:
                    this.displayFloorPlan();
                    break;
            }
        }
    },

    // TODO: displayFloorPlan and displayRoomList are the same
    displayFloorPlan: function () {
        // Hide floor plan view elements
        var planTypeButtons = this.getFloorPlanSegmentedButton(),
            floorPlan = this.getFloorPlanContainer(),
            roomList = this.getRoomList();

        planTypeButtons.setHidden(false);
        floorPlan.setHidden(false);
        roomList.setHidden(true);
    },

    displayRoomList: function () {
        // Hide floor plan view elements
        var planTypeButtons = this.getFloorPlanSegmentedButton(),
            floorPlan = this.getFloorPlanContainer(),
            roomList = this.getRoomList();

        planTypeButtons.setHidden(true);
        floorPlan.setHidden(true);
        roomList.setHidden(false);
    },

    /**
     * Displays the Room Survey form.
     *
     * @param record
     *            {Model} Model instance containing the bl_id,fl_id and rm_id data of the selected room.
     */
    displayRoomSurvey: function (roomCodes) {
        // Add Room Survey form to the Navigation View.

        // Check if we are in survey mode before displaying the form
        var me = this,
            codes = roomCodes.split(';'),
            navView = this.getMainView(),
            roomSurveyView,
            surveyState = SurveyState.getSurveyState();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert('Survey',
                    'There is not an Active Survey.<br>Tap Start Survey to initiate a new survey.');
            return;
        }

        me.getRoomRecord(codes, function (roomRecord) {
            if (roomRecord === null) {
                Ext.Msg.alert('Survey','There is no Room data available for the selected Room.<br>Tap Sync Survey to download the Room data.');
            } else {
                roomSurveyView = Ext.create('Campus.view.RoomSurvey');
                roomRecord.set('survey_id', surveyState.surveyId);
                roomSurveyView.setRecord(roomRecord);
                navView.push(roomSurveyView);
            }
        }, me);
    },

    getRoomRecord: function(codes, onCompleted, scope) {
        var me = this,
            roomStore = Ext.getStore('roomSurveyStore'),
            currentFilters = roomStore.getFilters(),
            surveyId = SurveyState.getSurveyState().surveyId,
            roomRecord = null;

        roomStore.clearFilter();
        roomStore.setDisablePaging(true);
        roomStore.filter('survey_id', surveyId);
        roomStore.filter('bl_id', codes[0]);
        roomStore.filter('fl_id', codes[1]);
        roomStore.filter('rm_id', codes[2]);
        roomStore.load(function (records) {
            if (records && records.length > 0) {
                roomRecord = records[0];
            }
            if (typeof onCompleted === 'function') {
                onCompleted.call( scope || me, roomRecord);
            }
            roomStore.setDisablePaging(false);
            roomStore.clearFilter();
            roomStore.setFilters(currentFilters);
            roomStore.loadPage(1);
        });
    }
});