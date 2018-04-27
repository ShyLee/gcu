Ext.define('Maintenance.view.WorkRequestCostEdit', {
	extend : 'Maintenance.view.WorkRequestEditBase',
    requires: 'Common.control.Select',
	xtype : 'workRequestCostItem',

	config : {
		model : 'Maintenance.model.WorkRequestCost',
		storeId : 'workRequestCostsStore',

		addTitle : LocaleManager.getLocalizedString('Add Cost', 'Maintenance.view.WorkRequestCostEdit'),
		editTitle : LocaleManager.getLocalizedString('Edit Cost', 'Maintenance.view.WorkRequestCostEdit'),

		items : [ {
			xtype : 'formheader',
			workRequestId : '',
			dateValue : '',
			displayLabels : Ext.os.is.Tablet || Ext.os.is.Desktop
		}, {
			xtype : 'fieldset',
			defaults : {
				labelWidth : Ext.os.is.Phone ? 100 : 180
			},
			items : [ {
				xtype : 'selectlistfield',
				label : 'Resource Type',
				name : 'other_rs_type',
				store : 'otherResourcesStore',
				valueField : 'other_rs_type',
				displayField : 'description'
			}, {
				xtype : 'formattednumberfield',
				label : 'Actual Cost',
				name : 'cost_total'
			}, {
				xtype : 'datepickerfield',
				label : 'Date Used',
				name : 'date_used',
				picker : {
					yearFrom : 2012,
					yearTo : 2020,
					listeners : {
						show : function() {
							var date = this.getValue();
							if (!date) {
								this.setValue(new Date());
							}
						}
					}
				}
			}, {
				xtype : 'spinnerfield',
				minValue : 0,
				stepValue : 1,
				label : 'Quantity Used',
				name : 'qty_used'
			}, {
				xtype : 'textfield',
				label : 'Units',
				name : 'units_used',
                maxLength: 3
			}, {
				xtype : 'textareafield',
				label : 'Description',
				name : 'description'
			} ]
		} ]
	},

	applyViewIds : function(config) {
		var formHeader = this.down('formheader');
		formHeader.setWorkRequestId(config.workRequestId);
		return config;
	},

    initialize: function () {
        var me = this;
        me.callParent();
        me.setColumnHeadings('wr_other_sync');
        me.limitSpinnerButtonHeight();
    }

});