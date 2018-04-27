Ext
		.define(
				'Campus.view.FloorProfile',
				{
					extend : 'Ext.Panel',

					xtype : 'floorProfilePanel',

					config : {

						modal : true,
						hideOnMaskTap : true,
						width : 500,
						centered : true,

						layout : 'hbox',
						items : [ {
							xtype : 'titlebar',
							title : 'Floor Detail',
							docked : 'top'
						}, {
							xtype : 'panel',
							tpl : '',
							flex : 1,
							margin : 10
						} ]
					},

					// TODO: Localize date format string
					initialize : function() {
						// Generate the display template
						var template = [
								'<div class="space-profile"><div class="space-profile-label">Building Code</div><div>{bl_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Floor</div><div>{fl_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Floor Name</div><div>{name}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Exterior Gross Area</div><div>{area_gross_ext:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Interior Gross Area</div><div>{area_gross_int:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Rentable Area</div><div>{area_rentable:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Usable Area</div><div>{area_usable:number(2)}</div></div>' ]
								.join('');

						this.down('panel').setTpl(template);

						this.callParent(arguments);
					},

					applyRecord : function(record) {
						var blId = '', flId = '';

						if (record) {
							blId = record.get('bl_id');
							flId = record.get('fl_id');
						}

						var panel = this.down('panel');
						panel.setRecord(record);

						var titleBar = this.down('titlebar');
						titleBar.setTitle('Floor - ' + blId + ' ' + flId);

						this.callParent(arguments);
					}
				});