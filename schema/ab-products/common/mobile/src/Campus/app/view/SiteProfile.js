Ext
		.define(
				'Campus.view.SiteProfile',
				{
					extend : 'Ext.Panel',

					xtype : 'siteProfilePanel',

					config : {
						imageData : null,

						modal : true,
						hideOnMaskTap : true,
						width : 800,
						centered : true,

						layout : 'hbox',
						items : [ {
							xtype : 'titlebar',
							title : 'Site Detail',
							docked : 'top'
						}, {
							xtype : 'panel',
							tpl : '',
							flex : 1,
							margin : 10
						}, {
							xtype : 'image',
							width : 400,
							height : 400,
							flex : 1,
							margin : 10
						} ]

					},

					// TODO: Localize date format string
					initialize : function() {
						// Generate the display template
						var template = [
								'<div class="space-profile"><div class="space-profile-label">Site Code</div><div>{site_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Site Name</div><div>{name}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">City</div><div>{city_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">State</div><div>{state_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Country</div><div>{ctry_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Exterior Gross Area</div><div>{area_gross_ext:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Interior Gross Area</div><div>{area_gross_int:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Rentable Area</div><div>{area_rentable:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Usable Area</div><div>{area_usable:number(2)}</div></div>' ]
								.join('');

						this.down('panel').setTpl(template);

						this.callParent(arguments);
					},

					applyRecord : function(record) {
						var siteId = '', siteName = '', imageData, image = this.down('image');

						if (record) {
							siteId = record.get('site_id');
							siteName = record.get('name');
							imageData = record.get('site_photo_contents');
						}

						if (imageData !== null) {
							image.setSrc('data:image/jpg;base64,' + imageData);
							image.setHidden(false);
							this.setWidth(800);
						} else {
							image.setHidden(true);
							this.setWidth(450);
						}

						var panel = this.down('panel');
						panel.setRecord(record);

						var titleBar = this.down('titlebar');
						titleBar.setTitle(siteId + ' - ' + siteName);

						this.callParent(arguments);
					}

				});