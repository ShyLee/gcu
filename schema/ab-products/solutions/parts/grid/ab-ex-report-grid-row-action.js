
View.createController('exReportGridRowAction', {

    abExReportGridRowAction_detailsPanel2_onClickItem: function(row) {
        // the row parameter is the Ab.grid.Row object for the selected row
        var restriction = new Ab.view.Restriction();
        restriction.addClause('project.project_id', row.getFieldValue('project.project_id'));
        View.openDialog('ab-ex-report-grid-row-action-details.axvw', restriction);
    }
});