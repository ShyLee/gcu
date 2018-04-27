var buildingImageTabController = View.createController('buildingImageTabController', {
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
        this.buildingPhotos.refresh(restriction);
        
    },
    buildingPhotos_afterRefresh: function(){
		var blId = this.buildingPhotos.getFieldValue('bl.bl_id');
	    var addr=View.project.projectGraphicsFolder + '/building/' + blId+'.jpg';
	    jQuery.ajax({
	    	  url: addr,
	    	  success: function(){
	    		  jQuery("#building_photo").attr("src",addr);
	    	  },
	    	  error:function(e){
	    		  jQuery("#building_photo").removeAttr("src");
	    		  jQuery("#building_photo").attr("display","none");
	    	  }});
	}
   
});
