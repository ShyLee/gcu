Ext.define('Common.view.panel.ProgressBar', {
    extend: 'Ext.Panel',

    requires: 'Common.control.ProgressBar',

    xtype: 'progressbarpanel',

    config: {
        width: 385,
        height: 120,
        centered: true,
        modal: true,
        progressBar: {style: 'margin-left:10px'},
        value: 0,
        maxValue: 100,
        progressMessage : 'Loading Item {0} of {1}',
        cancelled: false
    },

    applyProgressBar: function(config) {
        var progressBar = Ext.factory(config, 'Common.control.ProgressBar', this.getProgressBar());
        return progressBar;
    },

    updateProgressBar: function(newBar, oldBar) {
        if(newBar) {
            this.add(newBar);

            newBar.on({
                scope: this,
                cancel: this.onCancel,
                complete: this.onComplete
            });
        }
    },

    applyValue: function(config) {
        this.getProgressBar().setValue(config);
        return config;
    },

    applyMaxValue: function(config) {
        this.getProgressBar().setMaxValue(config);
        return config;
    },

    applyProgressMessage: function(config) {
        this.getProgressBar().setProgressMessage(config);
        return config;
    },

    increment: function() {
        var progressBar = this.getProgressBar();
        if(progressBar){
            progressBar.increment();
        }
    },

    onCancel: function() {
        this.setCancelled(true);
        this.fireEvent('cancel', this);
    },

    onComplete: function() {
        this.fireEvent('complete', this);
    }
});