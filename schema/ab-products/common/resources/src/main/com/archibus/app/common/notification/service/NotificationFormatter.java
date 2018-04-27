package com.archibus.app.common.notification.service;

import java.util.*;

import com.archibus.app.common.notification.dao.INotificationMessageDao;
import com.archibus.app.common.notification.dao.datasource.NotificationMessageDataSource;
import com.archibus.app.common.notification.domain.*;
import com.archibus.app.common.notification.message.*;
import com.archibus.utility.*;

/**
 * 
 * Compliance Notification Formatter Implementation Class.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationFormatter implements INotificationFormatter {
    
    /**
     * notifications messages DAO.
     */
    private INotificationMessageDao messageDao;
    
    /**
     * notifications email message formatter.
     */
    private NotificationMessageFormatter messageFormatter;
    
    /**
     * Constructor.
     * 
     */
    public NotificationFormatter() {
        
        this.messageDao = new NotificationMessageDataSource();
        
    }
    
    /** {@inheritDoc} */
    public void format(final List<Notification> notifications,
            final NotificationTemplate notificationTemplate) {
        
        // Get activity id
        final String activityId = notificationTemplate.getActivityId();
        
        final String subjectReferenceBy = notificationTemplate.getSubjectReferencedBy();
        final String subjectId = notificationTemplate.getSubjectId();
        
        // Get subject object of notification template
        final NotificationMessage subject =
                this.messageDao.getByPrimaryKey(activityId, subjectReferenceBy, subjectId);
        
        final String messageReferenceBy = notificationTemplate.getMessageReferencedBy();
        final String messageId = notificationTemplate.getMessageId();
        
        // Get body object of notification template
        final NotificationMessage body =
                this.messageDao.getByPrimaryKey(activityId, messageReferenceBy, messageId);
        
        // Only format mail message for 'Email' or 'Email and Alert' type of notifications
        if ("Email".equalsIgnoreCase(notificationTemplate.getType())
                || "Email and Alert".equalsIgnoreCase(notificationTemplate.getType())) {
            
            for (final Notification notification : notifications) {
                
                // get recipients from template
                final String[] recipients =
                        notificationTemplate.getRecipients() == null ? new String[] {}
                                : notificationTemplate.getRecipients().split(";");
                
                if (StringUtil.notNullOrEmpty(notificationTemplate.getSubject())) {
                    
                    notification.setSubjectLine(notificationTemplate.getSubject());
                    
                } else if (subject != null) {
                    notification.setSubject(subject);
                }
                
                if (body != null) {
                    notification.setBody(body);
                }
                
                this.formatMessagesOfNotification(notification, recipients);
                
            }
            
        }
    }
    
    /**
     * Getter for the messageFormatter property.
     * 
     * @see messageFormatter
     * @return the messageFormatter property.
     */
    public NotificationMessageFormatter getMessageFormatter() {
        return this.messageFormatter;
    }
    
    /**
     * @param messageDao the message dao to set
     */
    public void setMessageDao(final INotificationMessageDao messageDao) {
        this.messageDao = messageDao;
    }
    
    /**
     * Setter for the messageFormatter property.
     * 
     * @see messageFormatter
     * @param messageFormatter the messageFormatter to set
     */
    
    public void setMessageFormatter(final NotificationMessageFormatter messageFormatter) {
        this.messageFormatter = messageFormatter;
    }
    
    /**
     * Format message and return formatted message.
     * 
     * @param notification Notification Object name
     * @param recipients Email address list
     * 
     */
    private void formatMessagesOfNotification(final Notification notification,
            final String[] recipients) {
        
        // Only format mail message for not empty recipient list
        if (recipients != null && recipients.length > 0) {
            
            final List<MailMessage> mailMessages = new ArrayList<MailMessage>();
            
            // prepare data model for message formatting
            final NotificationDataModel dataModel = new NotificationDataModel();
            dataModel.generateDataModel(notification);
            
            // Loop through each recipient
            for (final String recipient : recipients) {
                
                // format subject and body messages of notification according to email address
                this.messageFormatter.format(recipient, notification, dataModel);
                
                // set formatted subject and body to Mail Message
                final MailMessage mailMessage = new MailMessage();
                mailMessage.setSubject(this.messageFormatter.getFormattedSubject());
                mailMessage.setText(this.messageFormatter.getFormattedBody());
                // set to address of email message
                mailMessage.setTo(recipient);
                
                // add Mail Message to mails list of current Notification
                mailMessages.add(mailMessage);
            }
            
            notification.setMailMessages(mailMessages);
        }
    }
}
