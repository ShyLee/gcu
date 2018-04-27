var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var columns = [];
		var columns2 = [];	
		columns. push(new Ab.grid.Column('dv', '单位名称','text', null, null));
		columns. push(new Ab.grid.Column('ly','上年度末实有数','text', null, null, 4));
		columns. push(new Ab.grid.Column('add', '本年度增加数','text', null, null, 2));
		columns. push(new Ab.grid.Column('re', '本年度减少数','text', null, null, 4));
		columns. push(new Ab.grid.Column('hj', '本年度末实有数','text', null, null, 4));
		
		columns2. push(new Ab.grid.Column('ly_hj', '合计','text', null, null,2));
		columns2. push(new Ab.grid.Column('ly_100k_hj', '其中10万元以上','text', null, null,2));
		columns2. push(new Ab.grid.Column('add_hj', '合计','text', null, null,2));
		columns2. push(new Ab.grid.Column('re_hj', '合计','text', null, null,2));
		columns2. push(new Ab.grid.Column('re_dm_hj', '其中报废报损','text', null, null,2));
		columns2. push(new Ab.grid.Column('hj_hj', '合计','text', null, null,2));
		columns2. push(new Ab.grid.Column('hj_100k_hj', '其中10万元以上','text', null, null,2));
		var table=this.gridPanel.tableElement;
		this.gridPanel.tableHeadElement.remove();
		var thead = document.createElement('thead');
		this.gridPanel.createHeaderRow(thead, columns,this.gridPanel.headerCells);
		this.gridPanel.createHeaderRow(thead, columns2,this.gridPanel.headerCells);
		this.gridPanel.columns.splice(0, 1);
		this.gridPanel.createHeaderRow(thead,this.gridPanel.columns, this.gridPanel.headerCells2);
		thead.firstChild.firstChild.rowSpan = 3;
		var a = thead.firstChild.firstChild;
		table.appendChild(thead);
	},
	gridPanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqDvByChangeReport",closeButton:false});
	}
});