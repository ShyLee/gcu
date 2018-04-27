var projStatPkgBidsController = View.createController('projStatPkgBids',{
	
	afterInitialDataFetch : function() {
		if (this.projStatPkgBids_page1Form.newRecord != true) {
			this.projStatPkgBids_tabs.selectTab('projStatPkgBids_page2');
			var status = this.projStatPkgBids_page2Form.getFieldValue('work_pkg_bids.status');
			if (status == 'Submitted' || status == 'Submitted-InReview') {
				this.projStatPkgBids_page2Form.show(false);
				this.projStatPkgBids_page2SubmittedBidForm.show(true);
				$('projStatPkgBids_page3_status').value = status;
			}
			else {
				this.projStatPkgBids_page2Form.show(true);
				this.projStatPkgBids_page2SubmittedBidForm.show(false);
			}
		}
	},
	
	projStatPkgBids_page2SubmittedBidForm_onSaveStatusChange : function() {
		var status = $('projStatPkgBids_page3_status').value;
		this.projStatPkgBids_page2SubmittedBidForm.setFieldValue('work_pkg_bids.status', status);
		this.projStatPkgBids_page2SubmittedBidForm.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projStatPkgBids_page2Form_onSubmit : function() {
		this.projStatPkgBids_page2Form.setFieldValue('work_pkg_bids.status', 'Submitted');
		this.projStatPkgBids_page2Form.setFieldValue('work_pkg_bids.date_submitted', new Date());
		this.projStatPkgBids_page2Form.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projStatPkgBids_page2Form_onWithdraw : function() {
		this.projStatPkgBids_page2Form.setFieldValue('work_pkg_bids.status', 'Withdrawn');
		this.projStatPkgBids_page2Form.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	}
});