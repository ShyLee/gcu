/**
 * Implements auto-complete for validated text fields. Requires jQuery UI Autocomplete plug-in.
 */
Ab.form.AutoComplete = Base.extend({

    /**
     * Adds auto-complete for validating fields in specified form panel.
     * @param panel The form panel.
     */
    addAutoCompleteToFormFields: function(panel) {
        var nFields = 0,            // number of form fields
            fieldNames = [],        // names of form fields
            selectFieldNames = [],  // names of select fields in the query
            queryFieldName = '',    // name of the select field for which the user types the value
            showImages = false;     // whether to display images in the drop-down

        // creates restriction: parent form field values + query
        var getAutoCompleteRestriction = function(query) {
            var restriction = new Ab.view.Restriction();

            // add parent field values
            for (var f = 0; f < nFields; f++) {
                if (selectFieldNames[f] !== queryFieldName) {
                    var value = panel.getFieldValue(fieldNames[f]);
                    if (valueExistsNotEmpty(value)) {
                        restriction.addClause(selectFieldNames[f], value);
                    }
                }
            }

            // KB 3038599: Oracle is case-sensitive
            query = query.toUpperCase();

            // add user query string
            if (valueExistsNotEmpty(query)) {
                if (query === '?') {
                    // do not apply the query restriction, show all available values
                } else if (queryFieldName.indexOf('em_id') == -1) {
                    // get values that begin with user query string
                    restriction.addClause(queryFieldName, query, 'LIKE');
                } else {
                    // for employee names, also get values where the first name begins with user query string
                    // e.q. typing 'EL' returns both 'ELLIS, TERRY' and 'PARKER, ELLEN'
                    restriction.addClause(queryFieldName, query + '%', 'LIKE', ')AND(');
                    restriction.addClause(queryFieldName, '%, ' + query + '%', 'LIKE', ')OR(');
                }
            }

            return restriction;
        };

        // called by auto-complete to load values based on user's query
        var autoCompleteSource = function(fieldId, request, response) {
            var query = request.term,
                field = panel.fields.get(fieldId),
                command = field.actions.get(0).config.commands[0];

            fieldNames = _.map(command.fieldNames.split(','), function(name) {
                return name.trim();
            });
            selectFieldNames = _.map(command.selectFieldNames.split(','), function(name) {
                return name.trim();
            });
            _.each(fieldNames, function(fieldName, index) {
                if (fieldName === fieldId) {
                    queryFieldName = selectFieldNames[index];
                }
            });
            nFields = fieldNames.length;
            showImages = false;

            var selectTableName = queryFieldName.split('.')[0],
                entries = [];

            var dataSource = valueExistsNotEmpty(command.dataSource) ?
                View.dataSources.get(command.dataSource) :
                Ab.data.createDataSourceForFields({
                    id: panel.id + '_' + fieldId + '_autoComplete',
                    tableNames: [selectTableName],
                    fieldNames: selectFieldNames
                });
            dataSource.recordLimit = command.recordLimit;
            var restriction = getAutoCompleteRestriction(query);
            var records = dataSource.getRecords(restriction, {
                isDistinct: true
            });

            if (nFields > 0) {
                // for each record in the data set
                for (var r = 0; r < records.length; r++) {
                    // add child entry with parent fields
                    var entry = {};
                    for (var f = 0; f < nFields; f++) {
                        var value = records[r].getValue(selectFieldNames[f]);
                        entry[selectFieldNames[f]] = value;
                    }
                    for (var i = 0; i < selectFieldNames.length; i++) {
                        if (selectFieldNames[i].indexOf('image_file') != -1) {
                            showImages = true;
                            var imageFile = records[r].getValue(selectFieldNames[i]);
                            if (imageFile) {
                                entry.imageFile = imageFile;
                            }
                        }
                    }
                    entries.push(entry);
                }
            } else {
                // assemble flat list of values
                for (var r = 0; r < records.length; r++) {
                    var value = records[r].getValue(selectFieldNames[0]);
                    entries.push(value);
                }
            }

            response(entries);
        };

        // called by auto-complete to format an item
        var autoCompleteFormatter = function(fieldId, ul, item) {
            // the child value to select
            var child = item[queryFieldName];

            var parents = '';
            for (var f = 0; f < nFields; f++) {
                if (selectFieldNames[f] !== queryFieldName) {
                    var value = item[selectFieldNames[f]];
                    if (valueExists(value)) {
                        if (parents !== '') {
                            parents += ':';
                        }
                        parents += value;
                    }
                }
            }

            // add image if the item has the image_file field
            var style = '';
            if (showImages) {
                style = 'height:50px; padding-left: 54px;';
                if (item.imageFile) {
                    style += 'background: url(' + View.getBaseUrl() + '/projects/hq/graphics/' + item.imageFile.toLowerCase() + ') no-repeat;';
                    style += 'background-position: left center;';
                    style += 'background-size: 50px;';
                }
            }

            var html = '<a style = "' + style + '">' + child + '</a><span>' + parents + '</span>';

            return jQuery("<li></li>")
                .data('item.autocomplete', item)
                .append(html)
                .appendTo(ul);
        };

        // called by auto-complete when the user selects a value
        var autoCompleteSelectListener = function(event, ui) {
            var value = ui.item[queryFieldName];
            if (value) {
            	var listener = panel.getEventListener('onAutoCompleteSelect');
                // fill in parent form field values
                for (var f = 0; f < nFields; f++) {
                    panel.setFieldValue(fieldNames[f], ui.item[selectFieldNames[f]]);
                    if (listener) {
                    	listener(panel, fieldNames[f], ui.item[selectFieldNames[f]]);
                    }
                }
            }
            event.preventDefault();
        };

        // called by auto-complete when the user modifies the query
        var autoCompleteSearchListener = function(event, ui) {
            var listener = panel.getEventListener('onAutoCompleteQuery');
            if (listener) {
                listener(panel, event, event.target.value);
                // cancel the event
                return false;
            }
        };

        // called by auto-complete when the user clears the query
        var autoCompleteClearListener = function(event) {
            var listener = panel.getEventListener('onAutoCompleteClear');
            if (listener) {
                listener(panel, event);
            }
        };

        // called by auto-complete when the menu opens; sets the menu z-index to be on top of the parent dialog
        var autoCompleteOpenListener = function(event, ui) {
            var menuWidget = jQuery(event.target).autocomplete('widget');
            menuWidget.context.style.zIndex = 9999;
        };

        // attach auto-complete plug-in to text fields
        panel.fields.each(function(field) {
            var fieldDef = field.fieldDef;
            var fieldElement = panel.getFieldElement(fieldDef.id);
            var fieldInput = jQuery(fieldElement);

            if (fieldElement && !fieldDef.isDate) {

                var action = field.actions.get(0);
                if (action && action.command) {
                    var command = action.command.commands[0];
                    if (command && command.type == 'selectValue' && command.autoComplete) {

                        // attach the plug-in to the input
                        fieldInput.autocomplete({
                            minLength: command.minLength,
                            delay: 250,
                            source: function(request, response) {
                                autoCompleteSource(fieldDef.id, request, response);
                            },
                            select: autoCompleteSelectListener,
                            search: autoCompleteSearchListener,
                            clear: autoCompleteClearListener,
                            open: autoCompleteOpenListener,
                            position: { collision: 'flip' }
                        });

                        var data = fieldInput.data('autocomplete');
                        data._renderItem = function(ul, item) {
                            return autoCompleteFormatter(fieldDef.id, ul, item);
                        };

                        if (command.minLength === '0') {
                            command.handle = function(context) {
                                if (fieldInput.autocomplete('widget').is(':visible') ) {
                                    fieldInput.autocomplete('close');
                                } else {
                                    fieldInput.autocomplete('search', fieldInput.val());
                                    fieldInput.focus();
                                }
                            }
                        }
                    }
                }
            }
        });
    }
});