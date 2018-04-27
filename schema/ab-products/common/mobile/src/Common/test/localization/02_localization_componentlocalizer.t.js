StartTest(function (t) {

    t.requireOk('Common.lang.LocaleManager','Common.lang.ComponentLocalizer','Ext.picker.Date', function () {

        Common.lang.ComponentLocalizer.setComponentLocalization('fr');

        t.is(Ext.Date.dayNames[0],'dimanche', 'Day name matches');
        t.is(Ext.Date.monthNames[6],'Juillet', 'Month name matches');

        t.done();
    });


});