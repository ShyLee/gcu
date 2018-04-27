Ext.define('Common.controller.tablet.PromptController', {
	extend : 'Common.controller.PromptController',

	config : {
		refs : {
			buildingPrompt : 'tabletBuildingPrompt',
			floorPrompt : 'tabletFloorPrompt',
			roomPrompt : 'tabletRoomPrompt',
			equipmentPrompt : 'tabletEquipmentPrompt',
			partPrompt : 'tabletPartPrompt',
            divisionPrompt: 'tabletDivisionPrompt',
            departmentPrompt: 'tabletDepartmentPrompt',
            roomCategoryPrompt: 'tabletRoomCategoryPrompt',
            roomTypePrompt: 'tabletRoomTypePrompt',
            roomStandardPrompt: 'tabletRoomStandardPrompt',
            equipmentStandardPrompt: 'tabletEquipmentStandardPrompt',
            sitePrompt: 'tabletSitePrompt'
		},

		control : {
            sitePrompt : {
                promptitemtapped : 'onSiteListSelection'
            },
			buildingPrompt : {
				promptitemtapped : 'onBuildingListSelection'
			},
			floorPrompt : {
				promptitemtapped : 'onFloorListSelection'
			},
			roomPrompt : {
				promptitemtapped : 'onRoomListSelection'
			},
			equipmentPrompt : {
				promptitemtapped : 'onEquipmentListSelection'
			},
			partPrompt : {
				promptitemtapped : 'onPartListSelection'
			},
            divisionPrompt: {
                promptitemtapped : 'onDivisionListSelection'
            },
            departmentPrompt: {
                promptitemtapped : 'onDepartmentListSelection'
            },
            roomCategoryPrompt: {
                promptitemtapped: 'onRoomCategoryListSelection'
            },
            roomTypePrompt: {
                promptitemtapped: 'onRoomTypeListSelection'
            },
            roomStandardPrompt: {
                promptitemtapped: 'onRoomStandardListSelection'
            },
            equipmentStandardPrompt: {
                promptitemtapped: 'onEquipmentStandardListSelection'
            }


		}
	}
});