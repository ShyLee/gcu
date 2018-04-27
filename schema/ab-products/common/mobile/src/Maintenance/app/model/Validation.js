/**
 * The Maintenance.model.Validation class registers the custom validation function used in the Work Request application.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Maintenance.model.Validation', {

	requires : [ 'Ext.data.Validations' ],

	singleton : true,

	constructor : function(config) {
		this.initialize();
	},

	initialize : function() {

		Ext.apply(Ext.data.Validations, {
			craftspersonHours : function(config, fieldValues) {
				var i, hourSum = 0;

				for (i = 0; i < fieldValues.length; i++) {
					hourSum += fieldValues[i];
				}

				if (hourSum > 0) {
					return true;
				} else {
					return false;
				}
			}

		});

		Ext.apply(Ext.data.Validations, {
			craftspersonDates : function(config, fieldValues) {
				// This calculation is dependent on the fieldValues being in the
				// correct order. This should be changed to something more robust.

				// DateStart - 0
				// TimeStart - 1
				// DateEnd - 2
				// TimeEnd - 3

				// Date Start and Time Start are empty
				if (fieldValues[0] === null && fieldValues[3] === null) {
					return true;
				}

				// Date Start is populated and Date End is empty
				if (fieldValues[0] !== null && fieldValues[2] === null) {
					return true;
				}

				var dateStart = Maintenance.model.Validation.combineDates(fieldValues[0], fieldValues[1]);
				var dateEnd = Maintenance.model.Validation.combineDates(fieldValues[2], fieldValues[3]);

				if (dateStart <= dateEnd) {
					return true;
				} else {
					return false;
				}
			}

		});
	},

	combineDates : function(date, time) {
		if (date === null) {
			return null;
		}

		if (date !== null && time === null) {
			return date;
		}

		if (date !== null && time !== null) {
			return new Date(date.getYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
		}
	}

});