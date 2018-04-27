Ext.define('Common.control.ProgressBar', {
    extend : 'Ext.Component',

    xtype : 'progressbar',

    config : {
        baseCls : 'x-progressbar',

        /**
         * @cfg value {Integer} The current value of the progress bar indicator
         */
        value : 0,

        /**
         * @cfg maxValue {Integer} The maximum value for the progress bar indicator
         */
        maxValue : 100,

        cancelled: false,

        /**
         * @cfg progressMessage {String} The message displayed on the progress bar. The first placehoder displays the
         *      value config property. The second placeholder field displays the maxValue property. The value property
         *      is updated when the progress bar is incremented.
         */
        progressMessage : 'Loading Item {0} of {1}'
    },

    template : [ {
        tag : 'div',
        reference : 'label',
        cls : 'x-progressbar-label'
    }, {
        tag : 'div',
        reference : 'progress',
        cls : 'x-progressbar-progress',
        children : [ {
            tag : 'span',
            reference : 'indicator'
        } ]
    }, {
        tag : 'div',
        cls : 'x-progress-button-container',
        children : [ {
            tag : 'div',
            reference : 'cancelBtn',
            cls : 'x-progress-button'
        } ]

    } ],

    initialize : function() {
        var me = this;

        me.setCancelled(false);
        me.doMessage();

        me.cancelBtn.setHtml('Cancel');
        me.cancelBtn.on({
            scope : this,
            tap : 'onCancel'
        });
    },

    updateMaxValue : function(newMaxValue, oldMaxValue) {
        if (newMaxValue) {
            this.doMessage();
        }
    },

    /**
     * Increments the progress indicator value. Updates the status label.
     */
    increment : function() {
        var me = this,
            value = me.getValue(),
            max = me.getMaxValue(),
            indicatorValue;

        me.setValue(value += 1);

        indicatorValue = Math.ceil((value / max) * 100);

        this.indicator.setStyle('width', indicatorValue + '%');
        me.doMessage();

        if (value === max) {
            me.onComplete();
        }
    },

    onCancel : function() {
        this.setCancelled(true);
        this.fireEvent('cancel', this);
    },

    onComplete : function() {
        this.setValue(0);
        this.fireEvent('complete', this);
    },

    doMessage : function() {
        var maxValue = this.getMaxValue(),
            value = this.getValue(),
            progressMessage = this.getProgressMessage();

        this.label.setHtml(Ext.String.format(progressMessage, value, maxValue));
    }
});
