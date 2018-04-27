/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallSiteImageController', {
	
	siteId:"",
	
	afterViewLoad:function(){
		if (this.view.parameters){
        	this.siteId = this.view.parameters['siteId'];
		
			if (this.siteId) {
				this.sitePhotos.addParameter("siteIdRes",this.siteId);
	    	}
		}
	},
	
	sitePhotos_afterRefresh:function(){
		showSiteImage();
	}
	
});

function showSiteImage(){
    var distinctPanel = View.panels.get('sitePhotos');
    var site_photo = distinctPanel.getFieldValue('site.site_image').toLowerCase();
    if (valueExistsNotEmpty(site_photo)) {
		distinctPanel.showImageDoc('site_photo', 'site.site_id', 'site.site_image');
		distinctPanel.fields.get('site_photo').dom.alt = "";
    }
    else {
        distinctPanel.fields.get('site_photo').dom.src = null;
        distinctPanel.fields.get('site_photo').dom.alt = getMessage('noImage');
    }
}