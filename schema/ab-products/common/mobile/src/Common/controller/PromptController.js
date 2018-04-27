/**
 * Responsible for displaying processing prompt view messages.
 * <p>
 * Provides prompt search functions.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
// TODO method comments
// TODO the hardcoded functionality could be deduced from the schema, e.g. model relationships. It is similar to
// SelectValueDialog in WebCentral.
Ext.define('Common.controller.PromptController', {
	extend : 'Ext.app.Controller',

	requires : [ 'Common.util.Ui' ],

	config : {
		control : {
			'promptfield:not(promptfield[name=prob_type])' : {
				promptTapped : 'displayPrompt',
				change : 'onPromptValueChanged',
                clearicontap: 'onClearPrompt'
			},
			'promptBase searchfield' : {
				keyup : function (searchField) {
                    var me = this;
                    me.onPromptSearch(searchField);
                },
                clearicontap: function(searchField) {
                    this.onClearSearchFilter(searchField.getName());
                }
			}
		},

        // TODO: Store all prompt configuration info here.
        // TODO: Use this data to generate common functions.
        promptConfiguration: [
            {
                key: 'site_id',
                properties: {
                    storeId: 'sitesStore',
                    fields: ['site_id', 'name'],
                    children: ['bl_id'],
                    viewName: 'Site',
                    searchField: 'siteSearch',
                    filterFunction: null
                }
            },
            {
                key: 'bl_id',
                properties: {
                    storeId: 'buildingsStore',
                    fields: ['bl_id', 'name'],
                    children: ['fl_id', 'rm_id'],
                    viewName: 'Building',
                    searchField: 'buildingSearch',
                    filterFunction: null
                }
            },
            {
                key: 'fl_id',
                properties: {
                    storeId: 'floorsStore',
                    fields: ['fl_id', 'name'],
                    children: ['rm_id'],
                    viewName: 'Floor',
                    searchField: 'floorSearch',
                    filterFunction: 'applyFloorFilter'
                }
            },
            {
                key: 'rm_id',
                properties: {
                    storeId: 'roomsStore',
                    fields: ['rm_id','fl_id','bl_id'],
                    children: [],
                    viewName: 'Room',
                    searchField: 'roomSearch',
                    filterFunction: 'applyRoomFilter'
                }
            },
            {
                key: 'eq_id',
                properties: {
                    storeId: 'equipmentsStore',
                    fields: ['eq_id','eq_std'],
                    children: [],
                    viewName: 'Equipment',
                    searchField: 'equipmentSearch',
                    filterFunction: 'applyEquipmentFilter'
                }
            },
            {
                key: 'eq_std',
                properties: {
                    storeId: 'equipmentStandardsStore',
                    fields: ['eq_std','description'],
                    children: [],
                    viewName: 'EquipmentStandard',
                    searchField: 'equipmentStandardsSearch',
                    filterFunction: null
                }
            },
            {
                key: 'part_id',
                properties: {
                    storeId: 'partsStore',
                    fields: ['part_id', 'name'],
                    children: [],
                    viewName: 'Part',
                    searchField: 'partSearch',
                    filterFunction: null
                }
            },
            {
                key: 'dv_id',
                properties: {
                    storeId: 'divisionsStore',
                    fields: ['dv_id', 'name'],
                    children: ['dp_id'],
                    viewName: 'Division',
                    searchField: 'divisionSearch',
                    filterFunction: null
                }
            },
            {
                key: 'dp_id',
                properties: {
                    storeId: 'departmentsStore',
                    fields: ['dv_id', 'dp_id'],
                    children: [],
                    viewName: 'Department',
                    searchField: 'departmentSearch',
                    filterFunction: 'applyDepartmentFilter'
                }
            },
            {
                key: 'rm_type',
                properties: {
                    storeId: 'roomTypesStore',
                    fields: ['rm_type', 'rm_cat', 'description'],
                    children: [],
                    viewName: 'RoomType',
                    searchField: 'roomTypeSearch',
                    filterFunction: 'applyRoomTypeFilter'
                }
            },
            {
                key: 'rm_cat',
                properties: {
                    storeId: 'roomCategoriesStore',
                    fields: ['rm_cat', 'description'],
                    children: ['rm_type'],
                    viewName: 'RoomCategory',
                    searchField: 'roomCategoriesStore',
                    filterFunction: null
                }
            },
            {
                key: 'rm_std',
                properties: {
                    storeId: 'roomStandardsStore',
                    fields: ['rm_std', 'description'],
                    children: [],
                    viewName: 'RoomStandard',
                    searchField: 'roomStandardsStore',
                    filterFunction: null
                }
            }

        ],

        promptMap: null

	},

	init : function() {
		this.parentView = null;

        var promptMap = Ext.create('Ext.util.HashMap'),
            promptConfiguration = this.getPromptConfiguration();

        Ext.each(promptConfiguration, function (prompt) {
            promptMap.add(prompt.key, prompt.properties);
        });

        this.setPromptMap(promptMap);
	},

	getParentView : function() {
		return this.parentView;
	},

    displayPrompt : function(promptField) {

		var me = this,
            name = promptField.getName(),
            panelName = promptField.getPanelName(),
            parentView,
            promptView;

		if (!Ext.isEmpty(panelName)) {
			parentView = Ext.ComponentQuery.query(panelName)[0];
		} else {
			return;
		}

		this.parentView = parentView;

		// TODO extract method
		// TODO should this mapping be in an array?
		// Get the type of prompt from the promptFieldName
		switch (name) {
		case 'bl_id':
			promptView = me.getBuildingPromptView();
			break;
		case 'fl_id':
			promptView = me.getFloorPromptView();
			break;
		case 'rm_id':
			promptView = me.getRoomPromptView();
			break;
		case 'eq_id':
			promptView = me.getEquipmentPromptView();
			break;
		case 'part_id':
			promptView = me.getPartPromptView();
			break;
		case 'dv_id':
			promptView = me.getDivisionPromptView();
			break;
		case 'dp_id':
			promptView = me.getDepartmentPromptView();
			break;
		case 'rm_cat':
			promptView = me.getRoomCategoryPromptView();
			break;
		case 'rm_type':
			promptView = me.getRoomTypePromptView();
			break;
		case 'rm_std':
			promptView = me.getRoomStandardPromptView();
			break;
        case 'eq_std':
            promptView = me.getEquipmentStandardPromptView();
            break;
        case 'site_id':
            promptView = me.getSitePromptView();
            break;
		default:
			promptView = null;
			break;
		}

		// Do not display the prompt view if the promptField name is
		// not decoded. This prompt may be handled in a different controller.
		if (promptView === null) {
			return;
		}

        promptView.clearListSelection();
		Ext.Viewport.add(promptView);
		promptView.show();
	},

	/* Create and cache the Prompt Views */

	getProfileNamespace : function() {
		var namespace = this.getApplication().getCurrentProfile().getNamespace();
		return namespace;
	},

	getEquipmentPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.equipmentPromptView) {
			this.equipmentPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Equipment');
		}
		return this.equipmentPromptView;
	},

    getSitePromptView : function() {
        var profileNamespace = this.getProfileNamespace();
        if (!this.sitePromptView) {
            this.sitePromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Site');
        }
        return this.sitePromptView;
    },

	getBuildingPromptView : function() {
		var profileNamespace = this.getProfileNamespace();

		if (!this.buildingPromptView) {
			this.buildingPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Building');
		}
		return this.buildingPromptView;
	},

	getFloorPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.floorPromptView) {
			this.floorPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Floor');
		}
		return this.floorPromptView;
	},

	getRoomPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.roomPromptView) {
			this.roomPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Room');
		}
		return this.roomPromptView;
	},

	getPartPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.partPromptView) {
			this.partPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Part');
		}
		return this.partPromptView;
	},

	getDivisionPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.divisionPromptView) {
			this.divisionPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Division');
		}
		return this.divisionPromptView;
	},

	getDepartmentPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.departmentPromptView) {
			this.departmentPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.Department');
		}
		return this.departmentPromptView;
	},

	getRoomCategoryPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.roomCategoryPromptView) {
			this.roomCategoryPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.RoomCategory');
		}
		return this.roomCategoryPromptView;
	},

	getRoomTypePromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.roomTypePromptView) {
			this.roomTypePromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.RoomType');
		}
		return this.roomTypePromptView;
	},

	getRoomStandardPromptView : function() {
		var profileNamespace = this.getProfileNamespace();
		if (!this.roomStandardPromptView) {
			this.roomStandardPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.RoomStandard');
		}
		return this.roomStandardPromptView;
	},

    getEquipmentStandardPromptView: function () {
        var profileNamespace = this.getProfileNamespace();
        if (!this.equipmentStandardPromptView) {
            this.equipmentStandardPromptView = Ext.create('Common.view.prompt.' + profileNamespace + '.EquipmentStandard');
        }
        return this.equipmentStandardPromptView;
    },

	/* Prompt Selection Handlers */

	onEquipmentListSelection : function(list, record) {
		var eqId = record.get('eq_id'), parentView = this.getParentView();

		parentView.setValues({
			eq_id : eqId
		});
		this.getEquipmentPromptView().hide();
	},

	onPartListSelection : function(list, record) {
		var partId = record.get('part_id'), parentView = this.getParentView();

		parentView.setValues({
			part_id : partId
		});
		this.getPartPromptView().hide();
	},

    onSiteListSelection : function(list, record) {
        var siteId = record.get('site_id'),
            parentView = this.getParentView();

        parentView.setValues({
            rm_id : '',
            fl_id : '',
            bl_id : '',
            site_id : siteId
            //eq_id: ''
        });
        this.getSitePromptView().hide();
    },

	onBuildingListSelection : function(list, record) {

		var blId = record.get('bl_id'),
            siteId = record.get('site_id'),
            parentView = this.getParentView();

		parentView.setValues({
			rm_id : '',
			fl_id : '',
			bl_id : blId,
			site_id : siteId
            //eq_id: ''
		});

		this.getBuildingPromptView().hide();
	},

	onFloorListSelection : function(list, record) {
		var blId = record.get('bl_id'), flId = record.get('fl_id'), parentView = this.getParentView();

		parentView.setValues({
			rm_id : '',
			fl_id : flId,
			bl_id : blId
            //eq_id: ''
		});

		this.getFloorPromptView().hide();
	},

	onRoomListSelection : function(list, record) {
		var blId = record.get('bl_id'), flId = record.get('fl_id'), rmId = record.get('rm_id'), parentView = this
				.getParentView();

		parentView.setValues({
			rm_id : rmId,
			fl_id : flId,
			bl_id : blId
            //eq_id: ''
		});
		this.getRoomPromptView().hide();
	},

	onDivisionListSelection : function(list, record) {
		var dvId = record.get('dv_id'), parentView = this.getParentView();

		parentView.setValues({
			dv_id : dvId,
			dp_id : ''
		});
		this.getDivisionPromptView().hide();
	},

	onDepartmentListSelection : function(list, record) {
		var dvId = record.get('dv_id'), dpId = record.get('dp_id'), parentView = this.getParentView();

		parentView.setValues({
			dv_id : dvId,
			dp_id : dpId
		});
		this.getDepartmentPromptView().hide();
	},

	onRoomCategoryListSelection : function(list, record) {
		var rmCat = record.get('rm_cat'), parentView = this.getParentView();

		parentView.setValues({
			rm_cat : rmCat,
			rm_type : ''
		});
		this.getRoomCategoryPromptView().hide();
	},

	onRoomTypeListSelection : function(list, record) {
		var rmCat = record.get('rm_cat'), rmType = record.get('rm_type'), parentView = this.getParentView();

		parentView.setValues({
			rm_cat : rmCat,
			rm_type : rmType
		});
		this.getRoomTypePromptView().hide();
	},

	onRoomStandardListSelection : function(list, record) {
		var rmStd = record.get('rm_std'), parentView = this.getParentView();

		parentView.setValues({
			rm_std : rmStd
		});
		this.getRoomStandardPromptView().hide();
	},

    onEquipmentStandardListSelection : function(list, record) {
        var eqStd = record.get('eq_std'),
            parentView = this.getParentView();

        parentView.setValues({
            eq_std : eqStd
        });
        this.getEquipmentStandardPromptView().hide();
    },

    // TODO: Test bl,fl values
	onPromptValueChanged : function(promptField, newValue) {
		var me = this,
            fieldName = promptField.getName();
		console.log('Prompt changed ' + promptField.getName() + ' new value ' + newValue);

		switch (fieldName) {
        case 'site_id':
            me.applyBuildingFilter(false, {site_id: newValue});
            me.siteCode = newValue;
            break;
		case 'bl_id':
			me.applyFloorFilter(false, {bl_id: newValue});
			me.applyRoomFilter(false, {bl_id: newValue});
			me.applyEquipmentFilter(false, {bl_id: newValue});
            me.blCode = newValue;
			break;
		case 'fl_id':
			me.applyRoomFilter(false, {fl_id: newValue, bl_id: this.blCode});
			me.applyEquipmentFilter(false, {fl_id: newValue});
            me.flCode = newValue;
			break;
		case 'rm_id':
			me.applyEquipmentFilter(false, {rm_id:newValue, fl_id: this.flCode, bl_id: this.blCode});
			break;
		case 'dv_id':
			me.applyDepartmentFilter(false, {dv_id:newValue});
			break;
		case 'rm_cat':
			me.applyRoomTypeFilter(false, {rm_cat:newValue});
			break;
		}
	},

    applyBuildingFilter : function(isSearch, newValue) {
        var store = Ext.getStore('buildingsStore'),
                parentView = this.getParentView(),
                parentValues,
                siteId;

        if (parentView) {
            parentValues = parentView.getValues();
            siteId = parentValues.site_id;
        }

        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('site_id')) {
                siteId = newValue.site_id;
            }
        }

        if (!Ext.isEmpty(siteId)) {
            store.filter('site_id', siteId);

        }
        if (store.getFilters().length > 0) {
            store.loadPage(1);
        }
    },

	applyFloorFilter : function(isSearch, newValue) {
		var store = Ext.getStore('floorsStore'),
            parentView = this.getParentView(),
            parentValues,
            blId;

        if (parentView) {
            parentValues = parentView.getValues();
            blId = parentValues.bl_id;
        }

        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('bl_id')) {
                blId = newValue.bl_id;
            }
        }

        if (!Ext.isEmpty(blId)) {
            store.filter('bl_id', blId);

        }
		if (store.getFilters().length > 0) {
            store.loadPage(1);
        }
	},

	applyRoomFilter : function(isSearch, newValue) {
		var me = this,
            store = Ext.getStore('roomsStore'),
            parentView = this.getParentView(),
            parentValues,
            buildingCode,
            floorCode;

        if (parentView) {
            parentValues = parentView.getValues();
            buildingCode = parentValues.bl_id;
            floorCode = parentValues.fl_id;
        }

        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('bl_id')) {
                buildingCode = newValue.bl_id;
            }
            if (newValue && newValue.hasOwnProperty('fl_id')) {
                floorCode = newValue.fl_id;
            }
        }

		if (!Ext.isEmpty(buildingCode)) {
			store.filter('bl_id', buildingCode);
		}
		if (!Ext.isEmpty(floorCode)) {
			store.filter('fl_id', floorCode);
		}
		if (store.getFilters().length > 0) {
			store.loadPage(1, {
                callback : function(records) {
                    if (parentView) {
                        var promptField = parentView.query('promptfield[name=rm_id]'),
                                placeHolderText = '';
                        if (parentView && records.length === 0) {
                            placeHolderText = 'No Room Records to Display';
                        }
                        if (promptField && promptField.length > 0) {
                            promptField[0].setPlaceHolder(placeHolderText);
                        }
                    }
                },
                scope : me
            });
		}
	},

	applyEquipmentFilter : function(isSearch, newValue) {
		var me = this,
            store = Ext.getStore('equipmentsStore'),
            parentValues,
            parentView = this.getParentView(),
            blId,flId,rmId;

        if (parentView) {
            parentValues = parentView.getValues();
            blId = parentValues.bl_id;
            flId = parentValues.fl_id;
            rmId = parentValues.rm_id;
        }

        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('bl_id')) {
                blId = newValue.bl_id;
            }
            if (newValue && newValue.hasOwnProperty('fl_id')) {
                flId = newValue.fl_id;
            }
            if (newValue && newValue.hasOwnProperty('rm_id')) {
                rmId = newValue.rm_id;
            }
        }

		if (!Ext.isEmpty(blId)) {
			store.filter('bl_id', blId);
		}
		if (!Ext.isEmpty(flId)) {
			store.filter('fl_id', flId);
		}
		if (!Ext.isEmpty(rmId)) {
			store.filter('rm_id', rmId);
		}
        if (store.getFilters().length > 0) {
            store.loadPage(1, {
                callback : function(records) {
                    if (parentView) {
                        var promptField = parentView.query('promptfield[name=eq_id]'),
                                placeHolderText = '';
                        if (parentView && records.length === 0) {
                            placeHolderText = 'No Equipment Records to Display';
                        }
                        if (promptField && promptField.length > 0) {
                            promptField[0].setPlaceHolder(placeHolderText);
                        }
                    }
                },
                scope : me
            });
        }
	},

	applyDepartmentFilter : function(isSearch, newValue) {

		var me = this, store = Ext.getStore('departmentsStore'),
            parentValues,
            parentView = this.getParentView(),
            dvId;

        if (parentView) {
            parentValues = parentView.getValues();
            dvId = parentValues.dv_id;
        }
        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('dv_id')) {
                dvId = newValue.dv_id;
            }
        }
        if (!Ext.isEmpty(dvId)) {
            store.filter('dv_id', dvId);
        }
        if (store.getFilters().length > 0) {
            store.loadPage(1, {
                callback : function(records) {
                    if (parentView) {
                        var promptField = parentView.query('promptfield[name=dp_id]'),
                                placeHolderText = '';
                        if (parentView && records.length === 0) {
                            placeHolderText = 'No Department Records to Display';
                        }
                        if (promptField && promptField.length > 0) {
                            promptField[0].setPlaceHolder(placeHolderText);
                        }
                    }
                },
                scope : me
            });
        }
	},

	applyRoomTypeFilter : function(isSearch, newValue) {
		var me = this,
            store = Ext.getStore('roomTypesStore'),
            parentValues,
            parentView = this.getParentView(),
            rmCat;

        if (parentView) {
            parentValues = parentView.getValues();
            rmCat = parentValues.rm_cat;
        }

        if (!isSearch) {
            store.clearFilter();
            if (newValue && newValue.hasOwnProperty('rm_cat')) {
                rmCat = newValue.rm_cat;
            }
        }

        if (!Ext.isEmpty(rmCat)) {
            store.filter('rm_cat', rmCat);
        }
		if (store.getFilters().length > 0) {
            store.loadPage(1, {
                callback : function(records) {
                    if (parentView) {
                        var promptField = parentView.query('promptfield[name=rm_cat]'),
                                placeHolderText = '';
                        if (parentView && records.length === 0) {
                            placeHolderText = 'No Room Type Records to Display';
                        }
                        if (promptField && promptField.length > 0) {
                            promptField[0].setPlaceHolder(placeHolderText);
                        }
                    }
                },
                scope : me
            });
        }
	},

	/* Prompt Search Handlers */

	onPromptSearch : function(searchField) {
		var searchParams = this.getSearchFieldParameters(searchField.getName());
		this.doSearch(searchParams, searchField.getValue());
	},

	/**
	 * Clears the contents of the search field and removes the filter from the prompt store.
	 * 
	 * @param searchField -
	 *            The search field that initiated the action.
	 */
	onClearSearchFilter : function(searchField) {
		var me = this,
            searchParams = this.getSearchFieldParameters(searchField),
            store = searchParams.searchStore,
            filterFunction = searchParams.filterFunction;

		if (store) {
			store.clearFilter();
            if (filterFunction) {
                filterFunction.call(me, false);
            } else {
                // Load the first page here so we are not at the end of the list.
                store.loadPage(1);
            }
		}
	},

	/**
	 * Applies the value entered in the search field to the store filer.
	 * 
	 * @param searchParameters -
	 *            Search parameter object that contains the
	 *            <p>
	 *            prompt store and and filterField values
	 * @param value -
	 *            The value entered in the search field.
	 */
	doSearch : function(searchParameters, value) {
		var me = this,
            store = searchParameters.searchStore,
            filterFunction = searchParameters.filterFunction,
            filterFields = searchParameters.searchFields,
            filterArray = [];

        // Create Filters
        Ext.each(filterFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: value,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

		store.clearFilter();
        store.setFilters(filterArray);

        if (filterFunction) {
            filterFunction.call(me, true);
        } else {
            // Load the first page here so we are not at the end of the list.
            store.loadPage(1);
        }
	},

	/**
	 * Sets the prompt field to use to apply the search to.
	 * <p>
	 * Retrieves the store for the prompt list based on the search field name property.
	 * 
	 * @param searchField
	 *            The search field from the active prompt.
	 * @return params {Object} Contains the prompt view store and the search field.
	 */
	getSearchFieldParameters : function(searchFieldName) {
		var searchStore,
            filterFunction = null,
            params = {},
            searchFields = [];

		// TODO should this mapping be in an array?
		switch (searchFieldName) {
        case 'siteSearch':
            searchFields = ['site_id', 'name'];
            searchStore = Ext.getStore('sitesStore');
            break;
		case 'buildingSearch':
            searchFields = ['bl_id', 'name'];
			searchStore = Ext.getStore('buildingsStore');
			break;
		case 'floorSearch':
            searchFields = ['bl_id', 'fl_id', 'name'];
			searchStore = Ext.getStore('floorsStore');
            filterFunction = this.applyFloorFilter;
			break;
		case 'roomSearch':
            searchFields = ['bl_id', 'fl_id', 'rm_id'];
			searchStore = Ext.getStore('roomsStore');
            filterFunction = this.applyRoomFilter;
			break;
		case 'equipmentSearch':
            searchFields = ['eq_id', 'eq_std'];
			searchStore = Ext.getStore('equipmentsStore');
            filterFunction = this.applyEquipmentFilter;
			break;
		case 'partSearch':
            searchFields = ['part_id', 'description'];
			searchStore = Ext.getStore('partsStore');
			break;
		case 'divisionSearch':
            searchFields = ['dv_id', 'name'];
            searchStore = Ext.getStore('divisionsStore');
			break;
		case 'departmentSearch':
            searchFields = ['dv_id', 'dp_id'];
            searchStore = Ext.getStore('departmentsStore');
            filterFunction = this.applyDepartmentFilter;
			break;
		case 'roomCategorySearch':
            searchFields = ['rm_cat', 'description'];
            searchStore = Ext.getStore('roomCategoriesStore');
			break;
		case 'roomTypeSearch':
            searchFields = ['rm_type', 'rm_cat', 'description'];
            searchStore = Ext.getStore('roomTypesStore');
            filterFunction = this.applyRoomTypeFilter;
			break;
		case 'roomStandardsSearch':
            searchFields = ['rm_std', 'description'];
            searchStore = Ext.getStore('roomStandardsStore');
			break;
        case 'equipmentStandardsSearch':
            searchFields = ['eq_std'];
            searchStore = Ext.getStore('equipmentStandardsStore');
            break;
		}
		params.searchStore = searchStore;
        params.filterFunction = filterFunction;
        params.searchFields = searchFields;

		return params;
	},

    // TODO: Clear children search filters
    onClearPrompt: function(field, e) {
        var promptMap = this.getPromptMap(),
            properties = promptMap.get(field.getName()),
            panelName = field.getPanelName(),
            panel = Ext.ComponentQuery.query(panelName);

        if (properties) {
            this.onClearSearchFilter(properties.searchField);
            // Clear child values on the form
            if (panel && panel.length > 0)
            this.clearPanelFields(panel[0], properties.children);
        }
    },

    clearPanelFields: function(panel, panelFields) {
        Ext.each(panelFields, function(field) {
            var f = Ext.JSON.decode('{' + field + ':""}');
            panel.setValues(f);
        })
    }

});