Ext.define('Maintenance.model.WorkRequestCraftsperson', {
	extend : 'Common.model.ModelBase',

	requires : [ 'Maintenance.model.Validation' ],

	config : {
		disableValidation : false,

		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'cf_id',
			type : 'string'
		}, {
			name : 'wr_id',
			type : 'IntegerClass'
		}, {
			name : 'date_assigned',
			type : 'DateClass',
			defaultValue : new Date()
		}, {
			name : 'time_assigned',
			type : 'TimeClass',
			defaultValue : new Date()
		}, {
			name : 'date_start',
			type : 'DateClass'
		}, {
			name : 'time_start',
			type : 'TimeClass'
		}, {
			name : 'date_end',
			type : 'DateClass'
		}, {
			name : 'time_end',
			type : 'TimeClass'
		}, {
			name : 'hours_straight',
			type : 'float',
			defaultValue : 0.00
		}, {
			name : 'hours_over',
			type : 'float',
			defaultValue : 0.00
		}, {
			name : 'hours_double',
			type : 'float',
			defaultValue : 0.00
		}, {
			name : 'work_type',
			type : 'string'
		}, {
			name : 'comments',
			type : 'string'
		}, {
			name : 'mob_is_changed',
			type : 'IntegerClass',
			defaultValue : 0
		}, {
			name : 'mob_locked_by',
			type : 'string'
		}, {
			name : 'mob_wr_id',
			type : 'IntegerClass'
		} ],

		validations : [ {
			field : 'cf_id',
			type : 'presence'
		} ],

		customValidations : [ {
			fields : [ 'hours_straight', 'hours_over', 'hours_double' ],
			type : 'craftspersonHours',
			message : ' - Actual, Overtime or Doubletime hours are required'
		}, {
			fields : [ 'date_start', 'time_start', 'date_end', 'time_end' ],
			type : 'craftspersonDates',
			message : ' Start Date and Time must be before End Date and Time'
		} ]

	},

	/**
	 * Override to allow us to disable the validation when we are assigning wrcf records to a new Work Request
	 * 
	 * @return {*}
	 */
	isValid : function() {
		var disableValidation = this.getDisableValidation();
		if (disableValidation) {
			return true;
		} else {
			return this.validate().isValid();
		}

	}
});