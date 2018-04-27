Ext.define('Maintenance.view.WorkRequestDocuments', {
    extend: 'Ext.Container',

    requires: 'Maintenance.view.WorkRequestDocumentItem',

    config: {
        title: 'Documents',
        layout: 'vbox',
        items: [
            {
                xtype: 'container',
                html: '<div style="text-align:center;color: #4169e1;margin-top:20px;padding-top:20px">No Documents available for this Work Request</div>',
                itemId: 'documentMessage'
            }
        ]
    },

    applyRecord: function (config) {
        if (config) {
            this.processDocumentFields(config);
        }
        return config;
    },

    processDocumentFields: function (record) {
        var me = this,
            documentMessage = me.down('#documentMessage');
            data = record.getData(),
            documentFieldId = 1,
            documents = [
            {
                file: data.doc1,
                data: data.doc1_contents
            },
            {
                file: data.doc2,
                data: data.doc2_contents
            },
            {
                file: data.doc3,
                data: data.doc3_contents
            },
            {
                file: data.doc4,
                data: data.doc4_contents
            }
        ];

        Ext.each(documents, function (document) {
            var documentItem;

            if (document.file !== null) {
                documentMessage.setHidden(true);
                documentItem = Ext.factory({
                    file: {
                        html: document.file
                    },
                    documentData: document.data,
                    mobileWrId: record.getId(),
                    documentFieldId: documentFieldId
                }, 'Maintenance.view.WorkRequestDocumentItem');

                me.add(documentItem);
            }
            documentFieldId += 1;
        }, this)

    }

});