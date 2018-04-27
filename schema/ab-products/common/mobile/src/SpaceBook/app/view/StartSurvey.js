Ext.define('SpaceBook.view.StartSurvey', {
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
		var me = this,
            startSurveyButton = me.down('button'),
            surveyNameField = me.down('textfield[name=description]');

        this.callParent(arguments);

        startSurveyButton.on('tap', function () {
            surveyNameField.blur();
            // Use a delay to allow Android devices to process the validation
            // events
            setTimeout(function() {
                me.fireEvent('surveybuttontap', me);
            }, 50);
        }, me);
	}
});