/**
 * Manages the localization resource files and retrieves localized strings from the resource files.
 * <p>
 * Language resource files are located in the ../Common/resources/language directory. Additional languages can be added
 * to the application by creating a language file and adding the file to the build configuration.
 * <p>
 * Localized values can be modified by editing one of the existing language fiels.
 * <p>
 * The following steps are required to add a new language to the application
 * <p>
 * 1. Create the language file using the existing object format. Refer to the lang_en.js for an example of the current
 * format. Multiple languages can be contained in a single file.
 * <p>
 * 2. Add the language file to the app.json js file section. The language file should be added after the sencha-touch.js
 * file.
 * <p>
 * 3. Build and deploy the application. The language resources will now be avaialable in the app.
 *
 * @author Jeff Martin
 * @author Valery Tydykov
 * @since 21.1
 */

Ext.define('Common.lang.LocaleManager', {
    alternateClassName: [ 'LocaleManager' ],
    requires: [ 'Common.lang.ComponentLocalizer' ],
    singleton: true,

    defaultDateFormat: 'm/d/Y',

    /**
     * Returns current application locale name.
     * <p>
     * Uses Java locale name, for example 'en-US'.
     * <p>
     * Uses browser locale.
     *
     * @public
     * @return {String} locale name.
     */
    getLocaleName: function () {
        return navigator.language || 'en-US';
    },

    /**
     * Returns localized string value for the given key.
     * <p>
     * If the locale is not available or the localized string cannot be found, the key value is returned.
     *
     * @public
     * @param key
     *            {String} key of the localized string.
     * @return {String} localized value or the key value if the localized string was not found.
     */
    getLocalizedString: function (key) {
        var locale = this.getLocale(),
            translatedString;

        // TODO: Implement translation lookup here

        return key;
    },

    /**
     * Returns the date format string of the current locale.
     *
     * @return {String} Date format string
     */
    getLocalizedDateFormat: function () {
        var locale = this.getLocale();

        return this.defaultDateFormat;

        /*
        if (Ext.isDefined(Mobile.language[locale])) {
            return Mobile.language[locale].defaultDateFormat || this.defaultDateFormat;
        } else {
            return this.defaultDateFormat;
        }
        */
    },

    /**
     * Returns the first two characters of the Locale Name or the default locale 'en' if the locale name is less than 2
     * characters.
     *
     * @return {String}
     */
    getLocale: function () {
        var locale = this.getLocaleName();
        if (locale.length > 1) {
            return locale.substring(0, 2).toLowerCase();
        } else {
            return 'en';
        }
    },

    constructor: function (config) {
        this.initialize();
    },

    /**
     * Sets the localized values for the application components.
     *
     * @private
     */
    initialize: function () {
        Common.lang.ComponentLocalizer.setComponentLocalization(this.getLocale());
    }

});