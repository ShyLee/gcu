View.createController("tabsController", {

    afterInitialDataFetch: function(){
       var tabs = View.panels.get("adjustApproveTabs");
       tabs.findTab("selectTab").show(true);
       tabs.findTab("requestTab").show(false);
       tabs.findTab("selectAttachTab").show(true);
       tabs.findTab("requestAttachTab").show(false);
    }
});
