

var buildingAbstractController = View.createController('buildingAbstractController', {

    
    afterInitialDataFetch: function(){
        if (this.view.parameters) {
            var blId = this.view.parameters['openBlId'];
            var blName = "";
            //在tab之间共享变量
            this.abScBlInfoTabs.blId = blId;
            this.abScBlInfoTabs.blName = blName;
            this.abScBlInfoTabs.openController = this;
            
            var nextTabName = 'fcAssetInfo';
            var nextTab = this.abScBlInfoTabs.findTab(nextTabName);
            nextTab.loadView();
//            this.abScBlInfoTabs.selectTab(nextTabName);
            
            nextTabName = 'buldingBasicInfo';
            nextTab = this.abScBlInfoTabs.findTab(nextTabName);
            nextTab.loadView();
            this.abScBlInfoTabs.selectTab(nextTabName);
            
            this.abScBlInfoTabs.enableTab('buldingBasicInfo',true);
            this.abScBlInfoTabs.enableTab('fcAssetInfo',true);
        }
    }
       
});

