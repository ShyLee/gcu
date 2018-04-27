Ext.define('AppLauncher.view.Registration', {
    extend: 'Common.form.FormPanel',

    xtype: 'registrationPanel',

    config: {
        padding: Ext.os.is.Phone ? '2px' : '10px',

        scrollable : {
            direction : 'vertical',
            directionLock : true
        },

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: 'Sign in as Guest',
                        align: 'right',
                        ui: 'action',
                        action: 'guestSignOn',
                        itemId: 'guestSignOnButton',
                        hidden: true
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'bottom'
            },
            {
                xtype: 'fieldset',
                padding: '10px',
                docked: 'top',
                defaults: {
                    labelAlign: Ext.os.is.Phone ? 'top' : 'left'
                },
                items: [
                    {
                        xtype: 'textfield',
                        label: LocaleManager.getLocalizedString('Username'),
                        name: 'username',
                        required: true,
                        placeHolder: LocaleManager.getLocalizedString('ARCHIBUS user name (upper case)')
                    },
                    {
                        xtype: 'passwordfield',
                        label: LocaleManager.getLocalizedString('Password'),
                        required: true,
                        name: 'password',
                        placeHolder: LocaleManager.getLocalizedString('ARCHIBUS password (case-sensitive)')
                    },
                    {
                        xtype: 'container',
                        padding: Ext.os.is.Phone ? '30px 0px 10px 0px' : '30px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: {
                            xtype: 'button',
                            itemId: 'registerButton',
                            text: 'Register Device',
                            width: '280px',
                            height: '50px',
                            ui: 'action'
                        }
                    }
                ]
            }
        ]
    },

    initialize: function (config) {
        var me = this,
            passwordField = me.down('passwordfield'),
            userNameField = me.down('textfield[name=username]'),
            registerButton = me.down('#registerButton'),
            guestSignOnButton = me.down('#guestSignOnButton'),
            isNativeMode = Environment.getNativeMode();

        me.callParent([ config ]);

        guestSignOnButton.setHidden(isNativeMode);

        registerButton.on('tap', function () {
            var me = this;

            passwordField.blur();
            // Use a delay to allow Android devices to process the change to the
            // password field
            setTimeout(function () {
                me.fireEvent('register', me);
            }, 50);
        });

        // Force user name to be upper case.
        userNameField.on('keyup', function (textField) {
            textField.setValue(textField.getValue().toUpperCase());
        });
        me.setFormPlaceHolderText(userNameField, passwordField);
        me.setTitle();
    },

    setTitle: function() {
        var title,
            titleBar = this.down('titlebar');

        if (Ext.os.is.Phone) {
            title = LocaleManager.getLocalizedString('Registration', 'AppLauncher.view.Registration');
        } else {
            title = LocaleManager.getLocalizedString('ARCHIBUS Mobile Apps Registration', 'AppLauncher.view.Registration');
        }

        titleBar.setTitle(title);
    },

    setFormPlaceHolderText: function (userNameField, passwordField) {
        var userNameText = LocaleManager.getLocalizedString('ARCHIBUS user name (upper case)'),
            passwordText = LocaleManager.getLocalizedString('ARCHIBUS password (case-sensitive)');

        if (Ext.os.is.Phone) {
            userNameText = LocaleManager.getLocalizedString('User name (upper case)'),
            passwordText = LocaleManager.getLocalizedString('Password (case-sensitive)');
        }

        userNameField.setPlaceHolder(userNameText);
        passwordField.setPlaceHolder(passwordText);
    }
});