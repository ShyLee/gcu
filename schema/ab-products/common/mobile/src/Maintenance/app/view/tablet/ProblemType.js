Ext.define('Maintenance.view.tablet.ProblemType', {
    extend: 'Maintenance.view.ProblemType',

    xtype : 'tabletProblemTypePanel',

    config: {
        width: 400,
        height: 400,
        modal: true,
        hideOnMaskTap: true,
        left: '30%',
        top: '20%',
        hidden: true
    }
});