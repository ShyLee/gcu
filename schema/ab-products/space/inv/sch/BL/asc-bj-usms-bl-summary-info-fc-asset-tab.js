

var fcAssetTabController = View.createController('fcAssetTabController', {
	
    afterInitialDataFetch: function(){
    	var tabs = View.getControlsByType(parent, 'tabs')[0];
    	this.blId = tabs.blId;
    	var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.bl_id',  this.blId, '=');
        this.fcAssetInfoPanel.refresh(restriction);
        
    }
});


