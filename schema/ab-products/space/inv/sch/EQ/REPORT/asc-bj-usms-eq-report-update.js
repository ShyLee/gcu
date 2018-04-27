var controller = View.createController('controller', {	
		
	afterInitialDataFetch: function(){
		this.tablePanel.setTitle("各单位评估仪器设备更新统计");
		View.setTitle("各单位评估仪器设备更新统计");
		var table = document.createElement('table');
		table.id = 'grid_' + this.tablePanel.parentElement.id;
		table.className = this.tablePanel.cssClassName;
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		
		var columns = [];
		columns. push(new Ab.grid.Column('cat', '单位名称','text', null, null,2));
		columns. push(new Ab.grid.Column('jd', '机电类','text', null, null,3));
		columns. push(new Ab.grid.Column('dz', '电子类（包括电子测量仪器0319、通讯仪器0320）','text', null, null,3));
		columns. push(new Ab.grid.Column('js', '计算机类','text', null, null,3));
		columns. push(new Ab.grid.Column('total', '合计','text', null, null));
		
		var columns2 = [];
		columns2. push(new Ab.grid.Column('jd_hj', '合计','text', null, null));
		columns2. push(new Ab.grid.Column('jd_20', '其中：20年内购置','text', null, null));
		columns2. push(new Ab.grid.Column('jd_perc', '更新率（%）','text', null, null));
		columns2. push(new Ab.grid.Column('dz_hj', '合计','text', null, null));
		columns2. push(new Ab.grid.Column('dz_20', '其中：15年内购置','text', null, null));
		columns2. push(new Ab.grid.Column('dz_perc', '更新率（%）','text', null, null));
		columns2. push(new Ab.grid.Column('js_hj', '合计','text', null, null));
		columns2. push(new Ab.grid.Column('js_20', '其中：5年内购置','text', null, null));
		columns2. push(new Ab.grid.Column('js_perc', '更新率（%）','text', null, null));
		
		this.tablePanel.createHeaderRow(thead,columns,this.tablePanel.headerCells);
		this.tablePanel.createHeaderRow(thead,columns2,this.tablePanel.headerCells);
		thead.firstChild.firstChild.rowSpan = 2;
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
		var csiname = record.getValue("eq.dvname");
		this.appendCell(countRow,csiname);
		this.appendCell(countRow,"数量");
		this.appendCell(countRow,record.getValue("eq.jd_count"));
		this.appendCell(countRow,record.getValue("eq.jd20_count"));
		this.appendCell(countRow,record.getValue("eq.jd_Percent"));
		this.appendCell(countRow,record.getValue("eq.dz_count"));
		this.appendCell(countRow,record.getValue("eq.dz20_count"));
		this.appendCell(countRow,record.getValue("eq.dz_Percent"));
		this.appendCell(countRow,record.getValue("eq.js_count"));
		this.appendCell(countRow,record.getValue("eq.js20_count"));
		this.appendCell(countRow,record.getValue("eq.js_Percent"));
		this.appendCell(countRow,record.getValue("eq.hj_count"));
		countRow.firstChild.rowSpan = 2;
		countRow.children[4].rowSpan = 2;
		countRow.children[7].rowSpan = 2;
		countRow.children[10].rowSpan = 2;
		this.appendCell(sumRow,"金额");
		this.appendCell(sumRow,record.getValue("eq.jd_sum"));
		this.appendCell(sumRow,record.getValue("eq.jd20_sum"));
		this.appendCell(sumRow,record.getValue("eq.dz_sum"));
		this.appendCell(sumRow,record.getValue("eq.dz20_sum"));
		this.appendCell(sumRow,record.getValue("eq.js_sum"));
		this.appendCell(sumRow,record.getValue("eq.js20_sum"));	
		this.appendCell(sumRow,record.getValue("eq.hj_sum"));	
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
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqUpdateReport",closeButton:false});
	}
});