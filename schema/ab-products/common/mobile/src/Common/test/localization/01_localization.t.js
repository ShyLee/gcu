StartTest(function (t) {

    t.requireOk('Common.lang.LocaleManager', function () {
        var text = LocaleManager.getLocalizedString('Email');
        t.is(text, 'Email', 'Value matches');

        // Test for an unknown key value
        text = LocaleManager.getLocalizedString('No Key');
        t.is(text, 'No Key', 'No translation, returns the supplied key value');

        var oldGetLocaleFunction = LocaleManager.getLocale;

        LocaleManager.getLocale = function () { return 'fr'; };

        text = LocaleManager.getLocalizedString('OK');
        t.is(text, 'Bien', 'Translation value matches');

        // Set the locale to an unknown locale
        LocaleManager.getLocale = function () { return 'es'; };

        text = LocaleManager.getLocalizedString('OK');
        t.is(text, 'OK', 'Translation value matches');

        LocaleManager.getLocale = oldGetLocaleFunction;


        t.done();
    });


});