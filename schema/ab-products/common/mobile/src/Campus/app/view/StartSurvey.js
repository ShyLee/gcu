Ext.define('Campus.view.StartSurvey', {
	extend : 'Common.form.FormPanel',

	xtype : 'startSurveyPanel',

	config : {

		title : 'Start Survey',
		items : [ {
			xtype : 'fieldset',
			style : 'margin: 0px 20px 20px 20px',
			items : [ {
				xtype : 'textfield',
				label : 'Survey Code',
				name : 'survey_id'
			}, {
				xtype : 'textfield',
				label : 'Survey Name',
				name : 'description'
			}, {
				xtype : 'textfield',
				label : 'Surveyor',
				name : 'em_id',
				readOnly : true
			} ]
		}, {
			xtype : 'container',
			layout : {
				type : 'hbox',
				align : 'center',
				pack : 'center'
			},
			items : [ {
				xtype : 'button',
				text : 'Start',
				itemId : 'startSurveyButton',
				ui : 'action',
				width : '200px',
				style : 'margin-bottom:10px'
			} ]
		} ]
	},

	initialize : function() {
		var startSurveyButton = this.down('button');
		startSurveyButton.on('tap', this.onStartSurveyButtonTapped, this);

		this.callParent(arguments);
	},

	onStartSurveyButtonTapped : function() {
		this.fireEvent('surveybuttontap', this);
	}
});