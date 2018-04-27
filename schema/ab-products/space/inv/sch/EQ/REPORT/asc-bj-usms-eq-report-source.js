var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var columns = [];
		var date = new Date();
		var year = parseInt(date.getFullYear());	
		columns. push(new Ab.grid.Column('dv', '','text', null, null));
		columns. push(new Ab.grid.Column('y10','购置','text', null, null, 2));
		columns. push(new Ab.grid.Column('y8', '捐赠','text', null, null, 2));
		columns. push(new Ab.grid.Column('y6', '自制','text', null, null, 2));
		columns. push(new Ab.grid.Column('y4', '调入','text', null, null, 2));
		columns. push(new Ab.grid.Column('y2', '盘盈','text', null, null, 2));
		columns. push(new Ab.grid.Column('hj', '合计','text', null, null, 2));
		if(this.gridPanel.rows.length>0){
			var table=this.gridPanel.tableElement;
			this.gridPanel.tableHeadElement.remove();
			
			var thead = document.createElement('thead');
			this.gridPanel.createHeaderRow(thead, columns,this.gridPanel.headerCells);
			this.gridPanel.createHeaderRow(thead, this.gridPanel.columns, this.gridPanel.headerCells2);
			table.appendChild(thead);
		}
	},
	gridPanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqSourceReport",closeButton:false});
	}
});