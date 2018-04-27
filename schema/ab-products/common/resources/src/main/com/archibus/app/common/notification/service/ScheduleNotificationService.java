package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationTemplateDao;
import com.archibus.app.common.notification.dao.datasource.NotificationTemplateDataSource;
import com.archibus.app.common.notification.domain.*;
import com.archibus.app.common.notification.message.NotificationMessageFormatter;

/**
 * 
 * Compliance Service Class for Scheduled Notification workflow rule.
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ScheduleNotificationService {
    
    /**
     * Compliance Notification Finder.
     */
    private final NotificationFinder finder = new NotificationFinder();
    
    /**
     * Compliance Notification Formatter.
     */
    private final NotificationFormatter formatter = new NotificationFormatter();
    
    /**
     * Compliance Notification Sender.
     */
    private final NotificationSender sender = new NotificationSender();
    
    /**
     * Schedule Workflow rule method to send notifications for Compliance Event dialy.
     */
    public void sendEmailNotifications() {
        
        final INotificationTemplateDao notificationTemplateDao =
                new NotificationTemplateDataSource();
        
        final List<NotificationTemplate> templates =
                notificationTemplateDao.getAllNotificationTemplates();
        
        final NotificationMessageFormatter messageFormatter = new NotificationMessageFormatter();
        
        // for each notification template retrieved from Notification Template DAO
        for (final NotificationTemplate notificationTemplate : templates) {
            
            // by NotificationFinder instance finder, call setTemplate() to set notification
            // template, then get a notifications list by call find()
            final List<Notification> notifications = this.finder.find(notificationTemplate);
            
            if (notifications == null || notifications.isEmpty()) {
                continue;
            }
            
            // Format notifications messages based on different activity type
            if ("AbRiskCompliance".equalsIgnoreCase(notificationTemplate.getActivityId())) {
                
                // for compliance notification set its own data model to Message Formatter
                this.formatter.setMessageFormatter(messageFormatter);
                
                // format notifications by template
                this.formatter.format(notifications, notificationTemplate);
            }
            
            // by NotificationSender instance sender, call send() to send email for
            // each notifications.
            this.sender.send(notifications, notificationTemplate);
        }
        
    }
}
