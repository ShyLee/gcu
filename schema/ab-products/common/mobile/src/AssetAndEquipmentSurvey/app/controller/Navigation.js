Ext.define('AssetAndEquipmentSurvey.controller.Navigation', {
    extend: 'Common.controller.NavigationController',
    requires: [ 'Common.Session', 'Common.util.Filter', 'Common.service.workflow.Workflow' ],

    config: {
        refs: {
            mainView: 'main',
            taskView: 'taskEditPanel',
            taskListView: 'taskListPanel',
            taskSearchField: 'taskListPanel searchfield',
            floorPlanSegmentedButton: 'taskContainer segmentedbutton',
            taskList: 'taskListPanel',
            taskFloorPlanList: 'floorPlanList',
            taskContainer: 'taskContainer',
            completeSurveyButton: 'button[action=completeEquipmentSurvey]',
            addSurveyTaskButton: 'button[action=addSurveyTask]',
            sortField: 'taskListPanel selectfield[name=sortfield]'
        },

        control: {
            taskView: {
                previoustap: 'onPreviousTask',
                nexttap: 'onNextTask'
            },
            addSurveyTaskButton: {
                tap: 'onAddSurveyTask'
            },
            taskSearchField: {
                keyup: 'onSearchTaskList',
                clearicontap: 'onClearSearch'
            },
            mainView: {
                pop: 'onViewPopped',
                push: 'onViewPushed'
            },
            floorPlanSegmentedButton: {
                toggle: 'onFloorPlanButtonToggled'
            },
            sortField: {
                change: 'onApplySort',
                focus: 'onAddOptions'
            }
        }
    },

    /**
     * Override
     *
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when removed from the
        // navigation view.
        var me = this,
            editView = view.getEditViewClass(),
            updateView = Ext.create(editView),
            lastViewPushed = me.getLastPushedView(),
            surveyTasksStore;

        if (lastViewPushed === updateView.$className) {
            updateView.destroy();
            return;
        }
        this.setLastPushedView(updateView.$className);

        if (updateView.xtype === 'taskEditPanel') {
            // Check if we have only one record in the surveyList
            surveyTasksStore = Ext.getStore('surveyTasksStore');

            if (surveyTasksStore.getCount() === 1) {
                updateView.setDisplayPreviousNextButtons({disablePrevious: true, disableNext: true});
            } else {
                var currentIndex = me.findTaskRecord(record.get('survey_id'), record.get('eq_id'));
                var totalCount = surveyTasksStore.getTotalCount();
                if (currentIndex === 0) {
                    updateView.setDisplayPreviousNextButtons({disablePrevious: true, disableNext: false});
                }
                if (currentIndex === (totalCount - 1)) {
                    updateView.setDisplayPreviousNextButtons({disablePrevious: false, disableNext: true});
                }
            }
        }

        if (updateView.xtype === 'taskContainer') {
            updateView.setSurveyId(record.get('survey_id'));
            updateView.setRecord(record);
            me.getFloorPlanSegmentedButton().setPressedButtons(0);
            // Hide Complete and Add buttons if the survey is completed
            // Filter task list
            me.filterTaskList(record);
        } else {
            if (updateView.xtype === 'taskFloorPlanPanel') {
                updateView.setSurveyId(record.get('survey_id'));
            }
            updateView.setRecord(record);
        }

        me.getMainView().push(updateView);
    },

    onViewPopped: function (mainView, poppedView) {
        // Reload task list when returning from the edit task view
        var taskListStore = Ext.getStore('surveyTasksStore'),
            currentView = mainView.getNavigationBar().getCurrentView(),
            surveyId,
            status,
            currentViewRecord;

        this.setLastPushedView('');

        if (poppedView.xtype === 'taskEditPanel') {
            taskListStore.loadPage(1);
        }
        if (poppedView.xtype === 'taskFloorPlanPanel') {
            surveyId = poppedView.getSurveyId();
            taskListStore.clearFilter();
            taskListStore.filter('survey_id', surveyId);
            taskListStore.loadPage(1);
        }
        if (currentView && currentView.xtype === 'taskContainer') {
            currentViewRecord = currentView.getRecord();
            if (currentViewRecord) {
                status = currentView.getRecord().get('status');
                this.setTaskContainerButtons(status);
            }
        }
    },

    onViewPushed: function (mainView, pushedView) {
        var status,
            record;

        if (pushedView.xtype === 'taskContainer') {
            status = pushedView.getRecord().get('status');
            this.setTaskContainerButtons(status);
        }

        if (pushedView.xtype === 'taskEditPanel') {
            record = pushedView.getRecord();

            if (pushedView.getIsCreateView()) {
                var isSurveyComplete = record.get('survey_complete');
                mainView.getNavigationBar().getSaveButton().setHidden(isSurveyComplete);
            }
        }
    },

    filterTaskList: function (record) {
        var taskListStore = Ext.getStore('surveyTasksStore'),
            taskFloorsStore = Ext.getStore('taskFloorsStore'),
            taskList = this.getTaskListView(),
            surveyId = record.get('survey_id');

        taskList.setSurveyId(surveyId);
        taskListStore.clearFilter();
        taskListStore.filter('survey_id', surveyId);
        taskListStore.loadPage(1);

        taskFloorsStore.clearFilter();
        taskFloorsStore.filter('survey_id', surveyId);
        taskFloorsStore.loadPage(1);

    },

    // TODO: Remove duplicated code
    onPreviousTask: function (view) {
        var record = view.getRecord(),
                taskStore = Ext.getStore('surveyTasksStore'),
                surveyId, eqId, previousRecord, currentIndex,
                currentPage = taskStore.currentPage,
                taskView = this.getTaskView(),
                buttonState;

        if (!record) {
            return;
        }

        surveyId = record.get('survey_id');
        eqId = record.get('eq_id');

        currentIndex = this.findTaskRecord(surveyId, eqId);
        previousRecord = taskStore.getAt(currentIndex - 1);

        if (currentIndex === 1 && currentPage === 1) {
            buttonState = {disablePrevious: true, disableNext: false};
        } else {
            buttonState = {disablePrevious: false, disableNext: false};
        }

        taskView.setDisplayPreviousNextButtons(buttonState);

        if (!previousRecord) {
            if (currentPage > 1) {
                taskStore.loadPage(currentPage - 1, function (records) {
                    view.setRecord(null);
                    view.setRecord(records[records.length - 1]);
                });
            }
        } else {
            view.setRecord(null);
            view.setRecord(previousRecord);
        }
    },

    onNextTask: function (view) {
        var record = view.getRecord(),
            taskStore = Ext.getStore('surveyTasksStore'),
            surveyId, eqId, nextRecord, currentIndex,
            currentPage = taskStore.currentPage,
            taskStoreTotalCount = taskStore.getTotalCount(),
            taskStorePageSize = taskStore.getPageSize(),
            taskView = this.getTaskView(),
            totalCount = taskStore.getTotalCount(),
            numberOfPages = Math.ceil(totalCount / taskStorePageSize),
            lastIndex = totalCount % taskStorePageSize,
            pageIndex,
            buttonState;

        if (!record) {
            return;
        }

        surveyId = record.get('survey_id');
        eqId = record.get('eq_id');

        currentIndex = this.findTaskRecord(surveyId, eqId);

        pageIndex = currentIndex % taskStorePageSize;
        console.log('-----> currentPage: ' + currentPage + '  numberOfPages: ' +
                numberOfPages + ' pageIndex: ' + pageIndex + ' lastIndex: ' + lastIndex);

        // Disable the Next arrow if we are on the last record
        if (currentPage === numberOfPages && pageIndex === (lastIndex - 2)) {
            buttonState = {disablePrevious: false, disableNext: true};
        } else {
            buttonState = {disablePrevious: false, disableNext: false};
        }
        taskView.setDisplayPreviousNextButtons(buttonState);

        // Get the next record
        nextRecord = taskStore.getAt(currentIndex + 1);

        if (!nextRecord) {
            if (taskStorePageSize * currentPage < taskStoreTotalCount) {
                taskStore.loadPage(currentPage + 1, function (records) {
                    view.setRecord(null);
                    view.setRecord(records[0]);
                });
            }
        } else {
            view.setRecord(null);
            view.setRecord(nextRecord);
        }
    },

    findTaskRecord: function (surveyId, eqId) {
        var taskStore = Ext.getStore('surveyTasksStore'), index = 0;

        taskStore.each(function (record) {
            if (surveyId === record.get('survey_id') && eqId === record.get('eq_id')) {
                return false;
            }
            index += 1;
        });

        return index;
    },

    onSearchTaskList: function (searchField) {
        // Filer the Task table
        var taskStore = Ext.getStore('surveyTasksStore'),
            filters = this.buildTaskFilters(searchField.getValue()),
            currentFilters = taskStore.getFilters();

        taskStore.clearFilter();
        filters.unshift(currentFilters[0]);
        taskStore.setFilters(filters);
        taskStore.load();
    },

    /**
     * Remove all filters except the survey id filter.
     */
    onClearSearch: function () {
        var taskContainer = this.getTaskContainer(),
            surveyId = taskContainer.getSurveyId(),
            taskStore = Ext.getStore('surveyTasksStore');

        taskStore.clearFilter();
        taskStore.filter('survey_id', surveyId);
        taskStore.loadPage(1);
    },

    buildTaskFilters: function (searchValue) {
        var searchFields = [ 'eq_id', 'eq_std', 'bl_id', 'fl_id', 'rm_id' ],
            filterArray = [];

        Ext.each(searchFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: searchValue,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        return filterArray;
    },

    onFloorPlanButtonToggled: function (segmentedButton, button, isPressed) {
        var buttonId,
            taskList = this.getTaskList(),
            taskFloorList = this.getTaskFloorPlanList(),
            hide;

        if (isPressed) {
            buttonId = button.getItemId();
            hide = buttonId === 'floorPlan';
            taskList.setHidden(hide);
            taskFloorList.setHidden(!hide);
            this.setTaskContainerTitle(!hide);
        }
    },

    setTaskContainerTitle: function (isListView) {
        var mainView = this.getMainView(),
            navBar = mainView.getNavigationBar();

        if (isListView) {
            navBar.setTitle('Equipment Items');
        } else {
            navBar.setTitle('Floor Plans for Survey');
        }
    },

    onAddSurveyTask: function () {
        var mainView = this.getMainView(),
            taskContainer = this.getTaskContainer(),
            taskView = Ext.create('AssetAndEquipmentSurvey.view.Task', {isCreateView: true});

        taskView.setValues({survey_id: taskContainer.getSurveyId()});
        mainView.push(taskView);
    },

    setTaskContainerButtons: function (status) {
        var addSurveyTaskButton = this.getAddSurveyTaskButton(),
            completeSurveyButton = this.getCompleteSurveyButton(),
            isComplete = (status === 'Complete');

        if (addSurveyTaskButton) {
            addSurveyTaskButton.setHidden(isComplete);
        }
        if (completeSurveyButton) {
            completeSurveyButton.setHidden(isComplete);
        }
    },

    /**
     * Override to set the Auto Sync property to false before syncing the record
     * This is needed to prevent the record from being adding to the data base twice.
     * Saves the contents of the Edit Panel to the database Validates and displays validation errors on
     * the Edit Panel
     *
     * @param navBar
     *            {NavigationBar} Contains a reference to the currently displayed view.
     */
    saveEditPanel: function (navBar) {
        var me = this, view = navBar.getCurrentView(),
            record = view.getRecord(),
            store = Ext.getStore(view.getStoreId());

        // Check validation
        if (record.isValid()) {
            record.setChangedOnMobile();
            store.setAutoSync(false);
            store.add(record);
            store.sync(function () {
                store.setAutoSync(true);
                me.getMainView().pop();
            });
        } else {
            view.displayErrors(record);
        }
    },

    onAddOptions: function () {
        var sortField = this.getSortField();
        sortField.setOptions([
            {
                "displayValue": LocaleManager.getLocalizedString('Equipment'),
                "objectValue": "equipment"
            },
            {
                "displayValue": LocaleManager.getLocalizedString('Location'),
                "objectValue": "location"
            }
        ]);
    },

    onApplySort: function (field, value) {
        var taskStore = Ext.getStore('surveyTasksStore'),
            currentPage = taskStore.currentPage,
            eqSort = [
                    {
                        property: 'eq_id',
                        direction: 'ASC'
                    }
            ],
            locationSort = [
                {
                    property: 'bl_id',
                    direction: 'ASC'
                },
                {
                    property: 'fl_id',
                    direction: 'ASC'
                },
                {
                    property: 'rm_id',
                    direction: 'ASC'
                }
            ];

        if (value === 'equipment') {
            taskStore.setSorters(eqSort);
        } else {
            taskStore.setSorters(locationSort);
        }
        taskStore.loadPage(currentPage);
    }
});