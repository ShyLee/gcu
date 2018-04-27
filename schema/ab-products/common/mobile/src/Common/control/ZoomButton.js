Ext.define('Common.control.ZoomButton', {

    extend: 'Ext.Component',

    xtype: 'zoombutton',

    config: {
        baseCls: 'x-zoombutton'
    },


    template: [

        {
            tag: 'div',
            reference: 'row1',
            cls: 'x-zoombutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item',
                    reference: 'p1'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item x-zoombutton-plus x-zoombutton-border',
                    reference: 'zoomIn'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item',
                    reference: 'p2'
                }
            ]
        },
        {
            tag: 'div',
            reference: 'row2',
            cls: 'x-zoombutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item x-zoombutton-home x-zoombutton-border',
                    reference: 'zoomExtent'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item',
                    reference: 'p3'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item x-zoombutton-zoomto x-zoombutton-border',
                    reference: 'zoomTo'
                }
            ]

        },
        {
            tag: 'div',
            reference: 'row3',
            cls: 'x-zoombutton-row',
            children: [
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item',
                    reference: 'p4'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item x-zoombutton-minus x-zoombutton-border',
                    reference: 'zoomOut'
                },
                {
                    tag: 'div',
                    cls: 'x-zoombutton-item',
                    reference: 'p5'
                }
            ]
        }
    ],

    initialize: function () {
        this.callParent(arguments);

        this.zoomIn.on({
            scope: this,
            tap: 'onZoomIn'
        });

        this.zoomOut.on({
            scope: this,
            tap: 'onZoomOut'
        });

        this.zoomExtent.on({
            scope: this,
            tap: 'onZoomExtent'
        });

        this.zoomTo.on({
            scope: this,
            tap: 'onZoomTo'
        });
    },

    onZoomIn: function () {
        this.fireEvent('zoomin', this);
    },

    onZoomOut: function () {
        this.fireEvent('zoomout', this);
    },

    onZoomExtent: function () {
        this.fireEvent('zoomextent', this);
    },

    onZoomTo: function () {
        this.fireEvent('zoomto', this);
    }
});