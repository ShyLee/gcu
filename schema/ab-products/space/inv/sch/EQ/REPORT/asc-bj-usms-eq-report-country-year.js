var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var columns = [];
		var date = new Date();
		var year = parseInt(date.getFullYear());	
		columns. push(new Ab.grid.Column('dv', '','text', null, null));
		columns. push(new Ab.grid.Column('y10',(year-12)+'年至'+(year-11)+'年','text', null, null, 2));
		columns. push(new Ab.grid.Column('y8', (year-10)+'年至'+(year-9)+'年','text', null, null, 2));
		columns. push(new Ab.grid.Column('y6', (year-8)+'年至'+(year-7)+'年','text', null, null, 2));
		columns. push(new Ab.grid.Column('y4', (year-6)+'年至'+(year-5)+'年','text', null, null, 2));
		columns. push(new Ab.grid.Column('y2', (year-4)+'年至'+(year-3)+'年','text', null, null, 2));
		columns. push(new Ab.grid.Column('hj', (year-2)+'年至'+(year-1)+'年','text', null, null, 2));
		
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
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqCountryYearReport",closeButton:false});
	}
});