Ext.define('AssetAndEquipmentSurvey.view.SurveyList', {
	extend : 'Common.view.navigation.ListBase',

	requires : 'Ext.plugin.ListPaging',

	xtype : 'surveyListPanel',

	phoneItemTemplate : [
							'<div class="prompt-list-hbox"><h1>{survey_id}</h1>',
							'<div class="prompt-list-date">{survey_date:date("{0}")}</div></div>',
							'<div class="prompt-list-vbox"><h3>{description}</h3></div>' ]
							.join(''),
	tabletItemTemplate : [
							'<div class="prompt-list-hbox"">',
							'<h1 style="width:40%;">{survey_id}</h1><div>{description}</div>',
							'<div class="prompt-list-date">{survey_date:date("{0}")}</div></div>']
							.join(''),
							
	config : {
		title : Ext.os.is.Phone ? 'Survey' : 'Asset and Equipment Survey',

        editViewClass : 'AssetAndEquipmentSurvey.view.TaskContainer',

        items : [ {
			xtype : 'list',
			store : 'surveysStore',
            emptyText: '<div style="color: #4169e1">There are no Surveys assigned.<br>Tap the Sync button to retrieve new Surveys.</div>',
			flex : 1,
			plugins : {
				xclass : 'Ext.plugin.ListPaging',
				autoPaging : false
			}
		} ]
	},

	initialize : function() {
		var list = this.down('list'),
            template = Ext.os.is.Phone ? this.phoneItemTemplate : this.tabletItemTemplate,
            formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
            xTpl = new Ext.XTemplate( formattedTpl );

		list.setItemTpl(xTpl);
		this.callParent();
	} 
});