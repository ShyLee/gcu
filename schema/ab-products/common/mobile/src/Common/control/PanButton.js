Ext.define('Common.control.PanButton', {
    extend: 'Ext.Component',

    xtype: 'panbutton',

    config: {
        baseCls: 'x-panbutton'
    },


    template: [

        {
            tag: 'div',
            reference: 'row1',
            cls: 'x-panbutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-panbutton-item',
                    reference: 'p1'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item x-panbutton-arrow x-panbutton-up x-panbutton-border',
                    reference: 'panUp'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item',
                    reference: 'p2'
                }
            ]
        },
        {
            tag: 'div',
            reference: 'row2',
            cls: 'x-panbutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-panbutton-item x-panbutton-arrow x-panbutton-left x-panbutton-border',
                    reference: 'panLeft'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item',
                    reference: 'p3'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item x-panbutton-arrow x-panbutton-border',
                    reference: 'panRight'
                }
            ]

        },
        {
            tag: 'div',
            reference: 'row3',
            cls: 'x-panbutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-panbutton-item',
                    reference: 'p4'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item x-panbutton-arrow x-panbutton-down x-panbutton-border',
                    reference: 'panDown'
                },
                {
                    tag: 'div',
                    cls: 'x-panbutton-item',
                    reference: 'p5'
                }
            ]
        }
    ],

    initialize: function () {
        this.callParent(arguments);

        this.panUp.on({
            scope: this,
            tap: 'onPanUp'
        });

        this.panDown.on({
            scope: this,
            tap: 'onPanDown'
        });

        this.panRight.on({
            scope: this,
            tap: 'onPanRight'
        });

        this.panLeft.on({
            scope: this,
            tap: 'onPanLeft'
        });
    },

    onPanUp: function () {
        this.fireEvent('panup', this);
    },

    onPanDown: function () {
        this.fireEvent('pandown', this);
    },

    onPanRight: function () {
        this.fireEvent('panright', this);
    },

    onPanLeft: function () {
        this.fireEvent('panleft', this);
    }


});