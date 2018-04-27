Ext.define('Common.controller.phone.PromptController', {
	extend : 'Common.controller.PromptController',

	requires : 'Common.view.prompt.phone.Part',

	config : {
		refs : {
			buildingPrompt : 'phoneBuildingPrompt',
			floorPrompt : 'phoneFloorPrompt',
			roomPrompt : 'phoneRoomPrompt',
			equipmentPrompt : 'phoneEquipmentPrompt',
			partPrompt : 'phonePartPrompt',
            divisionPrompt: 'phoneDivisionPrompt',
            departmentPrompt: 'phoneDepartmentPrompt',
            sitePrompt: 'phoneSitePrompt',
            equipmentStandardPrompt: 'phoneEquipmentStandardPrompt'
		},

		control : {
			buildingPrompt : {
				promptitemtapped : 'onBuildingListSelection',
				promptcancelled : 'onPromptCancelled'
			},
			floorPrompt : {
				promptitemtapped : 'onFloorListSelection',
				promptcancelled : 'onPromptCancelled'
			},
			roomPrompt : {
				promptitemtapped : 'onRoomListSelection',
				promptcancelled : 'onPromptCancelled'
			},
			equipmentPrompt : {
				promptitemtapped : 'onEquipmentListSelection',
				promptcancelled : 'onPromptCancelled'
			},
			partPrompt : {
				promptitemtapped : 'onPartListSelection',
				promptcancelled : 'onPromptCancelled'
			},
            divisionPrompt: {
                promptitemtapped : 'onDivisionListSelection',
                promptcancelled : 'onPromptCancelled'
            },
            departmentPrompt: {
                promptitemtapped : 'onDepartmentListSelection',
                promptcancelled : 'onPromptCancelled'
            },
            sitePrompt: {
                promptitemtapped : 'onSiteListSelection',
                promptcancelled : 'onPromptCancelled'
            },
            equipmentStandardPrompt: {
                promptitemtapped : 'onEquipmentStandardListSelection',
                promptcancelled : 'onPromptCancelled'
            }
		}
	},

	onPromptCancelled : function(prompt) {
		prompt.hide();
	}
});