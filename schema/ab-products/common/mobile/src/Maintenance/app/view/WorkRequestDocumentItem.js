Ext.define('Maintenance.view.WorkRequestDocumentItem', {
	extend : 'Ext.Container',

	xtype : 'documentItem',

	config : {

		cls : 'document-list',

		padding : '0.35em',

		layout : {
			type : 'hbox',
			align : 'center'
		},

		image : true,

		file : {
			margin : '10px',
			flex : 1
		},

		displayButton : {
			text : 'Display'
		},

		documentData : null,

		mobileWrId : null,

		/**
		 * @cfg {Integer} The number of the corresponding document field. For
		 *      example, a value of 1 corresponds to the doc1 field.
		 */
		documentFieldId : null
	},

	applyFile : function(config) {
		return Ext.factory(config, Ext.Component, this.getFile());
	},

	updateFile : function(newFile, oldFile) {
		if (newFile) {
			this.add(newFile);
		}
		if (oldFile) {
			this.remove(oldFile);
		}
	},

	applyImage : function(config) {
		var img = Ext.factory(config, Ext.Img, this.getImage());
		return img;
	},

	updateImage : function(newImage, oldImage) {
		if (newImage) {
			this.add(newImage);
		}

		if (oldImage) {
			this.remove(oldImage);
		}
	},

	updateDocumentData : function(newData, oldData) {
		var img = this.getImage();

		if (newData) {
			img.setSrc('data:image/jpg;base64,' + newData);
		}
	},

	applyDisplayButton : function(config) {
		return Ext.factory(config, Ext.Button, this.getDisplayButton());
	},

	updateDisplayButton : function(newButton, oldButton) {
		if (newButton) {
			newButton.on('tap', this.onButtonTapped, this);
			this.add(newButton);
		}

		if (oldButton) {
			this.remove(oldButton);
		}
	},

	onButtonTapped : function() {
		var mobileWrId = this.getMobileWrId(),
            fileName = this.getFile().getHtml(),
            documentFieldId = this.getDocumentFieldId();

		this.fireEvent('displaydocument', mobileWrId, fileName,	documentFieldId);
	}
});