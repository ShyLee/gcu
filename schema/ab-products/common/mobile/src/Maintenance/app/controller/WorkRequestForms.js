Ext.define('Maintenance.controller.WorkRequestForms', {
    extend: 'Ext.app.Controller',

    requires: [ 'Common.Session', 'Maintenance.view.overlay.HoldAction' ],

    config: {
        refs: {
            problemDescriptionButton: 'textpromptfield[name=description]',
            cfNotesButton: 'textpromptfield[name=cf_notes]',
            problemDescriptionField: 'textpromptinput[name=description]',
            problemResolutionField: 'textpromptinput[name=cf_notes]',
            workRequestEditPanel: 'workRequestPanel',
            holdButton: 'button[action=workRequestHold]',
            actionPanelButton: 'holdActionPanel > button',
            completeButton: 'button[action=workRequestComplete]',
            quickCompleteView: 'quickCompletePanel'
        },
        control: {

            holdButton: {
                tap: 'onHoldButtonTapped'
            },
            completeButton: {
                tap: 'onCompleteButtonTapped'
            },
            'button[action=cancelProblemType]': {
                tap: 'onCancelProblemType'
            },
            actionPanelButton: {
                tap: 'onHoldActionButtonTapped'
            },
            'button[action=quickCompleteCancel]': {
                tap: 'onQuickCompleteCancel'
            },
            quickCompleteView: {
                'quickcompletesave': 'onQuickCompleteSave',
                'remove': 'onQuickCompleteItemRemoved'
            },
            problemDescriptionField: {
                textpromptbuttontap: 'onDisplayProblemDescriptions'
            },

            problemResolutionField: {
                textpromptbuttontap: 'onDisplayProblemResolutions'
            },
            'button[action=cancelProblemDescription]': {
                tap: 'onCancelProblemDescription'
            },
            'button[action=cancelProblemResolution]': {
                tap: 'onCancelProblemResolution'
            }
        }
    },

    getSelectedNode: function (textField, nestedList) {
        var probTypeText = textField.getValue(),
                store = nestedList[0].getStore();

        return store.findRecord('code', probTypeText);
    },

    onProblemTypeSelected: function (me, list, index, target, record) {
        var code = record.get('code'), workOrderView = this.getWorkRequestEditPanel();

        workOrderView.setValues({
            prob_type: code
        });
        this.probTypeView.hide();
    },

    onCancelProblemType: function () {
        if (this.probTypeView) {
            this.probTypeView.hide();
        }
    },

    onDisplayProblemDescriptions: function () {
        var profile = this.getApplication().getCurrentProfile().getNamespace(),
            viewName = profile === 'phone' ? 'Maintenance.view.phone.ProblemDescription'
                : 'Maintenance.view.tablet.ProblemDescription';

        if (!this.problemDescriptionView) {
            this.problemDescriptionView = Ext.create(viewName);
            Ext.Viewport.add(this.problemDescriptionView);
        }

        if (profile === 'phone') {
            this.problemDescriptionView.show();
        } else {
            var descriptionField = this.getProblemDescriptionButton();
            this.problemDescriptionView.showBy(descriptionField.element.first());
        }
    },


    onDisplayProblemResolutions: function () {
        var profile = this.getApplication().getCurrentProfile().getNamespace(),
                viewName = profile === 'phone' ? 'Maintenance.view.phone.ProblemResolution' : 'Maintenance.view.tablet.ProblemResolution';

        if (!this.problemResolutionView) {
            this.problemResolutionView = Ext.create(viewName);
            Ext.Viewport.add(this.problemResolutionView);
        }

        if (profile === 'phone') {
            this.problemResolutionView.show();
        } else {
            var cfNotesField = this.getCfNotesButton();
            this.problemResolutionView.showBy(cfNotesField.element.first());
        }
    },

    onProblemDescriptionSelected: function (view, index, dataItem, record) {
        var panel = this.getWorkRequestEditPanel(),
                panelDescriptionText = panel.getValues().description,
                problemDescription = record.get('pd_description');

        if (panelDescriptionText.length === 0) {
            panelDescriptionText = problemDescription;
        } else {
            panelDescriptionText = panelDescriptionText + '\n' + problemDescription;
        }

        panel.setValues({
            'description': panelDescriptionText
        });

        this.problemDescriptionView.hide();
    },

    onCancelProblemResolution: function () {
        if (this.problemResolutionView) {
            this.problemResolutionView.hide();
        }
    },

    onProblemResolutionSelected: function (view, index, dataItem, record) {
        var panel = this.getWorkRequestEditPanel(),
                panelDescriptionText = panel.getValues().cf_notes,
                cfNotes = record.get('pr_description');

        if (panelDescriptionText.length === 0) {
            panelDescriptionText = cfNotes;
        } else {
            panelDescriptionText = panelDescriptionText + '\n' + cfNotes;
        }

        panel.setValues({
            'cf_notes': panelDescriptionText
        });

        this.problemResolutionView.hide();
    },

    onCancelProblemDescription: function () {
        if (this.problemDescriptionView) {
            this.problemDescriptionView.hide();
        }
    },

    onHoldButtonTapped: function () {
        var workRequestPanel = this.getWorkRequestEditPanel(),
                workRequestRecord = workRequestPanel.getRecord(),
                status = workRequestRecord.get('status');

        // Check if status is complete
        if (status && status.toUpperCase() === 'COM') {
            Ext.Msg.alert('Status',
                    'The Work Request status is Completed.<br>The status cannot be modified.');
            return;
        }

        if (!workRequestRecord.isValid()) {
            workRequestPanel.displayErrors(workRequestRecord);
            return;
        }

        if (!this.actions) {
            this.actions = Ext.create('Maintenance.view.overlay.HoldAction');
            Ext.Viewport.add(this.actions);
        }

        var holdButton = this.getHoldButton();
        this.actions.showBy(holdButton);
    },

    onHoldActionButtonTapped: function (button) {
        var itemId = button.getItemId(),
                status, isCancel = false;

        switch (itemId) {
            case 'holdParts':
                status = 'HP';
                break;
            case 'holdLabor':
                status = 'HL';
                break;
            case 'holdAccess':
                status = 'HA';
                break;
            case 'holdCancel':
                isCancel = true;
                break;
        }

        if (status) {
            this.setStatusField(status);
        }

        if (!isCancel) {
            this.saveWorkRequestRecord();
        }

        if (this.actions) {
            this.actions.hide();
        }
    },

    onCompleteButtonTapped: function () {

        // Get the work request record
        var me = this,
            workRequestPanel = this.getWorkRequestEditPanel(),
            workRequestRecord = workRequestPanel.getRecord(),
            profile = me.getApplication().getCurrentProfile().getNamespace();

        me.setStatusField('Com');

        // Check current craftsperson store
        var record = me.checkCraftspersonRecords();
        if (record !== null) {
            // Display quick complete form.
            me.quickCompletePanel = Ext.create('Maintenance.view.' + profile + '.QuickComplete');
            Ext.Viewport.add(me.quickCompletePanel);
            me.quickCompletePanel.setRecord(record);
            me.quickCompletePanel.setWorkRequestRecord(workRequestRecord);
            var completeButton = me.getCompleteButton();

            if (profile === 'phone') {
                me.quickCompletePanel.show();
            } else {
                me.quickCompletePanel.showBy(completeButton);
            }
        } else {
            me.saveWorkRequestRecord();
        }
    },

    checkCraftspersonRecords: function () {
        var store = Ext.getStore('workRequestCraftspersonsStore'),
            record, totalHours;

        if (store.getCount() === 1) {
            // Check labor hours
            record = store.getAt(0);
            totalHours = record.get('hours_straight') +
                    record.get('hours_over') +
                    record.get('hours_double');
            if (totalHours === 0) {
                return record;
            }
        }
        return null;
    },

    onQuickCompleteSave: function (cfRecord, wrRecord) {
        // Check if the cf record is valid
        var me = this,
                craftspersonStore,
                craftspersonRecord;

        if (cfRecord.isValid()) {
            craftspersonStore = Ext.getStore('workRequestCraftspersonsStore');
            craftspersonRecord = me.quickCompletePanel.getRecord();
            craftspersonRecord.set('mob_is_changed', 1);
            craftspersonStore.sync();
            me.saveWorkRequestRecord();
        } else {
            me.quickCompletePanel.displayErrors(cfRecord);
            if (!Ext.os.is.Phone) {
                me.quickCompletePanel.setHeight(420);
            }
            return;
        }
        me.quickCompletePanel.destroy();
    },

    onQuickCompleteCancel: function () {
        var cfRecord;
        if (this.quickCompletePanel) {
            // Set the hour values back to 0 if they were set
            cfRecord = this.quickCompletePanel.getRecord();
            cfRecord.set('hours_straight', 0);
            cfRecord.set('hours_over', 0);
            cfRecord.set('hours_double', 0);
            this.quickCompletePanel.destroy();
        }
    },

    onQuickCompleteItemRemoved: function (panel) {
        if (!Ext.os.is.Phone) {
            panel.setHeight(300);
        }
    },

    setStatusField: function (status) {
        var view = this.getWorkRequestEditPanel(),
            record = view.getRecord();

        record.set('status', status);
        view.setValues({
            'status': status
        });

    },

    saveWorkRequestRecord: function () {
        var workRequestStore = Ext.getStore('workRequestsStore'),
            workRequestRecord = this.getWorkRequestEditPanel().getRecord(),
            status = workRequestRecord.get('status');

        workRequestRecord.set('mob_is_changed', 1);
        workRequestRecord.set('mob_pending_action', status);

        workRequestStore.sync();
    },

    /**
     * Resets the Problem Type nested list to the parent frame.
     * @param nestedList
     */
    doBackToParent: function(nestedList) {
        var node = nestedList.getLastNode(),
                detailCard = nestedList.getDetailCard(),
                detailCardActive = detailCard && nestedList.getActiveItem() === detailCard,
                lastActiveList = nestedList.getLastActiveList();

        nestedList.doBack(nestedList, node, lastActiveList, detailCardActive);

    }
});