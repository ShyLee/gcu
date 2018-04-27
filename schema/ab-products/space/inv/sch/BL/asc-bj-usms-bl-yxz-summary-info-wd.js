var buildingAbstractController = View.createController('viewBuildingAbstracts', {

	blId:"",
	
	openBlId:null,
	
	
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.openBlId = this.view.parameters['openBlId'];
		
			if (this.openBlId) {
				onClickBlNode();
	    	}
		}
    },
	/**
	 * Event handler for property photo and map image click.
	 */
	onClickImage: function() {
		View.openDialog(this.dom.src);
	},
	
	abScBlBasicInfoForm_afterRefresh:function(){
		var gongtanlv = this.abScBlBasicInfoForm.getFieldValue("sc_bl_xz.gongtanlv");
		if (gongtanlv){
			gongtanlv = gongtanlv*100;
			gongtanlv = gongtanlv.toFixed(2);
			document.getElementById("abScBlBasicInfoForm_bl.gongtanlv").innerHTML = gongtanlv+"%";
		}
		
	},
	
	/**
	 * 
	 */
	buildingPhotos_afterRefresh:function(){
		var title = String.format(getMessage('imagePanelTitle'), this.blId);
		this.buildingPhotos.setTitle(title);
		showBldgPhoto();
	},
	
	/**
	 * show building photo and map when user select building
	 * @param {Object} curBlNode
	 */
	showDistinctPhoto:function(blId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_bl_xz.bl_id",this.blId,"=");
		
		this.buildingPhotos.refresh(restriction);
	}
	
	
});


function showBldgPhoto(){
    var distinctPanel = View.panels.get('buildingPhotos');
    var bl_photo = distinctPanel.getFieldValue('sc_bl_xz.bldg_photo').toLowerCase();
	var blId = distinctPanel.getFieldValue('sc_bl_xz.bl_id');
    if (valueExistsNotEmpty(bl_photo)) {
		distinctPanel.showImageDoc('bl_photo', 'sc_bl_xz.bl_id', 'sc_bl_xz.bldg_photo');
		distinctPanel.fields.get('bl_photo').dom.alt = "";
    }
    else {
        distinctPanel.fields.get('bl_photo').dom.src = null;
        distinctPanel.fields.get('bl_photo').dom.alt = getMessage('noImage');
    }
}
