Ext.define('SpaceBook.view.SiteListItem', {

	extend : 'Ext.dataview.component.DataItem',

	requires : 'SpaceBook.data.ImageData',

	xtype : 'siteListItem',

	config : {

		cls : 'spacebook-list-item',

		image : true,

		siteInfo : {
			flex : 5,
			cls : 'x-detail'
		},

		detailButton : {
			flex : 1,
			text : 'Show Details',
			action : 'showSiteDetail',
			margin : '0 10px 0 0'
		},

		layout : {
			type : 'hbox',
			align : 'center'
		}
	},

	applySiteInfo : function(config) {
		return Ext.factory(config, Ext.Component, this.getSiteInfo());
	},

	updateSiteInfo : function(newSiteInfo, oldSiteInfo) {
		if (newSiteInfo) {
			this.add(newSiteInfo);
		}
		if (oldSiteInfo) {
			this.remove(oldSiteInfo);
		}
	},

	applyDetailButton : function(config) {
		return Ext.factory(config, Ext.Button, this.getDetailButton());
	},

	updateDetailButton : function(newButton, oldButton) {
		if (newButton) {
			this.add(newButton);
		}
		if (oldButton) {
			this.remove(oldButton);
		}
	},

	applyImage : function(config) {
		var image = Ext.factory(config, Ext.Img, this.getImage());
		return image;
	},

	updateImage : function(newImage, oldImage) {

		if (newImage) {
			this.add(newImage);
		}

		if (oldImage) {
			this.remove(oldImage);
		}
	},

	updateRecord : function(newRecord, oldRecord) {
		var siteInfo = this.getSiteInfo(),
            imageData,
            image = this.getImage(),
            detailButton = this.getDetailButton();

		if (newRecord) {
			imageData = newRecord.get('site_photo_contents');
			if (!imageData) {
				imageData = SpaceBook.data.ImageData.getDefaultSiteImage();
			}
			siteInfo.setHtml(this.buildSiteInfo(newRecord));
			image.setSrc('data:image/jpg;base64,' + imageData);
			detailButton.setRecord(newRecord);
            if(newRecord.get('site_id') === null) {
                detailButton.setHidden(true);
            } else {
                detailButton.setHidden(false);
            }
		}
		this.callParent(arguments);
	},

	buildSiteInfo : function(record) {
		var siteInfo = record.getData(),
            site_id = siteInfo.site_id,
            html;

		html = '<div>';
        if( site_id !== null) {
            html += site_id;
        }
		if (siteInfo.name !== null) {
            if (site_id !== null) {
                html += ', ';
            }
			html += siteInfo.name;
		}
		html += '</div><h3>';
		if (siteInfo.city_id !== null) {
			html += siteInfo.city_id;
		}
		if (siteInfo.state_id !== null) {
			html += ' ' + siteInfo.state_id;
		}
		if (siteInfo.ctry_id !== null) {
			html += ', ' + siteInfo.ctry_id;
		}
		html += '</h3>';

		return html;
	}

});