Ext.define('AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync', {
    extend: 'Ext.app.Controller',

    requires: [ 'Common.util.UserProfile',
                'Common.util.SynchronizationManager',
                'Common.util.Drawing',
                'AssetAndEquipmentSurvey.model.TaskFloorDrawing'],

    config: {
        refs: {
            taskContainer: 'taskContainer',
            completeSurveyButton: 'button[action=completeEquipmentSurvey]',
            addSurveyTaskButton: 'button[action=addSurveyTask]'
        },
        control: {
            'button[action=syncSurvey]': {
                tap: 'syncTasks'
            },
            completeSurveyButton: {
                tap: 'onCompleteSurvey'
            }
        },

        completeSurveyMessage: ['By marking the survey as Complete, you inform the supervisor that',
                                ' you are done with this survey, that they can review your changes,',
                                ' apply them, and then archive the survey.<br><br>You cannot make ',
                                ' further changes after you mark the survey as Complete.<br><br>Proceed?' ].join('')
    },

    // TODO: Check for valid employee id
    setSurveyRestriction: function (surveyStore) {

        surveyStore.setRestrictionClause([
            {
                tableName: 'survey',
                fieldName: 'em_id',
                operation: 'EQUALS',
                value: ConfigFileManager.employeeId
            },
            {
                tableName: 'survey',
                fieldName: 'status',
                operation: 'EQUALS',
                value: 'Issued'
            }
        ]);
    },

    /**
     * Syncs the Survey table and the Task table. Downloads floor plans for for active surveys
     */
    syncTasks: function () {
        var me = this,
            taskFloorDrawings = Ext.getStore('taskFloorDrawings'),
            appName = this.getApplication().getName(),
            surveyStore = Ext.getStore('surveysStore');

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        ScriptManager.registerDwrServiceScripts(function() {
            me.setSurveyRestriction(surveyStore);
            Mask.displayLoadingMask();
            SynchronizationManager.downloadValidatingTables(appName, false, function () {
                // Sync the Survey table. This is a validating table.
                // Then sync the Tasks table
                Mask.setLoadingMessage('Syncing Surveys');
                me.syncSurveyTable(function () {
                    SynchronizationManager.syncTransactionTables('surveyTasksStore', function () {
                        me.downloadTaskFloorPlans();
                        taskFloorDrawings.sync();
                        Mask.hideLoadingMask();
                    }, me);
                }, me);
            }, me);
        }, me);
    },

    /**
     * Synchronizes the Survey table and the Application Preferences
     * @param onCompleted {Function} Called when the sync is completed.
     * @param scope {Object} The scope to execute the onCompleted function
     */
    syncSurveyTable: function (onCompleted, scope) {
        var me = this,
            surveyStore = Ext.getStore('surveysStore'),
            preferencesStore = Ext.getStore('appPreferencesStore');

        // Restrict to the em_id of the logged in user.
        me.setSurveyRestriction(surveyStore);

        surveyStore.clearAndImportRecords(function () {
            preferencesStore.clearAndImportRecords(function() {
                if (typeof onCompleted === 'function') {
                    surveyStore.load();
                    preferencesStore.load();
                    onCompleted.call(scope || me);
                }
            }, me);
        }, me);
    },

    downloadTaskFloorPlans: function () {
        var me = this;
        // Get the list of floor codes
        me.getTaskFloorCodes(function (records) {
            Ext.each(records, function (record) {
                var blId = record.blId,
                    flId = record.flId,
                    parameters = {};

                parameters.highlightParameters = [ {
                    'view_file' : "ab-eq-survey-eqauditxrm.axvw",
                    'hs_ds' : "abEqSurveyEqauditxRmHighlight",
                    'label_ds' : 'abEqSurveyEqauditxRmLabel',
                    'label_clr' : 'gray'
                }];

                parameters.pkeyValues = {
                    bl_id: blId,
                    fl_id: flId
                };

                var svgData = Common.util.Drawing.getSVGFromServer(parameters);
                me.saveFloorDrawing(blId, flId, svgData);
            });
        });

    },

    getTaskFloorCodes: function (onCompleted, scope) {
        var me = this,
            taskFloorStore = Ext.getStore('taskFloorsStore'),
            floorCodes = [];

        taskFloorStore.retrieveAllStoreRecords([], function (records) {
            Ext.each(records, function (record) {
                var floorCode = {};
                floorCode.blId = record.get('bl_id');
                floorCode.flId = record.get('fl_id');
                floorCodes.push(floorCode);
            });
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me, floorCodes);
            }
        }, me);
    },

    saveFloorDrawing: function (blId, flId, svgData) {
        Common.util.Drawing.saveTaskFloorDrawing(blId, flId, svgData);
    },



    /**
     * Sets the Task.survey_complete field to true
     * <p>
     * The survey_complete field is used by the Mobile Client to indicate if the
     * survey task record is completed.
     * <p>
     * Completed survey records will be removed from the device during the next sync.
     * @param surveyId {String} The id of the selected Survey
     * @param onCompleted {Function} Called when the operation is complete
     * @param scope {Object} The scope to execute the onCompleted callback
     */

    // TODO: use store.retrieveAllRecordsFrom store
    setTaskStatusToComplete: function (surveyId, onCompleted, scope) {
        var me = this,
            surveyTaskStore = Ext.getStore('surveyTasksStore');

        surveyTaskStore.clearFilter();
        surveyTaskStore.filter('survey_id', surveyId);
        surveyTaskStore.setDisablePaging(true);
        surveyTaskStore.load(function (records) {
            Ext.each(records, function (record) {
                record.set('survey_complete',true );
            });
            surveyTaskStore.sync(function () {
                //surveyTaskStore.setFilters(currentFilters);
                surveyTaskStore.loadPage(1, function() {
                    if (typeof onCompleted === 'function' ) {
                        onCompleted.call(scope || me);
                    }
                });
            });
        });
    },

    /**
     * Synchronizes any updated survey tasks, sets the survey status to Completed and updates
     * the the status of the client Survey table.
     * <p>
     * Set the Task survey_complete field to true. The survey_complete field is a client-side only
     * field and is used to let the client know the tasks are completed and should not be modified.
     */
    onCompleteSurvey: function () {
        var me = this,
            taskContainer = this.getTaskContainer(),
            surveyId = taskContainer.getSurveyId(),
            session = Ext.create('Common.Session'),
            surveyStore = Ext.getStore('surveysStore'),
            message = me.getCompleteSurveyMessage();

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        Ext.Msg.confirm('Complete Survey', message, function (buttonId) {
            if (buttonId === 'yes') {
                Mask.displayLoadingMask('Completing Survey');
                // Sync the Task changes
                SynchronizationManager.syncTransactionTables('surveyTasksStore', function () {
                        // Set the server side Survey status to Completed
                        session.doInSession(function () {
                        Common.service.workflow.Workflow.callMethod(
                                    'AbAssetManagement-AssetMobileService-markSurveyCompleted', surveyId);
                    });
                    // Set the client side status values
                    me.setTaskStatusToComplete(surveyId, function () {
                        // Set the status to Complete in the client side database
                        taskContainer.getRecord().set('status', 'Complete');
                        surveyStore.sync();
                        me.setButtonsAfterCompleteSurvey();
                        Mask.hideLoadingMask();
                    }, me);
                });
            }
        });
    },

    setButtonsAfterCompleteSurvey: function() {
        var completeSurveyButton = this.getCompleteSurveyButton(),
            addTaskButton = this.getAddSurveyTaskButton();

        completeSurveyButton.setHidden(true);
        addTaskButton.setHidden(true);
    }
});