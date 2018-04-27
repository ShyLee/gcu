Ext.define('Maintenance.view.WorkRequestPartEdit', {
	extend : 'Maintenance.view.WorkRequestEditBase',
	xtype : 'workRequestPartEditPanel',

	config : {

		model : 'Maintenance.model.WorkRequestPart',
		storeId : 'workRequestPartsStore',

		editTitle : LocaleManager.getLocalizedString('Edit Part'),
		addTitle : LocaleManager.getLocalizedString('Add Part'),

		items : [ {
			xtype : 'formheader',
			workRequestId : '',
			dateValue : '',
			dateLabel : LocaleManager.getLocalizedString('Assigned', 'Maintenance.view.WorkRequestPartEdit'),
			displayLabels : Ext.os.is.Tablet || Ext.os.is.Desktop
		}, {
			xtype : 'fieldset',
			defaults : {
				labelWidth : Ext.os.is.Phone ? 100 : 180
			},
			items : [ {
				xtype : 'hiddenfield',
				name : 'date_assigned'
			}, {
				xtype : 'promptfield',
				name : 'part_id',
				label : 'Part',
				panelName : 'workRequestPartEditPanel'

			}, {
				xtype : 'spinnerfield',
				label : 'Quantity',
				stepValue : 1,
				minValue : 0,
				name : 'qty_actual'
			}, {
				xtype : 'textareafield',
				label : 'Comments',
				name : 'comments'
			} ]
		} ]
	},

	initialize : function() {
		var me = this,
            dateAssignedField;

        me.callParent();
		dateAssignedField = me.query('hiddenfield[name=date_assigned]')[0];
		dateAssignedField.on('change', me.onDateAssignedChanged, me);
        me.setColumnHeadings('wrpt_sync');
        me.limitSpinnerButtonHeight();
	},

	applyViewIds : function(config) {
		var formHeader = this.down('formheader');

		formHeader.setWorkRequestId(config.workRequestId);
		return config;
	},

	onDateAssignedChanged : function(field, newValue) {
		var formheader = this.down('formheader');
		formheader.setDateValue(newValue);
	}

});
