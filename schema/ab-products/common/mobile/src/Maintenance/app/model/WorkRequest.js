Ext.define('Maintenance.model.WorkRequest', {
	extend : 'Common.model.ModelBase',

	config : {
		fields : [ {
			name : 'id',
			type : 'auto'
		}, {
			name : 'mob_wr_id',
			type : 'IntegerClass'
		}, {
			name : 'mob_is_changed',
			type : 'IntegerClass'
		}, {
			name : 'mob_locked_by',
			type : 'string'
		}, {
			name : 'mob_pending_action',
			type : 'string'
		}, {
			name : 'wr_id',
			type : 'IntegerClass'
		}, {
			name : 'cf_notes',
			type : 'string'
		}, {
			name : 'site_id',
			type : 'string'
		}, {
			name : 'bl_id',
			type : 'string'
		}, {
			name : 'fl_id',
			type : 'string'
		}, {
			name : 'rm_id',
			type : 'string'
		}, {
			name : 'location',
			type : 'string'
		}, {
			name : 'prob_type',
			type : 'string'
		}, {
			name : 'priority',
			type : 'IntegerClass',
			defaultValue : 1
		}, {
			name : 'requestor',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		}, {
			name : 'eq_id',
			type : 'string'
		}, {
			name : 'status',
			type : 'string',
			defaultValue : 'R'
		}, {
			name : 'date_requested',
			type : 'DateClass',
			defaultValue : new Date()
		}, {
			name : 'tr_id',
			type : 'string'
		}, {
			name : 'pmp_id',
			type : 'string'
		}, {
			name : 'date_assigned',
			type : 'DateClass'
		}, {
			name : 'date_est_completion',
			type : 'DateClass'
		}, {
			name : 'request_type',
			type : 'IntegerClass',
			defaultValue : 0
		},
            {
                name: 'cause_type',
                type: 'string'
            },
            {
                name: 'repair_type',
                type: 'string'
            },
		// isSyncField should be true for doc1, doc2, doc3 and doc4 fields
		// Set to false for testing

		{
			name : 'doc1',
			type : 'string',
			isDocumentField : true,
			isSyncField : true
		}, {
			name : 'doc1_contents',
			type : 'string',
			isSyncField : true
		}, {
			name : 'doc1_isnew',
			type : 'boolean',
			defaultValue : false,
			isSyncField : false
		}, {
			name : 'doc2',
			type : 'string',
			isDocumentField : true,
			isSyncField : true
		}, {
			name : 'doc2_contents',
			type : 'string',
			isSyncField : true
		}, {
			name : 'doc2_isnew',
			type : 'boolean',
			defaultValue : false,
			isSyncField : false
		}, {
			name : 'doc3',
			type : 'string',
			isDocumentField : true,
			isSyncField : true
		}, {
			name : 'doc3_contents',
			type : 'string',
			isSyncField : true
		}, {
			name : 'doc3_isnew',
			type : 'boolean',
			defaultValue : false,
			isSyncField : false
		}, {
			name : 'doc4',
			type : 'string',
			isDocumentField : true,
			isSyncField : true
		}, {
			name : 'doc4_contents',
			type : 'string',
			isSyncField : true
		}, {
			name : 'doc4_isnew',
			type : 'boolean',
			defaultValue : false,
			isSyncField : false
		}
	],

		validations : [ {
			type : 'presence',
			field : 'bl_id'
		}, {
			type : 'presence',
			field : 'prob_type'
		}, {
			type : 'presence',
			field : 'description'
		} ]
	},

    /**
     * Override to allow setting of the mob_pending_action field
     * Sets the Changed on Mobile field to true if any of the values in the record have been modified
     */
    setChangedOnMobile: function () {
        this.callParent();

        if (this.fields.containsKey('mob_pending_action') && this.fields.containsKey('status')) {
            var status = this.get('status');
            this.set('mob_pending_action', status);
        }
    }
});
