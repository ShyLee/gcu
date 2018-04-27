package com.archibus.app.solution.common.security.providers.dao;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.providers.dao.SaltSource;
import org.springframework.security.providers.encoding.PasswordEncoder;
import org.springframework.security.userdetails.UserDetailsService;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.context.utility.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.security.*;
import com.archibus.security.providers.dao.PasswordManager;
import com.archibus.utility.*;

/**
 * Password management methods. Used in PasswordManagerHandler and SecurityServiceImpl.
 * 
 * @author Valery Tydykov
 * 
 */
public class PasswordManagerImpl implements PasswordManager, InitializingBean {
    
    private static final String ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION = "AbSystemAdministration";
    
    private static final String REFERENCED_BY_PASSWORD_MANAGER_IMPL = "PASSWORDMANAGERIMPL";
    
    private static final String SEND_FORGOTTEN_PASSWORD_BODY = "SEND_FORGOTTEN_PASSWORD_BODY";
    
    private static final String SEND_FORGOTTEN_PASSWORD_SUBJECT = "SEND_FORGOTTEN_PASSWORD_SUBJECT";
    
    private static final String SEND_NEW_PASSWORD_BODY = "SEND_NEW_PASSWORD_BODY";
    
    private static final String SEND_NEW_PASSWORD_SUBJECT = "SEND_NEW_PASSWORD_SUBJECT";
    
    private static final String SEND_REQUEST_NEW_PASSWORD_BODY = "SEND_REQUEST_NEW_PASSWORD_BODY";
    
    private static final String SEND_REQUEST_NEW_PASSWORD_SUBJECT = "SEND_REQUEST_NEW_PASSWORD_SUBJECT";
    
    private static final String SEND_TEMPORARY_PASSWORD_BODY = "SEND_TEMPORARY_PASSWORD_BODY";
    
    private static final String SEND_TEMPORARY_PASSWORD_SUBJECT = "SEND_TEMPORARY_PASSWORD_SUBJECT";
    
    private static final String TEXT_PLAIN_CHARSET_UTF_8 = "text/plain; charset=UTF-8";
    
    /**
     * Formats text message.
     * 
     * @param message Text message to be formatted.
     * @param args Array of objects to be injected into formatted message.
     * @return Formatted message.
     */
    public static String formatMessage(final String message, final Object[] args,
            final Locale locale) {
        // TODO move to helper class
        final MessageFormat formatter = new MessageFormat(message);
        formatter.setLocale(locale);
        
        return formatter.format(args);
    }
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    // optional
    private ConfigManager.Immutable configManager;
    
    // TODO EmailSender is prototype-scoped
    // optional
    private MailSender mailSender;
    
    // optional
    private MessagesDao messagesDao;
    
    private PasswordEncoder passwordEncoder;
    
    // optional
    private PasswordGenerator passwordGenerator;
    
    // optional
    private PasswordPolicy passwordPolicy;
    
    // optional
    private SaltSource saltSource;
    
    // optional
    private Session session;
    
    // optional
    private int temporaryPasswordExpirationPeriod = 5;
    
    private UserDetailsService userDetailsService;
    
    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "userDetailsService must be set");
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.archibus.app.solution.common.security.providers.dao.PasswordsChanger#encryptAllPasswords
     * ()
     */
    public void encryptPassword(final String userId) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.
        
        if (this.logger.isInfoEnabled()) {
            this.logger.info("encryptPassword for username=[" + userId + "]");
        }
        
        Assert.notNull(this.getPasswordEncoder(), "PasswordEncoder must be set");
        
        final UserDetailsImpl userDetails = (UserDetailsImpl) this.getUserDetailsService()
            .loadUserByUsername(userId);
        final UserAccount.ThreadSafe userAccount = (UserAccount.ThreadSafe) userDetails
            .getUserAccount();
        
        // get clear text password
        final String password = userAccount.getPassword();
        
        // encode password
        // get salt
        Object salt = null;
        if (this.saltSource != null) {
            salt = this.saltSource.getSalt(userDetails);
        }
        
        final String newPasswordEncoded = this.getPasswordEncoder().encodePassword(password, salt);
        
        // update password in user account
        userAccount.changePassword(newPasswordEncoded);
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }
    
    /**
     * @return the configManager
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }
    
    /**
     * @return the mailSender
     */
    public MailSender getMailSender() {
        return this.mailSender;
    }
    
    /**
     * @return the messagesDao
     */
    public MessagesDao getMessagesDao() {
        return this.messagesDao;
    }
    
    /**
     * @return the passwordEncoder
     */
    public PasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
    }
    
    /**
     * @return the passwordGenerator
     */
    public PasswordGenerator getPasswordGenerator() {
        return this.passwordGenerator;
    }
    
    /**
     * @return the passwordPolicy
     */
    public PasswordPolicy getPasswordPolicy() {
        return this.passwordPolicy;
    }
    
    /**
     * @return the saltSource
     */
    public SaltSource getSaltSource() {
        return this.saltSource;
    }
    
    /**
     * @return the session
     */
    public Session getSession() {
        return this.session;
    }
    
    /**
     * @return the temporaryPasswordExpirationPeriod
     */
    public int getTemporaryPasswordExpirationPeriod() {
        return this.temporaryPasswordExpirationPeriod;
    }
    
    /**
     * @return the userDetailsService
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }
    
    /**
     * Localizes text message.
     * 
     * @param message Text message.
     * @return Localized text message.
     */
    public String localizeString(final ConfigManager.Immutable configManager, final String message,
            final Locale locale) {
        // TODO move to helper class
        final boolean translatablePrefix = StringUtil.toBoolean(configManager
            .getAttribute(Utility.XPATH_TRANSLATABLE_PREFIX));
        
        final String localizedMessage = configManager.loadLocalizedString(
            this.getClass().getName(), "", message, locale, translatablePrefix);
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("localizedMessage=[" + localizedMessage + "]");
        }
        
        return localizedMessage;
    }
    
    /**
     * Localizes and formats text message.
     * 
     * @param message Text message to localize and format.
     * @param args Array of objects to be injected into formatted message.
     * @return Localized and formatted text message.
     */
    public String prepareMessage(final ConfigManager.Immutable configManager, final String message,
            final Object[] args, final Locale locale) {
        // TODO move to helper class
        final String localizedMessage = localizeString(configManager, message, locale);
        final String formattedMessage = formatMessage(localizedMessage, args, locale);
        return formattedMessage;
    }
    
    public void requestNewPassword(final String userId, final String projectId)
            throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("requestNewPassword for username=[" + userId + "]");
        }
        
        // notify the administrator (administratorEMail value in afm-config.xml) that the user abc
        // with email abc@yourcompany.com is requesting a new password
        
        // userId must be supplied
        if (StringUtil.notNull(userId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("User ID is empty");
        }
        
        // projectId must be supplied
        if (StringUtil.notNull(projectId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Project ID is empty");
        }
        
        // User is not logged in
        // Set core user session from the specified project as current context
        final Context context = ContextStore.get();
        {
            final ConfigManager.Immutable configManager = context.getConfigManager();
            final Project.Immutable project = SecurityControllerTemplate.findProject(configManager,
                projectId);
            
            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("ProjectId does not match any projects");
            }
            
            // use core user session as context
            final UserSession.Immutable userSession = project.loadCoreUserSession();
            // TODO verify: 1. core user session is used inside of transaction; 2. not used outside
            // of
            // transaction.
            // TODO Re-setting userSession in context is not the right thing to do. Instead, we
            // should use something like RunAs functionality, or the original user session should
            // have enough privileges.
            // Do NOT call setUserSession in other places!
            // TODO clean-up user session in the Context in finally block
            context.setUserSession(userSession);
            
            final TransactionTemplate transactionTemplate = new TransactionTemplate(this.logger);
            transactionTemplate.setRole(DatabaseRole.SCHEMA);
            transactionTemplate.setReadOnly(false);
            
            transactionTemplate.doWithContext(new CallbackWithWrappedException() {
                public Object doWithContext(final Context context) throws ExceptionBase {
                    // session must be supplied
                    if (StringUtil.notNull(PasswordManagerImpl.this.session).equals("")) {
                        // @non-translatable
                        throw new ExceptionBase("session is not specified");
                    }
                    
                    Assert.notNull(PasswordManagerImpl.this.messagesDao, "messagesDao must be set");
                    
                    // set sessionID in context
                    context.getSession().setId(PasswordManagerImpl.this.session.getId());
                    
                    final String body = PasswordManagerImpl.this.messagesDao.localizeMessage(
                        ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
                        SEND_REQUEST_NEW_PASSWORD_BODY);
                    
                    final String subject = PasswordManagerImpl.this.messagesDao.localizeMessage(
                        ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
                        SEND_REQUEST_NEW_PASSWORD_SUBJECT);
                    
                    prepareAndSendNewPasswordRequest(userId, body, subject);
                    
                    return null;
                }
            });
        }
    }
    
    public void resetPassword(final String userId, final String keyPhrase) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.
        
        // generates unique password value for the user.
        
        if (this.logger.isInfoEnabled()) {
            this.logger.info("resetPassword for username=[" + userId + "]");
        }
        
        Assert.notNull(this.passwordEncoder, "PasswordEncoder must be set");
        Assert.notNull(this.passwordPolicy, "passwordPolicy must be set");
        Assert.notNull(this.passwordGenerator, "passwordGenerator must be set");
        
        // load UserAccount
        final UserAccount.ThreadSafe userAccount = loadUserAccount(userId);
        
        final String newPassword = this.getPasswordGenerator().generatePassword(userId, keyPhrase);
        // update password in user account
        userAccount.changePassword(newPassword);
        
        {
            // set date password changed field to: current date + temporaryPasswordExpirationPeriod
            // -passwordExpirationPeriod , to make the temporary password expire in
            // temporaryPasswordExpirationPeriod days.
            java.util.Date datePasswordChanged = DateTime.addDays(new java.util.Date(),
                this.temporaryPasswordExpirationPeriod);
            datePasswordChanged = DateTime.addDays(datePasswordChanged, -this.getPasswordPolicy()
                .getPasswordExpirationPeriod());
            
            userAccount.setDatePasswordChanged(datePasswordChanged);
        }
        
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }
    
    public void sendForgottenPassword(final String userId, final String projectId)
            throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("sendForgottenPassword for username=[" + userId + "]");
        }
        
        // userId must be supplied
        if (StringUtil.notNull(userId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("User ID is empty");
        }
        
        // projectId must be supplied
        if (StringUtil.notNull(projectId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Project ID is empty");
        }
        
        // User is not logged in
        // Set core user session from the specified project as current context
        final Context context = ContextStore.get();
        {
            final ConfigManager.Immutable configManager = context.getConfigManager();
            final Project.Immutable project = SecurityControllerTemplate.findProject(configManager,
                projectId);
            
            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("ProjectId does not match any projects");
            }
            
            // use core user session as context
            final UserSession.Immutable userSession = project.loadCoreUserSession();
            // TODO verify: 1. core user session is used inside of transaction; 2. not used outside
            // of
            // transaction.
            // TODO Re-setting userSession in context is not the right thing to do. Instead, we
            // should use something like RunAs functionality, or the original user session should
            // have enough privileges.
            // Do NOT call setUserSession in other places!
            // TODO clean-up user session in the Context in finally block
            context.setUserSession(userSession);
            
            final TransactionTemplate transactionTemplate = new TransactionTemplate(this.logger);
            transactionTemplate.setRole(DatabaseRole.SCHEMA);
            transactionTemplate.setReadOnly(false);
            
            transactionTemplate.doWithContext(new CallbackWithWrappedException() {
                public Object doWithContext(final Context context) throws ExceptionBase {
                    // session must be supplied
                    if (StringUtil.notNull(PasswordManagerImpl.this.session).equals("")) {
                        // @non-translatable
                        throw new ExceptionBase("session is not specified");
                    }
                    
                    Assert.notNull(PasswordManagerImpl.this.messagesDao, "messagesDao must be set");
                    
                    // set sessionID in context
                    context.getSession().setId(PasswordManagerImpl.this.session.getId());
                    
                    final String body = PasswordManagerImpl.this.messagesDao.localizeMessage(
                        ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
                        SEND_FORGOTTEN_PASSWORD_BODY);
                    
                    final String subject = PasswordManagerImpl.this.messagesDao.localizeMessage(
                        ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
                        SEND_FORGOTTEN_PASSWORD_SUBJECT);
                    
                    prepareAndSendPassword(userId, body, subject, null);
                    
                    return null;
                }
            });
        }
    }
    
    public void sendNewPassword(final String userId, final String password) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.
        
        // takes user’s clear-text password and emails it to him
        if (this.logger.isInfoEnabled()) {
            this.logger.info("sendNewPassword for username=[" + userId + "]");
        }
        
        Assert.notNull(this.messagesDao, "messagesDao must be set");
        
        final String body = this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_NEW_PASSWORD_BODY);
        
        final String subject = this.messagesDao.localizeMessage(
            ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
            SEND_NEW_PASSWORD_SUBJECT);
        
        prepareAndSendPassword(userId, body, subject, password);
    }
    
    public void sendTemporaryPassword(final String userId) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.
        
        // takes user’s clear-text password and emails it to him, asking to change it as
        // soon as possible
        
        if (this.logger.isInfoEnabled()) {
            this.logger.info("sendTemporaryPassword for username=[" + userId + "]");
        }
        
        Assert.notNull(this.messagesDao, "messagesDao must be set");
        
        final String body = this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_TEMPORARY_PASSWORD_BODY);
        
        final String subject = this.messagesDao.localizeMessage(
            ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION, REFERENCED_BY_PASSWORD_MANAGER_IMPL,
            SEND_TEMPORARY_PASSWORD_SUBJECT);
        
        prepareAndSendPassword(userId, body, subject, null);
    }
    
    /**
     * @param configManager the configManager to set
     */
    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }
    
    /**
     * @param mailSender the mailSender to set
     */
    public void setMailSender(final MailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * @param messagesDao the messagesDao to set
     */
    public void setMessagesDao(final MessagesDao messagesDao) {
        this.messagesDao = messagesDao;
    }
    
    /**
     * @param passwordEncoder the passwordEncoder to set
     */
    public void setPasswordEncoder(final PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * @param passwordGenerator the passwordGenerator to set
     */
    public void setPasswordGenerator(final PasswordGenerator passwordGenerator) {
        this.passwordGenerator = passwordGenerator;
    }
    
    /**
     * @param passwordPolicy the passwordPolicy to set
     */
    public void setPasswordPolicy(final PasswordPolicy passwordPolicy) {
        this.passwordPolicy = passwordPolicy;
    }
    
    /**
     * @param saltSource the saltSource to set
     */
    public void setSaltSource(final SaltSource saltSource) {
        this.saltSource = saltSource;
    }
    
    /**
     * @param session the session to set
     */
    public void setSession(final Session session) {
        this.session = session;
    }
    
    /**
     * @param temporaryPasswordExpirationPeriod the temporaryPasswordExpirationPeriod to set
     */
    public void setTemporaryPasswordExpirationPeriod(final int temporaryPasswordExpirationPeriod) {
        this.temporaryPasswordExpirationPeriod = temporaryPasswordExpirationPeriod;
    }
    
    /**
     * @param userDetailsService the userDetailsService to set
     */
    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }
    
    /**
     * Sends an email message.
     * 
     * @param text Message text to send.
     * @param from "from" email address.
     * @param host Mail server host address.
     * @param subject Message subject.
     * @param to "to" email address.
     * @param userId User ID of the SMTP mail server.
     * @param password Password of the SMTP mail server.
     * @param cc List of "cc" email addresses.
     * @param bcc List of "bcc" email addresses.
     * @param attachmentFileNames List of attachment file names.
     */
    protected void sendEmail(final String text, final String from, final String host,
            final String port, final String subject, final String to, final List<String> cc,
            final List<String> bcc, final String userId, final String password,
            final List<String> attachmentFileNames) {
        // TODO move to helper class
        // @non-translatable
        final String operation = "Sending email from=[{0}], to=[{1}], cc=[{2}], bcc=[{3}], subject=[{4}], host=[{5}]";
        
        if (StringUtil.notNull(host).length() == 0 || StringUtil.notNull(from).length() == 0
                || StringUtil.notNull(to).length() == 0) {
            // one or more arguments are not specified
            // @non-translatable
            final String errorMessage = "Required argument is not specified: {0}";
            
            final ExceptionBase exception = new ExceptionBase();
            exception.setOperation(operation);
            exception.setPattern(errorMessage);
            final Object[] args = { from, to, cc, bcc, subject, host };
            exception.setArgs(args);
            
            throw exception;
        }
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(operation);
        }
        
        try {
            final MailMessage message = new MailMessage();
            message.setActivityId("AbSystemAdministration");
            message.setFrom(from);
            message.setTo(to);
            message.setHost(host);
            message.setPort(port);
            message.setSubject(subject);
            message.setText(text);
            message.setContentType(TEXT_PLAIN_CHARSET_UTF_8);
            message.setCc(cc);
            message.setBcc(bcc);
            message.setUser(userId);
            message.setPassword(password);
            
            // if attachments specified, add them
            if (attachmentFileNames != null) {
                for (Object element : attachmentFileNames) {
                    final String fileName = (String) element;
                    message.addFileAttachment(fileName);
                }
            }
            
            this.mailSender.send(message);
            
        } catch (final Throwable t) {
            final ExceptionBase exception = new ExceptionBase(operation, t);
            final Object[] args = { from, to, cc, bcc, subject, host };
            exception.setArgs(args);
            
            throw exception;
        }
    }
    
    private UserAccount.ThreadSafe loadUserAccount(final String userId) {
        // load UserAccount
        final UserDetailsImpl userDetails = (UserDetailsImpl) this.getUserDetailsService()
            .loadUserByUsername(userId);
        final UserAccount.ThreadSafe userAccount = (UserAccount.ThreadSafe) userDetails
            .getUserAccount();
        return userAccount;
    }
    
    private void prepareAndSendNewPasswordRequest(final String userId, final String message,
            final String subject) {
        // get locale, password and email from the account
        Locale locale;
        String email;
        {
            // load UserAccount for the userId
            
            UserAccount.Immutable userAccount;
            try {
                userAccount = loadUserAccount(userId);
            } catch (final ExceptionBase e) {
                // TODO verify exception
                // TODO copy message text from the AXVW file
                // @translatable
                throw new ExceptionBase("The supplied user ID does not match our records.");
            }
            
            // get email from the account
            
            email = userAccount.getAttribute("/*/preferences/@email");
            locale = userAccount.getLocale();
        }
        
        sendNewPasswordRequest(message, subject, locale, userId, email);
    }
    
    private void prepareAndSendPassword(final String userId, final String message,
            final String subject, String password) {
        // get locale, password and email from the account
        Locale locale;
        String email;
        {
            // load UserAccount for the userId
            
            UserAccount.Immutable userAccount;
            try {
                userAccount = loadUserAccount(userId);
            } catch (final ExceptionBase e) {
                // TODO verify exception
                // TODO copy message text from the AXVW file
                // @translatable
                throw new ExceptionBase("The supplied user ID does not match our records.");
            }
            
            // get password and email from the account
            // if password parameter was not supplied, get it from the user account
            if (StringUtil.notNull(password).length() == 0) {
                password = userAccount.getPassword();
            }
            
            email = userAccount.getAttribute("/*/preferences/@email");
            locale = userAccount.getLocale();
        }
        
        sendPassword(message, subject, password, locale, email);
    }
    
    private void prepareEmailHostParameters(final String body, final String subjectLocalized,
            final String to, final String from) {
        final String host = this.configManager.getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST);
        // mailSMTPHost must be supplied
        if (StringUtil.notNull(host).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Mail SMTP Host is empty");
        }
        
        final String port = this.configManager
            .getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_PORT);
        
        final String userId = this.configManager
            .getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_USER_ID);
        
        final String password = this.configManager
            .getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_PASSWORD);
        
        try {
            sendEmail(body, from, host, port, subjectLocalized, to, new ArrayList<String>(),
                new ArrayList<String>(), userId, password, null);
            // TODO after success, show success text on the form
        } catch (final Exception e) {
            // TODO: do not show any details (message body, password, from,
            // to, host) to end user
            // @non-translatable
            throw new ExceptionBase(null, "XXX", e);
        }
    }
    
    private void sendNewPasswordRequest(final String message, final String subject,
            final Locale locale, final String username, final String userEmail) {
        // prepare mail body: localize and insert userId and email
        final String body = prepareMessage(this.configManager, message, new Object[] { username,
                userEmail }, locale);
        
        final String subjectLocalized = prepareMessage(this.configManager, subject, null, locale);
        
        // To: administrator's email address
        final String administratorEMail = this.configManager
            .getAttribute("/*/preferences/mail/addresses/address[@name='administratorEMail']/@value");
        // administratorEMail must be supplied
        if (StringUtil.notNull(administratorEMail).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Administrator e-mail is empty");
        }
        
        final String to = administratorEMail;
        final String from = administratorEMail;
        
        prepareEmailHostParameters(body, subjectLocalized, to, from);
    }
    
    private void sendPassword(final String message, final String subject, final String password,
            final Locale locale, final String email) {
        // prepare mail body: localize and insert password
        final String body = prepareMessage(this.configManager, message, new Object[] { password },
            locale);
        
        final String subjectLocalized = prepareMessage(this.configManager, subject, null, locale);
        
        // From: administrator's email address
        final String administratorEMail = this.configManager
            .getAttribute("/*/preferences/mail/addresses/address[@name='administratorEMail']/@value");
        // administratorEMail must be supplied
        if (StringUtil.notNull(administratorEMail).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Administrator e-mail is empty");
        }
        
        String to = email;
        // if no email was specified in user account, send to
        // administratorEMail
        if (StringUtil.notNull(email).equals("")) {
            to = administratorEMail;
        }
        
        final String from = administratorEMail;
        
        prepareEmailHostParameters(body, subjectLocalized, to, from);
    }
    
}
