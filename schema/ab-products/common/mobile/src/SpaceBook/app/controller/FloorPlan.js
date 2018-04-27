Ext.define('SpaceBook.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    requires: [ 'SpaceBook.model.RoomSurvey' ],

    config: {
        refs: {
            mainView: 'mainview',
            floorPlanSegmentedButton: 'floorPlanPanel > toolbar > segmentedbutton[itemId=planTypeButton]',
            floorPlanView: 'floorPlanPanel',
            floorPlanViewSelectButton: 'floorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            roomList: 'roomsurveylist',
            floorPlanContainer: 'floorPlanPanel > container[itemId=floorPlan]',
            floorPlanPanButton: 'floorPlanPanel panbutton',
            floorPlanZoomButton: 'floorPlanPanel zoombutton',
            startSurveyButton: 'toolbarbutton[action=startSurvey]'
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
            },

            mainView: {
                pop: 'onViewPopped'
            }
        },

        lastPushedRoomCode: '',

        activeSurveyMessage: 'There is not an active survey for this floor.<br>' +
                             'To initiate a survey, tap Survey, and then tap Start Survey'
    },

    onViewPopped: function () {
        this.setLastPushedRoomCode('');
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
            planTypeRecord,
            planType,
            surveyButton = this.getStartSurveyButton();

        if (actionId && isPressed) {
            planTypeRecord = button.getRecord();

            if (planTypeRecord) {
                planType = planTypeRecord.get('plan_type');
                floorPlanPanel.setPlanType(planType);
                this.loadDrawing(planType, record, floorPlanPanel);
            }

            if (surveyButton.getHidden() === false && planType !== '9 - SURVEY') {
                surveyButton.setHidden(true);
            }
        }
    },

    loadDrawing: function (planType, record, view) {
        var me = this,
            parameters = {},
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            svgDataFromServer = null;

        //parameters.pkeyValues is required
        parameters.pkeyValues = {
            'bl_id': blId,
            'fl_id': flId
        };



        // Set highlights for survey plan type
        if (planType === '9 - SURVEY') {
            SpaceBook.util.RoomHighlight.updateSurveyPlanHighlights(record);
        }

        me.getSvgDataFromFloorDrawings(blId, flId, planType, function (svgData) {
            if (svgData !== null) {
                svgDataFromServer = svgData;
            } else {
                parameters.plan_type = planType;
                // Check if the network connection is available before retrieving the SVG
                // We don't need to display a message
                if(Network.isDeviceAndServerConnected()) {
                    // TODO: Change to use getSVGFromServerAsync
                    svgDataFromServer = Common.util.Drawing.getSVGFromServer(parameters);
                }
            }
            me.doProcessSvgData(svgDataFromServer, view);
        }, me);
    },

    getSvgDataFromFloorDrawings: function(blId, flId, planType, onCompleted, scope) {
        var me = this,
            floorDrawingsStore = Ext.getStore('floorDrawings'),
            svgData = null;

        console.log('[DEBUG] Start getSvgDataFromFloorDrawings ' + new Date());

        floorDrawingsStore.clearFilter();
        floorDrawingsStore.filter('bl_id', blId);
        floorDrawingsStore.filter('fl_id', flId);
        floorDrawingsStore.filter('plan_type', planType);

        floorDrawingsStore.load( function (records) {
            if (records && records.length > 0) {
                svgData = records[0].get('svg_data');
            }
            if (typeof onCompleted === 'function') {
                console.log('[DEBUG] End getSvgDataFromFloorDrawings ' + new Date());
                onCompleted.call(scope || me, svgData);
            }
        });
    },

    doProcessSvgData: function (svgData, view) {
        var svgDivId = view.getSvgDivId();

        view.processSvg(view, svgDivId, svgData, [
            {
                'assetType': 'rm',
                'handler': view.onClickRoom,
                'scope': view
            }
        ]);
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        var buttonItemId = button.getItemId();

        if (isPressed) {
            switch (buttonItemId) {
                case 'roomList':
                    this.toggleFloorPlanDisplay(true);
                    break;
                case 'floorPlanView':
                    this.toggleFloorPlanDisplay(false);
                    break;
                default:
                    this.toggleFloorPlanDisplay(false);
                    break;
            }
        }
    },

    toggleFloorPlanDisplay: function(displayRoomList) {
        var planTypeButtons = this.getFloorPlanSegmentedButton(),
            floorPlanContainer = this.getFloorPlanContainer(),
            floorPlanView = this.getFloorPlanView(),
            roomList = this.getRoomList(),
            floorPlanPanButton = this.getFloorPlanPanButton(),
            floorPlanZoomButton = this.getFloorPlanZoomButton();

        if (displayRoomList) {
            floorPlanZoomButton.setHidden(true);
            floorPlanPanButton.setHidden(true);
        } else {
            if (floorPlanView.getIsDrawingLoaded()) {
                floorPlanPanButton.setHidden(false);
                floorPlanZoomButton.setHidden(false);
            } else {
                floorPlanPanButton.setHidden(true);
                floorPlanZoomButton.setHidden(true);
            }
        }
        planTypeButtons.setHidden(displayRoomList);
        floorPlanContainer.setHidden(displayRoomList);
        roomList.setHidden(!displayRoomList);
    },

    /**
     * Displays the Room Survey form.
     *
     * @param record
     *            {Model} Model instance containing the bl_id,fl_id and rm_id data of the selected room.
     */
    displayRoomSurvey: function (roomCodes) {
        var me = this,
            codes = roomCodes.split(';'),
            navView = me.getMainView(),
            roomSurveyView,
            surveyState = SurveyState.getSurveyState(),
            activeSurveyMessage = me.getActiveSurveyMessage(),
            floorPlanView = me.getFloorPlanView(),
            userAppAuthorization = SpaceBook.util.Ui.getUserAppAuthorization();

        // Check if the RoomSurvey view for this room has already been pushed.
        // This prevents the view from being pushed twice.
        if(roomCodes === me.getLastPushedRoomCode()) {
            return;
        }

        // Check if the user can access the survey features
        if(userAppAuthorization.survey === false && userAppAuthorization.surveyPost === false) {
            return;
        }

        // The timeout is required to prevent Android devices from firing the room tap event
        // when the message box is closed.
        if (!surveyState.isSurveyActive) {
            floorPlanView.suspendEvents();
            Ext.Msg.alert('Survey', activeSurveyMessage, function() {
                setTimeout(function() {
                    floorPlanView.resumeEvents();
                }, 1000);
            });
            return;
        }

        me.getRoomRecord(codes, function (roomRecord) {
            if (roomRecord === null) {
                Ext.Msg.alert('Survey','There is no Room data available for the selected Room.<br>Tap Add to Survey to update the Room data.');
            } else {
                roomSurveyView = Ext.create('SpaceBook.view.RoomSurvey');
                roomRecord.set('survey_id', surveyState.surveyId);
                roomSurveyView.setRecord(roomRecord);

                me.setLastPushedRoomCode(roomCodes);
                navView.push(roomSurveyView);
            }
        }, me);
    },

    // TODO: use storeGetAllRecords
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