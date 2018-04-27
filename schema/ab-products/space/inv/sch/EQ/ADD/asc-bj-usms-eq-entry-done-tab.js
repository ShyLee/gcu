var controller=View.createController('eqEntryDoneForm',{
	 //main tab object , used here for store some globle varible
    tabs: null,
	
    afterInitialDataFetch: function(){
    	 this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	 var tabs=controller.tabs;
    	 var res=tabs.selectTabConsoleRestriction;
    	 this.eqListGridPanel.refresh(res);
    },
    
    eqListGridPanel_onBtnReAdd: function(){
    	View.getWindow('parent').View.setTitle("设备入库-入库请求列表");
    	var tabs = controller.tabs;
		tabs.selectTabConsoleRestriction ="";
    	var nextTabName = 'selectTab';
		var nextTab = tabs.findTab(nextTabName);
		nextTab.loadView();
		tabs.selectTab(nextTabName);
    }
});