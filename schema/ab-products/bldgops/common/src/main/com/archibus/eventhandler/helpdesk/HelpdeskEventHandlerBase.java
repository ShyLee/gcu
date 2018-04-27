package com.archibus.eventhandler.helpdesk;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Extension of <code>EventhandlerBase</code> with extra logging and common functions for Helpdesk
 * 
 */

public class HelpdeskEventHandlerBase extends EventHandlerBase {
    
    /**
     * Lookup the craftsperson if for the current user, based on the email address.
     * 
     * @return cf_id of the current user or null
     */
    protected static String getCfIdForCurrentUser() {
        final DataSource cfDS =
                DataSourceFactory
                    .createDataSourceForFields("cf", new String[] { "cf_id", "email" });
        cfDS.addRestriction(Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            return cfRecord.getString("cf.cf_id");
        }
        return null;
    }
    
    /**
     * Override the standard notNull method. trimming Strings for MS SQL Server. if NULL then empty
     * String is returned.
     * 
     * @param object
     * @return
     */
    protected static String notNull(final Object object) {
        if (object == null) {
            return "";
        }
        if (object instanceof String) {
            return ((String) object).trim();
        } else {
            return object.toString();
        }
    }
    
    /**
     * Sends email using workflow rule <code>AbCommonResources-notify</code>.
     * 
     * <p>
     * Beware that the SMTP parameter must be set in the afm-config.xml files
     * 
     * 2008-7-23 bv: logger error replaced print stact trace in console
     * 
     * @param context Workflow rule execution context
     * @param recipient e-mail address of recipient
     * @param subject subject in the e-mail message
     * @param body body content in the e-mail message
     * @param String activityId
     */
    
    public void sendEmail(final EventHandlerContext context, final String body,
            final String subject, final String recipient, final String activityId) {
        
        this.log.debug("EMAIL to: " + recipient + " subject: " + subject);
        // Guo changed 2009-07-23 to fix KB3023541
        // context.addResponseParameter("notifyEmailAddress", recipient);
        // context.addResponseParameter("notifySubject", subject);
        // context.addResponseParameter("notifyBody", body);
        // use in sync
        // runWorkflowRule(context, "AbCommonResources-notify", false);
        try {
            // CommonHandlers commonHandlers = new CommonHandlers();
            // commonHandlers.notify(context);
            
            final String from = getEmailFrom(context);
            final String host = getEmailHost(context);
            final String port = getEmailPort(context);
            final String userId = getEmailUserId(context);
            final String password = getEmailPassword(context);
            
            sendEmail(body, from, host, port, subject, recipient, null, null, userId, password,
                null, CONTENT_TYPE_TEXT_UFT8, activityId);
        } catch (final Exception e) {
            // This code assumes that the try block throws ONLY email-related exception
            // Log and ignore email-related exception.
            // 1. log
            // Do not translate error message
            // String errorReport = ExceptionBase.printStackTraceToString(e);
            // Since we do not consider here exception as an error, log it as warning, so that
            // system admin will know that something is wrong with email server and email
            // notifications are not being sent.
            // this.log.warn(errorReport);
            // 2. ignore exception
        }
    }
    
    /**
     * Log debug info
     * 
     * @param message message to log
     */
    protected void debugInfo(final String message) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(message);
        }
    }
    
    /**
     * Log debug info
     * 
     * @param message message to log
     * @param ex Stack trace of Throwable ex
     */
    protected void debugInfo(final String message, final Throwable ex) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(message, ex);
        }
    }
    
    /**
     * Retrieve the email address of a craftsperson
     * 
     * @param context Workflow rule execution context
     * @param cf_id Craftsperson Code
     * @return email address of given craftsperson
     */
    protected String getEmailAddressForCraftsperson(final EventHandlerContext context,
            final String cf_id) {
        return notNull(selectDbValue(context, "cf", "email", "cf_id = " + literal(context, cf_id)));
        
    }
    
    /**
     * Retrieve the email address of an employee
     * 
     * @param context Workflow rule execution context
     * @param vn_id Vendor code
     * @return email address of given vendor
     */
    protected String getEmailAddressForVendor(final EventHandlerContext context, final String vn_id) {
        return notNull(selectDbValue(context, "vn", "email", "vn_id = " + literal(context, vn_id)));
    }
    
    /**
     * Use this for parsing a String value when a record from the database is retrieved.
     * 
     * <p>
     * This method makes sure that there is no class cast exception and the string is trimmed.
     * </p>
     * <p>
     * This method returns a null value, when a null value is passed. This makes it different from
     * notNull function.
     * </p>
     * 
     * @param object
     * 
     * @return trimmed String or null
     * 
     * @see com.archibus.eventhandler.EventHandlerBase#notNull(Object)
     */
    protected String getStringValue(final Object object) {
        if (object == null) {
            return null;
        }
        if (object instanceof String) {
            return ((String) object).trim();
        } else {
            return object.toString();
        }
    }
    
    /**
     * Get the current language from context.
     * 
     * <p>
     * This is used when retrieving translated fields from the database
     * 
     * @param context Workflow rule execution context
     * 
     * @return user language as defined in his profile
     */
    protected String getUserLanguage(final EventHandlerContext context) {
        final String locale = getParentContextAttributeXPath(context, "/*/preferences/@locale");
        final String prefix = locale.substring(0, 2);
        String language =
                getParentContextAttributeXPath(context, "/*/languages/language[@localeName='"
                        + locale + "']/@dbExtension");
        if (prefix.equals("en")) {
            language = prefix;
        } else if (language.equals("")) {
            language =
                    getParentContextAttributeXPath(context, "/*/languages/language[@isoLanguage='"
                            + prefix + "']/@dbExtension");
        }
        return language;
    }
    
    /**
     * Handle workflow rule error
     * 
     * @param context Workflow rule execution context
     * @param logMessage message to log
     * @param exceptionMessage expection message
     * @param originalException original stack trace
     */
    protected void handleError(final EventHandlerContext context, final String logMessage,
            final String exceptionMessage, final Throwable originalException) {
        context.addResponseParameter("message", exceptionMessage);
        
        throw new ExceptionBase(null, exceptionMessage, originalException);
    }
    
    /**
     * Log error
     * 
     * @param message error message to log
     */
    protected void logError(final String message) {
        this.log.error(message);
    }
    
    /**
     * Log info
     * 
     * @param message message to log
     */
    protected void logInfo(final String message) {
        if (this.log.isInfoEnabled()) {
            this.log.info(message);
        }
    }
    
}
