var buildingBaiscTabController = View.createController('buildingBaiscTabController', {
	blId:null,
	blName:null,
	openController:null,
	
    afterInitialDataFetch: function(){
    	var tabs = View.getControlsByType(parent, 'tabs')[0];
    	this.blId = tabs.blId;
    	this.blName = tabs.blName;
    	this.openController = tabs.openController;
    	var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.bl_id',  this.blId, '=');
        this.blBasicInfoPanel.refresh(restriction);
    }
   
});


