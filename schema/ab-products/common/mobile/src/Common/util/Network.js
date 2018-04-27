/**
 * Checks if the Web Central server is available
 */
Ext.define('Common.util.Network', {
	alternateClassName : [ 'Network' ],
	singleton : true,

    networkUnavailableMessage: 'Network connection is not available',

	/**
	 * Checks if the Web Central server is reachable.
	 * 
	 * @param {String}
	 *            url - optional - The url to check for connectivity.
	 * @return {Boolean} True if the connection to the server succeeds.
	 */
	isServerReachable : function(url) {
		var xhr = new XMLHttpRequest(), status, urlToCheck;

		if (Ext.isEmpty(url)) {
			urlToCheck = window.location.href;
		} else {
			urlToCheck = url;
		}

		xhr.open("HEAD", urlToCheck + "?rand=" + Math.random(), false);
		try {
			xhr.send();
			status = xhr.status;
			// Make sure the server is reachable
			return (status >= 200 && status < 300 || status === 304);
			// catch network & other problems
		} catch (e) {
			return false;
		}
	},

    // TODO: Temp function. Testing async xhr check
    isServerReachableAsync: function(url, onCompleted, scope) {

        var xhr = new XMLHttpRequest(),
            xhrComplete = function(result) {
                Ext.callback(onCompleted, scope, [result]);
            };

        if (Ext.isEmpty(url)) {
            url = window.location.href;
        }
        url = url + ((url.indexOf('?') === -1) ? '?' : '&') + Date.now();

        try {
            xhr.open('HEAD', url, true);
            var requestTimer = setTimeout(function() {
                xhr.abort();
            }, 2000);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(requestTimer);
                    var status = xhr.status,
                        content = xhr.responseText;

                    if ((status >= 200 && status < 300) || status === 304 || (status === 0 && content.length > 0)) {
                        xhrComplete(true);
                    }
                    else {
                        xhrComplete(false);
                    }
                }
            };
            xhr.send(null);
        } catch (e) {
            xhrComplete(false);
        }
    },

	/**
	 * Queries the device for the status of the network connection
	 * 
	 * @return {Boolean} True if the device detects a network connection.
	 */
	isDeviceConnected : function() {
		var networkState;

		// Always return true if we running on the Desktop
		if (Ext.os.is.Desktop) {
			return true;
		}

		networkState = navigator.network.connection.type;
		return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
	},

	isDeviceAndServerConnected : function(url) {
		var isDeviceConnected = this.isDeviceConnected();

		// If the device connection is not available return false without checking the
		// server connection
		if (!isDeviceConnected) {
			return false;
		} else {
			return this.isServerReachable(url);
		}
	},

    isDeviceAndServerConnectedAsync: function(url, onCompleted, scope) {
        var me = this,
            isDeviceConnected = this.isDeviceConnected();
        // If the device connection is not available return false without checking the
        // server connection
        if (!isDeviceConnected) {
            Ext.callback(onCompleted, scope, [false]);
        } else {
            me.isServerReachableAsync(url, function(result) {
                Ext.callback(onCompleted, scope, [result]);
            }, me);
        }
    },

	/**
	 * Checks if the Web Central server is reachable and if the device has an active network connection. Displays a
	 * message if a connection cannot be established.
	 * 
	 * @return {Boolean}
	 */
	checkNetworkConnectionAndDisplayMessage : function() {
		if (Common.util.Network.isDeviceAndServerConnected()) {
			return true;
		} else {
			Ext.Msg.show({
				title : 'Network Unreachable',
				message : this.networkUnavailableMessage
			});
			return false;
		}
	}
});