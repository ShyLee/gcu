StartTest(function (t) {
    t.requireOk('Common.model.ModelBase', function () {

        Ext.define('TestModel', {
            extend:'Common.model.ModelBase',

            config:{
                fields:[
                    {name:'id', type: 'int'},
                    {name:'dateField', type:'dateclass'}
                ]
            }
        });
        var dateField;
        var testModel = new TestModel();
        var dt,convertedDate;

        // Verify model field type
        var dateFieldType = testModel.getFields().map['dateField'].getType().type;
        t.ok(dateFieldType === 'DateClass', 'Field is type DateClass');

        // Verify a Date input

        dt = new Date(2012, 3, 28, 14, 16, 33);  // 2012-04-28 14:16:33
        convertedDate = new Date(2012, 3, 28, 0, 0, 0, 0);  // Dates stored in the model do not have a time component

        testModel.set('dateField', dt);

        var fieldValue = testModel.get('dateField');
        t.isDateEqual(fieldValue, convertedDate, 'Date values match');

        // Verify the parsing of the input
        testModel.set('dateField', '2012-04-28');
        fieldValue = testModel.get('dateField');
        t.isDateEqual(fieldValue, convertedDate, 'Date values match');

        testModel.set('dateField', '2012-04-28 12:44:23');
        fieldValue = testModel.get('dateField');
        t.isDateEqual(fieldValue, convertedDate, 'Date values match');

        testModel.set('dateField', '2012/04/28 12:44:23');
        fieldValue = testModel.get('dateField');
        t.isDateEqual(fieldValue, convertedDate, 'Date values match');

        testModel.set('dateField', '2012/04/28');
        fieldValue = testModel.get('dateField');
        t.isDateEqual(fieldValue, convertedDate, 'Date values match');

        // Change the target date
        //convertedDate = new Date(1999, 0, 21, 0, 0, 0, 0);

        t.throwsOk(function () { testModel.set('dateField', 'junk input'); }, /type/, 'Invalid type exception thrown');

        t.done();

    });

});