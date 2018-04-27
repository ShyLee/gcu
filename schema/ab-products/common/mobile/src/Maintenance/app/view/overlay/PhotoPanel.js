Ext.define('Maintenance.view.overlay.PhotoPanel', {
    extend: 'Ext.form.Panel',

    xtype: 'workRequestPhotoPanel',

    config: {
        workRequestId: null,

        imageData: null,

        styleHtmlContent: true,

        isDisplayOnly: false,

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: 'Photo'
            },
            {
                itemId: 'imageContainer',
                xtype: 'container',
                html: ''
            },
            {
                xtype: 'titlebar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'button',
                        text: 'Attach to Work Request',
                        align: 'right',
                        action: 'attachPhoto'
                    },
                    {
                        xtype: 'button',
                        text: 'Close',
                        action: 'closePhotoPanel'
                    }
                ]
            }
        ]
    },

    applyImageData: function (imageData) {
        this.setImageHtml(imageData);
        return imageData;
    },

    setImageHtml: function (imageData) {
        var imageContainer = this.query('#imageContainer')[0];
        imageContainer
                .setHtml('<div style="width:380;margin-left:auto;margin-right:auto;"><img style="margin:auto;display:block" width="300" height="300" src="data:image/jpg;base64,'
                        + imageData + '"/></div>');
    },

    applyIsDisplayOnly: function (config) {
        var attachButton = this.query('button[action=attachPhoto]')[0];

        attachButton.setHidden(config);
    }

});