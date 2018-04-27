/**
 * This is a field that displays a Common.controls.TimePicker when tapped. The TimePickerField displays hours and
 * minutes like a normal text field in a form.
 * <p>
 * The TimePickerField extends the {@link Ext.field.DatePicker} control and is used in the same way. The difference is
 * that the TimePickerField only allows display of the time part of the date.
 * 
 * @example Ext.create('Ext.form.Panel', { fullscreen: true, items: [ { xtype: 'fieldset', items: [ { xtype:
 *          'timepickerfield', label: 'Time Started', name: 'time_start', value: new Date() } ] } ] });
 * 
 */

Ext.define('Common.controls.TimePickerField',
		{
			extend : 'Ext.field.DatePicker',

			xtype : 'timepickerfield',

			requires : [ 'Common.controls.TimePicker' ],

			config : {
				dateFormat : 'H:i', // Default format show time only
				picker : true
			},

			/**
			 * @override
			 * @param value
			 *            Source copied, small modification
			 */
			applyValue : function(value) {
				if (!Ext.isDate(value) && !Ext.isObject(value)) {
					value = null;
				}

				// Begin modified section
				if (Ext.isObject(value)) {

					var date = new Date(), year = value.year || date.getFullYear(), month = value.month
							|| date.getMonth(), day = value.day || date.getDate();

					value = new Date(year, month, day, value.hours, value.minutes); // Added hour and minutes
				}
				// End modfied section!
				return value;
			},

			applyPicker : function(picker) {
				picker = Ext.factory(picker, 'Common.controls.TimePicker');
				picker.setHidden(true); // Do not show picker on creation
				Ext.Viewport.add(picker);
				return picker;
			},

			updatePicker : function(picker) {
				picker.on({
					scope : this,
					change : 'onPickerChange',
					hide : 'onPickerHide'
				});
				picker.setValue(this.getValue());
				return picker;
			}
		});
