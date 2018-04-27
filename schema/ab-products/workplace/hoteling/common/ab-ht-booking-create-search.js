/**
 * @author Jiangtao Guo
 */
function user_form_afterSelect(){
    abHtBookingCreateSearchController.afterSelect();
}

var abHtBookingCreateSearchController = View.createController('abHtBookingCreateSearchController', {
    //Search result return from WFR
    availableRooms: null,
    
    //flag of who will booking for 1|Yourself, 2|Other Employee, 3|External Visitor
    bookingForWho: 1,
    
    //start date of booking
    dateStart: null,
    
    //end date of booking
    dateEnd: null,
    
    filterDvId: null,
    
    filterDpId: null,
    
    dayPart: null,
    
    recurringRule: null,
    
    //Set after click the "booking" button in the second tab.
    createdBookings: null,

    afterInitialDataFetch: function(){
        this.afterSelect();
    },
    
    afterSelect: function(){
        //set abHtBookingCreateSearchController to parent tabs object 
        if (View.parentTab) {
            View.parentTab.parentPanel.abHtBookingCreateSearchController = this;
        }
        
        //Clear the values on the search console fields
        this.basicSearchOption.clear();
        this.otherSearchOption.clear();
        
        //set default bookingForWho flag to 'Youself' and set flag to 1  
        var bookingForRadios = document.getElementsByName("bookingFor");
        bookingForRadios[0].checked = true;
        this.bookingForWho = 1;
        
        //set default valut for field 'rmpct.date_start' and 'rmpct.date_end'
        this.basicSearchOption.setFieldValue('rmpct.date_start', getCurrentDate());
        this.basicSearchOption.setFieldValue('rmpct.date_end', "");
        
        //hidden field rmpct.day_part" and give a html field to user
        this.basicSearchOption.showField("rmpct.day_part", false);
        addDayPartRadio();
        
        //If the user Does Not belong to the Hotel Bookings All Departments security group Or Hoteling Administration 
        //then fill in the division and department fields from current user's, and disable those two fields.
        if (!((View.isMemberOfGroup(View.user, 'HOTEL BOOKINGS ALL DEPARTMENTS')) || (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')))) {
            this.otherSearchOption.setFieldValue('rmpct.dv_id', View.user.employee.organization.divisionId);
            this.otherSearchOption.setFieldValue('rmpct.dp_id', View.user.employee.organization.departmentId);
            this.otherSearchOption.enableField("rmpct.dv_id", false);
            this.otherSearchOption.enableField("rmpct.dp_id", false);
        }
        
        //unselect the isRecurring checkbox , initialize and hidden the html recurringField 
        $('isRecurring').checked = false;
        $('recurringField').style.display = 'none';
        clearRecurring();
    },
    
    /**
     * Clear the values on the search console fields, and set again the select options by default
     */
    basicSearchOption_onClear: function(){
        // set again the select options by default
        this.afterSelect();
    },
    
    basicSearchOption_onNext: function(){
        //Validate that the start date must not be null; start date must not later than end date
        var isDateValid = false;
        this.dateStart = this.basicSearchOption.getFieldValue('rmpct.date_start');
        this.dateEnd = this.basicSearchOption.getFieldValue('rmpct.date_end');
        if (this.dateStart && this.dateEnd) {
			if(!validateDate()){
		        View.showMessage(getMessage('invalid_date'));
				return;
			}
			var filters = null;
            if (dateRangeInterval(this.dateStart, this.dateEnd) >= 0 ) {
                //call wfr
                filters = getFiltersParameter();
				if(document.getElementsByName("bookingFor")[0].checked){
					filters.emId = View.user.employee.id;
				}
                this.recurringRule = "";
                if ($('isRecurring').checked) {
                    var recurringPattern = new RecurringPattern();
                    recurringPattern.type = getSelectedRadioButton("recurring_type");
                    recurringPattern.value1 = getRecurringPatternValue1(recurringPattern.type);
                    recurringPattern.value2 = getRecurringPatternValue2(recurringPattern.type);
                    recurringPattern.dateStart = this.basicSearchOption.getFieldValue('rmpct.date_start');
                    if (!recurringPattern.valid()) {
                        return;
                    }
                    this.recurringRule = recurringPattern.xmlPattern
                }                
                //Store the resultant list of available spaces returned from WFR to current controller's variable result.
                try {
                    var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-searchAvailableSpaces', filters, this.recurringRule);
                    this.availableRooms = result.dataSet.records;
                    //select Second tab.
                    var tabs = View.parentTab.parentPanel;
					tabs.abHtBookingCreateSearchController = this;
					
					/**
 					 * Per KB 3028018, removing the following two lines.
					 * YS indicates, "selectTab.loadView(); has caused the core
					 * to load that tab’s view twice (the core has already loaded it)."
					 *
 					 * var selectTab = tabs.findTab('selectBooking');
					 * selectTab.loadView();
					 */
                    tabs.selectTab('selectBooking');
                } 
                catch (e) {
                    Workflow.handleError(e);
                }
                
                
            }
            else {
                View.alert(getMessage('error_date_range'));
            }
        }
        else {
            View.showMessage(getMessage('error_date_empty'));
        }
    }
});

/**
 * get filter parameter for wfr
 */
function getFiltersParameter(){
    var basicSearchOptionPanel = abHtBookingCreateSearchController.basicSearchOption;
    var otherSearchOptionPanel = abHtBookingCreateSearchController.otherSearchOption;
    var filters = new Object();
    filters.date_start = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    filters.date_end = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    filters.duration = basicSearchOptionPanel.getFieldValue('duration');
    filters.minBlSpace = otherSearchOptionPanel.getFieldValue('minSpaceInBl');
    filters.minFlSpace = otherSearchOptionPanel.getFieldValue('minSpaceInFl');
    filters.emId = "";
    filters.dayPart = getDayPartRadioValue();
    filters.bl_id = otherSearchOptionPanel.getFieldValue('rmpct.bl_id');
    filters.fl_id = otherSearchOptionPanel.getFieldValue('rmpct.fl_id');
    filters.rm_id = otherSearchOptionPanel.getFieldValue('rmpct.rm_id');
    filters.rm_cat = otherSearchOptionPanel.getFieldValue('rm.rm_cat');
    filters.rm_type = otherSearchOptionPanel.getFieldValue('rm.rm_type');
    filters.rm_std = otherSearchOptionPanel.getFieldValue('rm.rm_std');
    filters.dv_id = otherSearchOptionPanel.getFieldValue('rmpct.dv_id');
    filters.dp_id = otherSearchOptionPanel.getFieldValue('rmpct.dp_id');
    
    // set controller variable
    abHtBookingCreateSearchController.dateStart = filters.date_start;
    abHtBookingCreateSearchController.dateEnd = filters.date_end;
    abHtBookingCreateSearchController.filterDvId = filters.dv_id;
    abHtBookingCreateSearchController.filterDpId = filters.dp_id;
    abHtBookingCreateSearchController.dayPart = filters.dayPart;
    
    return filters;
}

/**
 * if the option "Yourself" is selected and the Start Date field value is empty, set the value of the Start Date field with the current date
 */
function onForWhoChangeHandler(){
    var panel = View.panels.get('basicSearchOption');
    var bookingForRadios = document.getElementsByName("bookingFor");
    if (bookingForRadios[0].checked && !panel.getFieldValue('rmpct.date_start')) {
        panel.setFieldValue('rmpct.date_start', getCurrentDate());
    }
    
    for (var i = 0; i < bookingForRadios.length; i++) {
        if (bookingForRadios[i].checked) {
            abHtBookingCreateSearchController.bookingForWho = bookingForRadios[i].value;
            break;
        }
    }
}

function onStartDateChange(){
    if (!View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION') ) {
        validateDate();
    }
}

function onEndDateChange(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    if (dateStart) {
        validateDate();
    }
    else {
        View.showMessage(getMessage('error_datefrom_empty'));
    }
}

function onDurationChange(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var duration = basicSearchOptionPanel.getFieldValue('duration');
    if (!validationIntegerOrSmallint(basicSearchOptionPanel.getFieldElement('duration'), true)) {
        basicSearchOptionPanel.setFieldValue('duration', "");
        return;
    }
    
    
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    var dateEnd = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    
    if (dateStart) {
        basicSearchOptionPanel.setFieldValue('rmpct.date_end', dateAddDays(new Date(basicSearchOptionPanel.getRecord().getValue('rmpct.date_start')), parseInt(duration) - 1));
    }
    else {
        View.showMessage(getMessage('error_datefrom_empty'));
    }
}

function addDayPartRadio(){
    var dayPartEl = $('dayPart');
    dayPartEl.innerHTML = "";
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var enumValues = basicSearchOptionPanel.fields.map['rmpct.day_part'].fieldDef.enumValues;
    //fix KB3025149 by Guo Jiangtao 2010-01-12
    var innerHTML = '';
    for (var i = 0; i < 3; i++) {
        innerHTML = innerHTML + '<input type="radio" name="day_part" value="' + i + '" />' + enumValues[i];
    }
    dayPartEl.innerHTML = innerHTML;
    document.getElementsByName('day_part')[0].checked = true;
}

function getDayPartRadioValue(){
    var radioButtons = document.getElementsByName('day_part');
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}

function onSetRecurringHandler(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var otherSearchOptionPanel = View.panels.get('otherSearchOption');
    var isRecurring = $('isRecurring').checked;
    if (isRecurring) {
        $('recurringField').style.display = '';
    }
    else {
        $('recurringField').style.display = 'none';
    }
    
    otherSearchOptionPanel.show(false);
    otherSearchOptionPanel.show(true);
}


function dateAddDays(date_start, nxtdays){
    var date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}

function validateDate(){
    var basicSearchOptionPanel = View.panels.get('basicSearchOption');
    var dateStart = basicSearchOptionPanel.getFieldValue('rmpct.date_start');
    var dateEnd = basicSearchOptionPanel.getFieldValue('rmpct.date_end');
    if (dateStart) {
        if (! View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')) {
            if (dateRangeInterval(dateStart, getCurrentDate()) > 0) {
                View.showMessage(getMessage('error_datefrom_early'));
                return false;
            }
        }
        if (dateEnd) {
            if (!compareLocalizedDates(basicSearchOptionPanel.getFieldElement('rmpct.date_start').value, basicSearchOptionPanel.getFieldElement('rmpct.date_end').value, true)) {
                View.showMessage(getMessage('error_date_range'));
				basicSearchOptionPanel.setFieldValue('rmpct.date_end', null);
                return false;
            }
        }
        return true;
    }
    else {
        View.showMessage(getMessage('error_date_range'));
        return false;
    }
}

function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

function dateRangeInterval(startDate, endDate){
    var sDate = new Date(startDate.replace(/\-/g, "/"));
    var eDate = new Date(endDate.replace(/\-/g, "/"));
    var drDays = (eDate.getTime() - sDate.getTime()) / 3600 / 1000 / 24;
    return drDays;
}


/**
 * Returns value of the selected radio button.
 * @param {name} Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}


/**
 * onclick event handler for radio recurring_type.
 */
function onSelectRecurringType(){
    var type = getSelectedRadioButton("recurring_type");
    if (type == "day") {
        enabledDay(true);
        enabledWeek(false);
        enabledMonth('', false);
    }
    if (type == "week") {
        enabledDay(false);
        enabledWeek(true);
        enabledMonth('', false);
    }
    if (type == "month") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', true);
    }
    if (type == "bimonth") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', false);
    }
    if (type == "trimonth") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', false);
    }
}


/**
 * enable or disable the radio 'day'.
 * @param {isEnabled} is enable.
 */
function enabledDay(isEnabled){
    $("ndays").disabled = !isEnabled;
    $("ndays").value = "";
}

/**
 * enable or disable the radio 'week'.
 * @param {isEnabled} is enable.
 */
function enabledWeek(isEnabled){
    $("weekly_mon").disabled = !isEnabled;
    $("weekly_tue").disabled = !isEnabled;
    $("weekly_wed").disabled = !isEnabled;
    $("weekly_thu").disabled = !isEnabled;
    $("weekly_fri").disabled = !isEnabled;
    $("weekly_sat").disabled = !isEnabled;
    $("weekly_sun").disabled = !isEnabled;
    $("weekly_mon").checked = false;
    $("weekly_tue").checked = false;
    $("weekly_wed").checked = false;
    $("weekly_thu").checked = false;
    $("weekly_fri").checked = false;
    $("weekly_sat").checked = false;
    $("weekly_sun").checked = false;
}

/**
 * enable or disable the radio 'month','bimonth' or 'trimonth'.
 * @param {isEnabled} is enable.
 */
function enabledMonth(prefix, isEnabled){
    $(prefix + "first").disabled = !isEnabled;
    $(prefix + "second").disabled = !isEnabled;
    $(prefix + "third").disabled = !isEnabled;
    $(prefix + "fourth").disabled = !isEnabled;
    $(prefix + "last").disabled = !isEnabled;
    $(prefix + "month_mon").disabled = !isEnabled;
    $(prefix + "month_tue").disabled = !isEnabled;
    $(prefix + "month_wed").disabled = !isEnabled;
    $(prefix + "month_thu").disabled = !isEnabled;
    $(prefix + "month_fri").disabled = !isEnabled;
    $(prefix + "month_sat").disabled = !isEnabled;
    $(prefix + "month_sun").disabled = !isEnabled;
    $(prefix + "first").checked = false;
    $(prefix + "second").checked = false;
    $(prefix + "third").checked = false;
    $(prefix + "fourth").checked = false;
    $(prefix + "last").checked = false;
    $(prefix + "month_mon").checked = false;
    $(prefix + "month_tue").checked = false;
    $(prefix + "month_wed").checked = false;
    $(prefix + "month_thu").checked = false;
    $(prefix + "month_fri").checked = false;
    $(prefix + "month_sat").checked = false;
    $(prefix + "month_sun").checked = false;
}

/**
 * get month radio HTML Element according the given prefix and value
 * @param {prefix} '' || 'bi' || 'tri'
 * @param {value} '1st' || '2nd' || '3rd' || '4th' || 'last' || 'mon' || 'tue' || 'wed' || 'thu' || 'fri'|| 'sat' || 'sun'
 */
function getMonthRadioElByValue(prefix, value){
    var El = null;
    if (value == '1st') {
        El = $(prefix + "first");
    }
    if (value == '2nd') {
        El = $(prefix + "second");
    }
    if (value == '3rd') {
        El = $(prefix + "third");
    }
    if (value == '4th') {
        El = $(prefix + "fourth");
    }
    if (value == 'last') {
        El = $(prefix + "last");
    }
    if (value == 'mon') {
        El = $(prefix + "month_mon");
    }
    if (value == 'tue') {
        El = $(prefix + "month_tue");
    }
    if (value == 'wed') {
        El = $(prefix + "month_wed");
    }
    if (value == 'thu') {
        El = $(prefix + "month_thu");
    }
    if (value == 'fri') {
        El = $(prefix + "month_fri");
    }
    if (value == 'sat') {
        El = $(prefix + "month_sat");
    }
    if (value == 'sun') {
        El = $(prefix + "month_sun");
    }
    return El;
}

RecurringPattern = Base.extend({
    type: null, // recurring type.
    value1: null, // the first value of the selected type
    value2: null, // the second value of the selected type
    xmlPattern: null, // the encode xml recurring pattern
    dateStart: null, // the start date of recurring pattern
    constructor: function(type, value1, value2, xmlPattern, dateStart){
        if (type != undefined) 
            this.type = type;
        
        if (value1 != undefined) 
            this.value1 = value1;
        
        if (value2 != undefined) 
            this.value2 = value2;
        
        if (xmlPattern != undefined) 
            this.xmlPattern = xmlPattern;
        
        if (dateStart != undefined) 
            this.dateStart = dateStart;
    },
    
    //decode the xml pattern
    decode: function(){
        var xmlDocument = parseXml(this.xmlPattern, null, true);
        var nodes = selectNodes(xmlDocument, null, '//recurring');
        if (nodes.length > 0) {
            this.type = nodes[0].getAttribute('type');
            this.value1 = nodes[0].getAttribute('value1');
            this.value2 = nodes[0].getAttribute('value2');
        }
    },
    
    //encode to xml pattern
    encode: function(){
        this.xmlPattern = '<recurring type="' + this.type + '" value1="' + this.value1 + '"'
        if (this.value2 != null) {
            this.xmlPattern += ' value2="' + this.value2 + '"';
        }
        this.xmlPattern += '/>';
    },
    
    //validate the recurring pattern
    valid: function(){
        if (!this.dateStart) {
            View.showMessage(getMessage('error_datefrom_empty'));
            return;
        }
        
        if (!this.type) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'day' && !this.value1) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'week' && this.value1.indexOf('1') < 0) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'month' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        this.encode();
        return true;
    }
    
});


/**
 * Returns value1 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue1(type){
    var value1 = '';
    if (type == 'day') {
        value1 = document.getElementById("ndays").value;
    }
    
    if (type == 'week') {
        value1 = ((document.getElementById("weekly_mon").checked) ? '1' : '0') + ',' +
        ((document.getElementById("weekly_tue").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_wed").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_thu").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_fri").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sat").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sun").checked) ? '1' : '0')
    }
    
    if (type == 'month') {
        value1 = getSelectedRadioButton("monthly_value1");
    }
    
    if (type == 'bimonth') {
        value1 = getSelectedRadioButton("bimonthly_value1");
    }
    
    if (type == 'trimonth') {
        value1 = getSelectedRadioButton("trimonthly_value1");
    }
    
    return value1;
}

/**
 * Returns value2 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue2(type){
    var value2 = '';
    if (type == 'month') {
        value2 = getSelectedRadioButton("monthly_value2");
    }
    
    if (type == 'bimonth') {
        value2 = getSelectedRadioButton("bimonthly_value2");
    }
    
    if (type == 'trimonth') {
        value2 = getSelectedRadioButton("trimonthly_value2");
    }
    
    return value2;
}


function clearRecurring(dateStart){
    $('day').checked = false;
    $('week').checked = false;
    $('month').checked = false;
    enabledDay(true);
    enabledWeek(true);
    enabledMonth('', true);
}

function validationInteger(element){
    if (!validationIntegerOrSmallint(element, true)) {
        element.value = "";
    }
	
	if(parseInt(element.value)<=0){
		View.alert(getMessage('greater0'));
	}
}
