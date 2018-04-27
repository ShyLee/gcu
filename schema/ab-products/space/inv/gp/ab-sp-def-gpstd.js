/**
 * @author Keven Xi
 */

//Guo added 2009-07-23 to fix KB3023605
var abSpDefGpStd_Control = View.createController('abSpDefGpStd_Control', {

    detailsPanel_afterRefresh: function(){
        this.detailsPanel.enableField("gpstd.hpattern_acad", false);
        var field = this.detailsPanel.fields.get("gpstd.hpattern_acad");
        if (field != null) {
            field.actions.each(function(action){
                action.enable(true);
            });
        }
    }
});

function selectHpattern(){
	View.hpatternPanel = View.panels.get('detailsPanel');
	View.hpatternField = 'gpstd.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('gpstd.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}