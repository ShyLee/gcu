controller = View.createController('eqview', {
	afterInitialDataFetch: function(){
		if (this.view.parameters){
			var eq_id = this.view.parameters['eq_id'];
			if(valueExistsNotEmpty(eq_id)){
 				var restriction=new Ab.view.Restriction();
				restriction.addClause("eq.eq_id",eq_id,"=");
 				var record = this.eq_DS.getRecord(restriction);
 				this.show_eq_info(record);
 			}
 		}	
	},
	show_eq_info: function(record){
		var eq_id = record.getValue("eq.eq_id");
		var warranty_id = record.getValue("eq.warranty_id");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.eq_id",eq_id,"=");
		this.formPanel.refresh(restriction);
		this.imagePanel.refresh(restriction);
		
		var image_file = record.getValue("eq.eq_photo").toLowerCase();
		if (valueExistsNotEmpty(image_file)) {
			this.imagePanel.showImageDoc('image_field', 'eq.eq_id', 'eq.eq_photo');
		} else {
			this.imagePanel.fields.get('image_field').dom.src = null;
			this.imagePanel.fields.get('image_field').dom.alt = '';
    	}
	}
});

