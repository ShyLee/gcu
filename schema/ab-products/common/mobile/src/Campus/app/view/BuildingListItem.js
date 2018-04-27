Ext.define('Campus.view.BuildingListItem', {
	extend : 'Ext.dataview.component.DataItem',

	requires : 'Campus.data.ImageData',

	xtype : 'buildingListItem',

	config : {

		cls : 'spacebook-list-item',

		image : true,

		buildingInfo : {
			flex : 5,
			cls : 'x-detail'
		},

		detailButton : {
			flex : 1,
			text : 'Show Details',
			action : 'showBuildingDetail'
		},

		layout : {
			type : 'hbox',
			align : 'center'
		}
	},

	applyBuildingInfo : function(config) {
		return Ext.factory(config, Ext.Component, this.getBuildingInfo());
	},

	updateBuildingInfo : function(newBuildingInfo, oldBuildingInfo) {
		if (newBuildingInfo) {
			this.add(newBuildingInfo);
		}
		if (oldBuildingInfo) {
			this.remove(oldBuildingInfo);
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
		var buildingInfo = this.getBuildingInfo(), imageData, image = this.getImage(), detailButton = this
				.getDetailButton();

		if (newRecord) {
			imageData = newRecord.get('bldg_photo_contents');
			if (!imageData) {
				imageData = Campus.data.ImageData.getDefaultBuildingImage();
			}
			buildingInfo.setHtml(this.buildBuildingInfo(newRecord));
			image.setSrc('data:image/jpg;base64,' + imageData);
			detailButton.setRecord(newRecord);
		}
		this.callParent(arguments);
	},

	buildBuildingInfo : function(record) {
		var buildingInfo = record.getData(), html;

		html = '<div>' + buildingInfo.bl_id;
		if (buildingInfo.name !== null) {
			html += ', ' + buildingInfo.name;
		}
		html += '</div><h3>';
		if (buildingInfo.city_id !== null) {
			html += buildingInfo.city_id;
		}
		if (buildingInfo.state_id !== null) {
			html += ' ' + buildingInfo.state_id;
		}
		if (buildingInfo.ctry_id) {
			html += ', ' + buildingInfo.ctry_id;
		}
		html += '</h3>';

		return html;
	}
});