Ext.define('SpaceBook.controller.Survey', {

    extend: 'Ext.app.Controller',

    xtype: 'surveyController',

    requires: [ 'Common.util.ConfigFileManager',
                'Common.util.SynchronizationManager',
                'Common.service.workflow.Workflow'],

    userAuthorization:  {
        survey: false,
        surveyPost: false
    },

    config: {
        refs: {
            mainView: 'mainview',
            startSurveyView: 'startSurveyPanel',
            floorPlanView: 'floorPlanPanel',
            startSurveyButton: 'toolbarbutton[action=startSurvey]',
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            completeSurveyButton: 'toolbarbutton[action=completeSurvey]',
            addToSurveyButton: 'toolbarbutton[action=addToSurvey]',
            syncAndPostButton: 'toolbarbutton[action=syncAndPost]',
            progressBarPanel : 'progressbarpanel',
            planTypeSegmentedButton: 'floorPlanPanel > toolbar > segmentedbutton[itemId=planTypeButton]'
        },
        control: {
            'button[action=surveyButtonTapped]': {
                tap: 'onStartSurveyMode'
            },
            startSurveyView: {
                surveybuttontap: 'onStartSpaceSurvey'
            },
            startSurveyButton: {
                tap: 'displayStartSurvey'
            },
            syncSurveyButton: {
                tap: 'onSyncRoomSurvey'
            },
            completeSurveyButton: {
                tap: 'completeSurvey'
            },
            addToSurveyButton: {
                tap: 'addToSurvey'
            },
            syncAndPostButton: {
                tap: 'syncAndPostSurvey'
            },
            mainView: {
                pop: 'onNavigationViewPopped',
                push: 'onNavigationViewPushed'
            },
            floorPlanView: {
                show: 'onShowFloorPlanView'
            }
        },

        completeSurveyMessage: ['This action will complete the survey and submit changes to your supervisor for review. ',
                          'Even if you have made no changes, you can complete the survey to exit ',
                          "the app's survey mode.<br>Proceed?"].join(''),

        closeSurveyMessage: ["This action uploads this survey's data and updates the server-side inventory database, ",
                             "provided you have the security rights to do so.<br>Proceed?"].join('')
    },

    onNavigationViewPopped: function (navView, view) {
        var viewStack = this.getMainView().getNavigationBar().getViewStack(),
            currentView;

        if (viewStack && viewStack.length > 0) {
            currentView = viewStack[viewStack.length - 1];
            if (currentView.xtype === 'floorPlanPanel') {
                this.setSurveyButtonVisibility();
            }
        }
    },

    onNavigationViewPushed: function (navView, view) {
        if (view.xtype === 'floorPlanPanel') {
            this.setSurveyButtonVisibility();
        }
    },

    onStartSurveyMode: function () {
        var startSurveyButton = this.getStartSurveyButton(),
            surveyState = SurveyState.getSurveyState();

        if (surveyState.isSurveyActive) {
            return;
        }
        startSurveyButton.setHidden(false);
    },

    onShowFloorPlanView: function () {
        this.applyRoomSurveyStoreFilter();
    },

    displayStartSurvey: function () {
        // Display the Start Survey Form
        var me = this,
            surveyModel = Ext.create('SpaceBook.model.SpaceSurvey'),
            startSurveyView,
            surveyCode = me.generateSurveyCode();

        // TODO: Check if there is already an active survey
        startSurveyView = Ext.create('SpaceBook.view.StartSurvey', {
            record: surveyModel
        });
        startSurveyView.setValues({
            em_id: ConfigFileManager.employeeId,
            survey_id: surveyCode
        });

        me.getMainView().push(startSurveyView);
    },

    /**
     * Generates the survey code using the format
     * bl_id-fl_id YYYY-MM-dd H:m username
     */
    generateSurveyCode: function() {
        var floorPlanView = this.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            userName = ConfigFileManager.username,
            surveyCode;

        surveyCode = blId + '-' + flId + ' ' + Ext.DateExtras.format(new Date(), 'Y-m-d H:i') +
                ' ' + userName;

        return surveyCode;
    },

    /**
     * Sets the status of all Room Survey records to completed.
     */
    completeSurvey: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            completeSurveyMessage = me.getCompleteSurveyMessage();


        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert('Survey', 'There is not an active Survey to complete.');
            return;
        }

        // Prompt the user to verify completion.
        Ext.Msg.confirm('Complete Survey', completeSurveyMessage, function(response) {
            if (response === 'yes') {
                me.doCompleteSurvey(surveyState.surveyId);
            }
        });
    },

    doCompleteSurvey: function(surveyId) {
        var me = this;

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        Mask.displayLoadingMask('Completing Survey');
        // Mark all survey records as completed
        me.markSurveyComplete(surveyId, function () {
            me.completeRoomSurveyRecords(function () {
                SynchronizationManager.syncTransactionTables(['spaceSurveysStore', 'roomSurveyStore'], function () {
                    SurveyState.resetSurveyState();
                    SpaceBook.util.RoomHighlight.resetRoomHighlights(function() {
                        me.loadSurveyStoresAfterSync();
                        me.setSurveyButtonVisibility();
                        Mask.hideLoadingMask();
                    }, me);
                });
            }, me);
        }, me);
    },

    loadSurveyStoresAfterSync: function() {
        var spaceSurveyStore = Ext.getStore('spaceSurveysStore'),
            roomSurveyStore = Ext.getStore('roomSurveyStore');

        spaceSurveyStore.loadPage(1);
        roomSurveyStore.loadPage(1);

    },

    /**
     *
     * Sets the status of all room survey records to completed.
     * <p>
     * Sets the mob_is_changed field.
     * <p>
     * Writes the changes to the mobile database
     *
     * @param callback
     *            {Function} called when the operation is completed
     * @param scope
     *            {Object} The scope to execute the callback function
     * @private
     */
    completeRoomSurveyRecords: function (callback, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore');

        roomSurveyStore.retrieveAllStoreRecords(null, function(records) {
            Ext.each(records, function (record) {
                record.set('status', 'Completed');
                record.set('mob_is_changed', 1);
            });
            if (typeof callback === 'function') {
                callback.call(scope || me);
            }
        });
    },

    /**
     * Sets the Survey status to Completed.
     * @param surveyId {String} The id of the Survey record
     * @param onCompleted {Function} Called when the operation is completed
     * @param scope {Object} The scope to execute the callback function.
     */
    markSurveyComplete: function(surveyId, onCompleted, scope) {
        var me = this,
            surveyStore = Ext.getStore('spaceSurveysStore'),
            currentFilters = surveyStore.getFilters(),
            doCallback = function () {
               if (typeof onCompleted === 'function') {
                   onCompleted.call(scope || me);
               }
            };

        currentFilters = surveyStore.getFilters();
        surveyStore.clearFilter();
        surveyStore.setDisablePaging(true);
        surveyStore.filter('survey_id', surveyId);
        surveyStore.load(function (records) {
            if (records && records.length > 0) {
                records[0].set('status', 'Completed');
                records[0].set('mob_is_changed', 1);
                records[0].set('survey_date', new Date());
                surveyStore.sync(function () {
                    surveyStore.setDisablePaging(false);
                    surveyStore.clearFilter();
                    surveyStore.setFilters(currentFilters);
                    surveyStore.loadPage(1,function () {
                        doCallback();
                    },me);
                }, me);
            } else {
                doCallback();
            }
        }, me);
    },

    /**
     * Syncs the Survey and Room Survey records. Applies the changes directly to the rm table.
     */
    syncAndPostSurvey: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            closeSurveyMessage = me.getCloseSurveyMessage();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert('Survey', 'There is not an active Survey to Sync.');
            return;
        }
        // Prompt the user before closing the survey
        Ext.Msg.confirm('Close Survey', closeSurveyMessage, function(response) {
            if (response === 'yes') {
                me.doCloseSurvey(surveyId);
            }
        });
    },

    doCloseSurvey: function(surveyId) {
        var me = this,
            storeIds = [ 'spaceSurveysStore', 'roomSurveyStore' ],
            session = Ext.create('Common.Session'),
            activePlanTypes,
            floorCodes;


        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }
        Mask.displayLoadingMask('Close Survey');
        SynchronizationManager.syncTransactionTables(storeIds, function () {
            session.doInSession(function () {
                Common.service.workflow.Workflow.callMethod(
                        'AbSpaceRoomInventoryBAR-SpaceMobileService-closeSurveyTable', surveyId);
            });
            SynchronizationManager.syncTransactionTables(storeIds, function () {
                // Get the floor ids from the SurveyState
                floorCodes = SurveyState.getFloorCodes();
                SurveyState.resetSurveyState();
                me.setSurveyButtonVisibility();
                me.loadSurveyStoresAfterSync();
                Mask.hideLoadingMask();
                activePlanTypes = Drawing.getActivePlanTypes();
                if(activePlanTypes && activePlanTypes.length > 0) {
                    me.displayProgressBar(activePlanTypes.length * floorCodes.length);
                    SpaceBook.util.RoomHighlight.resetRoomHighlights(function() {
                        Drawing.downloadFloorPlansByPlanType(floorCodes, activePlanTypes, me.getProgressBarPanel() );
                    }, me);
                }
            });
        });
    },

    // TODO: Refactor: addToSurvey and onStartSpaceSurvey are similar
    addToSurvey: function () {
        var me = this, floorPlanView = this.getFloorPlanView(),
            session = Ext.create('Common.Session'),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            userName = ConfigFileManager.username,
            highlightedRoomRecords = [];

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }
        Mask.displayLoadingMask('Add to Survey');
        // Retrieve records from the rm table for this floor and insert them into the rmsurvey_sync
        // table
        session.doInSession(function () {
            Common.service.workflow.Workflow.callMethod(
                    'AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable',
                    surveyState.surveyId, userName, blId, flId);
        });

        // Sync the added room records
        SpaceBook.util.RoomHighlight.getModifiedRoomCodes(function(roomCodes) {
            highlightedRoomRecords = roomCodes;
                SynchronizationManager.syncTransactionTables('roomSurveyStore', function () {
                   SurveyState.addFloorCode({
                       bl_id: blId,
                       fl_id: flId
                   });
                    me.setSurveyEdit(highlightedRoomRecords, function() {
                        me.loadRoomSurveyStore(blId, flId);
                        me.setSurveyButtonVisibility();
                        Mask.hideLoadingMask();
                    }, me);
                }, me);
        },me);
    },

    /**
     * Starts the space survey
     */
    onStartSpaceSurvey: function (view) {
        var me = this,
            surveyRecord = view.getRecord(),
            surveyId = surveyRecord.get('survey_id'),
            floorPlanView = me.getFloorPlanView(),
            session = Ext.create('Common.Session'),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            storeIds = ['spaceSurveysStore', 'roomSurveyStore' ],
            userName = ConfigFileManager.username;

        if (!surveyRecord.isValid()) {
            view.displayErrors(surveyRecord);
            return;
        }

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        Mask.displayLoadingMask('Start Survey');
        // Save the survey data
        me.saveSpaceSurvey(view, function () {
            // Sync the survey records
            SynchronizationManager.syncTransactionTables(storeIds, function () {
                // Call workflow rule
                session.doInSession(function () {
                    Common.service.workflow.Workflow.callMethod(
                            'AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable',
                            surveyId, userName, blId, flId);
                    // TODO: Check result for errors. Throw exception if error.
                });
                SynchronizationManager.syncTransactionTables(storeIds, function () {
                    SurveyState.setSurveyState(surveyId, true, {
                        bl_id: blId,
                        fl_id: flId
                    });
                    me.userAuthorization = SpaceBook.util.Ui.getUserAppAuthorization();
                    me.loadRoomSurveyStore(blId, flId);
                    Mask.hideLoadingMask();
                    me.getMainView().pop();
                }, me);
            });
        }, me);
    },

    loadRoomSurveyStore: function (blId, flId) {
        var roomSurveyStore = Ext.getStore('roomSurveyStore');
        roomSurveyStore.clearFilter();
        roomSurveyStore.filter('bl_id', blId);
        roomSurveyStore.filter('fl_id', flId);
        roomSurveyStore.loadPage(1);
    },

    /**
     * Save the Space Survey data
     *
     * @param view
     */
    saveSpaceSurvey: function (view, callback, scope) {
        var me = this, store = Ext.getStore('spaceSurveysStore'),
            record = view.getRecord(),
            userName = ConfigFileManager.username;

        record.set('mob_is_changed', 1);
        record.set('mob_locked_by', userName);
        record.set('status', 'Issued');
        record.set('survey_date', new Date());

        store.add(record);
        store.sync(function () {
            if (typeof callback === 'function') {
                callback.call(scope || me);
            }
        }, me);
    },

    /**
     * Wraps button hiding logic into a positive logic expression
     * @private
     * @param button
     * @param show
     */
    showButton: function(button, show) {
        button.setHidden(!show);
    },

    /**
     * Sets the visibility of all of the buttons used in Survey Mode
     */
    setSurveyButtonVisibility: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            startSurveyButton = me.getStartSurveyButton(),
            syncSurveyButton = me.getSyncSurveyButton(),
            completeSurveyButton = me.getCompleteSurveyButton(),
            addToSurveyButton = me.getAddToSurveyButton(),
            syncAndPostButton = me.getSyncAndPostButton(),
            floorPlanView = me.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            isSurveyActiveForFloor = me.getIsSurveyActiveForFloor(floorPlanRecord, surveyState),
            planType = me.getPressedPlanTypeButtonPlanType(),
            authorization = SpaceBook.util.Ui.getUserAppAuthorization();

        if (surveyState.isSurveyActive) {
            me.showButton(syncSurveyButton, authorization.survey);
            me.showButton(completeSurveyButton, authorization.survey);
            me.showButton(syncAndPostButton, authorization.surveyPost);
            me.showButton(addToSurveyButton, !isSurveyActiveForFloor && authorization.survey);
            me.showButton(startSurveyButton, false);
        } else {
            me.showButton(syncSurveyButton, false);
            me.showButton(completeSurveyButton, false);
            me.showButton(syncAndPostButton, false);
            me.showButton(addToSurveyButton, false);
            me.showButton(startSurveyButton, (planType && planType === '9 - SURVEY' && authorization.survey));
        }
    },

    getPressedPlanTypeButtonPlanType: function() {
        var planTypeSegmentedButton = this.getPlanTypeSegmentedButton(),
            pressedButtons,
            planType = null,
            record;

        if (planTypeSegmentedButton) {
            pressedButtons = planTypeSegmentedButton.getPressedButtons();
            if (pressedButtons.length > 0) {
                record = pressedButtons[0].getRecord();
                if (record) {
                    planType = record.get('plan_type');
                }
            }
        }
        return planType;
    },

    getIsSurveyActiveForFloor: function (floorPlanRecord, surveyState) {
        var floorPlanData = floorPlanRecord.getData(),
            floorCodes = surveyState.floorCodes, i;

        if (!floorPlanRecord) {
            return false;
        }

        for (i = 0; i < floorCodes.length; i++) {
            if (floorCodes[i].bl_id === floorPlanData.bl_id &&
                    floorCodes[i].fl_id === floorPlanData.fl_id) {
                return true;
            }
        }
        return false;
    },

    /**
     * Syncs the SpaceSurvey and RoomSurvey tables with the server.
     * Saves and restores the modified room highlight flags.
     */
    onSyncRoomSurvey: function () {
        var me = this,
            storeIds = [ 'spaceSurveysStore', 'roomSurveyStore' ],
            highlightedRoomRecords = [];

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        Mask.displayLoadingMask('Sync Survey');
        SpaceBook.util.RoomHighlight.getModifiedRoomCodes(function(roomCodes) {
            highlightedRoomRecords = roomCodes;
            SynchronizationManager.syncTransactionTables(storeIds, function () {
                me.setSurveyEdit(highlightedRoomRecords, function() {
                    me.applyRoomSurveyStoreFilter();
                    Mask.hideLoadingMask();
                }, me);
            });
        }, me);
    },

    applyRoomSurveyStoreFilter: function () {
        var floorPlanView = this.getFloorPlanView(),
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            floorPlanRecord, floorPlanData;

        if (floorPlanView) {
            floorPlanRecord = floorPlanView.getRecord();
            floorPlanData = floorPlanRecord.getData();

            roomSurveyStore.clearFilter();
            roomSurveyStore.filter('bl_id', floorPlanData.bl_id);
            roomSurveyStore.filter('fl_id', floorPlanData.fl_id);
            roomSurveyStore.loadPage(1);
        }
    },

    /**
     * Sets the value of surveyEdit in the RoomSurvey table for all of the records
     * that have been modified during the survey. Persists the edited values
     * after the Sync Survey action.
     * @param highlightedRoomRecords {Array} An array containing the id values of modified room records.
     * @param onCompleted {Function} Called when the operation is completed.
     * @param scope {Object} Scope to execute the callback in
     */
    setSurveyEdit: function(highlightedRoomRecords, onCompleted, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore');

        roomSurveyStore.setDisablePaging(true);
        roomSurveyStore.load(function(records) {
            Ext.each(highlightedRoomRecords, function(record) {
                var index = roomSurveyStore.findBy(function(surveyRecord) {
                    var data = surveyRecord.getData();
                    return (data.survey_id === record.surveyId &&
                       data.bl_id === record.blId &&
                       data.fl_id === record.flId &&
                       data.rm_id === record.rmId);
                }, me);
                if (index !== -1) {
                    roomSurveyStore.getAt(index).set('surveyEdit', true);
                }
                roomSurveyStore.setDisablePaging(false);
            }, me);
            roomSurveyStore.sync(function() {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            }, me);
        }, me);
    },

    /**
     * Displays the progress bar after the Survey is closed
     * The progress bar is displayed by the Download controller
     * @param maxValue
     */
    displayProgressBar : function(maxValue) {
        this.fireEvent('displayprogress', maxValue);
    }
});