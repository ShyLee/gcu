View.createController("tabsController", {

    afterInitialDataFetch: function(){
       var tabs = View.panels.get("createRequestTabs");
       tabs.findTab("basicInputTab").show(true);
       tabs.findTab("requestDetailsTab").show(false);
    }
});