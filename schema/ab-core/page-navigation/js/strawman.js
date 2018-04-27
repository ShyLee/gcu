/**
 * JavaScript driving the Bali 1 Navigation skeleton page
 *
 * Functionality specific to the included express tab is moved to expressHome.js
 *
 * @author Steven Meyer
 * @since V 21.1
 */

/**
 * Currently logged in user name
 */
var loggedInUser;

/**
 * HTML Fragments are generated to a locale & role-specific directory below this relative
 * @type {String}
 */
var FRAGMENT_DIRECTORY = "schema/ab-products/common/views/page-navigation/generated/";
var LOCALE;
var LOCALE_DIRECTORY = "";
var ROLE_DIRECTORY = "";

/**
 * reference to the tabs widget for future reference;
 */
var tabsWidget;

/**
 * HTML Fragment to load into the first tab's div
 * @type {String}
 */
var expressTabHtmlFragment; // = express-home.html";

/**
 * HTML Fragment to load into the second tab's div
 * @type {String}
 */
var applicationsTabHtmlFragment; // = applications-home.html";

/**
 * Global variable to control setInterval - clearInterval
 * for waiting on DWR initialization before 1st WFR call.
 */
var intervalId;
var waitCounter = 0;

/**
 * Initialize the Navigation page once the document is ready
 */
$(document).ready(function() {
    $('.task-view').hide();

    tabsWidget = setUpTabs();

    // execute timing event to test whether DWR has been initialized.
    // Set user name in header when it is ready.
    // Ensure that the user locale == the site default locale, else redirect.
    //
    // Trigger completion of setup only after initial WFR completes
    intervalId = setInterval(initialWfrCall, 100);
});

/**
 * Set up the express home & application tabs
 */
function setUpTabs() {
    // Enable tabs. The `event` property must be overridden so that the tabs aren't changed on click,
    // and any custom event name can be specified.
    var tabs = $('#navigationTabs').tabs({ event: 'change' });

    return tabs;
}

/**
 * Function to call at intervals while waiting for DWR to make server available.
 * DWR has its own initialization cycle where it obtains the script session ID from the server.
 * No calls can be made until this is complete.
 * We have code in ab-view.js to wait for this, implement similar process here.
 *
 * When this first call gets the user info, set locale\role variables.
 */
function initialWfrCall() {
    if ( valueExists(dwr.engine._scriptSessionId) ) {
        var userInfo = getUserInfo();
        if (userInfo) {
            setUserLocaleDirectory(userInfo.locale, userInfo.defaultLocale);
            redirectIfNotDefaultLocale();
            finishSetup(userInfo);
        }
        clearInterval(intervalId);
    }
    // else wait and do nothing but increment counter
    else {
        waitCounter++;
    }
}

/**
 * When user locale is not the site's default locale,
 * redirect to user locale-specific skeleton page.
 */
function redirectIfNotDefaultLocale() {
    if (LOCALE != context.locale) {
        var currentLocation = location.href;
        var currentDir = currentLocation.substring(0, currentLocation.indexOf("schema"));
        context.locale = LOCALE;
        window.location = currentDir + FRAGMENT_DIRECTORY + LOCALE_DIRECTORY + "express-navigator-" + LOCALE + ".html";
    }
}

/**
 * Complete the page setup is done after ensuring that the page is for the correct locale.
 */
function finishSetup(userInfo) {
    setUserRoleDirectory(userInfo.role);
    setFragmentFileNamesFromRole(userInfo.role);
    setUserHeader(userInfo);

    setUpSearchDialog();
    setUpHistory(tabsWidget, 'ul.ui-tabs-nav a');

    favoriteListLineHeight = getFavListItemHeight();
    positionBreadCrumbs();

    $(window).resize(function() {setPageDimensions();});

    // initialize the hovertips for static elements in the DOM
    window.setTimeout(hovertipInit, 100);
    goHome();
}

/**
 * Set the page elements' css width and height.
 *
 */
function setPageDimensions() {
    var bannerHeight = $('#headBannerHome').height();
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    var pageHeight = windowHeight;
    if ($('#expressHomeFrame .page-row').is(":visible")) {
        var expressPageHeight = 0;
        $('#expressHomeFrame .page-row').each(function() {
            expressPageHeight += $(this).outerHeight();
        });
        expressPageHeight += $('#expressHomeFrame .page-break-banner').outerHeight();
        pageHeight = Math.max(expressPageHeight + bannerHeight, windowHeight);
    }
    else if ($('#applicationHomeFrame .page-row').is(":visible")) {
        var applicationsPageHeight = 0;
        $('#applicationHomeFrame .page-row').each(function() {
            applicationsPageHeight += $(this).outerHeight();
        });
        pageHeight = Math.max(applicationsPageHeight + bannerHeight, windowHeight);
    }
    else if ($('#processFrame .page-row').is(":visible")) {
        var processPageHeight = 0;
        $('#processFrame .page-row').each(function() {
            processPageHeight += $(this).outerHeight();
        });
        pageHeight = Math.max(processPageHeight + bannerHeight, windowHeight);
    }

    $('.page').css("width", windowWidth + "px");
    $('.page').css("height",  pageHeight + "px");

    $('.task-view').css("width", windowWidth + "px");
    $('.task-view').css("height",  (windowHeight - bannerHeight) + "px");
}

/**
 * Set up the handling of browser back, forward & handling bookmark loading
 *
 * @param tabs
 * @param tabsLinkSelector
 */
function setUpHistory(tabs, tabsLinkSelector) {

    // Define our own click handler for the tabs, overriding the default.
    tabs.find( tabsLinkSelector ).click(function(){
        // Get the id of this tab widget.
        var id = $(this).closest( '.ui-tabs' ).attr( 'id' );

        // Get the index of the clicked tab.
        var index = $(this).parent().prevAll().length;
        pushState(id, index);
    });

    // Define our own click handler for the anchor elements to
    // prevent the default click behavior from directly opening the href.
    $("a").click(function(){ return false; });

    // Bind an event to window.onhashchange so that when the history state changes:
    // 1) selects the appropriate tab, changing the current tab as necessary.
    // 2) loads the express task OR loads the process view and/or loads the process task
    $(window).bind( 'hashchange', function(e) {
        tabs.each(function(){
            // Get the index for this tab widget from the hash, based on the appropriate id property.
            var selectedTabIndex = $.bbq.getState( this.id, true ) || 0;
            $('#navigationTabs').tabs("option", "active", selectedTabIndex);
        });

        // Get the hash (fragment), with any leading # removed, converted to an object
        var urlParams = $.deparam.fragment();
        if ((!urlParams.eTask && !urlParams.process  && !urlParams.pTask )) {
            var selectedTab = urlParams.navigationTabs || 0;
            restoreTab(selectedTab);
        }

        if (urlParams.eTask) {
            var elem = $('a[href="' + urlParams.eTask + '"]');
            if (elem.length > 0) {
                elem = elem[0];
            }
            if (!isTaskAlreadyShown('#taskFrame', urlParams.eTask)) {
                setBreadCrumbs(elem, 'eTask');
                setDisplayContainers('#taskFrame', urlParams.eTask);
            }
            setPageDimensions();
        }
        else if (urlParams.process) {
            var elem = $('a[href="' + urlParams.process + '"]');
            if (elem.length > 0) {
                elem = elem[0];
            }
            if (!isProcessAlreadyShown('#processFrame', urlParams.process)) {
                // setBreadCrumbs(elem, 'process');
                setDisplayContainers('#processFrame', urlParams.process);
            }

            if (urlParams.pTask) {
                elem = $('a[href="' + urlParams.pTask + '"]');
                if (elem.length > 0) {
                    elem = elem[0];
                }
                if (!isTaskAlreadyShown('#pTaskFrame', urlParams.pTask)) {
                    setBreadCrumbs(elem, 'pTask');
                    setDisplayContainers('#pTaskFrame', urlParams.pTask);
                }
                setPageDimensions();
            }
            else {
                $('#breadCrumbContainer').hide();
            }
        }
    });

    // Since the event is only triggered when the hash changes, we need to trigger
    // the event now, to handle the hash the page may have loaded with.
    $(window).trigger( 'hashchange' );
}

/**
 * True when the axvw displaySourceFile is the src attribute of the frame displayElementId
 *
 * @param displayElementId
 * @param displaySourceFile
 * @return {Boolean}
 */
function isTaskAlreadyShown(displayElementId, displaySourceFile) {
    var showing = false;
    var frameSrc = $(displayElementId).attr('src');
    if ((frameSrc && frameSrc.lastIndexOf('/') > 0 && frameSrc.substr(frameSrc.lastIndexOf('/') + 1) == displaySourceFile)) {

        showing = true;
    }

    return showing;
}

/**
 * True when the html displaySourceFile is the title attribute of the div displayElementId.
 * The div should then hold the html contained in the file.
 *
 * @param displayElementId
 * @param displaySourceFile
 * @return {Boolean}
 */
function isProcessAlreadyShown(displayElementId, displaySourceFile) {
    var showing = false;
    var frameSrc = $(displayElementId).attr('rel');
    if ((frameSrc && frameSrc.lastIndexOf('/') > 0 && frameSrc.substr(frameSrc.lastIndexOf('/') + 1) == displaySourceFile)) {

        showing = true;
    }

    return showing;
}

/**
 * Return the current hashChange state (peek at the hashChange stack)
 *
 * @return {Object}
 */
function getStateCopy() {
    // Set the state!
    var state = {};
    var currentState = $.bbq.getState();
    if (currentState.navigationTabs) {
        state.navigationTabs = currentState.navigationTabs;
    }
    if (currentState.role) {
        state.role = currentState.role;
    }
    if (currentState.process) {
        state.process = currentState.process;
    }
    if (currentState.taskFile) {
        state.taskFile = currentState.taskFile;
    }
    if (currentState.pTask) {
        state.pTask = currentState.pTask;
    }

    return state;
}

/**
 * Push a new state onto the history stack.
 * The new state is the old state with the single attribute added or modified.
 *
 * @param attribute
 * @param value
 */
function pushState(attribute, value) {
    var state = getStateCopy();
    state[ attribute ] = value;
    $.bbq.pushState( state );
}

/**
 * Return the navigation state to the navigation view of the first tab
 */
function goHome() {
    var url = window.location.href;
    var urlPrefix = url.substring(0,  url.lastIndexOf('archibus/') + 9);
    if (expressTabHtmlFragment) {
        loadQuasiFrameAndDisplay("#expressHomeFrame", expressTabHtmlFragment, urlPrefix);
    }
    restoreTab(0);
}
/**
 * Return the navigation state to the navigation view of the second tab
 */
function goApps() {
    var url = window.location.href;
    var urlPrefix = url.substring(0,  url.lastIndexOf('archibus/') + 9);
    if (applicationsTabHtmlFragment) {
        loadQuasiFrameAndDisplay("#applicationHomeFrame", applicationsTabHtmlFragment, urlPrefix); //"testAppTabPage.html", urlPrefix);//
    }
    restoreTab(1);
}

/**
 * Set the browser to the base page of a particular tab, saving the new state.
 * @param index
 */
function restoreTab(index) {
    $('.nav-pages').show();
    $('#processFrame').hide();
    $('#taskFrame').remove();
    $('#pTaskFrame').remove();
    $('#breadCrumbContainer').hide();
    $('#breadCrumbContent').find('.hovertip_wrap3').empty();

    var state = $.bbq.removeState('eTask', 'pTask', 'process');
    if (!state) { state = {}; }
    state[ 'navigationTabs' ] = index;
    $.bbq.pushState( state );

    $('#navigationTabs').tabs("option", "active", index);
    setPageDimensions();
}

/**
 * Set the browser to the base page of the first tab without saving state
 */
function resetViewsToHome() {
    $('.bread-crumb-list').remove();
    $('.nav-pages').show();
    $('.task-view').hide();
    $('#taskFrame').remove();
    $('#pTaskFrame').remove();

    // no state saved

    $('#navigationTabs').tabs("option", "active", 0);
}

/**
 * Set the value of the constant for the locale directory that is part of the generated file path.
 * @param locale
 * @param defaultLocale
 */
function setUserLocaleDirectory(afmUsersLocale, defaultLocale) {
    if (afmUsersLocale) {
        var locale = afmUsersLocale.toLowerCase() == "default" ?
            defaultLocale.replace("-", "").replace("_", "") :
            afmUsersLocale.replace("-", "").replace("_", "") ;
        LOCALE = locale;
        LOCALE_DIRECTORY = locale + "/";
    }
}

/**
 * Set the value of the constant for the role directory that is part of the generated file path.
 * @param roleName
 */
function setUserRoleDirectory(roleName) {
    ROLE_DIRECTORY = getRoleCamelCased(roleName) + "/";
}


/**
 * Set the tab fragment file names from the URL's query string
 * Not used yet!
 */
//function setFragmentFileNamesFromQueryString() {
//    var urlParameters = $.deparam.querystring();
//    if (urlParameters.roleName) {
//        setFragmentFileNamesFromRole(urlParameters.roleName);
//    }
//}

/**
 * Set the tab fragment file paths from the given role name
 * @param roleName
 */
function setFragmentFileNamesFromRole(roleName) {
    //var roleDirectory = getRoleCamelCased(roleName);
    var roleSuffix = getRoleDashed(roleName);

    expressTabHtmlFragment = FRAGMENT_DIRECTORY + LOCALE_DIRECTORY + ROLE_DIRECTORY + "express-home-" + roleSuffix +  ".html";
    applicationsTabHtmlFragment = FRAGMENT_DIRECTORY + LOCALE_DIRECTORY + ROLE_DIRECTORY + "applications-home-" + roleSuffix +  ".html";

    goHome();
}

/**
 * Return a string based on the role name removing whitespace and camelCasing the words.
 * Useful for making a directory name out of the role name.
 *
 * @param roleName
 * @return {String}
 */
function getRoleCamelCased(roleName) {
    var camelCasedRole = "";
    var words = roleName.split(" ");

    for (var i = 0; i < words.length; i++) {
        if (words[i].length == 1 && words[i].charAt(0) == '&') {
            continue;
        }
        if (words[i].charAt(0) == '(') {
            words[i] = words[i].substr(1);
        }
        var len = words[i].length;
        if (words[i].charAt(len - 1) == ')') {
            words[i] = words[i].substr(0, len - 1);
        }

        if (i == 0) {
            camelCasedRole = words[i].toLocaleLowerCase();
        }
        else {
            camelCasedRole += words[i].charAt(0).toLocaleUpperCase();
            camelCasedRole += words[i].substr(1).toLocaleLowerCase();
        }
    }

    return camelCasedRole;
}

/**
 * Return a string based on the role name removing whitespace and delimiting the words with hyphens.
 * @param roleName
 * @return {String}
 */
function getRoleDashed(roleName) {
    var words = roleName.toLocaleLowerCase().split(' ');
    var dashedRoleName = "";

    for (var i = 0; i < words.length; i++) {
        if (words[i].length == 1 && (words[i].charAt(0) == '&' || words[i].charAt(0) == '-')) {
            continue;
        }
        if (words[i].charAt(0) == '(') {
            words[i] = words[i].substr(1);
        }
        var len = words[i].length;
        if (words[i].charAt(len - 1) == ')') {
            words[i] = words[i].substr(0, len - 1);
        }

            dashedRoleName +=  (i == 0) ? words[i] : "-" + words[i];
        }

    return dashedRoleName;
}

/**
 * Scroll gently to the top of the page
 * @return {Boolean}
 */
function goToTop() {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
}

/**
 * Return the text of an element, with the <img /> element removed if it exists.
 * @param text
 * @return {*|String}
 */
function removeImgElemIfExists(text) {
    var imgIndex = text.indexOf("<img ");
    if (imgIndex >= 0) {
        var imgEndIndex = text.indexOf(">", imgIndex);
        text = text.substr(0, imgIndex) +  text.substr(imgEndIndex + 1);
    }

    return text.trim();
}

/**
 * Return the height between list items.
 * Useful for knowing when a favorite has been reordered.
 * @return {Number}
 */
function getFavListItemHeight() {
    var listElem = $('#favoritesBucket > ol > li:first-child');
    return parseFloat(listElem.css('line-height')) +
        parseFloat(listElem.css('margin-bottom')) + parseFloat(listElem.css('margin-top')) +
        parseFloat(listElem.css('padding-bottom')) + parseFloat(listElem.css('padding-top'));
}

/**
 * Load the div being used like a frame to hold an HTML snippet -- typically a display page.
 * Test that the container does not already hold the page.
 *
 * @param displayElementId
 * @param displaySourceFile
 * @param urlPrefix
 */
function loadQuasiFrameAndDisplay(displayElementId, displaySourceFile, urlPrefix) {
    var frameSrc = $(displayElementId).attr('rel');
    if (!frameSrc ||
        (frameSrc && frameSrc != displaySourceFile) ||
        (frameSrc && $(displayElementId).children().length == 0)) {
        var targetSrc = urlPrefix  + displaySourceFile;
        $(displayElementId).empty();
        $(displayElementId).attr('rel', displaySourceFile);
        $(displayElementId).load(targetSrc);
    }

    $(displayElementId).show(); //.siblings().hide();
}

/**
 * Display the axvw or html file of parameter_2 in the display container element of parameter_1,
 * show() the display element of parameter_1 and hide() all other display container elements
 *
 * @param displayElementId
 * @param displaySourceFile
 */
function setDisplayContainers(displayElementId, displaySourceFile) {
    var url = window.location.href;
    var urlPrefix = url.substring(0,  url.lastIndexOf('archibus/') + 9);

    if (displayElementId == '#processFrame') {
        loadQuasiFrameAndDisplay(displayElementId, FRAGMENT_DIRECTORY + LOCALE_DIRECTORY + ROLE_DIRECTORY + displaySourceFile, urlPrefix);
        $('.nav-pages').show();
        $('#navPagesApps').hide();
        $('#taskFrame').remove();
        $('#pTaskFrame').remove();
    }
    else if ((displayElementId == '#taskFrame' || displayElementId == '#pTaskFrame') && $(displayElementId).length == 1) {
        var frameSrc = $(displayElementId).attr('src');
        if (!frameSrc ||
            (frameSrc && frameSrc.lastIndexOf('/') > 0 && frameSrc.substr(frameSrc.lastIndexOf('/') + 1) != displaySourceFile)) {

            var test1 = frameSrc.substr(frameSrc.lastIndexOf('/') + 1);

            $(displayElementId).attr('src', urlPrefix  + displaySourceFile);
            $('.nav-pages').hide();
            $(displayElementId).show();
            $('#expressHomeFrame').hide();
        }
    }
    else if (displayElementId == '#taskFrame') {
        $('#tabPageExpressHome').prepend('<iframe class="task-view" id="taskFrame"></iframe>');
        $(displayElementId).attr('src', urlPrefix  + displaySourceFile);
        $('.nav-pages').hide();
        $(displayElementId).show();
        $('#expressHomeFrame').hide();
    }
    else if (displayElementId == '#pTaskFrame') {
        $('#processFrameParent').prepend('<iframe class="task-view" id="pTaskFrame"></iframe>');
        $(displayElementId).attr('src', urlPrefix  + displaySourceFile);
        $('.nav-pages').hide();
        $(displayElementId).show();
    }
}

/**
 * Open a selected task (or favorite),
 * loading the appropriate .axvw into the #taskFrame iframe
 * @param elem
 */
function openTask(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }

    var elemId = $(elem).id;
    var elementStyle = $(elem).attr('style');
    var eTaskFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    // Favorite tasks that have been dragged r.t. simply clicked don't get opened
    if (elemId && elemId.indexOf('favoriteFile_') == 0 && elementStyle != undefined && elementStyle.indexOf('left:') > 0 && elementStyle.indexOf('top:') > 0) {
        var isDraggedOutsideBucket = isElemOutsideBucket(elem, $('#favoritesBucket'));
        if (isDraggedOutsideBucket) {
            $(elem).parent().remove();
        }
        else if (isElemOrderChanged(elem, '#favoritesBucket')) {
            // TODO reorder element dragged above or below other element in favorite bucket
            reorderFavoriteTasks(elem, '#favoritesBucket');
        }
        else {
            returnElementToUndraggedPosition(elem);
        }
        return false;
    }

    if (eTaskFile && taskType) {
        setBreadCrumbs(elem, taskType);
        pushState(taskType, eTaskFile);
        setDisplayContainers('#taskFrame', eTaskFile);
        setPageDimensions();
    }

    return false;
}

/**
 * Open the selected process task,
 * loading the appropriate .axvw into the #pTaskFrame iframe
 * @param elem
 */
function openPtask(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }

    var pTaskFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    if (pTaskFile && taskType) {
        setBreadCrumbs(elem, taskType);
        pushState(taskType, pTaskFile);
        setDisplayContainers('#pTaskFrame', pTaskFile);
        setPageDimensions();
    }

    return false;
}

/**
 * Open the selected process,
 * loading the appropriate .html page into the #processFrame div
 * @param elem
 */
function openProcess(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }

    var processFile = $(elem).attr('href');
    var taskType = $(elem).attr('rel');

    if (processFile && taskType) {
        // setBreadCrumbs(elem, taskType);
        //processFile = FRAGMENT_DIRECTORY + LOCALE_DIRECTORY + ROLE_DIRECTORY + processFile;
        pushState(taskType, processFile);
        setDisplayContainers('#processFrame', processFile);
    }

    return false;
}

/**
 * Set the location of the breadCrumb dropdown according to the dimensions of the tabs
 */
function positionBreadCrumbs() {
    var tabsStart = 285;
    var padding = 30;
    var paddingLeft = parseFloat($('.ui-tabs-nav li').first().css('padding-left'));
    var paddingRight = parseFloat($('.ui-tabs-nav li').first().css('padding-right'));
    var tabsWidth = $('#tabLabelExpressHome').width() + $('#tabLabelApplication').width() + (2 * paddingLeft) + (2 * paddingRight);

    $('#breadCrumbContainer').css('left', tabsStart + tabsWidth + padding);
}

/**
 * Return the input phrase as a capitalized text phrase
 *
 * @param phrase
 * @return {String}
 */
function toCapitalized(phrase) {
    var phraseWords = phrase.toLowerCase().split(' ');
    var capPhrase = '';
    for (var i = 0, word; word = phraseWords[i]; i++) {
        if (word.trim().length > 0) {
            capPhrase += word.charAt(0).toUpperCase() + word.substr(1) + ' ';
        }
    }

    return capPhrase.trim();
}

/**
 * Construct and attach the bread crumb select element to the banner task element & show it
 *
 * @param taskElement
 * @param taskType
 */
function setBreadCrumbs(taskElement, taskType) {
    // test whether breadcrumbs already exist, as when using history back/forward
    var breadCrumbList = $('#breadCrumbContent').find('ol');
    var breadCrumbsExist = breadCrumbList.length > 0;

    // when breadcrumbs don't already exist, create and append a select element with tasks's siblings
    if (!breadCrumbsExist) {
        // get taskFileName for link's id e.g., id="taskFile_ab-ex-rpt-grid.axvw" or id="favoriteFile_ab-ex-rpt-grid.axvw"
        var taskName = removeImgElemIfExists(taskElement.innerHTML);
        // div to which tip html is appended
        var target = $('#breadCrumbContent').find('.hovertip_wrap3');

        var appTitleElems = $(taskElement).parents('.bucket-process').siblings('.application-process-title').filter(":first");
        if (appTitleElems && appTitleElems.length > 0) {
            target.append('<div class="bread-crumb-application-title">' + toCapitalized(appTitleElems.text()) + '</div>');
        }

        var procTitleElems = $(taskElement).parents('.bucket-wrapper').siblings('.process-title').filter(":first");
        if (procTitleElems && procTitleElems.length > 0) {
            target.append('<div class="bread-crumb-process-title">' + procTitleElems.text() + '</div>');
        }

        var taskTree = $(taskElement).parents('.bucket-wrapper').find('ol.pTask-labels');
        if (taskTree.length > 0) {
            // TODO append divs for multi-page navi
            for (var j = 0; j < taskTree.length; j++) {
                var pTaskGroup = $(taskTree[j]).clone();
                $(pTaskGroup).removeClass('pTask-labels').addClass('bread-crumb-pTask-label');
                $(pTaskGroup).find('.process-tasks').removeClass('process-tasks').addClass('bread-crumb-process-tasks');
                target.append($(pTaskGroup).first());
            }
        }
        else {
            // get link's sibling links' innerHTML text & link id for breadCrumbs
            var taskLabels = [];
            var taskViewFileNames = [];
            getSiblingTaskLabelsAndLinkIds(taskElement, taskLabels, taskViewFileNames);
            // form select element with options for each sibling task as breadCrumbs
            if (taskLabels.length > 1) {
                target.append(createListElementFromTaskSiblings(taskLabels, taskViewFileNames, taskName, taskType));
            }
        }

        $('#breadCrumbContent').find('a').click(function(){return false;});
    }

    $('#breadCrumbContainer').show();
}

/**
 * Return the name of an AXVW file stripped of any prepending list identifier
 * @param elementId
 * @return {*}
 */
function getTaskFileNameFromId(elementId) {
    var taskFileName = elementId;
    if (elementId.indexOf('taskFile_') == 0 || elementId.indexOf('pTaskFile_') == 0 || elementId.indexOf('favoriteFile_') == 0) {
        taskFileName = elementId.substring(elementId.indexOf('_') + 1);
    }

    return taskFileName;
}

/**
 * Modify the two last parameters to hold the first paramenter's
 * 1) sibling innerHTML task labels
 * 2) sibling link ids
 * @param element -- selected link element
 * @param taskLabels -- Array, targeted for sibling task labels
 * @param linkIds -- Array, targeted for siblink link ids
 */
function getSiblingTaskLabelsAndLinkIds(element, taskLabels, linkIds) {
    var taskListItem = $(element).parent();
    // list of all <ul> nodes' child <a> nodes
    var taskSiblingLinkItems = $(taskListItem).parent().parent().children('ol').children().children();

    // iterate of possibly longer list
    for (var i = 0; i < taskSiblingLinkItems.length; i++) {
        var itemLabel = removeImgElemIfExists(taskSiblingLinkItems[i].innerHTML);
        if (taskLabels.indexOf(itemLabel) < 0) {
            taskLabels.push(itemLabel);
            linkIds.push($(taskSiblingLinkItems[i]).attr('href'));
        }
    }
}

/**
 * return a <ul /> element with its <li /> elements for displaying the sibling tasks
 *
 * @param taskLabels - list of item labels, possibly longer than taskViewFileNames
 * @param taskViewFileNames -- list of item links (items with a label of <hr> get no link
 * @param taskName -- currently selected task
 * @param taskType
 * @return {String}
 */
function createListElementFromTaskSiblings(taskLabels, taskViewFileNames, taskName, taskType) {
    var listElem = '<ul class="bread-crumb-list">';

    for (var j = 0; j < taskLabels.length; j++) {
        listElem += '<li class="bread-crumb-link"><a href="' + taskViewFileNames[j] + '" rel="' + taskType + '">' + taskLabels[j] + '</a></li>';
    }
    listElem += '</ul>';

    return listElem;
}

/**
 * Handle the onChange event for the express tab's breadcrumb dropdown
 * Open the selected task in the task view
 * @param elem
 */
function expressBreadCrumbSelectChanged(elem, event) {
    event = event || window.event;
    if (event) {
        elem = event.target || event.srcElement;
    }

    $('#breadCrumbContent').hide();

    var taskType = elem.rel;
    var url = window.location.href;
    var locationIndex = url.lastIndexOf('archibus/');
    var href = elem.href;
    if (href.lastIndexOf('/') > 0) {
        href = href.substr(href.lastIndexOf('/') + 1);
    }

    if ((taskType == 'eTask' || taskType == 'pTask') && locationIndex > 0) {
        var frameId = (taskType == 'eTask') ? 'taskFrame' : 'pTaskFrame';
        var selector = '#' + frameId;
        var parentSelector = (taskType == 'eTask') ? '#tabPageExpressHome' : '#processFrameParent';
        $(selector).remove();
        $(parentSelector).prepend('<iframe class="task-view" id="' + frameId + '"></iframe>');

        $(selector).attr('src', url.substring(0, locationIndex + 9) + href);
        pushState(taskType, href);
        setPageDimensions();
    }
    else if (taskType == 'process' && locationIndex > 0) {
        var targetSrc = window.location.href.substring(0, locationIndex + 9)  + FRAGMENT_DIRECTORY + href;
        $('#processFrame').empty();
        $('#processFrame').load(targetSrc);
        $('#processFrame').show();
        $('#taskFrame').remove();
        $('#pTaskFrame').remove();
    }
    //$('#breadCrumbContainer').show();
}

/**
 * True when the element is positioned outside the bucket boundaries
 * @param bucketSelector
 * @param element
 * @return {Boolean}
 */
function isElemOutsideBucket(element, bucketSelector) {
    var favOffset = bucketSelector.offset();
    var favWidth = bucketSelector.css('width');
    var favHeight = bucketSelector.css('height');
    //var selectedOffset = selectedItem.offset();
    var selOffset = $(element).offset();

    var isOutside = false;
    // if selOffset(left, top) is outside favOffset_left, favOffset_top, favOffset_left + favWidth, favOffset_top + favHeight then return true
    if ((selOffset.left < favOffset.left || selOffset.left > favOffset.left + favWidth) ||
        (selOffset.top < favOffset.top || selOffset.top > favOffset.top + favHeight)) {
        isOutside = true;
    }

    return isOutside;
}

/**
 * True when the position of the element is between any existing list items,
 * or above or below all of them.
 * @param element
 * @param bucketId -- used in forming selectors
 * @return {Boolean}
 */
function isElemOrderChanged(element, bucketId) {
    var isReordered = false;
    var topPos = parseFloat($(element).css('top'));
    if (topPos > favoriteListLineHeight || topPos < -1.0 * favoriteListLineHeight) {
        isReordered = true;
    }

    return isReordered;
}

/**
 * Re-Order the favorites list by copying the collection of <li> elements,
 * emptying the ordered list and readding the items.
 *
 * @param element
 * @param bucketId
 */
function reorderFavoriteTasks(element, bucketId) {
    var topPos = parseFloat($(element).css('top'));
    var positionShift = (topPos / favoriteListLineHeight) >= 0 ?
        Math.floor(topPos / favoriteListLineHeight) :
        Math.ceil(topPos / favoriteListLineHeight);

    returnElementToUndraggedPosition(element);

    var items = $(bucketId + ' li');
    var selectedItem = $(element).parent();
    var selectedIndex = items.index(selectedItem);
    var selectedItemNewIndex = selectedIndex + positionShift;

    // TODO instead of below, can I remove the item and insert it in different location in list?

    var reorderedList = [];
    for (var i = 0; i < items.length; i++) {
        if (i != selectedIndex) {
            reorderedList.push(items[i]);
        }
    }
    reorderedList.splice(selectedItemNewIndex, 0, selectedItem[0]);

     $('#favoritesBucket > ol').empty();
     for (var i = 0; i < reorderedList.length; i++) {
        $('#favoritesBucket > ol').append(reorderedList[i]);
     }

    $('.favorite-items > li > a').draggable();
    $('#favoriteDropTarget').droppable({drop: handleTaskDropEvent, tolerance: "touch"});
}

/**
 * Remove any css left and top values from an element's style attribute.
 * @param element
 */
function returnElementToUndraggedPosition(element) {
    var elementStyle = $(element).attr("style");

    var indexStart = elementStyle.indexOf('left:');
    var indexEnd = elementStyle.indexOf(';', indexStart);
    elementStyle = elementStyle.substr(0, indexStart) + elementStyle.substr(indexEnd + 2);

    indexStart = elementStyle.indexOf('top:');
    indexEnd = elementStyle.indexOf(';', indexStart);
    elementStyle = elementStyle.substr(0, indexStart) + elementStyle.substr(indexEnd + 2);

    $(element).attr("style", elementStyle);
}

/**
 * The first time the search box is selected, remove the instruction text
 * and change the text color to the user's search text color rather than the instruction text color
 * @param elem
 */
function onSearchBoxSelect(elem) {
    // clear the text & reset the color
    var val = elem.value;
    if (val == "Find a form or report") {
        elem.value = "";
    }

    // TODO change this hard-coded color to a css variable
    $('#searchText').css("color", "black")
}

/**
 * Handle the view / file search key event.
 * When the CRLF key is pressed while the input is focused begin the search process.
 * @param evt
 */
function onSearchBoxKeyPress(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    if (charCode == 13) {
        var  searchText = $('#searchText').val().trim();
        if (searchText.length > 0) {
            if (Ab.workflow.Workflow.sessionTimeoutDetected) {
                $('#searchDialog').on( "dialogbeforeclose", function( event, ui ) {window.location = context.logoutView;} );
                $('#searchDialog').html('Session has timed out. Please sign in again in order to perform search.');
            }
            else {
                var results = formatSearchResults(getViewsByName(searchText));

                if (results && results.count > 0) {
                    $('#searchDialog').dialog( 'option', 'height', Math.max(300 , 50 * Math.min(results.count, 10)));
                    $('#searchDialog').on( "dialogbeforeclose", function( event, ui ) {return true;} );
                    $('#searchDialogTitleInput').attr('value', searchText );
                    $('#searchDialog').html(results.formattedSearchResults);
                }
                else {
                    $('#searchDialog').html('No results.');
                }
            }
            // Do search now
            $('#searchDialog').dialog('open');
            // reinitialize the hovertips now that new targets are added to the DOM
            window.setTimeout(hovertipInit, 100);
        }
        else {
            // alert("Searching on an empty string?");
        }
    }
    else {
        //alert("Key " + charCode + " was pressed down");
    }
}

/**
 * Close the search dialog.
 * Independent function to allow inclusion in building html text
 */
function closeSearchDialog() {
    $('#searchDialog').dialog('close');
}

/**
 * Return a set of ptask records holding info for the views LIKE '%[finterText]%'
 * @param filterText
 * @return {*}
 */
function getViewsByName(filterText) {
    var parameters = {
        viewName: 'ab-express-search-datasource.axvw',
        dataSourceId: 'taskSearch_ds',
        groupIndex: 0,
        version: '2',
        restriction: "afm_ptasks.task_type <> 'LABEL' AND afm_ptasks.task_id LIKE '%" + filterText +
            "%' AND (afm_ptasks.hot_user_name = '" + loggedInUser + "' OR afm_ptasks.hot_user_name IS NULL)",
        useHierarchicalSecurityRestriction: true
    };

    try {
        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
            return false;
        }
        else if (result.data) {
            return result.data;
        }
    }
    catch (e) {
        Workflow.handleError(e);
        return false;
    }
}

/**
 * Return the search results formatted for the dialog
 *
 * @param resultsData
 * @return {Object}
 */
function formatSearchResults(resultsData) {
    var htmlText = '<ul class="search-results" onMouseUp="closeSearchDialog();goApps();openPtask(this, event);">';

    if (resultsData.records.length >= 1) {
        for (var i = 0, record; record = resultsData.records[i]; i++) {
            htmlText += '<li><a class="hovertip_target" href="' + record["afm_ptasks.task_file"] + '" rel="pTask" id="searchResult_'+ i + '">';
            htmlText += record["afm_ptasks.task_id"];
            htmlText += '</a>';

            htmlText += '<div class="hovertip" target="searchResult_'+ i + '">';
            htmlText += '<span class="search-tip-title">Task info about this selected task, but where does it come form? TBD... </span><br>';
            htmlText += '<ul><li><span class="search-tip-item-title">Domain: </span>' + record["afm_ptasks.icon_small"] + '</li>';    // icon_small is used to hold product title
            htmlText += '<li><span class="search-tip-item-title">Application: </span>' + record["afm_ptasks.activity_id"] + '</li>';  // activity_id is used to hold activity title
            htmlText += '<li><span class="search-tip-item-title">Process: </span>' + record["afm_ptasks.process_id"] + '</li>';  // process_id is used to hold process title
            htmlText += '</ul>';
            htmlText += '</div>';

            htmlText += '</li>';
        }
    }
    htmlText += '</ul>';

    if (resultsData && resultsData.hasMoreRecords) {
        htmlText += 'More values exist'
    }

    // disable default link functionality
    htmlText += '<script >$("ul.search-results > li > a").click(function(){return false;});</script>';

    return {formattedSearchResults: htmlText, count: resultsData.records.length}  ;
}

/**
 * Set the express navigation tab label to the selected element's inner html.
 * Set the tab's content to the element's href
 *
 * @param elem
 * @param event
 */
function changeExpressNav(elem, event) {
    var newNav = elem.innerHTML;
    newNav = newNav.toUpperCase();
    $('#tabLabelExpressHome').html(newNav);

    // reposition tasks dropdown for new tab label
    positionBreadCrumbs();

    // TODO Set the tab's content to the element's href
}

/**
 *  Append elements to the banner menu element that show the current user's name, role, project, etc.
 *
 * @param userInfo
 */
function setUserHeader(userInfo) {
    if (userInfo && userInfo.name) {
        var tblHTML = '<table class="profile-menu" id="profileMenuTable">' +
            '<tr><td class="profile-item-title">Project:</td></tr>' +
            '<tr><td>' + userInfo.projectName + '</td></tr>' +
            '<tr><td class="profile-item-title">Role:</td></tr>' +
            '<tr><td>' + userInfo.role + '</td></tr>' +
            '<tr><td style="height:1px;"></td></tr>' +
            '<tr><td><a id="myProfileMenuLink" href="ab-my-user-profile.axvw" onClick="openTask(this, event);" rel="eTask">My Profile</a></td></tr>' +
            '<tr><td><a id="myJobsMenuLink" href="ab-my-jobs.axvw" onClick="openTask(this, event);" rel="eTask">My Jobs</a></td></tr>' +
            '<tr><td style="height:1px;"></td></tr>' +
            '<tr><td><a href="space-ops-express.html" rel="express" onclick="changeExpressNav(this,event)">Express Home</a></td></tr>' +
            '<tr><td><a href="re-director-express.html" rel="express" onclick="changeExpressNav(this,event)">Real Estate Director</a></td></tr>' +
            '<tr><td><a href="fm-manager-express.html" rel="express" onclick="changeExpressNav(this,event)">FM Manager</a></td></tr>' +
            '</table></div>';

        $('#bannerMenu').append('<a id="bannerMenuUserLink">' + userInfo.name + ' <b class="caret"></b></a>' +
            '<div class="hovertip" target="bannerMenuUserLink">' + tblHTML + '</div>');

        // disable default <a/> behavior
        $('a#bannerMenuUserLink').click(function(){return false;});
        $('#profileMenuTable a').click(function(){return false;});
    }
}


/**
 * Return the current user's name & role
 *
 * @return object containing user info or false
 */
function getUserInfo() {
    var parameters = {
        viewName: 'ab-express-navigator-datasource.axvw',
        dataSourceId: 'userRole_ds',
        groupIndex: 0,
        version: '2',
        useHierarchicalSecurityRestriction: true
    };

    try {
        var result = Ab.workflow.Workflow.call('AbCommonResources-getAugmentedDataRecords', parameters);
        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
            return {'name': "timeout", 'role': "timeout"};
        }
        else
        if (result.data && result.data.records.length == 1) {
            var record = result.data.records[0];
            loggedInUser = record["afm_users.user_name"];
            return {'name': loggedInUser, 'role': record["afm_users.role_name"], 'projectName': result.data.projectName,
                'locale': record["afm_users.locale.raw"], 'defaultLocale': result.data.defaultLocale}
        }
        return false;
    }
    catch (e) {
        Workflow.handleError(e);
        return false;
    }
}

function doSignOut() {
    // if session timeout has been detected
    if (Ab.workflow.Workflow.sessionTimeoutDetected) {
        // go directly to the signout view and do not call the service
        window.location = context.logoutView;
        return;
    }

    // check if there are any running jobs for this user
    var jobs = Workflow.getJobStatusesForUser();
    var running = false;
    for (var i in jobs) {
        if (jobs[i].jobFinished === false && jobs[i].jobStatusCode !== 8) {
            running = true;
        }
    }

    if (running) {
/*
        // warn the user and allow to cancel the sign out
        var message = getLocalizedString(context.z_SIGNOUT_JOBS_MESSAGE);
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.doLogout();
            }
        });
*/

    } else {
        this.doLogout();
    }
}

/**
 * Performs the sign out action.
 */
function doLogout() {
    SecurityService.logout({
        callback: function(x, y, z) {
            loggedInUser = '';
            window.location = context.logoutView;
        },
        errorHandler: function(message, e) {
            // DWR has its own session timeout check which may bypass our server-side timeout check
            if (message == 'Attempt to fix script session' || message.indexOf('expired') != -1) {
                window.location = context.logoutView;
            } else {
                //View.showException(e);
            }
        }
    });
}

/**
 * Configure the search dialog
 */
function setUpSearchDialog() {
    $('#searchDialog').dialog({ modal: true, autoOpen: false//, buttons: {'Close': function(){$( this ).dialog("close");}}
    });
    $('#searchDialog').dialog( 'option', 'position', {my:"right+10 top-10",at:"right top",of:"#searchText"});
    $('#searchDialog').dialog( 'option', 'width', 500);
    $('.ui-dialog-title').after('<input type="text" id="searchDialogTitleInput" class="search-text" readonly="readonly" style="float:right;width:240px;">');
}

