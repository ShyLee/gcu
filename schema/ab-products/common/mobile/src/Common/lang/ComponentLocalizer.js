/**
 * Registers the localization text settings for the application components
 * <p>
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.lang.ComponentLocalizer', {

    requires: [ 'Common.util.Format' ],

    singleton: true,

    /**
     * Applies the locale text to the application controls
     *
     * @param locale
     *            The locale string to use to retrieve the localized text strings.
     */
    setComponentLocalization: function (locale) {
        var localeObject;

        // TODO: Implement component localization here
        return;

        if (!Ext.isDefined(Mobile)) {
            return;
        }
        if (Ext.isDefined(Mobile.language[locale])) {
            localeObject = Mobile.language[locale];
        } else {
            localeObject = Mobile.language.en;
        }

        this.setDateLocalizationOverrides(localeObject);
        this.setControlLocalizationOverrides(localeObject);
        this.setLocalizedNumberFormat(localeObject);

    },

    /**
     * Sets the localized Date properties
     *
     * @private
     * @param localeObject
     */
    setDateLocalizationOverrides: function (localeObject) {

        if (Ext.isDefined(localeObject.dayNames)) {
            // Ext.Date.dayNames = localeObject.dayNames;
            Ext.DateExtras.dayNames = localeObject.dayNames;
        }
        if (Ext.isDefined(localeObject.monthNames)) {
            // Ext.Date.monthNames = localeObject.monthNames;
            Ext.DateExtras.monthNames = localeObject.monthNames;
        }
        if (Ext.isDefined(localeObject.monthNumbers)) {
            // Ext.Date.monthNumbers = localeObject.monthNumbers;
            Ext.DateExtras.monthNumbers = localeObject.monthNumbers;
        }

        if (Ext.util.Format && Ext.isDefined(localeObject.defaultDateFormat)) {
            Ext.util.Format.defaultDateFormat = localeObject.defaultDateFormat;
        }
    },

    /**
     * Sets the localized text for application controls.
     *
     * @private
     * @param localeObject
     */
    setControlLocalizationOverrides: function (localeObject) {

        if (Ext.MessageBox) {
            if (Ext.isDefined(localeObject.msgBoxOK)) {
                Ext.MessageBox.OK.text = localeObject.msgBoxOK;
            }
            if (Ext.isDefined(localeObject.msgBoxCancel)) {
                Ext.MessageBox.CANCEL.text = localeObject.msgBoxCancel;
            }
            if (Ext.isDefined(localeObject.msgBoxYes)) {
                Ext.MessageBox.YES.text = localeObject.msgBoxYes;
            }
            if (Ext.isDefined(localeObject.msgBoxNo)) {
                Ext.MessageBox.NO.text = localeObject.msgBoxNo;
            }
        }
    },

    /**
     * Applies the localized number decimal and grouping seperator to the number format class.
     *
     * @private
     * @param localeObject
     */
    setLocalizedNumberFormat: function (localeObject) {
        var decimalSeparator, groupingSeparator;

        if (Ext.isDefined(localeObject.decimalSeparator)) {
            decimalSeparator = localeObject.decimalSeparator;
        }

        if (Ext.isDefined(localeObject.groupingSeparator)) {
            groupingSeparator = localeObject.groupingSeparator;
        }

        Common.util.Format.setNumberFormatSeparators(decimalSeparator, groupingSeparator);
    }

});
