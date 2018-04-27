// ab-smart-client-grid-data-transfer.js
//
// Controller for SmartClient's export / report / dataTransfer view
// Read the url parameter as the name of the dynamic dataSource view to load into the framed panel.
// Set up an afterLoad event listener to run after the dynamically loaded dataSource & grid has been loaded into the view.
// EventListener gets a handle to the grid containing the data, then creates an exportPanel command to transfer the data in the desired format.
//
// call with http://localhost:8080/archibus/schema/ab-core/views/smart-client/ab-smart-client-grid-data-transfer.axvw?dataSource=ab-grid-data-transfer-ds-ai.axvw
//
// to run outside of SmartClient comment out calls to window.external and replace with hard-coded values

var transferController = View.createController('transferController', { 

	afterInitialDataFetch: function() {
		this.dynamicDataSourcePanel.addEventListener('afterLoad', this.afterDataSourcesLoaded.createDelegate(this));
		
		for (var name in window.location.parameters) {
			if (name == "dataSource") {
				var dynamicDataSourceView = window.location.parameters[name];
				// alert('Dynamic dataSource name: ' + dynamicDataSourceView);
				this.dynamicDataSourcePanel.loadView(dynamicDataSourceView);
			}
        }
	},		
	
    /**
     * The view panel calls the afterLoad event listener after the content view has been loaded.
	 * Get the grid and create an exportPanel command on it.
     */
    afterDataSourcesLoaded: function() {
      	// The content view has a separate View object nested in the child frame. 
		// The grid with data is a control within that view.
        var contentFrame = this.dynamicDataSourcePanel.getContentFrame();
        var contentView = contentFrame.View;		
		var grid = contentView.getControl('', 'smartClientDataTransferDataSource_grid');
		var ctx = grid.createEvaluationContext();

		this.noticePanel.show(false, true);
		
		var dataTransferType = window.external.GetDataTransferType();
		var outputType;
		if (dataTransferType == 'DataTransfer') {
			outputType = 'txfr';
			this.dynamicDataSourcePanel.title = 'DATA';
		}
		else if (dataTransferType == 'Export') {
			outputType = 'xls';
			this.dynamicDataSourcePanel.title = 'XLS';
		}
		else if (dataTransferType == 'Report') {
			outputType = "docx";
			this.dynamicDataSourcePanel.title = 'DOC';
		}

		var commandConfig = {};
		commandConfig.type = 'exportPanel';
		commandConfig.outputType = outputType;
		commandConfig.target = 'dynamicDataSourcePanel';
		commandConfig.parentPanelId = 'dynamicDataSourcePanel';
		commandConfig.useDialog = "true";
		commandConfig.panelId = 'smartClientDataTransferDataSource_grid';
		var command = new Ab.command.exportPanel(commandConfig);
		
		command.handle(ctx);
	}
});

