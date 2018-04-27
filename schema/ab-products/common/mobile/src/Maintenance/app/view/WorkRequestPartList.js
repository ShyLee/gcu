Ext.define('Maintenance.view.WorkRequestPartList',
		{
			extend : 'Common.view.navigation.ListBase',
			xtype : 'workRequestPartListPanel',

			phoneItemTemplate : '<div class="prompt-list-vbox"><h1>{part_id}</h1>'
					+ '<div class="prompt-list-date">{date_assigned:date("{0}")}</div>'
					+ '<h3>Quantity: {qty_actual}</h3>',

			tabletItemTemplate : '<div class="prompt-list-hbox"><h1>{part_id}</h1>'
					+ '<div class="prompt-list-date">{date_assigned:date("{0}")}</div>'
					+ '</div><div class="prompt-list-vbox"><h3>Quantity: {qty_actual}</h3></div>',

			config : {
				editViewClass : 'Maintenance.view.WorkRequestPartEdit',
				title : 'Parts',
				workRequestId : null,

				viewIds : {
					workRequestId : null,
					mobileId : null
				},

				items : [ {
					xtype : 'formheader',
					workRequestId : '',
					displayLabels : Ext.os.is.Tablet || Ext.os.is.Desktop
				}, {
					xtype : 'list',
					store : 'workRequestPartsStore',
                    refreshHeightOnUpdate: false,
					flex : 1,
					plugins : {
						xclass : 'Ext.plugin.ListPaging',
						autoPaging : true
					}
				} ]
			},

			initialize : function() {

				var list = this.down('list'), template = Ext.os.is.Phone ? this.phoneItemTemplate
						: this.tabletItemTemplate, formattedTpl = Ext.String.format(template, LocaleManager
						.getLocalizedDateFormat()), xTpl = new Ext.XTemplate(formattedTpl);

				list.setItemTpl(xTpl);

				this.callParent();
			},

			applyWorkRequestId : function(config) {
				var formHeader = this.down('formheader');

				formHeader.setWorkRequestId(config);
				return config;
			}
		});