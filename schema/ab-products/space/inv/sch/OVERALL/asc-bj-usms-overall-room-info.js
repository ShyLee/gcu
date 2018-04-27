var abScRptRmInvByFl = View.createController('abScRptRmInvByFlController', {

    afterViewLoad: function(){
    },
    
    
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var gridPanel = View.panels.get("abScRptRmInv_SumGrid");
        var restriction = new Ab.view.Restriction();
        var rmCat = consolePanel.getFieldValue('rm.rm_cat');
        if (rmCat != '') {
            restriction.addClause("rm.rm_cat", rmCat + "%", "like");
            var title = String.format(getMessage('gridTitle'), rmCat);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var rmType = consolePanel.getFieldValue('rm.rm_type');
        if (rmType != '') {
            restriction.addClause("rm.rm_type", rmType + "%", "like");
            var title = String.format(getMessage('gridTitle'), rmType);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var dvId = consolePanel.getFieldValue('dv.dv_id');
        if (dvId != '') {
            restriction.addClause("rm.dv_id", dvId + "%", "like");
            var title = String.format(getMessage('gridTitle'), dvId);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var buId = consolePanel.getFieldValue('dv.bu_id');
        if (buId != '') {
            restriction.addClause("rm.bu_id", buId + "%", "like");
            var title = String.format(getMessage('gridTitle'), buId);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var siteId = consolePanel.getFieldValue('bl.site_id');
        if (siteId != '') {
            restriction.addClause("rm.site_id", siteId + "%", "like");
            var title = String.format(getMessage('gridTitle'), siteId);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var blName = consolePanel.getFieldValue('bl.name');
        if (blName != '') {
            restriction.addClause("rm.blname", blName + "%", "like");
            var title = String.format(getMessage('gridTitle'), blName);
            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        this.abScRptRmInv_SumGrid.refresh(restriction);
    },
    addTotalRow: function(){
        for (var i = 0; i < this.rows.length; i++) {
            var row = this.rows[i];
            var fntstdCountValue = row['rm.area'];
            if (row['bu.area_rm.raw']) {
                fntstdCountValue = row['rm.area.raw'];
            }
            if (!isNaN(parseInt(fntstdCountValue))) {
                totalAreaShiyong += parseFloat(fntstdCountValue);
            }
        }
    }
    
});





