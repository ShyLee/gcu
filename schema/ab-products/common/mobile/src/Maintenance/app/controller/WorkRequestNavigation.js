Ext.define('Maintenance.controller.WorkRequestNavigation', {
    extend: 'Common.controller.NavigationController',
    requires: [ 'Ext.SegmentedButton', 'Maintenance.util.ProblemTypeData',
                'Maintenance.util.WorkRequestFilter' ],

    config: {
        refs: {
            mainView: 'mainview',
            segmentedButton: 'workRequestPanel > toolbar[docked=bottom] > segmentedbutton',
            detailButton: 'workRequestPanel > toolbar[docked=bottom] > segmentedbutton button',
            myWorkSegmentedButton: 'workrequestListPanel > toolbar[docked=bottom] > segmentedbutton',
            workRequestView: 'workRequestPanel',
            photoPanel: 'workRequestPhotoPanel',
            workRequestListView: 'workrequestListPanel',
            documentListPanel: 'workRequestDocumentListPanel'
        },

        control: {
            segmentedButton: {
                toggle: function (segmentedButton, button, isPressed, eOpts) {
                    // Get the workrequest id to pass to the
                    // next form
                    // TODO: see if we can use the workRequestId
                    // property
                    var record = this.getWorkRequestView().getRecord(), viewIds = {
                        workRequestId: record.get('wr_id'),
                        mobileId: record.getId()
                    };
                    this.onDisplayChildView(segmentedButton, button, isPressed, eOpts, viewIds, record);
                }
            },
            myWorkSegmentedButton: {
                toggle: 'onFilterMyWorkList'
            },
            workRequestPanel: {
                show: 'onShowWorkRequestView'
            },
            workrequestListPanel: {
                initialize: 'onWorkRequestListInitialized'
            },
            documentListPanel: {
                itemsingletap: function (list, index, target, record) {
                    this.displayUpdatePanel(list, record);
                }
            },
            photoPanel: {
                photoattached: function (record) {
                    this.setBadgeText(record);
                }
            },
            mainView: {
                push: 'onPushed'
            },
            detailButton: {
                tap: 'onDisplayChildView'
            }
        },

        enableChildViewSelection: true
    },

    /**
     * The store ids of each of the work request child stores. Storing these values makes manipulating
     * the stores easier.
     */
    childStoreIds: [ 'workRequestPartsStore', 'workRequestCraftspersonsStore', 'workRequestCostsStore' ],

    /**
     * Overide the Common.view.NavigationController displayUpdatePanel function so we can get the
     * selected wr_id value and filter the child stores.
     *
     * @override
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        var me = this,
            editView = view.getEditViewClass(),
            updateView = Ext.create(editView),
            wrId = record.get('wr_id'),
            mobileId = record.getId(),
            requestType = record.get('request_type'),
            lastViewPushed = me.getLastPushedView();

        if(lastViewPushed === updateView.$className) {
            updateView.destroy();
            return;
        }
        this.setLastPushedView(updateView.$className);

        // Filter the child stores if we are at the main work
        // request list
        // form.
        if (view.isWorkRequestList) {

            // Hide the segmented buttons if this is a Service
            // Request
            if (updateView.getIsCreateView() || (Ext.isDefined(requestType) && requestType === 1)) {
                this.getSegmentedButton().setHidden(true);
            }

            // Filter child stores.
            // We are using a remote filter so we have to wait
            // for
            // the stores to load before pushing the view.
            me.filterChildStores(mobileId, function () {
                updateView.setViewIds({
                    workRequestId: wrId,
                    mobileId: mobileId
                });
                me.pushView(record, updateView);
            }, me);
        } else {
            updateView.setViewIds({
                workRequestId: wrId,
                mobileId: mobileId
            });
            me.pushView(record, updateView);
        }
    },

    pushView: function (record, view) {
        view.setRecord(record);
        this.getMainView().push(view);
    },

    onViewPopped: function (navView, poppedView) {
        this.callParent(arguments);

        if (this.isWorkRequestEditView(poppedView)) {
            var myWorkSegmentedButton = this.getMyWorkSegmentedButton(),
                pressedButton = myWorkSegmentedButton.getPressedButtons();

            if (pressedButton && pressedButton.length > 0) {
                var actionId = pressedButton[0].config.actionId || pressedButton[0].actionId;
                this.setMyWorkTitle(actionId === 'MYWORK');
            }
        }
    },

    onPushed: function (navView, pushedView) {
        var segmentedButton = this.getSegmentedButton();

        if (segmentedButton) {
            segmentedButton.setDisabled(false);
        }
    },

    /**
     * @override
     * @param navBar
     */
    displayAddPanel: function (navBar) {
        var me = this,
            currentView = navBar.getCurrentView(),
            editViewClassName = currentView.getEditViewClass(),
            view = Ext.create(editViewClassName, {
                isCreateView: true
            });

        // If the current view is the main view and we are
        // creating a new work request
        // we need to determine if the new work request is for
        // My Work or My Request
        if (currentView.xtype === 'tabletMainview' || currentView.xtype === 'phoneMainView') {
            var workRequestListDisplayMode = me.getWorkRequestListView().getDisplayMode();
            if (me.isWorkRequestEditView(view)) {
                if (view.getIsCreateView()) {
                    me.clearPromptStoreFilters(view);
                }
                view.setRequestType(workRequestListDisplayMode);
            }
        }

        // If the add panel is launched from a child list we
        // need to set the wr_id value
        // of the new view.
        if (currentView instanceof Common.view.navigation.ListBase) {
            var viewIds = currentView.getViewIds(),
                record = view.getRecord();

            record.set('wr_id', viewIds.workRequestId);
            record.set('mob_wr_id', viewIds.mobileId);
            view.setViewIds(viewIds);
        }
        me.getMainView().push(view);
    },

    onDisplayChildView: function (button) {
        var me = this,
            view,
            workRequestView = me.getWorkRequestView(),
            storeRecordCounts = me.getRecordCounts(),
            lastViewPushed = me.getLastPushedView(),
            enableViewSelection = me.getEnableChildViewSelection(),
            buttonItemId = button.getItemId(),
            viewIds = workRequestView.getViewIds(),
            segmentedButton = me.getSegmentedButton(),
            record = workRequestView.getRecord();

        me.startChildViewSelectionTimer();
        if (!enableViewSelection) {
            console.log('---> reject button ');
            return;
        }
        me.setEnableChildViewSelection(false);

        console.log('actionId ' + buttonItemId);
        if (buttonItemId === 'costsButton') {
            view = me.getViewToDisplay(storeRecordCounts.costsCount, 'Cost', viewIds);
        } else if (buttonItemId === 'partsButton') {
            view = me.getViewToDisplay(storeRecordCounts.partsCount, 'Part', viewIds);
        } else if (buttonItemId === 'laborButton') {
            view = me.getViewToDisplay(storeRecordCounts.craftsPersonsCount, 'Craftsperson',
                    viewIds);
        } else if (buttonItemId === 'documentsButton') {
            view = Ext.create('Maintenance.view.WorkRequestDocuments', {
                record: record
            });
        }
        segmentedButton.setPressedButtons([]);
        if (view) {
            console.log('Display view ' + view.$className);
            if(lastViewPushed === view.$className) {
                view.destroy();
                return;
            }
            me.setLastPushedView(view.$className);
            me.getMainView().push(view);
        }
    },

    startChildViewSelectionTimer: function () {
        var me = this;
        setTimeout(function () {
            console.log('reset timer');
            me.setEnableChildViewSelection(true);
        },1000);
    },

    getViewToDisplay: function (storeCount, viewName, viewIds) {
        var fullViewName = 'Maintenance.view.WorkRequest' + viewName, view, record;

        if (storeCount > 0) {
            view = Ext.create(fullViewName + 'List', {
                viewIds: viewIds
            });
        } else {
            view = Ext.create(fullViewName + 'Edit', {
                isCreateView: true
            });

            record = view.getRecord();
            record.set('wr_id', viewIds.workRequestId);
            record.set('mob_wr_id', viewIds.mobileId);

            view.setValues({
                'wr_id': viewIds.workRequestId
            });
        }

        return view;
    },

    filterChildStores: function (mobileId, callback, scope) {

        var me = this,
            numberOfStoresToLoad = this.childStoreIds.length,
            onAllStoresLoaded = function (count) {
                if (count === 0) {
                    if (typeof callback === 'function') {
                        callback.call(scope || me);
                    }
                }
            };

        Ext.each(this.childStoreIds, function (storeId) {
            var store = Ext.getStore(storeId),
                onStoreLoad = function () {
                    numberOfStoresToLoad -= 1;
                    onAllStoresLoaded(numberOfStoresToLoad);
                };

            store.filter('mob_wr_id', mobileId);
            store.load({
                callback: onStoreLoad,
                scope: me
            });
        }, me);
    },

    onShowWorkRequestView: function (view) {
        var record = view.getRecord();
        this.setBadgeText(record);
    },

    setBadgeText: function (record) {
        // Set the badge text of the segmented buttons
        var recordCounts = this.getRecordCounts(record),
            segmentedButton = this.getSegmentedButton(),
            innerButtons = segmentedButton.getItems().items;

        innerButtons[0].setBadgeText(this.getBadgeText(recordCounts.craftsPersonsCount));
        innerButtons[1].setBadgeText(this.getBadgeText(recordCounts.partsCount));
        innerButtons[2].setBadgeText(this.getBadgeText(recordCounts.costsCount));
        innerButtons[3].setBadgeText(this.getBadgeText(recordCounts.photosCount));
    },

    getRecordCounts: function (record) {
        var craftsPersonStore = Ext.getStore('workRequestCraftspersonsStore'),
            partsStore = Ext.getStore('workRequestPartsStore'),
            costsStore = Ext.getStore('workRequestCostsStore'),
            workRequestDocumentCount = this.getDocumentCount(record);

        return {
            partsCount: partsStore.getCount(),
            craftsPersonsCount: craftsPersonStore.getCount(),
            costsCount: costsStore.getCount(),
            photosCount: workRequestDocumentCount
        };
    },

    getDocumentCount: function (record) {
        var data, documentCount = 0;
        if (record) {
            data = record.getData();
            if (data.doc1 !== null) {
                documentCount += 1;
            }
            if (data.doc2 !== null) {
                documentCount += 1;
            }
            if (data.doc3 !== null) {
                documentCount += 1;
            }
            if (data.doc4 !== null) {
                documentCount += 1;
            }
        }
        return documentCount;
    },

    getBadgeText: function (recordCount) {
        return recordCount > 0 ? recordCount.toString() : '';
    },

    onFilterMyWorkList: function (segmentedButton, button, isPressed) {
        var actionId = button.actionId || button.config.actionId,
            buttons = segmentedButton.getItems().items,
            showMyWork = actionId === 'MYWORK', i;

        if (isPressed) {
            // Reset the ui style for all buttons
            for (i = 0; i < buttons.length; i++) {
                buttons[i].setUi('normal');
            }

            // Set the ui style for the selected button
            button.setUi('base');
            this.setMyWorkTitle(showMyWork);
            WorkRequestFilter.applyMyWorkListFilter(showMyWork);
        }
    },

    setMyWorkTitle: function (showMyWork) {
        var navigationBar = this.getMainView().getNavigationBar(),
                title = showMyWork ? LocaleManager.getLocalizedString('My Work', 'Maintenance.controller.WorkRequestNavigation')
                        : LocaleManager.getLocalizedString('My Requests', 'Maintenance.controller.WorkRequestNavigation'),
                workRequestListView = this.getWorkRequestListView();

        // Set the display mode of the work request view
        workRequestListView.setDisplayMode(showMyWork ? 'MyWork' : 'MyRequests');

        // Don't set the title if we are running on a phone.
        if (Ext.os.is.Phone) {
            title = '';
        }
        navigationBar.setTitle(title);
    },

    onWorkRequestListInitialized: function () {
        WorkRequestFilter.applyMyWorkListFilter(true);
    },

    /**
     * @override
     * @param navBar
     */
    saveEditPanel: function (navBar) {
        var me = this,
            view = navBar.getCurrentView(),
            record = view.getRecord(),
            store = Ext.getStore(view.getStoreId()),
            userProfile = Common.util.UserProfile.getUserProfile(),
            isWorkRequestEditView = me.isWorkRequestEditView(view),
            workRequestListView = me.getWorkRequestListView(),
            activeWorkSelection = workRequestListView.getActiveWorkSelection(),

            onStoreWriteCompleted = function () {
                // If we are creating a new work request view we
                // need to save the Craftsperson record
                if (isWorkRequestEditView && activeWorkSelection === 'MyWork' && view.getIsCreateView()) {
                    console.log('Create Craftsperson');
                    view.setIsCreateView(false);
                    me.createCraftspersonRecord(record);
                } else {
                    me.getMainView().pop();
                    // Only refresh the store if we are creating a new My Request
                    // The Sencha list rendering is flaky if we refresh the store
                    // after updating a child record.
                    if(activeWorkSelection === 'MyRequest') {
                        Ext.getStore('workRequestsStore').loadPage(1);
                    }
                }
            };

        // Users should use the My Requests tab if they are not a craftsperson
        if (isWorkRequestEditView && activeWorkSelection === 'MyWork' &&
                view.getIsCreateView() && (userProfile.cf_id === null || userProfile.cf_id === '')) {
            Ext.Msg.alert('User Account', 'Your account does not have Craftsperson access. Submit Work Requests using the My Request tab.');
            return;
        }

        // Check validation
        if (record.isValid()) {
            record.setChangedOnMobile();
            me.setTimeAssigned(record);
            me.setMyRequestStatus(view, record, activeWorkSelection);
            store.add(record);
            store.sync(onStoreWriteCompleted, Ext.emptyFn, me);
        } else {
            view.displayErrors(record);
        }
    },

    // Set the status to issued for all new My Work records.
    setMyRequestStatus: function (view, record, activeWorkSelection) {
        if (this.isWorkRequestEditView(view)) {
            if (activeWorkSelection === 'MyWork') {
                if(view.getIsCreateView()) {
                    record.set('status', 'I');
                }
                record.set('request_type', 0);
            } else {
                record.set('request_type', 1);
            }
        }
    },

    /**
     * Sets the time_assigned value for new craftsperson and new part records to the current time
     * When new models are created the framework uses cached versions of the models when creating the
     * new instances. The time assigned values are reused which causes the record primary key to not
     * be unique.
     * It should be possible to handle this case in the framework. I could not find out how.
     * @param record {Model} The record to be saved.
     */
    setTimeAssigned: function(record) {
        if (record.phantom && (record instanceof Maintenance.model.WorkRequestCraftsperson ||
                   record instanceof Maintenance.model.WorkRequestPart)) {
            record.set('time_assigned', new Date());
        }
    },

    createCraftspersonRecord: function (workRequestRecord) {
        var me = this,
            craftsPersonModel = Ext.create('Maintenance.model.WorkRequestCraftsperson'),
            craftsPersonStore = Ext.getStore('workRequestCraftspersonsStore'),
            userProfile = Common.util.UserProfile.getUserProfile(),
            onStoreWriteCompleted = function () {
                craftsPersonModel.setDisableValidation(false);
                me.getMainView().pop();
                Ext.getStore('workRequestsStore').loadPage(1);
            };

        // The craftsperson check should never be needed since we check the
        // users access in the saveEditPanel function. It is here as a safeguard.
        if (userProfile.cf_id === null || userProfile.cf_id === '') {
            Ext.Msg.alert('Validation', 'Craftsperson is required.');
            me.getMainView().pop();
            Ext.getStore('workRequestsStore').loadPage(1);
            return;
        }

        craftsPersonModel.set('cf_id', userProfile.cf_id);
        craftsPersonModel.set('mob_wr_id', workRequestRecord.getId());
        craftsPersonModel.set('mob_is_changed', 1);

        craftsPersonModel.setDisableValidation(true);
        craftsPersonStore.add(craftsPersonModel);
        craftsPersonStore.sync(onStoreWriteCompleted, Ext.emptyFn, me);
    },

    /**
     * Returns true if the view is a Work Request view.
     * A view is a Work Request view if the views xtype is
     * workRequestPanel or tabletWorkRequestPanel
     * @param view
     */
    isWorkRequestEditView: function (view) {
        return view.xtype === 'workRequestPanel' || view.xtype === 'tabletWorkRequestPanel';
    },

    /**
     * Clears the location prompts when displaying a create work request form.
     * Always clears the building prompt filter.
     * @param view
     */
    clearPromptStoreFilters: function(view) {
        var storeIds = ['buildingsStore', 'floorsStore', 'roomsStore', 'equipmentsStore'],
            blId = view.getValues().bl_id,
            ln = storeIds.length,
            store,
            i;

        //Always clear the building filter
        if(!Ext.isEmpty(blId)) {
            ln = 1;
        }

        for(i=0; i<ln; i++) {
            store = Ext.getStore(storeIds[i]);
            store.clearFilter(true);
            store.loadPage(1);
        }
    }
});