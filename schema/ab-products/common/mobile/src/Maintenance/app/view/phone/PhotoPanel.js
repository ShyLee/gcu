Ext.define('Maintenance.view.phone.PhotoPanel', {
    extend: 'Maintenance.view.overlay.PhotoPanel',

    xtype: 'phoneWorkRequestPhotoPanel',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        }
    }

});
