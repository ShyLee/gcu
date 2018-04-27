View.createController("tabsController", {

    afterInitialDataFetch: function(){
       var tabs = View.panels.get("createRequestTabs");
       tabs.findTab("selectTab").show(true);
       tabs.findTab("requestTab").show(false);
       tabs.findTab("disposeTab").show(true);
    }
});
