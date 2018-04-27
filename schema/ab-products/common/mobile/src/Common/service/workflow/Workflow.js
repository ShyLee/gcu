/**
 * Provides methods to execute Workflow rules on the Web Central server.
 * <p>
 * Workflow rules are invoked using the callMethod function.
 * <p>
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.service.workflow.Workflow', {
    requires: [ 'Common.service.workflow.JsonUtil' ],
    alternateClassName: ['Workflow'],
    singleton: true,

    // default WFR call timeout: 10 seconds
    DEFAULT_TIMEOUT: 10,

    /**
     *
     * Call specified WFR and returns the result object. The call is
     * synchronous, i.e. runRule() does not return until the WFR
     * execution is finished and the result is received back on the
     * client.
     *
     * @param {workflowRuleId}
     *            WFR ID, such as AbCommonResources-getUser.
     * @param {parameters}
     *            WFR input parameters object that can contain: - simple
     *            properties, such as strings or numbers; - other
     *            objects or arrays encoded in JSON notation;
     * @param {timeout}
     *            Optional: Timeout in seconds, or null to use default
     *            timeout.
     * @return WFR result object.
     */
    runRuleAndReturnResult: function (workflowRuleId, parameters, timeout) {
        try {
            if (Ext.isEmpty(timeout)) {
                timeout = this.DEFAULT_TIMEOUT;
            }

            var callbackDelegate = Ext.bind(
                    this.resultCallbackObject.afterRuleExecuted,
                    this.resultCallbackObject);

            var options = {
                'callback': callbackDelegate,
                'async': false,
                'timeout': timeout * 1000
            };
            parameters.version = '2.0';

            workflow.runWorkflowRule(workflowRuleId, parameters, null, options);

            var result = this.resultCallbackObject.result || {};
            if (Ext.isEmpty(result.message)) {
                result.message = 'Workflow Rule Executed';
            }
            return result;

        } catch (e) {
            e.description = 'Workflow rule failed: ' + workflowRuleId;
            throw e;
        }
    },

    /**
     * Call specified WFR with specified parameters.
     *
     * @param {workflowRuleId}
     *            ID in the activityId-ruleId format.
     * @param {parameters}
     *            regular parameters object as in runRule().
     * @throws WFR
     *             result as an exception is anything goes wrong.
     */
    call: function (workflowRuleId, parameters, timeout) {
        if (Ext.isEmpty(parameters)) {
            parameters = {};
        } else if (parameters.constructor === Array) {
            parameters = {
                records: Common.service.workflow.JsonUtil.toJSON(parameters)
            };
        }

        var result = this.runRuleAndReturnResult(workflowRuleId, parameters, timeout);

        // Throw an exception for any code except executed. This
        // includes session timeout.
        if (result.code !== 'executed') {
            throw new Error('Workflow rule failed. Message: [' + result.message + ']');
        }
        return result;
    },

    /**
     * Call specified WFR event handler method with specified
     * parameters.
     *
     * @param {workflowRuleId}
     *            ID in the activityId-ruleId-methodName format.
     * @throws WFR
     *             result as an exception is anything goes wrong.
     */
    // TODO: it is not clear that the WFR parameters are deduced using
    // the arguments parameter.
    callMethod: function (workflowRuleId) {

        var methodParameters = [], i, result;

        for (i = 1; i < arguments.length; i++) {
            methodParameters.push(arguments[i]);
        }

        result = this.call(workflowRuleId, {
            methodParameters: Common.service.workflow.JsonUtil.toJSON(methodParameters)
        });

        return result;
    },

    /**
     *
     * @param workflowRuleId
     * @param parameterArray
     * @param timeout
     * @returns {*}
     */
    callMethodWithTimeout: function (workflowRuleId, parameterArray, timeout) {
        var result = this.call(workflowRuleId, {
            methodParameters: Common.service.workflow.JsonUtil.toJSON(parameterArray)
        }, timeout);

        return result;
    },

    callMethodAsync: function (workflowRuleId, parameterArray, timeout, callback, scope) {
        // Call workflow rule directly
        var success,
            doCallback = function(success, errorMessage) {
                Ext.callback(callback, scope, [success, errorMessage]);
            },
            wfrResult = function(result) {
                success =  (result.code === 'executed');
                doCallback(success, null);
            },
            wfrError = function(error) {
                success = false;
                doCallback(success, error);
            };

        var options = {
            'callback' : wfrResult,
            'errorHandler': wfrError,
            'async' : true,
            'timeout' : timeout * 1000
        };

        var parameters = {
            methodParameters: Common.service.workflow.JsonUtil.toJSON(parameterArray),
            version: '2.0'
        }

        workflow.runWorkflowRule(workflowRuleId, parameters, null, options);
    },

    /**
     * Object to store the result of the workflow rule
     */
    resultCallbackObject: {
        result: null,

        afterRuleExecuted: function (result) {
            this.result = result;
        }
    }
});