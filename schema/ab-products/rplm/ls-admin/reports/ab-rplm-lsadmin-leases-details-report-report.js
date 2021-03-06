var repLeaseDetailsController = View.createController('repLeaseDetails', {
    bl_id:'',
	pr_id:'',
	ls_id:'',
	
	initializeView:function(){
		this.buildingInformation.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.buildingInformation.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.buildingInformation.addParameter('neither', '\''+getMessage('neither')+'\'');
		
		this.propertyInformation.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.propertyInformation.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.propertyInformation.addParameter('neither', '\''+getMessage('neither')+'\'');
		
		this.leaseInformation.addParameter('active', '\''+getMessage('active')+'\'');
		this.leaseInformation.addParameter('inactive', '\''+getMessage('inactive')+'\'');
		
		
		if(this.ls_id === ''){
			this.leaseInformation.refresh({'ls.ls_id':''});
			this.buildingInformation.refresh({'bl.bl_id':''});
			this.propertyInformation.refresh({'property.pr_id':''});
			this.suiteInfo.refresh({'su.su_id':''});
			this.clausesInfo.refresh({'ls_resp.resp_id': ''});
			this.optionsInfo.refresh({'op.op_id': ''});
			this.amendmentsInfo.refresh({'ls_amendment.ls_amend_id': ''});
			this.documentsInfo.refresh({'docs_assigned.doc_id': ''});
			this.contactsInfo.refresh({'contact.contact_id': ''});
			this.recurringCostsInfo.refresh({'cost_tran_recur.cost_tran_recur_id': ''});
		}
		this.leaseInformation.refresh({'ls.ls_id':this.ls_id}, false);
		if (this.bl_id != '') {
			this.buildingInformation.refresh({'bl.bl_id': this.bl_id}, false);
			this.propertyInformation.show(false);
			if (valueExistsNotEmpty(this.buildingInformation.getFieldValue('bl.bldg_photo'))) {
				this.buildingInformation.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
			}else{
				this.buildingInformation.fields.get(this.buildingInformation.fields.indexOfKey('image_field')).dom.src = null;
				this.buildingInformation.fields.get(this.buildingInformation.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
			}
			this.suiteInfo.refresh({'su.ls_id':this.ls_id}, false);
		}
		else {
			this.propertyInformation.refresh({'property.pr_id': this.pr_id}, false);
			this.buildingInformation.show(false);
			this.suiteInfo.refresh({'su.ls_id':this.ls_id}, false);
			this.suiteInfo.show(false);
			if (valueExistsNotEmpty(this.propertyInformation.getFieldValue('property.prop_photo'))) {
				this.propertyInformation.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
			}else{
				this.propertyInformation.fields.get(this.propertyInformation.fields.indexOfKey('image_field')).dom.src = null;
				this.propertyInformation.fields.get(this.propertyInformation.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
			}	
		}
		
		this.clausesInfo.refresh({'ls_resp.ls_id': this.ls_id}, false);
		this.optionsInfo.refresh({'op.ls_id': this.ls_id}, false);
		this.amendmentsInfo.refresh({'ls_amendment.ls_id': this.ls_id}, false);
		this.documentsInfo.refresh({'docs_assigned.ls_id': this.ls_id}, false);
		this.contactsInfo.refresh({'contact.ls_id': this.ls_id}, false);
		this.recurringCostsInfo.refresh({'cost_tran_recur.ls_id': this.ls_id}, false);
				
		this.buildingInformation.actions.get("paginatedReport").enableButton(valueExistsNotEmpty(this.ls_id) && this.bl_id != '');
		this.propertyInformation.actions.get("paginatedReport").enableButton(valueExistsNotEmpty(this.ls_id) && this.bl_id == '');
	},
	documentsInfo_onView: function(row) {
		var record = row.getRecord();
		var doc_id = record.getValue('docs_assigned.doc_id');
        var docFileName = record.getValue('docs_assigned.doc');
		var keys = {
			'doc_id': doc_id
		};
		View.showDocument(keys, 'docs_assigned', 'doc', docFileName);
	},
	
	buildingInformation_onPaginatedReport: function(){
		var parameters = {
				'lsId' : this.ls_id,
				'leased' : getMessage("leased"),
				'owned' : getMessage("owned"),
				'neither' : getMessage("neither"),
				'active' : getMessage("active"),
				'inactive' : getMessage("inactive")
			};
		if(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 0){
			View.openPaginatedReportDialog('ab-rplm-lsadmin-leases-details-rpt.axvw', null, parameters);
		}else{
			View.openPaginatedReportDialog('ab-rplm-lsadmin-leases-details-rpt-mcvat.axvw', null, parameters);
		}
	},

	propertyInformation_onPaginatedReport: function(){
		var parameters = {
				'lsId' : this.ls_id,
				'leased' : getMessage("leased"),
				'owned' : getMessage("owned"),
				'neither' : getMessage("neither"),
				'active' : getMessage("active"),
				'inactive' : getMessage("inactive")
			};
		if(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 0){
			View.openPaginatedReportDialog('ab-rplm-lsadmin-leases-prop-details-rpt.axvw', null, parameters);
		}else{
			View.openPaginatedReportDialog('ab-rplm-lsadmin-leases-prop-details-rpt-mcvat.axvw', null, parameters);
		}
		
	}
})
