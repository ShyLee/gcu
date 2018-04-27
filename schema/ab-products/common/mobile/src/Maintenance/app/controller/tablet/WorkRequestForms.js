Ext.define('Maintenance.controller.tablet.WorkRequestForms', {
    extend: 'Maintenance.controller.WorkRequestForms',

    config: {
        refs: {
            probTypeList: 'tabletProblemTypePanel > nestedlist'
        },
        control: {

            'promptfield[name=prob_type]': {
                promptTapped: 'displayProblemType'
            },

            probTypeList: {
                leafitemtap: 'onProblemTypeSelected'
            },

            'tabletProblemDescriptionPanel > list': {
                itemtap: 'onProblemDescriptionSelected'
            },

            'tabletProblemResolutionPanel > list': {
                itemtap: 'onProblemResolutionSelected'
            }
        }
    },

    displayProblemType: function (textField) {
        var me = this,
            probTypeData = Ext.create('Maintenance.util.ProblemTypeData'),
            nestedData = probTypeData.generateProbtypeObject(),
            selectedNode = null;

        if (!me.probTypeView) {
            me.probTypeView = Ext.create( 'Maintenance.view.tablet.ProblemType', {},
                    nestedData);
            Ext.Viewport.add(me.probTypeView);
        }

        var nestedList = me.probTypeView.query('nestedlist');

        if (nestedList) {
            selectedNode = me.getSelectedNode(textField, nestedList);
            if (Ext.isEmpty(textField.getValue())) {
                me.doBackToParent(nestedList[0]);
            }
        }

        if (nestedList && selectedNode !== null) {
            nestedList[0].getActiveItem().select(selectedNode);
        }

        me.probTypeView.show();
    },

    onProblemTypeSelected: function (me, list, index, target, record) {
        var code = record.get('code'),
            workOrderView = this.getWorkRequestEditPanel();

        workOrderView.setValues({
            prob_type: code
        });
        this.probTypeView.hide();
    }
});