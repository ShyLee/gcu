Ext.define('SpaceBook.controller.SpaceBookNavigation', {
    extend: 'Common.controller.NavigationController',

    requires: 'SpaceBook.util.RoomHighlight',

    config: {
        refs: {
            mainView: 'mainview',
            buildingsSegmentedButton: 'sitePanel > toolbar > segmentedbutton',
            siteList: 'siteListPanel',
            siteProfilePanel: 'siteProfilePanel',
            siteMap: 'siteMapPanel',
            buildingList: 'buildingsListPanel',
            buildingProfilePanel: 'buildingProfilePanel',
            floorList: 'floorsListPanel',
            floorProfilePanel: 'floorProfilePanel',
            roomList: 'roomsurveylist',
            floorPlanSegmentedButton: 'floorPlanPanel > toolbar > segmentedbutton[itemId=planTypeButton]',
            siteView: 'sitePanel',
            floorPlanView: 'floorPlanPanel'
        },

        control: {
            sitesSegmentedButton: {
                toggle: 'onSiteSegmentedButtonToggled'
            },
            buildingsSegmentedButton: {
                toggle: 'onBuildingSegmentedButtonToggled'
            },
            'button[action=showSiteDetail]': {
                tap: 'onShowSiteDetail'
            },
            'button[action=showBuildingDetail]': {
                tap: 'onShowBuildingDetail'
            },
            'button[action=showFloorDetail]': {
                tap: 'onShowFloorDetail'
            },
            siteList: {
                itemsingletap: 'onSiteListTapped'
            },
            siteProfilePanel: {
                hide: function () {
                    this.setDisableListTapEvent(false);
                }
            },
            buildingList: {
                itemsingletap: 'onBuildingListTapped'
            },

            buildingProfilePanel: {
                hide: function () {
                    this.setDisableListTapEvent(false);
                }
            },
            floorList: {
                itemsingletap: 'onFloorListTapped'
            },
            floorProfilePanel: {
                hide: function () {
                    this.setDisableListTapEvent(false);
                }
            }
        },

        disableListTapEvent: false
    },

    // Override the Common.controller.NavigatonController
    // displayUpdatePanel function so
    // we can display a child list

    /**
     * Displays an Edit Panel when the disclose action is fired by a List Panel. The Edit panel contains
     * the record from the list row that was clicked. The Edit Panel that is displayed is determined by
     * the List View editViewClass configuration property.
     *
     * @param view
     *            {Container} The List View that generated the itemDisclosed event.
     * @param record
     *            {Model} The record associated with the List View row that was clicked.
     */
    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when
        // removed from the navigation view.

        var editView = view.getEditViewClass(),
            updateView = Ext.create(editView),
            lastViewPushed = this.getLastPushedView();

        if(lastViewPushed === updateView.$className) {
            updateView.destroy();
            return;
        }
        this.setLastPushedView(updateView.$className);

        // Check if this is a list or edit view
        if (updateView.isNavigationList) {
            if (typeof updateView.setParentId === 'function') {
                if (updateView.xtype === 'sitePanel') {
                    updateView.setParentId(record.get('site_id'));
                }
                if (updateView.xtype === 'floorsListPanel') {
                    updateView.setParentId(record.get('bl_id'));
                }
            }
            this.setListFilter(updateView.xtype, record);
        } else if (updateView.isDrawingView) {
            // Retrieve drawing data for the selected floor
            //alert('Start loadFloorPlanData ' + new Date());
            console.log('Start loadFloorPlanData ' + new Date());
            this.loadFloorPlanData(updateView, record);
        } else {
            updateView.setRecord(view, record);
        }

        this.getMainView().push(updateView);

        // TODO: Find out why this needs to go here.
        if (updateView.xtype === 'sitePanel') {
            var siteListRecord = this.getSiteList().getRecord(),
                buildingsSegmentedButton = this.getBuildingsSegmentedButton(),
                activeButton;

            activeButton = siteListRecord.get('detail_dwg') ? 1 : 0;
            buildingsSegmentedButton.setPressedButtons(activeButton);
        }
    },

    onViewPopped: function (mainView, view) {
        var floorPlanView,
            activePlanType,
            siteId;

        this.setLastPushedView('');

        if (view.xtype === 'roomSurveyPanel') {
            console.log('[DEBUG] Start Room Survey panel view pop ' + new Date());
            floorPlanView = this.getFloorPlanView();
            activePlanType = floorPlanView.getPlanType();

            if (activePlanType === '9 - SURVEY') {
                SpaceBook.util.RoomHighlight.updateSurveyPlanHighlights(view.getRecord());
            }
            console.log('[DEBUG] End Room Survey panel view pop ' + new Date());
        }

        if (view.xtype === 'floorsListPanel') {
            // Reset the building list filter
            // get the site id
            siteId = mainView.getNavigationBar().getCurrentView().getParentId();
            this.applySiteFilter(siteId);
        }
    },

    applySiteFilter: function(siteId) {
        var buildingsStore = Ext.getStore('spaceBookBuildings'),
            filter;

        buildingsStore.clearFilter();
        if(siteId === null) {
            filter = Ext.create('Common.util.Filter', { property:'site_id',
                value: '',
                matchIsNullValue: true,
                isEqualNull: true
            });
            buildingsStore.filter([filter]);
        } else {
            buildingsStore.filter('site_id', siteId);
        }
        buildingsStore.loadPage(1);
    },

    /**
     * Filters the Building and Floor lists based on the parent list parameters.
     *
     * @param listViewXtype
     *            {String} The xtype of the list to be displayed
     * @param record
     *            {Model} The model instance of the selected parent item.
     */
    setListFilter: function (listViewXtype, record) {
        if (listViewXtype === 'sitePanel') {
            // Filter by site id
            var siteId = record.get('site_id');
            this.applySiteFilter(siteId);
        }

        if (listViewXtype === 'floorsListPanel') {
            var blId = record.get('bl_id'),
                floorsStore = Ext.getStore('spaceBookFloors');

            floorsStore.clearFilter();
            floorsStore.filter('bl_id', blId);
            floorsStore.loadPage(1);
        }
    },

    onBuildingSegmentedButtonToggled: function (segmentedButton, button, isPressed) {

        var itemId = button.getItemId(),
            buildingList = this.getBuildingList(),
            siteMap = this.getSiteMap();

        // Toggle the Site view between the list and map views.
        if (isPressed) {
            if (itemId === 'buildingList') {
                siteMap.setHidden(true);
                buildingList.setHidden(false);
            }
            if (itemId === 'siteMap') {
                this.showSiteMap();
                siteMap.setHidden(false);
                buildingList.setHidden(true);
            }
        }
    },

    // TODO: similar to show floor plan
    showSiteMap: function () {
        var me = this,
            siteMap = this.getSiteMap(),
            siteId = this.getSiteView().getParentId(),
            siteDrawingStore = Ext.getStore('siteDrawings'),
            svgData = '';

        var parameters = {
            highlightParameters: [
                {
                    'view_file': 'ab-sp-space-book-bl.axvw',
                    'hs_ds': 'ds_ab-sp-space-book-bl_blHighlight',
                    'label_ds': 'ds_ab-sp-space-book-bl_blLabel',
                    'label_ht': '3'
                }
            ],
            pkeyValues: {
                'site_id': siteId
            }
        };

        var doProcessSvg = function (svgData) {
            siteMap.processSvg(siteMap, 'siteDiv', svgData, [
                {
                    assetType: 'bl',
                    handler: me.onClickBuilding,
                    scope: me
                }
            ]);
        };

        siteDrawingStore.clearFilter();
        siteDrawingStore.filter('site_id', siteId);
        siteDrawingStore.load(function (records) {
            if (records && records.length > 0) {
                svgData = records[0].get('svg_data');
                if (svgData !== null) {
                    doProcessSvg(svgData);
                }
            }
        });
    },

    /**
     * When a building is clicked on the site map
     *
     * @param bl_id
     */
    onClickBuilding: function (blId) {
        var me = this,
            navController = me.scope,
            siteMapView = navController.getSiteMap();

        console.log('Building tapped ' + blId + ' ' + new Date());
        navController.getBuildingRecord(blId, function(buildingRecord) {
            console.log('Got Building record ' + new Date());
            navController.displayUpdatePanel(siteMapView, buildingRecord);
        }, navController);
    },

    getBuildingRecord: function(blId, onCompleted, scope) {
        var me = this,
            buildingsStore = Ext.getStore('spaceBookBuildings'),
            currentFilter = buildingsStore.getFilters();

        buildingsStore.clearFilter();
        buildingsStore.filter('bl_id', blId);
        buildingsStore.load(function(records) {
            var buildingRecord = null;
            if(records && records.length > 0) {
                buildingRecord = records[0];
            }
            buildingsStore.clearFilter();
            buildingsStore.setFilters(currentFilter);
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me, buildingRecord);
            }
        })
    },

    /**
     * Loads the floor plan SVG for the Floor Plan views.
     *
     * @param view
     *            The Floor Plan view
     * @param record
     *            {Model} The building model instance.
     */

    loadFloorPlanData: function (view, record) {
        var floorPlanSegmentedButton = this.getFloorPlanSegmentedButton(),
            title;

        view.setRecord(record);
        title = 'Floor Plans ' + record.get('bl_id') + '-' + record.get('fl_id');
        view.setTitle(title);
        floorPlanSegmentedButton.setPressedButtons(0);
    },

    onShowSiteDetail: function (button) {

        var me = this,
            record = button.getRecord();

        // Disable the list tap event to prevent navigation to
        // the detail list
        me.setDisableListTapEvent(true);

        if (!me.siteProfileView) {
            me.siteProfileView = Ext.create('SpaceBook.view.SiteProfile');
            Ext.Viewport.add(this.siteProfileView);
        }

        me.siteProfileView.setRecord(record);
        me.siteProfileView.show();

    },

    onSiteListTapped: function (list, index, target, record) {
        var isListTapEventDisabled = this.getDisableListTapEvent();
        if (isListTapEventDisabled) {
            return;
        }

        this.getSiteList().setRecord(record);
        this.displayUpdatePanel(list, record);
    },

    onShowBuildingDetail: function (button) {

        var record = button.getRecord();

        this.setDisableListTapEvent(true);

        if (!this.blProfileView) {
            this.blProfileView = Ext.create('SpaceBook.view.BuildingProfile');
            Ext.Viewport.add(this.blProfileView);
        }

        this.blProfileView.setRecord(record);
        this.blProfileView.show();
    },

    onBuildingListTapped: function (list, index, target, record) {
        var isListTapEventDisabled = this.getDisableListTapEvent();
        if (isListTapEventDisabled) {
            return;
        }
        this.displayUpdatePanel(list, record);
    },

    onFloorListTapped: function (list, index, target, record) {
        var me = this, isListTapEventDisabled = this.getDisableListTapEvent(), blId, flId;

        if (isListTapEventDisabled) {
            return;
        }

        blId = record.get('bl_id');
        flId = record.get('fl_id');

        // Apply the room list filter
        // TODO: work this in with the other filter functions
        me.applyRoomListFilter(blId, flId, function () {
            me.displayUpdatePanel(list, record);
        });
    },

    applyRoomListFilter: function (blId, flId, onLoadComplete, scope) {
        var me = this, roomStore = Ext.getStore('roomsStore');

        roomStore.clearFilter();
        roomStore.filter('bl_id', blId);
        roomStore.filter('fl_id', flId);
        roomStore.load(function () {
            if (typeof onLoadComplete === 'function') {
                onLoadComplete.call(scope || me);
            }
        });

    },

    onShowFloorDetail: function (button) {
        var me = this,
            record = button.getRecord(),
            blId = record.get('bl_id');

        me.setDisableListTapEvent(true);

        if (!me.floorProfileView) {
            me.floorProfileView = Ext.create('SpaceBook.view.FloorProfile');
            Ext.Viewport.add(this.floorProfileView);
        }

        // Get the building name
        SpaceBook.util.Ui.getBuildingRecord(blId, function (blRecord) {
            if (blRecord && blRecord.length > 0) {
                record.set('blName', blRecord[0].get('name'));
            }
            me.floorProfileView.setRecord(record);
            me.floorProfileView.show();
        }, me);
    }
});