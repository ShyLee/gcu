// ab-select-value-config-fields.js

/**
 * controller implementation
 */
var abSelectValueConfigFieldsCtrl = View.createController('abSelectValueConfigFieldsCtrl', {

rmFilterPanel_onSearch: function(){
	var restriction = "";
	var console = this.rmFilterPanel;
    restriction = console.getFieldRestriction();
    
    // apply restriction to the grid
    var grid = this.rmDetailPanel;
    grid.refresh(restriction);
    
    // show the grid
    grid.show(true);
}

});

/**
 *
 */
function rmFilterPanel_selectFloor() {
	var console = View.panels.get("rmFilterPanel");
	var restriction = console.getFieldRestriction();

	View.selectValue({
    	formId: 'rmFilterPanel',
    	title: 'Select Floor',
    	fieldNames: ['bl.site_id','rm.bl_id','rm.fl_id'],
    	selectTableName: 'bl',
    	selectFieldNames: ['bl.site_id','fl.bl_id','fl.fl_id'],
    	visibleFields: [
			{fieldName: 'bl.site_id', title: getMessage('titleBldgSite')},
			{fieldName: 'fl.bl_id', title: getMessage('titleBldgName')},
			{fieldName: 'fl.fl_id', title: getMessage('titleFloorId')},
			{fieldName: 'fl.name', title: getMessage('titleFloorName')}
		],
    	sortFields: [
			{fieldName: 'fl.name', sortAscending: false},
			{fieldName: 'fl.bl_id', sortAscending: true}
		],
    	restriction: restriction,
    	showIndex: false,
    	selectValueType: 'grid'
	});
}
