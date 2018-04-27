StartTest(function (t) {
    t.requireOk('Common.service.MobileSyncServiceConversionUtils', 'Common.model.ModelBase', function () {

        // Create a Model
        Ext.define('TestModel', {
            extend: 'Common.model.ModelBase',

            config: {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'field1', type: 'string'},
                    {name: 'field2', type: 'float'},
                    {name: 'field3', type: 'DateClass'},
                    {name: 'field4', type: 'TimeClass'},
                    {name: 'field5', type: 'IntegerClass'}
                ]
            }
        });
        var model = Ext.create('TestModel');

        model.setData({
            'id': 1,
            'field1': 'Field 1',
            'field2': 99.2,
            'field3': '2001-01-01 12:23',
            'field4': '12:35:44',
            'field5': 22
        });

        // Convert a single model to server side object
        var convertedRecord = Common.service.MobileSyncServiceConversionUtils.convertRecordForServer(model);

        // The converted record is a fieldValues array that contains objects of fieldName and fieldValue for each field in the model.

        t.is(convertedRecord.fieldValues[0].fieldName, 'field1', 'Field 1 name matches.');
        t.is(convertedRecord.fieldValues[1].fieldName, 'field2', 'Field 2 name matches.');
        t.is(convertedRecord.fieldValues[2].fieldName, 'field3', 'Field 3 name matches.');
        t.is(convertedRecord.fieldValues[3].fieldName, 'field4', 'Field 4 name matches.');
        t.is(convertedRecord.fieldValues[4].fieldName, 'field5', 'Field 5 name matches.');


        // Verify the fieldValues
        t.is(convertedRecord.fieldValues[0].fieldValue, 'Field 1', 'Field 1 value matches');
        t.is(convertedRecord.fieldValues[1].fieldValue, 99.2, 'Field 2 value matches');
        t.is(convertedRecord.fieldValues[2].fieldValue.getValue(), new Date(2001, 0, 1), 'Field 3 value matches');
        t.is(convertedRecord.fieldValues[3].fieldValue.getValue(), new Date(1970, 0, 1, 12, 35, 44), 'Field 4 value matches');
        t.is(convertedRecord.fieldValues[4].fieldValue.getValue(), 22, 'Field 5 value matches');


        t.done();
    });

});