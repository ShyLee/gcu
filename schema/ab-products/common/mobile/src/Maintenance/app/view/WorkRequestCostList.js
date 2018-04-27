Ext
		.define(
				'Maintenance.view.WorkRequestCostList',
				{
					extend : 'Common.view.navigation.ListBase',
					xtype : 'workRequestCostPanel',

					phoneItemTemplate : '<div class="prompt-list-hbox"><h1>{other_rs_type}</h1>'
							+ '<div class="prompt-list-date">{date_used:date("{0}")}</div></div>'
							+ '<div class="prompt-list-vbox"><div>Cost: {cost_total:number(2)}</div>'
							+ '<h3>{description}</h3></div>',

					tabletItemTemplate : '<div class="prompt-list-hbox"><h1 style="width:30%">{other_rs_type}</h1><div>Cost: {cost_total:number(2)}</div>'
							+ '<div class="prompt-list-date">{date_used:date("{0}")}</div></div>'
							+ '<div class="prompt-list-vbox"><h3>{description}</h3></div>',

					config : {
						editViewClass : 'Maintenance.view.WorkRequestCostEdit',
						title : LocaleManager.getLocalizedString('Other Costs'),

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
							store : 'workRequestCostsStore',
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