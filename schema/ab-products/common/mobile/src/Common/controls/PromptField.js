/**
 * Provides the field used to display a prompt input. This field extends the Ext.field.Text field and adds a disclosure
 * arrow to the field. Uses the Common.controls.PromptInput class.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.controls.PromptField', {

	extend : 'Ext.field.Text',

	requires : 'Common.controls.PromptInput',

	xtype : 'promptfield',

	config : {
		/**
		 * @cfg {Boolean} clearIcon - The clear icon is not used in the PromptField. Always set it to false
		 */
		clearIcon : true,
		/**
		 * @cfg {Boolean} promptReadOnly - Sets the read only mode for the prompt control. This setting determines if the
		 *      disclose graphic is displayed and if the prompt is displayed when tapped. This configuration is required
		 *      because the read only state of the prompt control is different than the read only state of the prompt
		 *      input component
		 */
		promptReadOnly : false,

		/**
		 * @cfg {Object} The component of the field. The Ext.field.Input class is replaced with the extended
		 *      Common.controls.PromptInput class.
		 */
		component : {
			xtype : 'promptinput',
			type : 'text'
		},

		/**
		 * @cfg {String} panelName The xtype of the panel that the prompt field is used on. This value is used by the
		 *      Common.controller.PromptController class to determine the panel to set the selected values on.
		 */
		panelName : null,

        cancelTapEvent: false,

        promptIsCleared: false

	/**
	 * @event promptTapped Fired when the input field is single tapped
	 */

	/**
	 * @event change Fired when the value of the PromptField is changed.
	 */
	},

    // @private
    initialize: function() {
        var me = this;

        me.callParent();

        me.getComponent().on({
            scope: this,

            keyup       : 'onKeyUp',
            change      : 'onChange',
            focus       : 'onFocus',
            //blur        : 'onBlur',
            paste       : 'onPaste',
            mousedown   : 'onMouseDown',
            clearicontap: 'onClearIconTap'
        });

        this.element.addCls('x-prompt-clearicon');


        // set the originalValue of the textfield, if one exists
        me.originalValue = me.originalValue || "";
        me.getComponent().originalValue = me.originalValue;

        me.syncEmptyCls();

        // Added code
        me.on('singletap', me.onPromptFieldTapped, me, {
            element : 'element'
        });

        // Always set the input field to read only
        me.getComponent().setReadOnly(me);
    },

	applyReadOnly : function(config) {
		if (config) {
			this.element.addCls('x-prompt-readonly');
            this.element.removeCls('x-field-clearable');
		} else {
			this.element.removeCls('x-prompt-readonly');
            this.element.addCls('x-field-clearable');
		}

		this.setPromptReadOnly(config);

		// Always set the input field to read only
		this.getComponent().setReadOnly(true);
	},

	onPromptFieldTapped : function() {
		// Don't fire this event if the control is in read only mode
		var isReadOnly = this.getPromptReadOnly(),
            promptIsCleared = this.getPromptIsCleared();

        if (promptIsCleared) {
            this.setPromptIsCleared(false);
            return;
        }

        if (isReadOnly) {
            return;
        }
		this.fireEvent('promptTapped', this);
	},

    onClearIconTap: function(e) {
        this.setPromptIsCleared(true);
        this.fireAction('clearicontap', [this, e], 'doClearIconTap');
    },

    // @private
    doClearIconTap: function(me, e) {
        me.setValue('');

        //sync with the input
        me.getValue();
    },

    // @private
    showClearIcon: function() {
        var me = this,
            value = me.getValue(),
            // allows value to be zero but not undefined, null or an empty string (other falsey values)
            valueValid = value !== undefined && value !== null && value !== '';

        /**
         * Override. Do not display the clear icon if the prompt is readonly
         */
        if (me.getPromptReadOnly()) {
            return;
        }

        if (me.getClearIcon() && !me.getDisabled() && !me.getReadOnly() && valueValid) {
            me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        }

        return me;
    }
});