Ext
		.define(
				'SpaceBook.view.BuildingProfile',
				{
					extend : 'Ext.Panel',

					xtype : 'buildingProfilePanel',

					config : {
						imageData : null,

						modal : true,
						hideOnMaskTap : true,
						width : 800,
						//height : 500,
						centered : true,

						layout : 'hbox',
						items : [ {
							xtype : 'titlebar',
							title : 'Building Detail',
							docked : 'top'
						}, {
							xtype : 'panel',
							tpl : '',
							flex : 1,
							margin : 10
						}, {
							xtype : 'image',
							// src : 'CountyBuilding.jpg',
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
								'<div class="space-profile"><div class="space-profile-label">Building Code</div><div>{bl_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Building Name</div><div>{name}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Site Code</div><div>{site_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">City</div><div>{city_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">State</div><div>{state_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Country</div><div>{ctry_id}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Building Use</div><div>{use1}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Building Contact</div><div>{contact_name}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Contact Phone</div><div>{contact_phone}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Date Built</div><div>{date_bl:date("m/d/Y")}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Construction Type</div><div>{constructionTypeDisplay}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Exterior Gross Area</div><div>{area_gross_ext:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Interior Gross Area</div><div>{area_gross_int:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Rentable Area</div><div>{area_rentable:number(2)}</div></div>',
								'<div class="space-profile"><div class="space-profile-label">Usable Area</div><div>{area_usable:number(2)}</div></div>' ]
								.join('');

						this.down('panel').setTpl(template);

						this.callParent(arguments);
					},

					applyRecord : function(record) {
						var blId = '', buildingName = '',
                            image = this.down('image'),
                            imageData,
                            constructionTypeDisplay;

						if (record) {
							blId = record.get('bl_id');
							buildingName = record.get('name');
							imageData = record.get('bldg_photo_contents');
                            constructionTypeDisplay = this.getConstructionTypeDisplayValue(record);
                            record.set('constructionTypeDisplay', constructionTypeDisplay);
						}

						if (imageData !== null) {
							image.setSrc('data:image/jpg;base64,' + imageData);
							this.setWidth(800);
							image.setHidden(false);
						} else {
							image.setHidden(true);
							this.setWidth(450);
						}

						var panel = this.down('panel');
						panel.setRecord(record);

						var titleBar = this.down('titlebar');
						titleBar.setTitle(blId + ' - ' + buildingName);

						this.callParent(arguments);
					},

                    getConstructionTypeDisplayValue: function (record) {
                        var constructionType = record.get('construction_type'),
                            displayValue = '';

                        if(constructionType) {
                            displayValue = Common.util.Ui.getEnumeratedDisplayValue('bl','construction_type', constructionType);
                        }

                        if (displayValue !== '') {
                            return displayValue;
                        } else {
                            return constructionType;
                        }
                    }
				});