
View.createController('calculateCashFlowProjection', {
    
    console_onCalculate: function() {
        var record = this.consoleDs.processOutboundRecord(this.console.getRecord());
        var dateStart = record.getValue('cost_tran_recur.date_start');
        var dateEnd = record.getValue('cost_tran_recur.date_end');
        var fromCosts = $('fromCosts').checked;
        var fromScheduledCosts = $('fromScheduledCosts').checked;
        var fromRecurringCosts = $('fromRecurringCosts').checked;
        var groupByCostCategory = $('groupByCostCategory').checked;
        
        try {
            var result = Workflow.callMethod('AbCommonResources-CostService-getCashFlowProjection', 
                'pr', dateStart, dateEnd, 'MONTH', 'NETINCOME', 
                fromCosts, fromScheduledCosts, fromRecurringCosts, groupByCostCategory, '', '', '', {});
            this.report.show();
            this.report.setDataSet(result.dataSet);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    console_onCalculateAsJob: function() {
        var record = this.consoleDs.processOutboundRecord(this.console.getRecord());
        var dateStart = record.getValue('cost_tran_recur.date_start');
        var dateEnd = record.getValue('cost_tran_recur.date_end');
        var fromCosts = $('fromCosts').checked;
        var fromScheduledCosts = $('fromScheduledCosts').checked;
        var fromRecurringCosts = $('fromRecurringCosts').checked;
        var groupByCostCategory = $('groupByCostCategory').checked;
        
        try {
            var jobId = Workflow.startJob('AbCommonResources-CostService-getCashFlowProjection', 
                'pr', dateStart, dateEnd, 'MONTH', 'NETINCOME', 
                fromCosts, fromScheduledCosts, fromRecurringCosts, groupByCostCategory, '', '', '', {});
            
            var reportPanel = this.report;
            View.openJobProgressBar('Calculating', jobId, '', function(status) {
                reportPanel.show();
                reportPanel.setDataSet(status.dataSet);
            });
            
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});
