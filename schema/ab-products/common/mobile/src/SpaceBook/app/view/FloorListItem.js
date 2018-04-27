Ext.define('SpaceBook.view.FloorListItem',
		{
			extend : 'Ext.dataview.component.DataItem',

			xtype : 'floorListItem',

			config : {

				cls : 'spacebook-list-item',

				floorInfo : {
					flex : 5,
					cls : 'x-detail'
				},

				detailButton : {
					flex : 1,
					text : 'Show Details',
					action : 'showFloorDetail'
				},

				layout : {
					type : 'hbox',
					align : 'center'
				}
			},

			applyFloorInfo : function(config) {
				return Ext.factory(config, Ext.Component, this.getFloorInfo());
			},

			updateFloorInfo : function(newFloorInfo, oldFloorInfo) {
				if (newFloorInfo) {
					this.add(newFloorInfo);
				}
				if (oldFloorInfo) {
					this.remove(oldFloorInfo);
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

			updateRecord : function(newRecord, oldRecord) {
				var floorInfo = this.getFloorInfo(), detailButton = this
						.getDetailButton();

				if (newRecord) {
					floorInfo.setHtml(this.buildFloorInfo(newRecord));
					detailButton.setRecord(newRecord);
				}
				this.callParent(arguments);
			},

			buildFloorInfo : function(record) {
				var buildingId = record.get('bl_id'), floorId = record
						.get('fl_id'), floorName = record.get('name'), html;

				html = '<div>' + buildingId + ' ' + floorId + ' ' + floorName
						+ '</div>'

				return html;
			}
		});