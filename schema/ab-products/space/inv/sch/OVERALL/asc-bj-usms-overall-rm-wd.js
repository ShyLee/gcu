/**
 * @author Keven.xi
 */
var ascBjUsmsOverallRm = View.createController('ascBjUsmsOverallRmController', {
	
	tabSelected:"",
	siteCount:0,
	campusTabs:null,
	
	afterViewLoad: function(){
		this.campusTabs = View.getControl('', 'campusTabs');
		var ds = View.dataSources.get("ds_asc-bj-usms-overall-rm_tab_site");
		var records = ds.getRecords("1=1");
		this.siteCount = records.length;
		if (this.siteCount > 1)
        {
			for(var i=0;i<this.siteCount;i++){
				var siteName = records[i].getValue("site.name");
				var siteId = records[i].getValue("site.site_id");
				createSubCampusTab(i,siteName,siteId);
			}
        }
	},
	afterInitialDataFetch: function() {
		this.inherit();
 	 	this.campusTabs.addEventListener('afterTabChange',this.campusTabs_afterTabChange.createDelegate(this));	
	},
		
	campusTabs_afterTabChange:function(tabPanel,selectedTabName,  newTabName){
		this.campusTabs.curSelectedTabName = selectedTabName;
		
		for  (var i=0; i < this.siteCount; i++){
			if(selectedTabName == 'subcampus_tab_'+i){
				var siteId = this.campusTabs.findTab(selectedTabName).siteId;
				this.campusTabs.currentSiteId = siteId;
	 		}
		}
		
	}

	
});

function createSubCampusTab(level, subCampusTitle,siteId){
    // create Tab object
    var tab = new Ab.tabs.Tab({
        name: "subcampus_tab_" + level,
        title: subCampusTitle,
        fileName: 'asc-bj-usms-overall-rm-main-wd.axvw',
        selected: false,
        enabled: true,
        hidden: false,
        useParentRestriction: false,
        isDynamic: false,
        useFrame: true,
        createTabPanel: createSubCampusTabPanel
    });
    
    tab.siteId = siteId;
    ascBjUsmsOverallRm.campusTabs.addTab(tab);
    tab.createTabPanel();
}

function createSubCampusTabPanel(){
    // create managed iframe
    this.frame = new Ext.ux.ManagedIFrame({
        autoCreate: {
            width: '100%',
            height: '100%'
        }
    });
    this.frame.setStyle('border', 'none');
    
    //this.loadView();
    
    // create Ext.Panel with the iframe as content
    var tabPanel = this.parentPanel.tabPanel.add({
        id: this.name,
        title: this.title,
        contentEl: this.frame,
        autoWidth: true,
        autoHeight: true,
        border: false,
        closable: false
    });
    this.tabPanel = tabPanel;
    this.id = this.name;
}
