Ext.define('Campus.controller.Survey', {

    extend: 'Ext.app.Controller',

    requires: [ 'Common.util.ConfigFileManager', 'Common.util.SynchronizationManager' ],

    config: {

        refs: {
            mainView: 'mainview',
            startSurveyView: 'startSurveyPanel',
            floorPlanView: 'floorPlanPanel',
            startSurveyButton: 'toolbarbutton[action=startSurvey]',
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            completeSurveyButton: 'toolbarbutton[action=completeSurvey]',
            addToSurveyButton: 'toolbarbutton[action=addToSurvey]',
            syncAndPostButton: 'toolbarbutton[action=syncAndPost]'
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
        }
    },

    onNavigationViewPopped: function (navView, view) {
        var viewStack = this.getMainView().getNavigationBar().getViewStack(), currentView;

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
        var me = this, userProfile = UserProfile.getUserProfile(),
            surveyModel = Ext.create('Campus.model.SpaceSurvey'),
            startSurveyView;

        // TODO: Check if there is already an active survey

        startSurveyView = Ext.create('Campus.view.StartSurvey', {
            record: surveyModel
        });
        startSurveyView.setValues({
            em_id: userProfile.em_id
        });

        me.getMainView().push(startSurveyView);
    },

    /**
     * Sets the status of all Room Survey records to completed.
     */
    completeSurvey: function () {
        var me = this, surveyState = SurveyState.getSurveyState();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert('Survey', 'There is not an active Survey to complete.');
            return;
        }

        // Mark all survey records as completed
        me.completeSurveyRecords(function () {
            SynchronizationManager.syncTransactionTables('roomSurveyStore', function () {
                SurveyState.resetSurveyState();
                me.setSurveyButtonVisibility();
            });
        }, me);
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
    completeSurveyRecords: function (callback, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore');

        roomSurveyStore.clearFilter();
        roomSurveyStore.setDisablePaging(true);
        roomSurveyStore.load(function (records) {
            Ext.each(records, function (record) {
                record.set('status', 'Completed');
                record.set('mob_is_changed', 1);
            });
            roomSurveyStore.sync(function () {
                roomSurveyStore.setDisablePaging(false);
                if (typeof callback === 'function') {
                    callback.call(scope || me);
                }
            });
        });
    },

    syncAndPostSurvey: function () {
        var me = this, storeIds = [ 'spaceSurveysStore', 'roomSurveyStore' ],
            session = Ext.create('Common.Session'),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId;

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert('Survey', 'There is not an active Survey to Sync.');
            return;
        }

        SynchronizationManager.syncTransactionTables(storeIds, function () {
            session.doInSession(function () {
                var result = Common.service.workflow.Workflow.callMethod(
                        'AbSpaceRoomInventoryBAR-SpaceMobileService-closeSurveyTable', surveyId);
            });
            SynchronizationManager.syncTransactionTables(storeIds, function () {
                SurveyState.resetSurveyState();
                me.setSurveyButtonVisibility();
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
            userName = ConfigFileManager.username;

        me.showWaitCursor();
        // Retrieve records from the rm table for this floor and insert them into the rmsurvey_sync
        // table
        session.doInSession(function () {
            Common.service.workflow.Workflow.callMethod(
                    'AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable',
                    surveyState.surveyId, userName, blId, flId);
        });

        // Sync the added room records
        // TODO: display busy indicator
        SynchronizationManager.syncTransactionTables('roomSurveyStore', function () {
            SurveyState.addFloorCode({
                bl_id: blId,
                fl_id: flId
            });
            me.loadRoomSurveyStore(blId, flId);
            me.hideWaitCursor();
            me.setSurveyButtonVisibility();
        }, me);
    },

    /**
     * Starts the space survey
     */
    onStartSpaceSurvey: function (view) {
        var me = this, surveyRecord = view.getRecord(),
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

        me.showWaitCursor();
        // Save the survey data
        this.saveSpaceSurvey(view, function () {

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
                    me.loadRoomSurveyStore(blId, flId);
                    me.hideWaitCursor();
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

        store.add(record);
        store.sync(function () {
            if (typeof callback === 'function') {
                callback.call(scope || me);
            }
        }, me);
    },

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
            isSurveyActiveForFloor = me.getIsSurveyActiveForFloor(floorPlanRecord, surveyState);

        // Check if the selected floor has an active survey
        startSurveyButton.setHidden(true);
        if (surveyState.isSurveyActive) {
            syncSurveyButton.setHidden(false);
            completeSurveyButton.setHidden(false);
            syncAndPostButton.setHidden(false);
            addToSurveyButton.setHidden(isSurveyActiveForFloor);
        } else {
            syncSurveyButton.setHidden(true);
            completeSurveyButton.setHidden(true);
            syncAndPostButton.setHidden(true);
            addToSurveyButton.setHidden(true);
        }
    },

    getIsSurveyActiveForFloor: function (floorPlanRecord, surveyState) {
        var floorPlanData = floorPlanRecord.getData(),
            floorCodes = surveyState.floorCodes, i;

        if (!floorPlanRecord) {
            return false;
        }

        for (i = 0; i < floorCodes.length; i++) {
            if (floorCodes[i].bl_id === floorPlanData.bl_id
                    && floorCodes[i].fl_id === floorPlanData.fl_id) {
                return true;
            }
        }
        return false;
    },

    onSyncRoomSurvey: function () {
        var me = this,
            storeIds = [ 'spaceSurveysStore', 'roomSurveyStore' ];
        me.showWaitCursor();
        SynchronizationManager.syncTransactionTables(storeIds, function () {
            me.applyRoomSurveyStoreFilter();
            me.hideWaitCursor();
        });
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

    showWaitCursor : function() {
        // show wait cursor
        Ext.Viewport.setMasked({
            xtype : 'loadmask'
        });
    },

    hideWaitCursor : function() {
        Ext.Viewport.setMasked(false);
    }

});