// Verify that a new file is created when load is called the first time.
StartTest(function (t) {

    LocalFileSystem = {
        TEMPORARY : window.TEMPORARY || 0,
        PERSISTENT : window.PERSISTENT || 1
    };

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    var me = this;

    t.requireOk('Common.util.ConfigFileManager', function () {

        var deleteFile = function (onSuccess, scope) {

            var errorHandler = function (errMsg) {
                alert('Error Deleting file ' + errMsg.code);
                if (typeof onSuccess === 'function' && errMsg.code === 1) {
                    onSuccess.call(scope || me);
                }
            };

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024, function (fs) {
                fs.root.getFile('MobileClient.conf', {create: false}, function (fileEntry) {

                    fileEntry.remove(function () {
                        console.log('File removed.');
                        if(typeof onSuccess === 'function') {
                            onSuccess.call(scope || me);
                        }
                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);
        };

        var fileExists = function (onSuccess, scope) {

            var errorHandler = function (errMsg) {
                alert('Error checking for file ' + errMsg.code);
            };

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024, function (fs) {
                fs.root.getFile('MobileClient.conf', {create: false}, function (fileEntry) {

                    if (fileEntry.isFile === true) {
                        console.log('File exists.');
                        if (typeof onSuccess === 'function') {
                            onSuccess.call(scope || this, fileEntry.isFile);
                        }
                    }
                }, errorHandler);
            }, errorHandler);
        };

        var async = t.beginAsync();
        deleteFile(function () {
            console.log('delete finished');
            Common.util.ConfigFileManager.load(function () {
               console.log('load complete');
                fileExists(function (fileExists) {
                    t.is(fileExists, true, 'File has been created');
                    Common.util.ConfigFileManager.sync(function () {
                        console.log('sync complete');
                        t.endAsync(async);
                        t.done();
                    });

                });
            });
        }, me);

    });

});