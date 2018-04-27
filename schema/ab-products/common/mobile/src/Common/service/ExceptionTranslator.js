/**
 * Provides translation of exception thrown by DWR service into generic
 * exception with end-user-friendly error message.
 * <p>
 * TODO This method is called twice for each exception - I could not figure why.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.service.ExceptionTranslator', {
    alternateClassName: ['ExceptionTranslator'],
	singleton : true,

	/**
	 * Translates exception, thrown by DWR service. Converts RemoteException to
	 * generic exception, throws the converted exception.
	 * 
	 * @public
	 * @param {Object}
	 *            exception to be translated.
	 */
	translate : function(exception) {
        var exceptionMessage = this.extractMessage(exception);

        // throw the converted exception
        throw new Error(exceptionMessage);
	},

    /**
     * Extracts message from the exception object. Maps particular error codes to end-user-friendly error messages.
     * <p>
     * Checks all possible exception properties.
	 * @private
     * @param exception from which the error message needs to be extracted.
     */
	extractMessage: function (exception) {
        if(exception.code && exception.code === 101) {
            return 'Network connection is not available';
        }

        if(exception.localizedMessage && exception.localizedMessage.length > 0) {
            return exception.localizedMessage;
        }

        if(exception.message && exception.message.length > 0 && exception.message !== ' :: ') {
            return exception.message;
        }

        if(exception.details && exception.details.length > 0) {
            return exception.details;
        }

        if(exception.pattern && exception.pattern.length > 0) {
            return exception.pattern;
        }

        if(exception.genericMessage && exception.genericMessage.length > 0) {
            return exception.genericMessage;
        }

        if(exception.description && exception.description.length > 0) {
            return exception.description;
        }

        return 'Unknown Error';
    }
});