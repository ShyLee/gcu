/**
 * @author ZY
 */

//Guo added 2009-07-23 to fix KB3023605
var abSpDefRmStd_Control = View.createController('abSpDefRmStd_Control', {

    detailsPanel_afterRefresh: function(){
        this.detailsPanel.enableField("rmstd.hpattern_acad", false);
        var field = this.detailsPanel.fields.get("rmstd.hpattern_acad");
        if (field != null) {
            field.actions.each(function(action){
                action.enable(true);
            });
        }
    },
    
    /**
     * Calculate std_area before we save record.
     */
    detailsPanel_beforeSave:function(){
    var form=this.detailsPanel;
    if(form){
    	var width=form.getFieldValue("rmstd.width");
    	var length=form.getFieldValue("rmstd.length");
    	var area=width*length;
    	form.setFieldValue("rmstd.std_area",area);
    }
    
    }
});

/**
 * event handler when click the select value button for the field rmstd.hpattern_acad
 */
function selectHpattern(){
    View.hpatternPanel = View.panels.get('detailsPanel');
	View.hpatternField = 'rmstd.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmstd.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}



