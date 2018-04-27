
//========================= Common in Room Reservation And Resource Reservation========================================//
/**
 * This function is used to translate all the fields of the recurrence options
 *
 * RP is the abbreviation of Recurring Panel.
 *
 * translateRecurringOptions
 */
function ABRV_RP_translateOptions() {
    $("day").nextSibling.nodeValue = getMessage("hdOpt1");
    $("week").nextSibling.nodeValue = getMessage("hdOpt2");
    $("month").nextSibling.nodeValue = getMessage("hdOpt1");
    $("weekly_sun").nextSibling.nodeValue = getMessage("bdOpt2_1");
    $("weekly_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
    $("weekly_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
    $("weekly_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
    $("weekly_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
    $("weekly_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
    $("weekly_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
    $("first").nextSibling.nodeValue = getMessage("bdOpt3_1_1");
    $("second").nextSibling.nodeValue = getMessage("bdOpt3_1_2");
    $("third").nextSibling.nodeValue = getMessage("bdOpt3_1_3");
    $("fourth").nextSibling.nodeValue = getMessage("bdOpt3_1_4");
    $("last").nextSibling.nodeValue = getMessage("bdOpt3_1_5");
    $("month_sun").nextSibling.nodeValue = getMessage("bdOpt3_2_7");
    $("month_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
    $("month_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
    $("month_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
    $("month_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
    $("month_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
    $("month_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
}


/**
 * Create XML for the recurrent reserve
 */
function ABRV_RP_createXmlRecurring(reservation, saveFieldId) {

    var xmlInit = '<options type="' + reservation.recur_type + '">';
    var xmlDay = '<ndays value="' + document.getElementById("ndays").value + '" />';
    var xmlWeek = '<weekly mon="' +
    document.getElementById("weekly_mon").checked +
    '" tue="' +
    document.getElementById("weekly_tue").checked +
    '" wed="' +
    document.getElementById("weekly_wed").checked +
    '" thu="' +
    document.getElementById("weekly_thu").checked +
    '" fri="' +
    document.getElementById("weekly_fri").checked +
    '" sat="' +
    document.getElementById("weekly_sat").checked +
    '" sun="' +
    document.getElementById("weekly_sun").checked +
    '" />';
    var xmlMonth = '<monthly 1st="' +
    document.getElementById("first").checked +
    '" 2nd="' +
    document.getElementById("second").checked +
    '" 3rd="' +
    document.getElementById("third").checked +
    '" 4th="' +
    document.getElementById("fourth").checked +
    '" last="' +
    document.getElementById("last").checked +
    '" mon="' +
    document.getElementById("month_mon").checked +
    '" tue="' +
    document.getElementById("month_tue").checked +
    '" wed="' +
    document.getElementById("month_wed").checked +
    '" thu="' +
    document.getElementById("month_thu").checked +
    '" fri="' +
    document.getElementById("month_fri").checked +
    '" sat="' +
    document.getElementById("month_sat").checked +
    '" sun="' +
    document.getElementById("month_sun").checked +
    '" />';
    var xmlEnd = '</options>';
    
    var xmlValue = xmlInit + xmlDay + xmlWeek + xmlMonth + xmlEnd;
    
    //Copy hidden XML field value into the tab view, to make it available on other tab pages	
    if (valueExists(saveFieldId)) {
        $(saveFieldId).value = xmlInit + xmlDay + xmlWeek + xmlMonth + xmlEnd;
    }
    
    reservation.recurring_rule = xmlValue;
    //$('').value;
}

/**
 * Handle options for daily recurrent reserve
 * @param {boolean} isTrue
 */
function ABRV_RP_enabledDay(isTrue) {
    document.getElementById("ndays").disabled = !isTrue;
    if (!isTrue) {
        document.getElementById("ndays").value = "";
    }
}

/**
 * Handle options for weekly recurrent reserve
 * @param {boolean} isTrue
 */
function ABRV_RP_enabledWeek(isTrue) {
    var WeekDays = View.getOpenerView().controllers.get(0).WeekDays;
    
    for (var i = 0; i < 7; i++) {
        var weeklyEl = document.getElementById("weekly_" + WeekDays[i].type);
        weeklyEl.disabled = !isTrue;
        if (!isTrue) {
            weeklyEl.checked = isTrue;
        }
    }
}

/**
 * Handle options for monthly recurrent reserve
 * @param {boolean} isTrue
 */
function ABRV_RP_enabledMonth(isTrue) {

    var WeekDays = View.getOpenerView().controllers.get(0).WeekDays;
    
    document.getElementById("first").disabled = !isTrue;
    document.getElementById("second").disabled = !isTrue;
    document.getElementById("third").disabled = !isTrue;
    document.getElementById("fourth").disabled = !isTrue;
    document.getElementById("last").disabled = !isTrue;
    if (!isTrue) {
        document.getElementById("first").checked = isTrue;
        document.getElementById("second").checked = isTrue;
        document.getElementById("third").checked = isTrue;
        document.getElementById("fourth").checked = isTrue;
        document.getElementById("last").checked = isTrue;
        
    }
    for (var i = 0; i < 7; i++) {
        var weeklyEl = document.getElementById("month_" + WeekDays[i].type);
        weeklyEl.disabled = !isTrue;
        if (!isTrue) {
            weeklyEl.checked = isTrue;
        }
    }
}

/**
 * This method loads the options for the recurrent reserve according to the type of recurrent reserve
 */
function ABRV_RP_typeRecurringReservation() {
    var typeRecurring = ABRV_getSelectedRadioButton("recurrent_type");
    if (typeRecurring == "day") {
        ABRV_RP_enabledDay(true);
        ABRV_RP_enabledWeek(false);
        ABRV_RP_enabledMonth(false);
    }
    if (typeRecurring == "week") {
        ABRV_RP_enabledDay(false);
        ABRV_RP_enabledWeek(true);
        ABRV_RP_enabledMonth(false);
    }
    if (typeRecurring == "month") {
        ABRV_RP_enabledDay(false);
        ABRV_RP_enabledWeek(false);
        ABRV_RP_enabledMonth(true);
    }
}

//========================= Common in Room Reservation And Resource Reservation========================================//


//========================= Room Reservation Begin==========================================//
/**
 * This method loads the options for the recurrent reserve by default
 * ab-rr-content-add-room-reservation.
 */
function ABRV_RPRM_initRecurringOption(panelId) {
    View.panels.get("recurring_panel").setFieldValue("reserve.date_end", "");
    
    ABRV_RP_enabledDay(false);
    ABRV_RP_enabledWeek(false);
    ABRV_RP_enabledMonth(false);
    
    document.getElementById("day").checked = false;
    document.getElementById("week").checked = false;
    document.getElementById("month").checked = false;
}

//========================= Room Reservation End==========================================//



//========================= Resource Reservation Begin==========================================//
/**
 * Clear the value of the recurring panel and hide the panel
 * Guo added
 */
// clearAndHideRecurringPanel
function ABRV_RP_clearAndHiden(panelId, fieldId) {
    var recurringPanel = View.panels.get(panelId);
    if (valueExists(fieldId)) {
        recurringPanel.setFieldValue(fieldId, "");
    }
    
    ABRV_RP_enabledDay(true);
    ABRV_RP_enabledWeek(true);
    ABRV_RP_enabledMonth(true);
    
    $("day").checked = false;
    $("ndays").value = "";
    $("week").checked = false;
    $("weekly_sun").checked = false;
    $("weekly_mon").checked = false;
    $("weekly_tue").checked = false;
    $("weekly_wed").checked = false;
    $("weekly_thu").checked = false;
    $("weekly_fri").checked = false;
    $("weekly_sat").checked = false;
    $("month").checked = false;
    $("first").checked = false;
    $("second").checked = false;
    $("third").checked = false;
    $("fourth").checked = false;
    $("last").checked = false;
    $("month_sun").checked = false;
    $("month_mon").checked = false;
    $("month_tue").checked = false;
    $("month_wed").checked = false;
    $("month_thu").checked = false;
    $("month_fri").checked = false;
    $("month_sat").checked = false;
    
    recurringPanel.show(false);
}



/**
 * Method to check if all the fields have been set in recurring panel
 * Guo added
 */
function ABRV_RP_checkRecurringPanel(date_start, date_end) {
    var typeRecurring = ABRV_getSelectedRadioButton("recurrent_type");
    
    if (date_end == "") {
        View.showMessage(getMessage("selectDateEnd"));
        return false;
    }
    
    if (!ABRV_bISODateIsBefore(date_start, ABRV_getDateModified(date_end, 1))) {
        View.showMessage(getMessage("fillGreaterDateEnd"));
        return false;
    }
    
    if (typeRecurring == null) {
        View.showMessage(getMessage("fillPattern"));
        return false;
    }
    
    if (typeRecurring == "day") {
        var inputDays = $("ndays").value;
        if (trim(inputDays) == "") {
            View.showMessage(getMessage("fillDays"));
            return false;
        } else {
            //KB 3018841 Added by Keven 
            var testPattern = /^[1-9]\d*$/;
            if (!testPattern.test(inputDays)) {
                View.showMessage(getMessage("daysInputError"));
                return false;
            }
        }
    } else if ((typeRecurring == "week") &&
    (document.getElementById("weekly_mon").checked == false) &&
    (document.getElementById("weekly_tue").checked == false) &&
    (document.getElementById("weekly_wed").checked == false) &&
    (document.getElementById("weekly_thu").checked == false) &&
    (document.getElementById("weekly_fri").checked == false) &&
    (document.getElementById("weekly_sat").checked == false) &&
    (document.getElementById("weekly_sun").checked == false)) {
        View.showMessage(getMessage("fillPattern"));
        return false;
    } else if (((typeRecurring == "month") &&
    (document.getElementById("month_mon").checked == false) &&
    (document.getElementById("month_tue").checked == false) &&
    (document.getElementById("month_wed").checked == false) &&
    (document.getElementById("month_thu").checked == false) &&
    (document.getElementById("month_fri").checked == false) &&
    (document.getElementById("month_sat").checked == false) &&
    (document.getElementById("month_sun").checked == false)) ||
    ((typeRecurring == "month") &&
    (document.getElementById("first").checked == false) &&
    (document.getElementById("second").checked == false) &&
    (document.getElementById("third").checked == false) &&
    (document.getElementById("fourth").checked == false) &&
    (document.getElementById("last").checked == false))) {
        View.showMessage(getMessage("fillPattern"));
        return false;
    }
    return true;
}


/**
 * update the recurring console
 * Guo added
 * @param {Object} reservation
 */
function ABRV_RP_updateConsoleForRecurring(recurringPanelId, reservation) {
	if (!valueExists(reservation)) {
		alert("reservation undefined.");
		return;	
	}
	
    View.panels.get('selectResourceConsolePanel').setFieldValue("reserve.res_type", reservation.res_type);
	
    var Months = View.getOpenerView().controllers.get(0).Months;
    var WeekDays = View.getOpenerView().controllers.get(0).WeekDays;
    var roomReservation = View.getOpenerView().controllers.get(0).roomReservation;
    
    //Options to when the reserve type is recurring
    if (reservation.res_type == "recurring") {
        var recurring_panel = View.panels.get(recurringPanelId);
        recurring_panel.setFieldValue("reserve.date_end", reservation.date_end);
        
        if (roomReservation.rmres_id != "") {
            document.getElementById("day").disabled = true;
            document.getElementById("week").disabled = true;
            document.getElementById("month").disabled = true;
        }
        
        if (reservation.recur_type == "day") {
            ABRV_RP_enabledWeek(false);
            ABRV_RP_enabledMonth(false);
            
            if (roomReservation.rmres_id != "") {
                ABRV_RP_enabledDay(false);
            } else {
                ABRV_RP_enabledDay(true);
            }
            
            document.getElementById("day").checked = true;
            document.getElementById("ndays").value = reservation.recur_val1[0];
        } else if (reservation.recur_type == "week") {
            ABRV_RP_enabledDay(false);
            ABRV_RP_enabledMonth(false);
            
            if (roomReservation.rmres_id != "") {
                ABRV_RP_enabledWeek(false);
            } else {
                ABRV_RP_enabledWeek(true);
            }
            
            document.getElementById("week").checked = true;
            for (var i = 0; i < 7; i++) {
                if (reservation.recur_val1[i]) {
                    document.getElementById("weekly_" + WeekDays[i].type).checked = true;
                }
            }
        } else if (reservation.recur_type == "month") {
            ABRV_RP_enabledDay(false);
            ABRV_RP_enabledWeek(false);
			
            if (roomReservation.rmres_id != "") {
                ABRV_RP_enabledMonth(false);
            } else {
                ABRV_RP_enabledMonth(true);
            }
			
            document.getElementById("month").checked = true;
            i = reservation.recur_val1[0];
            document.getElementById("" + Months[i - 1].type).checked = true;
            j = reservation.recur_val2[0];
            document.getElementById("month_" + WeekDays[i].type).checked = true;
        }
		
        recurring_panel.show(true);
    }
}


/**
 *
 * @param {Object} panelId the panel must contains the field reserve.date_end
 * @param {Object} isRecuring shwo the panel to true/false
 */
function ABRV_RPRES_initializeRecurringPanel(panelId, isRecuring) {
    var panel = View.panels.get(panelId);
    panel.setFieldValue("reserve.date_end", "");
    ABRV_RP_translateOptions();
    panel.show(isRecuring)
}

/**
 * set the reservation object according the recurring panel
 * @param {Object} reservation
 */
function ABRV_RPRES_setRecurringOptions(recurringPanelId, dateStart, reservation) {
    reservation.date_start = [];
    reservation.recur_type = ABRV_getSelectedRadioButton("recurrent_type");
    var Months = View.getOpenerView().controllers.get(0).Months;
    var WeekDays = View.getOpenerView().controllers.get(0).WeekDays;
	
    var dateEnd = View.panels.get(recurringPanelId).getFieldValue('reserve.date_end');
    
    if (reservation.res_type == "regular") {
        reservation.recur_type = null;
        reservation.recur_val1 = [null];
        reservation.recur_val2 = [null];
    } else { //is recurring
        var i;
        reservation.recur_val1 = [null];
        reservation.recur_val2 = [null];
        
        if (reservation.recur_type == "day") {
            reservation.date_start = [dateStart];
            reservation.recur_val1 = [$("ndays").value];
            i = 1;
            
            while ((reservation.date_start[i - 1] != null) &&
            (ABRV_bISODateIsBefore(ABRV_getDateModified(reservation.date_start[i - 1], reservation.recur_val1[0]), ABRV_getDateModified(dateEnd, 1)))) {
                reservation.date_start[i] = ABRV_getDateModified(reservation.date_start[i - 1], reservation.recur_val1[0]);
                i++;
            }
        } else if (reservation.recur_type == "week") { //type_recur is weekly		
            for (i = 0; i < 7; i++) {
                reservation.recur_val1[i] = ((document.getElementById("weekly_" + WeekDays[i].type).checked == true) ? WeekDays[i].value : null);
            }
            
            consoleDay = ABRV_getDayOfWeek(dateStart);
            dayDif = 7;
            
            for (i = 0; i < 7; i++) {
                if (reservation.recur_val1[i] != null) {
                    temp = reservation.recur_val1[i] - consoleDay;
                    if (temp < 0) {
                        temp = temp + 7;
                    }
                    dayDif = ABRV_min(dayDif, temp);
                }
            }
            
            if (ABRV_bISODateIsBefore(ABRV_getDateModified(dateStart, dayDif), ABRV_getDateModified(dateEnd, 1))) {
                reservation.date_start[0] = ABRV_getDateModified(dateStart, dayDif);
                temp = ABRV_getDateModified(reservation.date_start[0], 1);
                i = 1;
                while (ABRV_bISODateIsBefore(temp, ABRV_getDateModified(dateEnd, 1))) {
                    if ((ABRV_getDayOfWeek(temp) == reservation.recur_val1[0]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[1]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[2]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[3]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[4]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[5]) ||
                    (ABRV_getDayOfWeek(temp) == reservation.recur_val1[6])) {
                        reservation.date_start[i] = temp;
                        i++;
                    }
                    
                    temp = ABRV_getDateModified(temp, 1);
                }
            }
        } // End if (reservation.recur_type=="week")
 else { //Begin type_recur is monthly
            reservation.recur_val1 = [ABRV_getSelectedRadioButton("recurrent_type2")];
            reservation.recur_val2 = [ABRV_getSelectedRadioButton("recurrent_type3")];
            startRecurring = dateStart;
            endRecurring = dateEnd;
            i = 0;
            
            while (true) {
                arrayDate = startRecurring.split("-");
                weekDayMonthone = ABRV_getDayOfWeek(arrayDate[0] + "-" + arrayDate[1] + "-01");
                addDays = reservation.recur_val2[0] - weekDayMonthone;
                
                if (addDays < 0) {
                    addDays += 7;
                }
                
                daymonth1st = ABRV_getDateModified(arrayDate[0] + "-" + arrayDate[1] + "-01", addDays);
                daymonth2nd = ABRV_getDateModified(daymonth1st, 7);
                daymonth3rd = ABRV_getDateModified(daymonth2nd, 7);
                daymonth4th = ABRV_getDateModified(daymonth3rd, 7);
                daymonthlast = ABRV_getDateModified(daymonth4th, 7);
                arraydaymonth1st = daymonth1st.split("-");
                arraydaymonthlast = daymonthlast.split("-");
                
                if (arraydaymonthlast[1] != arraydaymonth1st[1]) {
                    daymonthlast = daymonth4th;
                }
                
                if ((reservation.recur_val1[0] == 1) &&
                (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth1st, 1)))) {
                
                    if (ABRV_bISODateIsBefore(endRecurring, daymonth1st)) {
                        break;
                    } else {
                        reservation.date_start[i] = daymonth1st;
                        i++;
                    }
                } else if ((reservation.recur_val1[0] == 2) &&
                (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth2nd, 1)))) {
                
                    if (ABRV_bISODateIsBefore(endRecurring, daymonth2nd)) {
                        break;
                    } else {
                        reservation.date_start[i] = daymonth2nd;
                        i++;
                    }
                } else if ((reservation.recur_val1[0] == 3) &&
                (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth3rd, 1)))) {
                
                    if (ABRV_bISODateIsBefore(endRecurring, daymonth3rd)) {
                        break;
                    } else {
                        reservation.date_start[i] = daymonth3rd;
                        i++;
                    }
                } else if ((reservation.recur_val1[0] == 4) &&
                (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonth4th, 1)))) {
                
                    if (ABRV_bISODateIsBefore(endRecurring, daymonth4th)) {
                        break;
                    } else {
                        reservation.date_start[i] = daymonth4th;
                        i++;
                    }
                } else if ((reservation.recur_val1[0] == 5) &&
                (ABRV_bISODateIsBefore(startRecurring, ABRV_getDateModified(daymonthlast, 1)))) {
                
                    if (ABRV_bISODateIsBefore(endRecurring, daymonthlast)) {
                        break;
                    } else {
                        reservation.date_start[i] = daymonthlast;
                        i++;
                    }
                }
                
                if (arrayDate[1] == 12) {
                    startRecurring = (parseInt(arrayDate[0], 10) + 1) + "-01-01";
                } else {
                    startRecurring = arrayDate[0] + "-" +
                    (((parseInt(arrayDate[1], 10) + 1) > 9) ? (parseInt(arrayDate[1], 10) + 1) : "0" +
                    (parseInt(arrayDate[1], 10) + 1)) +
                    "-01";
                }
            } //End while
        } //End type_recur is monthly
    }
    
    if (reservation.date_start.length > 0) {
        reservation.date_end = reservation.date_start[reservation.date_start.length - 1];
    }
	
    ABRV_RP_createXmlRecurring(reservation, null);
    addResourceReservContentController.globalParameters.reservation = reservation;
    
    if (reservation.date_start.length > 0) {
        return true;
    }
    View.showMessage(getMessage("RecurringConfError"));
    return false;
}
