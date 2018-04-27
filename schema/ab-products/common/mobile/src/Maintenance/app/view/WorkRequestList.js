Ext.define('Maintenance.view.WorkRequestList', {

    extend: 'Common.view.navigation.ListBase',
    xtype: 'workrequestListPanel',

    /**
     * Used by the WorkRequestNavigation controller to indicate
     * that the child forms should have a work request filter
     * applied.
     */
    isWorkRequestList: true,

    phoneItemTemplate: [
        '<div class="prompt-list-hbox"><h1>{[this.formatWr(values.wr_id, values.id)]}</h1>',
        '<div class="prompt-list-date">{date_assigned:date("{0}")}</div></div>',
        '<div>{prob_type}</div><div class="prompt-list-vbox"><h3>{description}</h3></div>' ]
            .join(''),

    tabletItemTemplate: [
        '<div class="prompt-list-hbox"">',
        '<h1 style="width:30%;">{[this.formatWr(values.wr_id, values.id)]}</h1><div style="width:30%;">{prob_type}</div>',
        '<div class="prompt-list-date">{date_assigned:date("{0}")}</div></div>',
        '<div class="prompt-list-vbox"><h3>{description}</h3></div>' ]
            .join(''),

    config: {

        editViewClass: Ext.os.is.Phone ? 'Maintenance.view.phone.WorkRequestEdit'
                : 'Maintenance.view.tablet.WorkRequestEdit',

        title: Ext.os.is.Phone ? '' : 'My Work',

        displayMode: 'MyWork',

        items: [
            {
                xtype: 'list',
                store: 'workRequestsStore',
                flex: 1,
                refreshHeightOnUpdate: false,
                plugins: {
                    xclass: 'Ext.plugin.ListPaging',
                    autoPaging: false
                }
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        items: [
                            {
                                text: 'My Work',
                                actionId: 'MYWORK',
                                pressed: true,
                                itemId: 'myWorkBtn',
                                ui: 'base'
                            },
                            {
                                text: 'My Requests',
                                actionId: 'MYREQUESTS',
                                itemId: 'myRequestBtn'
                            }
                        ]
                    }
                ]

            }
        ]
    },

    initialize: function () {
        var list = this.down('list'),
                template = Ext.os.is.Phone ? this.phoneItemTemplate : this.tabletItemTemplate,
                formattedTpl = Ext.String.format(template, LocaleManager.getLocalizedDateFormat()),
                requestedText = LocaleManager.getLocalizedString('REQUESTED', 'Maintenance.view.WorkRequestList'),
                xTpl = new Ext.XTemplate(
                        formattedTpl,
                        {
                            formatWr: function (wrid, id) {
                                var mobileId = id ? '-' + id.toString() : '';
                                return wrid.toString() === null ? requestedText + mobileId : wrid.toString();
                            }
                        });

        list.setItemTpl(xTpl);
        this.callParent();
    },

    getActiveWorkSelection: function() {
        var button = this.down('toolbar segmentedbutton'),
            pressedButtons = button.getPressedButtons(),
            activeSelection = 'MyWork',
            buttonItemId;

        if (pressedButtons && pressedButtons.length > 0) {
            buttonItemId = pressedButtons[0].getItemId();
        }

        if(buttonItemId === 'myWorkBtn') {
            activeSelection = 'MyWork'
        } else if (buttonItemId === 'myRequestBtn') {
            activeSelection = 'MyRequest'
        }
        return activeSelection;
    }
});