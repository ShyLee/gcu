StartTest(function(t) {

    t.requireOk('Common.view.navigation.NavigationBar', function() {

       var navigationBar = Ext.create('Common.view.navigation.NavigationBar', {isDetailView: false});

    });
});