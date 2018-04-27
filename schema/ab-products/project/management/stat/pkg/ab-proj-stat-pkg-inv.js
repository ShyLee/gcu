var projStatPkgInvController = View.createController('projStatPkgInv', {
    
    projStatPkgInvGrid_onAddNew:function() {
		View.openDialog('ab-proj-stat-pkg-inv-add.axvw', this.projStatPkgInvGrid.restriction, true);
    }
});