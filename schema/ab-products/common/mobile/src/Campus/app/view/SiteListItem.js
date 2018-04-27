Ext.define('Campus.view.SiteListItem', {

	extend : 'Ext.dataview.component.DataItem',

	requires : 'Campus.data.ImageData',

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
		var siteInfo = this.getSiteInfo(), imageData, image = this.getImage(), detailButton = this.getDetailButton();

		if (newRecord) {
			imageData = newRecord.get('site_photo_contents');
			if (!imageData) {
				imageData = Campus.data.ImageData.getDefaultSiteImage();
			}
			siteInfo.setHtml(this.buildSiteInfo(newRecord));
			image.setSrc('data:image/jpg;base64,' + imageData);
			detailButton.setRecord(newRecord);
		}
		this.callParent(arguments);
	},

	buildSiteInfo : function(record) {
		var siteInfo = record.getData(), html;

		html = '<div>' + siteInfo.site_id;
		if (siteInfo.name !== null) {
			html += ', ' + siteInfo.name;
		}
		html += '<div><h3>';
		if (siteInfo.city_id !== null) {
			html += siteInfo.city_id;
		}
		if (siteInfo.state_id !== null) {
			html += siteInfo.state_id;
		}
		if (siteInfo.ctry_id !== null) {
			html += ', ' + siteInfo.ctry_id;
		}
		html += '</h3>';

		return html;
	}

});