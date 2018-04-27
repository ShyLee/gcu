var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var columns = [];
		columns. push(new Ab.grid.Column('dv', '','text', null, null));
		columns. push(new Ab.grid.Column('dr', '在用、调入及转入','text', null, null, 2));
		columns. push(new Ab.grid.Column('dy', '多余','text', null, null, 2));
		columns. push(new Ab.grid.Column('dx', '待修','text', null, null, 2));
		columns. push(new Ab.grid.Column('dbf', '待报废','text', null, null, 2));
		columns. push(new Ab.grid.Column('qt', '其他','text', null, null, 2));
		columns. push(new Ab.grid.Column('hj', '合计','text', null, null, 2));
		var table=this.gridPanel.tableElement;
		this.gridPanel.tableHeadElement.remove();
		var thead = document.createElement('thead');
		this.gridPanel.createHeaderRow(thead, columns,this.gridPanel.headerCells);
		this.gridPanel.createHeaderRow(thead, this.gridPanel.columns, this.gridPanel.headerCells2);
		table.appendChild(thead);
	},
	gridPanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqStatusReport",closeButton:false});
	}
});