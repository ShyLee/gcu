function goToFirstTab(tabController, isSchemUpWiz){
	var tabs = tabController.tabs;
	var firstTabName = tabs[0].name;
	tabController.showTab(firstTabName, true);
	tabController.selectTab(firstTabName);
	if(isSchemUpWiz){
		reloadSchemUpWizTabs(tabController);
	}
}

function goToNextTab(tabController){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	var nextTabName = tabs[activeTabId+1].name;
	tabController.showTab(nextTabName, true);
	tabController.selectTab(nextTabName);
	tabController.disableTab(activeTabName);
}

function goToPrevTab(tabController){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	var prevTabName = tabs[activeTabId-1].name;
	tabController.showTab(prevTabName, true);
	tabController.selectTab(prevTabName);
	tabController.disableTab(activeTabName);
}

function goToTabName(tabController, tabName){
	var tabs = tabController.tabs;
	var activeTabName = tabController.tabPanel.activeTab.contentEl;
	var activeTabId = getActiveTabId(tabs, activeTabName);
	activeTabName = tabs[activeTabId].name;
	tabController.showTab(tabName, true);
	tabController.selectTab(tabName);
	tabController.disableTab(activeTabName);
}

function reloadSchemUpWizTabs(tabController){
	var tabs = tabController.tabs;
	for(var i=0;i<tabs.length;i++){
		if(i>0){
			tabController.disableTab(tabs[i].name);
		}
	}
	// reload update sql tables tab to clear the panel from old messages.
	tabs[1].loadView();
	// reload recreate structures tab to clear the panel from old messages.
	tabs[2].loadView();
}

function getActiveTabId(tabs, activeTabName){
	for(var i=0;i<tabs.length;i++ ){
		if(tabs[i].name == activeTabName){
			return tabs[i].index;
		}
	}
}

function setButtonsTitle(title){
	var tabController = specifyTablesController.wizardController.updProjWizTabs.tabs[2].getContentFrame().View.controllers.items[0];
	var startButton = tabController.actionProgressPanel.actions.get('start');
	var stopButton = tabController.actionProgressPanel.actions.get('stop');
	var resumeButton = tabController.actionProgressPanel.actions.get('pause');
	var start = getMessage('start');
	var stop = getMessage('stop');
	var resume = getMessage('pause');
	var bTitle = getMessage(title);
	startButton.setTitle(start+bTitle);	
	stopButton.setTitle(stop+bTitle);	
	resumeButton.setTitle(resume+bTitle);	
}
function setTabTitle(title){
	var pTitle = getMessage(title);
	specifyTablesController.wizardController.updProjWizTabs.tabs[2].setTitle(pTitle);
}
function hideMergeTab(){
	specifyTablesController.wizardController.updProjWizTabs.hideTab('mergeDataDictionary');
}
function hideCompareTab(){
	specifyTablesController.wizardController.updProjWizTabs.hideTab('compareDataDictionary');
}
function showMergeTab(){
	specifyTablesController.wizardController.updProjWizTabs.tabs[3].loadView();
	specifyTablesController.wizardController.updProjWizTabs.showTab('mergeDataDictionary', true);
}
function showCompareTab(){
	specifyTablesController.wizardController.updProjWizTabs.tabs[4].loadView();
	specifyTablesController.wizardController.updProjWizTabs.showTab('compareDataDictionary', true);
}
/**
 * Returns array of selected values.
 * 
 * @param grid grid panel
 * @param fieldName field name
 * @returns array of values of field name
 */
function getSelected(grid, fieldName) {
    var values = [];
    var i = 0;
    grid.gridRows.each(function(row) {
        if (row.isSelected()) {
            var value = row.getRecord().getValue(fieldName);
            values[i++] = value;
        }
    });        
    return values;
}

/**
 * Returns true if the object is in the array.
 * 
 * @param array array of objects
 * @param obj object to find
 * @returns {Boolean}
 */
function contains(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * Set the check boxes to initial values. 
 */
function refreshCheckboxes(gridPanel, selectedTables, readOnly){
	gridPanel.enableSelectAll(!readOnly);
	var gridRows = gridPanel.rows;
	var dataRows = gridPanel.getDataRows();
	for(var i = 0; i < gridRows.length; i++){
		var row = gridRows[i].row;
		var record = row.getRecord();
		if(contains(selectedTables, record.getValue('afm_transfer_set.table_name'))){
			row.select();
		}
        var selectionCheckbox = dataRows[i].firstChild.firstChild;
        selectionCheckbox.disabled = readOnly;
	}
}
