Ext.define('Campus.controller.SpaceBookNavigation', {
    extend: 'Common.controller.NavigationController',

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
            },

            mainView: {
                pop: 'onViewPopped'
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
        // removed from the
        // navigation view.

        var editView = view.getEditViewClass(), updateView = Ext.create(editView);

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
            activePlanType;

        if (view.xtype === 'roomSurveyPanel') {
            floorPlanView = this.getFloorPlanView();
            activePlanType = floorPlanView.getPlanType();

            if (activePlanType === '9 - SURVEY') {
                floorPlanView.updateSurveyPlanHighlights();
            }
        }
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
            var siteId = record.get('site_id'),
                buildingsStore = Ext.getStore('spaceBookBuildings');

            buildingsStore.clearFilter();
            buildingsStore.filter('site_id', siteId);
            buildingsStore.loadPage(1);
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
                } else {
                    // TODO: Check for server connection
                    svgData = Common.util.Drawing.getSVGFromServer(parameters);
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
            buildingsStore = Ext.getStore('spaceBookBuildings'),
            siteMapView = navController.getSiteMap(),
            buildingRecord;

        buildingsStore.clearFilter();
        buildingsStore.filter('bl_id', blId);
        buildingsStore.load(function (records) {
            buildingRecord = records ? records[0] : null;
            navController.displayUpdatePanel(siteMapView, buildingRecord);
        });
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
        var floorPlanSegmentedButton = this.getFloorPlanSegmentedButton();
        // TODO: Set the view title to use the building name

        view.setRecord(record);
        floorPlanSegmentedButton.setPressedButtons(0);
    },

    onShowSiteDetail: function (button) {

        var record = button.getRecord();

        // Disable the list tap event to prevent navigation to
        // the detail list
        this.setDisableListTapEvent(true);

        if (!this.siteProfileView) {
            this.siteProfileView = Ext.create('Campus.view.SiteProfile');
            Ext.Viewport.add(this.siteProfileView);
        }

        this.siteProfileView.setRecord(record);
        this.siteProfileView.show();

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
            this.blProfileView = Ext.create('CampusCam.view.BuildingProfile');
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
        var record = button.getRecord();
        this.setDisableListTapEvent(true);

        if (!this.floorProfileView) {
            this.floorProfileView = Ext.create('Campus.view.FloorProfile');
            Ext.Viewport.add(this.floorProfileView);
        }

        this.floorProfileView.setRecord(record);
        this.floorProfileView.show();
    }
});