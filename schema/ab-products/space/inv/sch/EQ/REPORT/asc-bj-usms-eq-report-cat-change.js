var controller = View.createController('controller', {	
	afterInitialDataFetch: function(){	
		var table = document.createElement('table');
		table.id = 'grid_' + this.tablePanel.parentElement.id;
		table.className = this.tablePanel.cssClassName;
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		
		var columns = [];
		columns. push(new Ab.grid.Column('cat', '分类名称','text', null, null));
		columns. push(new Ab.grid.Column('before', '初期数','text', null, null,2));
		columns. push(new Ab.grid.Column('add', '本期增加数','text', null, null,4));
		columns. push(new Ab.grid.Column('re', '本期减少数','text', null, null,5));
		columns. push(new Ab.grid.Column('after', '末期数','text', null, null));
		var columns2 = [];
		columns2. push(new Ab.grid.Column('add_gz', '购置','text', null, null));
		columns2. push(new Ab.grid.Column('add_zr', '转入','text', null, null));
		columns2. push(new Ab.grid.Column('add_qt', '其他','text', null, null));
		columns2. push(new Ab.grid.Column('add_hj', '合计','text', null, null));
		columns2. push(new Ab.grid.Column('re_ds', '调出丢失盘亏','text', null, null));
		columns2. push(new Ab.grid.Column('re_zc', '转出','text', null, null));
		columns2. push(new Ab.grid.Column('re_bf', '报损报废','text', null, null));
		columns2. push(new Ab.grid.Column('re_qt', '其他','text', null, null));
		columns2. push(new Ab.grid.Column('re_hj', '合计','text', null, null));
		this.tablePanel.createHeaderRow(thead,columns,this.tablePanel.headerCells);
		this.tablePanel.createHeaderRow(thead,columns2,this.tablePanel.headerCells);
		thead.firstChild.firstChild.rowSpan = 2;
		thead.firstChild.children[1].rowSpan = 2;
		thead.firstChild.lastChild.rowSpan = 2;
		table.appendChild(thead);
		this.tablePanel.parentElement.appendChild(table);
		var records = this.eq_DS.getRecords();
		for(var r=0;r<records.length;r++)
		{	
			this.appendRow(tbody,records[r]);
		}	
				
		table.appendChild(tbody);
		//显示
		this.tablePanel.show();
		var a = 1;
	},
	appendRow: function(parentElement,record){
		var countRow = document.createElement('tr');
		var sumRow = document.createElement('tr');
		var csiname = record.getValue("eq.csiname");
		this.appendCell(countRow,csiname);
		this.appendCell(countRow,"数量");
		this.appendCell(countRow,record.getValue("eq.before_count"));
		this.appendCell(countRow,record.getValue("eq.add_gz_count"));
		this.appendCell(countRow,record.getValue("eq.add_zr_count"));
		this.appendCell(countRow,record.getValue("eq.add_qt_count"));
		this.appendCell(countRow,record.getValue("eq.add_hj_count"));
		this.appendCell(countRow,record.getValue("eq.re_dc_count"));
		this.appendCell(countRow,record.getValue("eq.re_zc_count"));
		this.appendCell(countRow,record.getValue("eq.re_bf_count"));
		this.appendCell(countRow,record.getValue("eq.re_qt_count"));
		this.appendCell(countRow,record.getValue("eq.re_hj_count"));
		this.appendCell(countRow,record.getValue("eq.after_count"));
		countRow.firstChild.rowSpan = 2;
		this.appendCell(sumRow,"金额");
		this.appendCell(sumRow,record.getValue("eq.before_sum"));
		this.appendCell(sumRow,record.getValue("eq.add_gz_sum"));
		this.appendCell(sumRow,record.getValue("eq.add_zr_sum"));
		this.appendCell(sumRow,record.getValue("eq.add_qt_sum"));
		this.appendCell(sumRow,record.getValue("eq.add_hj_sum"));
		this.appendCell(sumRow,record.getValue("eq.re_dc_sum"));
		this.appendCell(sumRow,record.getValue("eq.re_zc_sum"));
		this.appendCell(sumRow,record.getValue("eq.re_bf_sum"));
		this.appendCell(sumRow,record.getValue("eq.re_qt_sum"));
		this.appendCell(sumRow,record.getValue("eq.re_hj_sum"));
		this.appendCell(sumRow,record.getValue("eq.after_sum"));

		
		parentElement.appendChild(countRow);
		parentElement.appendChild(sumRow);
	},
	appendCell: function(parentElement,value){
		var cellElement = document.createElement('td');
		cellElement.innerHTML = Ext.util.Format.ellipsis(value, 50);
		cellElement.style.textAlign = 'right';
		parentElement.appendChild(cellElement);
	},
	tablePanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqCatChangeReport",closeButton:false});
	}
	
});