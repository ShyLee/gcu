var viewRmEmController = View.createController('viewRmEmController', {

	blId:"",
	flId:"",
    rmId:"",
	
	/**
	 * Initializes the view.
	 */
    afterViewLoad: function(){
        if (this.view.parameters){
        	this.blId = this.view.parameters['blId'];
			this.flId = this.view.parameters['flId'];
			this.rmId = this.view.parameters['rmId'];
		
			if (this.blId && this.flId && this.rmId) {
				this.ascBjUsmsBlRmDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmDetails.addParameter("rmIdRes",this.rmId);
				
				this.ascBjUsmsBlRmEmDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmEmDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmEmDetails.addParameter("rmIdRes",this.rmId);
				
				this.ascBjUsmsBlRmEditDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmEditDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmEditDetails.addParameter("rmIdRes",this.rmId);
				
				this.eqPanel.addParameter("blIdRes",this.blId);
				this.eqPanel.addParameter("flIdRes",this.flId);
				this.eqPanel.addParameter("rmIdRes",this.rmId);
	    	}
		}
       
       
    },
    ascBjUsmsBlRmDetails_onEidt: function(){
    	var rmRecord = this.ascBjUsmsBlRmDetails.getRecord();
        this.ascBjUsmsBlRmEditDetails.setRecord(rmRecord);
        this.ascBjUsmsBlRmEditDetails.show(true);
    	this.ascBjUsmsBlRmEditDetails.showInWindow({
    	    width: 350,
    	    height: 250
    	   });
    },
    ascBjUsmsBlRmEditDetails_onSave: function(){
    	var form = View.panels.get("ascBjUsmsBlRmEditDetails");
    	 if (form.save()) {
 	   		var panel = View.panels.get("ascBjUsmsBlRmDetails");
 	     	panel.refresh();		
 	   	}
    }
    

});
