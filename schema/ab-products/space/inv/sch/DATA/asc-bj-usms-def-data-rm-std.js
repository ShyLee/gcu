/**
 * 
 */
function selectPattern(){
	View.hpatternPanel = View.panels.get('abScDefRmstdForm');
	View.hpatternField = 'rmstd.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmstd.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}
