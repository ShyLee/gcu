/**
 * 格式化日期
 * archibus系统 获取的date类型的字符串儿， 月份与日期没有自动补零
 *     (如 我们选的日期时"2014-08-08" 但form和grid界面中显示的是"2014-8-8")
 * 如果我们从界面中获取的值是"2014-8-8"
 * 用js Date函数  new Date("2014-8-8")时,获取不到具体的时间值
 * 此函数自动补零
 * */
function formatStrDate(date){
    var array = date.split("-");
    var yyyy = parseInt(array[0]);
    var mm = parseInt(array[1]);
    var dd = parseInt(array[2]);
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}

/**
 * 解决IE8，IE9 显示时间时出现NAN问题
 * 觉解办法为：IE在new Date()一个字符串时，不识别格式“2014-5-3”，需将这种格式转化为“2014/5/3”后才能new成功。
 * @param {String} date
 */
function ieDateFormat(date){
    var array = date.split("-");
    var bTime = array[0] + '/' + array[1] + '/' + array[2];
    var later = new Date(bTime);
    return later;
}

function formatDate(date){
    var yyyy = date.getFullYear();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}

function monthStartDate(date){
    var strYear = date.getFullYear();
    var strMonth = date.getMonth() + 1;
    datestr = strYear + "-" + strMonth + "-" + 1;
    return datestr;
}

function monthStartStr(date){
    var later = ieDateFormat(date);
    var strYear = later.getFullYear();
    var strMonth = later.getMonth() + 1;
    datestr = strYear + "-" + strMonth + "-" + 1;
    return datestr;
}

/**
 * 缴费项截止日期往前推一天
 * @param date
 * @returns
 */
function getYesterday(date){
    var yesterday_milliseconds = date.getTime() - 1000 * 60 * 60 * 24;
    var yesterday = new Date();
    yesterday.setTime(yesterday_milliseconds);
    var strYear = yesterday.getFullYear();
    var strDay = yesterday.getDate();
    var strMonth = yesterday.getMonth() + 1;
    datastr = strYear + "-" + strMonth + "-" + strDay;
    return datastr;
}

/**
 * IE浏览器中对于“2014-5-3”这样的格式不能使用‘getYear’等方法获得数字，需要将时间字符串格式化为“2014/5/3”这样的格式。
 * @param {String} date
 * @param {String} n
 */
function nYearsLaterSameDay(date, n){
    var later = ieDateFormat(date);
    var strYear = later.getFullYear() + parseInt(n, 10);
    var strDay = later.getDate();
    var strMonth = later.getMonth() + 1;
    datestr1 = strYear + "-" + strMonth + "-" + strDay;
    return datestr1;
    
}

function getTotalMonth(dateStart, dateEnd){
    var dateStart = formatStrDate(dateStart);
    var dateEnd = formatStrDate(dateEnd);
    dateStart = new Date(dateStart);
    var dateEnd = new Date(dateEnd);
    var startYear = dateStart.getFullYear();
    var startMonth = dateStart.getMonth() + 1;
    var startDay = dateStart.getDate();
    var endYear = dateEnd.getFullYear();
    var endMonth = dateEnd.getMonth() + 1;
    var endDay = dateEnd.getDate();
    var totalMonth = 0;
    if (endDay > startDay) {
        totalMonth = endMonth - startMonth + (endYear - startYear) * 12 + 1;
    }
    else {
        totalMonth = endMonth - startMonth + (endYear - startYear) * 12;
    }
    return totalMonth;
}

function getPrevMonthLastDay(date){
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    if (mm - 1 == 0) {
        yyyy -= 1;
        mm = 12;
    }
    else {
        mm -= 1;
    }
    dd = GetMonthMaxDays(mm, yyyy);
    return yyyy + "-" + mm + "-" + dd;
}

function nYearPrevMonthLastDay(date, n){
    var strYear = date.getFullYear();
    var strDay = date.getDate();
    var strMonth = date.getMonth() + 1;
    var yyyy = strYear + parseInt(n, 10);
    var dd = GetMonthMaxDays(strMonth, yyyy);
    return datastr = yyyy + "-" + strMonth + "-" + dd;
}

function nMonthLater(date, n){
    var later = ieDateFormat(date);
    var year = later.getFullYear();
    var day = later.getDate();
    var month = later.getMonth() + 1;
    var monthLater = month + parseInt(n, 10);
    var moreYear = parseInt(monthLater / 12);
    var moreMonth = monthLater % 12;
    if (moreMonth == 0) {
        month = 12;
        moreYear -= 1;
    }
    else {
        month = moreMonth;
    }
    var yyyy = year + moreYear;
    return datastr = yyyy + "-" + month + "-" + day;
}

function nDaysLater(date, n){
    var later = ieDateFormat(date);
    var dateStartMilliseconds = later.getTime();
    var daysMilliseconds = parseInt(n, 10) * 1000 * 60 * 60 * 24;
    var dateEnd = new Date();
    dateEnd.setTime(dateStartMilliseconds + daysMilliseconds);
    return formatDate(dateEnd);
}

/**
 * date1 < date2,return true;else return false.
 */
function dateCompare(date1, date2){
    date1 = new Date(date1).getTime();
    date2 = new Date(date2).getTime();
    return (date1 < date2);
}
