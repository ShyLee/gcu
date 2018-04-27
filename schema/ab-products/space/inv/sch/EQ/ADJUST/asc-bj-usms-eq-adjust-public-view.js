var dialogController=View.createController('dialogController',{
	//var addEqId;
	afterInitialDataFetch:function(){
		var eq_id=this.view.parameters["eq_id"];	
		if(valueExistsNotEmpty(eq_id)){
			var restriction=new Ab.view.Restriction();
			restriction.addClause("eq.eq_id",eq_id,"=");
			var record = this.eq_DS.getRecord(restriction);
			this.show_eq_info(record);
			
			var res=new Ab.view.Restriction();
			res.addClause('eq_attach.eq_id',eq_id,'=');
			this.eqAttachPanel.show();
			this.eqAttachPanel.refresh(res);
			this.eqAttachPanel.setTitle("设备【"+eq_id+"】的附件列表");
		}
	},
	show_eq_info: function(record){
		var eq_id = record.getValue("eq.eq_id");
		var warranty_id = record.getValue("eq.warranty_id");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.eq_id",eq_id,"=");
		this.formPanel.refresh(restriction);
		
		var image_file = record.getValue("eq.doc2").toLowerCase();
		if (valueExistsNotEmpty(image_file)) {
        this.imagePanel.showImageDoc('image_field', 'eq.eq_id', 'eq.doc2');
    		}else {
        this.imagePanel.fields.get('image_field').dom.src = null;
        this.imagePanel.fields.get('image_field').dom.alt = '';
    	}
	}
});