Ext.define('Common.view.prompt.tablet.Base', {
	extend : 'Common.view.prompt.PromptBase',

	config : {
		width : '80%',
		height : '60%',
		modal : true,
		hideOnMaskTap : true,
		left : '10%',
		top : '10%',
		hidden : true,

		showAnimation : {
			type : 'popIn',
			duration : 250,
			easing : 'ease-out'
		},
		hideAnimation : {
			type : 'popOut',
			duration : 250,
			easing : 'ease-out'
		},

		list : {
			flex : 1,
			scrollable : true,
			emptyText : '<div class="empty-text">No Records to Display</div>',
			plugins : {
				xclass : 'Ext.plugin.ListPaging',
				autoPaging : true
			}
		}
	}
});