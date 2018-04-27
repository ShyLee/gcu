Ab.grid.Category = Ab.grid.MiniConsole.extend({

	// datasource for grouping categories
	categoryDataSource: null,

	// datasource id for grouping categories
	categoryDataSourceId: '',
	
	categoryField: '',
	
	categoryOrder: [],
	
	categoryRecords: [],
	
	categoryColors: {},
			
	// @begin_translatable
	z_NO_FIELD_ERROR_MESSAGE: 'No field specified.  Please specify a field name.',
	z_CATEGORY_FIELD_NOT_FOUND_ERROR_MESSAGE: 'Category field could not be matched to field list in details.  Please ensure that a category field has been specified and that a similar field exists in the details datasource and panel.',
	z_NONE: '<none>',
	// @end_translatable
				
	/**
	 * Constructor creates 'empty' grid; sets internal data structures (columns,rows, DOM element arrays & listeners) & then calls WFR
	 *
	 * @param id
	 * @param configObject - map with keys of (at least) [viewDef, groupIndex] and possibly [cssClassName, showOnLoad, 
	 *											selectionEnabled, multipleSelectionEnabled, useParentRestriction, refreshWorkflowRuleId, sortAscending]
	 */
	constructor: function(id, configObject) {
		// call Ab.grid.MiniConsole constructor
		configObject.recordLimit = 0;
		this.inherit(id, configObject); 
		this.imageCategoryCollapse = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-opened.png';
		this. imageCategoryExpand = Ab.view.View.contextPath + '/schema/ab-core/graphics/icons/tri-closed.png';
		this.categoryDataSourceId = configObject.getConfigParameterIfExists('categoryDataSource');
	},

	getCategoryDataSourceId: function() {
		return this.categoryDataSourceId;
	},
	
	setCategoryDataSourceId: function(categoryDataSourceId) {
		this.categoryDataSourceId = categoryDataSourceId;	
	},

	getCategoryField: function() {
		return this.categoryField;
	},
	
	setCategoryField: function(categoryField) {
		this.categoryField = categoryField;	
	},
	
	getCategoryOrder: function() {
		return this.categoryOrder;
	},
	
	setCategoryOrder: function(categoryOrder) {
		this.categoryOrder = categoryOrder;	
	},	
	
	getCategoryColors: function(){
		return this.categoryColors;
	},
	
	setCategoryColors: function(categoryColors){
		this.categoryColors = categoryColors;
	},

	getCategoryRecords: function() {
		return this.categoryRecords;
	},

	setCategoryRecords: function(categoryRecords) {
		return this.categoryRecords;
	},
	
	getCategoryField: function() {
		return this.categoryField;	
	},
			
	setCategoryField: function(categoryField) {
		this.categoryField = categoryField;	
	},
			
	getCategoryDataSource: function() {
		return this.categoryDataSource;
	},
	
	setCategoryDataSource: function(categoryDataSource) {
		this.categoryDataSource = categoryDataSource;	
	},

	setCategoryDataSourceById: function(categoryDataSourceId) {
		this.categoryDataSource = View.dataSources.get(categoryDataSourceId)
	},

	setshowWithoutGroupings: function(showWithoutGroupings) {
		this.showWithoutGroupings = showWithoutGroupings;	
	},
			
	getshowWithoutGroupings: function() {
		return this.showWithoutGroupings;
	},
			
	setCategoryConfiguration: function(configObj){
		// showWithoutGroupings
		if(valueExists(configObj['showWithoutGroupings'])){  
			this.setshowWithoutGroupings(configObj['showWithoutGroupings']);
		}
				
		if(this.showWithoutGroupings){
			return;
		}

		// specify the category field
		if(valueExists(configObj['fieldName'])){		
			this.setCategoryField(configObj['fieldName']);
		} else {
			var message = View.getLocalizedString(this.z_NO_FIELD_ERROR_MESSAGE);
			View.showMessage('error', message);
			return;
		}
		
		// specify the order in which the categories should appear.
		if(valueExists(configObj['order'])){  
			this.setCategoryOrder(configObj['order']);
		}
		
		if(valueExists(configObj['categoryDataSourceId'])){
			this.setCategoryDataSourceId(configObj['categoryDataSourceId']);
		}

		if(valueExists(configObj['setCategoryDataSouceById']) && (configObj['setCategoryDataSouceById'] == true)){
			this.setCategoryDataSourceById(configObj['categoryDataSourceId']);
		}
		
		if(valueExists(configObj['categoryDataSource'])){
			this.setCategoryDataSource(configObj['categoryDataSource']);
		}
				
		// apply custom style for category
		if(valueExists(configObj['getStyleForCategory'])){
			this.getStyleForCategory = configObj['getStyleForCategory'];
		}
							
		// apply order and style
		this.setOrderAndStyle(); 		
	},
	
		
	setOrderAndStyle: function() {
		var categoryDS = View.dataSources.get(this.getCategoryDataSourceId());
		var reorderedRecords = [];
		var records = categoryDS.getRecords();
		
		// if no order is specified, use default
		if(this.categoryOrder.length == 0 ){
			for(var h=0; h<records.length; h++){
				this.categoryOrder.push(records[h].getValue(this.categoryField));
			}
		}
		
		var fieldDef = this.getFieldDef(this.categoryField);
		if(fieldDef){
			// get the display value for enums, if such exists
			var isEnum = fieldDef.isEnum;
			var enumValues = (isEnum) ? fieldDef.enumValues : {};
			
			for(i=0; i<this.categoryOrder.length; i++){
				for(var j=0; j<records.length; j++){
					var record = records[j];
					var category = record.getValue(this.categoryField);
					if(category == this.categoryOrder[i]){
						record.style = this.getStyleForCategory(record);
						record.categoryTitle = (isEnum)? enumValues[category]: category;
						reorderedRecords.push(record);
					}  
				}  		    		
			}
		} else {
			var message = View.getLocalizedString(this.z_CATEGORY_FIELD_NOT_FOUND_ERROR_MESSAGE);
			View.showMessage('error', message);
			return;
		}
		this.categoryRecords = reorderedRecords;
		
		return this.categoryRecords;
	},
	
	// can be used to specify custom style for categories
	getStyleForCategory: function(record){
		record.style = {};
		return record;
	},    				
  
  	
	findStopIndex: function(currentIndex){
		var categoryDetailEls = this.tableBodyElement.getElementsByTagName('th');
		var stopIndex = 0;

		// find the index of the next category
		for(var k=0; k<categoryDetailEls.length; k++){
			if(categoryDetailEls[k].parentElement.rowIndex ==  currentIndex){
				stopIndex = (k==categoryDetailEls.length-1) ?  this.tableBodyElement.rows.length+ categoryDetailEls[0].parentElement.rowIndex: categoryDetailEls[k+1].parentElement.rowIndex;
			}
		}
		return stopIndex;
	},


	/**
	 * override
	 */
	beforeBuild: function() {
		this.inherit();
		this.enableIndex(this.indexEnabled, this.indexColumnID, this.indexEntries);
		this.filterEnabled = this.config.getConfigParameterIfExists('showIndexAndFilterOnLoad');;
	},

	/**
	 * override
	 * If this.showWithoutGroupings = false (default) display with catgories.  Otherwise, display without categories (similar to report grid)
	 */		
	createDataRows: function(parentElement, columns) {
		if(this.showWithoutGroupings){
			this.inherit(parentElement, columns);
		}else{
			var tableEl = Ext.get(this.parentElement.id);
			tableEl.addClass('categoryGrid');
			this.createCategoryAndDetailRows(parentElement, columns);
		}
	},

	createCategoryAndDetailRows: function(parentElement, columns) {
		this.gridRows = new Ext.util.MixedCollection();
		var noneMsg = View.getLocalizedString(this.z_NONE);
		
		for (var x = 0; x < this.categoryRecords.length; x++) {

            // create category row
 			var category = document.createElement('th');
			category.colSpan = this.columns.length;

            // create category title element
            var categoryTitleElement = document.createElement('a');
            var categoryTitle = this.categoryRecords[x].categoryTitle;
            if(!valueExistsNotEmpty(categoryTitle)){
            	categoryTitle = noneMsg;
            }
            categoryTitleElement.appendChild(document.createTextNode(categoryTitle));
            categoryTitleElement.style.background = 'url(' + this.imageCategoryCollapse + ') no-repeat 0 50%';
			category.appendChild(categoryTitleElement);
			            
            // add custom style properties to the category title element
            var style = this.categoryRecords[x].style;
            for (var s in style) {
                categoryTitleElement.style[s] = style[s];
            }

            var tr = document.createElement('tr');
            tr.className = 'categoryRow';
            tr.appendChild(category);           
            this.tableBodyElement.appendChild(tr);

            var grid = this;
            Ext.get(category).addListener('click', function() {
                var categoryTitleElement = this.first().dom;

                var stopIndex = grid.findStopIndex(categoryTitleElement.parentElement.parentElement.rowIndex);
                var categoryDetailEls = grid.tableBodyElement.getElementsByTagName('th');
                
                // account for header rows, showIndexAndFilterOnLoad
                var offset = categoryDetailEls[0].parentElement.rowIndex;

                // toggleExpand
                var backgroundImage = '';
                var display = '';
                if (categoryTitleElement.style.background.match(/closed/gi)) {
                    backgroundImage = grid.imageCategoryCollapse;
                } else {
                    backgroundImage = grid.imageCategoryExpand;
                    display = 'none';
                }

                categoryTitleElement.style.background = 'url(' + backgroundImage + ') no-repeat 0 50%';;
                for (var m = categoryTitleElement.parentElement.parentElement.rowIndex - offset +1; m < stopIndex - offset; m++) {
                    grid.tableBodyElement.rows[m].style.display = display;
                }
                
                grid.clearPreviousColumnRowWidths();            
                grid.updateHeight();
            });

            // create data rows
            this.createDetailRows(this.tableBodyElement, columns, this.categoryRecords[x].categoryTitle, category);
        }
	},
			
	createDetailRows: function(parentElement, columns, category, categoryElement) {
        
		var rows = this.rows;
		var listener = this.getEventListener('onClickItem');
		var multiline = this.hasMultiline(columns);
		var count = 0;

		// create row & cell elements
		for (var r = 0, record; record = rows[r]; r++) {
			var recordCategory = record[this.categoryField];
			if(recordCategory == category){
				var rowElement = document.createElement('tr'); 
				rowElement.name = category + '_details'; 
				
				rowElement.className = (this.tableBodyElement.rows.length % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
				rowElement.onmouseover = function(){
					this.className = this.className + ' selected';
				}
				rowElement.onmouseout = function(){
					this.className = this.className.replace(' selected', '');
				}
				rowElement.className += (multiline) ? ' multiline' : ' singleline';
				
				var row = new Ab.grid.Row(this, record, rowElement);
				this.gridRows.add(row);
				
				record.index = r;	
				record.row = row;
				
				for (var c = 0, column; column = columns[c]; c++) {
					if (column.hidden === true) continue;
					var cellElement = document.createElement('td');
					
					// TODO: ab-sp-hl-su-by-ls.axvw
					if(listener && this.columnTypeIsSortable(column.type) && column.type != 'image' && column.enabled == "true"){
						column.type = 'link';
						if (column.javaType === 'java.lang.Double' || column.javaType === 'java.lang.Integer') {
							column.type = 'number_link';
						}
					}
					
					cellElement.className = column.type;
					
					if (column.width != null) {
						cellElement.width = column.width;
					}
					
					if (column.onCreateCell != null) {
						column.onCreateCell(record, column, cellElement);
					} else {
						this.createCellContent(record, column, cellElement);
					}                                 
					
					rowElement.appendChild(cellElement); 
					
					var cell = new Ab.grid.Cell(row, column, cellElement);
					row.cells.add(column.id, cell);               			
				}
				parentElement.appendChild(rowElement);
				count += 1;
			}
		}
		
		if(count == 0){
			parentElement.deleteRow(parentElement.rows.length-1);
		} else {
			var countElement = document.createElement('a');
			countElement.innerHTML = "(" + count + ")";
			countElement.className = 'count';
			categoryElement.appendChild(countElement);
		}	
		
		// add row level actions
		this.addRowLevelActions(listener, columns);
		        
		this.afterCreateDataRows(parentElement, columns);
	},

	/**
	 * override ab-reportgrid.js
	 */
	getFirstRowIndex: function(){
		this.columnWidthRowIndex = this.getFirstUncollapsedRowIndex();
		return this.columnWidthRowIndex;
	},

	/**
	 * find the first uncollapsed row to base resizing calculations
	 */				
	getFirstUncollapsedRowIndex: function(){
		// TODO: optimize
		var dataRows = Ext.query('.dataRow', this.parentElement);
		for(var i=0; i<dataRows.length; i++){
			var dataRowIndex = dataRows[i].rowIndex;
			if(dataRowIndex < this.tableBodyElement.rows.length){
				if(this.tableBodyElement.rows[dataRowIndex].style.display == ''){
					return dataRowIndex
				}
			}
		}
		return -1;
	},

	/**
	 * clear previous column widths that were set
	 */
	clearPreviousColumnRowWidths: function(){
		if(this.columnWidthRowIndex != -1){
			var columns = this.tableBodyElement.rows[this.columnWidthRowIndex].cells;
			for(var i=0; i<columns.length; i++){
				columns[i].style.width = 'auto';
			}	
		}	
	},
			
	/**
	* Sets all rows containing a checkbox as first column to checked==true
	* Returns all record values for selected rows.
	* 
	* @param {selected} Boolean switch to control turning selection on or off. Default is ON
	* @return      JSON array with record values. 	
	*/
	setAllRowsSelected: function(selected) {
		// get switch value, default == true
		var setSelectedTrue = ((typeof selected == 'undefined') || selected == true) ? true : false;
		var selectedRows = new Array();
		
		var dataRows = this.getDataRows();
		for (var r = 0; r < dataRows.length; r++) {
			var dataRow = dataRows[r];
			var selectionCheckbox = dataRow.firstChild.firstChild;
			if (typeof selectionCheckbox.checked != 'undefined') {
				if (selectionCheckbox.checked != setSelectedTrue) {
					selectionCheckbox.checked = setSelectedTrue;
					this.onChangeMultipleSelection(this.gridRows.get(r).record);
				}
				selectedRows.push(this.gridRows.get(r).record);			
			}
		}
		return selectedRows;
	},
	
	/////////////////////panel reports///////////////////
	callDOCXReportJob: function(title, restriction, parameters){
		this.setCategoryProperties(parameters);
		if(!valueExistsNotEmpty(title)){
			title = "";
		}
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	callXLSReportJob: function(title, restriction, parameters){
		this.setCategoryProperties(parameters);
		if(!valueExistsNotEmpty(title)){
			title = "";
		}
		var viewName = this.viewDef.viewName + '.axvw'; 
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	
	setCategoryProperties: function(parameters){
		parameters.categoryDataSourceId = this.getCategoryDataSourceId();
		parameters.categoryFields = [this.getCategoryFieldDef(this.categoryField)];
		//XXX: 
		for(var i=0;i<this.getVisibleFieldDefs().length; i++){
			parameters.categoryFields.push({});
		}
		parameters.categoryOrder = this.categoryOrder;
		parameters.categoryColors = this.categoryColors;
	},
	getCategoryFieldDefs: function(){
		var ctx = this.createEvaluationContext();
		
		var categoryFields = [];
		var categoryDS = View.dataSources.get(this.getCategoryDataSourceId());
		categoryDS.fieldDefs.each(function (fieldDef) {
			fieldDef.title = Ab.view.View.evaluateString(fieldDef.title, ctx, false);
			fieldDef.hidden = Ab.view.View.evaluateString(fieldDef.hidden, ctx, false);
			categoryFields.push(fieldDef);
    	});
		return categoryFields;
	},
	getCategoryFieldDef: function(fieldId){
		var categoryFields = this.getCategoryFieldDefs();
		for (var i = 0, field; field = categoryFields[i]; i++) {
			if(field.id === fieldId){
				return field;
			}	
		}
		return {};
	}
});
