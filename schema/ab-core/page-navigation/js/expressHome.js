/**
 * Methods specific to the express home page, to be run when page is loaded.
 */

/**
 * Height between lines in the Favorties task list.
 * Necessary to know when one item has been dragged above or below another to reorder the list.
 * @type {Number}
 */
var favoriteListLineHeight = 0;

/**
 * Initialize the drag and drop elements
 */
function initDandDFavorites() {
    $('.process-tasks > li > a').draggable({cursor: 'move', helper: 'clone'});
    $('.process-toppicks > li > a').draggable({cursor: 'move', helper: 'clone'});
    $('#favoriteDropTarget').droppable({drop: handleTaskDropEvent, tolerance: "touch"});
}

/**
 * Handle the event of a task being dropped on the favorites target
 * @param evt
 * @param ui
 */
function handleTaskDropEvent (evt, ui) {
    var draggable = ui.draggable;
    var viewFileName = draggable.attr("href");

    // if dropped task is already a favorite, ignore
    var existingFavorites = $('#favoritesBucket > div.bucket-wrapper > ol > li > a');
    for (var i = 0, existingFav; existingFav = existingFavorites[i]; i++) {
        if (viewFileName == $(existingFav).attr("href")) {
            return;
        }
    }

    var draggedTaskName = removeImgElemIfExists(draggable.html());
    $('#favoriteDropTarget').before('<li><a href="' + viewFileName + '" rel="eTask">' + draggedTaskName + '</a></li>');

    //$('.favorite-items > li > a').draggable();
    $('.favorite-items > li > a').click(function(){ return false; });

    // TODO save the favorite list and its order.
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

