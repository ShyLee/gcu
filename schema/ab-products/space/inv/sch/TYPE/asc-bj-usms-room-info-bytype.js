var abScRptRmInvByFl = View.createController('abScRptRmInvByFlController', {
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var gridPanel = View.panels.get("abScRptRmInv_SumGrid");
        var restriction = new Ab.view.Restriction();
        var rmUse = consolePanel.getFieldValue('rm.rm_use');
        if (rmUse != '') {
            restriction.addClause("rm.rm_use", rmUse + "%", "like");
            var title = String.format(getMessage('gridTitle'), rmUse);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var rmType = consolePanel.getFieldValue('rm.rm_type');
        if (rmType != '') {
            restriction.addClause("rm.rm_type", rmType + "%", "like");
            var title = String.format(getMessage('gridTitle'), rmType);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var rmCat = consolePanel.getFieldValue('rm.rm_cat');
        if (rmCat != '') {
            restriction.addClause("rm.rm_cat", rmCat + "%", "like");
            var title = String.format(getMessage('gridTitle'), rmCat);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        
        this.abScRptRmInv_SumGrid.refresh(restriction);
    }
    
});





