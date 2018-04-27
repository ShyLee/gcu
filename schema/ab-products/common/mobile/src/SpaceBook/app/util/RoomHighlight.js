Ext.define('SpaceBook.util.RoomHighlight', {
    singleton: true,

    updateSurveyPlanHighlights: function (record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id');

        me.getModifiedRoomCodesForFloor(blId, flId, function (roomCodes) {
            Ext.each(roomCodes, function(code) {
                var roomElement = Ext.fly(code),
                    currentFill = roomElement.getStyle('fill');

                if (currentFill !== '#ffcc66') {
                    roomElement.set({defaultFill: currentFill});
                }
                roomElement.setStyle('fill', '#ffcc66');
                roomElement.set({modified: true});
            });
        }, me);
    },

    getModifiedRoomCodesForFloor: function (blId, flId, onCompleted, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            roomCodes = [],
            filters = [];

        filters.push( new Ext.util.Filter({
            property: 'bl_id',
            value: blId
        }));

        filters.push( new Ext.util.Filter({
            property: 'fl_id',
            value: flId
        }));

        filters.push( new Ext.util.Filter({
            property: 'surveyEdit',
            value: true
        }));

        console.log('[DEBUG] ----------> Start getModifiedRoomCodesForFloor ' + new Date() + ' <----------');
        roomSurveyStore.retrieveAllStoreRecords(filters, function(records) {
            Ext.each(records, function (record) {
                roomCodes.push(record.get('bl_id') + ';' + record.get('fl_id') + ';' + record.get('rm_id'));
            }, me);
            if (typeof onCompleted === 'function') {
                console.log('[DEBUG] ----------> End getModifiedRoomCodesForFloor ' + new Date() + ' <----------');
                onCompleted.call( scope || me, roomCodes);
            }
        },me);
    },

    getModifiedRoomCodes: function (onCompleted, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            roomCodes = [],
            filter = new Ext.util.Filter({
                    property: 'surveyEdit',
                    value: true
                });

        console.log('-----> Start getModifiedRoomCodes ' + new Date() + ' <-----------');
        roomSurveyStore.retrieveAllStoreRecords(filter, function(records) {
            Ext.each(records, function (record) {
                var data = record.getData();
                roomCodes.push({
                    surveyId: data.survey_id,
                    blId: data.bl_id,
                    flId: data.fl_id,
                    rmId: data.rm_id
                });
            });
            if (typeof onCompleted === 'function') {
                console.log('-----> End getModifiedRoomCodes ' + new Date() + ' <-----------');
                onCompleted.call(scope || me, roomCodes, roomSurveyStore);
            }
        },me);
    },

    /**
     * Resets the highlighted room records back to the original fill
     * when the survey is Completed or Closed
     */
    resetRoomHighlights: function (onCompleted, scope) {
        var me = this,
            roomElements;

        roomElements = Ext.select('[modified=true]');
        Ext.each(roomElements.elements, function (element) {
            var defaultFill = element.getAttribute('defaultFill');
            element.style.fill = defaultFill;
            element.setAttribute('modified', false);
        });

        // Get all of the highlighted room survey records and reset the surveyEdit fields.
        me.getModifiedRoomCodes(function (records, store) {
            Ext.each(records, function(record) {
                record.set('surveyEdit', false);
            }, me);

            store.sync(function() {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            });
        }, me);
    }
});