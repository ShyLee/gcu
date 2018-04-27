View.createController("tabsController", {

    afterInitialDataFetch: function(){
       var tabs = View.panels.get("returnTabs");
       tabs.findTab("eqRequestTab").show(true);
       tabs.findTab("eqAttachRequestTab").show(true);
       tabs.findTab("eqRequestInfoTab").show(false);
       tabs.findTab("eqAttachInfoTab").show(false);
    }
});
