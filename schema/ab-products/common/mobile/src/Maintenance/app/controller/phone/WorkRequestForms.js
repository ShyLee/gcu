Ext.define('Maintenance.controller.phone.WorkRequestForms', {
    extend: 'Maintenance.controller.WorkRequestForms',

    config: {
        refs: {
            probTypeList: 'phoneProblemTypePanel > nestedlist'
        },
        control: {
            'promptfield[name=prob_type]': {
                promptTapped: 'displayProblemType'
            },
            probTypeList: {
                leafitemtap: 'onProblemTypeSelected'
            },
            'phoneProblemDescriptionPanel > list': {
                itemtap: 'onProblemDescriptionSelected'
            },
            'phoneProblemResolutionPanel > list': {
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
            me.probTypeView = Ext.create(
                    'Maintenance.view.phone.ProblemType', {},
                    nestedData);
            Ext.Viewport.add(me.probTypeView);
        }

        var nestedList = me.probTypeView.query('nestedlist');

        if (nestedList) {
            selectedNode = this.getSelectedNode(textField, nestedList);
            if (Ext.isEmpty(textField.getValue())) {
                this.doBackToParent(nestedList[0]);
            }
        }

        if (nestedList && selectedNode !== null) {
            nestedList[0].getActiveItem().select(selectedNode);
        }

        me.probTypeView.show();
    },

    onProblemTypeSelected: function (me, list, index, target, record, e, eOpts) {
        var code = record.get('code'),
            workOrderView = this.getWorkRequestEditPanel();

        workOrderView.setValues({
            prob_type: code
        });
        this.probTypeView.hide();
    }
});