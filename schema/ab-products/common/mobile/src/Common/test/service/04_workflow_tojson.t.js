// Tests the Common.service.workflow.JsonUtil.toJSON method

StartTest(function(t) {
    t.requireOk('Common.service.workflow.JsonUtil', function() {
        var jsonString = Common.service.workflow.JsonUtil.toJSON('test string');
        var jsonNumber = Common.service.workflow.JsonUtil.toJSON(102);
        var testBool = true;
        var jsonBoolean = Common.service.workflow.JsonUtil.toJSON(testBool);
        var jsonArray = Common.service.workflow.JsonUtil.toJSON([1,2,3]);
        var testObject = {item1: 'one', item2:'two'};
        var jsonObject = Common.service.workflow.JsonUtil.toJSON(testObject);


        t.is(jsonString, '"test string"', 'JSON String type converted successfully');
        t.is(jsonNumber, '102', 'JSON Number type converted successfully');
        t.is(jsonBoolean, 'true', 'JSON Boolean type converted successfully');
        t.is(jsonArray, '[1, 2, 3]', 'JSON Array type converted successfully');
        t.is(jsonObject, '{"item1": "one", "item2": "two"}', 'JSON Object type converted successfully');
        // Date conversions should throw an exception
        t.throwsOk(function () { Common.service.workflow.JsonUtil.toJSON(new Date()); }, /not permitted to be marshalled/, 'Date marshalling exception thrown');
    });
});